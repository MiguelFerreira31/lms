-- ============================================================
-- V12 — Seed rico: regiões, unidades e cursos reais (Senac SP)
-- ============================================================

-- ============================================================
-- 1. Regiões
-- ============================================================
INSERT INTO regioes (nome) VALUES
  ('Capital'),
  ('Grande São Paulo e Litoral'),
  ('Interior'),
  ('Centros Universitários')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================
-- 2. Unidades — Capital (18 unidades)
-- ============================================================
INSERT INTO unidades (regiao_id, nome)
SELECT r.id, t.nome
FROM regioes r
CROSS JOIN (VALUES
  ('Santo Amaro'),
  ('Aclimação'),
  ('Francisco Matarazzo'),
  ('Itaquera'),
  ('Jabaquara'),
  ('Jardim Primavera'),
  ('Lapa Faustolo'),
  ('Lapa Scipião'),
  ('Lapa Tito'),
  ('Largo Treze'),
  ('Penha'),
  ('Nações Unidas'),
  ('Santana'),
  ('São Miguel Paulista'),
  ('Tatuapé Cel. Luís Americano'),
  ('Tatuapé Serra de Bragança'),
  ('Tiradentes'),
  ('Vila Prudente')
) AS t(nome)
WHERE r.nome = 'Capital';

-- ============================================================
-- 3. Unidades — Grande São Paulo e Litoral (8 unidades)
-- ============================================================
INSERT INTO unidades (regiao_id, nome)
SELECT r.id, t.nome
FROM regioes r
CROSS JOIN (VALUES
  ('Bertioga'),
  ('Guarulhos Celestino'),
  ('Guarulhos Faccini'),
  ('Osasco'),
  ('Santos'),
  ('Santo André'),
  ('São Bernardo do Campo'),
  ('Taboão da Serra')
) AS t(nome)
WHERE r.nome = 'Grande São Paulo e Litoral';

-- ============================================================
-- 4. Unidades — Interior (35 unidades)
-- ============================================================
INSERT INTO unidades (regiao_id, nome)
SELECT r.id, t.nome
FROM regioes r
CROSS JOIN (VALUES
  ('Americana'),
  ('Araçatuba'),
  ('Araraquara'),
  ('Barretos'),
  ('Bauru'),
  ('Bebedouro'),
  ('Botucatu'),
  ('Campinas'),
  ('Catanduva'),
  ('Franca'),
  ('Guaratinguetá'),
  ('Itapetininga'),
  ('Itapira'),
  ('Itu'),
  ('Jaboticabal'),
  ('Jaú'),
  ('Jundiaí'),
  ('Limeira'),
  ('Marília'),
  ('Mogi Guaçu'),
  ('Ourinhos'),
  ('Pindamonhangaba'),
  ('Piracicaba'),
  ('Presidente Prudente'),
  ('Registro'),
  ('Ribeirão Preto'),
  ('Rio Claro'),
  ('Salto'),
  ('São Carlos'),
  ('São João da Boa Vista'),
  ('São José do Rio Preto'),
  ('São José dos Campos'),
  ('Sorocaba'),
  ('Taubaté'),
  ('Votuporanga')
) AS t(nome)
WHERE r.nome = 'Interior';

-- ============================================================
-- 5. Unidades — Centros Universitários (3 unidades)
-- ============================================================
INSERT INTO unidades (regiao_id, nome)
SELECT r.id, t.nome
FROM regioes r
CROSS JOIN (VALUES
  ('Centro Universitário Senac - Santo Amaro'),
  ('Centro Universitário Senac - Águas de São Pedro'),
  ('Centro Universitário Senac - Campos do Jordão')
) AS t(nome)
WHERE r.nome = 'Centros Universitários';

-- ============================================================
-- 6. Cursos (35 cursos — todas as 10 áreas e todos os 11 tipos)
-- ============================================================
INSERT INTO cursos (titulo, descricao, nivel, ativo, unidade_id) VALUES

-- Tecnologia da Informação
('Técnico em Desenvolvimento de Sistemas',
 'Forma profissionais para desenvolver sistemas computacionais com programação orientada a objetos e banco de dados.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Tatuapé Cel. Luís Americano')),

('Banco de Dados com PostgreSQL',
 'Aprofunda modelagem, administração e otimização de bancos de dados relacionais com PostgreSQL.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'São Miguel Paulista')),

('UX/UI Design',
 'Capacita designers para criar interfaces digitais centradas no usuário com ferramentas modernas de prototipagem.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Francisco Matarazzo')),

('Inteligência Artificial na Prática',
 'Apresenta fundamentos e aplicações de IA, machine learning e automação no mercado de trabalho.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Nações Unidas')),

('Redes de Computadores',
 'Prepara técnicos para instalar, configurar e gerenciar infraestruturas de redes cabeadas e sem fio.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Campinas')),

-- Gestão e Negócios
('Administração de Empresas',
 'Desenvolve competências em gestão organizacional, processos administrativos e tomada de decisão empresarial.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Osasco')),

('Gestão Financeira',
 'Capacita profissionais para controle de fluxo de caixa, análise de investimentos e planejamento financeiro.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Santo André')),

('Marketing Digital',
 'Abrange estratégias de presença online, SEO, mídia paga e análise de métricas em canais digitais.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Guarulhos Faccini')),

('Liderança e Gestão de Equipes',
 'Desenvolve habilidades de liderança, comunicação assertiva e gestão de times de alta performance.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Santo Amaro')),

-- Saúde
('Técnico em Enfermagem',
 'Forma técnicos para atuar em procedimentos de saúde, cuidados ao paciente e suporte às equipes de enfermagem.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Lapa Faustolo')),

('Nutrição Esportiva',
 'Orienta sobre alimentação adequada para melhorar desempenho físico e saúde de atletas e praticantes de esportes.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Santos')),

('Cuidador de Idosos',
 'Qualifica profissionais para prestar assistência humanizada e integral a pessoas idosas em domicílio ou instituições.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Santana')),

-- Gastronomia e Alimentação
('Confeitaria Artesanal',
 'Ensina técnicas de confeitaria, produção de bolos, doces e chocolates com acabamentos profissionais.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Nações Unidas')),

('Cozinha Brasileira Profissional',
 'Explora técnicas culinárias da gastronomia brasileira regional para atuação em restaurantes e catering.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'São Bernardo do Campo')),

('Sommelier de Vinhos',
 'Forma especialistas em análise sensorial, harmonização e serviço de vinhos nacionais e internacionais.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Campinas')),

-- Design, Artes e Arquitetura
('Design Gráfico Digital',
 'Desenvolve habilidades em identidade visual, diagramação e criação de peças gráficas para meios impressos e digitais.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Aclimação')),

('Fotografia Profissional',
 'Capacita fotógrafos para dominar técnica, iluminação e edição de imagens em diferentes segmentos do mercado.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Penha')),

('Moda e Estilo',
 'Apresenta tendências, história da moda e técnicas de styling para consultoria de imagem e produção editorial.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Largo Treze')),

-- Idiomas
('Inglês Básico ao Avançado',
 'Desenvolve as quatro habilidades do inglês — leitura, escrita, fala e escuta — do nível básico ao avançado.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Jabaquara')),

('Espanhol para Negócios',
 'Capacita profissionais para comunicação em espanhol em contextos corporativos e negociações internacionais.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Jundiaí')),

('Libras',
 'Introduz a Língua Brasileira de Sinais para comunicação com a comunidade surda e inclusão no ambiente de trabalho.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Tiradentes')),

-- Educação
('Formação de Docentes para EAD',
 'Prepara educadores para planejar, criar e facilitar experiências de aprendizagem em ambientes virtuais.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Campos do Jordão')),

('Pedagogia Empresarial',
 'Desenvolve competências pedagógicas para atuar em treinamento e desenvolvimento de pessoas nas organizações.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Águas de São Pedro')),

-- Comunicação e Marketing
('Produção de Conteúdo para Redes Sociais',
 'Ensina a criar, planejar e publicar conteúdos estratégicos nas principais plataformas de redes sociais.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Vila Prudente')),

('Jornalismo Digital',
 'Capacita jornalistas para produção e distribuição de conteúdo noticioso em plataformas digitais e multimídia.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Bauru')),

-- Beleza e Estética
('Técnico em Estética',
 'Forma técnicos para realizar tratamentos estéticos faciais e corporais com segurança e embasamento científico.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Taboão da Serra')),

('Barbearia Profissional',
 'Qualifica barbeiros para cortes masculinos, barbas e tratamentos capilares com técnicas contemporâneas.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Jardim Primavera')),

-- Turismo e Hospitalidade
('Técnico em Eventos',
 'Habilita profissionais para planejar, organizar e executar eventos corporativos, sociais e culturais.',
 'INTERMEDIARIO', true,
 (SELECT id FROM unidades WHERE nome = 'Ribeirão Preto')),

('Guia de Turismo Regional',
 'Prepara guias para conduzir visitantes em roteiros turísticos regionais com conhecimento histórico e cultural.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Guaratinguetá')),

-- Jovem Aprendiz
('Introdução ao Mundo do Trabalho (TI)',
 'Insere jovens no mercado de tecnologia com noções de lógica de programação, hardware e empregabilidade.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Lapa Tito')),

('Auxiliar Administrativo Jovem',
 'Prepara jovens aprendizes para rotinas administrativas, atendimento e organização em ambientes corporativos.',
 'BASICO', true,
 (SELECT id FROM unidades WHERE nome = 'Itaquera')),

-- Graduação (Centros Universitários)
('Tecnologia em Análise e Desenvolvimento de Sistemas',
 'Forma tecnólogos para análise de requisitos, desenvolvimento de software e gestão de projetos de TI.',
 'AVANCADO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Santo Amaro')),

('Gastronomia',
 'Curso superior em gastronomia abrangendo técnicas culinárias avançadas, gestão de restaurantes e tendências globais.',
 'AVANCADO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Águas de São Pedro')),

-- Pós-Graduação (Centros Universitários)
('Pós-Graduação em Inteligência Artificial',
 'Aprofunda algoritmos de IA, deep learning, visão computacional e ética na inteligência artificial.',
 'AVANCADO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Santo Amaro')),

('Pós-Graduação em Gestão de Negócios',
 'Desenvolve competências estratégicas em finanças, marketing, operações e liderança para executivos e gestores.',
 'AVANCADO', true,
 (SELECT id FROM unidades WHERE nome = 'Centro Universitário Senac - Campos do Jordão'));

-- ============================================================
-- 7. Vínculos curso ↔ categoria
-- ============================================================
INSERT INTO curso_categorias (curso_id, categoria_id)
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Técnico em Desenvolvimento de Sistemas'
  AND cat.slug = 'desenvolvimento-web' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Banco de Dados com PostgreSQL'
  AND cat.slug = 'banco-de-dados' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'UX/UI Design'
  AND cat.slug = 'ux-ui' AND a.slug = 'design-artes-e-arquitetura'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Inteligência Artificial na Prática'
  AND cat.slug = 'inteligencia-artificial' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Redes de Computadores'
  AND cat.slug = 'redes' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Administração de Empresas'
  AND cat.slug = 'administracao' AND a.slug = 'gestao-e-negocios'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Gestão Financeira'
  AND cat.slug = 'financas' AND a.slug = 'gestao-e-negocios'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Marketing Digital'
  AND cat.slug = 'marketing' AND a.slug = 'gestao-e-negocios'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Liderança e Gestão de Equipes'
  AND cat.slug = 'recursos-humanos' AND a.slug = 'gestao-e-negocios'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Técnico em Enfermagem'
  AND cat.slug = 'enfermagem' AND a.slug = 'saude'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Nutrição Esportiva'
  AND cat.slug = 'nutricao' AND a.slug = 'saude'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Cuidador de Idosos'
  AND cat.slug = 'enfermagem' AND a.slug = 'saude'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Confeitaria Artesanal'
  AND cat.slug = 'confeitaria' AND a.slug = 'gastronomia-e-alimentacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Cozinha Brasileira Profissional'
  AND cat.slug = 'cozinha-profissional' AND a.slug = 'gastronomia-e-alimentacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Sommelier de Vinhos'
  AND cat.slug = 'sommelier' AND a.slug = 'gastronomia-e-alimentacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Design Gráfico Digital'
  AND cat.slug = 'design-grafico' AND a.slug = 'design-artes-e-arquitetura'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Fotografia Profissional'
  AND cat.slug = 'fotografia' AND a.slug = 'design-artes-e-arquitetura'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Moda e Estilo'
  AND cat.slug = 'moda' AND a.slug = 'design-artes-e-arquitetura'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Inglês Básico ao Avançado'
  AND cat.slug = 'ingles' AND a.slug = 'idiomas'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Espanhol para Negócios'
  AND cat.slug = 'espanhol' AND a.slug = 'idiomas'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Libras'
  AND cat.slug = 'libras' AND a.slug = 'idiomas'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Formação de Docentes para EAD'
  AND cat.slug = 'docencia' AND a.slug = 'educacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Pedagogia Empresarial'
  AND cat.slug = 'pedagogia' AND a.slug = 'educacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Produção de Conteúdo para Redes Sociais'
  AND cat.slug = 'social-media' AND a.slug = 'comunicacao-e-marketing'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Jornalismo Digital'
  AND cat.slug = 'jornalismo' AND a.slug = 'comunicacao-e-marketing'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Técnico em Estética'
  AND cat.slug = 'cosmetologia' AND a.slug = 'beleza-e-estetica'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Barbearia Profissional'
  AND cat.slug = 'barbearia' AND a.slug = 'beleza-e-estetica'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Técnico em Eventos'
  AND cat.slug = 'eventos' AND a.slug = 'turismo-e-hospitalidade'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Guia de Turismo Regional'
  AND cat.slug = 'guia-turismo' AND a.slug = 'turismo-e-hospitalidade'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Introdução ao Mundo do Trabalho (TI)'
  AND cat.slug = 'desenvolvimento-web' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Auxiliar Administrativo Jovem'
  AND cat.slug = 'administracao' AND a.slug = 'gestao-e-negocios'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Tecnologia em Análise e Desenvolvimento de Sistemas'
  AND cat.slug = 'desenvolvimento-web' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Gastronomia'
  AND cat.slug = 'cozinha-profissional' AND a.slug = 'gastronomia-e-alimentacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Pós-Graduação em Inteligência Artificial'
  AND cat.slug = 'inteligencia-artificial' AND a.slug = 'tecnologia-da-informacao'
UNION ALL
SELECT c.id, cat.id FROM cursos c, categorias cat JOIN areas a ON cat.area_id = a.id
WHERE c.titulo = 'Pós-Graduação em Gestão de Negócios'
  AND cat.slug = 'administracao' AND a.slug = 'gestao-e-negocios'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. Vínculos curso ↔ tipo
-- ============================================================
INSERT INTO curso_tipos (curso_id, tipo_id)
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Técnico em Desenvolvimento de Sistemas'    AND t.slug = 'tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Banco de Dados com PostgreSQL'             AND t.slug = 'especializacao-tecnica'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'UX/UI Design'                              AND t.slug = 'ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Inteligência Artificial na Prática'        AND t.slug = 'ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Redes de Computadores'                     AND t.slug = 'ensino-medio-tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Administração de Empresas'                 AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Gestão Financeira'                         AND t.slug = 'especializacao-tecnica'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Marketing Digital'                         AND t.slug = 'especializacao-tecnica'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Liderança e Gestão de Equipes'             AND t.slug = 'extensao-universitaria'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Técnico em Enfermagem'                     AND t.slug = 'tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Nutrição Esportiva'                        AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Cuidador de Idosos'                        AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Confeitaria Artesanal'                     AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Cozinha Brasileira Profissional'           AND t.slug = 'ensino-medio-tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Sommelier de Vinhos'                       AND t.slug = 'presencial-ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Design Gráfico Digital'                    AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Fotografia Profissional'                   AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Moda e Estilo'                             AND t.slug = 'livre'
UNION ALL
-- Inglês cobre dois tipos: livre (curso curto) e idiomas (programa completo)
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Inglês Básico ao Avançado'                 AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Inglês Básico ao Avançado'                 AND t.slug = 'idiomas'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Espanhol para Negócios'                    AND t.slug = 'idiomas'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Libras'                                    AND t.slug = 'idiomas'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Formação de Docentes para EAD'             AND t.slug = 'ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Pedagogia Empresarial'                     AND t.slug = 'extensao-universitaria'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Produção de Conteúdo para Redes Sociais'   AND t.slug = 'presencial-ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Jornalismo Digital'                        AND t.slug = 'ead'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Técnico em Estética'                       AND t.slug = 'tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Barbearia Profissional'                    AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Técnico em Eventos'                        AND t.slug = 'tecnico'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Guia de Turismo Regional'                  AND t.slug = 'livre'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Introdução ao Mundo do Trabalho (TI)'      AND t.slug = 'jovem-aprendiz'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Auxiliar Administrativo Jovem'             AND t.slug = 'jovem-aprendiz'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Tecnologia em Análise e Desenvolvimento de Sistemas' AND t.slug = 'graduacao'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Gastronomia'                               AND t.slug = 'graduacao'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Pós-Graduação em Inteligência Artificial'  AND t.slug = 'pos-graduacao'
UNION ALL
SELECT c.id, t.id FROM cursos c, tipos t
WHERE c.titulo = 'Pós-Graduação em Gestão de Negócios'       AND t.slug = 'pos-graduacao'
ON CONFLICT DO NOTHING;
