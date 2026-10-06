import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Órdenes de Trabajo' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/work-orders-list/work-orders-list').then(m => m.WorkOrdersList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/work-orders-form/work-orders-form').then(m => m.WorkOrdersForm),
        data: { breadcrumb: 'Registrar Nueva Orden de Trabajo' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/work-orders-details/work-orders-details').then(m => m.WorkOrdersDetails),
        data: { breadcrumb: 'Detalle de la Orden de Trabajo' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/work-orders-form/work-orders-form').then(m => m.WorkOrdersForm),
        data: { breadcrumb: 'Editar Orden de Trabajo' }
      },
    ]
  }
] as Routes;
