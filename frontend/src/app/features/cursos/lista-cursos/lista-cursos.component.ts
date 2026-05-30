import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CursoService, Curso, Page, Regiao, Unidade } from '../../../core/services/curso.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lista-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatPaginatorModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './lista-cursos.component.html',
  styleUrls: ['./lista-cursos.component.scss']
})
export class ListaCursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private route = inject(ActivatedRoute);

  cursos = signal<Page<Curso> | null>(null);
  loading = signal(true);
  nivelFiltro = signal<string>('');
  regiaoFiltro = signal<number | null>(null);
  unidadeFiltro = signal<number | null>(null);
  regioes = signal<Regiao[]>([]);
  todasUnidades = signal<Unidade[]>([]);

  regiaoSelecionada = signal<string>('');
  unidadeSelecionada = signal<string>('');

  niveis = ['BASICO', 'INTERMEDIARIO', 'AVANCADO'];
  nivelLabels: Record<string, string> = {
    'BASICO': 'Básico',
    'INTERMEDIARIO': 'Intermediário',
    'AVANCADO': 'Avançado'
  };

  unidadesFiltradas = computed(() => {
    const regiaoId = this.regiaoFiltro();
    if (!regiaoId) return this.todasUnidades();
    return this.todasUnidades().filter(u => u.regiaoId === regiaoId);
  });

  temFiltroAtivo = computed(() =>
    !!this.nivelFiltro() || !!this.regiaoFiltro() || !!this.unidadeFiltro()
  );

  ngOnInit() {
    forkJoin({
      regioes: this.cursoService.listarRegioes(),
      unidades: this.cursoService.listarTodasUnidades()
    }).subscribe(({ regioes, unidades }) => {
      this.regioes.set(regioes);
      this.todasUnidades.set(unidades);
    });

    this.route.queryParams.subscribe(params => {
      if (params['nivel']) this.nivelFiltro.set(params['nivel']);
      this.carregar();
    });
  }

  carregar(page = 0) {
    this.loading.set(true);
    this.cursoService.listarCursos(page, this.nivelFiltro() || undefined, this.unidadeFiltro() || undefined).subscribe({
      next: data => { this.cursos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onNivel(nivel: string) { this.nivelFiltro.set(nivel); this.carregar(); }

  onRegiaoChange(val: string) {
    this.regiaoSelecionada.set(val);
    this.regiaoFiltro.set(val ? Number(val) : null);
    this.unidadeSelecionada.set('');
    this.unidadeFiltro.set(null);
    this.carregar();
  }

  onUnidadeChange(val: string) {
    this.unidadeSelecionada.set(val);
    this.unidadeFiltro.set(val ? Number(val) : null);
    this.carregar();
  }

  limparFiltros() {
    this.nivelFiltro.set('');
    this.regiaoFiltro.set(null);
    this.unidadeFiltro.set(null);
    this.regiaoSelecionada.set('');
    this.unidadeSelecionada.set('');
    this.carregar();
  }

  onPage(event: PageEvent) { this.carregar(event.pageIndex); }

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      'BASICO': 'bg-green-100 text-green-700',
      'INTERMEDIARIO': 'bg-yellow-100 text-yellow-700',
      'AVANCADO': 'bg-red-100 text-red-700'
    };
    return map[nivel] || 'bg-gray-100 text-gray-700';
  }

  getNivelBg(nivel: string): string {
    const map: Record<string, string> = {
      'BASICO': 'bg-green-400',
      'INTERMEDIARIO': 'bg-yellow-400',
      'AVANCADO': 'bg-red-400'
    };
    return map[nivel] || 'bg-gray-400';
  }
}
