import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Form Validation Utilities for FreshCart
 * Centralized validation logic following Angular best practices
 * 
 * NOTE: Checkout-specific validators (phone, address, city) are in checkout.validators.ts
 */

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minlength: (min: number) => `Minimum ${min} characters required`,
  maxlength: (max: number) => `Maximum ${max} characters allowed`,
  pattern: 'Invalid format'
} as const;

/**
 * Get validation error message for a form control
 * For checkout-specific errors, use getCheckoutValidationError from checkout.validators.ts
 */
export function getValidationError(control: AbstractControl): string | null {
  if (!control.errors || !control.touched) return null;
  
  const errors = control.errors;
  
  if (errors['required']) return VALIDATION_MESSAGES.required;
  if (errors['minlength']) return VALIDATION_MESSAGES.minlength(errors['minlength'].requiredLength);
  if (errors['maxlength']) return VALIDATION_MESSAGES.maxlength(errors['maxlength'].requiredLength);
  if (errors['pattern']) return VALIDATION_MESSAGES.pattern;
  
  // Return first error message if no specific match
  return 'Invalid input';
}

/**
 * Check if form control is invalid and touched/dirty
 */
export function isFieldInvalid(control: AbstractControl | null): boolean {
  return !!(control && control.invalid && (control.dirty || control.touched));
}

/**
 * Mark all form controls as touched for validation display
 */
export function markAllFieldsAsTouched(form: any): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (control) {
      control.markAsTouched();
      // Handle nested form groups
      if (control.controls) {
        markAllFieldsAsTouched(control);
      }
    }
  });
}
