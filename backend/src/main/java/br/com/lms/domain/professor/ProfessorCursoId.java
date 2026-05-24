package br.com.lms.domain.professor;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor
public class ProfessorCursoId implements Serializable {
    private Long professorId;
    private Long cursoId;
}
