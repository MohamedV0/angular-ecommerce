import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from './core/services/i18n';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fresh-cart');
  protected readonly i18nService = inject(I18nService);

  /**
   * Toggle between English and Arabic
   */
  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }

  /**
   * Get current language for display
   */
  getCurrentLanguage(): string {
    return this.i18nService.getCurrentLanguageCode();
  }
}
