-- Índices para colunas de chave estrangeira.
--
-- O Postgres cria índice automaticamente para PRIMARY KEY e UNIQUE, mas NÃO para
-- FOREIGN KEY. Antes desta migration o schema tinha exatamente um CREATE INDEX
-- (unidades_slug_idx, em V13), então todo join por FK e todo ON DELETE CASCADE
-- fazia sequential scan.
--
-- Ficam de fora as FKs já cobertas pela coluna LÍDER de um índice existente:
--   categorias.area_id              -> UNIQUE (area_id, slug)
--   matriculas.usuario_id           -> UNIQUE (usuario_id, curso_id)
--   progresso_aulas.matricula_id    -> UNIQUE (matricula_id, aula_id)
--   presencas_aula.matricula_id     -> UNIQUE (matricula_id, aula_id, data_aula)
--   professor_cursos.professor_id   -> PK (professor_id, curso_id)
--   curso_categorias.curso_id       -> PK (curso_id, categoria_id)
--   curso_tipos.curso_id            -> PK (curso_id, tipo_id)
-- As colunas NÃO-líderes desses mesmos índices compostos continuam descobertas e
-- por isso aparecem abaixo.

-- Hierarquia de conteúdo: Curso -> Modulo -> Aula -> ConteudoAula
CREATE INDEX IF NOT EXISTS modulos_curso_id_idx         ON modulos(curso_id);
CREATE INDEX IF NOT EXISTS aulas_modulo_id_idx          ON aulas(modulo_id);
CREATE INDEX IF NOT EXISTS conteudos_aula_aula_id_idx   ON conteudos_aula(aula_id);

-- Matrícula, progresso e presença (colunas não-líderes das UNIQUEs compostas)
CREATE INDEX IF NOT EXISTS matriculas_curso_id_idx          ON matriculas(curso_id);
CREATE INDEX IF NOT EXISTS progresso_aulas_aula_id_idx      ON progresso_aulas(aula_id);
CREATE INDEX IF NOT EXISTS presencas_aula_aula_id_idx       ON presencas_aula(aula_id);
CREATE INDEX IF NOT EXISTS presencas_aula_registrado_por_idx ON presencas_aula(registrado_por);

-- Catálogo
CREATE INDEX IF NOT EXISTS cursos_unidade_id_idx  ON cursos(unidade_id);
CREATE INDEX IF NOT EXISTS cursos_area_id_idx     ON cursos(area_id);
CREATE INDEX IF NOT EXISTS unidades_regiao_id_idx ON unidades(regiao_id);
CREATE INDEX IF NOT EXISTS usuarios_unidade_id_idx ON usuarios(unidade_id);

-- Lados inversos das tabelas de junção (o lado líder já está na PK)
CREATE INDEX IF NOT EXISTS professor_cursos_curso_id_idx     ON professor_cursos(curso_id);
CREATE INDEX IF NOT EXISTS curso_categorias_categoria_id_idx ON curso_categorias(categoria_id);
CREATE INDEX IF NOT EXISTS curso_tipos_tipo_id_idx           ON curso_tipos(tipo_id);

-- Query principal do catálogo: findByAtivoTrue(...) com @PageableDefault(sort="criadoEm").
-- Índice parcial: só as linhas ativas entram, que é o único filtro usado na listagem pública.
CREATE INDEX IF NOT EXISTS cursos_ativo_criado_em_idx ON cursos(criado_em DESC) WHERE ativo = true;
