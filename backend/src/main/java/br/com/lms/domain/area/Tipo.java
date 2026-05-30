package br.com.lms.domain.area;

import br.com.lms.domain.curso.Curso;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tipos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @ManyToMany
    @JoinTable(name = "curso_tipos",
               joinColumns = @JoinColumn(name = "tipo_id"),
               inverseJoinColumns = @JoinColumn(name = "curso_id"))
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Curso> cursos = new ArrayList<>();
}
