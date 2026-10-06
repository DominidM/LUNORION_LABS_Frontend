import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { FormCard } from '../../../../shared/ui/layout/form-card/form-card';
import { ClientHttpService } from '../../data-access/api/client-http.service';
import { ClientRequest } from '../../domain/ports/client-repository';
import { ClientStore } from '../../data-access/state/client.store';

@Component({
  selector: 'app-clients-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeader,
    FormCard
  ],
  templateUrl: './clients-form.html',
  styleUrl: './clients-form.scss'
})
export class ClientsForm implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientHttpService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientStore = inject(ClientStore);

  isEditMode = false;
  clientId = '';
  isSaving = false;
  saveError = '';

  clientForm = this.fb.group({
    nombres: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.onlyLettersValidator
      ]
    ],
    apellidos: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.onlyLettersValidator
      ]
    ],
    tipoDocumento: ['DNI', Validators.required],
    numeroDocumento: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/)
      ]
    ],
    razonSocial: ['', [Validators.maxLength(150)]],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],
    telefono: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{9}$/)
      ]
    ],
    direccion: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]
    ]
  });

  constructor() {
    this.clientForm.get('tipoDocumento')?.valueChanges.subscribe(() => {
      this.updateDocumentValidation();
    });
    this.updateDocumentValidation();
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.clientId) {
      this.isEditMode = true;
      this.loadClient();
    }
  }

  private loadClient(): void {
    this.saveError = '';

    this.clientService.getById(this.clientId).subscribe({
      next: client => {
        this.clientForm.patchValue({
          nombres: client.nombres,
          apellidos: client.apellidos,
          tipoDocumento: client.tipoDocumento,
          numeroDocumento: client.numeroDocumento,
          razonSocial: client.razonSocial ?? '',
          direccion: client.direccion,
          telefono: client.telefono,
          email: client.email
        });
        this.updateDocumentValidation();
      },
      error: () => {
        this.saveError = 'No se pudo cargar la información del cliente.';
      }
    });
  }

  private onlyLettersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();
    if (!value) return null;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)
      ? null
      : { onlyLetters: true };
  }

  private updateDocumentValidation(): void {
    const type = this.clientForm.get('tipoDocumento')?.value;
    const control = this.clientForm.get('numeroDocumento');
    if (!control) return;

    control.clearValidators();

    if (type === 'DNI') {
      control.setValidators([Validators.required, Validators.pattern(/^[0-9]{8}$/)]);
    } else if (type === 'RUC') {
      control.setValidators([Validators.required, Validators.pattern(/^[0-9]{11}$/)]);
    } else if (type === 'CE') {
      control.setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ]);
    }

    control.updateValueAndValidity();
  }

  private getTenantIdFromToken(): string | null {
    const token = localStorage.getItem('auth_token') 
      || localStorage.getItem('token') 
      || localStorage.getItem('access_token');

    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      return payload.tenantId || payload.tenant_id || payload.tenant || null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

    private getTenantId(): string {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.tenantId) return user.tenantId;
        if (user.tenant?.id) return user.tenant.id;
      } catch (e) {
        console.warn('Error al parsear usuario de sesión', e);
      }
    }
    const tokenTenant = this.getTenantIdFromToken();
    if (tokenTenant) return tokenTenant;
    return '';
  }

  submitClient(): void {
    if (this.isSaving) return;
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    const tenantId = this.getTenantId();
    if (!tenantId) {
      this.saveError = 'No se encontró la sesión del negocio (Tenant). Por favor, inicia sesión nuevamente.';
      return;
    }
    this.isSaving = true;
    this.saveError = '';
    const formValue = this.clientForm.getRawValue();
    const tipoDoc = formValue.tipoDocumento ?? 'DNI';
    const clientData: ClientRequest = {
      tenantId: tenantId,
      tipoDocumento: tipoDoc,
      numeroDocumento: formValue.numeroDocumento?.trim() ?? '',
      nombres: formValue.nombres?.trim() ?? '',
      apellidos: formValue.apellidos?.trim() ?? '',
      razonSocial: tipoDoc === 'RUC' ? (formValue.razonSocial?.trim() || '') : '',
      direccion: formValue.direccion?.trim() ?? '',
      telefono: formValue.telefono?.trim() ?? '',
      email: formValue.email?.trim() ?? ''
    };
    const request$ = this.isEditMode
      ? this.clientService.update(this.clientId, clientData)
      : this.clientService.create(clientData);
    request$.subscribe({
      next: (savedClient) => {
        if (this.isEditMode) {
          this.clientStore.updateClient(savedClient);
        } else {
          this.clientStore.addClient(savedClient);
        }
        this.isSaving = false;
        this.router.navigate(['/dashboard/clients']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error al guardar/actualizar cliente:', err);

        if (err?.status === 409) {
          this.saveError = 'Ya existe un cliente con ese número de documento.';
        } else if (err?.error?.message) {
          this.saveError = err.error.message;
        } else {
          this.saveError = this.isEditMode
            ? 'No se pudo actualizar el cliente. Verifica los datos.'
            : 'No se pudo registrar el cliente. Verifica que el documento no esté duplicado.';
        }
      }
    });
  }

  cancel(): void {
    if (this.isSaving) return;
    this.router.navigate(['/dashboard/clients']);
  }

  isInvalid(field: string): boolean {
    const control = this.clientForm.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(field: string): string {
    const control = this.clientForm.get(field);
    if (!control?.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.hasError('maxlength')) return `No puede superar los ${control.errors['maxlength'].requiredLength} caracteres.`;
    if (control.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (control.hasError('onlyLetters')) return 'Solo se permiten letras y espacios.';
    if (control.hasError('pattern')) {
      const type = this.clientForm.get('tipoDocumento')?.value;
      if (field === 'numeroDocumento') {
        if (type === 'DNI') return 'El DNI debe tener exactamente 8 números.';
        if (type === 'RUC') return 'El RUC debe tener exactamente 11 números.';
        if (type === 'CE') return 'El CE solo debe contener letras y números.';
      }
      if (field === 'telefono') return 'El teléfono debe tener exactamente 9 números.';
    }
    return 'El valor ingresado no es válido.';
  }
}