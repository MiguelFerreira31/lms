package br.com.lms.domain.professor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProfessorCursoRepository extends JpaRepository<ProfessorCurso, ProfessorCursoId> {

    @Query("SELECT pc FROM ProfessorCurso pc WHERE pc.id.professorId = :professorId")
    List<ProfessorCurso> findByProfessorId(@Param("professorId") Long professorId);

    @Query("SELECT pc FROM ProfessorCurso pc WHERE pc.id.cursoId = :cursoId")
    List<ProfessorCurso> findByCursoId(@Param("cursoId") Long cursoId);

    default boolean existsByProfessorIdAndCursoId(Long professorId, Long cursoId) {
        return existsById(new ProfessorCursoId(professorId, cursoId));
    }
}
