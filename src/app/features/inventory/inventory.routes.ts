import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Inventario' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/inventory-list/inventory-list').then(m => m.InventoryList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/inventory-form/inventory-form').then(m => m.InventoryForm),
        data: { breadcrumb: 'Registrar Artículo' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/inventory-details/inventory-details').then(m => m.InventoryDetails),
        data: { breadcrumb: 'Detalle del Artículo' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/inventory-form/inventory-form').then(m => m.InventoryForm),
        data: { breadcrumb: 'Editar Artículo' }
      },
    ]
  }
] as Routes;
