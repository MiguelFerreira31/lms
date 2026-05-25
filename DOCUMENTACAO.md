# Documentação Técnica — LMS Lite

Sistema de gestão de cursos educacionais fullstack. Projeto de portfólio desenvolvido com Spring Boot no backend e Angular no frontend.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Banco de Dados](#3-banco-de-dados)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Segurança e Autenticação](#6-segurança-e-autenticação)
7. [Como Rodar Localmente](#7-como-rodar-localmente)
8. [Repositórios GitHub](#8-repositórios-github)

---

## 1. Visão Geral

O LMS Lite permite que alunos naveguem em catálogos de cursos, se matriculem e acompanhem seu progresso por aula. Administradores gerenciam o catálogo de cursos e visualizam usuários cadastrados.

### Papéis de usuário

| Role  | Permissões |
|-------|-----------|
| `ALUNO` | Login, listar cursos, se matricular, marcar aulas como concluídas, ver próprio progresso |
| `ADMIN` | Tudo do ALUNO + criar/editar/desativar cursos, listar todos os usuários |

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
        │   ├── interceptors/ (JWT interceptor — injeta Bearer token)
        │   └── services/     AuthService, CursoService
        ├── features/
        │   ├── login/
        │   ├── dashboard/
        │   ├── cursos/       lista-cursos, detalhe-curso
        │   ├── matriculas/   minhas-matriculas
        │   └── admin/        admin-cursos, admin-usuarios
        └── shared/
            └── navbar/       NavbarComponent
```

---

## 3. Banco de Dados

**PostgreSQL 15** via Docker. Container `lms-postgres`, porta `5433` (mapeada de 5432 interno).

- Banco: `lmsdb` | Usuário: `lms` | Senha: `lms123`
- Migrations gerenciadas pelo **Flyway** (diretório `src/main/resources/db/migration/`)

### Schema

```sql
-- V1__create_usuarios.sql
CREATE TABLE usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'ALUNO',  -- 'ADMIN' ou 'ALUNO'
    criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- V2__create_cursos.sql
CREATE TABLE cursos (
    id        BIGSERIAL PRIMARY KEY,
    titulo    VARCHAR(200) NOT NULL,
    descricao TEXT,
    nivel     VARCHAR(20)  NOT NULL DEFAULT 'BASICO',  -- 'BASICO', 'INTERMEDIARIO', 'AVANCADO'
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
    status         VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',  -- 'EM_ANDAMENTO', 'CONCLUIDO'
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
                 │                                   │
                 └──< progresso_aulas >──────────────┘
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

> Novos registros recebem `role = ALUNO` automaticamente. Promoção para ADMIN é feita diretamente no banco.

#### Cursos — `/api/cursos`

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/cursos` | Público | Lista paginada (10/página), filtro por `?nivel=` |
| GET | `/api/cursos/{id}` | Público | Detalhes com módulos e aulas |
| POST | `/api/cursos` | ADMIN | Criar curso |
| PUT | `/api/cursos/{id}` | ADMIN | Atualizar curso |
| DELETE | `/api/cursos/{id}` | ADMIN | Desativar curso (soft delete — seta `ativo=false`) |

#### Matrículas — `/api/matriculas` (autenticado)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/matriculas/minhas` | Lista matrículas do usuário logado |
| POST | `/api/matriculas` | Matricular em um curso (`{"cursoId"}`) |
| GET | `/api/matriculas/{id}/progresso` | Percentual de aulas concluídas |
| POST | `/api/matriculas/progresso` | Marcar aula como concluída (`{"matriculaId","aulaId"}`) |

#### Usuários — `/api/usuarios` (autenticado)

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/usuarios` | ADMIN | Lista todos os usuários |
| GET | `/api/usuarios/me` | Autenticado | Perfil do usuário atual (do banco, não do token) |

### Configuração (`application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/lmsdb
spring.datasource.username=lms
spring.datasource.password=lms123
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
server.port=8080
jwt.secret=3cfa76ef14937c1c0ea519f8fc057a80fcd04a7d3c8d028cb4b0a3e50bec9d7c
jwt.expiration-ms=86400000   # 24 horas
```

---

## 5. Frontend

**Stack:** Angular 18 · Standalone Components · Signals · Angular Material 18 (tema indigo-pink) · TypeScript

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

### AuthService (`core/services/auth.service.ts`)

Gerencia o estado de autenticação usando **Angular Signals**:

```typescript
currentUser = signal<AuthResponse | null>(this.getStoredUser());
```

Métodos principais:

| Método | Descrição |
|--------|-----------|
| `login(credentials)` | POST `/auth/login`, salva token + user no localStorage, atualiza signal |
| `logout()` | Limpa localStorage, zera signal, navega para `/login` |
| `refreshUser()` | GET `/usuarios/me`, sincroniza role do banco com o signal — chamado no constructor |
| `isAdmin()` | Retorna `currentUser()?.role === 'ADMIN'` |
| `isLoggedIn()` | Verifica presença do token no localStorage |
| `getToken()` | Retorna o JWT do localStorage |

**Chave importante:** `refreshUser()` é chamado no constructor — garante que o signal sempre reflete o role atual do banco, independente do momento em que o token foi gerado.

### Navbar

O botão **Admin** usa `*ngIf="auth.isAdmin()"`. Como `isAdmin()` lê um Signal, o Angular atualiza a view automaticamente quando `refreshUser()` resolve a chamada HTTP.

---

## 6. Segurança e Autenticação

### Fluxo JWT

```
1. Cliente envia POST /api/auth/login com email + senha
2. Spring Security autentica via DaoAuthenticationProvider
3. Backend gera JWT contendo apenas o email (subject) — sem roles no token
4. Cliente armazena o JWT no localStorage
5. A cada request, o JwtAuthFilter:
   a. Extrai o token do header Authorization: Bearer <token>
   b. Valida assinatura com HMAC-SHA512
   c. Extrai o email do subject
   d. Carrega o Usuario do banco via UserDetailsServiceImpl (role sempre atual)
   e. Seta Authentication no SecurityContext
```

**Detalhe crítico:** As roles NÃO estão no token JWT. O `JwtAuthFilter` recarrega o usuário do banco a cada request, então alterações de role têm efeito imediato no backend. No frontend, o `refreshUser()` no startup do `AuthService` garante que o signal seja sincronizado.

### Autorização no backend (`SecurityConfig`)

```
/api/auth/**             → público
GET /api/cursos          → público
GET /api/cursos/{id}     → público
POST/PUT/DELETE /api/cursos → ROLE_ADMIN
GET /api/usuarios        → ROLE_ADMIN
demais                   → autenticado (qualquer role)
```

### CORS

Permite apenas `http://localhost:4200` com credenciais.

### Senhas

Armazenadas com **BCrypt** via `BCryptPasswordEncoder`.

---

## 7. Como Rodar Localmente

### Pré-requisitos

- Java 17+ (JAVA_HOME configurado)
- Docker Desktop
- Node.js 18+ com Angular CLI (`npm install -g @angular/cli`)

### Passo a passo

**1. Banco de dados (Docker)**
```bash
cd lms/backend
docker compose up -d
# Container lms-postgres sobe na porta 5433
# Flyway aplica as 3 migrations automaticamente no primeiro start do backend
```

**2. Backend (Spring Boot)**

No Windows com JDK do IntelliJ:
```powershell
$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
cd lms\backend
.\mvnw.cmd spring-boot:run
# API disponível em http://localhost:8080
```

**3. Frontend (Angular)**
```bash
cd lms/frontend
npm install   # apenas na primeira vez
ng serve
# App disponível em http://localhost:4200
```

### Usuário de teste

| Campo | Valor |
|-------|-------|
| Email | `miguel@lms.com` |
| Senha | `123456` |
| Role | `ADMIN` |

> Para promover um usuário a ADMIN via SQL:
> ```sql
> docker exec lms-postgres psql -U lms -d lmsdb \
>   -c "UPDATE usuarios SET role='ADMIN' WHERE email='usuario@exemplo.com';"
> ```

### Verificar saúde do sistema

```bash
# Backend respondendo
curl http://localhost:8080/api/cursos

# Login e validação de role
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"miguel@lms.com","senha":"123456"}'
```

---


