package br.com.lms.dto;

import br.com.lms.domain.conteudo.ConteudoAula;
import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.Modulo;
import br.com.lms.domain.matricula.Matricula;
import br.com.lms.domain.presenca.PresencaAula;
import br.com.lms.domain.regiao.Regiao;
import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.usuario.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    public record AuthRequest(@NotBlank @Email String email, @NotBlank String senha) {}

    public record RegisterRequest(@NotBlank String nome, @NotBlank @Email String email, @NotBlank String senha) {}

    public record AuthResponse(String token, String tipo, String nome, String email, String role) {}

    public record CursoRequest(@NotBlank String titulo, String descricao, @NotNull Curso.Nivel nivel) {}

    public record CursoResumoResponse(Long id, String titulo, String descricao, Curso.Nivel nivel, LocalDateTime criadoEm) {
        public static CursoResumoResponse from(Curso c) {
            return new CursoResumoResponse(c.getId(), c.getTitulo(), c.getDescricao(), c.getNivel(), c.getCriadoEm());
        }
    }

    public record AulaResponse(Long id, String titulo, String urlVideo, int duracaoMin, int ordem) {
        public static AulaResponse from(Aula a) {
            return new AulaResponse(a.getId(), a.getTitulo(), a.getUrlVideo(), a.getDuracaoMin(), a.getOrdem());
        }
    }

    public record ModuloResponse(Long id, String titulo, int ordem, List<AulaResponse> aulas) {
        public static ModuloResponse from(Modulo m) {
            return new ModuloResponse(m.getId(), m.getTitulo(), m.getOrdem(),
                    m.getAulas().stream().map(AulaResponse::from).toList());
        }
    }

    public record CursoDetalheResponse(Long id, String titulo, String descricao, Curso.Nivel nivel,
                                       LocalDateTime criadoEm, List<ModuloResponse> modulos) {
        public static CursoDetalheResponse from(Curso c) {
            return new CursoDetalheResponse(c.getId(), c.getTitulo(), c.getDescricao(), c.getNivel(), c.getCriadoEm(),
                    c.getModulos().stream().map(ModuloResponse::from).toList());
        }
    }

    public record MatriculaRequest(@NotNull Long cursoId) {}

    public record MatriculaResponse(Long id, Long cursoId, String cursoTitulo, Matricula.Status status,
                                    LocalDateTime matriculadoEm) {
        public static MatriculaResponse from(Matricula m) {
            return new MatriculaResponse(m.getId(), m.getCurso().getId(), m.getCurso().getTitulo(),
                    m.getStatus(), m.getMatriculadoEm());
        }
    }

    public record ProgressoResponse(Long matriculaId, long aulasConcluidas, long totalAulas, double percentual) {}

    public record MarcarAulaRequest(@NotNull Long matriculaId, @NotNull Long aulaId) {}

    public record UsuarioResponse(Long id, String nome, String email, Usuario.Role role, Long unidadeId, String unidadeNome) {
        public static UsuarioResponse from(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getRole(),
                u.getUnidade() != null ? u.getUnidade().getId() : null,
                u.getUnidade() != null ? u.getUnidade().getNome() : null);
        }
    }

    // Regiões e Unidades
    public record RegiaoRequest(@NotBlank String nome) {}

    public record RegiaoResponse(Long id, String nome, int totalUnidades) {
        public static RegiaoResponse from(Regiao r) {
            return new RegiaoResponse(r.getId(), r.getNome(), r.getUnidades().size());
        }
    }

    public record UnidadeRequest(@NotBlank String nome, String endereco, @NotNull Long regiaoId) {}

    public record UnidadeResponse(Long id, String nome, String endereco, Long regiaoId, String regiaoNome) {
        public static UnidadeResponse from(Unidade u) {
            return new UnidadeResponse(u.getId(), u.getNome(), u.getEndereco(),
                u.getRegiao().getId(), u.getRegiao().getNome());
        }
    }

    // Conteúdo das Aulas
    public record ConteudoAulaRequest(
        @NotBlank String titulo,
        @NotNull ConteudoAula.TipoConteudo tipo,
        String conteudo,
        Integer ordem
    ) {}

    public record ConteudoAulaResponse(
        Long id, String titulo,
        ConteudoAula.TipoConteudo tipo,
        String conteudo, int ordem
    ) {
        public static ConteudoAulaResponse from(ConteudoAula c) {
            return new ConteudoAulaResponse(c.getId(), c.getTitulo(),
                c.getTipo(), c.getConteudo(), c.getOrdem());
        }
    }

    // Presença
    public record PresencaRequest(
        @NotNull Long matriculaId,
        @NotNull Long aulaId,
        @NotNull Boolean presente,
        @NotNull LocalDate dataAula
    ) {}

    public record PresencaResponse(
        Long id, Long matriculaId, Long aulaId,
        boolean presente, LocalDate dataAula
    ) {
        public static PresencaResponse from(PresencaAula p) {
            return new PresencaResponse(p.getId(), p.getMatricula().getId(),
                p.getAula().getId(), p.getPresente(), p.getDataAula());
        }
    }

    public record PresencaResumoResponse(
        Long matriculaId, long presencas, long totalAulas, double percentual
    ) {}

    // Nota Final
    public record NotaRequest(@NotNull BigDecimal nota) {}

    public record NotaResponse(
        Long matriculaId, BigDecimal nota,
        boolean aprovado, LocalDateTime lancadaEm
    ) {}
}
