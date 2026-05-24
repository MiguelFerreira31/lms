import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { CursoService, Matricula, Progresso } from '../../core/services/curso.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface MatriculaComProgresso extends Matricula {
  progresso?: Progresso;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private cursoService = inject(CursoService);

  matriculas = signal<MatriculaComProgresso[]>([]);
  totalCursos = signal(0);
  loading = signal(true);

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

  getProgressoColor(pct: number): string {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 40) return 'text-yellow-600';
    return 'text-indigo-600';
  }
}
