import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route - Home feature
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes)
  },
  // Authentication routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  // Products feature routes - Pure Products Domain
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes)
  },
  // Redirect any unknown routes to home
  {
    path: '**',
    redirectTo: ''
  }
];
