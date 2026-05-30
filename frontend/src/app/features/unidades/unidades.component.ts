import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Unidade {
  nome: string;
  endereco: string;
  imagem: string;
  mapUrl: string;
}

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-white">

      <!-- Hero -->
      <section class="bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6] py-20 lg:py-28">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <span class="inline-block bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Estado de São Paulo
          </span>
          <h1 class="text-4xl lg:text-5xl font-extrabold text-white mb-4">Nossas Unidades</h1>
          <p class="text-blue-200 text-lg max-w-xl mx-auto leading-relaxed">
            Encontre a unidade mais próxima de você e comece sua jornada de aprendizado profissional.
          </p>
        </div>
      </section>

      <!-- Grid de unidades -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Onde estamos</h2>
            <p class="text-gray-500">Clique em "Como chegar" para abrir a rota no Google Maps</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let u of unidades"
                 class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div class="h-44 overflow-hidden">
                <img [src]="u.imagem" [alt]="'Senac ' + u.nome"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-5">
                <h3 class="font-bold text-gray-900 text-base mb-2">Senac {{ u.nome }}</h3>
                <p class="text-gray-500 text-sm flex items-start gap-1.5 mb-4 leading-relaxed">
                  <mat-icon class="text-[#0054A6] flex-shrink-0" style="font-size:16px;height:16px;width:16px;margin-top:2px">location_on</mat-icon>
                  {{ u.endereco }}
                </p>
                <a [href]="u.mapUrl" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 bg-[#0054A6] hover:bg-[#003087] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors no-underline">
                  <mat-icon style="font-size:16px;height:16px;width:16px">directions</mat-icon>
                  Como chegar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-14 bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6]">
        <div class="max-w-3xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Estude de onde quiser</h2>
          <p class="text-blue-200 text-base mb-8 leading-relaxed">
            Matricule-se online e acesse os cursos de qualquer unidade ou pelo conforto da sua casa.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 bg-[#F7941E] hover:bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors no-underline shadow-lg text-sm">
              <mat-icon style="font-size:20px;height:20px;width:20px">school</mat-icon>
              Matricule-se agora
            </a>
            <a routerLink="/cursos"
               class="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-[#003087] font-bold px-8 py-3.5 rounded-xl transition-all no-underline text-sm">
              Ver cursos disponíveis
            </a>
          </div>
        </div>
      </section>

    </div>
  `
})
export class UnidadesComponent {
  unidades: Unidade[] = [
    {
      nome: 'São Paulo',
      endereco: 'Av. Paulista, 1234 – Bela Vista, São Paulo – SP',
      imagem: 'https://picsum.photos/seed/spunit/400/200',
      mapUrl: 'https://www.google.com/maps/search/Av.+Paulista,+S%C3%A3o+Paulo,+SP'
    },
    {
      nome: 'Guarulhos',
      endereco: 'Av. das Nações Unidas, 600 – Centro, Guarulhos – SP',
      imagem: 'https://picsum.photos/seed/gruunit/400/200',
      mapUrl: 'https://www.google.com/maps/search/Guarulhos,+SP'
    },
    {
      nome: 'Campinas',
      endereco: 'R. Barão de Jaguara, 901 – Centro, Campinas – SP',
      imagem: 'https://picsum.photos/seed/campunit/400/200',
      mapUrl: 'https://www.google.com/maps/search/Campinas,+SP'
    },
    {
      nome: 'Santo André',
      endereco: 'Av. Industrial, 500 – Centro, Santo André – SP',
      imagem: 'https://picsum.photos/seed/saunit/400/200',
      mapUrl: 'https://www.google.com/maps/search/Santo+Andr%C3%A9,+SP'
    },
    {
      nome: 'Ribeirão Preto',
      endereco: 'Av. Independência, 2800 – Jardim Sumaré, Ribeirão Preto – SP',
      imagem: 'https://picsum.photos/seed/rpunit/400/200',
      mapUrl: 'https://www.google.com/maps/search/Ribeir%C3%A3o+Preto,+SP'
    }
  ];
}
