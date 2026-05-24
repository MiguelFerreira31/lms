# LMS Lite — Backend

API REST para sistema de gestão de cursos educacionais, desenvolvida como projeto de portfólio para demonstrar proficiência em Java/Spring Boot.

## Stack

- **Java 17** + **Spring Boot 3.2**
- **Spring Security** com autenticação **JWT** (JJWT 0.12)
- **Spring Data JPA** + **Hibernate**
- **PostgreSQL** com migrações via **Flyway**
- **Lombok** para redução de boilerplate
- **Docker** + **Docker Compose**

## Arquitetura

```
src/main/java/br/com/lms/
├── config/          # SecurityConfig (JWT, CORS, BCrypt)
├── domain/
│   ├── usuario/     # Entidade, Repository, AuthController, UsuarioController
│   ├── curso/       # Curso, Modulo, Aula — CRUD completo
│   └── matricula/   # Matrícula + progresso por aula
├── dto/             # Records Java para request/response
├── security/        # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
└── exception/       # GlobalExceptionHandler, ResourceNotFoundException
```

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/register | ❌ | Criar conta |
| POST | /api/auth/login | ❌ | Login, retorna JWT |
| GET | /api/cursos | ❌ | Listar cursos paginado |
| GET | /api/cursos/{id} | ❌ | Detalhe do curso |
| POST | /api/cursos | ADMIN | Criar curso |
| PUT | /api/cursos/{id} | ADMIN | Atualizar curso |
| DELETE | /api/cursos/{id} | ADMIN | Desativar curso |
| POST | /api/matriculas | ALUNO | Matricular-se |
| GET | /api/matriculas/minhas | ALUNO | Minhas matrículas |
| GET | /api/matriculas/{id}/progresso | ALUNO | Percentual de conclusão |
| POST | /api/matriculas/progresso | ALUNO | Marcar aula concluída |
| GET | /api/usuarios/me | ALUNO | Perfil do usuário |
| GET | /api/usuarios | ADMIN | Listar usuários |

## Como rodar

### Pré-requisitos
- Java 17+
- Docker Desktop

### 1. Subir o banco
```bash
docker compose up -d
```

### 2. Rodar a aplicação
```bash
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`

### Variáveis de ambiente
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/lmsdb
spring.datasource.username=lms
spring.datasource.password=lms123
jwt.secret=<chave-256bits>
jwt.expiration-ms=86400000
```

## Modelo de dados

```
usuarios
└── matriculas ──── progresso_aulas
└── cursos
    └── modulos
        └── aulas
```

## Tecnologias da vaga cobertas

✅ Java 11+ (usando 17) · ✅ Spring Boot · ✅ Spring Security · ✅ JPA/Hibernate · ✅ REST API · ✅ SQL/PostgreSQL · ✅ Docker · ✅ Flyway · ✅ Lombok
