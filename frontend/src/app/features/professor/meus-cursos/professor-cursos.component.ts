import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CursoService, Curso, ConteudoAula } from '../../../core/services/curso.service';

@Component({
  selector: 'app-professor-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule, MatExpansionModule],
  templateUrl: './professor-cursos.component.html',
  styleUrls: ['./professor-cursos.component.scss']
})
export class ProfessorCursosComponent implements OnInit {
  private svc = inject(CursoService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  cursos = signal<Curso[]>([]);
  conteudosPorAula = signal<Record<number, ConteudoAula[]>>({});
  loading = signal(true);
  salvando = signal(false);
  mostrarFormConteudo = signal<number | null>(null);
  tiposConteudo = ['VIDEO', 'PDF', 'TEXTO', 'LINK'];

  formConteudo = this.fb.group({
    titulo: ['', Validators.required],
    tipo: ['TEXTO', Validators.required],
    conteudo: [''],
    ordem: [0]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.svc.meusCursosProfessor().subscribe({
      next: data => { this.cursos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  carregarConteudos(aulaId: number) {
    this.svc.listarConteudos(aulaId).subscribe({
      next: data => this.conteudosPorAula.update(m => ({ ...m, [aulaId]: data }))
    });
  }

  getConteudos(aulaId: number): ConteudoAula[] {
    return this.conteudosPorAula()[aulaId] || [];
  }

  abrirFormConteudo(aulaId: number) {
    this.formConteudo.reset({ titulo: '', tipo: 'TEXTO', conteudo: '', ordem: 0 });
    this.mostrarFormConteudo.set(aulaId);
  }

  fecharFormConteudo() {
    this.mostrarFormConteudo.set(null);
    this.formConteudo.reset();
  }

  salvarConteudo(aulaId: number) {
    if (this.formConteudo.invalid) return;
    this.salvando.set(true);
    const data = {
      titulo: this.formConteudo.value.titulo!,
      tipo: this.formConteudo.value.tipo!,
      conteudo: this.formConteudo.value.conteudo || '',
      ordem: this.formConteudo.value.ordem || 0
    };
    this.svc.criarConteudo(aulaId, data).subscribe({
      next: () => {
        this.snack.open('Conteúdo adicionado!', 'OK', { duration: 3000 });
        this.fecharFormConteudo();
        this.carregarConteudos(aulaId);
        this.salvando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao adicionar conteúdo', 'Fechar', { duration: 3000 });
        this.salvando.set(false);
      }
    });
  }

  deletarConteudo(aulaId: number, conteudoId: number) {
    if (!confirm('Excluir este conteúdo?')) return;
    this.svc.deletarConteudo(aulaId, conteudoId).subscribe({
      next: () => {
        this.snack.open('Conteúdo excluído!', 'OK', { duration: 3000 });
        this.carregarConteudos(aulaId);
      },
      error: () => this.snack.open('Erro ao excluir conteúdo', 'Fechar', { duration: 3000 })
    });
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      VIDEO: 'play_circle', PDF: 'picture_as_pdf',
      TEXTO: 'article', LINK: 'link'
    };
    return icons[tipo] || 'description';
  }

  getTipoColor(tipo: string): string {
    const colors: Record<string, string> = {
      VIDEO: 'text-red-500', PDF: 'text-orange-500',
      TEXTO: 'text-blue-500', LINK: 'text-green-500'
    };
    return colors[tipo] || 'text-gray-500';
  }

  getLoadedAulaIds(): number[] {
    return Object.keys(this.conteudosPorAula()).map(Number);
  }
}
