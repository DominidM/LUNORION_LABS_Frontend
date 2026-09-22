import { Observable } from 'rxjs';
import { Client } from '../models/client';

export interface ClientRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
}

export abstract class ClientRepository {
  abstract getAll(): Observable<Client[]>;
  abstract getById(id: string): Observable<Client>;
  abstract create(client: ClientRequest): Observable<Client>;
  abstract update(id: string, client: ClientRequest): Observable<Client>;
  abstract deactivate(id: string): Observable<void>;
  abstract activate(id: string): Observable<void>;
}