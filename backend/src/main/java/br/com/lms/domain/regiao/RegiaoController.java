package br.com.lms.domain.regiao;

import br.com.lms.dto.DTOs.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regioes")
@RequiredArgsConstructor
public class RegiaoController {

    private final RegiaoService regiaoService;

    @GetMapping
    public ResponseEntity<List<RegiaoResponse>> listar() {
        return ResponseEntity.ok(regiaoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegiaoResponse> detalhe(@PathVariable Long id) {
        return ResponseEntity.ok(regiaoService.detalhe(id));
    }

    @PostMapping
    public ResponseEntity<RegiaoResponse> criar(@Valid @RequestBody RegiaoRequest request) {
        return ResponseEntity.status(201).body(regiaoService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegiaoResponse> atualizar(@PathVariable Long id,
            @Valid @RequestBody RegiaoRequest request) {
        return ResponseEntity.ok(regiaoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        regiaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // --- Unidades ---

    @GetMapping("/{regiaoId}/unidades")
    public ResponseEntity<List<UnidadeResponse>> listarUnidades(@PathVariable Long regiaoId) {
        return ResponseEntity.ok(regiaoService.listarUnidades(regiaoId));
    }

    @PostMapping("/{regiaoId}/unidades")
    public ResponseEntity<UnidadeResponse> criarUnidade(@PathVariable Long regiaoId,
            @Valid @RequestBody UnidadeRequest request) {
        return ResponseEntity.status(201).body(regiaoService.criarUnidade(regiaoId, request));
    }

    @PutMapping("/{regiaoId}/unidades/{unidadeId}")
    public ResponseEntity<UnidadeResponse> atualizarUnidade(@PathVariable Long regiaoId,
            @PathVariable Long unidadeId,
            @Valid @RequestBody UnidadeRequest request) {
        return ResponseEntity.ok(regiaoService.atualizarUnidade(unidadeId, request));
    }

    @DeleteMapping("/{regiaoId}/unidades/{unidadeId}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long regiaoId,
            @PathVariable Long unidadeId) {
        regiaoService.deletarUnidade(unidadeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unidades")
    public ResponseEntity<List<UnidadeResponse>> listarTodasUnidades() {
        return ResponseEntity.ok(regiaoService.listarTodasUnidades());
    }
}
