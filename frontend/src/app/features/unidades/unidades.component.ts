import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { CursoService, Regiao, Unidade } from '../../core/services/curso.service';

interface GrupoRegiao {
  regiao: Regiao;
  unidades: Unidade[];
}

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-white">

      <!-- Hero -->
      <section class="bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6] py-16 lg:py-20">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <span class="inline-block bg-white/10 text-blue-200 text-xs font-semibold uppercase
                       tracking-widest px-4 py-1.5 rounded-full mb-5">
            Estado de São Paulo
          </span>
          <h1 class="text-4xl lg:text-5xl font-extrabold text-white mb-4">Nossas Unidades</h1>
          <p class="text-blue-200 text-lg max-w-xl mx-auto leading-relaxed">
            Encontre a unidade mais próxima de você e comece sua jornada de aprendizado profissional.
          </p>
        </div>
      </section>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Seções por região -->
      <ng-container *ngIf="!loading()">
        <section *ngFor="let grupo of grupos()"
                 [id]="'regiao-' + grupo.regiao.id"
                 class="py-12 border-b border-gray-100 last:border-0"
                 [class.bg-gray-50]="isRegiaoAtiva(grupo.regiao.id)">
          <div class="max-w-6xl mx-auto px-6">

            <!-- Título da região -->
            <div class="flex items-baseline gap-3 mb-8">
              <h2 class="text-2xl font-bold text-[#1a2e5a]">{{ grupo.regiao.nome }}</h2>
              <span class="text-sm text-gray-400 font-medium">
                {{ grupo.unidades.length }} unidade{{ grupo.unidades.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Grid de unidades -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div *ngFor="let u of grupo.unidades"
                   [id]="'unidade-' + u.id"
                   class="bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col gap-3"
                   [class]="isUnidadeAtiva(u.id)
                     ? 'border-[#0054A6] shadow-lg ring-2 ring-[#0054A6]/20'
                     : 'border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'">

                <!-- Badge destaque -->
                <div *ngIf="isUnidadeAtiva(u.id)"
                     class="self-start bg-[#0054A6] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Unidade selecionada
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <mat-icon class="text-[#0054A6]" style="font-size:18px;height:18px;width:18px">
                      location_city
                    </mat-icon>
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-bold text-gray-900 text-sm leading-snug">{{ u.nome }}</h3>
                    <p *ngIf="u.endereco" class="text-gray-500 text-xs mt-1 leading-relaxed">
                      {{ u.endereco }}
                    </p>
                    <p *ngIf="!u.endereco" class="text-gray-400 text-xs mt-1">
                      {{ grupo.regiao.nome }}
                    </p>
                  </div>
                </div>

                <a [routerLink]="['/unidades', u.slug]"
                   class="self-start inline-flex items-center gap-1.5 text-[#0054A6] text-xs
                          font-semibold hover:underline no-underline mt-auto">
                  <mat-icon style="font-size:14px;height:14px;width:14px">school</mat-icon>
                  Ver cursos
                </a>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <!-- Empty state -->
      <div *ngIf="!loading() && grupos().length === 0"
           class="py-24 text-center text-gray-400">
        <mat-icon style="font-size:48px;height:48px;width:48px" class="mb-4 opacity-40">
          location_off
        </mat-icon>
        <p class="text-lg font-medium">Nenhuma unidade encontrada.</p>
      </div>

      <!-- CTA -->
      <section class="py-14 bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6]">
        <div class="max-w-3xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Estude de onde quiser</h2>
          <p class="text-blue-200 text-base mb-8 leading-relaxed">
            Matricule-se online e acesse os cursos de qualquer unidade ou pelo conforto da sua casa.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 bg-[#F7941E] hover:bg-orange-500
                      text-white font-bold px-8 py-3.5 rounded-xl transition-colors no-underline
                      shadow-lg text-sm">
              <mat-icon style="font-size:20px;height:20px;width:20px">school</mat-icon>
              Matricule-se agora
            </a>
            <a routerLink="/cursos/areas"
               class="inline-flex items-center justify-center gap-2 border-2 border-white text-white
                      hover:bg-white hover:text-[#003087] font-bold px-8 py-3.5 rounded-xl
                      transition-all no-underline text-sm">
              Ver cursos disponíveis
            </a>
          </div>
        </div>
      </section>

    </div>
  `
})
export class UnidadesComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  regioes = signal<Regiao[]>([]);
  todasUnidades = signal<Unidade[]>([]);
  loading = signal(true);
  selectedUnidadeId = signal<number | null>(null);
  selectedRegiaoId = signal<number | null>(null);

  private readonly REGIAO_ORDER = ['Capital', 'Grande São Paulo e Litoral', 'Interior', 'Centros Universitários'];

  grupos = computed<GrupoRegiao[]>(() => {
    const regioes = this.regioes().filter(r => !r.nome.startsWith('Regiao ') && r.totalUnidades > 0);
    const unidades = this.todasUnidades();

    const ordered = this.REGIAO_ORDER
      .map(nome => regioes.find(r => r.nome === nome))
      .filter((r): r is Regiao => !!r);

    const others = regioes.filter(r => !this.REGIAO_ORDER.includes(r.nome));

    return [...ordered, ...others].map(r => ({
      regiao: r,
      unidades: unidades.filter(u => u.regiaoId === r.id)
    })).filter(g => g.unidades.length > 0);
  });

  ngOnInit() {
    forkJoin({
      regioes: this.cursoService.listarRegioes(),
      unidades: this.cursoService.listarTodasUnidades()
    }).subscribe({
      next: ({ regioes, unidades }) => {
        this.regioes.set(regioes);
        this.todasUnidades.set(unidades);
        this.loading.set(false);
        this.scrollAfterLoad();
      },
      error: () => this.loading.set(false)
    });

    this.route.queryParams.subscribe(params => {
      this.selectedUnidadeId.set(params['unidadeId'] ? Number(params['unidadeId']) : null);
      this.selectedRegiaoId.set(params['regiaoId'] ? Number(params['regiaoId']) : null);
    });
  }

  isUnidadeAtiva(id: number): boolean {
    return this.selectedUnidadeId() === id;
  }

  isRegiaoAtiva(id: number): boolean {
    return this.selectedRegiaoId() === id;
  }

  private scrollAfterLoad() {
    setTimeout(() => {
      const uid = this.selectedUnidadeId();
      const rid = this.selectedRegiaoId();
      if (uid) {
        document.getElementById(`unidade-${uid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (rid) {
        document.getElementById(`regiao-${rid}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }
}
