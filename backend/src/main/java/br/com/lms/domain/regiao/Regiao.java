package br.com.lms.domain.regiao;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regioes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Regiao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String nome;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "regiao", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Unidade> unidades = new ArrayList<>();

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }
}
