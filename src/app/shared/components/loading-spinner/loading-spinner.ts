import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Global route loading spinner
 * Shows during lazy-loaded route transitions
 */
@Component({
  selector: 'app-loading-spinner',
  imports: [ProgressSpinnerModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 min-h-[60vh] px-4">
      <p-progressSpinner 
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
        [style]="{ width: '50px', height: '50px' }"
        ariaLabel="Loading content" />
      
      <div class="text-center">
        <p class="text-color text-base font-medium mb-1">Loading...</p>
        <p class="text-muted-color text-sm">Please wait a moment</p>
      </div>
    </div>
  `,
  styles: `
    :host ::ng-deep .p-progressspinner-circle {
      stroke: var(--p-primary-color) !important;
    }
  `
})
export class LoadingSpinner {}
