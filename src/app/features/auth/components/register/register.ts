import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../../../core/models/user.model';

/**
 * Register Component
 * User registration form with validation
 * Based on FreshCart BRD requirements and API specifications
 */
@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG Components
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Join FreshCart and start shopping today
          </p>
        </div>

        <!-- Registration Form Card -->
        <p-card class="shadow-lg">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Full Name Field -->
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                id="name"
                pInputText 
                formControlName="name"
                placeholder="Enter your full name"
                class="w-full"
                [class.p-invalid]="isFieldInvalid('name')"
              />
              @if (isFieldInvalid('name')) {
                <small class="text-red-500">
                  @if (registerForm.get('name')?.errors?.['required']) {
                    Full name is required
                  }
                  @if (registerForm.get('name')?.errors?.['minlength']) {
                    Name must be at least 2 characters
                  }
                </small>
              }
            </div>

            <!-- Email Field -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                id="email"
                pInputText 
                formControlName="email"
                placeholder="Enter your email address"
                type="email"
                class="w-full"
                [class.p-invalid]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <small class="text-red-500">
                  @if (registerForm.get('email')?.errors?.['required']) {
                    Email is required
                  }
                  @if (registerForm.get('email')?.errors?.['email']) {
                    Please enter a valid email address
                  }
                </small>
              }
            </div>

            <!-- Phone Field -->
            <div class="space-y-1">
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                id="phone"
                pInputText 
                formControlName="phone"
                placeholder="01234567890"
                class="w-full"
                [class.p-invalid]="isFieldInvalid('phone')"
              />
              @if (isFieldInvalid('phone')) {
                <small class="text-red-500">
                  @if (registerForm.get('phone')?.errors?.['required']) {
                    Phone number is required
                  }
                  @if (registerForm.get('phone')?.errors?.['pattern']) {
                    Please enter a valid Egyptian phone number (11 digits starting with 01)
                  }
                </small>
              }
            </div>

            <!-- Password Field -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <p-password 
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                [toggleMask]="true"
                [feedback]="true"
                class="w-full"
                [inputStyle]="{ width: '100%' }"
                [style]="{ width: '100%' }"
              />
              @if (isFieldInvalid('password')) {
                <small class="text-red-500">
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Password is required
                  }
                  @if (registerForm.get('password')?.errors?.['minlength']) {
                    Password must be at least 8 characters
                  }
                  @if (registerForm.get('password')?.errors?.['pattern']) {
                    Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
                  }
                </small>
              }
            </div>

            <!-- Confirm Password Field -->
            <div class="space-y-1">
              <label for="rePassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <p-password 
                id="rePassword"
                formControlName="rePassword"
                placeholder="Confirm your password"
                [toggleMask]="true"
                [feedback]="false"
                class="w-full"
                [inputStyle]="{ width: '100%' }"
                [style]="{ width: '100%' }"
              />
              @if (isFieldInvalid('rePassword')) {
                <small class="text-red-500">
                  @if (registerForm.get('rePassword')?.errors?.['required']) {
                    Please confirm your password
                  }
                  @if (registerForm.get('rePassword')?.errors?.['passwordMismatch']) {
                    Passwords do not match
                  }
                </small>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <p-message 
                severity="error" 
                [text]="errorMessage()"
                class="w-full"
              />
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <p-message 
                severity="success" 
                [text]="successMessage()"
                class="w-full"
              />
            }

            <!-- Submit Button -->
            <div>
              <p-button 
                type="submit"
                label="Create Account"
                icon="pi pi-user-plus"
                [loading]="isLoading()"
                [disabled]="registerForm.invalid || isLoading()"
                styleClass="w-full p-button-lg"
                severity="success"
              />
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account? 
                <a 
                  (click)="navigateToLogin()" 
                  class="font-medium text-green-600 hover:text-green-500 cursor-pointer ml-1"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .p-card {
      border: 1px solid #e5e7eb;
    }
    
    .p-card .p-card-body {
      padding: 2rem;
    }
    
    .p-inputtext, .p-password {
      width: 100%;
    }
    
    .p-password-input {
      width: 100%;
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Reactive state
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Form setup
  readonly registerForm: FormGroup;

  // Computed properties
  readonly formValid = computed(() => this.registerForm?.valid ?? false);

  constructor() {
    this.registerForm = this.createForm();
  }

  /**
   * Create reactive form with validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^01[0125][0-9]{8}$') // Egyptian phone number pattern
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).{8,}$')
      ]],
      rePassword: ['', [
        Validators.required
      ]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Custom validator for password confirmation
   */
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const rePassword = control.get('rePassword');
    
    if (!password || !rePassword) {
      return null;
    }
    
    if (password.value !== rePassword.value) {
      rePassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    // Clear the error if passwords match
    if (rePassword.hasError('passwordMismatch')) {
      delete rePassword.errors!['passwordMismatch'];
      if (Object.keys(rePassword.errors!).length === 0) {
        rePassword.setErrors(null);
      }
    }
    
    return null;
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const registerData: RegisterRequest = {
      name: this.registerForm.value.name.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      phone: this.registerForm.value.phone.trim(),
      password: this.registerForm.value.password,
      rePassword: this.registerForm.value.rePassword
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Account created successfully! Redirecting...');
        
        // Redirect after short delay
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          this.authService.handleAuthRedirect(returnUrl);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.message || 'Registration failed. Please try again.'
        );
        console.error('Registration error:', error);
      }
    });
  }

  /**
   * Mark all form fields as touched for validation display
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const queryParams = returnUrl ? { returnUrl } : {};
    this.router.navigate(['/auth/login'], { queryParams });
  }
}
