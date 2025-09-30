import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';

// Feature Imports
import { CartStore } from '../../store/cart.store';

// Shared Utilities
import { formatDate } from '../../../../shared/utils/cart.utils';

/**
 * Checkout Success Page
 * Displays order confirmation and clears cart
 */
@Component({
  selector: 'app-checkout-success',
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    MessageModule,
    DividerModule,
    BadgeModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div class="container mx-auto px-4 py-12">
        
        <div class="max-w-2xl mx-auto text-center">
          
          <!-- Success Icon and Header -->
          <div class="mb-8">
            <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <i class="pi pi-check text-4xl text-white"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Order Placed Successfully!
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-300">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <!-- Order Details Card -->
          <p-card class="mb-8">
            <ng-template pTemplate="header">
              <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20">
                <i class="pi pi-receipt text-green-600"></i>
                <h3 class="font-semibold text-gray-900 dark:text-white">Order Details</h3>
              </div>
            </ng-template>
            
            <div class="space-y-4 text-left">
              @if (orderId()) {
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400 font-medium">Order ID:</span>
                  <p-badge 
                    [value]="orderId()!" 
                    severity="info"
                    class="font-mono">
                  </p-badge>
                </div>
              }
              
              @if (paymentMethod()) {
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400 font-medium">Payment Method:</span>
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ getPaymentMethodLabel() }}
                  </span>
                </div>
              }
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400 font-medium">Order Date:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ getCurrentDate() }}
                </span>
              </div>
              
              <p-divider></p-divider>
              
              @if (paymentMethod() === 'cash') {
                <p-message 
                  severity="info" 
                  [text]="'Your order will be delivered and you can pay cash on delivery.'"
                  class="text-left">
                </p-message>
              } @else {
                <p-message 
                  severity="success" 
                  [text]="'Payment has been processed successfully. Your order is being prepared.'"
                  class="text-left">
                </p-message>
              }
            </div>
          </p-card>

          <!-- Next Steps -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What's Next?
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <i class="pi pi-clock text-2xl text-blue-500 mb-2"></i>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">Processing</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">We're preparing your order</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <i class="pi pi-truck text-2xl text-orange-500 mb-2"></i>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">Shipping</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Your order is on the way</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <i class="pi pi-home text-2xl text-green-500 mb-2"></i>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">Delivered</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Enjoy your purchase!</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <p-button 
              label="Continue Shopping"
              icon="pi pi-shopping-bag"
              routerLink="/"
              severity="primary"
              size="large">
            </p-button>
            <p-button 
              label="View Orders"
              icon="pi pi-list"
              routerLink="/profile/orders"
              severity="secondary"
              [outlined]="true"
              size="large">
            </p-button>
          </div>

        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutSuccessPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);

  // Component state
  readonly orderId = signal<string | null>(null);
  readonly paymentMethod = signal<'cash' | 'card' | null>(null);

  constructor() {
    // Extract query params in constructor to use takeUntilDestroyed()
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        if (params['orderId']) {
          this.orderId.set(params['orderId']);
        }
        
        if (params['paymentMethod']) {
          this.paymentMethod.set(params['paymentMethod']);
        }
      });
  }

  ngOnInit(): void {
    this.clearCart();
  }

  /**
   * Clear cart after successful order
   */
  private clearCart(): void {
    // Clear cart in store - this will sync with localStorage/API
    this.cartStore.clearCart();
  }

  /**
   * Get payment method display label
   */
  getPaymentMethodLabel(): string {
    const method = this.paymentMethod();
    switch (method) {
      case 'cash':
        return 'Cash on Delivery';
      case 'card':
        return 'Credit/Debit Card';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get current date formatted
   * Delegates to shared utility function
   */
  getCurrentDate(): string {
    return formatDate(new Date());
  }
}
