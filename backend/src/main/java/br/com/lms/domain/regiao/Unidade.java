package br.com.lms.domain.regiao;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "unidades")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Unidade {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "regiao_id", nullable = false)
    private Regiao regiao;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String endereco;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }
}
