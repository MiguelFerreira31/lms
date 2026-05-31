-- Adiciona coluna slug em unidades e popula via transliteração
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

UPDATE unidades
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRANSLATE(nome,
        'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ',
        'aaaaaaeeeeiiiiooooouuuuucAAAAAAAAEEEEIIIIOOOOOUUUUUC'
      ),
    '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g')
)
WHERE slug IS NULL;

ALTER TABLE unidades ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unidades_slug_idx ON unidades(slug);
