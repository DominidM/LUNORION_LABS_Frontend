import { Routes } from '@angular/router';

export default [
  {
    path: '',
    data: { breadcrumb: 'Citas' },
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/appointments-list/appointments-list').then(m => m.AppointmentsList),
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        loadComponent: () => import('./feature/appointments-form/appointments-form').then(m => m.AppointmentsForm),
        data: { breadcrumb: 'Registrar Nueva Cita' }
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/appointments-details/appointments-details').then(m => m.AppointmentsDetails),
        data: { breadcrumb: 'Detalle de la Cita' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./feature/appointments-form/appointments-form').then(m => m.AppointmentsForm),
        data: { breadcrumb: 'Editar Cita' }
      },
    ]
  }
] as Routes;
