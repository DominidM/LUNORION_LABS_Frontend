import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ClientRepository, ClientRequest } from '../../domain/ports/client-repository';
import { Client } from '../../domain/models/client';

export interface ClientProfitability {
  clienteId: string;
  nombreCliente: string;
  totalFacturado: number;
  totalCostos: number;
  margen: number;
  ordenesCompletadas: number;
}

export interface WorkHistory {
  id: string;
  ordenTrabajoId: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
}

@Injectable()
export class ClientHttpService implements ClientRepository {
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: string, client: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  deactivate(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  activate(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activar`, {});
  }

  getProfitability(id: string): Observable<ClientProfitability> {
    return this.http.get<ClientProfitability>(`${this.apiUrl}/${id}/rentabilidad`);
  }

  getWorkHistory(id: string): Observable<WorkHistory[]> {
    return this.http.get<WorkHistory[]>(`${this.apiUrl}/${id}/historial-trabajos`);
  }
}