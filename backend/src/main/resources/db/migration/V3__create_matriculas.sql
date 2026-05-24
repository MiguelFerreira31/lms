CREATE TABLE matriculas (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT      NOT NULL REFERENCES usuarios(id),
    curso_id       BIGINT      NOT NULL REFERENCES cursos(id),
    status         VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    matriculado_em TIMESTAMP   NOT NULL DEFAULT NOW(),
    concluido_em   TIMESTAMP,
    UNIQUE (usuario_id, curso_id)
);
CREATE TABLE progresso_aulas (
    id           BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT    NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id      BIGINT    NOT NULL REFERENCES aulas(id),
    concluida    BOOLEAN   NOT NULL DEFAULT FALSE,
    concluido_em TIMESTAMP,
    UNIQUE (matricula_id, aula_id)
);
