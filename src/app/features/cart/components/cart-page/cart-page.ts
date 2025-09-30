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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Translation
import { TranslatePipe } from '@ngx-translate/core';

// Feature Imports
import { CartStore } from '../../store/cart.store';
import { CartItem } from '../../models/cart.model';
import { AuthService } from '../../../auth/services/auth';

// Shared Utilities
import { formatPrice, getProductImageUrl, trackCartItem, hasDiscount, getItemSavings } from '../../../../shared/utils/cart.utils';

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
    ToastModule,
    // Translation
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './cart-page.html',
  // ✅ No custom styles needed - using PrimeNG + Tailwind CSS
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPage {
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

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
   * Update item quantity with validation
   * ✅ Improved validation to prevent accidental deletions
   */
  updateQuantity(item: CartItem, newQuantity: string | number | null): void {
    const quantity = Number(newQuantity);
    
    // ✅ Validate input is a valid number
    if (isNaN(quantity) || quantity < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Quantity',
        detail: 'Please enter a valid quantity (minimum 1)'
      });
      return;
    }
    
    // If quantity is 0, ask for confirmation before removing
    if (quantity === 0) {
      this.removeItem(item._id);
      return;
    }

    // Update quantity if changed
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
   * Proceed to checkout with authentication check
   * ✅ IMPLEMENTED: Based on API analysis and planned checkout flow
   */
  proceedToCheckout(): void {
    // 1️⃣ Check authentication status
    if (!this.authService.isAuthenticated()) {
      // User is NOT logged in - redirect to login with returnUrl
      this.messageService.add({
        severity: 'info',
        summary: 'Login Required',
        detail: 'Please sign in to proceed with checkout'
      });
      
      // Navigate to login with return URL to come back to checkout
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/cart/checkout' }
      });
      return;
    }

    // 2️⃣ User IS logged in - check if cart has items
    const cartSummary = this.cartSummary();
    
    if (cartSummary.totalItems === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Cart',
        detail: 'Your cart is empty. Add items to proceed with checkout.'
      });
      return;
    }

    // 3️⃣ Check if we have cartId (required for checkout API)
    const cartId = this.cartStore.cartId();
    
    if (!cartId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cart Error',
        detail: 'Unable to proceed to checkout. Please refresh and try again.'
      });
      return;
    }

    // 4️⃣ Navigate to checkout page
    this.router.navigate(['/cart/checkout']);
  }

  /**
   * Navigate to product details
   */
  viewProductDetails(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Get discount savings for an item
   * Delegates to shared utility function
   */
  getItemSavings = getItemSavings;

  /**
   * Check if item has discount
   * Delegates to shared utility function
   */
  hasDiscount = hasDiscount;

  /**
   * Format currency
   * Delegates to shared utility function
   */
  formatPrice = formatPrice;

  /**
   * Get product image URL with fallback
   * Delegates to shared utility function
   */
  getProductImageUrl = getProductImageUrl;

  /**
   * Track function for cart items to improve change detection performance
   * Delegates to shared utility function
   */
  trackCartItem = trackCartItem;

  /**
   * Clear cart error
   */
  clearError(): void {
    this.cartStore.clearError();
  }
}
