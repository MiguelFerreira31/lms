# LMS Lite — Frontend

Interface web para o sistema de gestão de cursos, consumindo a API REST do lms-backend.

## Stack

- **Angular 18** com standalone components
- **Angular Material 18** (tema indigo-pink)
- **Angular Signals** para gerenciamento de estado
- **RxJS** com lazy loading por rota
- **TypeScript**

## Funcionalidades

- 🔐 Autenticação com JWT (login + cadastro)
- 📚 Listagem de cursos com filtro por nível e paginação
- 📖 Detalhe do curso com accordion de módulos e aulas
- ✅ Matrícula em cursos com feedback visual
- 📊 Dashboard com progresso das matrículas
- 🔒 Auth Guard protegendo rotas privadas
- 🔑 HTTP Interceptor injetando JWT automaticamente

## Arquitetura

```
src/app/
├── core/
│   ├── guards/          # authGuard — redireciona para /login
│   ├── interceptors/    # jwtInterceptor — injeta Bearer token
│   └── services/        # AuthService, CursoService
├── features/
│   ├── login/           # Tabs login + criar conta
│   ├── dashboard/       # Cards de navegação e resumo
│   ├── cursos/
│   │   ├── lista-cursos/    # Grid paginada com filtro por nível
│   │   └── detalhe-curso/   # Accordion de módulos + botão matricular
│   └── matriculas/      # Cards com barra de progresso por curso
└── shared/
    └── navbar/          # Toolbar Material com menu do usuário
```

## Como rodar

### Pré-requisitos
- Node 18+
- Angular CLI: `npm install -g @angular/cli`
- Backend rodando em `http://localhost:8080`

### Instalar dependências
```bash
npm install
```

### Rodar em desenvolvimento
```bash
ng serve
```

Acesse `http://localhost:4200`

## Configuração da API

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Relacionado

- [lms-backend](https://github.com/miguelccezarferreira/lms-backend) — API Spring Boot que esta interface consome
