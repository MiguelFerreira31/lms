CREATE TABLE conteudos_aula (
    id        BIGSERIAL PRIMARY KEY,
    aula_id   BIGINT      NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    tipo      VARCHAR(20) NOT NULL,
    titulo    VARCHAR(200) NOT NULL,
    conteudo  TEXT,
    ordem     INT         NOT NULL DEFAULT 0,
    criado_em TIMESTAMP   NOT NULL DEFAULT NOW()
);
