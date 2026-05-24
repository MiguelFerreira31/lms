CREATE TABLE usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'ALUNO',
    criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);
