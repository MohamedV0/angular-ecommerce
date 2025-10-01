import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

/**
 * Forgot Password Component (Placeholder)
 * TODO: Implement forgot password functionality in future task
 */
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {}
