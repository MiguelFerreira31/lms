import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Curso, Page } from '../../../core/services/curso.service';

@Component({
  selector: 'app-lista-cursos-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Hero / Breadcrumb -->
      <section class="bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6] py-12">
        <div class="max-w-6xl mx-auto px-6">
          <div class="flex items-center gap-2 text-white/60 text-sm mb-4 flex-wrap">
            <a routerLink="/cursos/areas" class="hover:text-white no-underline text-white/60">Áreas</a>
            <mat-icon style="font-size:14px;height:14px;width:14px">chevron_right</mat-icon>
            <a [routerLink]="['/cursos/areas', areaSlug()]" class="hover:text-white no-underline text-white/60 capitalize">
              {{ slugLabel(areaSlug()) }}
            </a>
            <mat-icon style="font-size:14px;height:14px;width:14px">chevron_right</mat-icon>
            <span class="text-white/90 capitalize">{{ slugLabel(categoriaSlug()) }}</span>
          </div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-white mb-2 capitalize">
            {{ slugLabel(categoriaSlug()) }}
          </h1>
          <p class="text-blue-200">
            <span *ngIf="resultado()">{{ resultado()!.totalElements }} curso{{ resultado()!.totalElements !== 1 ? 's' : '' }} encontrado{{ resultado()!.totalElements !== 1 ? 's' : '' }}</span>
          </p>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-6 py-10">

        <div *ngIf="loading()" class="flex justify-center py-20">
          <mat-spinner diameter="48"></mat-spinner>
        </div>

        <!-- Course grid -->
        <div *ngIf="!loading() && resultado()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a *ngFor="let c of resultado()!.content"
             [routerLink]="['/cursos', c.id]"
             class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline group cursor-pointer flex flex-col">
            <!-- Header -->
            <div class="h-36 relative bg-gradient-to-br"
                 [ngClass]="nivelBg(c.nivel)">
              <mat-icon class="absolute top-4 right-4 text-white/20" style="font-size:56px;height:56px;width:56px">school</mat-icon>
              <div class="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                <span class="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {{ nivelLabel(c.nivel) }}
                </span>
                <span *ngFor="let t of c.tipos"
                      class="bg-[#F7941E]/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {{ t.nome }}
                </span>
              </div>
            </div>
            <!-- Body -->
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-bold text-gray-900 text-base mb-2 group-hover:text-[#0054A6] transition-colors"
                  style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                {{ c.titulo }}
              </h3>
              <p class="text-gray-500 text-sm flex-1 mb-4"
                 style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                {{ c.descricao || 'Educação profissional de qualidade.' }}
              </p>
              <div class="flex items-center justify-between pt-3 border-t border-gray-50">
                <span *ngIf="c.unidadeNome" class="text-xs text-gray-400 flex items-center gap-0.5">
                  <mat-icon style="font-size:14px;height:14px;width:14px">location_on</mat-icon>
                  {{ c.unidadeNome }}
                </span>
                <span class="text-sm font-semibold text-[#0054A6] group-hover:underline ml-auto">
                  Ver curso →
                </span>
              </div>
            </div>
          </a>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading() && resultado()?.totalElements === 0" class="text-center py-20">
          <mat-icon class="text-gray-200" style="font-size:64px;height:64px;width:64px">search_off</mat-icon>
          <p class="text-gray-500 mt-4 text-lg">Nenhum curso nesta categoria ainda.</p>
          <a routerLink="/cursos/areas" class="mt-4 inline-block text-[#0054A6] hover:underline no-underline font-medium">
            ← Ver todas as áreas
          </a>
        </div>

        <!-- Pagination -->
        <div *ngIf="resultado() && resultado()!.totalPages > 1" class="mt-8 flex justify-center">
          <mat-paginator
            [length]="resultado()!.totalElements"
            [pageSize]="10"
            [pageIndex]="resultado()!.number"
            (page)="onPage($event)"
            hidePageSize showFirstLastButtons>
          </mat-paginator>
        </div>

      </div>
    </div>
  `
})
export class ListaCursosCategoriaComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  areaSlug = signal('');
  categoriaSlug = signal('');
  resultado = signal<Page<Curso> | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.areaSlug.set(this.route.snapshot.paramMap.get('areaSlug') ?? '');
    this.categoriaSlug.set(this.route.snapshot.paramMap.get('categoriaSlug') ?? '');
    this.carregar();
  }

  carregar(page = 0) {
    this.loading.set(true);
    this.cursoService.listarCursosPorCategoria(this.areaSlug(), this.categoriaSlug(), page).subscribe({
      next: data => { this.resultado.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent) { this.carregar(e.pageIndex); }

  slugLabel(slug: string) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  nivelLabel(nivel: string) {
    return nivel === 'BASICO' ? 'Básico' : nivel === 'INTERMEDIARIO' ? 'Intermediário' : 'Avançado';
  }

  nivelBg(nivel: string) {
    const map: Record<string, string> = {
      'BASICO': 'from-green-400 to-emerald-500',
      'INTERMEDIARIO': 'from-yellow-400 to-orange-400',
      'AVANCADO': 'from-red-400 to-rose-500'
    };
    return map[nivel] ?? 'from-blue-400 to-[#0054A6]';
  }
}
