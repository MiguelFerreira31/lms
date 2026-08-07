-- ============================================================
-- V16 — Associação direta Curso -> Área
-- ============================================================
ALTER TABLE cursos ADD COLUMN area_id BIGINT;

UPDATE cursos c
SET area_id = sub.area_id
FROM (
    SELECT DISTINCT ON (cc.curso_id) cc.curso_id, cat.area_id
    FROM curso_categorias cc
    JOIN categorias cat ON cat.id = cc.categoria_id
    ORDER BY cc.curso_id, cat.area_id
) sub
WHERE c.id = sub.curso_id;

-- Cursos sem categoria vinculada ficam com a primeira área cadastrada
UPDATE cursos SET area_id = (SELECT id FROM areas ORDER BY id LIMIT 1) WHERE area_id IS NULL;

ALTER TABLE cursos ALTER COLUMN area_id SET NOT NULL;
ALTER TABLE cursos ADD CONSTRAINT fk_cursos_area FOREIGN KEY (area_id) REFERENCES areas(id);
