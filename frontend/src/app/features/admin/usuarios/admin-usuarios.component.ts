import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CursoService, Unidade, UsuarioResponse } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './admin-usuarios.component.html',
  styles: []
})
export class AdminUsuariosComponent implements OnInit {
  private svc = inject(CursoService);
  private snack = inject(MatSnackBar);

  readonly backendBase = 'http://localhost:8080';
  readonly roles = ['ADMIN', 'PROFESSOR', 'ALUNO'];

  usuarios = signal<UsuarioResponse[]>([]);
  unidades = signal<Unidade[]>([]);
  loading = signal(true);
  salvando = signal(false);
  editandoId = signal<number | null>(null);
  mostrarFormCriar = signal(false);
  fotoPreview = signal<string | null>(null);

  adminCount = computed(() => this.usuarios().filter(u => u.role === 'ADMIN').length);
  professoresCount = computed(() => this.usuarios().filter(u => u.role === 'PROFESSOR').length);

  editForm: { nome: string; email: string; role: string; unidadeId: number | null } = {
    nome: '', email: '', role: 'ALUNO', unidadeId: null
  };

  criarForm: { nome: string; email: string; senha: string } = {
    nome: '', email: '', senha: ''
  };

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.svc.listarUsuarios().subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.svc.listarTodasUnidades().subscribe({
      next: data => this.unidades.set(data)
    });
  }

  abrirEditar(u: UsuarioResponse): void {
    this.editandoId.set(u.id);
    this.editForm = { nome: u.nome, email: u.email, role: u.role, unidadeId: u.unidadeId ?? null };
    this.fotoPreview.set(null);
  }

  fecharEditar(): void {
    this.editandoId.set(null);
    this.fotoPreview.set(null);
  }

  salvarEdicao(userId: number): void {
    if (!this.editForm.nome || !this.editForm.email) return;
    this.salvando.set(true);
    this.svc.atualizarUsuario(userId, this.editForm).subscribe({
      next: (updated) => {
        this.usuarios.update(list => list.map(u => u.id === userId ? updated : u));
        this.fecharEditar();
        this.salvando.set(false);
        this.snack.open('Usuário atualizado!', 'OK', { duration: 3000 });
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao atualizar', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  onFileSelected(event: Event, usuarioId: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
    this.svc.uploadAvatar(usuarioId, file).subscribe({
      next: (updated) => {
        this.usuarios.update(list => list.map(u => u.id === usuarioId ? updated : u));
        this.snack.open('Foto atualizada!', 'OK', { duration: 2000 });
      },
      error: () => {
        this.fotoPreview.set(null);
        this.snack.open('Erro ao fazer upload da foto', 'Fechar', { duration: 3000 });
      }
    });
  }

  abrirCriar(): void {
    this.criarForm = { nome: '', email: '', senha: '' };
    this.mostrarFormCriar.set(true);
  }

  fecharCriar(): void {
    this.mostrarFormCriar.set(false);
  }

  salvarCriar(): void {
    if (!this.criarForm.nome || !this.criarForm.email || this.criarForm.senha.length < 6) return;
    this.salvando.set(true);
    this.svc.criarUsuario(this.criarForm).subscribe({
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

  isEditing(id: number): boolean {
    return this.editandoId() === id;
  }

  getAvatarSrc(u: UsuarioResponse): string | null {
    if (u.avatarUrl) return this.backendBase + u.avatarUrl;
    return null;
  }

  getEditAvatarSrc(u: UsuarioResponse): string | null {
    if (this.fotoPreview()) return this.fotoPreview();
    if (u.avatarUrl) return this.backendBase + u.avatarUrl;
    return null;
  }

  hasPhoto(u: UsuarioResponse): boolean {
    return !!u.avatarUrl;
  }

  hasEditPhoto(u: UsuarioResponse): boolean {
    return !!(this.fotoPreview() || u.avatarUrl);
  }

  getInitial(nome: string): string {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN:     'bg-purple-100 text-purple-700 border border-purple-200',
      PROFESSOR: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      ALUNO:     'bg-indigo-100 text-indigo-700 border border-indigo-200',
    };
    return map[role] ?? 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  getAvatarBg(role: string): string {
    const map: Record<string, string> = {
      ADMIN:     'bg-purple-600',
      PROFESSOR: 'bg-emerald-600',
      ALUNO:     'bg-indigo-600',
    };
    return map[role] ?? 'bg-slate-500';
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
}
