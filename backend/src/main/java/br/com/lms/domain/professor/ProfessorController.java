package br.com.lms.domain.professor;

import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professores")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarProfessores() {
        return ResponseEntity.ok(professorService.listarProfessores());
    }

    @GetMapping("/{professorId}/cursos")
    public ResponseEntity<List<CursoResumoResponse>> cursosDoProfessor(@PathVariable Long professorId) {
        return ResponseEntity.ok(professorService.cursosDoProfessor(professorId));
    }

    @GetMapping("/meus-cursos")
    public ResponseEntity<List<CursoResumoResponse>> meusCursos(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(professorService.cursosDoProfessor(usuario.getId()));
    }

    @PostMapping("/{professorId}/cursos")
    public ResponseEntity<Void> vincular(@PathVariable Long professorId,
            @Valid @RequestBody VincularCursoRequest request) {
        boolean criado = professorService.vincular(professorId, request.cursoId());
        return criado ? ResponseEntity.status(201).build() : ResponseEntity.ok().build();
    }

    @DeleteMapping("/{professorId}/cursos/{cursoId}")
    public ResponseEntity<Void> desvincular(@PathVariable Long professorId,
            @PathVariable Long cursoId) {
        professorService.desvincular(professorId, cursoId);
        return ResponseEntity.noContent().build();
    }
}
