import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';

/**
 * Payment Method Type
 */
export type PaymentMethod = 'cash' | 'card';

/**
 * Payment Method Selector Component
 * Handles payment method selection with clear UI feedback
 * Focused single responsibility: Payment method selection only
 */
@Component({
  selector: 'app-payment-method-selector',
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    CardModule,
    RadioButtonModule
  ],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800">
          <i class="pi pi-credit-card text-primary-500"></i>
          <h3 class="font-semibold text-gray-900 dark:text-white">Payment Method</h3>
        </div>
      </ng-template>
      
      <div class="space-y-4">
        <!-- Cash on Delivery Option -->
        <div 
          class="payment-option border rounded-lg p-4 cursor-pointer transition-all duration-200"
          [class.border-primary-500]="paymentMethodSignal() === 'cash'"
          [class.bg-primary-50]="paymentMethodSignal() === 'cash'"
          [class.border-gray-200]="paymentMethodSignal() !== 'cash'"
          [class.pointer-events-none]="isDisabled()"
          [class.opacity-50]="isDisabled()"
          (click)="selectPaymentMethod('cash')"
          role="button"
          tabindex="0"
          (keydown.enter)="selectPaymentMethod('cash')"
          (keydown.space)="selectPaymentMethod('cash')"
          [attr.aria-pressed]="paymentMethodSignal() === 'cash'"
          aria-label="Select cash on delivery payment method">
          <div class="flex items-center gap-3">
            <p-radiobutton 
              value="cash" 
              [(ngModel)]="paymentMethodSignal" 
              inputId="cash"
              [disabled]="isDisabled()"
              [ngModelOptions]="{standalone: true}">
            </p-radiobutton>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <i class="pi pi-wallet text-lg text-gray-600" aria-hidden="true"></i>
                <label for="cash" class="font-medium text-gray-900 dark:text-white cursor-pointer">
                  Cash on Delivery
                </label>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pay with cash when your order arrives
              </p>
            </div>
          </div>
        </div>

        <!-- Credit Card Option -->
        <div 
          class="payment-option border rounded-lg p-4 cursor-pointer transition-all duration-200"
          [class.border-primary-500]="paymentMethodSignal() === 'card'"
          [class.bg-primary-50]="paymentMethodSignal() === 'card'"
          [class.border-gray-200]="paymentMethodSignal() !== 'card'"
          [class.pointer-events-none]="isDisabled()"
          [class.opacity-50]="isDisabled()"
          (click)="selectPaymentMethod('card')"
          role="button"
          tabindex="0"
          (keydown.enter)="selectPaymentMethod('card')"
          (keydown.space)="selectPaymentMethod('card')"
          [attr.aria-pressed]="paymentMethodSignal() === 'card'"
          aria-label="Select credit or debit card payment method">
          <div class="flex items-center gap-3">
            <p-radiobutton 
              value="card" 
              [(ngModel)]="paymentMethodSignal" 
              inputId="card"
              [disabled]="isDisabled()"
              [ngModelOptions]="{standalone: true}">
            </p-radiobutton>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <i class="pi pi-credit-card text-lg text-gray-600" aria-hidden="true"></i>
                <label for="card" class="font-medium text-gray-900 dark:text-white cursor-pointer">
                  Credit/Debit Card
                </label>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pay securely with your card via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent {
  // Inputs
  readonly selectedPaymentMethod = input<PaymentMethod>('cash');
  readonly isDisabled = input<boolean>(false);

  // Outputs
  readonly paymentMethodChange = output<PaymentMethod>();

  // Internal state
  readonly paymentMethodSignal = signal<PaymentMethod>('cash');

  constructor() {
    // ✅ Sync internal signal when input changes
    effect(() => {
      this.paymentMethodSignal.set(this.selectedPaymentMethod());
    });
  }

  /**
   * Select payment method and emit change
   */
  selectPaymentMethod(method: PaymentMethod): void {
    if (this.isDisabled()) return;
    
    this.paymentMethodSignal.set(method);
    this.paymentMethodChange.emit(method);
  }
}
