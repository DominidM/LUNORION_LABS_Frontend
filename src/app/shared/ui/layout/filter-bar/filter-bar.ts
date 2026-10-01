import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss'
})
export class FilterBar {
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() searchValue: string = '';
  @Input() statusValue: string = '';
  @Input() docTypeValue: string = '';
  @Input() showDocTypeFilter: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() docTypeChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onStatusChange(value: string): void {
    this.statusChange.emit(value);
  }

  onDocTypeChange(value: string): void {
    this.docTypeChange.emit(value);
  }

  clear(): void {
    this.searchValue = '';
    this.statusValue = '';
    this.docTypeValue = '';
    this.resetFilters.emit();
  }
}