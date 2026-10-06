import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from './breadcrumb-item.interface';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class Breadcrumb {
  private breadcrumbService = inject(BreadcrumbService);

  itemsInput = input<BreadcrumbItem[]>([], { alias: 'items' });

  items() {
    return this.itemsInput().length > 0 
      ? this.itemsInput() 
      : this.breadcrumbService.breadcrumbs();
  }
}