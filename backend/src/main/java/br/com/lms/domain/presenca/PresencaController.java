package br.com.lms.domain.presenca;

import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presenca")
@RequiredArgsConstructor
public class PresencaController {

    private final PresencaService presencaService;

    @PostMapping
    public ResponseEntity<PresencaResponse> registrar(@Valid @RequestBody PresencaRequest request,
                                                      @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(presencaService.registrar(request, usuario));
    }

    @GetMapping("/matricula/{matriculaId}")
    public ResponseEntity<List<PresencaResponse>> porMatricula(@PathVariable Long matriculaId) {
        return ResponseEntity.ok(presencaService.porMatricula(matriculaId));
    }

    @GetMapping("/matricula/{matriculaId}/resumo")
    public ResponseEntity<PresencaResumoResponse> resumo(@PathVariable Long matriculaId) {
        return ResponseEntity.ok(presencaService.resumo(matriculaId));
    }
}
