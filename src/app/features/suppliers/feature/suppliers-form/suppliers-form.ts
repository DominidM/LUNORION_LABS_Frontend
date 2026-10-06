import { Component, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { FormCard } from '../../../../shared/ui/layout/form-card/form-card';

import { SupplierStore } from '../../data-access/state/supplier.store';
import { SupplierHttpService } from '../../data-access/api/supplier-http.service';
import { SupplierRepository } from '../../domain/ports/supplier-repository';
import { TenantService } from '../../../../core/tenant/tenant.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeader, FormCard],
  providers: [
    { provide: SupplierRepository, useClass: SupplierHttpService }
  ],
  templateUrl: './suppliers-form.html',
  styleUrls: ['./suppliers-form.scss']
})
export class SuppliersForm implements OnInit {
  readonly store = inject(SupplierStore);
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(SupplierRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tenantService = inject(TenantService);

  readonly isEdit = this.route.snapshot.paramMap.has('id');
  readonly supplierId = this.route.snapshot.paramMap.get('id');
  readonly tenantId = signal<string | null>(null);
  readonly tenantLoading = signal(true);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    ruc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(200)]],
    contacto: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', [Validators.required, Validators.maxLength(300)]],
    condicionesPago: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    const tid = this.tenantService.getTenantId();
    this.tenantId.set(tid);
    this.tenantLoading.set(false);

    if (!tid) {
      this.store.setError('No se pudo obtener el tenant. Por favor, cierra sesión y vuelve a iniciar.');
    }

    if (this.isEdit && this.supplierId) {
      this.loadSupplier(this.supplierId);
    }
  }

  loadSupplier(id: string): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.repository.getById(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (supplier) => {
        this.form.patchValue(supplier);
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.setLoading(false);
        this.store.setError(err.error?.message || 'No se pudo cargar la información del proveedor.');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    const currentTenantId = this.tenantId();
    if (!currentTenantId) {
      this.store.setError('No se pudo obtener el tenant. Por favor, cierra sesión y vuelve a iniciar.');
      return;
    }

    this.isSubmitting.set(true);
    this.store.setLoading(true);
    this.store.setError(null);

    const supplierData = {
      ...this.form.getRawValue(),
      tenantId: currentTenantId
    } as Omit<import('../../domain/models/supplier').Supplier, 'id' | 'activo'>;

    if (this.isEdit && this.supplierId) {
      this.isSubmitting.set(false);
      this.store.setLoading(false);
      this.store.setError('La edición no está soportada por el backend actual');
      return;
    }

    this.repository.create(supplierData).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.store.setLoading(false);
        this.router.navigate(['/dashboard/suppliers']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.store.setLoading(false);
        this.store.setError(err.error?.message || err.error?.error || 'No se pudo guardar el proveedor. Verifica los datos.');
      }
    });
  }

  onCancel(): void {
    if (this.isSubmitting()) return;
    this.router.navigate(['/dashboard/suppliers']);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.hasError('maxlength')) return `No puede superar los ${control.errors['maxlength'].requiredLength} caracteres.`;
    if (control.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (control.hasError('pattern')) {
      if (field === 'ruc') return 'El RUC debe tener exactamente 11 números.';
      return 'El valor ingresado no es válido.';
    }
    return 'El valor ingresado no es válido.';
  }
}
