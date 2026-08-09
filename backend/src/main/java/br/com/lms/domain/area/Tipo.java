package br.com.lms.domain.area;

import br.com.lms.domain.curso.Curso;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tipos")
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
public class Tipo {

    @EqualsAndHashCode.Include
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
