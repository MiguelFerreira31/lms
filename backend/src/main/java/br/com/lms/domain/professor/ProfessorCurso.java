package br.com.lms.domain.professor;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "professor_cursos")
@Getter
@Setter
@ToString
// equals/hashCode apenas pelo id: com @Data, o Lombok os gerava sobre TODOS os
// campos, incluindo associacoes, o que forcava a carga do grafo inteiro num
// simples List.contains() (ou entrava em recursao entre os dois lados).
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder @NoArgsConstructor @AllArgsConstructor
public class ProfessorCurso {

    @EqualsAndHashCode.Include
    @EmbeddedId
    @Builder.Default
    private ProfessorCursoId id = new ProfessorCursoId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("professorId")
    @JoinColumn(name = "professor_id")
    private Usuario professor;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("cursoId")
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @Column(name = "vinculado_em", nullable = false, updatable = false)
    private LocalDateTime vinculadoEm;

    @PrePersist
    protected void onCreate() { vinculadoEm = LocalDateTime.now(); }
}
