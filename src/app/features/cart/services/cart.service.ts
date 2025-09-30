import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from '../../../core/services/api';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../auth/services/auth';
import { extractErrorMessage } from '../../../shared/utils/error.utils';
import { 
  CartItem, 
  CartApiResponse, 
  CartApiItem, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  RemoveFromCartRequest,
  CartPersistenceData,
  CartOperationResult
} from '../models/cart.model';
import { Product } from '../../products/models/product.model';

/**
 * Cart Service - API operations and persistence
 * Handles cart operations with the backend API and localStorage
 * Based on real API testing with Route E-commerce backend
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly authService = inject(AuthService);

  // Cart API endpoints
  private readonly CART_ENDPOINTS = {
    GET_CART: '/cart',
    ADD_TO_CART: '/cart',
    UPDATE_CART_ITEM: '/cart',
    REMOVE_CART_ITEM: '/cart',
    CLEAR_CART: '/cart'
  };

  // LocalStorage key for cart persistence
  private readonly CART_STORAGE_KEY = 'freshcart_cart';
  private readonly MAX_RETRY_ATTEMPTS = 3;
  
  // Cart expiration configuration
  private readonly CART_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get user's cart from API
   * API: GET /cart
   * ✅ UPDATED: Returns both cart items and cartId
   */
  getCart(): Observable<{ items: CartItem[]; cartId: string | null }> {
    if (!this.authService.isAuthenticated()) {
      return of({ items: [], cartId: null });
    }

    return this.api.get<CartApiResponse>(this.CART_ENDPOINTS.GET_CART)
      .pipe(
        map(response => ({
          items: this.transformApiCartToItems(response),
          cartId: response.data?._id || null
        })),
        catchError(error => {
          console.error('Get cart error:', error);
          return of({ items: [], cartId: null });
        })
      );
  }

  /**
   * Add product to cart
   * API: POST /cart
   */
  addToCart(request: AddToCartRequest): Observable<CartOperationResult> {
    // Guest users are handled by CartStore directly
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Authentication required' });
    }

    return this.api.post<CartApiResponse>(this.CART_ENDPOINTS.ADD_TO_CART, {
      productId: request.productId
    }).pipe(
      map(response => ({
        success: true,
        message: 'Product added to cart successfully',
        cartId: response.data?._id || null,
        cart: {
          items: this.transformApiCartToItems(response),
          cartId: response.data?._id || null,
          isLoading: false,
          isSyncing: false,
          error: null,
          lastUpdated: Date.now(),
          isAuthenticated: true
        }
      })),
      catchError(error => {
        console.error('Add to cart error:', error);
        return of({
          success: false,
          message: extractErrorMessage(error)
        });
      })
    );
  }

  /**
   * Update cart item quantity
   * API: PUT /cart/{cartItemId}
   */
  updateCartItem(request: UpdateCartItemRequest): Observable<CartOperationResult> {
    // Guest users are handled by CartStore directly
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Authentication required' });
    }

    return this.api.put<CartApiResponse>(`${this.CART_ENDPOINTS.UPDATE_CART_ITEM}/${request.cartItemId}`, {
      count: request.quantity
    }).pipe(
      map(response => ({
        success: true,
        message: 'Cart updated successfully',
        cartId: response.data?._id || null,
        cart: {
          items: this.transformApiCartToItems(response),
          cartId: response.data?._id || null,
          isLoading: false,
          isSyncing: false,
          error: null,
          lastUpdated: Date.now(),
          isAuthenticated: true
        }
      })),
      catchError(error => {
        console.error('Update cart item error:', error);
        return of({
          success: false,
          message: extractErrorMessage(error)
        });
      })
    );
  }

  /**
   * Remove item from cart
   * API: DELETE /cart/{cartItemId}
   */
  removeFromCart(request: RemoveFromCartRequest): Observable<CartOperationResult> {
    // Guest users are handled by CartStore directly
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Authentication required' });
    }

    return this.api.delete<CartApiResponse>(`${this.CART_ENDPOINTS.REMOVE_CART_ITEM}/${request.cartItemId}`)
      .pipe(
        map(response => ({
          success: true,
          message: 'Item removed from cart successfully',
          cartId: response.data?._id || null,
          cart: {
            items: this.transformApiCartToItems(response),
            cartId: response.data?._id || null,
            isLoading: false,
            isSyncing: false,
            error: null,
            lastUpdated: Date.now(),
            isAuthenticated: true
          }
        })),
        catchError(error => {
          console.error('Remove from cart error:', error);
          return of({
            success: false,
            message: extractErrorMessage(error)
          });
        })
      );
  }

  /**
   * Clear entire cart
   * API: DELETE /cart
   */
  clearCart(): Observable<CartOperationResult> {
    // Guest users are handled by CartStore directly
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Authentication required' });
    }

    return this.api.delete<{ message: string }>(this.CART_ENDPOINTS.CLEAR_CART)
      .pipe(
        map(response => ({
          success: true,
          message: 'Cart cleared successfully',
          cartId: null,
          cart: {
            items: [],
            cartId: null,
            isLoading: false,
            isSyncing: false,
            error: null,
            lastUpdated: Date.now(),
            isAuthenticated: true
          }
        })),
        catchError(error => {
          console.error('Clear cart error:', error);
          return of({
            success: false,
            message: extractErrorMessage(error)
          });
        })
      );
  }

  /**
   * Sync local cart with server (when user logs in)
   * ✅ Uses forkJoin to sync all items in parallel, then returns final result
   * Reference: https://rxjs.dev/api/index/function/forkJoin
   */
  syncCartWithServer(localItems: CartItem[]): Observable<CartOperationResult> {
    if (!this.authService.isAuthenticated() || localItems.length === 0) {
      return of({ success: true, message: 'No items to sync' });
    }

    // Create array of sync operations (add each item to server cart)
    const syncOperations = localItems.map(item =>
      this.addToCart({
        productId: item.product._id,
        quantity: item.quantity
      })
    );
    
    // Use forkJoin to execute all API calls in parallel
    // forkJoin waits for all observables to complete before emitting
    return forkJoin(syncOperations).pipe(
      map(results => {
        // Check if all operations succeeded
        const allSucceeded = results.every(r => r.success);
        const failedCount = results.filter(r => !r.success).length;
        
        if (allSucceeded) {
          return { 
            success: true, 
            message: `Successfully synced ${results.length} items to cart` 
          };
        } else {
          return { 
            success: false, 
            message: `Failed to sync ${failedCount} of ${results.length} items` 
          };
        }
      }),
      catchError(error => {
        console.error('Cart sync error:', error);
        return of({ 
          success: false, 
          message: 'Failed to sync cart with server' 
        });
      })
    );
  }

  // ===== PERSISTENCE METHODS =====

  /**
   * Save cart to localStorage
   */
  saveCartToStorage(items: CartItem[]): void {
    try {
      const cartData: CartPersistenceData = {
        items,
        lastUpdated: Date.now(),
        userId: this.authService.getCurrentUserId()
      };
      
      this.storage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  /**
   * Load cart from localStorage
   */
  loadCartFromStorage(): CartItem[] {
    try {
      const cartDataStr = this.storage.getItem(this.CART_STORAGE_KEY);
      if (!cartDataStr || typeof cartDataStr !== 'string') return [];

      try {
        const cartData: CartPersistenceData = JSON.parse(cartDataStr);
        if (!cartData || typeof cartData !== 'object') return [];
        
        // Check if cart belongs to current user (if authenticated)
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId && cartData.userId && cartData.userId !== currentUserId) {
          // Cart belongs to different user, clear it
          this.clearCartFromStorage();
          return [];
        }

        // Check if cart is not too old
        if (Date.now() - cartData.lastUpdated > this.CART_MAX_AGE_MS) {
          this.clearCartFromStorage();
          return [];
        }

        return cartData.items || [];
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        this.clearCartFromStorage();
        return [];
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      return [];
    }
  }

  /**
   * Clear cart from localStorage
   */
  clearCartFromStorage(): void {
    try {
      this.storage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from storage:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Transform API cart response to internal CartItem[]
   */
  private transformApiCartToItems(response: CartApiResponse): CartItem[] {
    if (!response.data?.products) return [];

    return response.data.products.map((apiItem: CartApiItem) => ({
      _id: apiItem._id,
      product: apiItem.product,
      quantity: apiItem.count,
      unitPrice: apiItem.price,
      totalPrice: apiItem.price * apiItem.count,
      addedAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    }));
  }

  /**
   * Create cart item from product (for guest users)
   */
  createCartItemFromProduct(product: Product, quantity: number = 1): CartItem {
    const currentPrice = product.priceAfterDiscount || product.price;
    const now = new Date().toISOString();
    
    return {
      _id: `local_${product._id}_${Date.now()}`, // Temporary ID for local items
      product,
      quantity,
      unitPrice: currentPrice,
      totalPrice: currentPrice * quantity,
      addedAt: now,
      updatedAt: now
    };
  }
}
