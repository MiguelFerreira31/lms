package br.com.lms.domain.matricula;

import br.com.lms.domain.curso.Aula;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "progresso_aulas", uniqueConstraints = @UniqueConstraint(columnNames = {"matricula_id", "aula_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressoAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @Column(nullable = false)
    @Builder.Default
    private Boolean concluida = false;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;
}
