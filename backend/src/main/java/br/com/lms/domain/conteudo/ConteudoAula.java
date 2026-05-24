package br.com.lms.domain.conteudo;

import br.com.lms.domain.curso.Aula;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conteudos_aula")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConteudoAula {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoConteudo tipo;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @Column(nullable = false)
    @Builder.Default
    private Integer ordem = 0;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }

    public enum TipoConteudo { VIDEO, PDF, TEXTO, LINK }
}
