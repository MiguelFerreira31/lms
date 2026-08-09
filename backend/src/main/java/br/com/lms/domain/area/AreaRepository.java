package br.com.lms.domain.area;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Long> {

    @Query("SELECT DISTINCT a FROM Area a LEFT JOIN FETCH a.categorias ORDER BY a.nome ASC")
    List<Area> findAllWithCategorias();

    Optional<Area> findBySlug(String slug);

    /**
     * Áreas que têm ao menos um curso ativo na unidade.
     *
     * <p>Substitui a varredura que carregava todos os cursos da unidade
     * ({@code Pageable.unpaged()}) só para extrair as áreas distintas em memória.
     */
    @Query("""
           SELECT DISTINCT cat.area FROM Curso c
           JOIN c.categorias cat
           WHERE c.ativo = true AND c.unidade.id = :unidadeId
           ORDER BY cat.area.nome ASC
           """)
    List<Area> findComCursoAtivoNaUnidade(@Param("unidadeId") Long unidadeId);
}
