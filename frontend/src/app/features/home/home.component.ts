import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { CursoService, Curso, Area } from '../../core/services/curso.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private cursoService = inject(CursoService);
  private router = inject(Router);

  cursosDestaque = signal<Curso[]>([]);
  totalCursos = signal(0);
  loading = signal(true);
  pesquisa = signal('');
  areas = signal<Area[]>([]);

  unidadesDestaque = computed(() => {
    const seen = new Set<string>();
    return this.cursosDestaque()
      .filter(c => c.unidadeNome && !seen.has(c.unidadeNome) && seen.add(c.unidadeNome))
      .slice(0, 6);
  });

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cursoService.listarCursos(0).subscribe({
      next: data => {
        this.cursosDestaque.set(data.content);
        this.totalCursos.set(data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.cursoService.listarAreas().subscribe({
      next: data => this.areas.set(data),
      error: () => {}
    });
  }

  irParaCursos(nivel?: string) {
    const queryParams = nivel ? { nivel } : {};
    this.router.navigate(['/cursos'], { queryParams });
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
    return map[nivel] || 'from-blue-400 to-blue-600';
  }

  year = new Date().getFullYear();
}
