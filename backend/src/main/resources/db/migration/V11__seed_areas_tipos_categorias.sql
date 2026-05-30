-- ============================================================
-- Áreas
-- ============================================================
INSERT INTO areas (nome, slug) VALUES
  ('Tecnologia da Informação',    'tecnologia-da-informacao'),
  ('Gestão e Negócios',           'gestao-e-negocios'),
  ('Saúde',                       'saude'),
  ('Gastronomia e Alimentação',   'gastronomia-e-alimentacao'),
  ('Design, Artes e Arquitetura', 'design-artes-e-arquitetura'),
  ('Idiomas',                     'idiomas'),
  ('Educação',                    'educacao'),
  ('Comunicação e Marketing',     'comunicacao-e-marketing'),
  ('Beleza e Estética',           'beleza-e-estetica'),
  ('Turismo e Hospitalidade',     'turismo-e-hospitalidade');

-- ============================================================
-- Categorias — Tecnologia da Informação
-- ============================================================
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Banco de Dados',        'banco-de-dados'         FROM areas WHERE slug='tecnologia-da-informacao' UNION ALL
SELECT id, 'Desenvolvimento Web',   'desenvolvimento-web'    FROM areas WHERE slug='tecnologia-da-informacao' UNION ALL
SELECT id, 'Games',                 'games'                  FROM areas WHERE slug='tecnologia-da-informacao' UNION ALL
SELECT id, 'Redes',                 'redes'                  FROM areas WHERE slug='tecnologia-da-informacao' UNION ALL
SELECT id, 'Segurança',             'seguranca'              FROM areas WHERE slug='tecnologia-da-informacao' UNION ALL
SELECT id, 'Inteligência Artificial','inteligencia-artificial' FROM areas WHERE slug='tecnologia-da-informacao';

-- Gestão e Negócios
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Administração',   'administracao'   FROM areas WHERE slug='gestao-e-negocios' UNION ALL
SELECT id, 'Contabilidade',   'contabilidade'   FROM areas WHERE slug='gestao-e-negocios' UNION ALL
SELECT id, 'Marketing',       'marketing'       FROM areas WHERE slug='gestao-e-negocios' UNION ALL
SELECT id, 'Recursos Humanos','recursos-humanos' FROM areas WHERE slug='gestao-e-negocios' UNION ALL
SELECT id, 'Finanças',        'financas'        FROM areas WHERE slug='gestao-e-negocios';

-- Saúde
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Enfermagem', 'enfermagem' FROM areas WHERE slug='saude' UNION ALL
SELECT id, 'Farmácia',   'farmacia'   FROM areas WHERE slug='saude' UNION ALL
SELECT id, 'Nutrição',   'nutricao'   FROM areas WHERE slug='saude' UNION ALL
SELECT id, 'Estética',   'estetica'   FROM areas WHERE slug='saude';

-- Gastronomia e Alimentação
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Confeitaria',        'confeitaria'       FROM areas WHERE slug='gastronomia-e-alimentacao' UNION ALL
SELECT id, 'Cozinha Profissional','cozinha-profissional' FROM areas WHERE slug='gastronomia-e-alimentacao' UNION ALL
SELECT id, 'Sommelier',          'sommelier'         FROM areas WHERE slug='gastronomia-e-alimentacao';

-- Design, Artes e Arquitetura
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Design Gráfico','design-grafico' FROM areas WHERE slug='design-artes-e-arquitetura' UNION ALL
SELECT id, 'UX/UI',         'ux-ui'          FROM areas WHERE slug='design-artes-e-arquitetura' UNION ALL
SELECT id, 'Fotografia',    'fotografia'     FROM areas WHERE slug='design-artes-e-arquitetura' UNION ALL
SELECT id, 'Moda',          'moda'           FROM areas WHERE slug='design-artes-e-arquitetura';

-- Idiomas
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Inglês',   'ingles'   FROM areas WHERE slug='idiomas' UNION ALL
SELECT id, 'Espanhol', 'espanhol' FROM areas WHERE slug='idiomas' UNION ALL
SELECT id, 'Libras',   'libras'   FROM areas WHERE slug='idiomas' UNION ALL
SELECT id, 'Francês',  'frances'  FROM areas WHERE slug='idiomas';

-- Educação
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Pedagogia', 'pedagogia' FROM areas WHERE slug='educacao' UNION ALL
SELECT id, 'Docência',  'docencia'  FROM areas WHERE slug='educacao';

-- Comunicação e Marketing
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Publicidade', 'publicidade' FROM areas WHERE slug='comunicacao-e-marketing' UNION ALL
SELECT id, 'Social Media','social-media' FROM areas WHERE slug='comunicacao-e-marketing' UNION ALL
SELECT id, 'Jornalismo',  'jornalismo'  FROM areas WHERE slug='comunicacao-e-marketing';

-- Beleza e Estética
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Cosmetologia', 'cosmetologia' FROM areas WHERE slug='beleza-e-estetica' UNION ALL
SELECT id, 'Barbearia',    'barbearia'    FROM areas WHERE slug='beleza-e-estetica' UNION ALL
SELECT id, 'Maquiagem',    'maquiagem'    FROM areas WHERE slug='beleza-e-estetica';

-- Turismo e Hospitalidade
INSERT INTO categorias (area_id, nome, slug)
SELECT id, 'Hotelaria',      'hotelaria'    FROM areas WHERE slug='turismo-e-hospitalidade' UNION ALL
SELECT id, 'Eventos',        'eventos'      FROM areas WHERE slug='turismo-e-hospitalidade' UNION ALL
SELECT id, 'Guia de Turismo','guia-turismo' FROM areas WHERE slug='turismo-e-hospitalidade';

-- ============================================================
-- Tipos
-- ============================================================
INSERT INTO tipos (nome, slug) VALUES
  ('Livre',                    'livre'),
  ('Especialização Técnica',   'especializacao-tecnica'),
  ('Técnico',                  'tecnico'),
  ('Ensino Médio Técnico',     'ensino-medio-tecnico'),
  ('Jovem Aprendiz',           'jovem-aprendiz'),
  ('Idiomas',                  'idiomas'),
  ('Graduação',                'graduacao'),
  ('Pós-Graduação',            'pos-graduacao'),
  ('Extensão Universitária',   'extensao-universitaria'),
  ('EAD',                      'ead'),
  ('Presencial/EAD',           'presencial-ead');

-- ============================================================
-- Associar cursos existentes
-- Curso 1 (Engenharia de Software) → desenvolvimento-web + tecnico
-- ============================================================
INSERT INTO curso_categorias (curso_id, categoria_id)
VALUES (1, (SELECT c.id FROM categorias c JOIN areas a ON c.area_id = a.id
            WHERE a.slug='tecnologia-da-informacao' AND c.slug='desenvolvimento-web'));

INSERT INTO curso_tipos (curso_id, tipo_id)
VALUES (1, (SELECT id FROM tipos WHERE slug='tecnico'));

-- Curso 2 (Java para Iniciantes) → banco-de-dados + livre
INSERT INTO curso_categorias (curso_id, categoria_id)
VALUES (2, (SELECT c.id FROM categorias c JOIN areas a ON c.area_id = a.id
            WHERE a.slug='tecnologia-da-informacao' AND c.slug='banco-de-dados'));

INSERT INTO curso_tipos (curso_id, tipo_id)
VALUES (2, (SELECT id FROM tipos WHERE slug='livre'));
