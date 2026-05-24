CREATE TABLE cursos (
    id        BIGSERIAL PRIMARY KEY,
    titulo    VARCHAR(200) NOT NULL,
    descricao TEXT,
    nivel     VARCHAR(20)  NOT NULL DEFAULT 'BASICO',
    ativo     BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE TABLE modulos (
    id       BIGSERIAL PRIMARY KEY,
    curso_id BIGINT       NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    titulo   VARCHAR(200) NOT NULL,
    ordem    INT          NOT NULL DEFAULT 0
);
CREATE TABLE aulas (
    id          BIGSERIAL PRIMARY KEY,
    modulo_id   BIGINT       NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    titulo      VARCHAR(200) NOT NULL,
    url_video   VARCHAR(500),
    duracao_min INT          NOT NULL DEFAULT 0,
    ordem       INT          NOT NULL DEFAULT 0
);
