import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CursoService, Curso } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './admin-cursos.component.html',
  styleUrls: ['./admin-cursos.component.scss']
})
export class AdminCursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  cursos = signal<Curso[]>([]);
  loading = signal(true);
  salvando = signal(false);
  editando = signal<Curso | null>(null);
  mostrarForm = signal(false);
  niveis = ['BASICO', 'INTERMEDIARIO', 'AVANCADO'];
  colunas = ['titulo', 'nivel', 'criado', 'acoes'];

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    nivel: ['BASICO', Validators.required]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.cursoService.listarCursos(0).subscribe({
      next: page => { this.cursos.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirForm(curso?: Curso) {
    this.editando.set(curso || null);
    this.form.reset({ titulo: curso?.titulo || '', descricao: curso?.descricao || '', nivel: curso?.nivel || 'BASICO' });
    this.mostrarForm.set(true);
  }

  fecharForm() { this.mostrarForm.set(false); this.editando.set(null); this.form.reset(); }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data = this.form.value as { titulo: string; descricao: string; nivel: string };
    const op = this.editando()
      ? this.cursoService.atualizarCurso(this.editando()!.id, data)
      : this.cursoService.criarCurso(data);

    op.subscribe({
      next: () => {
        this.snack.open(this.editando() ? 'Curso atualizado!' : 'Curso criado!', 'OK', { duration: 3000 });
        this.fecharForm();
        this.carregar();
        this.salvando.set(false);
      },
      error: () => { this.snack.open('Erro ao salvar curso', 'Fechar', { duration: 3000 }); this.salvando.set(false); }
    });
  }

  excluir(curso: Curso) {
    if (!confirm(`Desativar o curso "${curso.titulo}"?`)) return;
    this.cursoService.deletarCurso(curso.id).subscribe({
      next: () => { this.snack.open('Curso desativado!', 'OK', { duration: 3000 }); this.carregar(); },
      error: () => this.snack.open('Erro ao desativar curso', 'Fechar', { duration: 3000 })
    });
  }

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      'BASICO': 'bg-green-100 text-green-800',
      'INTERMEDIARIO': 'bg-yellow-100 text-yellow-800',
      'AVANCADO': 'bg-red-100 text-red-800'
    };
    return map[nivel] || 'bg-gray-100 text-gray-800';
  }
}
