import { Routes } from '@angular/router';
import { ClientHttpService } from './data-access/api/client-http.service';

export default [
  {
    path: '',
    providers: [ClientHttpService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./feature/clients-list/clients-list')
            .then(m => m.ClientsList)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./feature/clients-form/clients-form')
            .then(m => m.ClientsForm)
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./feature/clients-form/clients-form')
            .then(m => m.ClientsForm)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./feature/clients-details/clients-details')
            .then(m => m.ClientsDetails)
      }
    ]
  }
] as Routes;