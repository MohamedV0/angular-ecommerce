import { computed, inject } from '@angular/core';
import { 
  patchState, 
  signalStore, 
  withComputed, 
  withHooks,
  withMethods, 
  withState 
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, of } from 'rxjs';

import { CartService } from '../services/cart.service';
import { AuthService } from '../../auth/services/auth';
import { 
  CartState, 
  CartItem, 
  CartSummary
} from '../models/cart.model';
import { Product } from '../../products/models/product.model';

/**
 * Utility functions for cart calculations
 * Following NgRx best practices - keep utilities outside the store
 */

function updateItemTotalPrice(item: CartItem): CartItem {
  return {
    ...item,
    totalPrice: item.quantity * item.unitPrice,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Initial Cart State
 * ✅ totalItems and totalPrice removed - now computed from items[]
 */
const initialCartState: CartState = {
  items: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastUpdated: Date.now(),
  isAuthenticated: false
};

/**
 * CartStore - NgRx SignalStore Implementation
 * 
 * ✅ Pattern Reference: https://ngrx.io/guide/signals/signal-store
 * ✅ Uses withState, withComputed, withMethods as per official docs
 * ✅ rxMethod for reactive operations with observables
 * ✅ Async methods for promise-based API calls
 * ✅ Protected state by default (no external patchState allowed)
 * 
 * Authentication Flow:
 * - Guest users: Cart stored in localStorage (handled by CartStore)
 * - Authenticated users: Cart stored on server (handled by CartService API)
 * - Login: Syncs local cart to server
 * - Logout: Clears cart and loads guest cart from localStorage
 */
export const CartStore = signalStore(
  { providedIn: 'root', protectedState: true },
  
  // 1️⃣ State Management - Simple and clean
  withState(initialCartState),
  
  // 2️⃣ Computed Properties - Following documentation patterns  
  withComputed((state) => ({
    // ✅ COMPUTED: Total items and price calculated from items array
    totalItems: computed(() => state.items().reduce((sum, item) => sum + item.quantity, 0)),
    totalPrice: computed(() => state.items().reduce((sum, item) => sum + item.totalPrice, 0)),
    
    // Cart summary for components
    summary: computed((): CartSummary => {
      const items = state.items();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        totalItems,
        totalPrice,
        isEmpty: totalItems === 0,
        itemsCount: totalItems === 1 ? '1 item' : `${totalItems} items`
      };
    }),
    
    // Check if specific product is in cart
    isProductInCart: computed(() => (productId: string): boolean => {
      return state.items().some(item => item.product._id === productId);
    }),
    
    // Get quantity of specific product in cart
    getProductQuantity: computed(() => (productId: string): number => {
      const item = state.items().find(item => item.product._id === productId);
      return item?.quantity || 0;
    }),
    
    // Cart badge display (for header)
    badgeCount: computed(() => {
      const count = state.items().reduce((sum, item) => sum + item.quantity, 0);
      return count > 99 ? '99+' : count.toString();
    }),
    
    // Check if cart has any errors
    hasError: computed(() => state.error() !== null),
    
    // Check if any operations are in progress
    isOperating: computed(() => state.isLoading() || state.isSyncing()),
    
    // Formatted total price
    formattedTotalPrice: computed(() => {
      const price = state.items().reduce((sum, item) => sum + item.totalPrice, 0);
      return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    })
  })),
  
  // 3️⃣ Lifecycle Hooks - Official NgRx SignalStore Pattern
  withHooks((store) => {
    const cartService = inject(CartService);
    const authService = inject(AuthService);
    
    return {
      onInit() {
        // 👇 Official NgRx initialization pattern - runs when store is created
        const isAuthenticated = authService.isAuthenticated();
        patchState(store, { isAuthenticated });
        
        if (isAuthenticated) {
          // Load from API for authenticated users - reactive pattern
          patchState(store, { isLoading: true, error: null });
          cartService.getCart().subscribe({
            next: (items) => {
              patchState(store, {
                items,
                lastUpdated: Date.now(),
                isLoading: false,
                error: null
              });
            },
            error: (error) => {
              patchState(store, {
                error: error.message || 'Failed to load cart',
                isLoading: false
              });
            }
          });
        } else {
          // Load from localStorage for guest users
          const items = cartService.loadCartFromStorage();
          patchState(store, {
            items,
            lastUpdated: Date.now(),
            error: null
          });
        }
      }
    };
  }),
  
  // 4️⃣ Methods - Following exact documentation patterns
  withMethods((store, cartService = inject(CartService), authService = inject(AuthService)) => ({
    
    
    /**
     * Load cart from API - Reactive method following documentation pattern
     */
    loadCartFromApi: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => cartService.getCart().pipe(
          tapResponse({
            next: (items) => {
              patchState(store, {
                items,
                lastUpdated: Date.now(),
                isLoading: false,
                error: null
              });
            },
            error: (error: Error) => {
              patchState(store, {
                error: error.message || 'Failed to load cart',
                isLoading: false
              });
            }
          })
        ))
      )
    ),
    
    /**
     * Add product to cart - Reactive method using rxMethod
     * Following NgRx best practices with tapResponse
     */
    addToCart: rxMethod<{ product: Product; quantity?: number }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ product, quantity = 1 }) => {
          const isAuthenticated = store.isAuthenticated();
          
          if (isAuthenticated) {
            // Authenticated user: use API with proper Observable pattern
            return cartService.addToCart({ productId: product._id, quantity }).pipe(
              tapResponse({
                next: (result) => {
                  if (result?.success && result.cart) {
                    patchState(store, { ...result.cart });
                  } else {
                    patchState(store, {
                      error: result?.message || 'Failed to add product to cart'
                    });
                  }
                },
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to add product to cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          } else {
            // Guest user: handle locally with reactive pattern
            return of({ product, quantity }).pipe(
              tap(({ product, quantity }) => {
                const currentItems = store.items();
                const existingItemIndex = currentItems.findIndex(item => 
                  item.product._id === product._id
                );
                
                let updatedItems: CartItem[];
                
                if (existingItemIndex >= 0) {
                  // Update existing item
                  updatedItems = currentItems.map((item, index) => 
                    index === existingItemIndex 
                      ? updateItemTotalPrice({ ...item, quantity: item.quantity + quantity })
                      : item
                  );
                } else {
                  // Add new item
                const newItem = cartService.createCartItemFromProduct(product, quantity);
                updatedItems = [...currentItems, newItem];
              }
              
              patchState(store, {
                items: updatedItems,
                lastUpdated: Date.now(),
                error: null
              });
                
                // Save to localStorage
                cartService.saveCartToStorage(updatedItems);
              }),
              tapResponse({
                next: () => {}, // Success handled in tap above
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to add product to cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          }
        })
      )
    ),
    
    /**
     * Update cart item quantity - Reactive method using rxMethod
     */
    updateCartItem: rxMethod<{ cartItemId: string; quantity: number }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ cartItemId, quantity }) => {
          const isAuthenticated = store.isAuthenticated();
          
          if (isAuthenticated) {
            // Authenticated user: use API with proper Observable pattern
            return cartService.updateCartItem({ cartItemId, quantity }).pipe(
              tapResponse({
                next: (result) => {
                  if (result?.success && result.cart) {
                    patchState(store, { ...result.cart });
                  } else {
                    patchState(store, {
                      error: result?.message || 'Failed to update cart item'
                    });
                  }
                },
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to update cart item'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          } else {
            // Guest user: handle locally with reactive pattern
            return of({ cartItemId, quantity }).pipe(
              tap(({ cartItemId, quantity }) => {
                const currentItems = store.items();
                let updatedItems: CartItem[];
                
                if (quantity <= 0) {
                  // Remove item if quantity is 0 or less
                  updatedItems = currentItems.filter(item => item._id !== cartItemId);
                } else {
                  // Update quantity
                  updatedItems = currentItems.map(item => 
                    item._id === cartItemId
                      ? updateItemTotalPrice({ ...item, quantity })
                      : item
                  );
                }
                
                patchState(store, {
                  items: updatedItems,
                  lastUpdated: Date.now(),
                  error: null
                });
                
                cartService.saveCartToStorage(updatedItems);
              }),
              tapResponse({
                next: () => {}, // Success handled in tap above
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to update cart item'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          }
        })
      )
    ),
    
    /**
     * Remove item from cart - Reactive method using rxMethod
     */
    removeFromCart: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((cartItemId) => {
          const isAuthenticated = store.isAuthenticated();
          
          if (isAuthenticated) {
            // Authenticated user: use API with proper Observable pattern
            return cartService.removeFromCart({ cartItemId }).pipe(
              tapResponse({
                next: (result) => {
                  if (result?.success && result.cart) {
                    patchState(store, { ...result.cart });
                  } else {
                    patchState(store, {
                      error: result?.message || 'Failed to remove item from cart'
                    });
                  }
                },
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to remove item from cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          } else {
            // Guest user: handle locally with reactive pattern
            return of(cartItemId).pipe(
              tap((cartItemId) => {
                const currentItems = store.items();
                const updatedItems = currentItems.filter(item => item._id !== cartItemId);
                
                patchState(store, {
                  items: updatedItems,
                  lastUpdated: Date.now(),
                  error: null
                });
                
                cartService.saveCartToStorage(updatedItems);
              }),
              tapResponse({
                next: () => {}, // Success handled in tap above
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to remove item from cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          }
        })
      )
    ),
    
    /**
     * Clear entire cart - Reactive method using rxMethod
     */
    clearCart: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          const isAuthenticated = store.isAuthenticated();
          
          if (isAuthenticated) {
            // Authenticated user: use API with proper Observable pattern
            return cartService.clearCart().pipe(
              tapResponse({
                next: (result) => {
                  if (result?.success && result.cart) {
                    patchState(store, { ...result.cart });
                  } else {
                    patchState(store, {
                      error: result?.message || 'Failed to clear cart'
                    });
                  }
                },
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to clear cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          } else {
            // Guest user: handle locally with reactive pattern
            return of(null).pipe(
              tap(() => {
                patchState(store, {
                  items: [],
                  lastUpdated: Date.now(),
                  error: null
                });
                
                cartService.clearCartFromStorage();
              }),
              tapResponse({
                next: () => {}, // Success handled in tap above
                error: (error) => patchState(store, {
                  error: error instanceof Error ? error.message : 'Failed to clear cart'
                }),
                finalize: () => patchState(store, { isLoading: false })
              })
            );
          }
        })
      )
    ),
    
    /**
     * Handle authentication state changes - Simple method
     */
    onAuthenticationChange(isAuthenticated: boolean): void {
      const wasAuthenticated = store.isAuthenticated();
      
      patchState(store, { isAuthenticated });
      
      if (!wasAuthenticated && isAuthenticated) {
        // User just logged in - sync local cart with server
        this.syncCartWithServer();
      } else if (wasAuthenticated && !isAuthenticated) {
        // User just logged out - clear cart and load from localStorage
        patchState(store, {
          items: [],
          error: null,
          lastUpdated: Date.now()
        });
        
        // Load guest cart from localStorage
        const items = cartService.loadCartFromStorage();
        
        patchState(store, {
          items,
          lastUpdated: Date.now()
        });
      }
    },
    
    /**
     * Sync cart with server - Reactive method
     */
    syncCartWithServer: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isSyncing: true, error: null })),
        switchMap(() => {
          const localItems = store.items();
          return cartService.syncCartWithServer(localItems).pipe(
            switchMap((result) => {
              if (result?.success) {
                // ✅ COMPLETED: Sync successful - clear local storage
                cartService.clearCartFromStorage();
                
                // ✅ FIXED: Chain with cart reload to get final server state
                return cartService.getCart().pipe(
                  tapResponse({
                    next: (items) => {
                      patchState(store, {
                        items,
                        lastUpdated: Date.now(),
                        isSyncing: false,
                        error: null
                      });
                    },
                    error: (error) => patchState(store, {
                      error: 'Sync succeeded but failed to reload cart',
                      isSyncing: false
                    })
                  })
                );
              } else {
                patchState(store, {
                  error: result?.message || 'Failed to sync cart',
                  isSyncing: false
                });
                return of(null);
              }
            }),
            tapResponse({
              next: () => {}, // Success handled in switchMap above
              error: (error: Error) => {
                patchState(store, {
                  error: error.message || 'Failed to sync cart',
                  isSyncing: false
                });
              }
            })
          );
        })
      )
    ),
    
    /**
     * Clear any error messages - Simple method
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);