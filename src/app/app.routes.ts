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
  // Categories feature routes - Pure Categories Domain
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.categoriesRoutes)
  },
  // Brands feature routes - Pure Brands Domain
  {
    path: 'brands',
    loadChildren: () => import('./features/brands/brands.routes').then(m => m.brandsRoutes)
  },
  // Redirect any unknown routes to home
  {
    path: '**',
    redirectTo: ''
  }
];
