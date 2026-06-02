# LMS Lite

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.14-6DB33F?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

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
  - Integração com **VLibras** (tradução para Libras — gov.br)

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Angular | 18 |
| UI | Tailwind CSS | 3.4 |
| Componentes | Angular Material | 18.2 |
| Gráficos | Chart.js | 4.5 |
| Animações | GSAP | 3.15 |
| Backend | Spring Boot | 3.5.14 |
| Linguagem | Java | 17 |
| Banco | PostgreSQL | 15 |
| Migrations | Flyway | via Spring Boot |
| Auth | JWT (jjwt) | 0.12.5 |
| Infra | Docker Compose | — |

---

## Arquitetura

```
Browser (Angular 18 SPA)
    │
    │ HTTP/REST — Bearer JWT
    ▼
Spring Boot 3.5.14 (:8080)
    │ JPA/Hibernate + Flyway
    ▼
PostgreSQL 15 (:5433)
```

O token JWT contém apenas o `sub=email`. A cada request, o backend carrega o usuário completo do banco, incluindo a role atual — isso permite alterar roles sem revogar tokens.

---

## Como rodar localmente

**Pré-requisitos:** Java 17, Node.js 18+, Docker Desktop

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

Conta admin padrão: `miguel@lms.com` / `123456`

---

## Estrutura do projeto

```
lms/
├── backend/          # Spring Boot 3.5.14 — API REST
│   └── src/main/java/br/com/lms/
│       ├── config/       # Security, Upload, Web
│       ├── domain/       # area, conteudo, curso, matricula, presenca,
│       │                 # professor, regiao, upload, usuario
│       ├── dto/          # DTOs centralizados (DTOs.java)
│       ├── exception/    # GlobalExceptionHandler
│       └── security/     # JWT filter, provider, UserDetails
├── frontend/         # Angular 18 SPA
│   └── src/app/
│       ├── accessibility/  # Widget de acessibilidade standalone
│       ├── core/           # Guards, interceptors, services
│       ├── features/       # admin, areas, cursos, dashboard, home,
│       │                   # login, matriculas, professor, sobre, unidades
│       └── shared/         # Navbar, PublicNav, CursoCard, ImageUpload
└── DOCUMENTACAO.md   # Referência técnica completa
```

---

## Banco de dados

15 migrations Flyway (V1–V15) gerenciam o schema. Highlights:
- **V12**: seed com 4 regiões, 64 unidades reais do Senac SP e 35 cursos
- **V13/V14**: slugs únicos para unidades (com correção de transliteração)
- **V15**: campos de imagem em usuários, cursos e unidades

---

## Autor

**Miguel Ferreira** — Desenvolvedor Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-MiguelFerreira31-181717?logo=github)](https://github.com/MiguelFerreira31)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-miguelcezarferreira-0A66C2?logo=linkedin)](https://linkedin.com/in/miguelcezarferreira)
