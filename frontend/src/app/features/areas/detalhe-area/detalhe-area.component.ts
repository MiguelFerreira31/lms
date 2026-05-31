import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Curso, Area } from '../../../core/services/curso.service';
import { CursoCardComponent } from '../../../shared/curso-card/curso-card.component';

interface TipoGrupo { nome: string; slug: string; cursos: Curso[]; }

@Component({
  selector: 'app-detalhe-area',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, CursoCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- ══════════════════════════ HERO ══════════════════════════ -->
      <section class="relative" style="min-height:280px">
        <img [src]="'https://picsum.photos/seed/' + areaSlug() + '/1600/400'"
             alt="" class="absolute inset-0 w-full h-full object-cover">
        <!-- overlay azul semitransparente -->
        <div class="absolute inset-0 bg-[#0054A6]/80"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-12">
          <!-- breadcrumb -->
          <div class="flex items-center gap-1.5 text-white/70 text-sm mb-6">
            <a routerLink="/home" class="hover:text-white no-underline text-white/70">Home</a>
            <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <a routerLink="/cursos/areas" class="hover:text-white no-underline text-white/70">Áreas</a>
            <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <span class="text-white/95">{{ area()?.nome }}</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-2xl">
            {{ area()?.nome }} no LMS Lite: prática, conectada e para todo mundo
          </h1>
        </div>
      </section>

      <!-- Loading inicial (área) -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading() && area()">

        <!-- ══════════════════════════ CHIPS DE CATEGORIA ══════════════════════════ -->
        <section class="bg-white py-9 border-b border-gray-100">
          <div class="max-w-5xl mx-auto px-6 text-center">
            <h2 class="text-xl font-bold text-gray-800 mb-1">O que você quer aprender agora?</h2>
            <p class="text-gray-500 text-sm mb-6">Clique em um assunto da área e conheça</p>

            <div class="flex flex-wrap justify-center gap-2.5">
              <button (click)="selecionarCategoria(null)"
                class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                [class]="!categoriaSelecionada()
                  ? 'bg-[#0054A6] border-[#0054A6] text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-[#0054A6] hover:text-[#0054A6]'">
                Todos
              </button>

              <button *ngFor="let cat of area()!.categorias"
                (click)="selecionarCategoria(cat.slug)"
                class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                [class]="categoriaSelecionada() === cat.slug
                  ? 'bg-[#0054A6] border-[#0054A6] text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-[#0054A6] hover:text-[#0054A6]'">
                {{ cat.nome }}
              </button>
            </div>
          </div>
        </section>

        <!-- ══════════════════════════ ACCORDION POR TIPO ══════════════════════════ -->
        <section class="max-w-5xl mx-auto px-6 py-10">

          <!-- Spinner enquanto cursos carregam -->
          <div *ngIf="cursosLoading()" class="flex justify-center py-16">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Estado vazio (filtro de categoria sem resultados) -->
          <div *ngIf="!cursosLoading() && tipoGrupos().length === 0" class="text-center py-16">
            <mat-icon class="text-gray-200" style="font-size:64px;height:64px;width:64px">search_off</mat-icon>
            <p class="text-gray-500 mt-4">Nenhum curso nesta categoria.</p>
            <button (click)="selecionarCategoria(null)"
                    class="mt-3 text-[#0054A6] hover:underline bg-transparent border-0 cursor-pointer text-sm font-medium">
              Ver todos os tipos
            </button>
          </div>

          <!-- Accordion de tipos -->
          <div *ngIf="!cursosLoading() && tipoGrupos().length > 0" class="space-y-2">
            <div *ngFor="let grupo of tipoGrupos()"
                 class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

              <!-- Header do accordion -->
              <button (click)="toggleTipo(grupo.nome)"
                class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50
                       transition-colors cursor-pointer bg-transparent border-0 text-left">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-gray-900 text-base">{{ grupo.nome }}</span>
                  <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {{ grupo.cursos.length }} curso{{ grupo.cursos.length !== 1 ? 's' : '' }}
                  </span>
                </div>
                <mat-icon class="text-gray-500 transition-transform duration-200 flex-shrink-0"
                  [style.transform]="isOpen(grupo.nome) ? 'rotate(180deg)' : 'rotate(0deg)'">
                  expand_more
                </mat-icon>
              </button>

              <!-- Conteúdo expandido -->
              <div *ngIf="isOpen(grupo.nome)"
                   class="border-t border-gray-100 px-6 py-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <app-curso-card *ngFor="let c of grupo.cursos" [curso]="c"></app-curso-card>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ══════════════════════════ BANNER PARCEIRO ══════════════════════════ -->
        <section class="bg-[#001d5c] py-16">
          <div class="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p class="text-white/70 text-sm uppercase tracking-widest font-semibold mb-2">LMS Lite</p>
              <h3 class="text-2xl lg:text-3xl font-extrabold text-white">
                Quer aprender mais com o LMS Lite?
              </h3>
            </div>
            <a routerLink="/cursos/areas"
               class="flex-shrink-0 bg-[#F7941E] hover:bg-orange-500 text-white font-bold px-8 py-3.5
                      rounded-xl transition-colors no-underline whitespace-nowrap">
              Conhecer cursos
            </a>
          </div>
        </section>

      </ng-container>

    </div>
  `
})
export class DetalheAreaComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  areaSlug = signal('');
  area = signal<Area | null>(null);
  todosCursos = signal<Curso[]>([]);
  loading = signal(true);
  cursosLoading = signal(true);
  categoriaSelecionada = signal<string | null>(null);
  openTipos = signal<Set<string>>(new Set());

  tipoGrupos = computed((): TipoGrupo[] => {
    const catSel = this.categoriaSelecionada();
    let cursos = this.todosCursos();

    if (catSel) {
      cursos = cursos.filter(c => c.categorias.some(cat => cat.slug === catSel));
    }

    const map = new Map<string, TipoGrupo>();
    for (const c of cursos) {
      const t = c.tipos[0] ?? { nome: 'Outros', slug: 'outros' };
      if (!map.has(t.nome)) map.set(t.nome, { nome: t.nome, slug: t.slug, cursos: [] });
      map.get(t.nome)!.cursos.push(c);
    }
    return [...map.values()].filter(g => g.cursos.length > 0);
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('areaSlug')!;
    this.areaSlug.set(slug);

    this.cursoService.buscarArea(slug).subscribe({
      next: data => { this.area.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.cursoService.listarCursosDaArea(slug).subscribe({
      next: data => { this.todosCursos.set(data.content); this.cursosLoading.set(false); },
      error: () => this.cursosLoading.set(false)
    });
  }

  selecionarCategoria(slug: string | null) {
    this.categoriaSelecionada.set(slug);
  }

  toggleTipo(nome: string) {
    this.openTipos.update(s => {
      const n = new Set(s);
      if (n.has(nome)) n.delete(nome); else n.add(nome);
      return n;
    });
  }

  isOpen(nome: string): boolean {
    return this.openTipos().has(nome);
  }
}
