import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

// Translation
import { TranslatePipe } from '@ngx-translate/core';

// Feature Imports
import { CartStore } from '../../store/cart.store';
import { CartItem } from '../../models/cart.model';

/**
 * Shopping Cart Page Component
 * Displays cart items, allows quantity updates, and provides checkout functionality
 */
@Component({
  selector: 'app-cart-page',
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    InputNumberModule,
    BadgeModule,
    DividerModule,
    MessageModule,
    SkeletonModule,
    TagModule,
    // Translation
    TranslatePipe
  ],
  templateUrl: './cart-page.html',
  // ✅ No custom styles needed - using PrimeNG + Tailwind CSS
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPage {
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);

  // Cart state signals
  readonly cartItems = this.cartStore.items;
  readonly cartSummary = this.cartStore.summary;
  readonly isLoading = this.cartStore.isLoading;
  readonly error = this.cartStore.error;
  readonly isOperating = this.cartStore.isOperating;

  // Computed properties for UI
  readonly isEmpty = computed(() => this.cartItems().length === 0);
  readonly showEmptyState = computed(() => this.isEmpty() && !this.isLoading());
  readonly showLoadingState = computed(() => this.isLoading() && this.isEmpty());

  /**
   * Update item quantity
   */
  updateQuantity(item: CartItem, newQuantity: string | number | null): void {
    const quantity = Number(newQuantity) || 0;
    
    if (quantity <= 0) {
      this.removeItem(item._id);
      return;
    }

    if (quantity !== item.quantity) {
      this.cartStore.updateCartItem({
        cartItemId: item._id,
        quantity: quantity
      });
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(cartItemId: string): void {
    this.cartStore.removeFromCart(cartItemId);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.cartStore.clearCart();
  }

  /**
   * Continue shopping - navigate to products
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout(): void {
    // TODO: Implement checkout flow
    console.log('Proceeding to checkout...');
    // this.router.navigate(['/cart/checkout']);
  }

  /**
   * Navigate to product details
   */
  viewProductDetails(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Get discount savings for an item
   */
  getItemSavings(item: CartItem): number {
    const originalPrice = item.product.price;
    const discountedPrice = item.product.priceAfterDiscount || item.product.price;
    return (originalPrice - discountedPrice) * item.quantity;
  }

  /**
   * Check if item has discount
   */
  hasDiscount(item: CartItem): boolean {
    return !!(item.product.priceAfterDiscount && 
           item.product.priceAfterDiscount < item.product.price);
  }

  /**
   * Format currency
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Get product image URL with fallback
   */
  getProductImageUrl(item: CartItem): string {
    return item.product.imageCover || 
           (item.product.images && item.product.images[0]) || 
           '/assets/images/product-placeholder.jpg';
  }

  /**
   * Clear cart error
   */
  clearError(): void {
    this.cartStore.clearError();
  }
}
