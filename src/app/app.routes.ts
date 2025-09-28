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
  // Redirect any unknown routes to home
  {
    path: '**',
    redirectTo: ''
  }
];
