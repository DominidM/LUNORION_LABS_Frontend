import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/ui/layout/page-header/page-header';
import { ClientHttpService, ClientProfitability, WorkHistory } from '../../data-access/api/client-http.service';
import { Client } from '../../domain/models/client';

@Component({
  selector: 'app-clients-details',
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './clients-details.html',
  styleUrl: './clients-details.scss'
})
export class ClientsDetails implements OnInit {
  private clientService = inject(ClientHttpService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  client: Client | null = null;
  profitability: ClientProfitability | null = null;
  workHistory: WorkHistory[] = [];

  isLoading = true;
  loadError = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadClient(id);
    } else {
      this.isLoading = false;
      this.loadError = true;
    }
  }

  loadClient(id: string): void {
    this.isLoading = true;
    this.loadError = false;

    this.clientService.getById(id).subscribe({
      next: client => {
        this.client = client;
        this.loadProfitability(id);
        this.loadWorkHistory(id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.client = null;
        this.isLoading = false;
        this.loadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadProfitability(id: string): void {
    this.clientService.getProfitability(id).subscribe({
      next: profitability => {
        this.profitability = profitability;
        this.cdr.detectChanges();
      },
      error: () => {
        this.profitability = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadWorkHistory(id: string): void {
    this.clientService.getWorkHistory(id).subscribe({
      next: history => {
        this.workHistory = history;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.workHistory = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get fullName(): string {
    if (!this.client) return '';
    return `${this.client.nombres} ${this.client.apellidos}`.trim();
  }

  get initials(): string {
    if (!this.client) return '';
    const names = `${this.client.nombres} ${this.client.apellidos}`
      .trim()
      .split(/\s+/);

    return names
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  getWorkStatusClass(status: string): string {
    const normalizedStatus = (status || '').toLowerCase();

    if (
      normalizedStatus.includes('complet') ||
      normalizedStatus.includes('final') ||
      normalizedStatus.includes('entreg')
    ) {
      return 'status-success';
    }

    if (
      normalizedStatus.includes('pend') ||
      normalizedStatus.includes('esper')
    ) {
      return 'status-warning';
    }

    if (
      normalizedStatus.includes('cancel') ||
      normalizedStatus.includes('rechaz')
    ) {
      return 'status-error';
    }

    return 'status-info';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/clients']);
  }

  editClient(): void {
    if (!this.client) return;
    this.router.navigate(['/dashboard/clients', this.client.id, 'edit']);
  }

  exportDetailToXml(): void {
    if (!this.client) return;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<fichaCliente>\n';
    xml += `  <id>${this.client.id}</id>\n`;
    xml += `  <nombres><![CDATA[${this.client.nombres}]]></nombres>\n`;
    xml += `  <apellidos><![CDATA[${this.client.apellidos}]]></apellidos>\n`;
    xml += `  <documento>${this.client.tipoDocumento} ${this.client.numeroDocumento}</documento>\n`;
    xml += `  <telefono>${this.client.telefono || ''}</telefono>\n`;
    xml += `  <email>${this.client.email || ''}</email>\n`;
    xml += `  <direccion><![CDATA[${this.client.direccion || ''}]]></direccion>\n`;
    xml += `  <razonSocial><![CDATA[${this.client.razonSocial || ''}]]></razonSocial>\n`;
    xml += `  <estado>${this.client.activo ? 'ACTIVO' : 'INACTIVO'}</estado>\n`;
    
    if (this.profitability) {
      xml += '  <rentabilidad>\n';
      xml += `    <totalFacturado>${this.profitability.totalFacturado}</totalFacturado>\n`;
      xml += `    <totalCostos>${this.profitability.totalCostos}</totalCostos>\n`;
      xml += `    <margen>${this.profitability.margen}</margen>\n`;
      xml += `    <ordenesCompletadas>${this.profitability.ordenesCompletadas}</ordenesCompletadas>\n`;
      xml += '  </rentabilidad>\n';
    }

    xml += '  <historialTrabajos>\n';
    this.workHistory.forEach(w => {
      xml += '    <trabajo>\n';
      xml += `      <orden>${w.ordenTrabajoId}</orden>\n`;
      xml += `      <descripcion><![CDATA[${w.descripcion}]]></descripcion>\n`;
      xml += `      <estado>${w.estado}</estado>\n`;
      xml += `      <fecha>${w.fechaCreacion}</fecha>\n`;
      xml += '    </trabajo>\n';
    });
    xml += '  </historialTrabajos>\n';
    xml += '</fichaCliente>';

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    this.downloadFile(blob, `ficha_cliente_${this.client.numeroDocumento}.xml`);
  }

  exportDetailToPdf(): void {
    if (!this.client) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const historyRows = this.workHistory.map(w => `
      <tr>
        <td>${w.ordenTrabajoId}</td>
        <td>${w.descripcion || '-'}</td>
        <td>${w.estado}</td>
        <td>${this.formatDate(w.fechaCreacion)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha de Cliente - ${this.fullName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 32px; color: #1c1b20; }
            h1 { color: #4f388a; margin-bottom: 4px; font-size: 22px; }
            h2 { color: #1c1b20; border-bottom: 2px solid #e6e1e9; padding-bottom: 6px; margin-top: 24px; font-size: 16px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-top: 12px; }
            .info-item strong { color: #494551; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
            th { background: #f7f2fa; border-bottom: 2px solid #cbc4d2; padding: 8px; text-align: left; }
            td { border-bottom: 1px solid #e6e1e9; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>LUNORION LABS - Ficha del Cliente</h1>
          <p style="color: #7a7582; font-size: 12px;">Generado el ${new Date().toLocaleString('es-PE')}</p>
          
          <h2>Datos Generales</h2>
          <div class="info-grid">
            <div class="info-item"><strong>Cliente:</strong> ${this.fullName}</div>
            <div class="info-item"><strong>Documento:</strong> ${this.client.tipoDocumento} ${this.client.numeroDocumento}</div>
            <div class="info-item"><strong>Teléfono:</strong> ${this.client.telefono || '-'}</div>
            <div class="info-item"><strong>Correo:</strong> ${this.client.email || '-'}</div>
            <div class="info-item"><strong>Dirección:</strong> ${this.client.direccion || '-'}</div>
            <div class="info-item"><strong>Razón Social:</strong> ${this.client.razonSocial || '-'}</div>
            <div class="info-item"><strong>Estado:</strong> ${this.client.activo ? 'ACTIVO' : 'INACTIVO'}</div>
          </div>

          <h2>Historial de Órdenes y Trabajos</h2>
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows || '<tr><td colspan="4" style="text-align:center;">Sin trabajos registrados</td></tr>'}
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
  
}