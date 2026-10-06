import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Empleados' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/employees-list/employees-list').then(m => m.EmployeesList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/employees-form/employees-form').then(m => m.EmployeesForm),
        data: { breadcrumb: 'Registrar Nuevo Empleado' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/employees-details/employees-details').then(m => m.EmployeesDetails),
        data: { breadcrumb: 'Detalle del Empleado' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/employees-form/employees-form').then(m => m.EmployeesForm),
        data: { breadcrumb: 'Editar Empleado' }
      },
    ]
  }
] as Routes;
