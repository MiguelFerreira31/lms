# CLAUDE.md — Contexto do Projeto LMS Lite

Este arquivo fornece contexto completo para assistência com IA neste projeto.

## O que é este projeto

Sistema LMS (Learning Management System) fullstack de portfólio. Permite que alunos se matriculem em cursos e acompanhem progresso. Admins gerenciam o catálogo.

## Stack e versões

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 17, Spring Boot 3.2, Maven |
| Segurança | Spring Security + JJWT 0.12 (JWT) |
| Persistência | Spring Data JPA + Hibernate + Flyway |
| Banco | PostgreSQL 15 via Docker |
| Frontend | Angular 18, standalone components, Signals |
| UI | Angular Material 18, tema indigo-pink |

## Pacotes e caminhos importantes

```
Backend:  C:\Users\Miguel\Downloads\lms\backend\
  Pacote base:    br.com.lms
  Porta:          8080
  JAVA_HOME:      C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr

Frontend: C:\Users\Miguel\Downloads\lms\frontend\
  Porta:          4200
  API base URL:   http://localhost:8080/api  (environment.ts)

Banco:    lms-postgres (Docker)
  Porta host:     5433 → 5432 interno
  Banco:          lmsdb  |  Usuário: lms  |  Senha: lms123
```

## Como subir o ambiente

```powershell
# 1. Banco (Docker)
cd lms\backend
docker compose up -d

# 2. Backend
$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
.\mvnw.cmd spring-boot:run

# 3. Frontend (outro terminal)
cd lms\frontend
ng serve
```

## Estrutura de arquivos do backend

```
src/main/java/br/com/lms/
├── LmsApplication.java
├── config/
│   └── SecurityConfig.java          # CORS, regras de autorização, filtros
├── domain/
│   ├── curso/
│   │   ├── Aula.java
│   │   ├── Curso.java               # enum Nivel: BASICO, INTERMEDIARIO, AVANCADO
│   │   ├── CursoController.java     # GET/POST/PUT/DELETE /api/cursos
│   │   ├── CursoRepository.java
│   │   └── Modulo.java
│   ├── matricula/
│   │   ├── Matricula.java           # enum Status: EM_ANDAMENTO, CONCLUIDO
│   │   ├── MatriculaController.java # /api/matriculas
│   │   ├── MatriculaRepository.java
│   │   ├── ProgressoAula.java
│   │   └── ProgressoAulaRepository.java
│   └── usuario/
│       ├── AuthController.java      # /api/auth/login, /api/auth/register
│       ├── Usuario.java             # enum Role: ADMIN, ALUNO — implements UserDetails
│       ├── UsuarioController.java   # GET /api/usuarios, GET /api/usuarios/me
│       └── UsuarioRepository.java
├── dto/
│   └── DTOs.java                    # Todos os records: AuthRequest, AuthResponse,
│                                    # CursoRequest, CursoResumoResponse, CursoDetalheResponse,
│                                    # MatriculaRequest, MatriculaResponse, ProgressoResponse,
│                                    # MarcarAulaRequest, UsuarioResponse, RegisterRequest
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
└── security/
    ├── JwtAuthFilter.java           # OncePerRequestFilter — extrai email do JWT, carrega user do banco
    ├── JwtTokenProvider.java        # Gera e valida JWT (HMAC-SHA512, subject = email, SEM roles)
    └── UserDetailsServiceImpl.java  # Carrega Usuario pelo email do banco
```

## Estrutura de arquivos do frontend

```
src/app/
├── app.routes.ts                    # Todas as rotas com lazy load
├── core/
│   ├── guards/
│   │   └── auth.guard.ts            # authGuard: verifica isLoggedIn(), redireciona com returnUrl
│   ├── interceptors/                # JWT interceptor (injeta Authorization: Bearer)
│   └── services/
│       ├── auth.service.ts          # Signal currentUser, login/logout/refreshUser/isAdmin
│       └── curso.service.ts
├── features/
│   ├── login/
│   ├── dashboard/
│   ├── cursos/
│   │   ├── lista-cursos/
│   │   └── detalhe-curso/
│   ├── matriculas/
│   │   └── minhas-matriculas.component.ts
│   └── admin/
│       ├── cursos/admin-cursos.component.ts
│       └── usuarios/admin-usuarios.component.ts
└── shared/
    └── navbar/navbar.component.ts   # Botão Admin visível via *ngIf="auth.isAdmin()"
```

## Regras de autorização da API

| Endpoint | Acesso |
|----------|--------|
| `POST /api/auth/**` | Público |
| `GET /api/cursos`, `GET /api/cursos/{id}` | Público |
| `POST/PUT/DELETE /api/cursos/**` | ROLE_ADMIN |
| `GET /api/usuarios` | ROLE_ADMIN |
| `GET /api/usuarios/me` | Autenticado |
| `GET /api/matriculas/minhas` | Autenticado |
| `POST /api/matriculas` | Autenticado |
| `GET /api/matriculas/{id}/progresso` | Autenticado |
| `POST /api/matriculas/progresso` | Autenticado |

## Como funciona o JWT (detalhe importante)

O token JWT armazena **apenas o email** no subject — **roles não estão no token**.

A cada request, o `JwtAuthFilter` extrai o email e carrega o `Usuario` do banco via `UserDetailsServiceImpl`. Isso significa:
- Alterações de role no banco têm efeito imediato no backend (sem precisar gerar novo token).
- No frontend, o `AuthService.refreshUser()` é chamado no constructor — ele faz `GET /api/usuarios/me` e sincroniza o signal `currentUser` com o role atual do banco.

## Usuário de teste (admin)

```
Email: miguel@lms.com
Senha: 123456
Role:  ADMIN (atualizado diretamente no banco em 2026-05-23)
```

Para promover qualquer usuário a ADMIN:
```bash
docker exec lms-postgres psql -U lms -d lmsdb \
  -c "UPDATE usuarios SET role='ADMIN' WHERE email='<email>';"
```

## Migrations Flyway

```
src/main/resources/db/migration/
├── V1__create_usuarios.sql     # tabela usuarios
├── V2__create_cursos.sql       # tabelas cursos, modulos, aulas
└── V3__create_matriculas.sql   # tabelas matriculas, progresso_aulas
```

`spring.jpa.hibernate.ddl-auto=validate` — Hibernate valida o schema mas NÃO o altera. Mudanças no schema exigem nova migration SQL.

## Repositórios GitHub

- Backend:  https://github.com/MiguelFerreira31/lms-backend
- Frontend: https://github.com/MiguelFerreira31/lms-frontend

Branch principal: `master`
