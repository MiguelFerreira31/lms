CREATE TABLE areas (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE categorias (
    id      BIGSERIAL PRIMARY KEY,
    area_id BIGINT      NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    nome    VARCHAR(150) NOT NULL,
    slug    VARCHAR(150) NOT NULL,
    UNIQUE (area_id, slug)
);

CREATE TABLE tipos (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- N:N curso <-> categoria
CREATE TABLE curso_categorias (
    curso_id     BIGINT NOT NULL REFERENCES cursos(id)    ON DELETE CASCADE,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (curso_id, categoria_id)
);

-- N:N curso <-> tipo
CREATE TABLE curso_tipos (
    curso_id BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    tipo_id  BIGINT NOT NULL REFERENCES tipos(id)  ON DELETE CASCADE,
    PRIMARY KEY (curso_id, tipo_id)
);
