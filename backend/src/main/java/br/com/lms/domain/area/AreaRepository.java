package br.com.lms.domain.area;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Long> {

    @Query("SELECT DISTINCT a FROM Area a LEFT JOIN FETCH a.categorias ORDER BY a.nome ASC")
    List<Area> findAllWithCategorias();

    Optional<Area> findBySlug(String slug);
}
