import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-white">

      <!-- Hero -->
      <section class="bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6] py-20 lg:py-28">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <span class="inline-block bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Projeto de Portfólio
          </span>
          <h1 class="text-4xl lg:text-5xl font-extrabold text-white mb-4">Sobre o LMS Lite</h1>
          <p class="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Sistema fullstack de gestão de cursos educacionais desenvolvido para demonstrar
            competências em Java, Angular e boas práticas de engenharia de software.
          </p>
        </div>
      </section>

      <!-- Nossa Missão -->
      <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center gap-10">
            <div class="w-24 h-24 bg-[#0054A6] rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-200">
              <mat-icon class="text-white" style="font-size:44px;height:44px;width:44px">emoji_objects</mat-icon>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
              <p class="text-gray-600 text-lg leading-relaxed">
                O LMS Lite foi criado para demonstrar uma aplicação fullstack completa, moderna e escalável.
                Utilizamos as melhores tecnologias do mercado para oferecer uma plataforma de gestão educacional
                com autenticação segura por JWT, controle de acesso por roles (Admin, Professor, Aluno)
                e experiência fluida em todas as telas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Números -->
      <section class="py-14 bg-gray-50">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-10">Em números</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div *ngFor="let s of stats"
                 class="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div class="w-12 h-12 bg-[#EBF4FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-[#0054A6]">{{ s.icon }}</mat-icon>
              </div>
              <div class="text-4xl font-extrabold text-[#0054A6] mb-2">{{ s.valor }}</div>
              <div class="text-gray-600 font-medium">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stack tecnológica -->
      <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Stack Tecnológica</h2>
          <p class="text-gray-500 mb-10">Tecnologias utilizadas no desenvolvimento do projeto</p>
          <div class="flex flex-wrap justify-center gap-3">
            <span *ngFor="let tech of techs"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 cursor-default"
                  [class]="tech.classes">
              <mat-icon style="font-size:18px;height:18px;width:18px">{{ tech.icon }}</mat-icon>
              {{ tech.nome }}
            </span>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-14 bg-gradient-to-br from-[#001d5c] via-[#003087] to-[#0054A6]">
        <div class="max-w-3xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Explore o projeto</h2>
          <p class="text-blue-200 text-base mb-8 leading-relaxed">
            Acesse a plataforma ou veja o código-fonte completo no GitHub.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login"
               class="inline-flex items-center justify-center gap-2 bg-[#F7941E] hover:bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors no-underline shadow-lg text-sm">
              <mat-icon style="font-size:20px;height:20px;width:20px">login</mat-icon>
              Acessar a plataforma
            </a>
            <a href="https://github.com/MiguelFerreira31/lms" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-[#003087] font-bold px-8 py-3.5 rounded-xl transition-all no-underline text-sm">
              <mat-icon style="font-size:20px;height:20px;width:20px">code</mat-icon>
              Ver no GitHub
            </a>
          </div>
        </div>
      </section>

    </div>
  `
})
export class SobreComponent {
  stats = [
    { valor: '500+', label: 'Alunos', icon: 'group' },
    { valor: '50+', label: 'Cursos', icon: 'menu_book' },
    { valor: '10+', label: 'Instrutores', icon: 'school' }
  ];

  techs = [
    { nome: 'Angular 18', icon: 'web', classes: 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' },
    { nome: 'Spring Boot 3.2', icon: 'eco', classes: 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' },
    { nome: 'Java 17', icon: 'coffee', classes: 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100' },
    { nome: 'PostgreSQL', icon: 'storage', classes: 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' },
    { nome: 'Docker', icon: 'inventory_2', classes: 'border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-100' },
    { nome: 'JWT', icon: 'lock', classes: 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100' },
    { nome: 'Tailwind CSS', icon: 'style', classes: 'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100' },
    { nome: 'Flyway', icon: 'flight_takeoff', classes: 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100' }
  ];
}
