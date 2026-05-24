import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CursoService, Regiao, Unidade } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-regioes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatExpansionModule],
  templateUrl: './admin-regioes.component.html',
  styleUrls: ['./admin-regioes.component.scss']
})
export class AdminRegioesComponent implements OnInit {
  private svc = inject(CursoService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  regioes = signal<Regiao[]>([]);
  unidadesPorRegiao = signal<Record<number, Unidade[]>>({});
  loading = signal(true);
  salvando = signal(false);
  mostrarFormRegiao = signal(false);
  editandoRegiao = signal<Regiao | null>(null);
  mostrarFormUnidade = signal<number | null>(null);
  editandoUnidade = signal<Unidade | null>(null);

  formRegiao = this.fb.group({ nome: ['', Validators.required] });
  formUnidade = this.fb.group({
    nome: ['', Validators.required],
    endereco: ['']
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.listarRegioes().subscribe({
      next: data => {
        this.regioes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  carregarUnidades(regiaoId: number) {
    this.svc.listarUnidades(regiaoId).subscribe({
      next: data => this.unidadesPorRegiao.update(m => ({ ...m, [regiaoId]: data }))
    });
  }

  // --- Regiões ---
  abrirFormRegiao(regiao?: Regiao) {
    this.editandoRegiao.set(regiao || null);
    this.formRegiao.setValue({ nome: regiao?.nome || '' });
    this.mostrarFormRegiao.set(true);
  }

  fecharFormRegiao() {
    this.mostrarFormRegiao.set(false);
    this.editandoRegiao.set(null);
    this.formRegiao.reset();
  }

  salvarRegiao() {
    if (this.formRegiao.invalid) return;
    this.salvando.set(true);
    const nome = this.formRegiao.value.nome!;
    const editando = this.editandoRegiao();

    const obs = editando
      ? this.svc.atualizarRegiao(editando.id, nome)
      : this.svc.criarRegiao(nome);

    obs.subscribe({
      next: () => {
        this.snack.open(editando ? 'Região atualizada!' : 'Região criada!', 'OK', { duration: 3000 });
        this.fecharFormRegiao();
        this.carregar();
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao salvar região', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  deletarRegiao(regiao: Regiao) {
    if (!confirm(`Excluir a região "${regiao.nome}" e todas as suas unidades?`)) return;
    this.svc.deletarRegiao(regiao.id).subscribe({
      next: () => {
        this.snack.open('Região excluída!', 'OK', { duration: 3000 });
        this.carregar();
      },
      error: () => this.snack.open('Erro ao excluir região', 'Fechar', { duration: 3000 })
    });
  }

  // --- Unidades ---
  abrirFormUnidade(regiaoId: number, unidade?: Unidade) {
    this.editandoUnidade.set(unidade || null);
    this.formUnidade.setValue({ nome: unidade?.nome || '', endereco: unidade?.endereco || '' });
    this.mostrarFormUnidade.set(regiaoId);
  }

  fecharFormUnidade() {
    this.mostrarFormUnidade.set(null);
    this.editandoUnidade.set(null);
    this.formUnidade.reset();
  }

  salvarUnidade(regiaoId: number) {
    if (this.formUnidade.invalid) return;
    this.salvando.set(true);
    const data = { nome: this.formUnidade.value.nome!, endereco: this.formUnidade.value.endereco || '' };
    const editando = this.editandoUnidade();

    const obs = editando
      ? this.svc.atualizarUnidade(regiaoId, editando.id, data)
      : this.svc.criarUnidade(regiaoId, data);

    obs.subscribe({
      next: () => {
        this.snack.open(editando ? 'Unidade atualizada!' : 'Unidade criada!', 'OK', { duration: 3000 });
        this.fecharFormUnidade();
        this.carregarUnidades(regiaoId);
        this.carregar();
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao salvar unidade', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  deletarUnidade(regiaoId: number, unidade: Unidade) {
    if (!confirm(`Excluir a unidade "${unidade.nome}"?`)) return;
    this.svc.deletarUnidade(regiaoId, unidade.id).subscribe({
      next: () => {
        this.snack.open('Unidade excluída!', 'OK', { duration: 3000 });
        this.carregarUnidades(regiaoId);
        this.carregar();
      },
      error: () => this.snack.open('Erro ao excluir unidade', 'Fechar', { duration: 3000 })
    });
  }

  getUnidades(regiaoId: number): Unidade[] {
    return this.unidadesPorRegiao()[regiaoId] || [];
  }
}
