# LMS Lite

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-18-red?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

> Sistema de gestão de cursos educacionais fullstack — projeto de portfólio para vaga de Programador Java Jr no **Senac SP**.

## Funcionalidades

### Público (sem login)
- **Catálogo de cursos** com paginação e filtros por nível, região e unidade
- **Exploração por área** (Tecnologia, Saúde, Gastronomia e mais 7) e **tipo de curso** (Técnico, EAD, Graduação e mais 8)
- **Mapa de unidades** — 64 unidades reais do Senac SP organizadas por região com destaque por query param
- **Navbar com mega-dropdown** — Cursos (áreas + tipos) e Unidades (Capital, Grande SP, Interior, Centros Universitários) com dados reais da API
- Páginas institucionais: Home, Sobre, Unidades

### Aluno (autenticado)
- Cadastro e login com JWT
- Matrícula em cursos e acompanhamento de progresso por aula
- Dashboard com visão geral de matrículas e percentual de conclusão
- Histórico de presenças por matrícula

### Professor
- Gerenciamento de conteúdo das aulas (vídeos, PDFs, textos, links) nos cursos vinculados
- Lançamento de notas e registro de presença
- Acesso à lista de alunos matriculados por curso

### Administrador
- CRUD completo de cursos, usuários, regiões e unidades
- Gerenciamento de vínculos professor ↔ curso
- Painel de alunos e notas por curso
- Promoção/rebaixamento de roles (ALUNO → PROFESSOR → ADMIN)

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Java + Spring Boot | 17 + 3.5.14 |
| Segurança | Spring Security + JJWT | 6.x + 0.12.5 |
| ORM | Spring Data JPA / Hibernate | via Spring Boot |
| Banco | PostgreSQL | 15 |
| Migrations | Flyway | via Spring Boot |
| Infraestrutura | Docker Compose | 3 |
| Frontend | Angular | 18 |
| UI | Angular Material + Tailwind CSS | 18.2 + 3.4 |

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│  Angular 18 SPA (porta 4200)                           │
│  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │  Public Nav  │  │  Auth Nav (sidebar + topbar)   │  │
│  │  mega-drop   │  │  ADMIN / PROFESSOR / ALUNO     │  │
│  └──────────────┘  └────────────────────────────────┘  │
│  JWT Interceptor → Authorization: Bearer em toda req    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST JSON
┌──────────────────────▼──────────────────────────────────┐
│            Spring Boot API (porta 8080)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │SecurityConfig│  │ 10 domínios  │  │ JwtAuthFilter │  │
│  │ CORS/regras  │  │ Controllers  │  │ email→DB→user │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                     JPA/Hibernate + Flyway (V1–V12)      │
└──────────────────────┬──────────────────────────────────┘
                       │ JDBC porta 5433
┌──────────────────────▼──────────────────────────────────┐
│         PostgreSQL 15 — Docker container lms-postgres    │
│  16 tabelas · 64 unidades · 35 cursos · 10 áreas        │
└─────────────────────────────────────────────────────────┘
```

## Como rodar localmente

### Pré-requisitos
- Java 17
- Node.js 20+
- Docker Desktop

### 1. Clone e banco
```bash
git clone https://github.com/MiguelFerreira31/lms.git
cd lms/backend
docker compose up -d          # PostgreSQL na porta 5433
```

### 2. Backend
```powershell
# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"   # ajuste o path
.\mvnw.cmd spring-boot:run
# Flyway cria e popula o banco automaticamente na primeira execução
# API disponível em http://localhost:8080
```

### 3. Frontend
```bash
cd lms/frontend
npm install
npx ng serve
# App disponível em http://localhost:4200
```

### Credenciais de teste
| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Admin | `miguel@lms.com` | `123456` | ADMIN |

## Estrutura do projeto

```
lms/
├── backend/
│   ├── src/main/java/br/com/lms/
│   │   ├── config/            # SecurityConfig (CORS, JWT, regras de autorização)
│   │   ├── domain/            # area/, conteudo/, curso/, matricula/,
│   │   │                      # presenca/, professor/, regiao/, usuario/
│   │   ├── dto/DTOs.java      # Todos os records de request/response
│   │   ├── exception/         # GlobalExceptionHandler, ResourceNotFoundException
│   │   └── security/          # JwtAuthFilter, JwtTokenProvider, UserDetailsServiceImpl
│   ├── src/main/resources/
│   │   └── db/migration/      # V1 até V12 (Flyway)
│   └── docker-compose.yml
└── frontend/
    └── src/app/
        ├── core/              # auth.service, curso.service, auth.guard, jwt.interceptor
        ├── features/          # areas/, admin/, cursos/, dashboard/, home/,
        │                      # login/, matriculas/, professor/, sobre/, unidades/
        └── shared/            # navbar/ (autenticado), public-nav/ (público)
```

## API

Documentação completa dos endpoints em [DOCUMENTACAO.md](./DOCUMENTACAO.md).

Principais endpoints públicos:

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/login` | Login → JWT token |
| `GET` | `/api/cursos` | Catálogo paginado (filtros: nivel, unidadeId, areaSlug, tipoSlug) |
| `GET` | `/api/areas` | Áreas com categorias |
| `GET` | `/api/tipos` | Tipos de curso |
| `GET` | `/api/regioes` | Regiões com contagem de unidades |
| `GET` | `/api/regioes/unidades` | Todas as unidades com região |

## Demo

🔗 Em breve — deploy planejado via Railway ou Render

## Autor

**Miguel Ferreira** — Desenvolvedor Java Jr

[![GitHub](https://img.shields.io/badge/GitHub-MiguelFerreira31-181717?logo=github)](https://github.com/MiguelFerreira31)
