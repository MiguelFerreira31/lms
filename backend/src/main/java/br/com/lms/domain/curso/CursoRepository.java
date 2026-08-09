package br.com.lms.domain.curso;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Os métodos de listagem carregam {@code unidade} e {@code area} por
 * {@code @EntityGraph}: são associações *-to-one, então viram JOIN na própria
 * query sem multiplicar linhas nem quebrar a paginação. As coleções
 * ({@code categorias}, {@code tipos}) ficam de fora do grafo de propósito —
 * fetch join de coleção com Pageable força o Hibernate a paginar em memória.
 * Elas são resolvidas pelo {@code hibernate.default_batch_fetch_size}, que
 * agrupa a carga de todos os cursos da página em poucos selects.
 */
public interface CursoRepository extends JpaRepository<Curso, Long> {

    @EntityGraph(attributePaths = {"unidade", "area"})
    Page<Curso> findByAtivoTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    Page<Curso> findByAtivoTrueAndNivel(Curso.Nivel nivel, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    Page<Curso> findByAtivoTrueAndUnidade_Id(Long unidadeId, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    Page<Curso> findByAtivoTrueAndNivelAndUnidade_Id(Curso.Nivel nivel, Long unidadeId, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    @Query(value = "SELECT c FROM Curso c WHERE c.ativo = true AND c.area.slug = :areaSlug",
           countQuery = "SELECT COUNT(c) FROM Curso c WHERE c.ativo = true AND c.area.slug = :areaSlug")
    Page<Curso> findByAreaSlug(@Param("areaSlug") String areaSlug, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug AND cat.slug = :categoriaSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.categorias cat WHERE c.ativo = true AND cat.area.slug = :areaSlug AND cat.slug = :categoriaSlug")
    Page<Curso> findByCategoriaSlug(@Param("areaSlug") String areaSlug, @Param("categoriaSlug") String categoriaSlug, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND t.slug = :tipoSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND t.slug = :tipoSlug")
    Page<Curso> findByTipoSlug(@Param("tipoSlug") String tipoSlug, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    @Query(value = "SELECT DISTINCT c FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND c.unidade.id = :unidadeId AND t.slug = :tipoSlug",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Curso c JOIN c.tipos t WHERE c.ativo = true AND c.unidade.id = :unidadeId AND t.slug = :tipoSlug")
    Page<Curso> findByUnidadeAndTipo(@Param("unidadeId") Long unidadeId, @Param("tipoSlug") String tipoSlug, Pageable pageable);

    @EntityGraph(attributePaths = {"unidade", "area"})
    @Query(value = "SELECT c FROM Curso c WHERE c.ativo = true AND c.unidade.id = :unidadeId AND c.area.slug = :areaSlug",
           countQuery = "SELECT COUNT(c) FROM Curso c WHERE c.ativo = true AND c.unidade.id = :unidadeId AND c.area.slug = :areaSlug")
    Page<Curso> findByUnidadeAndArea(@Param("unidadeId") Long unidadeId, @Param("areaSlug") String areaSlug, Pageable pageable);

    /**
     * Detalhe: o grafo inclui os módulos, mas <b>não</b> {@code modulos.aulas}.
     * Buscar as duas coleções no mesmo grafo dispara
     * {@code MultipleBagFetchException} — o Hibernate não fetcha dois bags
     * (coleções {@code List} sem índice) na mesma query. As aulas são resolvidas
     * pelo {@code default_batch_fetch_size} num único select adicional.
     */
    @EntityGraph(attributePaths = {"unidade", "area", "modulos"})
    @Query("SELECT c FROM Curso c WHERE c.id = :id")
    java.util.Optional<Curso> findDetalheById(@Param("id") Long id);
}
