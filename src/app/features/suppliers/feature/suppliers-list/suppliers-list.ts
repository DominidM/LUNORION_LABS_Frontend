import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { DataTable } from '../../../../shared/ui/layout/data-table/data-table';
import { TableColumn } from '../../../../shared/ui/layout/data-table/data-table.interface';
import { ConfirmationDialog } from '../../../../shared/ui/layout/confirmation-dialog/confirmation-dialog';
import { FilterBar } from '../../../../shared/ui/layout/filter-bar/filter-bar';
import { FilterState } from '../../../../shared/ui/layout/filter-bar/filter-bar.interface';

import { SupplierStore } from '../../data-access/state/supplier.store';
import { SupplierHttpService } from '../../data-access/api/supplier-http.service';
import { SupplierRepository } from '../../domain/ports/supplier-repository';
import { Supplier } from '../../domain/models/supplier';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, PageHeader, DataTable, ConfirmationDialog, FilterBar],
  providers: [{ provide: SupplierRepository, useClass: SupplierHttpService }],
  templateUrl: './suppliers-list.html',
  styleUrls: ['./suppliers-list.scss'],
})
export class SuppliersList implements OnInit {
  readonly store = inject(SupplierStore);
  private readonly repository = inject(SupplierRepository);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  currentFilters: FilterState = { search: '', status: '' };
  isLoading = false;
  loadError = false;
  currentPage = 1;
  pageSize = 10;

  showDeactivateDialog = false;
  selectedSupplier: Supplier | null = null;
  isDeactivating = false;

  tableColumns: TableColumn[] = [
    { field: 'razonSocial', header: 'Proveedor', width: '26%' },
    { field: 'ruc', header: 'RUC', width: '12%' },
    { field: 'email', header: 'Email', width: '20%' },
    { field: 'telefono', header: 'Teléfono', width: '13%' },
    { field: 'estado', header: 'Estado', width: '12%', align: 'center' },
    { field: 'acciones', header: 'Acciones', width: '17%', align: 'center' },
  ];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.loadError = false;
    this.store.setLoading(true);
    this.store.setError(null);

    this.repository
      .search({
        page: this.currentPage - 1,
        size: this.pageSize,
        search: (this.currentFilters.search || '').trim() || undefined,
        estado: this.mapStatus(this.currentFilters.status),
      })
      .subscribe({
        next: (page) => {
          this.store.setSuppliers(page.content);
          this.store.setTotalElements(page.totalElements);
          this.isLoading = false;
          this.store.setLoading(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.store.setSuppliers([]);
          this.store.setTotalElements(0);
          this.loadError = true;
          this.isLoading = false;
          this.store.setLoading(false);
          this.store.setError(err.error?.message || 'Error al cargar proveedores');
          this.cdr.detectChanges();
        },
      });
  }

  onFilterChange(filters: FilterState): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.loadSuppliers();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadSuppliers();
  }

  onNew(): void {
    this.router.navigate(['/dashboard/suppliers/new']);
  }

  onView(id: string): void {
    this.router.navigate(['/dashboard/suppliers', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/dashboard/suppliers', id, 'edit']);
  }

  openDeactivateDialog(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.showDeactivateDialog = true;
  }

  closeDeactivateDialog(): void {
    if (this.isDeactivating) return;
    this.showDeactivateDialog = false;
    this.selectedSupplier = null;
  }

  deactivateSupplier(): void {
    if (!this.selectedSupplier || this.isDeactivating) return;

    const supplierId = this.selectedSupplier.id;
    this.isDeactivating = true;

    this.repository.deactivate(supplierId).subscribe({
      next: () => {
        this.isDeactivating = false;
        this.showDeactivateDialog = false;
        this.selectedSupplier = null;
        this.loadSuppliers();
      },
      error: (err) => {
        this.isDeactivating = false;
        this.showDeactivateDialog = false;
        this.selectedSupplier = null;
        this.store.setError(err.error?.message || 'Error al desactivar proveedor');
        this.cdr.detectChanges();
      },
    });
  }

  private mapStatus(status: string): string | undefined {
    if (status === 'active') return 'activo';
    if (status === 'inactive') return 'inactivo';
    return undefined;
  }
}
