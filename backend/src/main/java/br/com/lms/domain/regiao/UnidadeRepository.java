package br.com.lms.domain.regiao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UnidadeRepository extends JpaRepository<Unidade, Long> {
    @Query("SELECT u FROM Unidade u JOIN FETCH u.regiao WHERE u.regiao.id = :regiaoId")
    List<Unidade> findByRegiaoId(@Param("regiaoId") Long regiaoId);

    @Query("SELECT u FROM Unidade u JOIN FETCH u.regiao ORDER BY u.regiao.nome, u.nome")
    List<Unidade> findAllWithRegiao();
}
