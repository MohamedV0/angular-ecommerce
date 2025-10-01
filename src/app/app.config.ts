import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from 'primeng/api';

// Theme Presets - Switch between these to try different color schemes
import { FreshPreset } from './theme/fresh-preset';      // ✅ Currently Active (Teal + Zinc)
import { PremiumPreset } from './theme/premium-preset'; // Indigo + Slate
import { VibrantPreset } from './theme/vibrant-preset'; // Orange + Neutral
import { NaturalPreset } from './theme/natural-preset'; // Emerald + Stone
import { TestAuraPreset } from './theme/test-aura-preset'; // 🧪 Test - Direct from PrimeNG docs

import { authHeaderInterceptor } from './core/interceptors/auth-header-interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHeaderInterceptor])),
    provideAnimationsAsync(), // Required by PrimeNG (deprecated in v20.2, but still needed until v23)
    MessageService, // ✅ Global MessageService for Toast notifications
    providePrimeNG({
      theme: {
        preset: VibrantPreset, // 🧪 Test preset - Direct from PrimeNG official docs
        options: {
          prefix: 'p', // CSS variables prefix
          darkModeSelector: '.p-dark', // ✅ Class-based dark mode for manual toggle
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
