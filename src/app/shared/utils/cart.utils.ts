import { CartItem } from '../../features/cart/models/cart.model';

/**
 * Cart Utility Functions
 * Shared utilities for cart and checkout components to eliminate duplication
 */

/**
 * Format price with Egyptian Pound currency
 * Consolidates duplicated formatPrice() from cart-page, order-summary, etc.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Get product image URL with fallback
 * Consolidates duplicated getProductImageUrl() from cart-page and order-summary
 */
export function getProductImageUrl(item: CartItem): string {
  return item.product.imageCover || 
         (item.product.images && item.product.images[0]) || 
         '/assets/images/product-placeholder.jpg';
}

/**
 * Track function for cart items (for ngFor optimization)
 * Consolidates duplicated trackCartItem() from cart-page and order-summary
 */
export function trackCartItem(item: CartItem): string {
  return item._id;
}

/**
 * Track function for cart items by index and item
 * Alternative tracking function for complex scenarios
 */
export function trackCartItemByIndex(index: number, item: CartItem): string {
  return `${index}_${item._id}`;
}

/**
 * Calculate total price for a cart item
 */
export function calculateItemTotal(item: CartItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * Check if cart item has discount
 */
export function hasDiscount(item: CartItem): boolean {
  return !!(item.product.priceAfterDiscount && 
         item.product.priceAfterDiscount < item.product.price);
}

/**
 * Get discount amount for an item
 */
export function getItemSavings(item: CartItem): number {
  const originalPrice = item.product.price;
  const discountedPrice = item.product.priceAfterDiscount || item.product.price;
  return (originalPrice - discountedPrice) * item.quantity;
}

/**
 * Format date to localized string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}
