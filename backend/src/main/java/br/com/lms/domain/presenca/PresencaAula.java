package br.com.lms.domain.presenca;

import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.matricula.Matricula;
import br.com.lms.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "presencas_aula",
    uniqueConstraints = @UniqueConstraint(columnNames = {"matricula_id", "aula_id", "data_aula"}))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PresencaAula {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @Column(nullable = false)
    @Builder.Default
    private Boolean presente = false;

    @Column(name = "data_aula", nullable = false)
    private LocalDate dataAula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @Column(name = "registrado_em", nullable = false, updatable = false)
    private LocalDateTime registradoEm;

    @PrePersist
    protected void onCreate() { registradoEm = LocalDateTime.now(); }
}
