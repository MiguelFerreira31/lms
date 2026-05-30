import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { CursoService } from '../../../core/services/curso.service';

@Component({
  selector: 'app-detalhe-curso',
  standalone: true,
  imports: [CommonModule, NgClass, RouterModule, MatSnackBarModule, MatProgressSpinnerModule, MatExpansionModule, MatIconModule],
  templateUrl: './detalhe-curso.component.html',
  styleUrls: ['./detalhe-curso.component.scss']
})
export class DetalheCursoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursoService = inject(CursoService);
  private snack = inject(MatSnackBar);
  auth = inject(AuthService);

  curso = signal<any>(null);
  loading = signal(true);
  matriculando = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cursoService.buscarCurso(id).subscribe({
      next: data => { this.curso.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  matricular() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.matriculando.set(true);
    this.cursoService.matricular(this.curso().id).subscribe({
      next: () => {
        this.snack.open('Matrícula realizada com sucesso!', 'OK', { duration: 3000 });
        this.matriculando.set(false);
      },
      error: (e: any) => {
        this.snack.open(e.error?.message || 'Erro ao realizar matrícula', 'Fechar', { duration: 3000 });
        this.matriculando.set(false);
      }
    });
  }

  getNivelClass(nivel: string): string {
    const map: Record<string, string> = {
      'BASICO': 'bg-green-100 text-green-700',
      'INTERMEDIARIO': 'bg-yellow-100 text-yellow-700',
      'AVANCADO': 'bg-red-100 text-red-700'
    };
    return map[nivel] || 'bg-gray-100 text-gray-700';
  }

  getNivelBg(nivel: string): string {
    const map: Record<string, string> = {
      'BASICO': 'from-green-400 to-emerald-500',
      'INTERMEDIARIO': 'from-yellow-400 to-orange-400',
      'AVANCADO': 'from-red-400 to-rose-500'
    };
    return map[nivel] || 'from-blue-500 to-[#0054A6]';
  }

  getTotalAulas(): number {
    const modulos = this.curso()?.modulos;
    if (!modulos) return 0;
    return modulos.reduce((acc: number, m: any) => acc + (m.aulas?.length || 0), 0);
  }
}
