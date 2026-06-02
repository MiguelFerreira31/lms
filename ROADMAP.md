# Roadmap — LMS Lite

> Atualizado em: 2026-06-02

---

## ✅ Implementado

### Infraestrutura e segurança
- [x] Autenticação JWT (HMAC-SHA512, 24h, `sub=email`)
- [x] Roles: ADMIN / PROFESSOR / ALUNO
- [x] Roles carregadas do banco a cada request (não no token)
- [x] BCrypt para senhas
- [x] CORS configurado para dev (4200 + 4300)
- [x] Docker Compose para PostgreSQL
- [x] Flyway — 15 migrations (V1–V15)
- [x] Interceptor JWT no Angular
- [x] Interceptor de erros HTTP no Angular

### Gestão de cursos
- [x] CRUD completo de cursos (com soft delete)
- [x] Módulos e aulas por curso
- [x] Conteúdo de aulas (VIDEO / PDF / TEXTO / LINK)
- [x] Organização por Áreas, Categorias e Tipos
- [x] Filtros de listagem: nível, unidade, área, categoria, tipo
- [x] Upload de imagem de curso (JPEG/PNG/WebP, max 5MB)

### Gestão de usuários e professores
- [x] Registro de usuário (role ALUNO por padrão)
- [x] CRUD de usuários pelo ADMIN (edição inline)
- [x] Alteração de role pelo ADMIN
- [x] Upload de avatar (qualquer usuário autenticado)
- [x] Vínculo Professor ↔ Curso gerenciado pelo ADMIN
- [x] Painel do professor: cursos vinculados com módulos/aulas/conteúdo

### Gestão de regiões e unidades
- [x] CRUD de regiões e unidades pelo ADMIN
- [x] 64 unidades reais do Senac SP (seed V12)
- [x] Slugs únicos para unidades (V13/V14)
- [x] Upload de imagem de unidade
- [x] Página pública de detalhe de unidade (por slug)
- [x] Cursos filtrados por unidade, com sub-filtro por área ou tipo

### Matrículas e progresso
- [x] Matrícula de aluno em curso
- [x] Progresso por aula (marcar como concluída)
- [x] Painel "Minhas Matrículas" com progresso percentual
- [x] Listagem de alunos matriculados por curso (ADMIN/PROF)
- [x] Lançamento de nota pelo ADMIN/PROF (≥ 6,0 = aprovado)

### Presença
- [x] Registro de presença por aula e data (upsert)
- [x] Unique constraint: matricula + aula + data
- [x] Resumo percentual de presença por matrícula

### Frontend — páginas e componentes
- [x] Landing page pública (`/home`)
- [x] Navbar pública com mega-dropdown (Cursos e Unidades)
- [x] Navbar autenticada com sidebar colapsável
- [x] Catálogo de áreas (`/cursos/areas`)
- [x] Detalhe de área com categorias
- [x] Listagem de cursos por categoria e por tipo
- [x] Detalhe de curso com botão de matrícula
- [x] Listagem de unidades por região
- [x] Detalhe de unidade com cursos por área/tipo
- [x] Dashboard do aluno
- [x] Painel admin: cursos, usuários, regiões, professores
- [x] Dashboard admin com Chart.js + GSAP (KPIs + 3 gráficos)
- [x] Componente compartilhado `CursoCard`
- [x] Componente `ImageUpload` com preview imediato
- [x] Página `/sobre`

### Acessibilidade
- [x] Tamanho de fonte (5 níveis: -1 a 3)
- [x] Fonte para dislexia (OpenDyslexic via CDN)
- [x] Espaçamento de linha (normal / média / ampla)
- [x] Espaçamento de letras (normal / média / ampla)
- [x] Alto contraste (JS — preserva cores originais)
- [x] Contraste invertido (CSS filter)
- [x] Escala de cinza e sépia (CSS filter)
- [x] Daltonismo: protanopia, deuteranopia, tritanopia (SVG feColorMatrix)
- [x] Cursor grande
- [x] Lupa de navegação com texto semântico real
- [x] Links destacados
- [x] Máscara de leitura (faixa de foco de 90px)
- [x] Guia de leitura (linha horizontal)
- [x] VLibras integrado (angular-vlibras, gov.br)
- [x] Persistência em localStorage
- [x] ColorManager (patching de CSS vars para contraste WCAG)

---

## 🔄 Em andamento / Próximos passos

| Funcionalidade | Justificativa | Complexidade |
|---|---|---|
| Testes automatizados backend (JUnit 5) | Qualidade e confiança no refactor | Média |
| Testes E2E frontend (Cypress / Playwright) | Cobertura de fluxos críticos | Alta |
| Swagger / OpenAPI | Documentação interativa da API | Baixa |
| Paginação no painel admin de cursos | UX com 35+ cursos fica pesada | Baixa |
| Notificações in-app para alunos | UX — saber quando notas são lançadas | Média |
| Busca textual no catálogo de cursos | Funcionalidade core de LMS | Média |

---

## 🗺️ Visão de longo prazo

Funcionalidades avançadas para evoluir o projeto além do portfólio:

- **Deploy em produção** — Railway, Render ou VPS com Docker Compose
- **CI/CD** — GitHub Actions com build + lint + test
- **Certificados de conclusão** — geração de PDF para cursos concluídos
- **Sistema de avaliações** — exercícios por aula com correção automática
- **Notificações por email** — confirmação de matrícula, nota lançada
- **API pública documentada** — Swagger UI com autenticação
- **Multi-tenant** — suporte a múltiplas instituições no mesmo banco

---

## Decisões de escopo

O LMS Lite é intencionalmente um **sistema de portfólio** — demonstra competência técnica fullstack sem escopo de produto completo. Funcionalidades são priorizadas pelo que melhor demonstra a stack (Java 17, Spring Boot 3.5, Angular 18, JWT, PostgreSQL) e diferenciais de qualidade (acessibilidade WCAG, admin dashboard com gráficos) para recrutadores e avaliadores técnicos.
