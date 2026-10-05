import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss'
})
export class PageHeader{
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() showBackButton = false;

  @Output() back = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }
}