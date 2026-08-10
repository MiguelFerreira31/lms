# LMS Lite

![Java](https://img.shields.io/badge/Java-25%20LTS-ED8B00?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Tailwind](https://img.shields.io/badge/Tailwind-4.3-06B6D4?logo=tailwindcss)

> Sistema de gestão de cursos educacionais fullstack — projeto de portfólio

---

## Funcionalidades

- **Autenticação JWT** com controle de roles: ADMIN / PROFESSOR / ALUNO
- **Catálogo de cursos** organizado por área, categoria e tipo, com filtro por unidade/região
- **CRUD completo** de cursos, áreas, categorias, tipos, regiões e unidades
- **64 unidades Senac SP** distribuídas em 4 regiões (seed de dados realista)
- **Matrículas** de alunos em cursos com rastreamento de progresso por aula
- **Lançamento de notas** com aprovação automática (≥ 6,0)
- **Controle de presença** por aula, com resumo percentual
- **Conteúdo de aulas** com suporte a vídeo, PDF, texto e link externo
- **Vínculo Professor ↔ Curso** gerenciado pelo ADMIN
- **Upload de imagens** para avatar de usuário, capa de curso e foto de unidade
- **Dashboard administrativo** com gráficos Chart.js (matrículas/mês, cursos por nível, unidades por região) e animações GSAP
- **Modo claro e escuro** com página de **Aparência**: cores e tipografia
  configuráveis separadamente para cada modo, com prévia interativa (mostra
  hover e foco) e aviso de contraste WCAG
- **Documentação da API** em OpenAPI/Swagger e health check via Actuator
- **Widget de acessibilidade** completo (WCAG 2.1 AA/AAA):
  - Controle de tamanho de fonte (5 níveis)
  - Fonte para dislexia (OpenDyslexic)
  - Espaçamento de linha e letras
  - Alto contraste, contraste invertido
  - Escala de cinza e sépia
  - Suporte a daltonismo (protanopia, deuteranopia, tritanopia) via SVG feColorMatrix
  - Cursor grande
  - Lupa de navegação com texto real do elemento
  - Links destacados
  - Máscara e guia de leitura
  - Integração com **VLibras** (tradução para Libras — gov.br), via componente próprio

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Angular | 22 |
| UI | Tailwind CSS | 4.3 |
| Componentes | Angular Material | 22.1 (tema M3) |
| Gráficos | Chart.js | 4.5 |
| Animações | GSAP | 3.15 |
| Backend | Spring Boot | 4.1.0 |
| Linguagem | Java | 25 LTS |
| Banco | PostgreSQL | 18 |
| Migrations | Flyway | 12.4 (V1–V17) |
| Auth | JWT (jjwt) | 0.13.0 |
| Testes (back) | JUnit 6 + Testcontainers | 52 testes de integração |
| Testes (front) | Vitest · Playwright | 48 specs · 29 cenários E2E |
| Infra | Docker Compose | — |

---

## Arquitetura

```
Browser (Angular 22 SPA, zoneless)
    │
    │ HTTP/REST — Bearer JWT
    ▼
Spring Boot 4.1.0 (:8080)
    │ JPA/Hibernate + Flyway
    ▼
PostgreSQL 18 (:5433)
```

O token JWT contém apenas o `sub=email`. A cada request, o backend carrega o usuário completo do banco, incluindo a role atual — isso permite alterar roles sem revogar tokens.

---

## Como rodar localmente

**Pré-requisitos:** Java 25 (Temurin), Node.js 22+, Docker Desktop

```bash
# 1. Clonar
git clone https://github.com/MiguelFerreira31/lms
cd lms

# 2. Subir banco (PostgreSQL no Docker)
cd backend
docker compose up -d

# 3. Backend (porta 8080)
# Windows — definir JAVA_HOME se necessário:
# $env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
./mvnw spring-boot:run

# 4. Frontend (porta 4200)
cd ../frontend
npm install
npx ng serve
```

Acesse: **http://localhost:4200**

- Documentação da API (Swagger UI): **http://localhost:8080/swagger-ui.html**
- Health check: **http://localhost:8080/actuator/health**

Conta admin padrão: `miguel@lms.com` / `123456`

---

## Estrutura do projeto

```
lms/
├── backend/          # Spring Boot 4.1.0 — API REST
│   └── src/main/java/br/com/lms/
│       ├── config/       # Security, Upload, Cache, OpenAPI
│       ├── domain/       # area, conteudo, curso, matricula, presenca,
│       │                 # professor, regiao, upload, usuario
│       │                 # (cada um com Entity + Controller + Service + Repository)
│       ├── dto/          # DTOs centralizados (DTOs.java)
│       ├── exception/    # GlobalExceptionHandler (RFC 7807)
│       └── security/     # JWT filter, provider, UserDetails
├── frontend/         # Angular 22 SPA (zoneless)
│   └── src/app/
│       ├── accessibility/  # Widget de acessibilidade standalone
│       ├── core/           # authGuard/adminGuard/professorGuard, interceptors, services
│       ├── features/       # admin, areas, cursos, dashboard, home,
│       │                   # login, matriculas, professor, sobre, unidades
│       └── shared/         # Navbar, PublicNav, CursoCard, ImageUpload, Vlibras
│   └── src/tailwind.css    # Tailwind 4: @import, @theme e design system .lms-*
├── CONTEXTO_PROJETO.md  # Contexto técnico consolidado (inclui o registro da migração)
├── AUDITORIA.md         # Histórico de auditorias e bugs corrigidos
└── DOCUMENTACAO.md      # Referência técnica completa
```

---

## Banco de dados

17 migrations Flyway (V1–V17) gerenciam o schema. Highlights:
- **V12**: seed com 4 regiões, 64 unidades reais do Senac SP e 35 cursos
- **V13/V14**: slugs únicos para unidades (com correção de transliteração)
- **V15**: campos de imagem em usuários, cursos e unidades
- **V16**: vínculo curso ↔ área
- **V17**: 15 índices de chave estrangeira (o Postgres não indexa FK automaticamente) + índice parcial `cursos(criado_em DESC) WHERE ativo = true`

---

## Testes

```bash
# Backend — 52 testes de integração contra Postgres real (Testcontainers)
cd backend && ./mvnw verify

# Frontend — 48 testes unitários (Vitest, jsdom)
cd frontend && npm test

# Frontend — 29 cenários end-to-end (Playwright)
# exige o backend em :8080; o servidor do Angular sobe sozinho
cd frontend && npm run e2e
```

Os E2E cobrem navegação pública, login pela interface, guards por role, o
dashboard admin (os 3 gráficos Chart.js montando sob zoneless) e o widget de
acessibilidade. Os cenários de permissão criam usuários de verdade via API —
forjar a role no `localStorage` não funciona, porque o `AuthService` revalida
em `/api/usuarios/me` e o backend é a fonte da verdade.

---

## Autor

**Miguel Ferreira** — Desenvolvedor Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-MiguelFerreira31-181717?logo=github)](https://github.com/MiguelFerreira31)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-miguelcezarferreira-0A66C2?logo=linkedin)](https://linkedin.com/in/miguelcezarferreira)
