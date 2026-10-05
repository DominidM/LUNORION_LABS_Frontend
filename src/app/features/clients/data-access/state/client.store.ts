import { Injectable, signal, computed } from '@angular/core';
import { Client } from '../../domain/models/client';

@Injectable({ providedIn: 'root' })
export class ClientStore {
  readonly clients = signal<Client[]>([]);
  readonly selectedClient = signal<Client | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalClients = computed(() => this.clients().length);
  readonly activeClients = computed(() => this.clients().filter(c => c.activo));

  setClients(clients: Client[]): void {
    this.clients.set(clients);
  }

  setSelectedClient(client: Client | null): void {
    this.selectedClient.set(client);
  }

  setLoading(value: boolean): void {
    this.loading.set(value);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  addClient(newClient: Client): void {
    this.clients.update(list => [newClient, ...list]);
  }

  updateClient(updatedClient: Client): void {
    this.clients.update(list =>
      list.map(c => (c.id === updatedClient.id ? updatedClient : c))
    );
    if (this.selectedClient()?.id === updatedClient.id) {
      this.selectedClient.set(updatedClient);
    }
  }

  updateClientStatus(id: string, activo: boolean): void {
    this.clients.update(list =>
      list.map(c => (c.id === id ? { ...c, activo } : c))
    );
  }
}