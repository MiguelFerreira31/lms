# Roadmap — LMS Lite

## Status atual (v1.0)

### Implementado
- Autenticação JWT com roles ALUNO e ADMIN
- Cadastro e login de usuários
- CRUD de cursos (título, descrição, nível)
- Módulos e aulas vinculadas aos cursos
- Matrícula de alunos em cursos
- Progresso por aula (marcar como concluída)
- Dashboard do aluno com estatísticas
- Painel admin: gerenciar cursos e usuários
- Promoção/rebaixamento de role via painel
- Frontend Angular 18 + Tailwind + Material com sidebar responsiva
- API REST documentada, PostgreSQL + Flyway, Docker Compose

---

## Próximos passos (v2.0)

### 1. Regiões e Unidades
**Objetivo:** Estrutura geográfica hierárquica para multi-tenant por localidade.

**Backend:**
- Entidade `Regiao` (id, nome)
- Entidade `Unidade` (id, nome, endereco, regiao_id FK)
- Migrations V4 e V5
- Endpoints CRUD para regiões e unidades (ADMIN)
- Associar `Usuario` a uma `Unidade`

**Frontend:**
- Telas de gerenciamento de regiões e unidades no painel Admin
- Select cascata: Região → Unidade no cadastro de usuário

**Banco:**
```sql
CREATE TABLE regioes (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);
CREATE TABLE unidades (
    id         BIGSERIAL PRIMARY KEY,
    regiao_id  BIGINT NOT NULL REFERENCES regioes(id),
    nome       VARCHAR(200) NOT NULL,
    endereco   TEXT
);
ALTER TABLE usuarios ADD COLUMN unidade_id BIGINT REFERENCES unidades(id);
```

---

### 2. Tipo de Usuário Professor
**Objetivo:** Nova role com permissões intermediárias entre ALUNO e ADMIN.

**Backend:**
- Adicionar `PROFESSOR` ao enum `Usuario.Role`
- Professor vinculado a cursos via tabela `professor_cursos`
- Endpoints de vinculação (ADMIN vincula professor ao curso)
- Permissões específicas: professor só acessa cursos dele

**Banco:**
```sql
ALTER TYPE usuario_role ADD VALUE 'PROFESSOR';
CREATE TABLE professor_cursos (
    professor_id BIGINT NOT NULL REFERENCES usuarios(id),
    curso_id     BIGINT NOT NULL REFERENCES cursos(id),
    PRIMARY KEY (professor_id, curso_id)
);
```

---

### 3. Conteúdo das Aulas
**Objetivo:** Professor pode enriquecer cada aula com materiais.

**Backend:**
- Entidade `ConteudoAula` (id, aula_id, tipo, titulo, url_ou_texto, ordem)
- Tipos: VIDEO, PDF, TEXTO, LINK
- Endpoints CRUD restritos ao professor dono do curso

**Frontend:**
- Tela de edição de aula com upload/link de conteúdo
- Visualização para o aluno: player de vídeo, PDF viewer, texto formatado

**Banco:**
```sql
CREATE TABLE conteudos_aula (
    id          BIGSERIAL PRIMARY KEY,
    aula_id     BIGINT      NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    tipo        VARCHAR(20) NOT NULL, -- VIDEO, PDF, TEXTO, LINK
    titulo      VARCHAR(200) NOT NULL,
    conteudo    TEXT,
    ordem       INT NOT NULL DEFAULT 0
);
```

---

### 4. Presença nas Aulas
**Objetivo:** Professor registra presença dos alunos matriculados.

**Backend:**
- Entidade `PresencaAula` (id, matricula_id, aula_id, presente, data_aula, registrado_por)
- Endpoint: `POST /api/presenca` (PROFESSOR)
- Endpoint: `GET /api/matriculas/{id}/presenca` (ALUNO e PROFESSOR)
- Calcular percentual de presença por matrícula

**Frontend:**
- Tela do professor: lista de alunos por aula com checkbox de presença
- Tela do aluno: histórico de presença com percentual

**Banco:**
```sql
CREATE TABLE presencas_aula (
    id              BIGSERIAL PRIMARY KEY,
    matricula_id    BIGINT    NOT NULL REFERENCES matriculas(id),
    aula_id         BIGINT    NOT NULL REFERENCES aulas(id),
    presente        BOOLEAN   NOT NULL DEFAULT FALSE,
    data_aula       DATE      NOT NULL,
    registrado_por  BIGINT    REFERENCES usuarios(id),
    UNIQUE (matricula_id, aula_id, data_aula)
);
```

---

### 5. Nota Final do Aluno
**Objetivo:** Professor atribui nota ao aluno ao concluir o curso.

**Backend:**
- Campo `nota` (DECIMAL 4,2) e `aprovado` (BOOLEAN) na tabela `matriculas`
- Endpoint: `PATCH /api/matriculas/{id}/nota` (PROFESSOR)
- Regra de aprovação configurável (ex: nota >= 6.0)

**Frontend:**
- Tela do professor: lançar nota por aluno
- Tela do aluno: visualizar nota e status de aprovação
- Certificado visual ao ser aprovado

**Banco:**
```sql
ALTER TABLE matriculas ADD COLUMN nota DECIMAL(4,2);
ALTER TABLE matriculas ADD COLUMN aprovado BOOLEAN DEFAULT FALSE;
ALTER TABLE matriculas ADD COLUMN nota_lancada_em TIMESTAMP;
ALTER TABLE matriculas ADD COLUMN nota_lancada_por BIGINT REFERENCES usuarios(id);
```

---

### 6. Dashboard Completo (Admin e Aluno)

**Dashboard Admin:**
- Total de regiões, unidades, cursos, professores, alunos
- Gráfico de matrículas por mês (Recharts no Angular)
- Taxa de aprovação por curso
- Ranking de cursos mais acessados
- Alunos com presença crítica (< 75%)

**Dashboard Aluno:**
- Progresso geral de todos os cursos matriculados
- Histórico de presença consolidado
- Notas e status de aprovação por curso
- Próximas aulas agendadas
- Certificados disponíveis

---

## Arquitetura futura (v2.0)

```
lms/
├── backend/
│   └── src/main/java/br/com/lms/
│       └── domain/
│           ├── regiao/          # Regiao, Unidade
│           ├── professor/       # vínculo professor-curso
│           ├── conteudo/        # ConteudoAula
│           ├── presenca/        # PresencaAula
│           └── avaliacao/       # Nota, Aprovação
└── frontend/
    └── src/app/features/
        ├── professor/           # dashboard e ferramentas do professor
        │   ├── meus-cursos/
        │   ├── lancar-presenca/
        │   └── lancar-nota/
        ├── admin/
        │   ├── regioes/         # CRUD de regiões
        │   └── unidades/        # CRUD de unidades
        └── aluno/
            ├── conteudo-aula/   # visualização de conteúdo
            └── meu-historico/   # presença + notas
```

---

## Ordem sugerida de implementação

| Prioridade | Feature | Dependências |
|------------|---------|-------------|
| 1 | Regiões e Unidades | — |
| 2 | Role Professor | Regiões e Unidades |
| 3 | Vínculo Professor-Curso | Role Professor |
| 4 | Conteúdo das Aulas | Vínculo Professor-Curso |
| 5 | Presença nas Aulas | Vínculo Professor-Curso |
| 6 | Nota Final | Presença + Conteúdo |
| 7 | Dashboard completo | Todos os anteriores |
