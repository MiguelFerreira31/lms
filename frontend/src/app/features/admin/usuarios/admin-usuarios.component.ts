import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CursoService } from '../../../core/services/curso.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  usuarios = signal<any[]>([]);
  loading = signal(true);
  salvando = signal(false);
  editandoRole = signal<number | null>(null);
  mostrarForm = signal(false);
  colunas = ['usuario', 'email', 'role', 'acoes'];
  adminCount = computed(() => this.usuarios().filter(u => u.role === 'ADMIN').length);

  form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.cursoService.listarUsuarios().subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirForm() { this.form.reset(); this.mostrarForm.set(true); }
  fecharForm() { this.mostrarForm.set(false); this.form.reset(); }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.cursoService.criarUsuario(this.form.value as any).subscribe({
      next: () => {
        this.snack.open('Usuário criado!', 'OK', { duration: 3000 });
        this.fecharForm();
        this.carregar();
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao criar usuário', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  alternarRole(usuario: any) {
    const novaRole = usuario.role === 'ADMIN' ? 'ALUNO' : 'ADMIN';
    this.editandoRole.set(usuario.id);
    this.cursoService.atualizarRole(usuario.id, novaRole).subscribe({
      next: () => {
        this.snack.open(`Perfil alterado para ${novaRole}!`, 'OK', { duration: 3000 });
        this.editandoRole.set(null);
        this.carregar();
      },
      error: () => {
        this.snack.open('Erro ao alterar perfil', 'Fechar', { duration: 3000 });
        this.editandoRole.set(null);
      }
    });
  }

  getIniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getAvatarColor(role: string): string {
    return role === 'ADMIN' ? 'bg-purple-600' : 'bg-indigo-600';
  }
}
