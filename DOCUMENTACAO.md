# Documentação Técnica — LMS Lite

Sistema de gestão de cursos educacionais fullstack. Projeto de portfólio com Spring Boot no backend e Angular no frontend, inspirado na plataforma do **Senac SP**.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Banco de Dados](#3-banco-de-dados)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Segurança e Autenticação](#6-segurança-e-autenticação)
7. [Como Rodar Localmente](#7-como-rodar-localmente)
8. [Repositório GitHub](#8-repositório-github)
9. [Decisões de Arquitetura](#9-decisões-de-arquitetura)

---

## 1. Visão Geral

O LMS Lite permite que alunos naveguem no catálogo de cursos por área, tipo e unidade; se matriculem; e acompanhem seu progresso. Professores gerenciam conteúdos e lançam notas. Administradores têm controle total sobre cursos, usuários, regiões e vínculos.

### Papéis de usuário

| Role | Permissões |
|------|-----------|
| `ALUNO` | Navegar cursos (público), se matricular, marcar aulas concluídas, ver próprio progresso e histórico |
| `PROFESSOR` | Tudo do ALUNO + gerenciar conteúdo dos cursos vinculados, lançar notas, registrar presença, ver alunos por curso |
| `ADMIN` | Tudo + CRUD de cursos, usuários, regiões, unidades, professores, vínculos |

### Funcionalidades implementadas (v0.3)

**Seção pública (sem autenticação)**
- Catálogo de cursos paginado com filtros (nível, região, unidade, área, tipo)
- Exploração por área (10 áreas, 44 categorias) e tipo (11 tipos)
- Página de unidades com 64 unidades reais do Senac SP, agrupadas por 4 regiões
- Navbar com mega-dropdown: Cursos (áreas + tipos) e Unidades (grid 4 colunas)
- Páginas: Home, Sobre, Unidades

**Seção autenticada**
- Login e cadastro (JWT, 24h de validade)
- Dashboard do aluno com matrículas e progresso
- Progresso por aula, presença, histórico de notas
- Admin: CRUD cursos + vínculo unidade, CRUD usuários (role/unidade), CRUD regiões/unidades, gestão de professores
- Professor: conteúdo de aulas (vídeo/PDF/texto/link) por módulo, notas e presenças

---

## 2. Arquitetura

```
lms/
├── backend/                          # Spring Boot 3.5.14, Java 17
│   ├── src/main/java/br/com/lms/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── domain/
│   │   │   ├── area/
│   │   │   │   ├── Area.java
│   │   │   │   ├── Categoria.java
│   │   │   │   ├── Tipo.java
│   │   │   │   ├── AreaController.java
│   │   │   │   ├── AreaRepository.java
│   │   │   │   ├── CategoriaRepository.java
│   │   │   │   └── TipoRepository.java
│   │   │   ├── conteudo/
│   │   │   │   ├── ConteudoAula.java
│   │   │   │   ├── ConteudoAulaController.java
│   │   │   │   └── ConteudoAulaRepository.java
│   │   │   ├── curso/
│   │   │   │   ├── Curso.java
│   │   │   │   ├── Modulo.java
│   │   │   │   ├── Aula.java
│   │   │   │   ├── CursoController.java
│   │   │   │   └── CursoRepository.java
│   │   │   ├── matricula/
│   │   │   │   ├── Matricula.java
│   │   │   │   ├── ProgressoAula.java
│   │   │   │   ├── MatriculaController.java
│   │   │   │   ├── MatriculaRepository.java
│   │   │   │   └── ProgressoAulaRepository.java
│   │   │   ├── presenca/
│   │   │   │   ├── PresencaAula.java
│   │   │   │   ├── PresencaController.java
│   │   │   │   └── PresencaAulaRepository.java
│   │   │   ├── professor/
│   │   │   │   ├── ProfessorCurso.java
│   │   │   │   ├── ProfessorCursoId.java
│   │   │   │   ├── ProfessorController.java
│   │   │   │   └── ProfessorCursoRepository.java
│   │   │   ├── regiao/
│   │   │   │   ├── Regiao.java
│   │   │   │   ├── Unidade.java
│   │   │   │   ├── RegiaoController.java
│   │   │   │   ├── RegiaoRepository.java
│   │   │   │   └── UnidadeRepository.java
│   │   │   └── usuario/
│   │   │       ├── Usuario.java
│   │   │       ├── AuthController.java
│   │   │       ├── UsuarioController.java
│   │   │       └── UsuarioRepository.java
│   │   ├── dto/
│   │   │   └── DTOs.java             # Todos os records de request/response
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   └── security/
│   │       ├── JwtAuthFilter.java
│   │       ├── JwtTokenProvider.java
│   │       └── UserDetailsServiceImpl.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/             # V1 até V12
│   └── docker-compose.yml
└── frontend/                         # Angular 18, Tailwind 3.4
    └── src/app/
        ├── app.component.ts          # Decide qual nav mostrar (public vs auth)
        ├── app.routes.ts             # Todas as rotas com lazy loading
        ├── app.config.ts             # providers globais
        ├── core/
        │   ├── guards/auth.guard.ts
        │   ├── interceptors/jwt.interceptor.ts
        │   └── services/
        │       ├── auth.service.ts
        │       └── curso.service.ts
        ├── features/
        │   ├── areas/                # detalhe-area, lista-areas, lista-cursos-categoria, lista-cursos-tipo
        │   ├── admin/                # cursos, professores, regioes, usuarios
        │   ├── cursos/               # detalhe-curso, lista-cursos
        │   ├── dashboard/
        │   ├── home/
        │   ├── login/
        │   ├── matriculas/
        │   ├── professor/meus-cursos/
        │   ├── sobre/
        │   └── unidades/
        └── shared/
            ├── navbar/               # Sidebar + topbar para usuários autenticados
            └── public-nav/           # Navbar branca com mega-dropdown (público)
```

---

## 3. Banco de Dados

### Diagrama de relacionamentos

```
usuarios ──< matriculas >── cursos ──< modulos ──< aulas ──< conteudos_aula
    │             │           │              └──< presencas_aula
    │             └──< progresso_aulas
    └── unidades ──> regioes
         └──< cursos (FK unidade_id)

cursos >──< curso_categorias >──< categorias >── areas
cursos >──< curso_tipos      >──< tipos

usuarios >──< professor_cursos >──< cursos
```

### Tabelas

| Tabela | Colunas principais | Notas |
|--------|-------------------|-------|
| `usuarios` | id, nome, email (UNIQUE), senha_hash, role, unidade_id, criado_em | role: ADMIN/PROFESSOR/ALUNO |
| `cursos` | id, titulo, descricao, nivel, ativo, unidade_id, criado_em | nivel: BASICO/INTERMEDIARIO/AVANCADO; soft delete via `ativo` |
| `modulos` | id, curso_id, titulo, ordem | ordem determina sequência de exibição |
| `aulas` | id, modulo_id, titulo, url_video, duracao_min, ordem | |
| `matriculas` | id, usuario_id, curso_id (UNIQUE juntos), status, nota, aprovado, nota_lancada_em, nota_lancada_por, matriculado_em | status: EM_ANDAMENTO/CONCLUIDO/CANCELADO |
| `progresso_aulas` | id, matricula_id, aula_id (UNIQUE juntos), concluida, concluido_em | |
| `regioes` | id, nome (UNIQUE), criado_em | |
| `unidades` | id, regiao_id, nome, endereco, criado_em | |
| `professor_cursos` | professor_id + curso_id (PK composta), vinculado_em | |
| `conteudos_aula` | id, aula_id, tipo, titulo, conteudo, ordem, criado_em | tipo: VIDEO/PDF/TEXTO/LINK |
| `presencas_aula` | id, matricula_id, aula_id, data_aula (UNIQUE os 3), presente, registrado_por, registrado_em | |
| `areas` | id, nome, slug (UNIQUE) | |
| `categorias` | id, area_id, nome, slug — UNIQUE(area_id, slug) | |
| `tipos` | id, nome, slug (UNIQUE) | |
| `curso_categorias` | curso_id + categoria_id (PK) | N:N |
| `curso_tipos` | curso_id + tipo_id (PK) | N:N |

### Migrations Flyway

| Migration | Data | O que faz |
|-----------|------|-----------|
| `V1__create_usuarios.sql` | 2026-05-24 | Tabela `usuarios` |
| `V2__create_cursos.sql` | 2026-05-24 | Tabelas `cursos`, `modulos`, `aulas` |
| `V3__create_matriculas.sql` | 2026-05-24 | Tabelas `matriculas`, `progresso_aulas` |
| `V4__create_regioes.sql` | 2026-05-24 | Tabelas `regioes`, `unidades`; `unidade_id` em `usuarios` |
| `V5__create_professor_cursos.sql` | 2026-05-24 | Tabela `professor_cursos` (PK composta) |
| `V6__create_conteudos_aula.sql` | 2026-05-24 | Tabela `conteudos_aula` |
| `V7__create_presencas.sql` | 2026-05-24 | Tabela `presencas_aula` (constraint unique 3 colunas) |
| `V8__add_nota_matricula.sql` | 2026-05-24 | Colunas `nota`, `aprovado`, `nota_lancada_em`, `nota_lancada_por` em `matriculas` |
| `V9__add_unidade_curso.sql` | 2026-05-24 | Coluna `unidade_id` (nullable FK) em `cursos` |
| `V10__create_areas_tipos_categorias.sql` | 2026-05-30 | Tabelas `areas`, `categorias`, `tipos`, `curso_categorias`, `curso_tipos` |
| `V11__seed_areas_tipos_categorias.sql` | 2026-05-30 | Seed: 10 áreas, 44 categorias, 11 tipos; associa cursos iniciais |
| `V12__seed_rico_cursos_unidades.sql` | 2026-05-30 | Seed: 4 regiões, 64 unidades Senac SP, 35 cursos com vínculos completos |

**Regra**: nunca alterar migrations existentes. Nova necessidade → `V13__descricao.sql`.

---

## 4. Backend

### Configuração (`application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/lmsdb
spring.datasource.username=lms
spring.datasource.password=lms123
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
server.port=8080
jwt.expiration-ms=86400000   # 24 horas
```

### Endpoints por controller

#### AuthController — `/api/auth` (público)
| Método | Path | Body | Resposta |
|--------|------|------|----------|
| `POST` | `/api/auth/login` | `{email, senha}` | `{token, tipo, nome, email, role}` |
| `POST` | `/api/auth/register` | `{nome, email, senha}` | `UsuarioResponse` (201, role=ALUNO) |

#### CursoController — `/api/cursos`
| Método | Path | Auth | Query Params | Resposta |
|--------|------|------|-------------|----------|
| `GET` | `/api/cursos` | público | nivel, unidadeId, areaSlug, categoriaSlug, tipoSlug, page, size | `Page<CursoResumoResponse>` |
| `GET` | `/api/cursos/{id}` | público | — | `CursoDetalheResponse` |
| `POST` | `/api/cursos` | ADMIN | — | `CursoResumoResponse` (201) |
| `PUT` | `/api/cursos/{id}` | ADMIN | — | `CursoResumoResponse` |
| `DELETE` | `/api/cursos/{id}` | ADMIN | — | 204 (soft delete) |

#### AreaController — `/api/areas`, `/api/tipos`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/areas` | público | `List<AreaResponse>` (com categorias) |
| `GET` | `/api/areas/{areaSlug}` | público | `AreaResponse` |
| `GET` | `/api/areas/{areaSlug}/{catSlug}` | público | `Page<CursoResumoResponse>` |
| `GET` | `/api/tipos` | público | `List<TipoResponse>` (ordem alfabética) |
| `GET` | `/api/tipos/{tipoSlug}/cursos` | público | `Page<CursoResumoResponse>` |

#### MatriculaController — `/api/matriculas`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/matriculas/minhas` | auth | `List<MatriculaResponse>` |
| `POST` | `/api/matriculas` | auth | `MatriculaResponse` (201) |
| `GET` | `/api/matriculas/{id}/progresso` | auth | `ProgressoResponse` |
| `POST` | `/api/matriculas/progresso` | auth | 200 (marca aula concluída) |
| `GET` | `/api/matriculas/curso/{cursoId}` | ADMIN/PROF | `List<MatriculaDetalheResponse>` |
| `PATCH` | `/api/matriculas/{id}/nota` | ADMIN/PROF | `NotaResponse` (nota ≥ 6.0 = aprovado) |

#### UsuarioController — `/api/usuarios`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/usuarios` | ADMIN | `List<UsuarioResponse>` |
| `GET` | `/api/usuarios/me` | auth | `UsuarioResponse` |
| `PUT` | `/api/usuarios/{id}` | ADMIN | `UsuarioResponse` (edita nome/email/role/unidade) |
| `PATCH` | `/api/usuarios/{id}/role` | ADMIN | `UsuarioResponse` |

#### RegiaoController — `/api/regioes`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/regioes` | público | `List<RegiaoResponse>` (com totalUnidades) |
| `GET` | `/api/regioes/unidades` | público | `List<UnidadeResponse>` (todas) |
| `GET` | `/api/regioes/{id}` | auth | `RegiaoResponse` |
| `POST` | `/api/regioes` | ADMIN | `RegiaoResponse` (201) |
| `PUT` | `/api/regioes/{id}` | ADMIN | `RegiaoResponse` |
| `DELETE` | `/api/regioes/{id}` | ADMIN | 204 |
| `GET` | `/api/regioes/{id}/unidades` | auth | `List<UnidadeResponse>` |
| `POST` | `/api/regioes/{id}/unidades` | ADMIN | `UnidadeResponse` (201) |
| `PUT` | `/api/regioes/{id}/unidades/{uid}` | ADMIN | `UnidadeResponse` |
| `DELETE` | `/api/regioes/{id}/unidades/{uid}` | ADMIN | 204 |

#### ProfessorController — `/api/professores`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/professores` | ADMIN/PROF | `List<UsuarioResponse>` |
| `GET` | `/api/professores/{id}/cursos` | ADMIN/PROF | `List<CursoResumoResponse>` |
| `GET` | `/api/professores/meus-cursos` | ADMIN/PROF | `List<CursoResumoResponse>` |
| `POST` | `/api/professores/{id}/cursos` | ADMIN | 201 |
| `DELETE` | `/api/professores/{id}/cursos/{cid}` | ADMIN | 204 |

#### ConteudoAulaController — `/api/aulas`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `GET` | `/api/aulas/{id}/conteudos` | auth | `List<ConteudoAulaResponse>` |
| `POST` | `/api/aulas/{id}/conteudos` | ADMIN/PROF | `ConteudoAulaResponse` (201) |
| `PUT` | `/api/aulas/{id}/conteudos/{cid}` | ADMIN/PROF | `ConteudoAulaResponse` |
| `DELETE` | `/api/aulas/{id}/conteudos/{cid}` | ADMIN/PROF | 204 |

#### PresencaController — `/api/presenca`
| Método | Path | Auth | Resposta |
|--------|------|------|----------|
| `POST` | `/api/presenca` | ADMIN/PROF | `PresencaResponse` (upsert por matricula+aula+data) |
| `GET` | `/api/presenca/matricula/{id}` | auth | `List<PresencaResponse>` |
| `GET` | `/api/presenca/matricula/{id}/resumo` | auth | `PresencaResumoResponse` |

### DTOs (dto/DTOs.java)

Todos os records de request/response estão em um único arquivo. Records usam factory `from(Entidade)` para construção.

| Record | Campos |
|--------|--------|
| `AuthRequest` | email, senha |
| `RegisterRequest` | nome, email, senha |
| `AuthResponse` | token, tipo, nome, email, role |
| `CursoRequest` | titulo, descricao, nivel, unidadeId |
| `TipoResponse` | id, nome, slug |
| `CategoriaResponse` | id, nome, slug, areaNome, areaSlug |
| `AreaResponse` | id, nome, slug, categorias[] |
| `CursoResumoResponse` | id, titulo, descricao, nivel, criadoEm, unidadeId, unidadeNome, categorias[], tipos[] |
| `CursoDetalheResponse` | + modulos[] (com aulas[]) |
| `MatriculaRequest` | cursoId |
| `MatriculaResponse` | id, cursoId, cursoTitulo, status, matriculadoEm |
| `ProgressoResponse` | matriculaId, aulasConcluidas, totalAulas, percentual |
| `MarcarAulaRequest` | matriculaId, aulaId |
| `MatriculaDetalheResponse` | id, usuarioId, usuarioNome, usuarioEmail, status, matriculadoEm, nota, aprovado, notaLancadaEm |
| `UsuarioResponse` | id, nome, email, role, unidadeId, unidadeNome |
| `UsuarioUpdateRequest` | nome, email, role, unidadeId |
| `RegiaoRequest` | nome |
| `RegiaoResponse` | id, nome, totalUnidades |
| `UnidadeRequest` | nome, endereco, regiaoId |
| `UnidadeResponse` | id, nome, endereco, regiaoId, regiaoNome |
| `ConteudoAulaRequest/Response` | id, titulo, tipo, conteudo, ordem |
| `PresencaRequest` | matriculaId, aulaId, presente, dataAula |
| `PresencaResponse` | id, matriculaId, aulaId, presente, dataAula |
| `PresencaResumoResponse` | matriculaId, presencas, totalAulas, percentual |
| `NotaRequest` | nota |
| `NotaResponse` | matriculaId, nota, aprovado, lancadaEm |

---

## 5. Frontend

### Rotas

| Path | Componente | Guard | Acesso |
|------|-----------|-------|--------|
| `/` | redirect `/home` | — | — |
| `/home` | `HomeComponent` | — | público |
| `/sobre` | `SobreComponent` | — | público |
| `/unidades` | `UnidadesComponent` | — | público |
| `/login` | `LoginComponent` | — | público |
| `/cursos` | `ListaCursosComponent` | — | público |
| `/cursos/areas` | `ListaAreasComponent` | — | público |
| `/cursos/areas/:areaSlug` | `DetalheAreaComponent` | — | público |
| `/cursos/areas/:areaSlug/:catSlug` | `ListaCursosCategoriaComponent` | — | público |
| `/cursos/tipos/:tipoSlug` | `ListaCursosTipoComponent` | — | público |
| `/cursos/:id` | `DetalheCursoComponent` | — | público |
| `/dashboard` | `DashboardComponent` | `authGuard` | ALUNO+ |
| `/matriculas` | `MinhasMatriculasComponent` | `authGuard` | ALUNO+ |
| `/admin/cursos` | `AdminCursosComponent` | `authGuard` | ADMIN |
| `/admin/usuarios` | `AdminUsuariosComponent` | `authGuard` | ADMIN |
| `/admin/regioes` | `AdminRegioesComponent` | `authGuard` | ADMIN |
| `/admin/professores` | `AdminProfessoresComponent` | `authGuard` | ADMIN |
| `/professor/cursos` | `ProfessorCursosComponent` | `authGuard` | ADMIN/PROF |
| `/**` | redirect `/home` | — | — |

### Componentes e responsabilidades

| Componente | Path | Responsabilidade |
|-----------|------|-----------------|
| `AppComponent` | — | Decide `PublicNavComponent` vs `NavbarComponent` com base em `isLoggedIn()` |
| `PublicNavComponent` | `shared/public-nav/` | Navbar branca, mega-dropdown Cursos (áreas+tipos) e Unidades (grid 4 colunas), accordion mobile |
| `NavbarComponent` | `shared/navbar/` | Top bar + sidebar colapsável para usuários autenticados; seções por role |
| `HomeComponent` | `features/home/` | Landing page com CTA, áreas em destaque, acesso rápido |
| `ListaCursosComponent` | `features/cursos/lista-cursos/` | Catálogo paginado, filtros nível/região/unidade |
| `DetalheCursoComponent` | `features/cursos/detalhe-curso/` | Detalhes do curso, módulos, aulas, botão de matrícula |
| `ListaAreasComponent` | `features/areas/lista-areas/` | Grid de todas as áreas com categorias |
| `DetalheAreaComponent` | `features/areas/detalhe-area/` | Categorias de uma área com link para cursos |
| `ListaCursosCategoriaComponent` | `features/areas/lista-cursos-categoria/` | Cursos filtrados por categoria |
| `ListaCursosTipoComponent` | `features/areas/lista-cursos-tipo/` | Cursos filtrados por tipo |
| `UnidadesComponent` | `features/unidades/` | Lista real de unidades por região; destaque via `?unidadeId=X`; scroll via `?regiaoId=X` |
| `DashboardComponent` | `features/dashboard/` | Visão geral do aluno: matrículas, progresso, próximas aulas |
| `MinhasMatriculasComponent` | `features/matriculas/` | Histórico de matrículas com progresso |
| `AdminCursosComponent` | `features/admin/cursos/` | CRUD cursos + painel "Alunos & Notas" por curso |
| `AdminUsuariosComponent` | `features/admin/usuarios/` | CRUD usuários com edição inline de role e unidade |
| `AdminRegioesComponent` | `features/admin/regioes/` | CRUD regiões + unidades em MatExpansionPanel |
| `AdminProfessoresComponent` | `features/admin/professores/` | Lista professores + gerencia vínculos com cursos |
| `ProfessorCursosComponent` | `features/professor/meus-cursos/` | Estrutura módulos/aulas; gestão de conteúdo; dual-mode (admin vê todos, professor vê seus) |
| `LoginComponent` | `features/login/` | Login e cadastro com validação |
| `SobreComponent` | `features/sobre/` | Página institucional |

### Serviços principais

**`AuthService`** — `core/services/auth.service.ts`
- `signal currentUser` — usuário logado (persistido em `localStorage` como `lms_user` + `lms_token`)
- `login()`, `register()`, `logout()`
- `isLoggedIn()`, `isAdmin()`, `isProfessor()` — computed do signal
- `refreshUser()` — sincroniza com `/api/usuarios/me` (chamado no constructor com setTimeout 100ms para evitar ciclo de DI)

**`CursoService`** — `core/services/curso.service.ts`
- Todos os métodos de chamada à API organizados por domínio
- Usa `HttpClient` injetado via `inject()`
- Interfaces exportadas: `Area`, `TipoCurso`, `Curso`, `Page<T>`, `Matricula`, `Progresso`, `Regiao`, `Unidade`, `Professor`, `ConteudoAula`, `Presenca`, `PresencaResumo`, `NotaResponse`, `MatriculaDetalhe`

**`JwtInterceptor`** — `core/interceptors/jwt.interceptor.ts`
- Interceptor funcional (não class-based) adicionado via `provideHttpClient(withInterceptors([jwtInterceptor]))`
- Injeta `Authorization: Bearer <token>` em toda requisição se o token existir

**`authGuard`** — `core/guards/auth.guard.ts`
- `CanActivateFn` — verifica `authService.isLoggedIn()`
- Redireciona para `/login?returnUrl=<url-atual>` se não autenticado

---

## 6. Segurança e Autenticação

### Fluxo JWT

```
1. POST /api/auth/login {email, senha}
2. JwtTokenProvider gera token:
   - Algoritmo: HMAC-SHA512
   - Subject: email do usuário
   - Expiry: 24h
   - SEM roles no payload
3. Cliente armazena token em localStorage
4. Cada request inclui: Authorization: Bearer <token>
5. JwtAuthFilter:
   a. Extrai email do token
   b. Chama UserDetailsServiceImpl.loadUserByUsername(email)
   c. Busca Usuario completo do banco (com role atual)
   d. Autentica na SecurityContextHolder
```

### Regras de autorização (SecurityConfig)

```
público:         POST /api/auth/**
                 GET  /api/cursos, /api/cursos/{id}
                 GET  /api/areas/**, /api/tipos/**
                 GET  /api/regioes, /api/regioes/unidades

autenticado:     GET  /api/regioes/** (detalhe e sub-recursos)
                 GET  /api/aulas/**
                 GET  /api/presenca/**
                 GET  /api/usuarios/me
                 GET/POST /api/matriculas/**

ADMIN/PROFESSOR: GET  /api/matriculas/curso/**
                 PATCH /api/matriculas/*/nota
                 GET  /api/professores/**
                 POST/PUT/DELETE /api/aulas/**
                 POST /api/presenca

ADMIN:           POST/PUT/DELETE /api/cursos/**
                 GET/PUT/PATCH /api/usuarios/**
                 POST/PUT/DELETE /api/regioes/**
                 POST/DELETE /api/professores/**
```

### CORS
- Origem permitida: `http://localhost:4200` apenas
- Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: todos (`*`)
- Credentials: true

---

## 7. Como Rodar Localmente

### Pré-requisitos
- Java 17
- Maven (ou usar `mvnw.cmd`)
- Node.js 20+ e npm
- Docker Desktop

### Passo a passo (Windows)

```powershell
# 1. Clone
git clone https://github.com/MiguelFerreira31/lms.git
cd lms

# 2. Banco (primeira vez: cria container; depois: docker start lms-postgres)
cd backend
docker compose up -d

# 3. Backend
$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
.\mvnw.cmd spring-boot:run
# Flyway aplica V1-V12 automaticamente na primeira execução
# API: http://localhost:8080

# 4. Frontend (em outro terminal)
cd ..\frontend
npm install
npx ng serve
# App: http://localhost:4200
```

### Credenciais

| Tipo | Valor |
|------|-------|
| Admin email | `miguel@lms.com` |
| Admin senha | `123456` |
| DB host | `localhost:5433` |
| DB name | `lmsdb` |
| DB user | `lms` |
| DB pass | `lms123` |
| Container | `lms-postgres` |

### Aplicar nova migration sem reiniciar

```powershell
cd backend
.\mvnw.cmd flyway:migrate `
  -Dflyway.url=jdbc:postgresql://localhost:5433/lmsdb `
  -Dflyway.user=lms `
  -Dflyway.password=lms123
```

---

## 8. Repositório GitHub

- **Monorepo:** https://github.com/MiguelFerreira31/lms
- **Branch principal:** `master`
- **Autor:** Miguel Ferreira (miguelccezarferreira@gmail.com)

---

## 9. Decisões de Arquitetura

### JWT sem roles no token

**Decisão:** O payload do JWT contém apenas `sub=email`. A role do usuário é carregada do banco a cada request pelo `UserDetailsServiceImpl`.

**Por quê:** Permite alterar a role de um usuário (promoção/rebaixamento) com efeito imediato, sem necessidade de revogar tokens existentes. Se a role estivesse no token, o token emitido com role ALUNO continuaria com permissões de ALUNO mesmo após promoção para ADMIN — até expirar em 24h.

**Trade-off:** Uma consulta SQL extra a cada request autenticado. Para o volume deste projeto, o custo é negligenciável. Em escala, o cache do `UserDetailsService` ou Redis mitigaria o custo.

---

### DTOs centralizados em um arquivo

**Decisão:** Todos os records de request/response estão em `dto/DTOs.java`.

**Por quê:** Elimina a proliferação de arquivos de DTO espalhados pelo projeto. Em projetos de portfólio com 20–30 DTOs, um arquivo central é mais fácil de navegar do que uma pasta com 30 arquivos. A regra de visibilidade fica clara: entidades em `domain/`, DTOs em `dto/`.

**Trade-off:** O arquivo cresce conforme o projeto escala. Para um projeto real com 100+ DTOs, separar em subpacotes (`dto/request/`, `dto/response/`) seria mais adequado.

---

### Soft delete em cursos

**Decisão:** `DELETE /api/cursos/{id}` seta `ativo=false`. Não remove o registro do banco.

**Por quê:** Preserva integridade referencial — matrículas, progresso e notas de alunos continuam existindo mesmo que o curso seja desativado. Um `DELETE` físico exigiria `ON DELETE CASCADE` em todas as FKs filhas, apagando o histórico do aluno.

**Trade-off:** Acumula dados "mortos" no banco ao longo do tempo. Mitigação: job periódico de limpeza ou endpoint de hard-delete para admins.

---

### Flyway ao invés de `ddl-auto=create/update`

**Decisão:** `spring.jpa.hibernate.ddl-auto=validate`. Flyway controla todas as mudanças de schema.

**Por quê:** `ddl-auto=update` é conveniente em desenvolvimento mas perigoso — pode perder dados, adicionar colunas com defaults errados, ou não executar lógica de migração complexa (como backfill de dados). Flyway garante:
- Versionamento explícito de cada mudança
- Rollback controlado
- Mesma sequência em dev, staging e produção
- Auditoria de quando cada schema foi aplicado

**Trade-off:** Requer criar um arquivo de migration para cada mudança, mesmo pequena. Vale o custo em qualquer projeto que vai além de protótipo.

---

### Navbar com breakpoint `lg` (1024px)

**Decisão:** A nav desktop some e o hamburger aparece abaixo de 1024px (`hidden lg:flex` / `lg:hidden`).

**Por quê:** A navbar tem 5 itens (Home, Cursos, Unidades, Bolsas de Estudo, Eventos) mais botões CTA. Em 768px (breakpoint `md`), o espaço não é suficiente para todos os itens sem causar quebra de linha mesmo com `whitespace-nowrap`. Usar `lg` (1024px) garante que a versão desktop sempre tem espaço suficiente.

**Aprendizado durante desenvolvimento:** Dois elementos com `flex-1` no mesmo container flex competem pelo espaço, comprimindo os itens entre eles. A solução foi remover o spacer duplicado e usar apenas a nav com `flex-1`, deixando o CTA como elemento de largura natural.
