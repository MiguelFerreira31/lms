package br.com.lms.domain.matricula;

import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaService matriculaService;

    @GetMapping("/minhas")
    public ResponseEntity<List<MatriculaResponse>> minhas(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(matriculaService.minhas(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<MatriculaResponse> matricular(@Valid @RequestBody MatriculaRequest request,
                                                        @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(201).body(matriculaService.matricular(usuario, request));
    }

    @GetMapping("/{id}/progresso")
    public ResponseEntity<ProgressoResponse> progresso(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaService.progresso(id));
    }

    @PostMapping("/progresso")
    public ResponseEntity<Void> marcarAula(@Valid @RequestBody MarcarAulaRequest request) {
        matriculaService.marcarAula(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<MatriculaDetalheResponse>> porCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(matriculaService.porCurso(cursoId));
    }

    @PatchMapping("/{id}/nota")
    public ResponseEntity<NotaResponse> lancarNota(@PathVariable Long id,
                                                   @Valid @RequestBody NotaRequest request,
                                                   @AuthenticationPrincipal Usuario professor) {
        return ResponseEntity.ok(matriculaService.lancarNota(id, request, professor));
    }
}
