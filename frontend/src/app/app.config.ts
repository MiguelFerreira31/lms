import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless: o zone.js saiu do projeto. A detecção de mudança passa a ser
    // disparada por signals, eventos de template e o ciclo do próprio Angular,
    // em vez de por monkey-patching de todas as APIs assíncronas do browser.
    // Ganho concreto neste app: o widget de acessibilidade registra handlers de
    // mousemove (lupa, máscara e guia de leitura) — com zone.js cada movimento
    // do mouse disparava um ciclo de verificação da aplicação inteira.
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withXhr(), withInterceptors([jwtInterceptor, errorInterceptor])),
    // Carrega o pacote de animações sob demanda, em vez de embutir no bundle inicial.
    provideAnimationsAsync()
  ]
};
