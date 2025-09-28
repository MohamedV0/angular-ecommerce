import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reset Password Component (Placeholder)
 * TODO: Implement reset password functionality in future task
 */
@Component({
  selector: 'app-reset-password',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            This component will be implemented in a future task.
          </p>
          <div class="mt-4 space-x-4">
            <a href="/auth/login" class="text-green-600 hover:text-green-500">
              Back to Login
            </a>
            <a href="/auth/register" class="text-green-600 hover:text-green-500">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {}
