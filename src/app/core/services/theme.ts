import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { StorageService } from './storage';

/**
 * Theme Types
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme Service
 * Manages dark/light theme toggling for PrimeNG
 * Following official PrimeNG documentation best practices
 * 
 * Reference: https://primeng.org/theming
 * PrimeNG uses class-based system: .p-dark class on document.documentElement
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly DARK_MODE_CLASS = 'p-dark';

  // Current theme mode signal
  readonly currentTheme = signal<ThemeMode>('light');

  // Computed helper for dark mode check
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Initialize theme from storage or system preference
    this.initializeTheme();

    // Apply theme whenever it changes
    const effectRef = effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });

    // Explicit cleanup following Angular best practices for service-level effects
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    // Try to get saved theme from storage
    const savedTheme = this.storage.getTheme() as ThemeMode | null;
    
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Apply theme by adding/removing .p-dark class on documentElement
   * Following PrimeNG official documentation
   */
  private applyTheme(theme: ThemeMode): void {
    const element = document.documentElement;
    
    if (theme === 'dark') {
      element.classList.add(this.DARK_MODE_CLASS);
    } else {
      element.classList.remove(this.DARK_MODE_CLASS);
    }

    // Only write to storage if theme changed (optimization)
    const storedTheme = this.storage.getTheme() as ThemeMode | null;
    if (storedTheme !== theme) {
      this.storage.setTheme(theme);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: ThemeMode = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  /**
   * Get current theme mode
   */
  getTheme(): ThemeMode {
    return this.currentTheme();
  }
}
