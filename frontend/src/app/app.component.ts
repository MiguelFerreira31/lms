import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { PublicNavComponent } from './shared/public-nav/public-nav.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, PublicNavComponent],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else publicLayout">
      <app-navbar></app-navbar>
      <main class="pt-16 lg:pl-64 min-h-screen bg-gray-50">
        <router-outlet></router-outlet>
      </main>
    </ng-container>

    <ng-template #publicLayout>
      <ng-container *ngIf="showPublicNav()">
        <app-public-nav></app-public-nav>
        <main class="pt-16 min-h-screen">
          <router-outlet></router-outlet>
        </main>
      </ng-container>
      <ng-container *ngIf="!showPublicNav()">
        <router-outlet></router-outlet>
      </ng-container>
    </ng-template>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  currentUrl = signal('');

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentUrl.set(e.urlAfterRedirects));
  }

  showPublicNav(): boolean {
    const url = this.currentUrl();
    return !url.startsWith('/login');
  }
}
