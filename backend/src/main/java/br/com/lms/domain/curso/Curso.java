package br.com.lms.domain.curso;

import br.com.lms.domain.area.Categoria;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.regiao.Unidade;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cursos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Curso {

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

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidade_id")
    private Unidade unidade;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<Modulo> modulos = new ArrayList<>();

    @ManyToMany(mappedBy = "cursos", fetch = FetchType.EAGER)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Categoria> categorias = new ArrayList<>();

    @ManyToMany(mappedBy = "cursos", fetch = FetchType.EAGER)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Tipo> tipos = new ArrayList<>();

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }

    public enum Nivel { BASICO, INTERMEDIARIO, AVANCADO }
}
