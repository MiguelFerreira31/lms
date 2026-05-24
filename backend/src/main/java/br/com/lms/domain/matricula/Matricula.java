package br.com.lms.domain.matricula;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matriculas", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "curso_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.EM_ANDAMENTO;

    @Column(name = "matriculado_em", nullable = false, updatable = false)
    private LocalDateTime matriculadoEm;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    @OneToMany(mappedBy = "matricula", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProgressoAula> progressos = new ArrayList<>();

    @Column(precision = 4, scale = 2)
    private BigDecimal nota;

    @Column
    @Builder.Default
    private Boolean aprovado = false;

    @Column(name = "nota_lancada_em")
    private LocalDateTime notaLancadaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_lancada_por")
    private Usuario notaLancadaPor;

    @PrePersist
    protected void onCreate() { matriculadoEm = LocalDateTime.now(); }

    public enum Status { EM_ANDAMENTO, CONCLUIDO, CANCELADO }
}
