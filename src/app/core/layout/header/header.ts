import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Subscription, combineLatest } from 'rxjs';
import { I18nService } from '../../services/i18n';
import { AuthService } from '../../../features/auth/services/auth';
import { CartStore } from '../../../features/cart/store/cart.store';
import { WishlistStore } from '../../../features/wishlist/store/wishlist.store';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, BadgeModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  protected readonly i18nService = inject(I18nService);
  private readonly translateService = inject(TranslateService);
  protected readonly authService = inject(AuthService);
  protected readonly cartStore = inject(CartStore);
  protected readonly wishlistStore = inject(WishlistStore);
  private translationSubscription?: Subscription;
  private authSubscription?: Subscription;
  
  // ✅ MINIMAL CHANGE: Only the parts that need reactivity
  // Store translations in a signal for reactive menu items
  private readonly translationStrings = signal({
    home: '',
    products: '',
    categories: '',
    brands: '',
    cart: '',
    wishlist: ''
  });
  
  // ✅ BEST PRACTICE: Computed signal for menu items
  // This automatically updates when cart badge OR wishlist badge OR translations change
  readonly menuItems = computed<MenuItem[]>(() => {
    const t = this.translationStrings();
    const cartBadge = this.cartStore.badgeCount(); // 👈 Reactive cart count!
    const wishlistBadge = this.wishlistStore.badgeCount(); // 👈 Reactive wishlist count!
    
    return [
      {
        label: t.home,
        icon: PrimeIcons.HOME,
        routerLink: '/'
      },
      {
        label: t.products,
        icon: PrimeIcons.SHOPPING_BAG,
        routerLink: '/products'
      },
      {
        label: t.categories,
        icon: PrimeIcons.LIST,
        routerLink: '/categories'
      },
      {
        label: t.brands,
        icon: PrimeIcons.BOOKMARK,
        routerLink: '/brands'
      },
      {
        label: t.wishlist,
        icon: PrimeIcons.HEART,
        routerLink: '/wishlist',
        badge: wishlistBadge // 👈 Updates automatically when wishlist changes!
      },
      {
        label: t.cart,
        icon: PrimeIcons.SHOPPING_CART,
        routerLink: '/cart',
        badge: cartBadge // 👈 Updates automatically when cart changes!
      }
    ];
  });

  ngOnInit(): void {
    // Watch for authentication changes and update cart & wishlist accordingly
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.cartStore.onAuthenticationChange(isAuthenticated);
      this.wishlistStore.onAuthenticationChange(isAuthenticated);
    });
    
    // ✅ Keep translation observable - it works fine and changes rarely
    // Only update the signal when translations change
    this.translationSubscription = combineLatest([
      this.translateService.stream('NAVIGATION.HOME'),
      this.translateService.stream('NAVIGATION.PRODUCTS'),
      this.translateService.stream('NAVIGATION.CATEGORIES'),
      this.translateService.stream('NAVIGATION.BRANDS'),
      this.translateService.stream('NAVIGATION.CART'),
      this.translateService.stream('NAVIGATION.WISHLIST')
    ]).subscribe(([home, products, categories, brands, cart, wishlist]) => {
      // Update translation signal - menuItems computed will auto-update
      this.translationStrings.set({ home, products, categories, brands, cart, wishlist });
    });
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }

  getCurrentLanguage(): string {
    return this.i18nService.getCurrentLanguageCode();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Get current user name for display
   */
  getCurrentUserName(): string | null {
    return this.authService.getCurrentUserName();
  }

  /**
   * Handle user logout
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.authService.navigateToLogin();
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    this.authService.navigateToRegister();
  }

  /**
   * Get cart summary for template (if needed elsewhere)
   */
  getCartSummary() {
    return this.cartStore.summary();
  }
}