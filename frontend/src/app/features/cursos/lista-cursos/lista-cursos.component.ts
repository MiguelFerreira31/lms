import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CursoService, Curso, Page } from '../../../core/services/curso.service';

@Component({
  selector: 'app-lista-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatPaginatorModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './lista-cursos.component.html',
  styleUrls: ['./lista-cursos.component.scss']
})
export class ListaCursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  cursos = signal<Page<Curso> | null>(null);
  loading = signal(true);
  nivelFiltro = signal<string>('');
  niveis = ['BASICO', 'INTERMEDIARIO', 'AVANCADO'];

  ngOnInit() { this.carregar(); }

  carregar(page = 0) {
    this.loading.set(true);
    this.cursoService.listarCursos(page, this.nivelFiltro() || undefined).subscribe({
      next: data => { this.cursos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onNivel(nivel: string) { this.nivelFiltro.set(nivel); this.carregar(); }
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
