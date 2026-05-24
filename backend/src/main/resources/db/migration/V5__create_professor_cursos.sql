CREATE TABLE professor_cursos (
    professor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id     BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    vinculado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (professor_id, curso_id)
);
