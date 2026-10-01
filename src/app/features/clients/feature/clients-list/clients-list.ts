import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { DataTable } from '../../../../shared/ui/layout/data-table/data-table';
import { TableColumn } from '../../../../shared/ui/layout/data-table/data-table.interface';
import { ConfirmationDialog } from '../../../../shared/ui/layout/confirmation-dialog/confirmation-dialog';
import { FilterBar } from '../../../../shared/ui/layout/filter-bar/filter-bar';
import { FilterState } from '../../../../shared/ui/layout/filter-bar/filter-bar.interface';

import { ClientHttpService } from '../../data-access/api/client-http.service';
import { Client } from '../../domain/models/client';
import { ClientStore } from '../../data-access/state/client.store';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    ConfirmationDialog,
    FilterBar
  ],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit {
  private clientService = inject(ClientHttpService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private clientStore = inject(ClientStore);

  clients: Client[] = [];
  filteredClients: Client[] = [];
  currentFilters: FilterState = {
    search: '',
    status: '',
    documentType: ''
  };

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

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.loadError = false;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        const mapped = (clients as any[]).map(c => ({
          ...c,
          activo: c.activo !== undefined ? c.activo : c.active
        }));

        this.clients = [...mapped].reverse();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.clients = [];
        this.filteredClients = [];
        this.loadError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(filters: FilterState): void {
    this.currentFilters = filters;
    this.applyFilters();
  }

    applyFilters(): void {
    const search = (this.currentFilters.search || '').trim().toLowerCase();
    const status = this.currentFilters.status;
    const docType = this.currentFilters.documentType;
    const result = this.clients.filter((client) => {
      const fullName = `${client.nombres} ${client.apellidos}`.toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        client.numeroDocumento.toLowerCase().includes(search) ||
        (client.telefono && client.telefono.toLowerCase().includes(search));

      const matchesStatus =
        !status ||
        (status === 'active' && client.activo) ||
        (status === 'inactive' && !client.activo);

      const matchesDocType = !docType || client.tipoDocumento === docType;

      return matchesSearch && matchesStatus && matchesDocType;
    });
    const hasDate = result.some((c: any) => c.createdAt || c.fechaCreacion);

    if (hasDate) {
      this.filteredClients = result.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.fechaCreacion || 0).getTime();
        const dateB = new Date(b.createdAt || b.fechaCreacion || 0).getTime();
        return dateB - dateA;
      });
    } else {
      this.filteredClients = result;
    }

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

    const clientId = this.selectedClient.id;
    this.isDeactivating = true;

    this.clientService.deactivate(clientId).subscribe({
      next: () => {
        this.updateLocalClientStatus(clientId, false);
        this.clientStore.updateClientStatus(clientId, false);
        this.isDeactivating = false;
        this.showDeactivateDialog = false;
        this.selectedClient = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al desactivar cliente:', err);
        this.isDeactivating = false;
        this.showDeactivateDialog = false;
        this.selectedClient = null;
        this.cdr.detectChanges();
      }
    });
  }

  activateClient(client: Client): void {
    if (this.isDeactivating) return;
    const clientId = client.id;
    this.isDeactivating = true;

    this.clientService.activate(clientId).subscribe({
      next: () => {
        this.updateLocalClientStatus(clientId, true);
        this.clientStore.updateClientStatus(clientId, true);
        this.isDeactivating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al activar cliente:', err);
        this.isDeactivating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private updateLocalClientStatus(id: string, activo: boolean): void {
    this.clients = this.clients.map(c => (c.id === id ? { ...c, activo } : c));
    this.applyFilters();
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

  exportToXml(): void {
    const data = this.filteredClients;
    if (!data || data.length === 0) return;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<clientes>\n';
    data.forEach(client => {
      const vehiculosCount = (client as unknown as { totalVehiculos?: number })?.totalVehiculos ?? 0;
      xml += '  <cliente>\n';
      xml += `    <id>${client.id}</id>\n`;
      xml += `    <nombres><![CDATA[${client.nombres}]]></nombres>\n`;
      xml += `    <apellidos><![CDATA[${client.apellidos}]]></apellidos>\n`;
      xml += `    <razonSocial><![CDATA[${client.razonSocial || ''}]]></razonSocial>\n`;
      xml += `    <tipoDocumento>${client.tipoDocumento}</tipoDocumento>\n`;
      xml += `    <numeroDocumento>${client.numeroDocumento}</numeroDocumento>\n`;
      xml += `    <telefono>${client.telefono || ''}</telefono>\n`;
      xml += `    <email>${client.email || ''}</email>\n`;
      xml += `    <vehiculos>${vehiculosCount}</vehiculos>\n`;
      xml += `    <estado>${client.activo ? 'ACTIVO' : 'INACTIVO'}</estado>\n`;
      xml += '  </cliente>\n';
    });
    xml += '</clientes>';

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    this.downloadFile(blob, `reporte_clientes_${this.getTimestamp()}.xml`);
  }

  exportToPdf(): void {
    const data = this.filteredClients;
    if (!data || data.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = data.map(c => {
      const vehiculosCount = (c as unknown as { totalVehiculos?: number })?.totalVehiculos ?? 0;
      return `
        <tr>
          <td>${c.nombres} ${c.apellidos}</td>
          <td>${c.tipoDocumento} ${c.numeroDocumento}</td>
          <td>${c.telefono || '-'}</td>
          <td>${c.email || '-'}</td>
          <td style="text-align:center;">${vehiculosCount}</td>
          <td style="text-align:center;">${c.activo ? 'Activo' : 'Inactivo'}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Clientes - LUNORION LABS</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #1c1b20; }
            h2 { margin-bottom: 4px; color: #4f388a; }
            p { margin-top: 0; font-size: 13px; color: #494551; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th { background: #f7f2fa; border-bottom: 2px solid #cbc4d2; padding: 10px; text-align: left; }
            td { border-bottom: 1px solid #e6e1e9; padding: 10px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Reporte de Clientes</h2>
          <p>Generado el: ${new Date().toLocaleString('es-PE')} | Total registros: ${data.length}</p>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th style="text-align:center;">Vehículos</th>
                <th style="text-align:center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private getTimestamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}