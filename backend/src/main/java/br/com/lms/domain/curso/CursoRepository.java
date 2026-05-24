package br.com.lms.domain.curso;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    Page<Curso> findByAtivoTrue(Pageable pageable);
    Page<Curso> findByAtivoTrueAndNivel(Curso.Nivel nivel, Pageable pageable);
}
