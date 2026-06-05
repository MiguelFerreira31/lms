import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CursoService, Curso, Professor } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-professores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './admin-professores.component.html',
  styleUrls: ['./admin-professores.component.scss']
})
export class AdminProfessoresComponent implements OnInit {
  private svc = inject(CursoService);
  private snack = inject(MatSnackBar);

  professores = signal<Professor[]>([]);
  cursos = signal<Curso[]>([]);
  cursosPorProfessor = signal<Record<number, Curso[]>>({});
  professorExpandido = signal<number | null>(null);
  loading = signal(true);
  vinculandoProfessor = signal<number | null>(null);
  cursoSelecionado = signal<Record<number, number | null>>({});
  colunas = ['professor', 'email', 'acoes'];

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.listarProfessores().subscribe({
      next: profs => {
        this.professores.set(profs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.svc.listarCursos(0).subscribe({
      next: page => this.cursos.set(page.content)
    });
  }

  expandirProfessor(prof: Professor) {
    const atual = this.professorExpandido();
    if (atual === prof.id) {
      this.professorExpandido.set(null);
    } else {
      this.professorExpandido.set(prof.id);
      this.carregarCursosProfessor(prof.id);
    }
  }

  carregarCursosProfessor(professorId: number) {
    this.svc.cursosDoProfessor(professorId).subscribe({
      next: data => this.cursosPorProfessor.update(m => ({ ...m, [professorId]: data }))
    });
  }

  getCursosProfessor(professorId: number): Curso[] {
    return this.cursosPorProfessor()[professorId] || [];
  }

  getCursoSelecionado(professorId: number): number | null {
    return this.cursoSelecionado()[professorId] ?? null;
  }

  setCursoSelecionado(professorId: number, cursoId: number | null) {
    this.cursoSelecionado.update(m => ({ ...m, [professorId]: cursoId }));
  }

  vincular(professorId: number) {
    const cursoId = this.getCursoSelecionado(professorId);
    if (!cursoId) return;
    this.vinculandoProfessor.set(professorId);
    this.svc.vincularProfessorCurso(professorId, cursoId).subscribe({
      next: () => {
        this.snack.open('Curso vinculado!', 'OK', { duration: 3000 });
        this.setCursoSelecionado(professorId, null);
        this.carregarCursosProfessor(professorId);
        this.vinculandoProfessor.set(null);
      },
      error: () => {
        this.snack.open('Erro ao vincular curso', 'Fechar', { duration: 3000 });
        this.vinculandoProfessor.set(null);
      }
    });
  }

  desvincular(professorId: number, cursoId: number) {
    this.svc.desvincularProfessorCurso(professorId, cursoId).subscribe({
      next: () => {
        this.snack.open('Curso desvinculado!', 'OK', { duration: 3000 });
        this.carregarCursosProfessor(professorId);
      },
      error: () => this.snack.open('Erro ao desvincular', 'Fechar', { duration: 3000 })
    });
  }

  getIniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  cursosDisponiveis(professorId: number): Curso[] {
    const vinculados = this.getCursosProfessor(professorId).map(c => c.id);
    return this.cursos().filter(c => !vinculados.includes(c.id));
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
