import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route - Home feature
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes)
  },
  // Redirect any unknown routes to home
  {
    path: '**',
    redirectTo: ''
  }
];
