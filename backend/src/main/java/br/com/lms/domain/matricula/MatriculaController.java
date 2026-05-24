package br.com.lms.domain.matricula;

import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaRepository matriculaRepository;
    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoRepository;

    @GetMapping("/minhas")
    public ResponseEntity<List<MatriculaResponse>> minhas(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(matriculaRepository.findByUsuarioId(usuario.getId())
                .stream().map(MatriculaResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<MatriculaResponse> matricular(@Valid @RequestBody MatriculaRequest request,
                                                         @AuthenticationPrincipal Usuario usuario) {
        if (matriculaRepository.existsByUsuarioIdAndCursoId(usuario.getId(), request.cursoId()))
            throw new IllegalStateException("Você já está matriculado neste curso");
        var curso = cursoRepository.findById(request.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso", request.cursoId()));
        Matricula matricula = Matricula.builder().usuario(usuario).curso(curso).build();
        return ResponseEntity.status(201).body(MatriculaResponse.from(matriculaRepository.save(matricula)));
    }

    @GetMapping("/{id}/progresso")
    public ResponseEntity<ProgressoResponse> progresso(@PathVariable Long id,
                                                        @AuthenticationPrincipal Usuario usuario) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", id));
        long concluidas = matriculaRepository.countAulasConcluidas(id);
        long total = matriculaRepository.countTotalAulasDoCurso(matricula.getCurso().getId());
        double percentual = total > 0 ? (concluidas * 100.0 / total) : 0;
        return ResponseEntity.ok(new ProgressoResponse(id, concluidas, total, percentual));
    }

    @PostMapping("/progresso")
    public ResponseEntity<Void> marcarAula(@Valid @RequestBody MarcarAulaRequest request,
                                            @AuthenticationPrincipal Usuario usuario) {
        Matricula matricula = matriculaRepository.findById(request.matriculaId())
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", request.matriculaId()));
        ProgressoAula progresso = progressoRepository
                .findByMatriculaIdAndAulaId(request.matriculaId(), request.aulaId())
                .orElseGet(() -> {
                    Aula aula = new Aula();
                    aula.setId(request.aulaId());
                    return ProgressoAula.builder().matricula(matricula).aula(aula).build();
                });
        progresso.setConcluida(true);
        progresso.setConcluidoEm(LocalDateTime.now());
        progressoRepository.save(progresso);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/nota")
    public ResponseEntity<NotaResponse> lancarNota(@PathVariable Long id,
                                                     @Valid @RequestBody NotaRequest request,
                                                     @AuthenticationPrincipal Usuario professor) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", id));
        BigDecimal nota = request.nota();
        matricula.setNota(nota);
        matricula.setAprovado(nota.compareTo(new BigDecimal("6.0")) >= 0);
        matricula.setNotaLancadaEm(LocalDateTime.now());
        matricula.setNotaLancadaPor(professor);
        matriculaRepository.save(matricula);
        return ResponseEntity.ok(new NotaResponse(
            matricula.getId(), matricula.getNota(),
            matricula.getAprovado(), matricula.getNotaLancadaEm()
        ));
    }
}
