package br.com.lms.domain.curso;

import br.com.lms.domain.area.Area;
import br.com.lms.domain.area.Categoria;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.regiao.Unidade;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "cursos")
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
public class Curso {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Nivel nivel;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    // As associações são LAZY: quem precisa delas declara o plano de fetch
    // (@EntityGraph nas queries de listagem + default_batch_fetch_size para as
    // coleções). Com EAGER, cada curso da página disparava selects próprios.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<Modulo> modulos = new ArrayList<>();

    // Set em vez de List: @ManyToMany sobre List é tratado como bag pelo Hibernate,
    // que faz DELETE-ALL + re-INSERT da tabela de junção a cada alteração.
    @ManyToMany(mappedBy = "cursos", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Categoria> categorias = new LinkedHashSet<>();

    @ManyToMany(mappedBy = "cursos", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Tipo> tipos = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }

    public enum Nivel { BASICO, INTERMEDIARIO, AVANCADO }
}
