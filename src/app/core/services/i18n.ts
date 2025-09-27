import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translateService = inject(TranslateService);
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  
  // Supported languages for FreshCart
  readonly supportedLanguages = [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' }
  ] as const;

  constructor() {
    this.initializeTranslations();
  }

  /**
   * Initialize translations and set default language
   */
  private initializeTranslations(): void {
    // Set supported languages
    this.translateService.addLangs(this.supportedLanguages.map(lang => lang.code));
    
    // Set default language
    this.translateService.setDefaultLang('en');
    
    // Detect browser language or use default
    const browserLang = this.translateService.getBrowserLang();
    const defaultLang = browserLang && this.supportedLanguages.some(lang => lang.code === browserLang) 
      ? browserLang 
      : 'en';
    
    this.setLanguage(defaultLang);
  }

  /**
   * Set the active language
   */
  setLanguage(langCode: string): void {
    if (this.supportedLanguages.some(lang => lang.code === langCode)) {
      this.translateService.use(langCode);
      this.currentLanguageSubject.next(langCode);
      
      // Update document direction for RTL support
      const language = this.supportedLanguages.find(lang => lang.code === langCode);
      if (language) {
        document.documentElement.dir = language.direction;
        document.documentElement.lang = langCode;
      }
    }
  }

  /**
   * Get current language as observable
   */
  getCurrentLanguage(): Observable<string> {
    return this.currentLanguageSubject.asObservable();
  }

  /**
   * Get current language code
   */
  getCurrentLanguageCode(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Toggle between English and Arabic
   */
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguageCode();
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  /**
   * Get translation for a key
   */
  translate(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  /**
   * Get instant translation for a key
   */
  instant(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    const currentLang = this.getCurrentLanguageCode();
    const language = this.supportedLanguages.find(lang => lang.code === currentLang);
    return language?.direction === 'rtl';
  }
}
