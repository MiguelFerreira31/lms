import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Curso } from '../../core/services/curso.service';

@Component({
  selector: 'app-curso-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <a [routerLink]="['/cursos', curso.id]"
       class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1
              transition-all duration-300 no-underline group cursor-pointer flex flex-col h-full">

      <!-- Imagem -->
      <div class="relative overflow-hidden" style="height:148px">
        <img [src]="imagemSrc"
             [alt]="curso.titulo"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <!-- Tags -->
        <div class="absolute top-2 left-2 flex flex-wrap gap-1">
          <span *ngFor="let tipo of curso.tipos.slice(0,1)"
                class="bg-[#F7941E] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
            {{ tipo.nome }}
          </span>
          <span class="bg-[#0054A6]/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full shadow">
            {{ nivelLabel() }}
          </span>
        </div>
      </div>

      <!-- Corpo -->
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-900 text-sm mb-3 group-hover:text-[#0054A6] transition-colors leading-snug"
            style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5rem">
          {{ curso.titulo }}
        </h3>
        <!-- Links de ação -->
        <div class="mt-auto space-y-1.5 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5 text-[#007B40] text-xs font-semibold">
            <mat-icon style="font-size:14px;height:14px;width:14px">check_circle</mat-icon>
            Comprar agora
          </div>
          <div class="flex items-center gap-1.5 text-[#0054A6] text-xs font-semibold">
            <mat-icon style="font-size:14px;height:14px;width:14px">school</mat-icon>
            Bolsas de estudo
          </div>
        </div>
      </div>
    </a>
  `
})
export class CursoCardComponent {
  @Input() curso!: Curso;

  get imagemSrc(): string {
    return this.curso.imagemUrl ?? `https://picsum.photos/seed/curso-${this.curso.id}/300/148`;
  }

  nivelLabel() {
    const map: Record<string, string> = {
      BASICO: 'Básico',
      INTERMEDIARIO: 'Intermediário',
      AVANCADO: 'Avançado'
    };
    return map[this.curso.nivel] ?? this.curso.nivel;
  }
}
