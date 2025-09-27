import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura, // Modern Aura theme
        options: {
          prefix: 'p', // CSS variables prefix
          darkModeSelector: 'system', // Auto dark mode detection
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng' // Proper CSS layer ordering for Tailwind integration
          }
        }
      },
      ripple: true, // Enable ripple effects for better UX (per documentation line 70)
      // i18n integration - will be synced with ngx-translate dynamically
      translation: {
        // Basic PrimeNG translations (will be enhanced with ngx-translate)
        accept: 'Yes',
        reject: 'No',
        choose: 'Choose',
        upload: 'Upload',
        cancel: 'Cancel',
        clear: 'Clear',
        completed: 'Completed',
        pending: 'Pending'
      }
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};
