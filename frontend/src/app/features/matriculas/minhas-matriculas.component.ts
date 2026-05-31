import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CursoService, Matricula, Progresso } from '../../core/services/curso.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-minhas-matriculas',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressBarModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './minhas-matriculas.component.html',
  styleUrls: ['./minhas-matriculas.component.scss']
})
export class MinhasMatriculasComponent implements OnInit {
  private cursoService = inject(CursoService);
  matriculas = signal<(Matricula & { progresso?: Progresso })[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.cursoService.minhasMatriculas().subscribe({
      next: lista => {
        if (!lista.length) { this.matriculas.set([]); this.loading.set(false); return; }
        const progressos$ = lista.map(m => this.cursoService.progresso(m.id).pipe(catchError(() => of(null))));
        forkJoin(progressos$).subscribe({
          next: progressos => {
            this.matriculas.set(lista.map((m, i) => ({ ...m, progresso: progressos[i] as Progresso })));
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  trackById = (_: number, item: { id: number }) => item.id;
}
