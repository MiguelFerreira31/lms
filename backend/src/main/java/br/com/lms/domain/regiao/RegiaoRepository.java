package br.com.lms.domain.regiao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RegiaoRepository extends JpaRepository<Regiao, Long> {
    @Query("SELECT DISTINCT r FROM Regiao r LEFT JOIN FETCH r.unidades ORDER BY r.nome")
    List<Regiao> findAllWithUnidades();
}
