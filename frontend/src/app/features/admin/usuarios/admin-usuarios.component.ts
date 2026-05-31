import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { CursoService, Unidade } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  private svc = inject(CursoService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  usuarios = signal<any[]>([]);
  unidades = signal<Unidade[]>([]);
  loading = signal(true);
  salvando = signal(false);
  editandoId = signal<number | null>(null);
  mostrarFormCriar = signal(false);
  colunas = ['usuario', 'email', 'role', 'unidade', 'acoes'];
  roles = ['ADMIN', 'PROFESSOR', 'ALUNO'];

  adminCount = computed(() => this.usuarios().filter(u => u.role === 'ADMIN').length);
  professoresCount = computed(() => this.usuarios().filter(u => u.role === 'PROFESSOR').length);

  formCriar = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  formEditar = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['ALUNO', Validators.required],
    unidadeId: [null as number | null]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.listarUsuarios().subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.svc.listarTodasUnidades().subscribe({
      next: data => this.unidades.set(data),
      error: err => console.error('Erro ao carregar unidades:', err)
    });
  }

  abrirEditar(u: any) {
    this.editandoId.set(u.id);
    this.formEditar.setValue({
      nome: u.nome,
      email: u.email,
      role: u.role,
      unidadeId: u.unidadeId ?? null
    });
  }

  fecharEditar() {
    this.editandoId.set(null);
    this.formEditar.reset();
  }

  salvarEdicao(userId: number) {
    if (this.formEditar.invalid) return;
    this.salvando.set(true);
    const v = this.formEditar.value;
    this.svc.atualizarUsuario(userId, {
      nome: v.nome!,
      email: v.email!,
      role: v.role!,
      unidadeId: v.unidadeId ?? null
    }).subscribe({
      next: () => {
        this.snack.open('Usuário atualizado!', 'OK', { duration: 3000 });
        this.fecharEditar();
        this.carregar();
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao atualizar usuário', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  abrirCriar() { this.formCriar.reset(); this.mostrarFormCriar.set(true); }
  fecharCriar() { this.mostrarFormCriar.set(false); this.formCriar.reset(); }

  salvarCriar() {
    if (this.formCriar.invalid) return;
    this.salvando.set(true);
    this.svc.criarUsuario(this.formCriar.value as any).subscribe({
      next: () => {
        this.snack.open('Usuário criado!', 'OK', { duration: 3000 });
        this.fecharCriar();
        this.carregar();
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao criar usuário', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  getIniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      PROFESSOR: 'bg-emerald-100 text-emerald-800',
      ALUNO: 'bg-blue-100 text-blue-800'
    };
    return map[role] || 'bg-gray-100 text-gray-800';
  }

  getAvatarColor(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-600', PROFESSOR: 'bg-emerald-600', ALUNO: 'bg-indigo-600'
    };
    return map[role] || 'bg-gray-600';
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
