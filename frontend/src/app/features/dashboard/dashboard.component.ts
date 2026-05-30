import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { CursoService, Matricula, Progresso, Curso } from '../../core/services/curso.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface MatriculaComProgresso extends Matricula {
  progresso?: Progresso;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private cursoService = inject(CursoService);
  private router = inject(Router);

  matriculas = signal<MatriculaComProgresso[]>([]);
  cursosDestaque = signal<Curso[]>([]);
  totalCursos = signal(0);
  loading = signal(true);
  pesquisa = signal('');

  emAndamento = computed(() => this.matriculas().filter(m => m.status === 'EM_ANDAMENTO'));
  concluidos = computed(() => this.matriculas().filter(m => m.status === 'CONCLUIDO'));
  mediaProgresso = computed(() => {
    const lista = this.emAndamento();
    if (!lista.length) return 0;
    const soma = lista.reduce((acc, m) => acc + (m.progresso?.percentual || 0), 0);
    return Math.round(soma / lista.length);
  });

  hora = new Date().getHours();
  saudacao = this.hora < 12 ? 'Bom dia' : this.hora < 18 ? 'Boa tarde' : 'Boa noite';

  ngOnInit() {
    forkJoin({
      matriculas: this.cursoService.minhasMatriculas(),
      cursos: this.cursoService.listarCursos(0)
    }).subscribe({
      next: ({ matriculas, cursos }) => {
        this.totalCursos.set(cursos.totalElements);
        this.cursosDestaque.set(cursos.content.slice(0, 6));
        if (!matriculas.length) { this.matriculas.set([]); this.loading.set(false); return; }
        const progressos$ = matriculas.map(m =>
          this.cursoService.progresso(m.id).pipe(catchError(() => of(null)))
        );
        forkJoin(progressos$).subscribe(progressos => {
          this.matriculas.set(matriculas.map((m, i) => ({ ...m, progresso: progressos[i] as Progresso })));
          this.loading.set(false);
        });
      },
      error: () => this.loading.set(false)
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
      'BASICO': 'bg-green-400',
      'INTERMEDIARIO': 'bg-yellow-400',
      'AVANCADO': 'bg-red-400'
    };
    return map[nivel] || 'bg-gray-400';
  }
}
