CREATE TABLE regioes (
    id        BIGSERIAL PRIMARY KEY,
    nome      VARCHAR(150) NOT NULL UNIQUE,
    criado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE unidades (
    id         BIGSERIAL PRIMARY KEY,
    regiao_id  BIGINT       NOT NULL REFERENCES regioes(id),
    nome       VARCHAR(200) NOT NULL,
    endereco   TEXT,
    criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios ADD COLUMN unidade_id BIGINT REFERENCES unidades(id);
