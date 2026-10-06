import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { DataTable } from '../../../../shared/ui/layout/data-table/data-table';
import { TableColumn } from '../../../../shared/ui/layout/data-table/data-table.interface';
import { ConfirmationDialog } from '../../../../shared/ui/layout/confirmation-dialog/confirmation-dialog';
import { FilterBar } from '../../../../shared/ui/layout/filter-bar/filter-bar';
import { ListPage } from '../../../../shared/ui/layout/list-page/list-page';

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
export class SuppliersList extends ListPage<Supplier> implements OnInit {
  readonly store = inject(SupplierStore);
  private readonly repository = inject(SupplierRepository);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tableColumns: TableColumn[] = [
    { field: 'razonSocial', header: 'Proveedor', width: '26%' },
    { field: 'ruc', header: 'RUC', width: '12%' },
    { field: 'email', header: 'Email', width: '20%' },
    { field: 'telefono', header: 'TelÃ©fono', width: '13%' },
    { field: 'estado', header: 'Estado', width: '12%', align: 'center' },
    { field: 'acciones', header: 'Acciones', width: '17%', align: 'center' },
  ];

  ngOnInit(): void {
    this.refresh();
  }

  protected override refresh(): void {
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

  onNew(): void {
    this.router.navigate(['/dashboard/suppliers/new']);
  }

  onView(id: string): void {
    this.router.navigate(['/dashboard/suppliers', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/dashboard/suppliers', id, 'edit']);
  }

  protected override performDeactivate(supplier: Supplier): void {
    this.repository.deactivate(supplier.id).subscribe({
      next: () => {
        this.finishDeactivate();
        this.refresh();
      },
      error: (err) => {
        this.finishDeactivate();
        this.store.setError(err.error?.message || 'Error al desactivar proveedor');
        this.cdr.detectChanges();
      },
    });
  }
}
