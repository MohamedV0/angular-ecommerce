import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/orders-page/orders-page').then((m) => m.OrdersPage)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/order-details-page/order-details-page').then(
        (m) => m.OrderDetailsPage
      )
  },
  {
    path: 'addresses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/addresses-page/addresses-page').then(
        (m) => m.AddressesPage
      )
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/settings-page/settings-page').then((m) => m.SettingsPage)
  }
];

