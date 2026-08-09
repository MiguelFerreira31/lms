package br.com.lms.domain.conteudo;

import br.com.lms.dto.DTOs.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@RequiredArgsConstructor
public class ConteudoAulaController {

    private final ConteudoAulaService conteudoAulaService;

    @GetMapping("/{aulaId}/conteudos")
    public ResponseEntity<List<ConteudoAulaResponse>> listar(@PathVariable Long aulaId) {
        return ResponseEntity.ok(conteudoAulaService.listar(aulaId));
    }

    @PostMapping("/{aulaId}/conteudos")
    public ResponseEntity<ConteudoAulaResponse> criar(@PathVariable Long aulaId,
            @Valid @RequestBody ConteudoAulaRequest request) {
        return ResponseEntity.status(201).body(conteudoAulaService.criar(aulaId, request));
    }

    @PutMapping("/{aulaId}/conteudos/{conteudoId}")
    public ResponseEntity<ConteudoAulaResponse> atualizar(@PathVariable Long aulaId,
            @PathVariable Long conteudoId,
            @Valid @RequestBody ConteudoAulaRequest request) {
        return ResponseEntity.ok(conteudoAulaService.atualizar(conteudoId, request));
    }

    @DeleteMapping("/{aulaId}/conteudos/{conteudoId}")
    public ResponseEntity<Void> deletar(@PathVariable Long aulaId, @PathVariable Long conteudoId) {
        conteudoAulaService.deletar(conteudoId);
        return ResponseEntity.noContent().build();
    }
}
