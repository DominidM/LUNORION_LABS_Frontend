import { Component, input, signal } from '@angular/core';
import { Breadcrumb } from '../breadcrumb/breadcrumb';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [Breadcrumb],
  templateUrl: './top-navbar.html',
  styleUrls: ['./top-navbar.scss']
})

export class TopNavbar {
  backgroundColor = input('var(--surface-container-lowest)');
  userName = input('Pancito con palta');
  userRole = input('ADMINISTRADOR');
  notifications = input(0);
  dropdownOpen = signal(false);

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }
}