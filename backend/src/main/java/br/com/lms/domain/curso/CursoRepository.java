package br.com.lms.domain.curso;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    Page<Curso> findByAtivoTrue(Pageable pageable);
    Page<Curso> findByAtivoTrueAndNivel(Curso.Nivel nivel, Pageable pageable);
    Page<Curso> findByAtivoTrueAndUnidade_Id(Long unidadeId, Pageable pageable);
    Page<Curso> findByAtivoTrueAndNivelAndUnidade_Id(Curso.Nivel nivel, Long unidadeId, Pageable pageable);

    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug")
    Page<Curso> findByAreaSlug(@Param("areaSlug") String areaSlug, Pageable pageable);

    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug AND cat.slug = :categoriaSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug AND cat.slug = :categoriaSlug")
    Page<Curso> findByCategoriaSlug(@Param("areaSlug") String areaSlug, @Param("categoriaSlug") String categoriaSlug, Pageable pageable);

    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND t.slug = :tipoSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND t.slug = :tipoSlug")
    Page<Curso> findByTipoSlug(@Param("tipoSlug") String tipoSlug, Pageable pageable);

    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND c.unidade.id = :unidadeId AND t.slug = :tipoSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND c.unidade.id = :unidadeId AND t.slug = :tipoSlug")
    Page<Curso> findByUnidadeAndTipo(@Param("unidadeId") Long unidadeId, @Param("tipoSlug") String tipoSlug, Pageable pageable);

    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND c.unidade.id = :unidadeId AND cat.area.slug = :areaSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND c.unidade.id = :unidadeId AND cat.area.slug = :areaSlug")
    Page<Curso> findByUnidadeAndArea(@Param("unidadeId") Long unidadeId, @Param("areaSlug") String areaSlug, Pageable pageable);
}
