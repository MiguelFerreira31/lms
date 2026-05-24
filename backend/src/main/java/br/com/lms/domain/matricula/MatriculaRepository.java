package br.com.lms.domain.matricula;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByUsuarioId(Long usuarioId);
    List<Matricula> findByCursoId(Long cursoId);
    Optional<Matricula> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);

    @Query("SELECT COUNT(p) FROM ProgressoAula p WHERE p.matricula.id = :matriculaId AND p.concluida = true")
    long countAulasConcluidas(@Param("matriculaId") Long matriculaId);

    @Query("SELECT COUNT(a) FROM Aula a WHERE a.modulo.curso.id = :cursoId")
    long countTotalAulasDoCurso(@Param("cursoId") Long cursoId);
}
