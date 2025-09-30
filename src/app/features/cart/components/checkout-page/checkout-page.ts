import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

// Translation
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Checkout Page Component - Placeholder for future implementation
 * Will handle order processing, payment, and delivery information
 */
@Component({
  selector: 'app-checkout-page',
  imports: [
    CommonModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    MessageModule,
    // Translation
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ 'CHECKOUT.TITLE' | translate }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ 'CHECKOUT.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Coming Soon Message -->
        <div class="max-w-2xl mx-auto">
          <p-card>
            <div class="text-center py-12">
              <i class="pi pi-wrench text-6xl text-primary-500 mb-4"></i>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ 'CHECKOUT.COMING_SOON_TITLE' | translate }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-8">
                {{ 'CHECKOUT.COMING_SOON_MESSAGE' | translate }}
              </p>
              <p-button 
                label="{{ 'CHECKOUT.BACK_TO_CART' | translate }}"
                severity="primary"
                icon="pi pi-arrow-left"
                routerLink="/cart">
              </p-button>
            </div>
          </p-card>
        </div>

      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPage {}
