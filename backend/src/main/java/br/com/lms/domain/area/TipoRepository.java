package br.com.lms.domain.area;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TipoRepository extends JpaRepository<Tipo, Long> {

    List<Tipo> findAllByOrderByNomeAsc();

    Optional<Tipo> findBySlug(String slug);

    List<Tipo> findByCursos_Id(Long cursoId);

    /** Tipos que têm ao menos um curso ativo na unidade. */
    @Query("""
           SELECT DISTINCT t FROM Curso c
           JOIN c.tipos t
           WHERE c.ativo = true AND c.unidade.id = :unidadeId
           ORDER BY t.nome ASC
           """)
    List<Tipo> findComCursoAtivoNaUnidade(@Param("unidadeId") Long unidadeId);
}
