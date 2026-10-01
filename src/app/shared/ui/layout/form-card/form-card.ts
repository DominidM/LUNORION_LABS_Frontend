import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-card.html',
  styleUrl: './form-card.scss'
})
export class FormCard {
  title = input.required<string>();
  subtitle = input<string>('');
  icon = input<string>('pi pi-info-circle');
}