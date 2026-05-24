# LMS — Sistema de Gestão de Aprendizado

Sistema de gestão de cursos educacionais fullstack, inspirado na plataforma de educação profissional do **Senac**. Projeto de portfólio desenvolvido com Spring Boot no backend e Angular no frontend.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Banco de Dados](#3-banco-de-dados)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Segurança e Autenticação](#6-segurança-e-autenticação)
7. [Como Rodar Localmente](#7-como-rodar-localmente)

---

## 1. Visão Geral

O LMS permite que alunos naveguem em catálogos de cursos, se matriculem e acompanhem seu progresso por aula. Administradores gerenciam o catálogo de cursos, visualizam usuários cadastrados e alteram perfis de acesso.

### Papéis de usuário

| Role | Permissões |
|------|-----------|
| `ALUNO` | Login, listar cursos, se matricular, marcar aulas como concluídas, ver próprio progresso |
| `ADMIN` | Tudo do ALUNO + criar/editar/desativar cursos, listar todos os usuários, promover/rebaixar perfis |

---

## 2. Arquitetura

```
lms/
├── backend/          Spring Boot 3.2 — API REST na porta 8080
│   ├── docker-compose.yml
│   └── src/main/java/br/com/lms/
│       ├── config/           SecurityConfig (Spring Security + CORS)
│       ├── domain/
│       │   ├── curso/        Curso, Modulo, Aula + CursoController + CursoRepository
│       │   ├── matricula/    Matricula, ProgressoAula + MatriculaController + repos
│       │   └── usuario/      Usuario + AuthController + UsuarioController + repo
│       ├── dto/              DTOs.java (todos os records de request/response)
│       ├── exception/        GlobalExceptionHandler + ResourceNotFoundException
│       └── security/         JwtTokenProvider + JwtAuthFilter + UserDetailsServiceImpl
│
└── frontend/         Angular 18 — SPA na porta 4200
    └── src/app/
        ├── core/
        │   ├── guards/       authGuard (protege rotas privadas)
        │   ├── interceptors/ JWT interceptor — injeta Bearer token
        │   └── services/     AuthService, CursoService
        ├── features/
        │   ├── login/
        │   ├── dashboard/
        │   ├── cursos/       lista-cursos, detalhe-curso
        │   ├── matriculas/   minhas-matriculas
        │   └── admin/        admin-cursos, admin-usuarios
        └── shared/
            └── navbar/       NavbarComponent (sidebar + top bar)
```

---

## 3. Banco de Dados

**PostgreSQL 15** via Docker. Container `lms-postgres`, porta `5433` (mapeada de 5432 interno).

- Banco: `lmsdb` | Usuário: `lms` | Senha: `lms123`
- Migrations gerenciadas pelo **Flyway** (`src/main/resources/db/migration/`)

### Schema

```sql
-- V1__create_usuarios.sql
CREATE TABLE usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'ALUNO',
    criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- V2__create_cursos.sql
CREATE TABLE cursos (
    id        BIGSERIAL PRIMARY KEY,
    titulo    VARCHAR(200) NOT NULL,
    descricao TEXT,
    nivel     VARCHAR(20)  NOT NULL DEFAULT 'BASICO',
    ativo     BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE TABLE modulos (
    id       BIGSERIAL PRIMARY KEY,
    curso_id BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    titulo   VARCHAR(200) NOT NULL,
    ordem    INT NOT NULL DEFAULT 0
);
CREATE TABLE aulas (
    id          BIGSERIAL PRIMARY KEY,
    modulo_id   BIGINT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    titulo      VARCHAR(200) NOT NULL,
    url_video   VARCHAR(500),
    duracao_min INT NOT NULL DEFAULT 0,
    ordem       INT NOT NULL DEFAULT 0
);

-- V3__create_matriculas.sql
CREATE TABLE matriculas (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT NOT NULL REFERENCES usuarios(id),
    curso_id       BIGINT NOT NULL REFERENCES cursos(id),
    status         VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    matriculado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    concluido_em   TIMESTAMP,
    UNIQUE (usuario_id, curso_id)
);
CREATE TABLE progresso_aulas (
    id           BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id      BIGINT NOT NULL REFERENCES aulas(id),
    concluida    BOOLEAN NOT NULL DEFAULT FALSE,
    concluido_em TIMESTAMP,
    UNIQUE (matricula_id, aula_id)
);
```

### Diagrama de relacionamentos

```
usuarios ──< matriculas >── cursos ──< modulos ──< aulas
               │                                    │
               └──< progresso_aulas >───────────────┘
```

---

## 4. Backend

**Stack:** Java 17 · Spring Boot 3.2 · Maven · Spring Data JPA · Hibernate · Flyway · Lombok · JJWT 0.12

### Endpoints da API

#### Autenticação — `/api/auth` (público)

| Método | Endpoint | Body | Resposta |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{"email","senha"}` | `{token, tipo, nome, email, role}` |
| POST | `/api/auth/register` | `{"nome","email","senha"}` | `{id, nome, email, role}` |

> Novos registros recebem `role = ALUNO` automaticamente.

#### Cursos — `/api/cursos`

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/cursos` | Público | Lista paginada (10/página), filtro por `?nivel=` |
| GET | `/api/cursos/{id}` | Público | Detalhes com módulos e aulas |
| POST | `/api/cursos` | ADMIN | Criar curso |
| PUT | `/api/cursos/{id}` | ADMIN | Atualizar curso |
| DELETE | `/api/cursos/{id}` | ADMIN | Desativar (soft delete — `ativo=false`) |

#### Matrículas — `/api/matriculas` (autenticado)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/matriculas/minhas` | Matrículas do usuário logado |
| POST | `/api/matriculas` | Matricular em curso `{"cursoId"}` |
| GET | `/api/matriculas/{id}/progresso` | Percentual de conclusão |
| POST | `/api/matriculas/progresso` | Marcar aula concluída `{"matriculaId","aulaId"}` |

#### Usuários — `/api/usuarios` (autenticado)

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/usuarios` | ADMIN | Lista todos os usuários |
| GET | `/api/usuarios/me` | Autenticado | Perfil atual (sempre do banco, não do token) |
| PATCH | `/api/usuarios/{id}/role` | ADMIN | Promover/rebaixar usuário `{"role":"ADMIN"\|"ALUNO"}` |

---

## 5. Frontend

**Stack:** Angular 18 · Standalone Components · Signals · Angular Material 18 (tema indigo-pink) · Tailwind CSS · TypeScript

### Rotas

| Rota | Componente | Guard |
|------|-----------|-------|
| `/` | → redirect `/dashboard` | — |
| `/login` | `LoginComponent` | — |
| `/dashboard` | `DashboardComponent` | `authGuard` |
| `/cursos` | `ListaCursosComponent` | `authGuard` |
| `/cursos/:id` | `DetalheCursoComponent` | `authGuard` |
| `/matriculas` | `MinhasMatriculasComponent` | `authGuard` |
| `/admin/cursos` | `AdminCursosComponent` | `authGuard` |
| `/admin/usuarios` | `AdminUsuariosComponent` | `authGuard` |
| `/**` | → redirect `/dashboard` | — |

> Todos os componentes são **lazy-loaded** via `loadComponent`.

### Layout

A interface usa um layout fixo com **top bar** (h-16) + **sidebar colapsável** (w-64) que desaparece em mobile com overlay. O conteúdo principal tem offset `pt-16 lg:pl-64`.

### AuthService

| Método | Descrição |
|--------|-----------|
| `login(credentials)` | POST `/auth/login`, salva token + user no localStorage, atualiza signal |
| `logout()` | Limpa localStorage, zera signal, navega para `/login` |
| `refreshUser()` | GET `/usuarios/me`, sincroniza role do banco com o signal — chamado no constructor |
| `isAdmin()` | Retorna `currentUser()?.role === 'ADMIN'` |
| `isLoggedIn()` | Verifica presença do token no localStorage |

---

## 6. Segurança e Autenticação

### Fluxo JWT

```
1. Cliente envia POST /api/auth/login com email + senha
2. Spring Security autentica via DaoAuthenticationProvider
3. Backend gera JWT com email no subject — sem roles no token
4. Cliente armazena JWT no localStorage
5. JwtAuthFilter a cada request:
   a. Extrai token do header Authorization: Bearer <token>
   b. Valida assinatura HMAC-SHA512
   c. Extrai email do subject
   d. Carrega usuário do banco (role sempre atual)
   e. Seta Authentication no SecurityContext
6. Frontend: refreshUser() no constructor sincroniza o signal com a role do banco
```

> **Detalhe importante:** As roles **não estão no token JWT**. O `JwtAuthFilter` recarrega o usuário do banco a cada request — alterações de role têm efeito imediato no backend. O `refreshUser()` garante sincronia no frontend.

### Autorização (`SecurityConfig`)

```
/api/auth/**                      → público
GET /api/cursos, /api/cursos/**   → público
POST/PUT/DELETE /api/cursos/**    → ROLE_ADMIN
GET /api/usuarios                 → ROLE_ADMIN
PATCH /api/usuarios/**            → ROLE_ADMIN
demais                            → autenticado
```

### Segurança adicional

- Senhas com **BCrypt**
- CORS restrito a `http://localhost:4200`
- Sessão **stateless** (JWT, sem HttpSession)

---

## 7. Como Rodar Localmente

### Pré-requisitos

- Java 17+ com `JAVA_HOME` configurado
- Docker Desktop em execução
- Node.js 18+ e Angular CLI (`npm install -g @angular/cli`)

### 1. Banco de dados

```bash
cd backend
docker compose up -d
# Container lms-postgres na porta 5433
# Flyway aplica as 3 migrations automaticamente
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
# API disponível em http://localhost:8080
```

No Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### 3. Frontend

```bash
cd frontend
npm install    # apenas na primeira vez
ng serve
# App disponível em http://localhost:4200
```

### Promover usuário a ADMIN

```bash
docker exec lms-postgres psql -U lms -d lmsdb \
  -c "UPDATE usuarios SET role='ADMIN' WHERE email='usuario@exemplo.com';"
```
