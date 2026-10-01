export interface FilterState {
  search: string;
  status: string;
  documentType?: string;
  startDate?: string;
  endDate?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}