# LMS Lite — Documento de Contexto do Projeto

> Documento de referência técnica consolidado, feito para ser usado como **contexto** em outras conversas/projetos. Descreve tecnologias, arquitetura e funcionalidades do estado atual do repositório (branch `master`, working tree limpo em 2026-08-07).

---

## 1. Visão geral

**LMS Lite** é um sistema de gestão de cursos educacionais (Learning Management System), projeto full-stack de portfólio inspirado em dados reais do Senac SP (64 unidades reais usadas como seed). Cobre o ciclo completo: catálogo de cursos, matrícula, conteúdo pedagógico, avaliação, presença e administração multi-perfil (admin/professor/aluno).

**Estrutura do repositório** — monorepo simples (duas pastas irmãs, sem workspace unificado / sem Nx-Turborepo-Lerna):

```
lms/
├── README.md, DOCUMENTACAO.md, ROADMAP.md, AUDITORIA.md   # docs originais do projeto
├── CONTEXTO_PROJETO.md                                     # este arquivo
├── backend/     # API Java 17 + Spring Boot 3.5
└── frontend/    # SPA Angular 18 standalone
```

Backend e frontend rodam e buildam de forma totalmente independente (CI/CD via GitHub Actions valida build+test a cada push/PR; sem Docker orquestrando a app em si — só o Postgres é containerizado).

---

## 2. Backend — `backend/`

### 2.1 Stack

| Item | Valor |
|---|---|
| Linguagem | Java 17 |
| Framework | Spring Boot **3.5.14** |
| Persistência | Spring Data JPA / Hibernate (`ddl-auto=validate` — schema só via Flyway) |
| Banco | PostgreSQL 15 (Docker, porta host 5433) |
| Migrations | Flyway (`flyway-core` + `flyway-database-postgresql`), V1→V15 |
| Segurança | Spring Security (stateless) + JWT (`jjwt` 0.12.5, HMAC-SHA512) |
| Validação | Bean Validation (`spring-boot-starter-validation`) |
| Outros | Lombok |
| Build | Maven (`./mvnw`) |
| Testes | 14 testes de integração (`@SpringBootTest` + MockMvc + Testcontainers/Postgres real + Flyway) cobrindo Auth, Matrícula, Presença e Curso, além do teste de context-load original |

### 2.2 Arquitetura de pacotes

Organização **por domínio** (não por camada técnica), 2 camadas efetivas (Controller → Repository, sem Service intermediário exceto upload):

```
br.com.lms/
├── LmsApplication.java
├── config/          SecurityConfig, UploadConfig, WebConfig
├── domain/
│   ├── area/        Area, Categoria, Tipo
│   ├── conteudo/    ConteudoAula
│   ├── curso/       Curso, Modulo, Aula
│   ├── matricula/   Matricula, ProgressoAula
│   ├── presenca/    PresencaAula
│   ├── professor/   ProfessorCurso (PK composta @EmbeddedId)
│   ├── regiao/      Regiao, Unidade
│   ├── upload/       UploadController, UploadService
│   └── usuario/     Usuario, AuthController
│   (cada pacote de domínio contém Entity + Controller + Repository)
├── dto/DTOs.java    # todos os DTOs (Java records) em um único arquivo
├── exception/       GlobalExceptionHandler (@RestControllerAdvice), ResourceNotFoundException
└── security/        JwtAuthFilter, JwtTokenProvider, UserDetailsServiceImpl
```

### 2.3 Modelo de dados

Tabelas principais e relacionamentos:

- `usuarios` (id, nome, email UNIQUE, senha_hash, role, unidade_id FK, avatar_url) — role: `ADMIN` / `PROFESSOR` / `ALUNO`
- `cursos` (titulo, descricao, nivel, ativo=soft-delete, unidade_id FK, imagem_url)
- `modulos` (titulo, ordem, curso_id FK) → `aulas` (titulo, url_video, duracao_min, ordem, modulo_id FK)
- `conteudos_aula` (tipo: VIDEO/PDF/TEXTO/LINK, titulo, conteudo, ordem, aula_id FK)
- `matriculas` (usuario_id, curso_id, status, nota, aprovado, nota_lancada_em/por) — UNIQUE(usuario_id, curso_id)
- `progresso_aulas` (matricula_id, aula_id, concluida) — UNIQUE(matricula_id, aula_id)
- `presencas_aula` (matricula_id, aula_id, presente, data_aula) — UNIQUE(matricula_id, aula_id, data_aula)
- `regioes` → `unidades` (nome, slug UNIQUE, endereco, regiao_id FK, imagem_url) — seed real: 4 regiões, 64 unidades Senac SP
- `areas` → `categorias` (N:1 area) ; `tipos` (independente) — cursos N:N com categorias e tipos
- `professor_cursos` (PK composta professor_id+curso_id)

Relação hierárquica de conteúdo: `Curso 1:N Modulo 1:N Aula 1:N (ConteudoAula, ProgressoAula, PresencaAula)`.

Migrations relevantes: V11 faz seed de áreas/categorias/tipos; V12 faz seed de regiões/unidades/cursos reais; V13/V14 tratam slugs; V15 adiciona campos de imagem. Próxima migration livre: **V16**.

### 2.4 Autenticação e autorização

- JWT stateless, token carrega **apenas o email** (`sub`) — nenhuma role/claim. A cada request, `JwtAuthFilter` recarrega o `Usuario` do banco via `UserDetailsServiceImpl`, então mudanças de role têm efeito imediato sem precisar revogar tokens.
- `BCryptPasswordEncoder`, `DaoAuthenticationProvider`, `@EnableMethodSecurity`, CSRF desabilitado.
- CORS liberado para `localhost:4200`/`4300` (dev do frontend).
- Regras de autorização por rota (`SecurityConfig`):
  - **Público**: `/api/auth/**`, GET `/uploads/**`, GET `/api/cursos`, `/api/unidades/**`, `/api/areas/**`, `/api/tipos/**`, `/api/regioes`
  - **Somente ADMIN**: escrita em cursos, usuários, regiões/unidades, vínculo professor↔curso
  - **ADMIN + PROFESSOR**: conteúdo de aulas, presença, lançamento de nota, matrículas por curso
  - **Autenticado**: demais rotas

### 2.5 Principais módulos de API (REST)

| Controller | Rota base | Função |
|---|---|---|
| AuthController | `/api/auth` | login, register (role ALUNO) |
| CursoController | `/api/cursos` | CRUD, soft delete, filtros (nível/unidade/área/categoria/tipo), **cria/edita módulos junto com o curso** |
| AreaController | `/api/areas`, `/api/tipos` | árvore área→categoria, cursos por categoria/tipo |
| UnidadeController | `/api/unidades` | detalhe por slug, cursos por unidade+área/tipo |
| RegiaoController | `/api/regioes` | CRUD regiões + unidades aninhadas |
| MatriculaController | `/api/matriculas` | matricular, progresso por aula, lançar nota (aprovação automática ≥ 6,0) |
| UsuarioController | `/api/usuarios` | CRUD (admin), perfil `me`, troca de role |
| ProfessorController | `/api/professores` | vínculo professor↔curso, "meus-cursos" |
| ConteudoAulaController | `/api/aulas/{id}/conteudos` | CRUD conteúdo (vídeo/PDF/texto/link) |
| PresencaController | `/api/presenca` | registrar/atualizar presença (upsert), resumo percentual |
| UploadController | `/api/upload` | avatar, capa de curso, foto de unidade (JPEG/PNG/WebP, máx 5MB) |

### 2.6 Configuração e infraestrutura local

- `application.properties`: Postgres em `jdbc:postgresql://localhost:5433/lmsdb`, Hikari `max-lifetime=1800000` (fix recente para falha de boot do Flyway por conexão obsoleta), `jwt.expiration-ms=86400000` (24h), uploads salvos em `${user.home}/lms-uploads/`.
- Credenciais de banco e JWT secret saíram do código-fonte: profiles `application-dev.properties` (fallback local via env var) e `application-prod.properties` (exige env var, sem fallback), documentados em `backend/.env.example`. Os valores originalmente hardcoded — expostos no histórico do git desde o commit inicial — já foram rotacionados; o secret antigo não é mais válido.
- `docker-compose.yml` (só backend) sobe apenas o Postgres 15 — app roda local via `./mvnw spring-boot:run`. A senha do banco também é lida de variável de ambiente (`.env`), sem hardcode.
- CI/CD via GitHub Actions: `backend-ci.yml` e `frontend-ci.yml` validam build+test a cada push/PR na `master` (sem deploy automático).

---

## 3. Frontend — `frontend/`

### 3.1 Stack

| Item | Valor |
|---|---|
| Framework | Angular **18** (standalone components, sem NgModules — roteamento via `loadComponent()`) |
| UI Kit | Angular Material 18.2.14 + CDK (tabelas, botões, ícones, snackbar, tabs, expansion panel) |
| Estilos | Tailwind CSS 3.4.19 + design system próprio `.lms-*` |
| Estado | **Angular Signals** nativos (sem NgRx/Redux) |
| Gráficos | Chart.js 4.5.1 |
| Animações | GSAP 3.15.0 |
| Acessibilidade | angular-vlibras 1.1.0 (Libras) |
| HTTP | `HttpClient` + interceptors funcionais |
| Build | Angular CLI 18 |
| Testes | Karma/Jasmine — 12 specs cobrindo AuthService, authGuard, jwtInterceptor, errorInterceptor e CursoService |

### 3.2 Estrutura (`src/app/`)

```
app.config.ts        # providers globais, HttpClient + interceptors
app.routes.ts         # rotas lazy via loadComponent()
accessibility/         # widget de acessibilidade (feature isolada, injetada no root)
core/
  guards/auth.guard.ts
  interceptors/jwt.interceptor.ts, error.interceptor.ts
  services/auth.service.ts, curso.service.ts, upload.service.ts
features/
  admin/{cursos, dashboard, professores, regioes, usuarios}
  areas/, cursos/detalhe-curso, dashboard/ (aluno)
  home/, login/, sobre/
  matriculas/minhas-matriculas
  professor/meus-cursos
  unidades/{detalhe-unidade, cursos-unidade-area, cursos-unidade-tipo}
shared/
  curso-card/, image-upload/, navbar/, public-nav/
```

Roteamento 100% lazy-loaded; rotas estáticas declaradas antes das dinâmicas para evitar colisão. `authGuard` protege `/dashboard`, `/matriculas`, `/admin/*`, `/professor/*` — diferenciação fina de role acontece dentro dos componentes e é reforçada pelo backend.

### 3.3 Gerenciamento de estado e serviços

- `AuthService`: `signal<AuthResponse|null>` sincronizado com `localStorage` (`lms_token`, `lms_user`); `isAdmin()`/`isProfessor()` são leituras síncronas do signal.
- `CursoService`: client HTTP central concentrando praticamente todos os endpoints (cursos, áreas, tipos, matrículas, usuários, regiões, unidades, professores, conteúdos, presença, notas).
- `UploadService`: uploads multipart (avatar, curso, unidade).
- Interceptors funcionais: `jwtInterceptor` (injeta `Authorization: Bearer`), `errorInterceptor` (tratamento global + logout automático em 401).

### 3.4 Design system `lms-*`

Conjunto de classes utilitárias (Tailwind `@apply`, em `src/styles.scss`) que **substitui os form fields do Angular Material** em 5 telas (login/registro, admin-cursos, admin-regioes, admin-professores, professor-cursos):

- `.lms-field`, `.lms-label` (com `.required`), `.lms-input`, `.lms-select` (seta custom via SVG), `.lms-textarea`, `.lms-error`, `.lms-hint`, `.lms-form-grid` (`.cols-2/3/4`)
- Angular Material continua sendo usado para os demais widgets (tabelas, botões, ícones, snackbar, tabs).
- Paleta Tailwind customizada: cor `senac` (azul, base `#0054A6`), cor `primary` (indigo), `surface`, sombras `card`/`card-hover`; variáveis CSS globais (`--color-primary`, `--color-accent`, etc.).

### 3.5 Principais telas

- **Público**: Home, Sobre, Login/Registro, catálogo por Área→Categoria e por Tipo, detalhe de curso, unidades por região, detalhe de unidade (por slug).
- **Aluno**: Dashboard, "Minhas Matrículas" com progresso percentual.
- **Professor**: cursos vinculados — módulos/aulas/conteúdo, lançamento de presença e nota.
- **Admin**:
  - Dashboard com KPIs animados (GSAP) + 3 gráficos Chart.js
  - CRUD de cursos com upload de capa e **gestão de módulos inline (FormArray)** — adicionar/remover/reordenar módulos ao criar/editar curso; painel "Alunos & Notas" expansível por curso
  - CRUD de usuários (edição inline, troca de role)
  - CRUD de regiões/unidades aninhadas
  - Vínculo professor↔curso

### 3.6 Módulo de Acessibilidade (diferencial do projeto)

Widget global standalone (WCAG 2.1 AA/AAA), persistido em `localStorage`: 5 níveis de fonte, fonte para dislexia, espaçamento de linha/letra, alto contraste, contraste invertido, escala de cinza, sépia, simulação de daltonismo (SVG `feColorMatrix`), cursor grande, lupa de navegação, links destacados, máscara/guia de leitura, integração VLibras (Libras).

---

## 4. Funcionalidades de negócio (resumo)

1. Autenticação/autorização multi-perfil (JWT, 3 roles)
2. Catálogo de cursos por Área→Categoria e por Tipo, com filtro por unidade/região e nível
3. Conteúdo pedagógico hierárquico: Curso → Módulo → Aula → Conteúdo (vídeo/PDF/texto/link)
4. Gestão de módulos direto no painel admin de cursos (FormArray dinâmico)
5. Matrícula de alunos com progresso por aula concluída
6. Avaliação: lançamento de nota, aprovação automática (≥ 6,0), auditoria de quem/quando lançou
7. Controle de presença por aula/data
8. Gestão de regiões e unidades (seed real de 64 unidades Senac SP)
9. Gestão de vínculo professor↔curso
10. Gestão de usuários e roles
11. Upload de imagens (avatar, capa de curso, foto de unidade)
12. Dashboard administrativo com KPIs e gráficos
13. Acessibilidade digital completa (WCAG 2.1 AA/AAA + Libras)

---

## 5. Débitos técnicos e pontos de atenção conhecidos

- Sem Service layer explícita no backend — lógica de negócio nos Controllers.
- Estratégia de atualização de módulos no `PUT /api/cursos` é "replace all" (limpa e recria), não merge incremental.
- Arquivo de crash dump da JVM (`hs_err_pid*.log`) presente na raiz — candidato a limpeza.

---

## 6. Documentação original do projeto

O repositório já contém documentação própria mais extensa (datada de 2026-06-02/05, um pouco defasada em relação aos últimos 3 commits, já incorporados aqui):

- `README.md` — visão geral e como rodar
- `DOCUMENTACAO.md` — documentação técnica detalhada (API REST completa, decisões de arquitetura)
- `ROADMAP.md` — funcionalidades implementadas/planejadas
- `AUDITORIA.md` — histórico de auditorias de higiene de código
