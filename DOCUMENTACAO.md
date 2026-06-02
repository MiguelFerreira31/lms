# Documentação Técnica — LMS Lite

> Referência técnica para desenvolvedores e mantenedores.
> Atualizada em: 2026-06-02 | Backend: Spring Boot 3.5.14 / Frontend: Angular 18

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Banco de Dados](#4-banco-de-dados)
5. [Backend — API REST](#5-backend--api-rest)
6. [Frontend — Angular](#6-frontend--angular)
7. [Módulo de Acessibilidade](#7-módulo-de-acessibilidade)
8. [Segurança e Autenticação](#8-segurança-e-autenticação)
9. [Upload de Imagens](#9-upload-de-imagens)
10. [Decisões de Arquitetura](#10-decisões-de-arquitetura)
11. [Como Rodar Localmente](#11-como-rodar-localmente)

---

## 1. Visão Geral

LMS Lite é um sistema fullstack de gestão de cursos educacionais desenvolvido como projeto de portfólio. Implementa um ciclo completo de LMS: catálogo de cursos por área/categoria/tipo, matrículas, progresso de alunos, lançamento de notas, controle de presença, gestão de regiões/unidades e painel administrativo com gráficos em tempo real. O sistema tem foco em acessibilidade, com um módulo dedicado que cobre critérios WCAG 2.1 AA/AAA.

| Funcionalidade | Status |
|---|---|
| Autenticação JWT (login + registro) | ✅ Implementado |
| Roles: ADMIN / PROFESSOR / ALUNO | ✅ Implementado |
| CRUD de Cursos com soft delete | ✅ Implementado |
| Áreas, Categorias e Tipos de curso | ✅ Implementado |
| Matrículas e progresso de aulas | ✅ Implementado |
| Lançamento de notas (≥ 6.0 = aprovado) | ✅ Implementado |
| Controle de presença por aula | ✅ Implementado |
| Conteúdo de aulas (VIDEO / PDF / TEXTO / LINK) | ✅ Implementado |
| Gestão de Regiões e Unidades | ✅ Implementado |
| Página de detalhe de Unidade com slug | ✅ Implementado |
| Vínculo Professor ↔ Curso | ✅ Implementado |
| Upload de imagens (avatar, curso, unidade) | ✅ Implementado |
| Dashboard administrativo com Chart.js + GSAP | ✅ Implementado |
| Widget de Acessibilidade (12 funcionalidades) | ✅ Implementado |
| VLibras (tradução para Libras) | ✅ Implementado |
| Seed: 4 regiões, 64 unidades Senac SP, 35 cursos | ✅ Implementado |
| Testes automatizados backend/frontend | 🔲 Planejado |
| Deploy em produção | 🔲 Planejado |
| Certificados de conclusão | 🔲 Planejado |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────┐
│  Browser — Angular 18 SPA (:4200 / :4300)   │
│  Tailwind CSS · Angular Material · Chart.js  │
│  GSAP · angular-vlibras                      │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST — Bearer JWT
                   ▼
┌─────────────────────────────────────────────┐
│  Spring Boot 3.5.14 (:8080)                 │
│  Spring Security · JPA/Hibernate · Flyway   │
│  JJWT 0.12.5 · Lombok                       │
└──────────────────┬──────────────────────────┘
                   │ JDBC (PostgreSQL driver)
                   ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL 15 — container lms-postgres      │
│  host :5433 → container :5432                │
└─────────────────────────────────────────────┘
```

**Decisões de infraestrutura:**
- Docker Compose sobe apenas o banco; backend e frontend rodam localmente.
- Porta 5433 no host porque 5432 pode estar ocupada por instância local do PostgreSQL no Windows.
- CORS configurado para `localhost:4200` (dev principal) e `localhost:4300` (alternativa).
- Arquivos de upload salvos em `${user.home}/lms-uploads/` e servidos via `/uploads/**`.

---

## 3. Estrutura de Pastas

### Backend (`backend/src/main/java/br/com/lms/`)

```
br/com/lms/
├── LmsApplication.java
├── config/
│   ├── SecurityConfig.java      # CORS, filtros JWT, regras de autorização
│   ├── UploadConfig.java        # ResourceHandler para /uploads/**
│   └── WebConfig.java           # Configurações adicionais de web
├── domain/
│   ├── area/
│   │   ├── Area.java            # @Entity — id, nome, slug, categorias (OneToMany)
│   │   ├── Categoria.java       # @Entity — id, area (ManyToOne), nome, slug
│   │   ├── Tipo.java            # @Entity — id, nome, slug
│   │   ├── AreaController.java  # GET /api/areas, /api/tipos
│   │   ├── AreaRepository.java
│   │   ├── CategoriaRepository.java
│   │   └── TipoRepository.java
│   ├── conteudo/
│   │   ├── ConteudoAula.java    # @Entity — tipo (VIDEO|PDF|TEXTO|LINK), titulo, conteudo, ordem
│   │   ├── ConteudoAulaController.java  # CRUD /api/aulas/{id}/conteudos
│   │   └── ConteudoAulaRepository.java
│   ├── curso/
│   │   ├── Curso.java           # @Entity — titulo, descricao, nivel, ativo, unidade, imagemUrl
│   │   ├── Aula.java            # @Entity — titulo, urlVideo, duracaoMin, ordem
│   │   ├── Modulo.java          # @Entity — titulo, ordem, aulas (OneToMany)
│   │   ├── CursoController.java # GET/POST/PUT/DELETE /api/cursos
│   │   └── CursoRepository.java
│   ├── matricula/
│   │   ├── Matricula.java       # @Entity — Status (EM_ANDAMENTO|CONCLUIDO|CANCELADO), nota, aprovado
│   │   ├── MatriculaController.java
│   │   ├── MatriculaRepository.java
│   │   ├── ProgressoAula.java   # @Entity — matricula, aula, concluida, concluido_em
│   │   └── ProgressoAulaRepository.java
│   ├── presenca/
│   │   ├── PresencaAula.java    # unique (matricula_id, aula_id, data_aula)
│   │   ├── PresencaAulaRepository.java
│   │   └── PresencaController.java
│   ├── professor/
│   │   ├── ProfessorCurso.java        # @EmbeddedId ProfessorCursoId
│   │   ├── ProfessorCursoId.java      # Serializable — professorId, cursoId
│   │   ├── ProfessorCursoRepository.java  # @Query JPQL explícita
│   │   └── ProfessorController.java
│   ├── regiao/
│   │   ├── Regiao.java          # @Entity — nome (UNIQUE), unidades (OneToMany)
│   │   ├── Unidade.java         # @Entity — nome, slug, endereco, regiao (EAGER), imagemUrl
│   │   ├── RegiaoController.java    # CRUD /api/regioes + /api/regioes/{id}/unidades
│   │   ├── UnidadeController.java   # GET /api/unidades/{slug} e /{slug}/cursos
│   │   ├── RegiaoRepository.java
│   │   └── UnidadeRepository.java
│   ├── upload/
│   │   ├── UploadController.java   # POST /api/upload/avatar|curso/{id}|unidade/{id}
│   │   └── UploadService.java      # Salva JPEG/PNG/WebP em lms-uploads/, retorna URL
│   └── usuario/
│       ├── Usuario.java         # @Entity — Role (ADMIN|PROFESSOR|ALUNO), avatarUrl
│       ├── AuthController.java  # POST /api/auth/login|register
│       ├── UsuarioController.java
│       └── UsuarioRepository.java
├── dto/
│   └── DTOs.java                # Todos os records (request + response) em um arquivo
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
└── security/
    ├── JwtAuthFilter.java           # Extrai email do JWT → carrega usuário do banco
    ├── JwtTokenProvider.java        # HMAC-SHA512, expiração 24h
    └── UserDetailsServiceImpl.java
```

### Frontend (`frontend/src/app/`)

```
app/
├── app.component.ts         # Roteador raiz — injeta AccessibilityComponent
├── app.config.ts            # providers: HttpClient + jwtInterceptor + errorInterceptor
├── app.routes.ts            # Todas as rotas com lazy load
├── accessibility/
│   ├── accessibility.component.{html,scss,ts}
│   ├── accessibility.service.ts   # Signal<AccessibilityState> + todas as ações
│   ├── color-manager.ts           # Análise de contraste WCAG e patching de CSS vars
│   ├── models/
│   │   └── accessibility-state.model.ts
│   └── vlibras.d.ts               # Type declarations para angular-vlibras
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # CanActivateFn → isLoggedIn()
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts     # Injeta Bearer token em todas as requests
│   │   └── error.interceptor.ts   # Tratamento global de erros HTTP
│   └── services/
│       ├── auth.service.ts        # signal currentUser, login/logout/refreshUser
│       ├── curso.service.ts       # Todos os métodos de API
│       └── upload.service.ts      # uploadAvatar, uploadCurso, uploadUnidade
├── features/
│   ├── admin/
│   │   ├── cursos/                # CRUD cursos + painel Alunos & Notas
│   │   ├── dashboard/             # KPIs + Chart.js (bar, doughnut, horizontal) + GSAP
│   │   ├── professores/           # Listagem + vínculo professor ↔ curso
│   │   ├── regioes/               # CRUD regiões + unidades (MatExpansionPanel)
│   │   └── usuarios/              # CRUD usuários com edição inline
│   ├── areas/
│   │   ├── detalhe-area/
│   │   ├── lista-areas/
│   │   ├── lista-cursos-categoria/
│   │   └── lista-cursos-tipo/
│   ├── cursos/
│   │   └── detalhe-curso/
│   ├── dashboard/
│   ├── home/
│   ├── login/
│   ├── matriculas/
│   │   └── minhas-matriculas/
│   ├── professor/
│   │   └── meus-cursos/
│   ├── sobre/
│   └── unidades/
│       ├── unidades.component.ts
│       ├── detalhe-unidade/
│       ├── cursos-unidade-area/
│       └── cursos-unidade-tipo/
└── shared/
    ├── curso-card/          # Card reutilizável para listagem de cursos
    ├── image-upload/        # Componente de upload de imagem com preview
    ├── navbar/              # Top bar fixa + sidebar colapsável (autenticados)
    └── public-nav/          # Navbar pública com mega-dropdown
```

---

## 4. Banco de Dados

### Migrations

| Migration | O que faz |
|---|---|
| `V1__create_usuarios.sql` | Tabela `usuarios` (id, nome, email, senha, role, unidade_id) |
| `V2__create_cursos.sql` | Tabelas `cursos`, `modulos`, `aulas` |
| `V3__create_matriculas.sql` | Tabelas `matriculas`, `progresso_aulas` |
| `V4__create_regioes.sql` | Tabelas `regioes`, `unidades`; coluna `unidade_id` em `usuarios` |
| `V5__create_professor_cursos.sql` | Tabela `professor_cursos` (PK composta professor_id + curso_id) |
| `V6__create_conteudos_aula.sql` | Tabela `conteudos_aula` com enum TipoConteudo |
| `V7__create_presencas.sql` | Tabela `presencas_aula` (UNIQUE: matricula + aula + data) |
| `V8__add_nota_matricula.sql` | Colunas `nota`, `aprovado`, `nota_lancada_em`, `nota_lancada_por` em `matriculas` |
| `V9__add_unidade_curso.sql` | Coluna `unidade_id` (nullable FK) em `cursos` |
| `V10__create_areas_tipos_categorias.sql` | Tabelas `areas`, `categorias`, `tipos`, `curso_categorias`, `curso_tipos` |
| `V11__seed_areas_tipos_categorias.sql` | Seed: 10 áreas, 44 categorias, 11 tipos; associações nos cursos 1 e 2 |
| `V12__seed_rico_cursos_unidades.sql` | Seed: 4 regiões, 64 unidades Senac SP, 35 cursos com vínculos |
| `V13__add_slug_unidades.sql` | Adiciona coluna `slug` em `unidades`, popula via transliteração SQL, índice UNIQUE |
| `V14__fix_slugs_unidades.sql` | Corrige 14 slugs com erro de mapeamento gerados pela V13 |
| `V15__add_imagem_fields.sql` | Adiciona `avatar_url` em `usuarios`, `imagem_url` em `cursos` e `unidades` |

**Próxima migration disponível: V16.**

### Schema atual

| Tabela | Colunas principais | Observações |
|---|---|---|
| `usuarios` | id, nome, email, senha, role, unidade_id, avatar_url | role: ADMIN / PROFESSOR / ALUNO |
| `cursos` | id, titulo, descricao, nivel, ativo, unidade_id, imagem_url, criado_em | soft delete via `ativo` |
| `modulos` | id, titulo, ordem, curso_id | |
| `aulas` | id, titulo, url_video, duracao_min, ordem, modulo_id | |
| `matriculas` | id, usuario_id, curso_id, status, nota, aprovado, nota_lancada_em, nota_lancada_por, matriculado_em | UNIQUE (usuario_id, curso_id) |
| `progresso_aulas` | id, matricula_id, aula_id, concluida, concluido_em | UNIQUE (matricula_id, aula_id) |
| `regioes` | id, nome, criado_em | nome UNIQUE |
| `unidades` | id, nome, slug, endereco, regiao_id, imagem_url, criado_em | slug UNIQUE |
| `professor_cursos` | professor_id, curso_id, vinculado_em | PK composta |
| `conteudos_aula` | id, tipo, titulo, conteudo, ordem, aula_id | tipo: VIDEO / PDF / TEXTO / LINK |
| `presencas_aula` | id, matricula_id, aula_id, presente, data_aula, registrado_por | UNIQUE (matricula_id, aula_id, data_aula) |
| `areas` | id, nome, slug | slug UNIQUE |
| `categorias` | id, nome, slug, area_id | UNIQUE (area_id, slug) |
| `tipos` | id, nome, slug | slug UNIQUE |
| `curso_categorias` | curso_id, categoria_id | PK composta N:N |
| `curso_tipos` | curso_id, tipo_id | PK composta N:N |

### Diagrama de relacionamentos (simplificado)

```
regioes      ||--o{ unidades        : "contém"
unidades     ||--o{ usuarios        : "lotado em"
unidades     ||--o{ cursos          : "oferece"
usuarios     ||--o{ matriculas      : "faz"
cursos       ||--o{ matriculas      : "recebe"
cursos       ||--o{ modulos         : "tem"
modulos      ||--o{ aulas           : "tem"
aulas        ||--o{ progresso_aulas : "rastreia"
aulas        ||--o{ conteudos_aula  : "tem"
aulas        ||--o{ presencas_aula  : "registra"
matriculas   ||--o{ progresso_aulas : "inclui"
matriculas   ||--o{ presencas_aula  : "inclui"
usuarios     }o--o{ cursos          : "professor_cursos"
cursos       }o--o{ categorias      : "curso_categorias"
cursos       }o--o{ tipos           : "curso_tipos"
categorias   }o--|| areas           : "pertence a"
```

---

## 5. Backend — API REST

### Auth (`/api/auth`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | público | Autentica → retorna JWT + dados do usuário |
| POST | `/api/auth/register` | público | Cadastra novo usuário com role ALUNO |

### Cursos (`/api/cursos`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/cursos` | público | Listagem paginada (filtros: nivel, unidadeId, areaSlug, categoriaSlug, tipoSlug) |
| GET | `/api/cursos/{id}` | público | Detalhe com módulos, aulas, categorias, tipos |
| POST | `/api/cursos` | ADMIN | Criar curso |
| PUT | `/api/cursos/{id}` | ADMIN | Atualizar curso |
| DELETE | `/api/cursos/{id}` | ADMIN | Soft delete (ativo=false) |

### Áreas e Tipos (`/api/areas`, `/api/tipos`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/areas` | público | Todas as áreas com categorias |
| GET | `/api/areas/{areaSlug}` | público | Detalhe de uma área |
| GET | `/api/areas/{areaSlug}/{catSlug}` | público | Cursos por categoria (paginado) |
| GET | `/api/tipos` | público | Todos os tipos ordenados por nome |
| GET | `/api/tipos/{tipoSlug}/cursos` | público | Cursos por tipo (paginado) |

### Unidades (`/api/unidades`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/unidades/{slug}` | público | Detalhe de unidade com áreas e tipos disponíveis |
| GET | `/api/unidades/{slug}/cursos` | público | Cursos da unidade (query params: tipoSlug, areaSlug) |

### Matrículas (`/api/matriculas`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/matriculas/minhas` | auth | Matrículas do usuário logado |
| POST | `/api/matriculas` | auth | Matricular em curso |
| GET | `/api/matriculas/{id}/progresso` | auth | Progresso da matrícula |
| POST | `/api/matriculas/progresso` | auth | Marcar aula como concluída |
| GET | `/api/matriculas/curso/{cursoId}` | ADMIN/PROF | Alunos matriculados no curso |
| PATCH | `/api/matriculas/{id}/nota` | ADMIN/PROF | Lançar nota (≥ 6.0 = aprovado) |

### Usuários (`/api/usuarios`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/usuarios` | ADMIN | Listar todos os usuários |
| GET | `/api/usuarios/me` | auth | Perfil do usuário logado |
| PUT | `/api/usuarios/{id}` | ADMIN | Editar nome/email/role/unidade |
| PATCH | `/api/usuarios/{id}/role` | ADMIN | Alterar role |

### Regiões (`/api/regioes`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/regioes` | público | Regiões com totalUnidades |
| GET | `/api/regioes/unidades` | público | Todas as unidades com regiaoNome |
| GET | `/api/regioes/{id}` | auth | Detalhe de região |
| POST | `/api/regioes` | ADMIN | Criar região |
| PUT | `/api/regioes/{id}` | ADMIN | Atualizar região |
| DELETE | `/api/regioes/{id}` | ADMIN | Deletar região |
| GET | `/api/regioes/{id}/unidades` | auth | Unidades de uma região |
| POST | `/api/regioes/{id}/unidades` | ADMIN | Criar unidade |
| PUT | `/api/regioes/{id}/unidades/{uid}` | ADMIN | Atualizar unidade |
| DELETE | `/api/regioes/{id}/unidades/{uid}` | ADMIN | Deletar unidade |

### Professores (`/api/professores`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/professores` | ADMIN/PROF | Listar professores |
| GET | `/api/professores/{id}/cursos` | ADMIN/PROF | Cursos de um professor |
| GET | `/api/professores/meus-cursos` | ADMIN/PROF | Cursos do professor logado |
| POST | `/api/professores/{id}/cursos` | ADMIN | Vincular professor a curso |
| DELETE | `/api/professores/{id}/cursos/{cid}` | ADMIN | Desvincular |

### Conteúdo das Aulas (`/api/aulas`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/aulas/{id}/conteudos` | auth | Conteúdos de uma aula |
| POST | `/api/aulas/{id}/conteudos` | ADMIN/PROF | Criar conteúdo |
| PUT | `/api/aulas/{id}/conteudos/{cid}` | ADMIN/PROF | Atualizar conteúdo |
| DELETE | `/api/aulas/{id}/conteudos/{cid}` | ADMIN/PROF | Deletar conteúdo |

### Presença (`/api/presenca`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/presenca` | ADMIN/PROF | Registrar/atualizar presença (upsert por matricula+aula+data) |
| GET | `/api/presenca/matricula/{id}` | auth | Presenças de uma matrícula |
| GET | `/api/presenca/matricula/{id}/resumo` | auth | Resumo percentual de presença |

### Upload (`/api/upload`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/upload/avatar` | auth | Upload de avatar do usuário logado |
| POST | `/api/upload/curso/{cursoId}` | ADMIN | Upload de imagem de curso |
| POST | `/api/upload/unidade/{unidadeId}` | ADMIN | Upload de imagem de unidade |

Formatos aceitos: JPEG, PNG, WebP. Limite: 5 MB por arquivo.
Arquivos servidos via `GET /uploads/**` (público, sem autenticação).

---

## 6. Frontend — Angular

### Rotas

| Path | Componente | Guard |
|---|---|---|
| `/` | redirect `/home` | — |
| `/home` | `HomeComponent` | — |
| `/sobre` | `SobreComponent` | — |
| `/login` | `LoginComponent` | — |
| `/unidades` | `UnidadesComponent` | — |
| `/unidades/:unidadeSlug` | `DetalheUnidadeComponent` | — |
| `/unidades/:unidadeSlug/areas/:areaSlug` | `CursosUnidadeAreaComponent` | — |
| `/unidades/:unidadeSlug/:tipoSlug` | `CursosUnidadeTipoComponent` | — |
| `/cursos` | redirect `/cursos/areas` | — |
| `/cursos/areas` | `ListaAreasComponent` | — |
| `/cursos/areas/:areaSlug` | `DetalheAreaComponent` | — |
| `/cursos/areas/:areaSlug/:categoriaSlug` | `ListaCursosCategoriaComponent` | — |
| `/cursos/tipos/:tipoSlug` | `ListaCursosTipoComponent` | — |
| `/cursos/:id` | `DetalheCursoComponent` | — |
| `/dashboard` | `DashboardComponent` | `authGuard` |
| `/matriculas` | `MinhasMatriculasComponent` | `authGuard` |
| `/admin` | redirect `/admin/dashboard` | — |
| `/admin/dashboard` | `AdminDashboardComponent` | `authGuard` |
| `/admin/cursos` | `AdminCursosComponent` | `authGuard` |
| `/admin/usuarios` | `AdminUsuariosComponent` | `authGuard` |
| `/admin/regioes` | `AdminRegioesComponent` | `authGuard` |
| `/admin/professores` | `AdminProfessoresComponent` | `authGuard` |
| `/professor` | redirect `/professor/cursos` | — |
| `/professor/cursos` | `ProfessorCursosComponent` | `authGuard` |
| `/**` | redirect `/home` | — |

### Services

| Service | Responsabilidade |
|---|---|
| `AuthService` | `signal<AuthResponse\|null> currentUser`, login/logout, `refreshUser()` no startup |
| `CursoService` | Todos os métodos de API: cursos, áreas, tipos, matrículas, usuários, regiões, unidades, professores, conteúdos, presença, nota |
| `UploadService` | `uploadAvatar()`, `uploadCurso()`, `uploadUnidade()` via multipart FormData |

### AuthService — detalhe

- `currentUser` é um `signal<AuthResponse | null>` inicializado a partir do `localStorage`.
- No constructor, chama `refreshUser()` após 100ms para sincronizar dados do servidor.
- Token em `localStorage['lms_token']`; dados do usuário em `localStorage['lms_user']`.
- `isAdmin()` e `isProfessor()` são métodos síncronos que leem o signal.
- `isProfessor()` retorna `true` também para ADMIN.

### Interceptors

- `jwtInterceptor`: injeta `Authorization: Bearer <token>` em todas as requests autenticadas.
- `errorInterceptor`: tratamento global de erros HTTP.

### Admin Dashboard

`AdminDashboardComponent` usa Chart.js 4.x com três gráficos:
- **Bar chart** — matrículas por mês (últimos 6 meses)
- **Doughnut chart** — distribuição de cursos por nível (Básico / Intermediário / Avançado)
- **Horizontal bar chart** — unidades por região

Utiliza GSAP para animações de entrada dos cards KPI. Contadores KPI (alunos, cursos, professores, matrículas) têm animação `countUp` com easing cúbico via `requestAnimationFrame`.

---

## 7. Módulo de Acessibilidade

Feature folder standalone em `src/app/accessibility/`. Estado gerenciado por `AccessibilityService` via `signal<AccessibilityState>`.

### AccessibilityState — campos

```typescript
interface AccessibilityState {
  fontLevel:       number;        // -1 | 0 | 1 | 2 | 3
  dislexia:        boolean;
  linha:           'normal' | 'media' | 'ampla';
  letra:           'normal' | 'media' | 'ampla';
  contraste:       'normal' | 'alto' | 'invertido';
  saturacao:       'normal' | 'cinza' | 'sepia';
  daltonismo:      'normal' | 'protan' | 'deuter' | 'tritan';
  cursor:          'normal' | 'grande';
  lupa:            boolean;
  linksDestacados: boolean;
  mascara:         boolean;
  guia:            boolean;
}
```

### Funcionalidades implementadas

| Funcionalidade | Implementação |
|---|---|
| **Tamanho de fonte** (5 níveis: -1 a 3) | Cache de elementos via `FONT_SELECTOR`; `data-acc-orig-fs` guarda tamanho original; escala com `!important`. MutationObserver estende o cache para nós adicionados ao DOM. |
| **Fonte para dislexia** | Carrega OpenDyslexic via CDN (jsdelivr) on demand. Classe `acc-fonte-dislexia` no body. |
| **Espaçamento de linha** | Classes `acc-linha-media` / `acc-linha-ampla` no body. |
| **Espaçamento de letras** | Classes `acc-letra-media` / `acc-letra-ampla` no body. |
| **Alto contraste** | JS percorre todos os elementos; salva cores em `data-acc-orig-*`; aplica `#fff / #000`. Restaurado ao desativar. |
| **Contraste invertido** | CSS `filter: invert(1) hue-rotate(180deg)` em `document.documentElement`. |
| **Escala de cinza** | CSS `filter: grayscale(1)` em `document.documentElement`. |
| **Sépia** | CSS `filter: sepia(0.8)` em `document.documentElement`. |
| **Daltonismo** | SVG `<feColorMatrix>` injetado no DOM; `filter: url(#acc-filter-protan\|deuter\|tritan)`. Matrizes calibradas para protanopia, deuteranopia e tritanopia. |
| **Cursor grande** | Classe `acc-cursor-grande` no body. |
| **Lupa de navegação** | Overlay posicionado via `mousemove`. Exibe texto real do elemento semântico mais próximo (não tag HTML), máx. 80 chars. Texto via `textContent` (sem XSS). |
| **Links destacados** | Classe `acc-links-destacados` no body. |
| **Máscara de leitura** | Dois overlays (top/bottom) seguem o cursor, deixando janela de 90px ao redor do `clientY`. |
| **Guia de leitura** | Linha horizontal segue o `clientY` do cursor. |
| **VLibras** | Integrado via `angular-vlibras` npm (gov.br). Tradução para Libras. |

### Persistência

Estado serializado em `localStorage['acessibilidade_prefs']` (JSON). Carregado no `init()`. Quotas de localStorage tratadas silenciosamente (try/catch).

### Isolamento de filter CSS

`filter` sempre em `document.documentElement` (`<html>`), nunca em `document.body`. Razão: elementos `position: fixed` criados pelo Angular pertencem ao viewport stacking context e não são alcançados por `filter` no `<body>`.

### MutationObserver

Observa `{ childList: true, subtree: true }` — **nunca** `attributes: true` (causaria loop infinito ao aplicar `style.setProperty`). Buffer de `pendingNodes` com debounce de 250ms para processar mutações em batch.

### ColorManager

Analisa variáveis CSS do painel (`--acc-color-base`, `--acc-color-contrast`, etc.) e garante contraste mínimo WCAG. Converte RGB → HSL, ajusta lightness em steps de 1.5% até atingir razão mínima (7:1 para texto principal, 4.5:1 para texto secundário, 3:1 para bordas). Injeta overrides via `<style id="acc-color-patch">` no `<head>`.

---

## 8. Segurança e Autenticação

### Fluxo JWT

```
1. POST /api/auth/login → AuthController
2. DaoAuthenticationProvider valida email/senha via BCrypt
3. JwtTokenProvider.generateToken(email) → HMAC-SHA512, exp=24h
4. Response: { token, tipo, nome, email, role, avatarUrl }
5. Frontend armazena token em localStorage
6. Próximas requests: jwtInterceptor injeta Authorization: Bearer <token>
7. JwtAuthFilter extrai email do JWT → UserDetailsServiceImpl.loadUserByUsername(email)
8. Banco consultado a cada request → role sempre atual
```

### Por que roles não ficam no token

O token contém apenas `sub=email`. `JwtAuthFilter` recarrega o `Usuario` completo do banco a cada request. Isso permite alterar a role de um usuário (ex: ALUNO → PROFESSOR) sem revogar tokens — na próxima request o novo role já é aplicado.

### Endpoints públicos

- `GET /api/cursos`, `GET /api/cursos/{id}`
- `GET /api/areas/**`, `GET /api/tipos/**`
- `GET /api/regioes`, `GET /api/regioes/unidades`
- `GET /api/unidades/**`
- `GET /uploads/**`
- `POST /api/auth/**`

### CORS

Origens permitidas: `http://localhost:4200` e `http://localhost:4300`. Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS. Credenciais: habilitadas.

---

## 9. Upload de Imagens

`UploadService` (backend) salva arquivos em `${user.home}/lms-uploads/{subpasta}/` com nome gerado por UUID. `UploadConfig` registra `ResourceHandler` para servir arquivos em `/uploads/**`.

Entidades com suporte a imagem:
- `usuarios.avatar_url` — qualquer usuário autenticado pode atualizar seu próprio avatar
- `cursos.imagem_url` — apenas ADMIN
- `unidades.imagem_url` — apenas ADMIN

A URL armazenada é absoluta (`http://localhost:8080/uploads/...`). Ao fazer novo upload, o arquivo anterior é deletado antes de salvar o novo.

---

## 10. Decisões de Arquitetura

| Decisão | Justificativa |
|---|---|
| **JWT sem roles no token** | Role sempre fresca do banco; mudança de role funciona sem revogar tokens |
| **DTOs centralizados em `DTOs.java`** | Todos os records visíveis num único arquivo; factory `from()` por response |
| **Soft delete em cursos** | Preserva histórico de matrículas; `ativo=false` exclui da listagem sem deletar dados |
| **Flyway ao invés de `ddl-auto=create`** | Schema versionado e auditável; `ddl-auto=validate` garante correspondência JPA/banco |
| **Angular Signals** | Estado reativo sem Observables; `currentUser` signal permite `computed()` e templates reativos |
| **Rotas estáticas antes de dinâmicas** | `/cursos/areas` antes de `/cursos/:id` evita "areas" ser interpretado como ID |
| **`filter` CSS em `<html>` não em `<body>`** | Elementos `position: fixed` não são alcançados por `filter` no body |
| **MutationObserver só `childList`** | `attributes: true` causaria loop infinito ao aplicar `style.setProperty` |
| **PK composta com `@EmbeddedId`** | Modelo relacional correto para professor_cursos; sem surrogate key desnecessária |
| **`@Query` JPQL para `ProfessorCurso`** | Spring Data não deriva queries de `@EmbeddedId`; necessário JPQL explícito com `pc.id.professorId` |
| **UnidadeController separado de RegiaoController** | Rota `/api/unidades/{slug}` (leitura por slug) é distinta do CRUD `/api/regioes/{id}/unidades` |

---

## 11. Como Rodar Localmente

**Pré-requisitos:** Java 17, Node.js 18+, Docker Desktop

```powershell
# 1. Banco de dados
cd backend
docker compose up -d
# Se container já existe: docker start lms-postgres

# 2. Backend
$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
cd C:\Users\Miguel\Downloads\lms\backend
.\mvnw.cmd spring-boot:run        # porta 8080

# 3. Frontend
cd C:\Users\Miguel\Downloads\lms\frontend
npm install
npx ng serve                       # porta 4200

# Acesso: http://localhost:4200
# Admin:  miguel@lms.com / 123456
```

**Aplicar nova migration sem subir o servidor:**
```powershell
.\mvnw.cmd flyway:migrate `
  -Dflyway.url=jdbc:postgresql://localhost:5433/lmsdb `
  -Dflyway.user=lms `
  -Dflyway.password=lms123
```
