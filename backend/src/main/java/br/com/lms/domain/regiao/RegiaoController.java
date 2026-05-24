package br.com.lms.domain.regiao;

import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regioes")
@RequiredArgsConstructor
public class RegiaoController {

    private final RegiaoRepository regiaoRepository;
    private final UnidadeRepository unidadeRepository;

    @GetMapping
    public ResponseEntity<List<RegiaoResponse>> listar() {
        return ResponseEntity.ok(
            regiaoRepository.findAllWithUnidades().stream().map(RegiaoResponse::from).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegiaoResponse> detalhe(@PathVariable Long id) {
        Regiao regiao = regiaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Região", id));
        return ResponseEntity.ok(RegiaoResponse.from(regiao));
    }

    @PostMapping
    public ResponseEntity<RegiaoResponse> criar(@Valid @RequestBody RegiaoRequest request) {
        Regiao regiao = Regiao.builder().nome(request.nome()).build();
        return ResponseEntity.status(201).body(RegiaoResponse.from(regiaoRepository.save(regiao)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegiaoResponse> atualizar(@PathVariable Long id,
                                                     @Valid @RequestBody RegiaoRequest request) {
        Regiao regiao = regiaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Região", id));
        regiao.setNome(request.nome());
        return ResponseEntity.ok(RegiaoResponse.from(regiaoRepository.save(regiao)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!regiaoRepository.existsById(id))
            throw new ResourceNotFoundException("Região", id);
        regiaoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Unidades ---

    @GetMapping("/{regiaoId}/unidades")
    public ResponseEntity<List<UnidadeResponse>> listarUnidades(@PathVariable Long regiaoId) {
        return ResponseEntity.ok(
            unidadeRepository.findByRegiaoId(regiaoId).stream().map(UnidadeResponse::from).toList()
        );
    }

    @PostMapping("/{regiaoId}/unidades")
    public ResponseEntity<UnidadeResponse> criarUnidade(@PathVariable Long regiaoId,
                                                          @Valid @RequestBody UnidadeRequest request) {
        Regiao regiao = regiaoRepository.findById(regiaoId)
            .orElseThrow(() -> new ResourceNotFoundException("Região", regiaoId));
        Unidade unidade = Unidade.builder()
            .nome(request.nome())
            .endereco(request.endereco())
            .regiao(regiao)
            .build();
        return ResponseEntity.status(201).body(UnidadeResponse.from(unidadeRepository.save(unidade)));
    }

    @PutMapping("/{regiaoId}/unidades/{unidadeId}")
    public ResponseEntity<UnidadeResponse> atualizarUnidade(@PathVariable Long regiaoId,
                                                              @PathVariable Long unidadeId,
                                                              @Valid @RequestBody UnidadeRequest request) {
        Unidade unidade = unidadeRepository.findById(unidadeId)
            .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
        unidade.setNome(request.nome());
        unidade.setEndereco(request.endereco());
        return ResponseEntity.ok(UnidadeResponse.from(unidadeRepository.save(unidade)));
    }

    @DeleteMapping("/{regiaoId}/unidades/{unidadeId}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long regiaoId,
                                                @PathVariable Long unidadeId) {
        if (!unidadeRepository.existsById(unidadeId))
            throw new ResourceNotFoundException("Unidade", unidadeId);
        unidadeRepository.deleteById(unidadeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unidades")
    public ResponseEntity<List<UnidadeResponse>> listarTodasUnidades() {
        return ResponseEntity.ok(
            unidadeRepository.findAllWithRegiao().stream().map(UnidadeResponse::from).toList()
        );
    }
}
