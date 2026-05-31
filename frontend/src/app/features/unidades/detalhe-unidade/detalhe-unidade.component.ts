import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Curso, UnidadeDetalhe } from '../../../core/services/curso.service';
import { CursoCardComponent } from '../../../shared/curso-card/curso-card.component';

interface TipoGrupo { nome: string; slug: string; cursos: Curso[]; }

@Component({
  selector: 'app-detalhe-unidade',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, CursoCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- ══════════════════════════ HERO ══════════════════════════ -->
      <section class="relative" style="min-height:260px">
        <img [src]="'https://picsum.photos/seed/' + unidadeSlug() + '/1600/400'"
             alt="" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-[#0054A6]/80"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-12">
          <!-- breadcrumb -->
          <div class="flex items-center flex-wrap gap-1.5 text-white/70 text-sm mb-6">
            <a routerLink="/home" class="hover:text-white no-underline text-white/70">Home</a>
            <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <a routerLink="/unidades" class="hover:text-white no-underline text-white/70">Unidades</a>
            <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <span *ngIf="unidade()" class="text-white/70">{{ unidade()!.regiaoNome }}</span>
            <mat-icon *ngIf="unidade()" style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <span class="text-white/95">{{ unidade()?.nome }}</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-extrabold text-white mb-2">
            {{ unidade()?.nome ?? 'Carregando...' }}
          </h1>
          <p class="text-white/75">Conheça os cursos disponíveis nesta unidade</p>
        </div>
      </section>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading() && unidade()">

        <!-- ══════════════════════════ CHIPS DE ÁREA ══════════════════════════ -->
        <section *ngIf="unidade()!.areas.length > 0" class="bg-white py-8 border-b border-gray-100">
          <div class="max-w-5xl mx-auto px-6">
            <h2 class="text-base font-bold text-gray-700 mb-4">Áreas disponíveis nesta unidade</h2>
            <div class="flex flex-wrap gap-2.5">
              <a *ngFor="let area of unidade()!.areas"
                 [routerLink]="['/unidades', unidadeSlug(), 'areas', area.slug]"
                 class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 border-[#0054A6]
                        text-[#0054A6] hover:bg-[#0054A6] hover:text-white transition-all no-underline">
                {{ area.nome }}
              </a>
            </div>
          </div>
        </section>

        <!-- ══════════════════════════ ACCORDION POR TIPO ══════════════════════════ -->
        <section class="max-w-5xl mx-auto px-6 py-10">

          <div *ngIf="cursosLoading()" class="flex justify-center py-16">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div *ngIf="!cursosLoading() && tipoGrupos().length === 0" class="text-center py-16">
            <mat-icon class="text-gray-200" style="font-size:64px;height:64px;width:64px">school</mat-icon>
            <p class="text-gray-500 mt-4">Nenhum curso disponível nesta unidade ainda.</p>
            <a routerLink="/cursos/areas"
               class="mt-3 inline-block text-[#0054A6] hover:underline no-underline text-sm font-medium">
              Ver catálogo completo
            </a>
          </div>

          <div *ngIf="!cursosLoading() && tipoGrupos().length > 0" class="space-y-2">
            <div *ngFor="let grupo of tipoGrupos()"
                 class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

              <button (click)="toggleTipo(grupo.nome)"
                class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50
                       transition-colors cursor-pointer bg-transparent border-0 text-left">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-gray-900 text-base">{{ grupo.nome }}</span>
                  <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {{ grupo.cursos.length }} curso{{ grupo.cursos.length !== 1 ? 's' : '' }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/unidades', unidadeSlug(), grupo.slug]"
                     (click)="$event.stopPropagation()"
                     class="text-xs text-[#0054A6] hover:underline no-underline hidden sm:block">
                    Ver todos
                  </a>
                  <mat-icon class="text-gray-500 transition-transform duration-200 flex-shrink-0"
                    [style.transform]="isOpen(grupo.nome) ? 'rotate(180deg)' : 'rotate(0deg)'">
                    expand_more
                  </mat-icon>
                </div>
              </button>

              <div *ngIf="isOpen(grupo.nome)" class="border-t border-gray-100 px-6 py-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <app-curso-card *ngFor="let c of grupo.cursos" [curso]="c"></app-curso-card>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ══════════════════════════ BANNER ══════════════════════════ -->
        <section class="bg-[#001d5c] py-14">
          <div class="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p class="text-white/70 text-sm uppercase tracking-widest font-semibold mb-2">{{ unidade()!.regiaoNome }}</p>
              <h3 class="text-2xl font-extrabold text-white">
                {{ unidade()!.nome }} — mais perto de você
              </h3>
            </div>
            <a routerLink="/cursos/areas"
               class="flex-shrink-0 bg-[#F7941E] hover:bg-orange-500 text-white font-bold px-8 py-3.5
                      rounded-xl transition-colors no-underline whitespace-nowrap">
              Ver todos os cursos
            </a>
          </div>
        </section>

      </ng-container>
    </div>
  `
})
export class DetalheUnidadeComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  unidadeSlug = signal('');
  unidade = signal<UnidadeDetalhe | null>(null);
  todosCursos = signal<Curso[]>([]);
  loading = signal(true);
  cursosLoading = signal(true);
  openTipos = signal<Set<string>>(new Set());

  tipoGrupos = computed((): TipoGrupo[] => {
    const map = new Map<string, TipoGrupo>();
    for (const c of this.todosCursos()) {
      const t = c.tipos[0] ?? { nome: 'Outros', slug: 'outros' };
      if (!map.has(t.nome)) map.set(t.nome, { nome: t.nome, slug: t.slug, cursos: [] });
      map.get(t.nome)!.cursos.push(c);
    }
    return [...map.values()].filter(g => g.cursos.length > 0);
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('unidadeSlug')!;
    this.unidadeSlug.set(slug);

    this.cursoService.buscarUnidade(slug).subscribe({
      next: data => { this.unidade.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.cursoService.listarCursosDaUnidade(slug).subscribe({
      next: data => { this.todosCursos.set(data.content); this.cursosLoading.set(false); },
      error: () => this.cursosLoading.set(false)
    });
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
