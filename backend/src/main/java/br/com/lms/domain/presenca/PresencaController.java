package br.com.lms.domain.presenca;

import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.matricula.Matricula;
import br.com.lms.domain.matricula.MatriculaRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
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

    private final PresencaAulaRepository presencaRepository;
    private final MatriculaRepository matriculaRepository;
    private final EntityManager em;

    @PostMapping
    public ResponseEntity<PresencaResponse> registrar(@Valid @RequestBody PresencaRequest request,
                                                        @AuthenticationPrincipal Usuario usuario) {
        Matricula matricula = matriculaRepository.findById(request.matriculaId())
            .orElseThrow(() -> new ResourceNotFoundException("Matrícula", request.matriculaId()));
        Aula aula = em.find(Aula.class, request.aulaId());
        if (aula == null) throw new ResourceNotFoundException("Aula", request.aulaId());

        PresencaAula presenca = presencaRepository
            .findByMatriculaIdAndAulaIdAndDataAula(request.matriculaId(), request.aulaId(), request.dataAula())
            .orElseGet(() -> PresencaAula.builder()
                .matricula(matricula)
                .aula(aula)
                .dataAula(request.dataAula())
                .registradoPor(usuario)
                .build());

        presenca.setPresente(request.presente());
        return ResponseEntity.ok(PresencaResponse.from(presencaRepository.save(presenca)));
    }

    @GetMapping("/matricula/{matriculaId}")
    public ResponseEntity<List<PresencaResponse>> porMatricula(@PathVariable Long matriculaId) {
        return ResponseEntity.ok(
            presencaRepository.findByMatriculaId(matriculaId)
                .stream().map(PresencaResponse::from).toList()
        );
    }

    @GetMapping("/matricula/{matriculaId}/resumo")
    public ResponseEntity<PresencaResumoResponse> resumo(@PathVariable Long matriculaId) {
        long presencas = presencaRepository.countPresencas(matriculaId);
        long total = presencaRepository.countTotal(matriculaId);
        double percentual = total > 0 ? (presencas * 100.0 / total) : 0;
        return ResponseEntity.ok(new PresencaResumoResponse(matriculaId, presencas, total, percentual));
    }
}
