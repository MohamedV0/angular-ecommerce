import { Component, input, output, signal, computed, ChangeDetectionStrategy, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

// Shared Validators
import { 
  isFieldInvalid,
  markAllFieldsAsTouched 
} from '../../../../shared/validators/form-validation.util';
import {
  egyptianPhoneNumberValidator,
  shippingAddressDetailsValidator,
  egyptianCityValidator,
  EGYPTIAN_CITIES
} from '../../../../shared/validators/checkout.validators';

// Types
import { ShippingAddress } from '../../services/checkout.service';

/**
 * Checkout Form Component
 * Handles shipping address form validation and submission
 * Focused single responsibility: Form management only
 */
@Component({
  selector: 'app-checkout-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule
  ],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800">
          <i class="pi pi-map-marker text-primary-500"></i>
          <h3 class="font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
        </div>
      </ng-template>
      
      <form [formGroup]="checkoutForm" class="space-y-4">
        <!-- Address Details -->
        <div>
          <label for="details" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Details <span class="text-red-500">*</span>
          </label>
          <textarea
            id="details"
            pTextarea
            formControlName="details"
            placeholder="Enter your full address (street, building number, apartment, etc.)"
            rows="3"
            class="w-full"
            [class.p-invalid]="isFieldInvalid('details')"
            aria-describedby="details-error">
          </textarea>
          @if (isFieldInvalid('details')) {
            <small id="details-error" class="text-red-500 mt-1 block">
              @if (checkoutForm.get('details')?.errors?.['required']) {
                Address details are required
              }
              @if (checkoutForm.get('details')?.errors?.['minAddressLength']) {
                Address must be at least 10 characters
              }
            </small>
          }
        </div>

        <!-- Phone Number -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
            id="phone"
            pInputText
            formControlName="phone"
            placeholder="01234567890"
            class="w-full"
            [class.p-invalid]="isFieldInvalid('phone')"
            aria-describedby="phone-error" />
          @if (isFieldInvalid('phone')) {
            <small id="phone-error" class="text-red-500 mt-1 block">
              @if (checkoutForm.get('phone')?.errors?.['required']) {
                Phone number is required
              }
              @if (checkoutForm.get('phone')?.errors?.['invalidEgyptianPhone']) {
                Please enter a valid Egyptian phone number (11 digits starting with 01)
              }
            </small>
          }
        </div>

        <!-- City -->
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City <span class="text-red-500">*</span>
          </label>
          <p-select
            formControlName="city"
            [options]="egyptianCities"
            placeholder="Select your city"
            [showClear]="true"
            [filter]="true"
            filterBy="label"
            class="w-full"
            [class.p-invalid]="isFieldInvalid('city')"
            aria-describedby="city-error">
          </p-select>
          @if (isFieldInvalid('city')) {
            <small id="city-error" class="text-red-500 mt-1 block">
              City selection is required
            </small>
          }
        </div>
      </form>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs
  readonly initialData = input<Partial<ShippingAddress>>();
  readonly isProcessing = input<boolean>(false);

  // Outputs
  readonly formValidChange = output<boolean>();
  readonly formValueChange = output<ShippingAddress>();

  // Form setup
  checkoutForm!: FormGroup;

  // Form validation state
  readonly isFormValid = computed(() => this.checkoutForm?.valid ?? false);

  // ✅ Static: Egyptian cities for dropdown (computed once, shared across all instances)
  private static readonly EGYPTIAN_CITIES_OPTIONS = EGYPTIAN_CITIES.map((city: string) => ({
    label: city,
    value: city
  }));
  
  readonly egyptianCities = CheckoutFormComponent.EGYPTIAN_CITIES_OPTIONS;

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm(): void {
    const initialData = this.initialData();
    
    this.checkoutForm = this.fb.group({
      details: [initialData?.details || '', [
        Validators.required,
        shippingAddressDetailsValidator()
      ]],
      phone: [initialData?.phone || '', [
        Validators.required,
        egyptianPhoneNumberValidator()
      ]],
      city: [initialData?.city || '', [
        Validators.required,
        egyptianCityValidator()
      ]]
    });
  }

  /**
   * Setup form subscriptions to emit changes
   * ✅ Using takeUntilDestroyed() for automatic cleanup
   */
  private setupFormSubscriptions(): void {
    // Emit validity changes
    this.checkoutForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formValidChange.emit(this.checkoutForm.valid);
      });

    // Emit value changes
    this.checkoutForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (this.checkoutForm.valid) {
          this.formValueChange.emit({
            details: value.details?.trim() || '',
            phone: value.phone?.trim() || '',
            city: value.city || ''
          });
        }
      });
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return isFieldInvalid(field);
  }

  /**
   * Mark all fields as touched for validation display
   */
  markAllFieldsAsTouched(): void {
    markAllFieldsAsTouched(this.checkoutForm);
  }

  /**
   * Get current form value
   */
  getFormValue(): ShippingAddress | null {
    if (this.checkoutForm.valid) {
      const value = this.checkoutForm.value;
      return {
        details: value.details?.trim() || '',
        phone: value.phone?.trim() || '',
        city: value.city || ''
      };
    }
    return null;
  }
}
