import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { CursoService, Curso, Area } from '../../../core/services/curso.service';
import { CursoCardComponent } from '../../../shared/curso-card/curso-card.component';

interface TipoGrupo { nome: string; slug: string; cursos: Curso[]; }

@Component({
    selector: 'app-cursos-unidade-area',
    imports: [RouterLink, MatIconModule, MatProgressSpinnerModule, CursoCardComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    <div class="min-h-screen bg-gray-50">
    
      <!-- HERO -->
      <section class="relative" style="min-height:240px">
        <img [src]="'https://picsum.photos/seed/' + areaSlug() + '-' + unidadeSlug() + '/1600/400'"
          alt="" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-[#0054A6]/80"></div>
          <div class="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-12">
            <div class="flex items-center flex-wrap gap-1.5 text-white/70 text-sm mb-5">
              <a routerLink="/home" class="hover:text-white no-underline text-white/70">Home</a>
              <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
              <a routerLink="/unidades" class="hover:text-white no-underline text-white/70">Unidades</a>
              <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
              <a [routerLink]="['/unidades', unidadeSlug()]" class="hover:text-white no-underline text-white/70">
                {{ unidadeNome() }}
              </a>
              <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
              <a [routerLink]="['/cursos/areas', areaSlug()]" class="hover:text-white no-underline text-white/70">Áreas</a>
              <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
              <span class="text-white/95">{{ areaNome() }}</span>
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {{ areaNome() }} em {{ unidadeNome() }}
            </h1>
          </div>
        </section>
    
        <!-- Loading -->
        @if (loadingArea()) {
          <div class="flex justify-center py-24">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
        }
    
        @if (!loadingArea()) {
          <!-- CHIPS DE CATEGORIA -->
          @if (area()?.categorias?.length) {
            <section class="bg-white py-8 border-b border-gray-100">
              <div class="max-w-5xl mx-auto px-6 text-center">
                <div class="flex flex-wrap justify-center gap-2.5">
                  <button (click)="selecionarCategoria(null)"
                    class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                [class]="!categoriaSelecionada()
                  ? 'bg-[#0054A6] border-[#0054A6] text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-[#0054A6] hover:text-[#0054A6]'">
                    Todos
                  </button>
                  @for (cat of area()!.categorias; track cat) {
                    <button
                      (click)="selecionarCategoria(cat.slug)"
                      class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                [class]="categoriaSelecionada() === cat.slug
                  ? 'bg-[#0054A6] border-[#0054A6] text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-[#0054A6] hover:text-[#0054A6]'">
                      {{ cat.nome }}
                    </button>
                  }
                </div>
              </div>
            </section>
          }
          <!-- ACCORDION DE TIPOS -->
          <section class="max-w-5xl mx-auto px-6 py-10">
            @if (cursosLoading()) {
              <div class="flex justify-center py-16">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            }
            @if (!cursosLoading() && tipoGrupos().length === 0) {
              <div class="text-center py-16">
                <mat-icon class="text-gray-200" style="font-size:64px;height:64px;width:64px">search_off</mat-icon>
                <p class="text-gray-500 mt-4">Nenhum curso nesta combinação.</p>
                <a [routerLink]="['/unidades', unidadeSlug()]" class="mt-3 inline-block text-[#0054A6] hover:underline no-underline text-sm">
                  ← Voltar para a unidade
                </a>
              </div>
            }
            @if (!cursosLoading() && tipoGrupos().length > 0) {
              <div class="space-y-2">
                @for (grupo of tipoGrupos(); track grupo) {
                  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <button (click)="toggleTipo(grupo.nome)"
                class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50
                       transition-colors cursor-pointer bg-transparent border-0 text-left">
                      <div class="flex items-center gap-3">
                        <span class="font-semibold text-gray-900">{{ grupo.nome }}</span>
                        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {{ grupo.cursos.length }}
                        </span>
                      </div>
                      <mat-icon class="text-gray-500 transition-transform duration-200"
                        [style.transform]="isOpen(grupo.nome) ? 'rotate(180deg)' : 'rotate(0deg)'">
                        expand_more
                      </mat-icon>
                    </button>
                    @if (isOpen(grupo.nome)) {
                      <div class="border-t border-gray-100 px-6 py-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          @for (c of grupo.cursos; track c) {
                            <app-curso-card [curso]="c"></app-curso-card>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>
        }
      </div>
    `
})
export class CursosUnidadeAreaComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  unidadeSlug = signal('');
  unidadeNome = signal('');
  areaSlug = signal('');
  areaNome = signal('');
  area = signal<Area | null>(null);
  todosCursos = signal<Curso[]>([]);
  loadingArea = signal(true);
  cursosLoading = signal(true);
  categoriaSelecionada = signal<string | null>(null);
  openTipos = signal<Set<string>>(new Set());

  tipoGrupos = computed((): TipoGrupo[] => {
    const catSel = this.categoriaSelecionada();
    let cursos = this.todosCursos();
    if (catSel) cursos = cursos.filter(c => c.categorias.some(cat => cat.slug === catSel));

    const map = new Map<string, TipoGrupo>();
    for (const c of cursos) {
      const t = c.tipos[0] ?? { nome: 'Outros', slug: 'outros' };
      if (!map.has(t.nome)) map.set(t.nome, { nome: t.nome, slug: t.slug, cursos: [] });
      map.get(t.nome)!.cursos.push(c);
    }
    return [...map.values()].filter(g => g.cursos.length > 0);
  });

  ngOnInit() {
    const uSlug = this.route.snapshot.paramMap.get('unidadeSlug')!;
    const aSlug = this.route.snapshot.paramMap.get('areaSlug')!;
    this.unidadeSlug.set(uSlug);
    this.areaSlug.set(aSlug);

    forkJoin({
      unidade: this.cursoService.buscarUnidade(uSlug),
      area: this.cursoService.buscarArea(aSlug),
      cursos: this.cursoService.listarCursosDaUnidade(uSlug, { areaSlug: aSlug })
    }).subscribe({
      next: ({ unidade, area, cursos }) => {
        this.unidadeNome.set(unidade.nome);
        this.area.set(area);
        this.areaNome.set(area.nome);
        this.loadingArea.set(false);
        this.todosCursos.set(cursos.content);
        this.cursosLoading.set(false);
      },
      error: () => { this.loadingArea.set(false); this.cursosLoading.set(false); }
    });
  }

  selecionarCategoria(slug: string | null) { this.categoriaSelecionada.set(slug); }

  toggleTipo(nome: string) {
    this.openTipos.update(s => {
      const n = new Set(s);
      if (n.has(nome)) n.delete(nome); else n.add(nome);
      return n;
    });
  }

  isOpen(nome: string): boolean { return this.openTipos().has(nome); }
}
