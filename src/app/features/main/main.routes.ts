import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./layout-page/layout-page').then(m => m.LayoutPage),
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('../dashboard/feature/home-page/home-page').then(m => m.HomePage), data: { breadcrumb: 'Dashboard' } },
      { path: 'clients', loadChildren: () => import('../clients/clients.routes') },
      { path: 'vehicles', loadChildren: () => import('../vehicles/vehicles.routes') },
      { path: 'work-orders', loadChildren: () => import('../work-orders/work-orders.routes') },
      { path: 'inventory', loadChildren: () => import('../inventory/inventory.routes') },
      { path: 'appointments', loadChildren: () => import('../appointments/appointments.routes') },
      { path: 'employees', loadChildren: () => import('../employees/employees.routes') },
      { path: 'suppliers', loadChildren: () => import('../suppliers/suppliers.routes') },
      { path: 'reports', loadChildren: () => import('../reports/reports.routes') },
      { path: 'claims', loadChildren: () => import('../claims/claims.routes') },
      { path: 'settings', loadChildren: () => import('../settings/settings.routes') },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
] as Routes;
