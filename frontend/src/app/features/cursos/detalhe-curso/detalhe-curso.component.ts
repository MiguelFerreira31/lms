import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { CursoService } from '../../../core/services/curso.service';

@Component({
  selector: 'app-detalhe-curso',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule, MatExpansionModule],
  templateUrl: './detalhe-curso.component.html',
  styleUrls: ['./detalhe-curso.component.scss']
})
export class DetalheCursoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cursoService = inject(CursoService);
  private snack = inject(MatSnackBar);
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
    this.matriculando.set(true);
    this.cursoService.matricular(this.curso().id).subscribe({
      next: () => { this.snack.open('Matrícula realizada!', 'OK', { duration: 3000 }); this.matriculando.set(false); },
      error: (e: any) => { this.snack.open(e.error?.message || 'Erro ao matricular', 'Fechar', { duration: 3000 }); this.matriculando.set(false); }
    });
  }
}
