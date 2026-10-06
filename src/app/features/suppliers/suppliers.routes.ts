import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Proveedores' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/suppliers-list/suppliers-list').then(m => m.SuppliersList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/suppliers-form/suppliers-form').then(m => m.SuppliersForm),
        data: { breadcrumb: 'Registrar Nuevo Proveedor' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/suppliers-details/suppliers-details').then(m => m.SuppliersDetails),
        data: { breadcrumb: 'Detalle del Proveedor' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/suppliers-form/suppliers-form').then(m => m.SuppliersForm),
        data: { breadcrumb: 'Editar Proveedor' }
      },
    ]
  }
] as Routes;
