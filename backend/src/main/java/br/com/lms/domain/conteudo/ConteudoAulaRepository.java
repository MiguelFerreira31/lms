package br.com.lms.domain.conteudo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConteudoAulaRepository extends JpaRepository<ConteudoAula, Long> {
    List<ConteudoAula> findByAulaIdOrderByOrdemAsc(Long aulaId);
}
