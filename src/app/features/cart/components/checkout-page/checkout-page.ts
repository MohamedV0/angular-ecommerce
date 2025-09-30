import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Feature Imports
import { CartStore } from '../../store/cart.store';
import { CheckoutService, ShippingAddress } from '../../services/checkout.service';

// Sub-components
import { CheckoutFormComponent } from '../checkout-form/checkout-form';
import { PaymentMethodSelectorComponent, PaymentMethod } from '../payment-method-selector/payment-method-selector';
import { OrderSummaryComponent } from '../order-summary/order-summary';

/**
 * Complete Checkout Page Component
 * Handles shipping address, payment method selection, and order processing
 * Supports both Cash on Delivery and Stripe payments
 */
@Component({
  selector: 'app-checkout-page',
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
    // Sub-components
    CheckoutFormComponent,
    PaymentMethodSelectorComponent,
    OrderSummaryComponent
  ],
  providers: [MessageService],
  templateUrl: './checkout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPage implements OnInit {
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);
  private readonly checkoutService = inject(CheckoutService);
  private readonly messageService = inject(MessageService);

  // Component state
  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly isProcessing = signal(false);
  readonly paymentMethod = signal<PaymentMethod>('cash');
  readonly isFormValid = signal(false);
  readonly shippingAddress = signal<ShippingAddress | null>(null);

  // Cart data from store
  readonly cartItems = this.cartStore.items;
  readonly cartSummary = this.cartStore.summary;
  readonly cartId = this.cartStore.cartId;

  // Computed properties for UI state
  readonly canSubmit = computed(() => 
    this.isFormValid() && 
    !this.isProcessing() && 
    !this.loading() && 
    this.cartItems().length > 0 &&
    this.cartId()
  );

  // ✅ Computed signal for submit button label (avoids method calls in template)
  readonly submitButtonLabel = computed(() => {
    const method = this.paymentMethod();
    const isProcessing = this.isProcessing();
    
    if (isProcessing) {
      return method === 'cash' ? 'Placing Order...' : 'Processing Payment...';
    }
    
    return method === 'cash' ? 'Place Order (Cash on Delivery)' : 'Pay with Card';
  });

  ngOnInit(): void {
    this.validateCheckoutRequirements();
  }

  /**
   * Handle form validity changes from CheckoutFormComponent
   */
  onFormValidChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  /**
   * Handle form value changes from CheckoutFormComponent  
   */
  onFormValueChange(address: ShippingAddress): void {
    this.shippingAddress.set(address);
  }

  /**
   * Handle payment method changes from PaymentMethodSelectorComponent
   */
  onPaymentMethodChange(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  /**
   * Validate checkout requirements
   * ✅ Synchronous validation - no loading state needed
   */
  private validateCheckoutRequirements(): void {
    // Check if cart is empty
    const summary = this.cartSummary();
    if (summary.totalItems === 0) {
      this.error.set('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Check if cartId exists
    const cartId = this.cartId();
    if (!cartId) {
      this.error.set('Cart ID is missing. Please refresh and try again.');
      return;
    }
  }

  /**
   * Handle form submission - improved without setTimeout anti-patterns
   */
  onSubmit(): void {
    const address = this.shippingAddress();
    const cartId = this.cartId();
    
    // Validate prerequisites
    if (!address) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Incomplete',
        detail: 'Please complete all required fields correctly.'
      });
      return;
    }

    if (!cartId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cart Error',
        detail: 'Cart ID is missing. Please refresh and try again.'
      });
      return;
    }

    // Process payment based on selected method
    if (this.paymentMethod() === 'cash') {
      this.processCashOrder(cartId, address);
    } else {
      this.processStripePayment(cartId, address);
    }
  }

  /**
   * Process cash on delivery order - improved without setTimeout anti-pattern
   */
  private processCashOrder(cartId: string, shippingAddress: ShippingAddress): void {
    this.isProcessing.set(true);

    this.checkoutService.createCashOrder({ cartId, shippingAddress }).subscribe({
      next: (result) => {
        this.isProcessing.set(false);
        
        if (result.success) {
          // Navigate immediately to success page with order details
          this.router.navigate(['/cart/success'], {
            queryParams: { 
              orderId: result.orderId,
              paymentMethod: 'cash'
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Order Failed',
            detail: result.message || 'Failed to place order. Please try again.'
          });
        }
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Order Error',
          detail: 'An unexpected error occurred. Please try again.'
        });
        console.error('Cash order error:', error);
      }
    });
  }

  /**
   * Process Stripe payment - improved without setTimeout anti-pattern
   */
  private processStripePayment(cartId: string, shippingAddress: ShippingAddress): void {
    this.isProcessing.set(true);

    // Backend expects success_url and cancel_url, but uses hardcoded values
    // TODO: Coordinate with backend to use our Angular app URLs instead of backend URLs
    const returnUrl = `${window.location.origin}/cart/success`;

    this.checkoutService.createStripeSession({ 
      cartId, 
      shippingAddress, 
      returnUrl 
    }).subscribe({
      next: (result) => {
        this.isProcessing.set(false);
        
        if (result.success && result.stripeUrl) {
          // Redirect immediately to Stripe checkout
          window.location.href = result.stripeUrl;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: result.message || 'Failed to initialize payment. Please try again.'
          });
        }
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Payment Error',
          detail: 'An unexpected error occurred. Please try again.'
        });
        console.error('Stripe session error:', error);
      }
    });
  }

  /**
   * Retry checkout (clear error and reload)
   */
  retryCheckout(): void {
    this.error.set('');
    this.validateCheckoutRequirements();
  }
}
