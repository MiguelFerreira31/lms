package br.com.lms.domain.professor;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "professor_cursos")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProfessorCurso {

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
