import { Component, computed, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { CursoService, Area, TipoCurso, Regiao, Unidade } from '../../core/services/curso.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <!-- ══════════════════════════════════════════════════════ Header -->
    <header class="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">

      <div class="h-16 max-w-screen-xl mx-auto px-4 lg:px-8 flex items-center gap-6">

        <!-- Logo -->
        <a routerLink="/home" class="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div class="w-8 h-8 bg-[#0054A6] rounded-lg flex items-center justify-center">
            <mat-icon class="text-white" style="font-size:18px;height:18px;width:18px">school</mat-icon>
          </div>
          <span class="text-xl font-bold text-[#1a2e5a] whitespace-nowrap">Senac <span class="text-[#F7941E]">LMS</span></span>
        </a>

        <!-- Desktop nav — visible apenas em ≥ lg (1024px) -->
        <nav class="hidden lg:flex items-center gap-1 flex-1 min-w-0">

          <a routerLink="/home" routerLinkActive="!text-[#0054A6] !font-semibold"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-gray-700
                    hover:text-[#0054A6] hover:bg-blue-50 transition-colors no-underline">
            Home
          </a>

          <!-- Cursos trigger -->
          <button (click)="toggleDropdown('cursos')"
            class="flex-shrink-0 whitespace-nowrap flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm
                   font-medium transition-colors cursor-pointer border-0 bg-transparent"
            [class]="activeDropdown() === 'cursos'
              ? 'text-[#0054A6] bg-blue-50 font-semibold'
              : 'text-gray-700 hover:text-[#0054A6] hover:bg-blue-50'">
            Cursos
            <mat-icon class="transition-transform duration-200 text-base"
              [style.transform]="activeDropdown() === 'cursos' ? 'rotate(180deg)' : 'rotate(0deg)'"
              style="font-size:18px;height:18px;width:18px">expand_more</mat-icon>
          </button>

          <!-- Unidades trigger -->
          <button (click)="toggleDropdown('unidades')"
            class="flex-shrink-0 whitespace-nowrap flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm
                   font-medium transition-colors cursor-pointer border-0 bg-transparent"
            [class]="activeDropdown() === 'unidades'
              ? 'text-[#0054A6] bg-blue-50 font-semibold'
              : 'text-gray-700 hover:text-[#0054A6] hover:bg-blue-50'">
            Unidades
            <mat-icon class="transition-transform duration-200 text-base"
              [style.transform]="activeDropdown() === 'unidades' ? 'rotate(180deg)' : 'rotate(0deg)'"
              style="font-size:18px;height:18px;width:18px">expand_more</mat-icon>
          </button>

          <a routerLink="/sobre"
             class="flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-gray-700
                    hover:text-[#0054A6] hover:bg-blue-50 transition-colors no-underline">
            Bolsas de Estudo
          </a>
          <a routerLink="/sobre"
             class="flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-gray-700
                    hover:text-[#0054A6] hover:bg-blue-50 transition-colors no-underline">
            Eventos
          </a>
        </nav>

        <!-- CTA + hamburger -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login"
               class="flex-shrink-0 whitespace-nowrap text-gray-700 hover:text-[#0054A6] text-sm
                      font-medium transition-colors no-underline hidden sm:block">
              Entrar
            </a>
            <a routerLink="/login"
               class="flex-shrink-0 bg-[#F7941E] hover:bg-orange-500 text-white font-semibold text-sm
                      px-5 py-2 rounded-xl transition-colors no-underline whitespace-nowrap">
              Matricule-se
            </a>
          </ng-container>
          <a *ngIf="auth.isLoggedIn()" routerLink="/dashboard"
             class="flex-shrink-0 bg-[#0054A6] text-white font-semibold text-sm px-5 py-2 rounded-xl
                    hover:bg-[#003087] transition-colors no-underline flex items-center gap-1.5 whitespace-nowrap">
            <mat-icon style="font-size:18px;height:18px;width:18px">dashboard</mat-icon>
            Meu Painel
          </a>

          <!-- Hamburguer — abaixo de lg -->
          <button (click)="menuOpen.set(!menuOpen())"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors border-0
                   bg-transparent cursor-pointer text-gray-700 flex-shrink-0">
            <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════════════ Mega-dropdown: Cursos -->
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

      <!-- ════════════════════════════════════════════ Mega-dropdown: Unidades -->
      <div *ngIf="activeDropdown() === 'unidades'"
           class="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
        <div class="max-w-screen-xl mx-auto px-8 py-6">

          <!-- Estado: carregando -->
          <div *ngIf="loadingUnidades()" class="py-6 text-center text-gray-400 text-sm">
            Carregando unidades...
          </div>

          <!-- Estado: grid completo com unidades agrupadas por região -->
          <ng-container *ngIf="!loadingUnidades() && capitalUnidades().length > 0">
            <div class="grid grid-cols-4 gap-x-8">

              <!-- Capital — ocupa 2 colunas, grid interno de 2 -->
              <div class="col-span-2 pr-8 border-r border-gray-100">
                <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-3">Capital</p>
                <div class="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <a *ngFor="let u of capitalUnidades()"
                     [routerLink]="['/unidades']" [queryParams]="{ unidadeId: u.id }"
                     (click)="activeDropdown.set(null)"
                     class="text-[#0054A6] text-sm hover:underline no-underline truncate">
                    {{ u.nome }}
                  </a>
                </div>
              </div>

              <!-- Grande SP e Litoral — 1 coluna -->
              <div class="pr-8 border-r border-gray-100">
                <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-3">Grande SP e Litoral</p>
                <ul class="space-y-1.5">
                  <li *ngFor="let u of grandeSPUnidades()">
                    <a [routerLink]="['/unidades']" [queryParams]="{ unidadeId: u.id }"
                       (click)="activeDropdown.set(null)"
                       class="text-[#0054A6] text-sm hover:underline no-underline block">
                      {{ u.nome }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Interior — 1 coluna, lista com scroll para 35 itens -->
              <div>
                <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-3">Interior</p>
                <ul class="space-y-1.5 overflow-y-auto pr-1" style="max-height:260px">
                  <li *ngFor="let u of interiorUnidades()">
                    <a [routerLink]="['/unidades']" [queryParams]="{ unidadeId: u.id }"
                       (click)="activeDropdown.set(null)"
                       class="text-[#0054A6] text-sm hover:underline no-underline block">
                      {{ u.nome }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Centros Universitários — faixa abaixo do grid -->
            <div *ngIf="centrosUnivUnidades().length > 0"
                 class="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-8 gap-y-2">
              <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest flex-shrink-0">
                Centros Universitários
              </p>
              <a *ngFor="let u of centrosUnivUnidades()"
                 [routerLink]="['/unidades']" [queryParams]="{ unidadeId: u.id }"
                 (click)="activeDropdown.set(null)"
                 class="text-[#0054A6] text-sm hover:underline no-underline">
                {{ u.nome }}
              </a>
            </div>
          </ng-container>

          <!-- Fallback: resumo por regiões (enquanto unidades carregam ou API indisponível) -->
          <ng-container *ngIf="!loadingUnidades() && capitalUnidades().length === 0">
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
          </ng-container>

          <!-- Link footer -->
          <a routerLink="/unidades" (click)="activeDropdown.set(null)"
             class="text-[#F7941E] text-xs font-semibold hover:underline no-underline mt-5 block">
            Ver todas as unidades →
          </a>
        </div>
      </div>

    </header>

    <!-- ═════════════════════════════════════════════════ Mobile: overlay -->
    <div *ngIf="menuOpen()" (click)="menuOpen.set(false)"
      class="fixed inset-0 bg-black/30 z-30 lg:hidden"></div>

    <!-- ═════════════════════════════════════════════════ Mobile: painel -->
    <div *ngIf="menuOpen()"
      class="fixed top-16 left-0 right-0 bg-white z-40 lg:hidden shadow-lg border-t border-gray-100 overflow-y-auto"
      style="max-height: calc(100vh - 4rem)">
      <nav class="flex flex-col py-2">

        <a routerLink="/home" (click)="closeAll()"
           class="text-gray-700 hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm
                  font-medium transition-colors no-underline">
          Home
        </a>

        <!-- Accordion: Cursos -->
        <button (click)="toggleMobileAccordion('cursos')"
          class="flex items-center justify-between px-6 py-3 text-sm font-medium w-full
                 border-0 bg-transparent cursor-pointer text-gray-700 hover:text-[#0054A6] hover:bg-blue-50">
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

        <!-- Accordion: Unidades -->
        <button (click)="toggleMobileAccordion('unidades')"
          class="flex items-center justify-between px-6 py-3 text-sm font-medium w-full
                 border-0 bg-transparent cursor-pointer text-gray-700 hover:text-[#0054A6] hover:bg-blue-50">
          Unidades
          <mat-icon class="transition-transform duration-200"
            [style.transform]="mobileAccordion() === 'unidades' ? 'rotate(180deg)' : 'rotate(0)'"
            style="font-size:18px;height:18px;width:18px">expand_more</mat-icon>
        </button>
        <div *ngIf="mobileAccordion() === 'unidades'" class="bg-gray-50 border-y border-gray-100 px-6 py-3">

          <!-- Unidades carregadas: agrupadas por região -->
          <ng-container *ngIf="gruposMobile().length > 0">
            <ng-container *ngFor="let grupo of gruposMobile()">
              <p class="text-[#1a2e5a] font-bold text-xs uppercase tracking-widest mb-2 mt-3">
                {{ grupo.regiao }}
              </p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-1">
                <a *ngFor="let u of grupo.unidades"
                   [routerLink]="['/unidades']" [queryParams]="{ unidadeId: u.id }"
                   (click)="closeAll()"
                   class="text-[#0054A6] text-sm hover:underline no-underline truncate">
                  {{ u.nome }}
                </a>
              </div>
            </ng-container>
          </ng-container>

          <!-- Fallback: resumo de regiões (enquanto unidades carregam) -->
          <ng-container *ngIf="gruposMobile().length === 0">
            <a *ngFor="let regiao of regioes()"
               [routerLink]="['/unidades']" [queryParams]="{ regiaoId: regiao.id }"
               (click)="closeAll()"
               class="text-[#0054A6] text-sm hover:underline no-underline flex items-center
                      justify-between py-1.5">
              <span>{{ regiao.nome }}</span>
              <span class="text-xs text-gray-400">{{ regiao.totalUnidades }}</span>
            </a>
          </ng-container>

        </div>

        <a routerLink="/sobre" (click)="closeAll()"
           class="text-gray-700 hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm
                  font-medium transition-colors no-underline">
          Bolsas de Estudo
        </a>
        <a routerLink="/sobre" (click)="closeAll()"
           class="text-gray-700 hover:text-[#0054A6] hover:bg-blue-50 px-6 py-3 text-sm
                  font-medium transition-colors no-underline">
          Eventos
        </a>

        <div class="border-t border-gray-100 mt-2 pt-2 px-4 pb-4 flex flex-col gap-2">
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" (click)="closeAll()"
             class="text-center text-gray-700 hover:text-[#0054A6] py-2.5 text-sm font-medium
                    transition-colors no-underline block border border-gray-200 rounded-xl">
            Entrar
          </a>
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" (click)="closeAll()"
             class="text-center bg-[#F7941E] text-white font-semibold text-sm py-3 rounded-xl
                    transition-colors no-underline block">
            Matricule-se
          </a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/dashboard" (click)="closeAll()"
             class="text-center bg-[#0054A6] text-white font-semibold text-sm py-3 rounded-xl
                    transition-colors no-underline block">
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
  todasUnidades = signal<Unidade[]>([]);
  loadingUnidades = signal(true);

  private readonly REGIAO_ORDER = ['Capital', 'Grande São Paulo e Litoral', 'Interior', 'Centros Universitários'];

  capitalUnidades   = computed(() => this.todasUnidades().filter(u => u.regiaoNome === 'Capital'));
  grandeSPUnidades  = computed(() => this.todasUnidades().filter(u => u.regiaoNome === 'Grande São Paulo e Litoral'));
  interiorUnidades  = computed(() => this.todasUnidades().filter(u => u.regiaoNome === 'Interior'));
  centrosUnivUnidades = computed(() => this.todasUnidades().filter(u => u.regiaoNome === 'Centros Universitários'));

  gruposMobile = computed(() => {
    const all = this.todasUnidades();
    if (!all.length) return [];
    const map = new Map<string, Unidade[]>();
    for (const u of all) {
      if (!map.has(u.regiaoNome)) map.set(u.regiaoNome, []);
      map.get(u.regiaoNome)!.push(u);
    }
    const result: { regiao: string; unidades: Unidade[] }[] = [];
    for (const nome of this.REGIAO_ORDER) {
      if (map.has(nome)) result.push({ regiao: nome, unidades: map.get(nome)! });
    }
    return result;
  });

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
    this.cursoService.listarTodasUnidades().subscribe({
      next: u => { this.todasUnidades.set(u); this.loadingUnidades.set(false); },
      error: () => this.loadingUnidades.set(false)
    });
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
