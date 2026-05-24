package br.com.lms.domain.curso;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aulas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Aula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(name = "url_video", length = 500)
    private String urlVideo;

    @Column(name = "duracao_min", nullable = false)
    @Builder.Default
    private Integer duracaoMin = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer ordem = 0;
}
