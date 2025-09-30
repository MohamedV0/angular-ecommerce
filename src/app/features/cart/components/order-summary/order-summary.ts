import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// Types
import { CartItem, CartSummary } from '../../models/cart.model';

// Shared Utilities
import { formatPrice, getProductImageUrl, trackCartItem } from '../../../../shared/utils/cart.utils';

/**
 * Order Summary Component
 * Displays cart items and order totals
 * Focused single responsibility: Order display only
 */
@Component({
  selector: 'app-order-summary',
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    DividerModule
  ],
  template: `
    <div class="lg:sticky lg:top-4 lg:self-start">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800">
            <i class="pi pi-shopping-cart text-primary-500" aria-hidden="true"></i>
            <h3 class="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
          </div>
        </ng-template>
        
        <div class="space-y-6">
          <!-- Cart Items -->
          @if (cartItems().length > 0) {
            <div class="space-y-3" role="list" aria-label="Order items">
              @for (item of cartItems(); track trackCartItem(item)) {
                <div 
                  class="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  role="listitem">
                  <img 
                    [src]="getProductImageUrl(item)"
                    [alt]="item.product.title"
                    class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                    loading="lazy" />
                  
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {{ item.product.title }}
                    </h4>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {{ item.quantity }}
                      </span>
                      <span class="font-semibold text-gray-900 dark:text-white text-sm">
                        {{ formatPrice(item.totalPrice) }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
              <i class="pi pi-shopping-cart text-3xl mb-2 block" aria-hidden="true"></i>
              <p>No items in cart</p>
            </div>
          }

          <!-- Order Totals -->
          @if (cartSummary().totalItems > 0) {
            <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">
                  Subtotal ({{ cartSummary().totalItems }} items)
                </span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(cartSummary().totalPrice) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                <span class="font-medium text-green-600">Free</span>
              </div>
              
              <p-divider></p-divider>
              
              <div class="flex justify-between items-center text-lg font-bold">
                <span class="text-gray-900 dark:text-white">Total</span>
                <span class="text-primary-600 dark:text-primary-400">
                  {{ formatPrice(cartSummary().totalPrice) }}
                </span>
              </div>
            </div>

            <!-- Action Buttons Slot -->
            <div class="space-y-3">
              <ng-content select="[orderActions]"></ng-content>
            </div>

            <!-- Back to Cart Button -->
            <p-button 
              label="Back to Cart"
              severity="secondary"
              [text]="true"
              icon="pi pi-arrow-left"
              routerLink="/cart"
              [disabled]="isProcessing()"
              class="w-full"
              [attr.aria-label]="'Go back to shopping cart'">
            </p-button>
          }
        </div>
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummaryComponent {
  // Inputs
  readonly cartItems = input<CartItem[]>([]);
  readonly cartSummary = input<CartSummary>({ totalItems: 0, totalPrice: 0, isEmpty: true, itemsCount: '0 items' });
  readonly isProcessing = input<boolean>(false);

  /**
   * Track function for cart items to improve change detection performance
   * Delegates to shared utility function
   */
  trackCartItem = trackCartItem;

  /**
   * Get product image URL with fallback
   * Delegates to shared utility function
   */
  getProductImageUrl = getProductImageUrl;

  /**
   * Format price for display
   * Delegates to shared utility function
   */
  formatPrice = formatPrice;
}
