package br.com.lms.domain.area;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByArea_SlugAndSlug(String areaSlug, String slug);

    List<Categoria> findByCursos_Id(Long cursoId);
}
