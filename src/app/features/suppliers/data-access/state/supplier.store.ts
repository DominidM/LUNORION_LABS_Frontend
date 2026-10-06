import { Injectable, signal } from '@angular/core';
import { Supplier } from '../../domain/models/supplier';

@Injectable({ providedIn: 'root' })
export class SupplierStore {
  readonly suppliers = signal<Supplier[]>([]);
  readonly selectedSupplier = signal<Supplier | null>(null);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  setSuppliers(suppliers: Supplier[]): void {
    this.suppliers.set(suppliers);
  }

  setTotalElements(totalElements: number): void {
    this.totalElements.set(totalElements);
  }

  setSelectedSupplier(supplier: Supplier | null): void {
    this.selectedSupplier.set(supplier);
  }

  setLoading(value: boolean): void {
    this.loading.set(value);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }
}
