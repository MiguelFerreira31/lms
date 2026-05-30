import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  template: `
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-[#0054A6] z-50 flex items-center px-4 gap-4 shadow-md">
      <button (click)="sidebarOpen.set(!sidebarOpen())"
        class="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer text-white">
        <mat-icon>{{ sidebarOpen() ? 'close' : 'menu' }}</mat-icon>
      </button>

      <div class="flex items-center gap-2.5 cursor-pointer" routerLink="/dashboard">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <mat-icon class="text-white text-lg">school</mat-icon>
        </div>
        <span class="text-xl font-bold text-white hidden sm:block">Senac <span class="text-[#F7941E]">LMS</span></span>
      </div>

      <div class="flex-1"></div>

      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-sm font-semibold text-white">{{ auth.currentUser()?.nome }}</span>
          <span class="text-xs text-blue-200 font-medium">{{ auth.currentUser()?.role }}</span>
        </div>
        <div class="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm">
          {{ auth.currentUser()?.nome?.charAt(0)?.toUpperCase() }}
        </div>
        <button (click)="auth.logout()" matTooltip="Sair"
          class="p-2 rounded-lg hover:bg-white/10 hover:text-red-200 transition-colors border-0 bg-transparent cursor-pointer text-white/80">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </header>

    <!-- Mobile overlay -->
    <div *ngIf="sidebarOpen()" (click)="sidebarOpen.set(false)"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"></div>

    <!-- Sidebar -->
    <aside [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 flex flex-col">

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <a routerLink="/dashboard" routerLinkActive="bg-[#EBF4FF] text-[#0054A6] border-[#0054A6]/20"
           [routerLinkActiveOptions]="{exact:true}"
           (click)="sidebarOpen.set(false)"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-[#EBF4FF] hover:text-[#0054A6] transition-colors font-medium text-sm border border-transparent no-underline">
          <mat-icon class="flex-shrink-0">home</mat-icon>
          Início
        </a>
        <a routerLink="/cursos" routerLinkActive="bg-[#EBF4FF] text-[#0054A6] border-[#0054A6]/20"
           [routerLinkActiveOptions]="{exact:true}"
           (click)="sidebarOpen.set(false)"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-[#EBF4FF] hover:text-[#0054A6] transition-colors font-medium text-sm border border-transparent no-underline">
          <mat-icon class="flex-shrink-0">menu_book</mat-icon>
          Cursos
        </a>
        <a routerLink="/cursos/areas" routerLinkActive="bg-[#EBF4FF] text-[#0054A6] border-[#0054A6]/20"
           (click)="sidebarOpen.set(false)"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-[#EBF4FF] hover:text-[#0054A6] transition-colors font-medium text-sm border border-transparent no-underline">
          <mat-icon class="flex-shrink-0">category</mat-icon>
          Explorar por Área
        </a>
        <a routerLink="/matriculas" routerLinkActive="bg-[#EBF4FF] text-[#0054A6] border-[#0054A6]/20"
           (click)="sidebarOpen.set(false)"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-[#EBF4FF] hover:text-[#0054A6] transition-colors font-medium text-sm border border-transparent no-underline">
          <mat-icon class="flex-shrink-0">assignment</mat-icon>
          Minhas Matrículas
        </a>

        <!-- Professor section -->
        <div *ngIf="auth.isProfessor() && !auth.isAdmin()" class="pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Professor</p>
          <a routerLink="/professor/cursos" routerLinkActive="bg-emerald-50 text-emerald-700 border-emerald-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">cast_for_education</mat-icon>
            Meus Cursos
          </a>
        </div>

        <!-- Admin section -->
        <div *ngIf="auth.isAdmin()" class="pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Administração</p>
          <a routerLink="/admin/cursos" routerLinkActive="bg-purple-50 text-purple-700 border-purple-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">library_books</mat-icon>
            Gerenciar Cursos
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="bg-purple-50 text-purple-700 border-purple-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">group</mat-icon>
            Gerenciar Usuários
          </a>
          <a routerLink="/admin/regioes" routerLinkActive="bg-purple-50 text-purple-700 border-purple-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">location_city</mat-icon>
            Regiões e Unidades
          </a>
          <a routerLink="/admin/professores" routerLinkActive="bg-purple-50 text-purple-700 border-purple-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">school</mat-icon>
            Professores
          </a>
          <a routerLink="/professor/cursos" routerLinkActive="bg-purple-50 text-purple-700 border-purple-200"
             (click)="sidebarOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors font-medium text-sm border border-transparent no-underline">
            <mat-icon class="flex-shrink-0">cast_for_education</mat-icon>
            Conteúdo das Aulas
          </a>
        </div>
      </nav>

      <!-- Sidebar footer -->
      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#0054A6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ auth.currentUser()?.nome?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ auth.currentUser()?.nome }}</p>
            <p class="text-xs text-[#0054A6] truncate font-medium">{{ auth.currentUser()?.role }}</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`:host { display: block; }`]
})
export class NavbarComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(false);
}
