package br.com.lms.domain.conteudo;

import br.com.lms.domain.curso.Aula;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@RequiredArgsConstructor
public class ConteudoAulaController {

    private final ConteudoAulaRepository conteudoRepository;
    private final EntityManager em;

    @GetMapping("/{aulaId}/conteudos")
    public ResponseEntity<List<ConteudoAulaResponse>> listar(@PathVariable Long aulaId) {
        return ResponseEntity.ok(
            conteudoRepository.findByAulaIdOrderByOrdemAsc(aulaId)
                .stream().map(ConteudoAulaResponse::from).toList()
        );
    }

    @PostMapping("/{aulaId}/conteudos")
    public ResponseEntity<ConteudoAulaResponse> criar(@PathVariable Long aulaId,
                                                        @Valid @RequestBody ConteudoAulaRequest request) {
        Aula aula = em.find(Aula.class, aulaId);
        if (aula == null) throw new ResourceNotFoundException("Aula", aulaId);

        ConteudoAula conteudo = ConteudoAula.builder()
            .aula(aula)
            .titulo(request.titulo())
            .tipo(request.tipo())
            .conteudo(request.conteudo())
            .ordem(request.ordem() != null ? request.ordem() : 0)
            .build();
        return ResponseEntity.status(201).body(ConteudoAulaResponse.from(conteudoRepository.save(conteudo)));
    }

    @PutMapping("/{aulaId}/conteudos/{conteudoId}")
    public ResponseEntity<ConteudoAulaResponse> atualizar(@PathVariable Long aulaId,
                                                            @PathVariable Long conteudoId,
                                                            @Valid @RequestBody ConteudoAulaRequest request) {
        ConteudoAula conteudo = conteudoRepository.findById(conteudoId)
            .orElseThrow(() -> new ResourceNotFoundException("Conteúdo", conteudoId));
        conteudo.setTitulo(request.titulo());
        conteudo.setTipo(request.tipo());
        conteudo.setConteudo(request.conteudo());
        if (request.ordem() != null) conteudo.setOrdem(request.ordem());
        return ResponseEntity.ok(ConteudoAulaResponse.from(conteudoRepository.save(conteudo)));
    }

    @DeleteMapping("/{aulaId}/conteudos/{conteudoId}")
    public ResponseEntity<Void> deletar(@PathVariable Long aulaId,
                                         @PathVariable Long conteudoId) {
        if (!conteudoRepository.existsById(conteudoId))
            throw new ResourceNotFoundException("Conteúdo", conteudoId);
        conteudoRepository.deleteById(conteudoId);
        return ResponseEntity.noContent().build();
    }
}
