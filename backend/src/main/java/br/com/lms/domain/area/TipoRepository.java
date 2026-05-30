package br.com.lms.domain.area;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TipoRepository extends JpaRepository<Tipo, Long> {

    List<Tipo> findAllByOrderByNomeAsc();

    Optional<Tipo> findBySlug(String slug);
}
