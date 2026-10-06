import { Injectable, signal } from '@angular/core';
import { SidebarItem } from '../../shared/ui/layout/sidebar/sidebar-item.interface';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  readonly menuItems = signal<SidebarItem[]>([
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard/home' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/dashboard/clients' },
    { label: 'Vehículos', icon: 'pi pi-car', route: '/dashboard/vehicles' },
    { label: 'Órdenes de Trabajo', icon: 'pi pi-file-edit', route: '/dashboard/work-orders' },
    { label: 'Inventario', icon: 'pi pi-box', route: '/dashboard/inventory' },
    { label: 'Citas', icon: 'pi pi-calendar', route: '/dashboard/appointments' },
    { label: 'Empleados', icon: 'pi pi-user', route: '/dashboard/employees' },
    { label: 'Proveedores', icon: 'pi pi-truck', route: '/dashboard/suppliers' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/dashboard/reports' },
    { label: 'Reclamos', icon: 'pi pi-exclamation-triangle', route: '/dashboard/claims' },
    { label: 'Ajustes', icon: 'pi pi-cog', route: '/dashboard/settings' },
  ]);
}
