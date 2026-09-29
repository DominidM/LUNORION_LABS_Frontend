import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { DataTable } from '../../../../shared/ui/layout/data-table/data-table';
import { TableColumn } from '../../../../shared/ui/layout/data-table/data-table.interface';
import { ConfirmationDialog } from '../../../../shared/ui/layout/confirmation-dialog/confirmation-dialog';
import { ClientHttpService } from '../../data-access/api/client-http.service';
import { Client } from '../../domain/models/client';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeader,
    DataTable,
    ConfirmationDialog
  ],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList {
  private clientService = inject(ClientHttpService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  clients: Client[] = [];
  filteredClients: Client[] = [];

  searchTerm = '';
  statusFilter = '';

  isLoading = false;
  loadError = false;

  currentPage = 1;
  pageSize = 5;

  showDeactivateDialog = false;
  selectedClient: Client | null = null;
  isDeactivating = false;

  tableColumns: TableColumn[] = [
    { field: 'cliente', header: 'Cliente', width: '28%' },
    { field: 'documento', header: 'Documento', width: '16%' },
    { field: 'telefono', header: 'Teléfono', width: '14%' },
    { field: 'email', header: 'Email', width: '18%' },
    { field: 'vehiculos', header: 'Vehículos', width: '8%', align: 'center' },
    { field: 'estado', header: 'Estado', width: '8%', align: 'center' },
    { field: 'acciones', header: 'Acciones', width: '8%', align: 'center' }
  ];

  constructor() {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.loadError = false;

    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.clients = [];
        this.filteredClients = [];
        this.loadError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredClients = this.clients.filter((client) => {
      const fullName = `${client.nombres} ${client.apellidos}`.toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        client.numeroDocumento.toLowerCase().includes(search) ||
        (client.telefono && client.telefono.toLowerCase().includes(search));

      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'active' && client.activo) ||
        (this.statusFilter === 'inactive' && !client.activo);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  getInitials(nombres: string, apellidos: string): string {
    const parts = `${nombres || ''} ${apellidos || ''}`.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
  }

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClients.slice(start, start + this.pageSize);
  }

  openDeactivateDialog(client: Client): void {
    this.selectedClient = client;
    this.showDeactivateDialog = true;
  }

  closeDeactivateDialog(): void {
    if (this.isDeactivating) return;
    this.showDeactivateDialog = false;
    this.selectedClient = null;
  }

  deactivateClient(): void {
    if (!this.selectedClient || this.isDeactivating) return;

    this.isDeactivating = true;

    this.clientService.deactivate(this.selectedClient.id).subscribe({
      next: () => {
        this.isDeactivating = false;
        this.showDeactivateDialog = false;

        this.clients = this.clients.map((c) =>
          c.id === this.selectedClient?.id ? { ...c, activo: false } : c
        );

        this.selectedClient = null;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDeactivating = false;
        this.cdr.detectChanges();
      }
    });
  }

  activateClient(client: Client): void {
    if (this.isDeactivating) return;

    this.isDeactivating = true;

    this.clientService.activate(client.id).subscribe({
      next: () => {
        this.isDeactivating = false;

        this.clients = this.clients.map((c) =>
          c.id === client.id ? { ...c, activo: true } : c
        );

        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDeactivating = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateClient(): void {
    this.router.navigate(['/dashboard/clients/new']);
  }

  openClientDetails(id: string): void {
    this.router.navigate(['/dashboard/clients', id]);
  }

  openEditClient(id: string): void {
    this.router.navigate(['/dashboard/clients', id, 'edit']);
  }

  exportToPdf(): void {
    console.log('Exportar a PDF');
  }

  exportToXml(): void {
    console.log('Exportar a XML');
  }
}