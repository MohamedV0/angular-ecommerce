import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  // Cart main page - Show cart items
  {
    path: '',
    loadComponent: () => import('./components/cart-page/cart-page').then(c => c.CartPage),
    title: 'Shopping Cart - FreshCart'
  },
  // Cart checkout page (future implementation)
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout-page/checkout-page').then(c => c.CheckoutPage),
    title: 'Checkout - FreshCart'
  }
];
