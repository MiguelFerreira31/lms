CREATE TABLE presencas_aula (
    id              BIGSERIAL PRIMARY KEY,
    matricula_id    BIGINT  NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id         BIGINT  NOT NULL REFERENCES aulas(id),
    presente        BOOLEAN NOT NULL DEFAULT FALSE,
    data_aula       DATE    NOT NULL,
    registrado_por  BIGINT  REFERENCES usuarios(id),
    registrado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (matricula_id, aula_id, data_aula)
);
