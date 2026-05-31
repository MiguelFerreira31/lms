import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { CursoService, Curso } from '../../../core/services/curso.service';
import { CursoCardComponent } from '../../../shared/curso-card/curso-card.component';

interface GrupoArea { areaNome: string; areaSlug: string; cursos: Curso[]; }

const PER_PAGE = 4;

@Component({
  selector: 'app-lista-cursos-tipo',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, CursoCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- ══════════════════════════ HERO ══════════════════════════ -->
      <section class="relative" style="min-height:340px">
        <img [src]="'https://picsum.photos/seed/' + tipoSlug() + '-hero/1600/500?grayscale'"
             alt="" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/60"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-12 flex flex-col items-center text-center">
          <!-- breadcrumb -->
          <div class="flex items-center gap-1.5 text-white/60 text-sm mb-8">
            <a routerLink="/home" class="hover:text-white no-underline text-white/60">Home</a>
            <mat-icon style="font-size:13px;height:13px;width:13px">chevron_right</mat-icon>
            <span class="text-white/90">Cursos {{ tipoNome() }}</span>
          </div>

          <!-- título -->
          <h1 class="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            <span class="text-[#F7941E]">Cursos</span>
            <span class="text-white"> {{ tipoNome() }}</span>
          </h1>
          <p class="text-white/75 text-base lg:text-lg mb-9 max-w-xl">
            Aprenda em cursos rápidos, práticos e conectados com as novidades do mercado.
          </p>

          <!-- campo de busca -->
          <div class="flex w-full max-w-xl shadow-lg rounded-xl overflow-hidden">
            <input
              [value]="busca()"
              (input)="setBusca($any($event.target).value)"
              placeholder="Pesquisar curso..."
              class="flex-1 px-5 py-3.5 text-gray-900 text-sm outline-none border-0">
            <button class="bg-[#F7941E] hover:bg-orange-500 transition-colors px-5 flex items-center justify-center border-0 cursor-pointer">
              <mat-icon class="text-white">search</mat-icon>
            </button>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════ CHIPS DE ÁREA ══════════════════════════ -->
      <section class="bg-white py-9 border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-6 text-center">
          <h2 class="text-xl font-bold text-gray-800 mb-6">Qual a sua área de interesse?</h2>
          <div class="flex flex-wrap justify-center gap-2.5">

            <button (click)="selecionarArea(null)"
              class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
              [class]="!areaSelecionada()
                ? 'bg-[#F7941E] border-[#F7941E] text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-[#F7941E] hover:text-[#F7941E]'">
              Todos
            </button>

            <button *ngFor="let area of areasDisponiveis()"
              (click)="selecionarArea(area.slug)"
              class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
              [class]="areaSelecionada() === area.slug
                ? 'bg-[#F7941E] border-[#F7941E] text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-[#F7941E] hover:text-[#F7941E]'">
              {{ area.nome }}
            </button>

          </div>
        </div>
      </section>

      <!-- ══════════════════════════ LOADING ══════════════════════════ -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- ══════════════════════════ GRUPOS POR ÁREA ══════════════════════════ -->
      <section *ngIf="!loading()" class="max-w-5xl mx-auto px-6 py-12 space-y-14">

        <!-- Estado vazio -->
        <div *ngIf="gruposVisiveis().length === 0" class="text-center py-16">
          <mat-icon class="text-gray-200" style="font-size:64px;height:64px;width:64px">search_off</mat-icon>
          <p class="text-gray-500 mt-4 text-lg">Nenhum curso encontrado.</p>
          <a routerLink="/cursos/areas" class="mt-4 inline-block text-[#0054A6] hover:underline no-underline font-medium">
            ← Ver catálogo de áreas
          </a>
        </div>

        <!-- Um bloco por área -->
        <div *ngFor="let grupo of gruposVisiveis()">

          <!-- Título da área (link azul) -->
          <h2 class="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <a [routerLink]="['/cursos/areas', grupo.areaSlug]"
               class="text-[#0054A6] hover:underline no-underline">{{ grupo.areaNome }}</a>
            <span class="text-gray-400 font-normal text-base">({{ grupo.cursos.length }})</span>
          </h2>

          <!-- Mobile: scroll horizontal snapping -->
          <div class="flex gap-4 overflow-x-auto pb-3 lg:hidden snap-x snap-mandatory -mx-6 px-6">
            <div *ngFor="let c of grupo.cursos"
                 class="flex-shrink-0 snap-start" style="width:240px">
              <app-curso-card [curso]="c"></app-curso-card>
            </div>
          </div>

          <!-- Desktop: carousel com setas prev / next -->
          <div class="hidden lg:flex items-center gap-2">

            <!-- Seta anterior -->
            <button (click)="prev(grupo.areaSlug)"
              [disabled]="getPage(grupo.areaSlug) === 0"
              class="flex-shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center
                     justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              [class.opacity-30]="getPage(grupo.areaSlug) === 0"
              [class.cursor-not-allowed]="getPage(grupo.areaSlug) === 0">
              <mat-icon style="font-size:20px;height:20px;width:20px">chevron_left</mat-icon>
            </button>

            <!-- Grid de 4 cards -->
            <div class="flex-1 grid grid-cols-4 gap-4">
              <app-curso-card
                *ngFor="let c of cursosVisiveis(grupo.cursos, grupo.areaSlug)"
                [curso]="c">
              </app-curso-card>
            </div>

            <!-- Seta próxima -->
            <button (click)="next(grupo.areaSlug, grupo.cursos.length)"
              [disabled]="(getPage(grupo.areaSlug) + 1) * 4 >= grupo.cursos.length"
              class="flex-shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center
                     justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              [class.opacity-30]="(getPage(grupo.areaSlug) + 1) * 4 >= grupo.cursos.length"
              [class.cursor-not-allowed]="(getPage(grupo.areaSlug) + 1) * 4 >= grupo.cursos.length">
              <mat-icon style="font-size:20px;height:20px;width:20px">chevron_right</mat-icon>
            </button>

          </div>

        </div>
      </section>

    </div>
  `
})
export class ListaCursosTipoComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  tipoSlug = signal('');
  tipoNome = signal('');
  todosCursos = signal<Curso[]>([]);
  loading = signal(true);
  busca = signal('');
  areaSelecionada = signal<string | null>(null);
  pages = signal<Record<string, number>>({});

  areasDisponiveis = computed(() => {
    const map = new Map<string, string>();
    for (const c of this.todosCursos()) {
      const s = c.categorias[0]?.areaSlug;
      const n = c.categorias[0]?.areaNome;
      if (s && n) map.set(s, n);
    }
    return [...map.entries()].map(([slug, nome]) => ({ slug, nome }));
  });

  gruposVisiveis = computed((): GrupoArea[] => {
    const busca = this.busca().toLowerCase().trim();
    const areaSel = this.areaSelecionada();

    let cursos = this.todosCursos();
    if (busca) cursos = cursos.filter(c => c.titulo.toLowerCase().includes(busca));

    const map = new Map<string, GrupoArea>();
    for (const c of cursos) {
      const aNome = c.categorias[0]?.areaNome ?? 'Outras';
      const aSlug = c.categorias[0]?.areaSlug ?? 'outras';
      if (!map.has(aSlug)) map.set(aSlug, { areaNome: aNome, areaSlug: aSlug, cursos: [] });
      map.get(aSlug)!.cursos.push(c);
    }

    const all = [...map.values()];
    return areaSel ? all.filter(g => g.areaSlug === areaSel) : all;
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('tipoSlug') ?? '';
    this.tipoSlug.set(slug);

    forkJoin({
      tipos: this.cursoService.listarTipos(),
      cursos: this.cursoService.listarTodosCursosTipo(slug)
    }).subscribe({
      next: ({ tipos, cursos }) => {
        const tipo = tipos.find(t => t.slug === slug);
        this.tipoNome.set(tipo?.nome ?? this.slugLabel(slug));
        this.todosCursos.set(cursos.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setBusca(val: string) {
    this.busca.set(val);
    this.pages.set({});
  }

  selecionarArea(slug: string | null) {
    this.areaSelecionada.set(slug);
    this.pages.set({});
  }

  getPage(areaSlug: string): number {
    return this.pages()[areaSlug] ?? 0;
  }

  cursosVisiveis(cursos: Curso[], areaSlug: string): Curso[] {
    const p = this.pages()[areaSlug] ?? 0;
    return cursos.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
  }

  next(areaSlug: string, total: number) {
    const p = this.getPage(areaSlug);
    if ((p + 1) * PER_PAGE < total) {
      this.pages.update(m => ({ ...m, [areaSlug]: p + 1 }));
    }
  }

  prev(areaSlug: string) {
    const p = this.getPage(areaSlug);
    if (p > 0) this.pages.update(m => ({ ...m, [areaSlug]: p - 1 }));
  }

  private slugLabel(slug: string) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
