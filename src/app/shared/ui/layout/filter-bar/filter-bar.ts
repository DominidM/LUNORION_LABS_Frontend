import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterState, SelectOption } from './filter-bar.interface';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss'
})
export class FilterBar {
  @Input() searchPlaceholder: string = 'Buscar por nombre, documento o teléfono...';
  @Input() showStatusFilter: boolean = true;
  @Input() showDateFilters: boolean = false;
  @Input() showDocumentTypeFilter: boolean = false;
  @Input() statusOptions: SelectOption[] = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activos', value: 'active' },
    { label: 'Inactivos', value: 'inactive' }
  ];
  @Input() documentTypeOptions: SelectOption[] = [
    { label: 'Todos los documentos', value: '' },
    { label: 'DNI', value: 'DNI' },
    { label: 'RUC', value: 'RUC' },
    { label: 'CE', value: 'CE' }
  ];
  filterState: FilterState = {
    search: '',
    status: '',
    documentType: '',
    startDate: '',
    endDate: ''
  };
  @Output() filterChange = new EventEmitter<FilterState>();
  @Output() filterReset = new EventEmitter<void>();

  get hasActiveFilters(): boolean {
    return !!(
      this.filterState.search ||
      this.filterState.status ||
      this.filterState.documentType ||
      this.filterState.startDate ||
      this.filterState.endDate
    );
  }

  onFilterApply(): void {
    this.filterChange.emit({ ...this.filterState });
  }

  clearFilters(): void {
    this.filterState = {
      search: '',
      status: '',
      documentType: '',
      startDate: '',
      endDate: ''
    };
    this.filterReset.emit();
    this.filterChange.emit({ ...this.filterState });
  }
}