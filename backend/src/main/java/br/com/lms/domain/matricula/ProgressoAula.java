package br.com.lms.domain.matricula;

import br.com.lms.domain.curso.Aula;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "progresso_aulas", uniqueConstraints = @UniqueConstraint(columnNames = {"matricula_id", "aula_id"}))
@Getter
@Setter
@ToString
// equals/hashCode apenas pelo id: com @Data, o Lombok os gerava sobre TODOS os
// campos, incluindo associacoes — um Modulo.equals() chamava Curso.equals(),
// que percorria a colecao de modulos, e um simples List.contains() forcava a
// carga do grafo inteiro (ou entrava em recursao).
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressoAula {

    @EqualsAndHashCode.Include
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
