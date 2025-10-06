import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Subscription, combineLatest } from 'rxjs';
import { I18nService } from '../../services/i18n';
import { ThemeService } from '../../services/theme';
import { AuthService } from '../../../features/auth/services/auth';
import { CartStore } from '../../../features/cart/store/cart.store';
import { WishlistStore } from '../../../features/wishlist/store/wishlist.store';

@Component({
  selector: 'app-header',
  imports: [RouterModule, MenubarModule, ToolbarModule, MenuModule, ButtonModule, DrawerModule, AvatarModule, RippleModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  private readonly i18nService = inject(I18nService);
  private readonly themeService = inject(ThemeService);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  private translationSubscription?: Subscription;
  private authSubscription?: Subscription;
  
  // Mobile drawer visibility
  readonly drawerVisible = signal(false);
  
  // ✅ PERFORMANCE: Expose as signals instead of method wrappers
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUserName = computed(() => this.authService.getCurrentUserName());
  readonly currentLanguage = computed(() => this.i18nService.getCurrentLanguageCode());
  readonly isDarkMode = this.themeService.isDarkMode;
  
  // ✅ MINIMAL CHANGE: Only the parts that need reactivity
  // Store translations in a signal for reactive menu items
  private readonly translationStrings = signal({
    home: '',
    products: '',
    categories: '',
    brands: '',
    cart: '',
    wishlist: '',
    orders: '',
    viewProfile: '',
    addresses: '',
    settings: '',
    logout: ''
  });
  
  // ✅ BEST PRACTICE: Computed signal for menu items
  // This automatically updates when cart badge OR wishlist badge OR translations change
  readonly menuItems = computed<MenuItem[]>(() => {
    const t = this.translationStrings();
    const cartBadge = this.cartStore.badgeCount();
    const wishlistBadge = this.wishlistStore.badgeCount();
    const authenticated = this.isAuthenticated();
    
    const items: MenuItem[] = [
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
        badge: wishlistBadge
      },
      {
        label: t.cart,
        icon: PrimeIcons.SHOPPING_CART,
        routerLink: '/cart',
        badge: cartBadge
      }
    ];
    
    // Add Orders as direct link for authenticated users (outside dropdown)
    if (authenticated) {
      items.push({
        label: t.orders,
        icon: PrimeIcons.BOX,
        routerLink: '/profile/orders'
      });
    }
    
    return items;
  });

  // User dropdown menu items (Profile, Addresses, Settings, Logout)
  // Note: Orders is in main menu, not in dropdown
  readonly userMenuItems = computed<MenuItem[]>(() => {
    const t = this.translationStrings();
    
    return [
      {
        label: t.viewProfile,
        icon: PrimeIcons.USER,
        routerLink: '/profile'
      },
      {
        separator: true
      },
      {
        label: t.addresses,
        icon: PrimeIcons.MAP_MARKER,
        routerLink: '/profile/addresses'
      },
      {
        label: t.settings,
        icon: PrimeIcons.COG,
        routerLink: '/profile/settings'
      },
      {
        separator: true
      },
      {
        label: t.logout,
        icon: PrimeIcons.SIGN_OUT,
        command: () => this.logout()
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
      this.translateService.stream('NAVIGATION.WISHLIST'),
      this.translateService.stream('NAVIGATION.ORDERS'),
      this.translateService.stream('NAVIGATION.VIEW_PROFILE'),
      this.translateService.stream('NAVIGATION.ADDRESSES'),
      this.translateService.stream('NAVIGATION.SETTINGS'),
      this.translateService.stream('NAVIGATION.LOGOUT')
    ]).subscribe(([home, products, categories, brands, cart, wishlist, orders, viewProfile, addresses, settings, logout]) => {
      // Update translation signal - menuItems computed will auto-update
      this.translationStrings.set({ home, products, categories, brands, cart, wishlist, orders, viewProfile, addresses, settings, logout });
    });
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  /**
   * Toggle language between English and Arabic
   */
  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }

  /**
   * Toggle theme between light and dark
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
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
   * Open mobile navigation drawer
   */
  openDrawer(): void {
    this.drawerVisible.set(true);
  }

  /**
   * Close mobile navigation drawer
   */
  closeDrawer(): void {
    this.drawerVisible.set(false);
  }

  /**
   * Handle menu item click in drawer
   */
  handleDrawerMenuItemClick(item: MenuItem): void {
    if (item.command) {
      item.command({ originalEvent: new Event('click'), item });
    }
    this.closeDrawer();
  }
}