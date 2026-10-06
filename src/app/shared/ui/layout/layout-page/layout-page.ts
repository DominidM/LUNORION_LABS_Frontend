import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { TopNavbar } from '../top-navbar/top-navbar';
import { NavigationService } from '../../../../core/navigation/navigation.service';
import { LayoutService } from '../../../../core/layout/layout.service';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [RouterModule, Sidebar, TopNavbar],
  templateUrl: './layout-page.html',
  styleUrls: ['./layout-page.scss'],
})
export class LayoutPage {
  protected readonly nav = inject(NavigationService);
  protected readonly layout = inject(LayoutService);
}
