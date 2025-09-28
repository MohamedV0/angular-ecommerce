import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';

import { AuthService } from '../../services/auth';
import { LoginCredentials } from '../../../../core/models/user.model';

/**
 * Login Component
 * User login form with validation
 * Based on FreshCart BRD requirements and API specifications
 */
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG Components
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    CheckboxModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Sign In to Your Account
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Welcome back to FreshCart
          </p>
        </div>

        <!-- Login Form Card -->
        <p-card class="shadow-lg">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
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
                  @if (loginForm.get('email')?.errors?.['required']) {
                    Email is required
                  }
                  @if (loginForm.get('email')?.errors?.['email']) {
                    Please enter a valid email address
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
                [feedback]="false"
                class="w-full"
                [inputStyle]="{ width: '100%' }"
                [style]="{ width: '100%' }"
              />
              @if (isFieldInvalid('password')) {
                <small class="text-red-500">
                  @if (loginForm.get('password')?.errors?.['required']) {
                    Password is required
                  }
                </small>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <p-checkbox 
                  formControlName="rememberMe"
                  [binary]="true"
                  inputId="rememberMe"
                />
                <label for="rememberMe" class="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div class="text-sm">
                <a 
                  (click)="navigateToForgotPassword()" 
                  class="font-medium text-green-600 hover:text-green-500 cursor-pointer"
                >
                  Forgot your password?
                </a>
              </div>
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
                label="Sign In"
                icon="pi pi-sign-in"
                [loading]="isLoading()"
                [disabled]="loginForm.invalid || isLoading()"
                styleClass="w-full p-button-lg"
                severity="success"
              />
            </div>

            <!-- Register Link -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Don't have an account? 
                <a 
                  (click)="navigateToRegister()" 
                  class="font-medium text-green-600 hover:text-green-500 cursor-pointer ml-1"
                >
                  Create one here
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

    .p-checkbox {
      margin-right: 0.5rem;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Reactive state
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Form setup
  readonly loginForm: FormGroup;

  // Computed properties
  readonly formValid = computed(() => this.loginForm?.valid ?? false);

  constructor() {
    this.loginForm = this.createForm();
  }

  /**
   * Create reactive form with validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email.trim().toLowerCase(),
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Login successful! Redirecting...');
        
        // Redirect after short delay
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          this.authService.handleAuthRedirect(returnUrl);
        }, 1000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.message || 'Login failed. Please try again.'
        );
        console.error('Login error:', error);
      }
    });
  }

  /**
   * Mark all form fields as touched for validation display
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const queryParams = returnUrl ? { returnUrl } : {};
    this.router.navigate(['/auth/register'], { queryParams });
  }

  /**
   * Navigate to forgot password page
   */
  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
