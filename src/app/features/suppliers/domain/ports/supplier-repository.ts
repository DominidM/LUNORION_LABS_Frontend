import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier';

export interface SupplierQuery {
  page?: number;
  size?: number;
  search?: string;
  estado?: string;
  tenantId?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export abstract class SupplierRepository {
  abstract search(query?: SupplierQuery): Observable<PagedResponse<Supplier>>;
  abstract getById(id: string): Observable<Supplier>;
  abstract getByTenant(tenantId: string): Observable<Supplier[]>;
  abstract create(supplier: Omit<Supplier, 'id' | 'activo'>): Observable<Supplier>;
  abstract deactivate(id: string): Observable<void>;
}
