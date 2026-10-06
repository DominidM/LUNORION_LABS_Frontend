import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./feature/reports-list/reports-list').then(m => m.ReportsList),
    data: { breadcrumb: 'Reportes' }
  },
] as Routes;
