import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sobre',
    imports: [RouterLink, MatIconModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    <div class="min-h-screen bg-superficie">
    
      <!-- Hero -->
      <section class="bg-gradient-to-br from-marca-profunda via-marca-escura to-marca py-20 lg:py-28">
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
      <section class="py-16 bg-superficie">
        <div class="max-w-4xl mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center gap-10">
            <div class="w-24 h-24 bg-marca rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-200">
              <mat-icon class="text-white" style="font-size:44px;height:44px;width:44px">emoji_objects</mat-icon>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-texto mb-4">Nossa Missão</h2>
              <p class="text-texto-suave text-lg leading-relaxed">
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
      <section class="py-14 bg-fundo">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-3xl font-bold text-texto text-center mb-10">Em números</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            @for (s of stats; track s) {
              <div
                class="bg-superficie rounded-2xl p-8 text-center shadow-md border border-borda hover:shadow-lg hover:-translate-y-1 transition-all">
                <div class="w-12 h-12 bg-marca-suave rounded-xl flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="text-marca">{{ s.icon }}</mat-icon>
                </div>
                <div class="text-4xl font-extrabold text-marca mb-2">{{ s.valor }}</div>
                <div class="text-texto-suave font-medium">{{ s.label }}</div>
              </div>
            }
          </div>
        </div>
      </section>
    
      <!-- Stack tecnológica -->
      <section class="py-16 bg-superficie">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-texto mb-4">Stack Tecnológica</h2>
          <p class="text-texto-suave mb-10">Tecnologias utilizadas no desenvolvimento do projeto</p>
          <div class="flex flex-wrap justify-center gap-3">
            @for (tech of techs; track tech) {
              <span
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 cursor-default"
                [class]="tech.classes">
                <mat-icon style="font-size:18px;height:18px;width:18px">{{ tech.icon }}</mat-icon>
                {{ tech.nome }}
              </span>
            }
          </div>
        </div>
      </section>
    
      <!-- CTA -->
      <section class="py-14 bg-gradient-to-br from-marca-profunda via-marca-escura to-marca">
        <div class="max-w-3xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Explore o projeto</h2>
          <p class="text-blue-200 text-base mb-8 leading-relaxed">
            Acesse a plataforma ou veja o código-fonte completo no GitHub.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login"
              class="inline-flex items-center justify-center gap-2 bg-destaque hover:bg-destaque-escuro text-white font-bold px-8 py-3.5 rounded-xl transition-colors no-underline shadow-lg text-sm">
              <mat-icon style="font-size:20px;height:20px;width:20px">login</mat-icon>
              Acessar a plataforma
            </a>
            <a href="https://github.com/MiguelFerreira31/lms" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-marca-escura font-bold px-8 py-3.5 rounded-xl transition-all no-underline text-sm">
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
    { nome: 'Angular 18', icon: 'web', classes: 'border-red-300 text-erro bg-red-50 hover:bg-erro/15' },
    { nome: 'Spring Boot 3.2', icon: 'eco', classes: 'border-green-300 text-sucesso bg-green-50 hover:bg-green-100' },
    { nome: 'Java 17', icon: 'coffee', classes: 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100' },
    { nome: 'PostgreSQL', icon: 'storage', classes: 'border-blue-300 text-marca bg-blue-50 hover:bg-marca-suave' },
    { nome: 'Docker', icon: 'inventory_2', classes: 'border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-100' },
    { nome: 'JWT', icon: 'lock', classes: 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100' },
    { nome: 'Tailwind CSS', icon: 'style', classes: 'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100' },
    { nome: 'Flyway', icon: 'flight_takeoff', classes: 'border-gray-300 text-texto bg-fundo hover:bg-superficie-2' }
  ];
}
