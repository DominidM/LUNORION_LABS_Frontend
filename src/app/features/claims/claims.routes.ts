import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Reclamos' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/claims-list/claims-list').then(m => m.ClaimsList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/claims-form/claims-form').then(m => m.ClaimsForm),
        data: { breadcrumb: 'Registrar Nuevo Reclamo' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/claims-details/claims-details').then(m => m.ClaimsDetails),
        data: { breadcrumb: 'Detalle del Reclamo' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/claims-form/claims-form').then(m => m.ClaimsForm),
        data: { breadcrumb: 'Editar Reclamo' }
      },
    ]
  }
] as Routes;
