import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  PagedResponse,
  SupplierQuery,
  SupplierRepository,
} from '../../domain/ports/supplier-repository';
import { Supplier } from '../../domain/models/supplier';

@Injectable()
export class SupplierHttpService implements SupplierRepository {
  private readonly apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  search(query: SupplierQuery = {}): Observable<PagedResponse<Supplier>> {
    let params = new HttpParams()
      .set('page', query.page ?? 0)
      .set('size', query.size ?? 10);

    if (query.search) params = params.set('search', query.search);
    if (query.estado) params = params.set('estado', query.estado);
    if (query.tenantId) params = params.set('tenantId', query.tenantId);

    return this.http.get<PagedResponse<Supplier>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  getByTenant(tenantId: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  create(supplier: Omit<Supplier, 'id' | 'activo'>): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  deactivate(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }
}
