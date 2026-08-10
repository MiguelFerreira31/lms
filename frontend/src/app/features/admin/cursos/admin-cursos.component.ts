import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { CursoService, Curso, MatriculaDetalhe, Unidade, Area, TipoCurso, AulaInfo } from '../../../core/services/curso.service';
import { UploadService } from '../../../core/services/upload.service';
import { ImageUploadComponent } from '../../../shared/image-upload/image-upload.component';
import { mensagemDeErro } from '../../../core/interceptors/error.interceptor';

@Component({
    selector: 'app-admin-cursos',
    imports: [FormsModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, MatTabsModule, ImageUploadComponent],
    templateUrl: './admin-cursos.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./admin-cursos.component.scss']
})
export class AdminCursosComponent implements OnInit {
  private svc = inject(CursoService);
  private uploadSvc = inject(UploadService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  cursos = signal<Curso[]>([]);
  unidades = signal<Unidade[]>([]);
  areas = signal<Area[]>([]);
  tiposDisponiveis = signal<TipoCurso[]>([]);
  categoriasSelecionadas = signal<Set<number>>(new Set());
  tiposSelecionados = signal<Set<number>>(new Set());
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

  // Aulas: geridas por CRUD próprio (POST/PUT/DELETE /api/aulas), à parte do
  // merge incremental de módulos — só existem para módulos já persistidos.
  aulasPorModulo = signal<Record<number, AulaInfo[]>>({});
  moduloAulasExpandido = signal<number | null>(null);
  moduloAulaAtivo = signal<number | null>(null);
  editandoAula = signal<AulaInfo | null>(null);
  salvandoAula = signal(false);

  aulaForm = this.fb.group({
    titulo: ['', [Validators.required]],
    urlVideo: [''],
    duracaoMin: [0, [Validators.required, Validators.min(0)]],
    ordem: [1, [Validators.required]]
  });

  // Formulário estendido com a lista de módulos (FormArray)
  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    nivel: ['BASICO', Validators.required],
    unidadeId: [null as number | null],
    areaId: [null as number | null, Validators.required],
    modulos: this.fb.array([])
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.listarTodosCursos().subscribe({
      next: page => { this.cursos.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.svc.listarTodasUnidades().subscribe({
      next: data => this.unidades.set(data),
      error: err => console.error('Erro ao carregar unidades:', err)
    });
    this.svc.listarAreas().subscribe({
      next: data => this.areas.set(data),
      error: err => console.error('Erro ao carregar áreas:', err)
    });
    this.svc.listarTipos().subscribe({
      next: data => this.tiposDisponiveis.set(data),
      error: err => console.error('Erro ao carregar tipos:', err)
    });
  }

  toggleCategoria(id: number) {
    const set = new Set(this.categoriasSelecionadas());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.categoriasSelecionadas.set(set);
  }

  toggleTipo(id: number) {
    const set = new Set(this.tiposSelecionados());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.tiposSelecionados.set(set);
  }

  // Getter tipado para ler o array de módulos no template HTML
  get modulosFormArray(): FormArray {
    return this.form.get('modulos') as FormArray;
  }

  adicionarModulo() {
    const novaOrdem = this.modulosFormArray.length + 1;
    const moduloGroup = this.fb.group({
      id: [null],
      titulo: ['', [Validators.required]],
      ordem: [novaOrdem, [Validators.required]]
    });
    this.modulosFormArray.push(moduloGroup);
  }

  // Método para remover um módulo e recalcular a ordenação sequencial
  removerModulo(index: number) {
    this.modulosFormArray.removeAt(index);
    this.modulosFormArray.controls.forEach((control, idx) => {
      control.get('ordem')?.setValue(idx + 1);
    });
  }

  // Método abrirForm reconfigurado para limpar e popular o FormArray corretamente
  abrirForm(curso?: Curso) {
    this.editando.set(curso || null);

    // 1. Limpa completamente qualquer resquício do array anterior
    while (this.modulosFormArray.length !== 0) {
      this.modulosFormArray.removeAt(0);
    }

    // 2. Reseta os valores básicos do formulário
    this.form.patchValue({
      titulo: curso?.titulo || '',
      descricao: curso?.descricao || '',
      nivel: curso?.nivel || 'BASICO',
      unidadeId: curso?.unidadeId ?? null,
      areaId: curso?.areaId ?? null
    });

    // 2b. Popula a área/categoria e o tipo de ensino selecionados
    this.categoriasSelecionadas.set(new Set(curso?.categorias?.map(c => c.id) ?? []));
    this.tiposSelecionados.set(new Set(curso?.tipos?.map(t => t.id) ?? []));

    // 3. Se for edição, popula o FormArray dinamicamente buscando os módulos
    if (curso && curso.id) {
      this.svc.buscarCurso(curso.id).subscribe({
        next: (cursoCompleto) => {
          if (cursoCompleto && cursoCompleto.modulos) {
            const aulas: Record<number, AulaInfo[]> = {};
            cursoCompleto.modulos.forEach((mod: any) => {
              this.modulosFormArray.push(this.fb.group({
                id: [mod.id],
                titulo: [mod.titulo || '', [Validators.required]],
                ordem: [mod.ordem, [Validators.required]]
              }));
              aulas[mod.id] = mod.aulas || [];
            });
            this.aulasPorModulo.set(aulas);
          }
        },
        error: (err) => console.error('Erro ao buscar detalhes do curso:', err)
      });
    }

    this.mostrarForm.set(true);
    this.cursoExpandido.set(null);
  }

  // Método fecharForm garantindo a limpeza completa
  fecharForm() {
    this.mostrarForm.set(false);
    this.editando.set(null);
    while (this.modulosFormArray.length !== 0) {
      this.modulosFormArray.removeAt(0);
    }
    this.form.reset();
    this.imagemSelecionada.set(null);
    this.categoriasSelecionadas.set(new Set());
    this.tiposSelecionados.set(new Set());
    this.aulasPorModulo.set({});
    this.moduloAulasExpandido.set(null);
    this.fecharFormAula();
  }

  onCapaSelected(file: File) { this.imagemSelecionada.set(file); }

  getAulas(moduloId: number): AulaInfo[] {
    return this.aulasPorModulo()[moduloId] || [];
  }

  toggleAulasModulo(moduloId: number) {
    this.moduloAulasExpandido.set(this.moduloAulasExpandido() === moduloId ? null : moduloId);
    this.fecharFormAula();
  }

  abrirFormAula(moduloId: number, aula?: AulaInfo) {
    this.editandoAula.set(aula || null);
    this.aulaForm.reset({
      titulo: aula?.titulo || '',
      urlVideo: aula?.urlVideo || '',
      duracaoMin: aula?.duracaoMin ?? 0,
      ordem: aula?.ordem ?? (this.getAulas(moduloId).length + 1)
    });
    this.moduloAulaAtivo.set(moduloId);
  }

  fecharFormAula() {
    this.moduloAulaAtivo.set(null);
    this.editandoAula.set(null);
    this.aulaForm.reset();
  }

  salvarAula(moduloId: number) {
    if (this.aulaForm.invalid) return;
    this.salvandoAula.set(true);
    const v = this.aulaForm.value;
    const dados = {
      titulo: v.titulo!,
      urlVideo: v.urlVideo || null,
      duracaoMin: v.duracaoMin ?? 0,
      ordem: v.ordem ?? 1
    };

    const aula = this.editandoAula();
    const op = aula
      ? this.svc.atualizarAula(aula.id, dados)
      : this.svc.criarAula({ moduloId, ...dados });

    op.subscribe({
      next: (resultado) => {
        this.aulasPorModulo.update(m => {
          const lista = m[moduloId] || [];
          const atualizada = aula
            ? lista.map(a => a.id === resultado.id ? resultado : a)
            : [...lista, resultado];
          return { ...m, [moduloId]: atualizada };
        });
        this.snack.open(aula ? 'Aula atualizada!' : 'Aula criada!', 'OK', { duration: 3000 });
        this.salvandoAula.set(false);
        this.fecharFormAula();
      },
      error: (e) => {
        this.snack.open(mensagemDeErro(e, 'Erro ao salvar aula'), 'Fechar', { duration: 3000 });
        this.salvandoAula.set(false);
      }
    });
  }

  excluirAula(moduloId: number, aula: AulaInfo) {
    if (!confirm(`Excluir a aula "${aula.titulo}"?`)) return;
    this.svc.deletarAula(aula.id).subscribe({
      next: () => {
        this.aulasPorModulo.update(m => ({ ...m, [moduloId]: (m[moduloId] || []).filter(a => a.id !== aula.id) }));
        this.snack.open('Aula excluída!', 'OK', { duration: 3000 });
      },
      error: (e) => this.snack.open(mensagemDeErro(e, 'Erro ao excluir aula'), 'Fechar', { duration: 3000 })
    });
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const v = this.form.value;

    const data = {
      titulo: v.titulo!,
      descricao: v.descricao || '',
      nivel: v.nivel!,
      unidadeId: v.unidadeId ?? null,
      areaId: v.areaId!,
      modulos: v.modulos && v.modulos.length > 0 ? v.modulos : [],
      categoriaIds: Array.from(this.categoriasSelecionadas()),
      tipoIds: Array.from(this.tiposSelecionados())
    };

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
      BASICO: 'bg-green-100 text-sucesso',
      INTERMEDIARIO: 'bg-yellow-100 text-aviso',
      AVANCADO: 'bg-red-100 text-erro'
    };
    return map[nivel] || 'bg-superficie-2 text-texto';
  }

  getStatusClass(status: string): string {
    return status === 'CONCLUIDO' ? 'bg-green-100 text-sucesso' : 'bg-blue-100 text-marca';
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
