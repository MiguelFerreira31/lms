package br.com.lms.dto;

import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.Modulo;
import br.com.lms.domain.matricula.Matricula;
import br.com.lms.domain.usuario.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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

    public record UsuarioResponse(Long id, String nome, String email, Usuario.Role role) {
        public static UsuarioResponse from(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getRole());
        }
    }
}
