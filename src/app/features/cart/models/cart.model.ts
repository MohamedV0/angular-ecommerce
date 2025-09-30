// Cart Models - Based on Real API Integration
// Following the same pattern as product.model.ts and user.model.ts
// Updated: 2025-01-29

import { Product } from '../../products/models/product.model';

/**
 * Cart Item Interface - Individual product in cart
 */
export interface CartItem {
  _id: string;                          // Cart item ID
  product: Product;                     // Full product details
  quantity: number;                     // Quantity in cart
  unitPrice: number;                    // Price at time of adding to cart
  totalPrice: number;                   // unitPrice * quantity
  addedAt: string;                      // When item was added to cart
  updatedAt: string;                    // When quantity was last updated
}

/**
 * Cart State Interface - Complete cart state
 * ✅ totalItems and totalPrice are now computed signals (not stored in state)
 */
export interface CartState {
  items: CartItem[];                    // Cart items
  isLoading: boolean;                   // Loading state for operations
  isSyncing: boolean;                   // Syncing with server
  error: string | null;                 // Error message if any
  lastUpdated: number;                  // Timestamp of last update
  isAuthenticated: boolean;             // User authentication status
}

/**
 * Add to Cart Request
 */
export interface AddToCartRequest {
  productId: string;                    // Product ID to add
  quantity: number;                     // Quantity to add
}

/**
 * Update Cart Item Request
 */
export interface UpdateCartItemRequest {
  cartItemId: string;                   // Cart item ID
  quantity: number;                     // New quantity (0 to remove)
}

/**
 * Remove from Cart Request
 */
export interface RemoveFromCartRequest {
  cartItemId: string;                   // Cart item ID to remove
}

/**
 * Cart API Response - Based on real API structure
 */
export interface CartApiResponse {
  message: string;                      // Success message
  numOfCartItems: number;               // Total items in cart
  cartId: string;                       // Cart ID from server
  data: {
    _id: string;                        // Cart document ID
    cartOwner: string;                  // User ID who owns cart
    products: CartApiItem[];            // Cart items from API
    createdAt: string;                  // Cart creation date
    updatedAt: string;                  // Cart last update
    __v: number;                        // Version key
    totalCartPrice: number;             // Total cart price
  };
}

/**
 * Cart Item from API - Different structure than our internal model
 */
export interface CartApiItem {
  count: number;                        // Quantity (API uses 'count' instead of 'quantity')
  _id: string;                          // Cart item ID
  product: Product;                     // Product details
  price: number;                        // Price at time of adding
}

/**
 * Cart Summary for display components
 */
export interface CartSummary {
  totalItems: number;                   // Total item count
  totalPrice: number;                   // Total price
  isEmpty: boolean;                     // Whether cart is empty
  itemsCount: string;                   // Formatted items count display
}

/**
 * Cart Persistence Data - For localStorage
 */
export interface CartPersistenceData {
  items: CartItem[];                    // Cart items
  lastUpdated: number;                  // When saved
  userId: string | null;                // User ID if authenticated (null for guest users)
}

/**
 * Cart Operation Result
 */
export interface CartOperationResult {
  success: boolean;                     // Whether operation succeeded
  message?: string;                     // Success/error message
  item?: CartItem;                      // Updated/added item
  cart?: CartState;                     // Updated cart state
}

/**
 * Cart Configuration
 */
export interface CartConfig {
  maxQuantityPerItem: number;           // Max quantity allowed per item
  maxItemsInCart: number;               // Max different items in cart
  autoSync: boolean;                    // Auto sync with server when authenticated
  persistenceEnabled: boolean;          // Enable localStorage persistence
  syncIntervalMs: number;               // Sync interval in milliseconds
}
