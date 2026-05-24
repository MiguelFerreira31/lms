import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex items-center gap-3 cursor-pointer" routerLink="/dashboard">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <mat-icon class="text-white text-lg">school</mat-icon>
            </div>
            <span class="text-xl font-bold text-gray-900">LMS <span class="text-indigo-600">Lite</span></span>
          </div>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              <mat-icon class="text-lg">dashboard</mat-icon>
              Dashboard
            </a>
            <a routerLink="/cursos" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              <mat-icon class="text-lg">menu_book</mat-icon>
              Cursos
            </a>
            <a routerLink="/matriculas" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              <mat-icon class="text-lg">assignment</mat-icon>
              Minhas Matrículas
            </a>
            <a *ngIf="auth.isAdmin()" routerLink="/admin/cursos" routerLinkActive="bg-indigo-50 text-indigo-700"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              <mat-icon class="text-lg">admin_panel_settings</mat-icon>
              Admin
            </a>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-3">
            <div class="hidden md:flex flex-col items-end">
              <span class="text-sm font-semibold text-gray-900">{{ auth.currentUser()?.nome }}</span>
              <span class="text-xs text-indigo-600 font-medium">{{ auth.currentUser()?.role }}</span>
            </div>
            <button [matMenuTriggerFor]="userMenu"
              class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-indigo-700 transition-colors border-0">
              {{ auth.currentUser()?.nome?.charAt(0)?.toUpperCase() }}
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ auth.currentUser()?.nome }}</p>
                <p class="text-xs text-gray-500">{{ auth.currentUser()?.email }}</p>
              </div>
              <button mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon> Dashboard
              </button>
              <button mat-menu-item *ngIf="auth.isAdmin()" routerLink="/admin/cursos">
                <mat-icon>manage_accounts</mat-icon> Painel Admin
              </button>
              <div class="border-t border-gray-100 mt-1"></div>
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> Sair
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`:host { display: block; }`]
})
export class NavbarComponent {
  auth = inject(AuthService);
}
