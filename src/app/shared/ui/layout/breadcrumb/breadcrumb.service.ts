import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem } from './breadcrumb-item.interface';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const root = this.activatedRoute.root;
        const crumbs: BreadcrumbItem[] = [{ label: 'Inicio', route: '/dashboard' }];
        this.breadcrumbs.set(this.buildBreadcrumbs(root, '', crumbs));
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute | null,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    if (!route) return breadcrumbs;

    const children = route.children;
    if (children.length === 0) return breadcrumbs;

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      const childURL = routeURL !== '' ? `${url}/${routeURL}` : url;

      const label = child.snapshot.data['breadcrumb'];
      if (label && !breadcrumbs.some(b => b.label === label)) {
        breadcrumbs.push({ label, route: childURL });
      }

      this.buildBreadcrumbs(child, childURL, breadcrumbs);
    }

    return breadcrumbs;
  }
}