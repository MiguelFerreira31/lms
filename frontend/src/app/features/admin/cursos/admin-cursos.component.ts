import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { CursoService, Curso, MatriculaDetalhe, Unidade } from '../../../core/services/curso.service';
import { UploadService } from '../../../core/services/upload.service';
import { ImageUploadComponent } from '../../../shared/image-upload/image-upload.component';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatTabsModule, ImageUploadComponent],
  templateUrl: './admin-cursos.component.html',
  styleUrls: ['./admin-cursos.component.scss']
})
export class AdminCursosComponent implements OnInit {
  private svc = inject(CursoService);
  private uploadSvc = inject(UploadService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  cursos = signal<Curso[]>([]);
  unidades = signal<Unidade[]>([]);
  loading = signal(true);
  salvando = signal(false);
  editando = signal<Curso | null>(null);
  mostrarForm = signal(false);
  cursoExpandido = signal<number | null>(null);
  imagemSelecionada = signal<File | null>(null);
  uploadandoCapa = signal(false);
  matriculasCurso = signal<Record<number, MatriculaDetalhe[]>>({});
  loadingAlunos = signal<number | null>(null);
  notasEditando = signal<Record<number, string>>({});
  salvandoNota = signal<number | null>(null);
  niveis = ['BASICO', 'INTERMEDIARIO', 'AVANCADO'];
  colunas = ['titulo', 'nivel', 'criado', 'acoes'];

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    nivel: ['BASICO', Validators.required],
    unidadeId: [null as number | null]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.listarCursos(0).subscribe({
      next: page => { this.cursos.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.svc.listarTodasUnidades().subscribe({
      next: data => this.unidades.set(data),
      error: err => console.error('Erro ao carregar unidades:', err)
    });
  }

  abrirForm(curso?: Curso) {
    this.editando.set(curso || null);
    this.form.reset({
      titulo: curso?.titulo || '',
      descricao: curso?.descricao || '',
      nivel: curso?.nivel || 'BASICO',
      unidadeId: curso?.unidadeId ?? null
    });
    this.mostrarForm.set(true);
    this.cursoExpandido.set(null);
  }

  fecharForm() { this.mostrarForm.set(false); this.editando.set(null); this.form.reset(); this.imagemSelecionada.set(null); }

  onCapaSelected(file: File) { this.imagemSelecionada.set(file); }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const v = this.form.value;
    const data = { titulo: v.titulo!, descricao: v.descricao || '', nivel: v.nivel!, unidadeId: v.unidadeId ?? null };
    const isEdicao = !!this.editando();
    const op = isEdicao
      ? this.svc.atualizarCurso(this.editando()!.id, data)
      : this.svc.criarCurso(data);
    op.subscribe({
      next: (curso: Curso) => {
        this.salvando.set(false);
        const imagem = this.imagemSelecionada();
        if (imagem) {
          this.uploadandoCapa.set(true);
          this.uploadSvc.uploadCurso(curso.id, imagem).subscribe({
            next: () => { this.uploadandoCapa.set(false); this.fecharForm(); this.carregar(); },
            error: () => { this.uploadandoCapa.set(false); this.fecharForm(); this.carregar(); }
          });
        } else {
          this.fecharForm();
          this.carregar();
        }
        this.snack.open(isEdicao ? 'Curso atualizado!' : 'Curso criado!', 'OK', { duration: 3000 });
      },
      error: () => { this.snack.open('Erro ao salvar curso', 'Fechar', { duration: 3000 }); this.salvando.set(false); }
    });
  }

  excluir(curso: Curso) {
    if (!confirm(`Desativar o curso "${curso.titulo}"?`)) return;
    this.svc.deletarCurso(curso.id).subscribe({
      next: () => { this.snack.open('Curso desativado!', 'OK', { duration: 3000 }); this.carregar(); },
      error: () => this.snack.open('Erro ao desativar curso', 'Fechar', { duration: 3000 })
    });
  }

  // --- Alunos e notas ---
  toggleAlunos(cursoId: number) {
    if (this.cursoExpandido() === cursoId) {
      this.cursoExpandido.set(null);
      return;
    }
    this.mostrarForm.set(false);
    this.cursoExpandido.set(cursoId);
    this.carregarAlunos(cursoId);
  }

  carregarAlunos(cursoId: number) {
    this.loadingAlunos.set(cursoId);
    this.svc.listarMatriculasCurso(cursoId).subscribe({
      next: data => {
        this.matriculasCurso.update(m => ({ ...m, [cursoId]: data }));
        const notas: Record<number, string> = {};
        data.forEach(mat => { notas[mat.id] = mat.nota != null ? String(mat.nota) : ''; });
        this.notasEditando.update(n => ({ ...n, ...notas }));
        this.loadingAlunos.set(null);
      },
      error: () => this.loadingAlunos.set(null)
    });
  }

  getAlunos(cursoId: number): MatriculaDetalhe[] {
    return this.matriculasCurso()[cursoId] || [];
  }

  getNota(matriculaId: number): string {
    return this.notasEditando()[matriculaId] ?? '';
  }

  setNota(matriculaId: number, valor: string) {
    this.notasEditando.update(n => ({ ...n, [matriculaId]: valor }));
  }

  lancarNota(matricula: MatriculaDetalhe, cursoId: number) {
    const notaStr = this.getNota(matricula.id);
    const nota = parseFloat(notaStr);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      this.snack.open('Nota inválida. Use um valor entre 0 e 10.', 'Fechar', { duration: 3000 });
      return;
    }
    this.salvandoNota.set(matricula.id);
    this.svc.lancarNota(matricula.id, nota).subscribe({
      next: () => {
        this.snack.open(`Nota ${nota} lançada para ${matricula.usuarioNome}!`, 'OK', { duration: 3000 });
        this.salvandoNota.set(null);
        this.carregarAlunos(cursoId);
      },
      error: () => {
        this.snack.open('Erro ao lançar nota', 'Fechar', { duration: 3000 });
        this.salvandoNota.set(null);
      }
    });
  }

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      BASICO: 'bg-green-100 text-green-800',
      INTERMEDIARIO: 'bg-yellow-100 text-yellow-800',
      AVANCADO: 'bg-red-100 text-red-800'
    };
    return map[nivel] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    return status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
