import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { CursoService, Area, TipoCurso, Regiao } from '../../core/services/curso.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <!-- ══════════════════════════════════════════════════════ Header -->
    <header class="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">

      <div class="h-16 max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-6">

        <!-- Logo -->
        <a routerLink="/home" class="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div class="w-8 h-8 bg-[#0054A6] rounded-lg flex items-center justify-center">
            <mat-icon class="text-white" style="font-size:18px;height:18px;width:18px">school</mat-icon>
          </div>
          <span class="text-xl font-bold text-[#1a2e5a]">Senac <span class="text-[#F7941E]">LMS</span></span>
        </a>

        <!-- Desktop nav links -->
        <nav class="hidden md:flex items-center gap-0.5 flex-1">

          <a routerLink="/home" routerLinkActive="!text-[#0054A6] !font-semibold"
             [routerLinkActiveOptions]="{exact: true}"
             class="px-3 py-2 rounded-lg text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 text-sm font-medium transition-colors no-underline">
            Home
          </a>

          <!-- Cursos dropdown trigger -->
          <button (click)="toggleDropdown('cursos')"
            class="flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 bg-transparent"
            [class]="activeDropdown() === 'cursos' ? 'text-[#0054A6] bg-blue-50 font-semibold' : 'text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50'">
            Cursos
            <mat-icon class="transition-transform duration-200"
              [style.transform]="activeDropdown() === 'cursos' ? 'rotate(180deg)' : 'rotate(0deg)'"
              style="font-size:18px;height:18px;width:18px;margin-top:1px">expand_more</mat-icon>
          </button>

          <!-- Unidades dropdown trigger -->
          <button (click)="toggleDropdown('unidades')"
            class="flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 bg-transparent"
            [class]="activeDropdown() === 'unidades' ? 'text-[#0054A6] bg-blue-50 font-semibold' : 'text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50'">
            Unidades
            <mat-icon class="transition-transform duration-200"
              [style.transform]="activeDropdown() === 'unidades' ? 'rotate(180deg)' : 'rotate(0deg)'"
              style="font-size:18px;height:18px;width:18px;margin-top:1px">expand_more</mat-icon>
          </button>

          <a href="#" class="px-3 py-2 rounded-lg text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 text-sm font-medium transition-colors no-underline">
            Bolsas de Estudo
          </a>
          <a href="#" class="px-3 py-2 rounded-lg text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 text-sm font-medium transition-colors no-underline">
            Eventos
          </a>
        </nav>

        <!-- Spacer (desktop) -->
        <div class="flex-1 hidden md:block"></div>

        <!-- CTA buttons + hamburger -->
        <div class="flex items-center gap-3">
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login"
               class="text-[#4a5568] hover:text-[#0054A6] text-sm font-medium transition-colors no-underline hidden sm:block">
              Entrar
            </a>
            <a routerLink="/login"
               class="bg-[#F7941E] hover:bg-orange-500 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors no-underline flex-shrink-0">
              Matricule-se
            </a>
          </ng-container>
          <a *ngIf="auth.isLoggedIn()" routerLink="/dashboard"
             class="bg-[#0054A6] text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-[#003087] transition-colors no-underline flex items-center gap-1.5">
            <mat-icon style="font-size:18px;height:18px;width:18px">dashboard</mat-icon>
            Meu Painel
          </a>

          <button (click)="menuOpen.set(!menuOpen())"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer text-[#4a5568]">
            <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════ Mega-dropdown: Cursos -->
      <div *ngIf="activeDropdown() === 'cursos'"
           class="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
        <div class="max-w-5xl mx-auto px-8 py-6 grid grid-cols-2 gap-16">

          <!-- Áreas -->
          <div>
            <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-4">Áreas</p>
            <ul class="space-y-2">
              <li *ngFor="let area of areas()">
                <a [routerLink]="['/cursos/areas', area.slug]"
                   (click)="activeDropdown.set(null)"
                   class="text-[#0054A6] text-sm hover:underline no-underline block">
                  {{ area.nome }}
                </a>
              </li>
            </ul>
            <a routerLink="/cursos/areas" (click)="activeDropdown.set(null)"
               class="text-[#F7941E] text-xs font-semibold hover:underline no-underline mt-4 block">
              Ver todas as áreas →
            </a>
          </div>

          <!-- Tipos -->
          <div>
            <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-4">Tipos de Curso</p>
            <ul class="space-y-2">
              <li *ngFor="let tipo of tipos()">
                <a [routerLink]="['/cursos/tipos', tipo.slug]"
                   (click)="activeDropdown.set(null)"
                   class="text-[#0054A6] text-sm hover:underline no-underline block">
                  {{ tipo.nome }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════ Dropdown: Unidades -->
      <div *ngIf="activeDropdown() === 'unidades'"
           class="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
        <div class="max-w-3xl mx-auto px-8 py-6">
          <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-4">Regiões</p>
          <ul class="grid grid-cols-2 gap-x-16 gap-y-2.5">
            <li *ngFor="let regiao of regioes()">
              <a [routerLink]="['/unidades']" [queryParams]="{ regiaoId: regiao.id }"
                 (click)="activeDropdown.set(null)"
                 class="text-[#0054A6] text-sm hover:underline no-underline flex items-center justify-between group">
                <span>{{ regiao.nome }}</span>
                <span class="text-xs text-gray-400 ml-2 group-hover:text-[#0054A6] transition-colors">
                  {{ regiao.totalUnidades }}
                </span>
              </a>
            </li>
          </ul>
          <a routerLink="/unidades" (click)="activeDropdown.set(null)"
             class="text-[#F7941E] text-xs font-semibold hover:underline no-underline mt-5 block">
            Ver todas as unidades →
          </a>
        </div>
      </div>

    </header>

    <!-- ══════════════════════════════════════════════════════ Mobile: overlay -->
    <div *ngIf="menuOpen()" (click)="menuOpen.set(false)"
      class="fixed inset-0 bg-black/30 z-30 md:hidden"></div>

    <!-- ══════════════════════════════════════════════════════ Mobile: side panel -->
    <div *ngIf="menuOpen()"
      class="fixed top-16 left-0 right-0 bg-white z-40 md:hidden shadow-lg border-t border-gray-100 overflow-y-auto"
      style="max-height: calc(100vh - 4rem)">
      <nav class="flex flex-col py-2">

        <a routerLink="/home" (click)="closeAll()"
           class="text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm font-medium transition-colors no-underline">
          Home
        </a>

        <!-- Cursos accordion -->
        <button (click)="toggleMobileAccordion('cursos')"
          class="flex items-center justify-between px-6 py-3 text-sm font-medium w-full border-0 bg-transparent cursor-pointer text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50">
          Cursos
          <mat-icon class="transition-transform duration-200"
            [style.transform]="mobileAccordion() === 'cursos' ? 'rotate(180deg)' : 'rotate(0)'"
            style="font-size:18px;height:18px;width:18px">expand_more</mat-icon>
        </button>
        <div *ngIf="mobileAccordion() === 'cursos'" class="bg-gray-50 border-y border-gray-100">
          <div class="px-6 py-3">
            <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-3">Áreas</p>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <a *ngFor="let area of areas()" [routerLink]="['/cursos/areas', area.slug]"
                 (click)="closeAll()"
                 class="text-[#0054A6] text-sm hover:underline no-underline">
                {{ area.nome }}
              </a>
            </div>
          </div>
          <div class="border-t border-gray-200 px-6 py-3">
            <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-3">Tipos</p>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <a *ngFor="let tipo of tipos()" [routerLink]="['/cursos/tipos', tipo.slug]"
                 (click)="closeAll()"
                 class="text-[#0054A6] text-sm hover:underline no-underline">
                {{ tipo.nome }}
              </a>
            </div>
          </div>
        </div>

        <!-- Unidades accordion -->
        <button (click)="toggleMobileAccordion('unidades')"
          class="flex items-center justify-between px-6 py-3 text-sm font-medium w-full border-0 bg-transparent cursor-pointer text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50">
          Unidades
          <mat-icon class="transition-transform duration-200"
            [style.transform]="mobileAccordion() === 'unidades' ? 'rotate(180deg)' : 'rotate(0)'"
            style="font-size:18px;height:18px;width:18px">expand_more</mat-icon>
        </button>
        <div *ngIf="mobileAccordion() === 'unidades'" class="bg-gray-50 border-y border-gray-100 px-6 py-3">
          <a *ngFor="let regiao of regioes()"
             [routerLink]="['/unidades']" [queryParams]="{ regiaoId: regiao.id }"
             (click)="closeAll()"
             class="text-[#0054A6] text-sm hover:underline no-underline flex items-center justify-between py-1.5">
            <span>{{ regiao.nome }}</span>
            <span class="text-xs text-gray-400">{{ regiao.totalUnidades }}</span>
          </a>
        </div>

        <a href="#" class="text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm font-medium transition-colors no-underline">
          Bolsas de Estudo
        </a>
        <a href="#" class="text-[#4a5568] hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm font-medium transition-colors no-underline">
          Eventos
        </a>

        <div class="border-t border-gray-100 mt-2 pt-2 px-4 pb-4 flex flex-col gap-2">
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" (click)="closeAll()"
             class="text-center text-[#4a5568] hover:text-[#0054A6] py-2.5 text-sm font-medium transition-colors no-underline block border border-gray-200 rounded-xl">
            Entrar
          </a>
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" (click)="closeAll()"
             class="text-center bg-[#F7941E] text-white font-semibold text-sm py-3 rounded-xl transition-colors no-underline block">
            Matricule-se
          </a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/dashboard" (click)="closeAll()"
             class="text-center bg-[#0054A6] text-white font-semibold text-sm py-3 rounded-xl transition-colors no-underline block">
            Meu Painel
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PublicNavComponent implements OnInit {
  private elRef = inject(ElementRef);
  private router = inject(Router);
  auth = inject(AuthService);
  private cursoService = inject(CursoService);

  menuOpen = signal(false);
  activeDropdown = signal<'cursos' | 'unidades' | null>(null);
  mobileAccordion = signal<'cursos' | 'unidades' | null>(null);
  areas = signal<Area[]>([]);
  tipos = signal<TipoCurso[]>([]);
  regioes = signal<Regiao[]>([]);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(() => {
      this.activeDropdown.set(null);
      this.menuOpen.set(false);
    });
  }

  ngOnInit() {
    this.cursoService.listarAreas().subscribe(a => this.areas.set(a));
    this.cursoService.listarTipos().subscribe(t => this.tipos.set(t));
    this.cursoService.listarRegioes().subscribe(r => this.regioes.set(r));
  }

  toggleDropdown(menu: 'cursos' | 'unidades') {
    this.activeDropdown.set(this.activeDropdown() === menu ? null : menu);
  }

  toggleMobileAccordion(menu: 'cursos' | 'unidades') {
    this.mobileAccordion.set(this.mobileAccordion() === menu ? null : menu);
  }

  closeAll() {
    this.activeDropdown.set(null);
    this.menuOpen.set(false);
    this.mobileAccordion.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.activeDropdown.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.activeDropdown.set(null);
    this.menuOpen.set(false);
    this.mobileAccordion.set(null);
  }
}
