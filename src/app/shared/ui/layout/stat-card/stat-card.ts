import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) value: string | number = '';
  @Input({ required: true }) icon: string = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' = 'primary';
}