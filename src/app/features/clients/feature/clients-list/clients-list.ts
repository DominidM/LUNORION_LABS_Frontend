import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientHttpService } from '../../data-access/api/client-http.service';
import { Client } from '../../domain/models/client';
import { ConfirmationDialog } from '../../../../shared/ui/layout/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [FormsModule, ConfirmationDialog],
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

  loadError = false;

  currentPage = 1;
  pageSize = 5;

  showDeactivateDialog = false;
  selectedClient: Client | null = null;
  isDeactivating = false;

  constructor() {
    this.loadClients();
  }

  loadClients(): void {
    this.loadError = false;

    this.clientService.getAll().subscribe({
      next: clients => {
        this.clients = clients;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.clients = [];
        this.filteredClients = [];
        this.loadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredClients = this.clients.filter(client => {
      const fullName = `${client.nombres} ${client.apellidos}`.toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        client.numeroDocumento.toLowerCase().includes(search) ||
        client.telefono.toLowerCase().includes(search);

      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'active' && client.activo) ||
        (this.statusFilter === 'inactive' && !client.activo);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
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

        this.clients = this.clients.map(client =>
          client.id === this.selectedClient?.id
            ? { ...client, activo: false }
            : client
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

        this.clients = this.clients.map(currentClient =>
          currentClient.id === client.id
            ? { ...currentClient, activo: true }
            : currentClient
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

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClients.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredClients.length / this.pageSize));
  }

  get totalClients(): number {
    return this.clients.length;
  }

  get activeClients(): number {
    return this.clients.filter(client => client.activo).length;
  }

  get inactiveClients(): number {
    return this.clients.filter(client => !client.activo).length;
  }

  get startRecord(): number {
    if (this.filteredClients.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredClients.length
    );
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
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
}