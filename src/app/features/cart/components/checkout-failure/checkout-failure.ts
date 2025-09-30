import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

/**
 * Checkout Failure Page
 * Displays payment failure message and options to retry
 */
@Component({
  selector: 'app-checkout-failure',
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div class="container mx-auto px-4 py-12">
        
        <div class="max-w-2xl mx-auto text-center">
          
          <!-- Failure Icon and Header -->
          <div class="mb-8">
            <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="pi pi-times text-4xl text-white"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Failed
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-300">
              We're sorry, but your payment could not be processed.
            </p>
          </div>

          <!-- Error Details Card -->
          <p-card class="mb-8">
            <ng-template pTemplate="header">
              <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20">
                <i class="pi pi-exclamation-triangle text-red-600"></i>
                <h3 class="font-semibold text-gray-900 dark:text-white">What Happened?</h3>
              </div>
            </ng-template>
            
            <div class="space-y-4 text-left">
              @if (errorReason()) {
                <p-message 
                  severity="error" 
                  [text]="errorReason()!"
                  class="text-left">
                </p-message>
              } @else {
                <p-message 
                  severity="error" 
                  text="Your payment was not successful. This could be due to insufficient funds, an expired card, or a technical issue."
                  class="text-left">
                </p-message>
              }
              
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Common reasons for payment failure:</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Insufficient funds in your account</li>
                  <li>• Expired or invalid card details</li>
                  <li>• Bank security restrictions</li>
                  <li>• Network connectivity issues</li>
                  <li>• Card not authorized for online payments</li>
                </ul>
              </div>
            </div>
          </p-card>

          <!-- Next Steps -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What Can You Do?
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <i class="pi pi-refresh text-2xl text-blue-500 mb-2"></i>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">Try Again</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Retry payment with the same or different card
                </p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <i class="pi pi-wallet text-2xl text-green-500 mb-2"></i>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">Cash on Delivery</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Choose cash payment instead
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <p-button 
              label="Try Payment Again"
              icon="pi pi-credit-card"
              routerLink="/cart/checkout"
              severity="primary"
              size="large">
            </p-button>
            <p-button 
              label="Back to Cart"
              icon="pi pi-arrow-left"
              routerLink="/cart"
              severity="secondary"
              [outlined]="true"
              size="large">
            </p-button>
          </div>

          <!-- Help Section -->
          <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-2">Need Help?</h4>
            <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
              If you continue to experience issues, please contact our support team.
            </p>
            <p-button 
              label="Contact Support"
              icon="pi pi-phone"
              severity="info"
              [text]="true"
              size="small">
            </p-button>
          </div>

        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutFailurePage {
  private readonly route = inject(ActivatedRoute);

  // Component state
  readonly errorReason = signal<string | null>(null);

  constructor() {
    // Extract error details in constructor to use takeUntilDestroyed()
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        if (params['error']) {
          this.errorReason.set(decodeURIComponent(params['error']));
        }
        
        if (params['message']) {
          this.errorReason.set(decodeURIComponent(params['message']));
        }
      });
  }
}
