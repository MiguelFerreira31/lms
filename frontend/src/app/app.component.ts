import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else noLayout">
      <app-navbar></app-navbar>
      <main class="pt-16 lg:pl-64 min-h-screen bg-gray-50">
        <router-outlet></router-outlet>
      </main>
    </ng-container>
    <ng-template #noLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  auth = inject(AuthService);
}
