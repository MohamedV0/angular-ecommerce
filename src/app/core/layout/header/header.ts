import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Subscription, combineLatest } from 'rxjs';
import { I18nService } from '../../services/i18n';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, BadgeModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss' // ✅ External SCSS file following best practices
})
export class Header implements OnInit, OnDestroy {
  protected readonly i18nService = inject(I18nService);
  private readonly translateService = inject(TranslateService);
  private menuSubscription?: Subscription;
  
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    // ✅ OFFICIAL BEST PRACTICE: Use stream() method for reactive translations
    // This handles both initial loading AND language changes automatically
    // Reference: https://ngx-translate.org/v15/reference/translate-service-api
    this.menuSubscription = combineLatest([
      this.translateService.stream('NAVIGATION.HOME'),
      this.translateService.stream('NAVIGATION.PRODUCTS'),
      this.translateService.stream('NAVIGATION.CATEGORIES'),
      this.translateService.stream('NAVIGATION.CART')
    ]).subscribe(([home, products, categories, cart]) => {
      this.menuItems = [
        {
          label: home,
          icon: PrimeIcons.HOME,
          routerLink: '/'
        },
        {
          label: products,
          icon: PrimeIcons.SHOPPING_BAG,
          routerLink: '/products'
        },
        {
          label: categories,
          icon: PrimeIcons.LIST,
          routerLink: '/categories'
        },
        {
          label: cart,
          icon: PrimeIcons.SHOPPING_CART,
          routerLink: '/cart',
          badge: '0' // Will be dynamic based on cart items
        }
      ];
    });
  }

  ngOnDestroy(): void {
    this.menuSubscription?.unsubscribe();
  }

  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }

  getCurrentLanguage(): string {
    return this.i18nService.getCurrentLanguageCode();
  }
}
