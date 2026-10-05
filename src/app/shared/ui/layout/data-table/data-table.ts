import { Component, EventEmitter, Input, Output, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from './data-table.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) data: any[] = [];
  @Input() totalRecords = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() isLoading = false;

  @Output() pageChange = new EventEmitter<number>();

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any>;

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }

  get pages(): number[] {
    const pagesArray: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  get fromRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get toRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}