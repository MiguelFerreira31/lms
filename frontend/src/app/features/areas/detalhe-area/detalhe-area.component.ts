import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Area } from '../../../core/services/curso.service';

@Component({
  selector: 'app-detalhe-area',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Hero -->
      <section class="bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6] py-14">
        <div class="max-w-6xl mx-auto px-6">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-white/60 text-sm mb-6">
            <a routerLink="/cursos/areas" class="hover:text-white transition-colors no-underline text-white/60">Áreas</a>
            <mat-icon style="font-size:16px;height:16px;width:16px">chevron_right</mat-icon>
            <span class="text-white/90">{{ area()?.nome }}</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-extrabold text-white mb-3">{{ area()?.nome }}</h1>
          <p class="text-blue-200 text-lg">
            {{ area()?.categorias?.length }} categorias disponíveis
          </p>
        </div>
      </section>

      <div *ngIf="loading()" class="flex justify-center py-20">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Categorias -->
      <section *ngIf="!loading() && area()" class="py-14">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Escolha uma categoria</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <a *ngFor="let cat of area()!.categorias"
               [routerLink]="['/cursos/areas', area()!.slug, cat.slug]"
               class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0054A6] hover:-translate-y-1 transition-all duration-300 p-6 no-underline group cursor-pointer flex items-center gap-4">
              <div class="w-12 h-12 bg-[#EBF4FF] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#0054A6] transition-colors">
                <mat-icon class="text-[#0054A6] group-hover:text-white transition-colors">folder_open</mat-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 group-hover:text-[#0054A6] transition-colors">{{ cat.nome }}</h3>
                <p class="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
                  Ver cursos
                  <mat-icon style="font-size:14px;height:14px;width:14px">chevron_right</mat-icon>
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

    </div>
  `
})
export class DetalheAreaComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  area = signal<Area | null>(null);
  loading = signal(true);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('areaSlug')!;
    this.cursoService.buscarArea(slug).subscribe({
      next: data => { this.area.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
