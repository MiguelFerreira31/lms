import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Curso, Page } from '../../../core/services/curso.service';

@Component({
  selector: 'app-lista-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatSelectModule, MatFormFieldModule, MatPaginatorModule, MatProgressSpinnerModule],
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
}
