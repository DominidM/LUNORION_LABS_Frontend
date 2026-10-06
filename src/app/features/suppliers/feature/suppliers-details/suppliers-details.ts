import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { FormCard } from '../../../../shared/ui/layout/form-card/form-card';

import { SupplierStore } from '../../data-access/state/supplier.store';
import { SupplierHttpService } from '../../data-access/api/supplier-http.service';
import { SupplierRepository } from '../../domain/ports/supplier-repository';

@Component({
  selector: 'app-suppliers-details',
  standalone: true,
  imports: [CommonModule, PageHeader, FormCard],
  providers: [{ provide: SupplierRepository, useClass: SupplierHttpService }],
  templateUrl: './suppliers-details.html',
  styleUrls: ['./suppliers-details.scss'],
})
export class SuppliersDetails implements OnInit {
  readonly store = inject(SupplierStore);
  private readonly repository = inject(SupplierRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadSupplier(id);
    } else {
      this.store.setLoading(false);
      this.store.setError('No se pudo identificar el proveedor.');
    }
  }

  private loadSupplier(id: string): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.repository.getById(id).subscribe({
      next: (supplier) => {
        this.store.setSelectedSupplier(supplier);
        this.store.setLoading(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.store.setSelectedSupplier(null);
        this.store.setLoading(false);
        this.store.setError(err.error?.message || 'No se pudo cargar el proveedor.');
        this.cdr.detectChanges();
      },
    });
  }

  get supplier() {
    return this.store.selectedSupplier();
  }

  get initials(): string {
    const name = (this.supplier?.razonSocial ?? '').trim();
    if (!name) return '';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/suppliers']);
  }

  editSupplier(): void {
    if (!this.supplier) return;
    this.router.navigate(['/dashboard/suppliers', this.supplier.id, 'edit']);
  }
}
