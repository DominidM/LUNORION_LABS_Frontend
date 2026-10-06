import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Clientes' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/clients-list/clients-list').then(m => m.ClientsList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/clients-form/clients-form').then(m => m.ClientsForm),
        data: { breadcrumb: 'Registrar Nuevo Cliente' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/clients-details/clients-details').then(m => m.ClientsDetails),
        data: { breadcrumb: 'Detalle del Cliente' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/clients-form/clients-form').then(m => m.ClientsForm),
        data: { breadcrumb: 'Editar Cliente' }
      }
    ]
  }
] as Routes;