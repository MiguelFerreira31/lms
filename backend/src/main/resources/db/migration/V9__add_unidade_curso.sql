ALTER TABLE cursos ADD COLUMN unidade_id BIGINT REFERENCES unidades(id);
