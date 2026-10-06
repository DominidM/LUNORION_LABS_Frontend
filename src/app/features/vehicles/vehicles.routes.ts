import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Vehículos' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/vehicles-list/vehicles-list').then(m => m.VehiclesList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/vehicles-form/vehicles-form').then(m => m.VehiclesForm),
        data: { breadcrumb: 'Registrar Nuevo Vehículo' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/vehicles-details/vehicles-details').then(m => m.VehiclesDetails),
        data: { breadcrumb: 'Detalle del Vehículo' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/vehicles-form/vehicles-form').then(m => m.VehiclesForm),
        data: { breadcrumb: 'Editar Vehículo' }
      },
    ]
  }
] as Routes;
