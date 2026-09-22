import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientHttpService, ClientProfitability, WorkHistory } from '../../data-access/api/client-http.service';
import { Client } from '../../domain/models/client';

@Component({
  selector: 'app-clients-details',
  standalone: true,
  templateUrl: './clients-details.html',
  styleUrl: './clients-details.scss'
})
export class ClientsDetails {
  private clientService = inject(ClientHttpService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  client: Client | null = null;
  profitability: ClientProfitability | null = null;
  workHistory: WorkHistory[] = [];

  isLoading = true;
  loadError = false;

  constructor() {
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
    const normalizedStatus = status.toLowerCase();

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
}