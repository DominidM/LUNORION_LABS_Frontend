import { FilterState } from '../filter-bar/filter-bar.interface';

export abstract class ListPage<T> {
  currentFilters: FilterState = { search: '', status: '' };
  isLoading = false;
  loadError = false;
  currentPage = 1;
  pageSize = 10;

  showDeactivateDialog = false;
  selected: T | null = null;
  isDeactivating = false;

  protected abstract refresh(): void;

  onFilterChange(filters: FilterState): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.refresh();
  }

  onPageChanged(page: number): void {
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.refresh();
  }

  onPageSizeChanged(size: number): void {
    if (size === this.pageSize) return;
    this.pageSize = size;
    this.currentPage = 1;
    this.refresh();
  }

  openDeactivateDialog(item: T): void {
    this.selected = item;
    this.showDeactivateDialog = true;
  }

  closeDeactivateDialog(): void {
    if (this.isDeactivating) return;
    this.showDeactivateDialog = false;
    this.selected = null;
  }

  onConfirmDeactivate(): void {
    const item = this.selected;
    if (!item || this.isDeactivating) return;
    this.isDeactivating = true;
    this.performDeactivate(item);
  }

  protected finishDeactivate(): void {
    this.isDeactivating = false;
    this.showDeactivateDialog = false;
    this.selected = null;
  }

  protected abstract performDeactivate(item: T): void;

  protected mapStatus(status: string): string | undefined {
    if (status === 'active') return 'activo';
    if (status === 'inactive') return 'inactivo';
    return undefined;
  }
}
