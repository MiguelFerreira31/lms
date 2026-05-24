package br.com.lms.domain.professor;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.domain.usuario.UsuarioRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professores")
@RequiredArgsConstructor
public class ProfessorController {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final ProfessorCursoRepository professorCursoRepository;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarProfessores() {
        return ResponseEntity.ok(
            usuarioRepository.findByRole(Usuario.Role.PROFESSOR)
                .stream().map(UsuarioResponse::from).toList()
        );
    }

    @GetMapping("/{professorId}/cursos")
    public ResponseEntity<List<CursoResumoResponse>> cursosDoProfessor(@PathVariable Long professorId) {
        return ResponseEntity.ok(
            professorCursoRepository.findByProfessorId(professorId)
                .stream().map(pc -> CursoResumoResponse.from(pc.getCurso())).toList()
        );
    }

    @GetMapping("/meus-cursos")
    public ResponseEntity<List<CursoResumoResponse>> meusCursos(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(
            professorCursoRepository.findByProfessorId(usuario.getId())
                .stream().map(pc -> CursoResumoResponse.from(pc.getCurso())).toList()
        );
    }

    @PostMapping("/{professorId}/cursos")
    public ResponseEntity<Void> vincular(@PathVariable Long professorId,
                                          @RequestBody Map<String, Long> body) {
        Long cursoId = body.get("cursoId");
        if (professorCursoRepository.existsByProfessorIdAndCursoId(professorId, cursoId))
            return ResponseEntity.ok().build();

        Usuario professor = usuarioRepository.findById(professorId)
            .orElseThrow(() -> new ResourceNotFoundException("Professor", professorId));
        Curso curso = cursoRepository.findById(cursoId)
            .orElseThrow(() -> new ResourceNotFoundException("Curso", cursoId));

        ProfessorCurso vinculo = ProfessorCurso.builder()
            .id(new ProfessorCursoId(professorId, cursoId))
            .professor(professor)
            .curso(curso)
            .build();
        professorCursoRepository.save(vinculo);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/{professorId}/cursos/{cursoId}")
    public ResponseEntity<Void> desvincular(@PathVariable Long professorId,
                                              @PathVariable Long cursoId) {
        ProfessorCursoId pk = new ProfessorCursoId(professorId, cursoId);
        if (!professorCursoRepository.existsById(pk))
            throw new ResourceNotFoundException("Vínculo professor-curso", professorId);
        professorCursoRepository.deleteById(pk);
        return ResponseEntity.noContent().build();
    }
}
