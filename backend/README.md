# LMS Lite — Backend

API REST para sistema de gestão de cursos educacionais, desenvolvida como projeto de portfólio.

## Stack

| Tecnologia | Versão |
|-----------|--------|
| Java | 17 |
| Spring Boot | 3.5.14 |
| Spring Security + JJWT | 6.x + 0.12.5 |
| Spring Data JPA + Hibernate | via Spring Boot |
| Flyway | via Spring Boot |
| Lombok | via Spring Boot |
| PostgreSQL | 15 (Docker, porta 5433) |

## Estrutura de domínios

```
src/main/java/br/com/lms/
├── config/       # SecurityConfig (CORS, JWT, autorização), UploadConfig, WebConfig
├── domain/
│   ├── area/         # Area, Categoria, Tipo — catálogo de cursos
│   ├── conteudo/     # ConteudoAula (VIDEO | PDF | TEXTO | LINK)
│   ├── curso/        # Curso (soft delete), Modulo, Aula
│   ├── matricula/    # Matricula, ProgressoAula
│   ├── presenca/     # PresencaAula (upsert por matricula+aula+data)
│   ├── professor/    # ProfessorCurso (@EmbeddedId)
│   ├── regiao/       # Regiao, Unidade (com slug único)
│   ├── upload/       # UploadService — JPEG/PNG/WebP, max 5 MB
│   └── usuario/      # Usuario (ADMIN | PROFESSOR | ALUNO), AuthController
├── dto/          # Todos os records request/response em DTOs.java
├── exception/    # GlobalExceptionHandler, ResourceNotFoundException
└── security/     # JwtAuthFilter, JwtTokenProvider (HMAC-SHA512, 24h), UserDetailsServiceImpl
```

## Como rodar

**Pré-requisitos:** Java 17, Docker Desktop

```powershell
# 1. Banco de dados (PostgreSQL 15 em container)
docker compose up -d

# 2. Backend (porta 8080)
# Windows — definir JAVA_HOME se necessário:
$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr"
.\mvnw.cmd spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

Credenciais do banco: `user=lms / pass=lms123 / db=lmsdb / host-port=5433`.

## Migrations Flyway

15 migrations (V1–V15) — **nunca alterar existentes**. Nova feature = `V16__descricao.sql`.
Schema gerenciado com `spring.jpa.hibernate.ddl-auto=validate`.

## Referência completa

Endpoints (40+), schema completo, decisões de arquitectura e troubleshooting:
→ [`../DOCUMENTACAO.md`](../DOCUMENTACAO.md)
