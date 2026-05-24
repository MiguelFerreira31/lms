package br.com.lms.domain.curso;

import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoRepository cursoRepository;

    @GetMapping
    public ResponseEntity<Page<CursoResumoResponse>> listar(
            @RequestParam(required = false) Curso.Nivel nivel,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        Page<Curso> page = nivel != null
                ? cursoRepository.findByAtivoTrueAndNivel(nivel, pageable)
                : cursoRepository.findByAtivoTrue(pageable);
        return ResponseEntity.ok(page.map(CursoResumoResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoDetalheResponse> detalhe(@PathVariable Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
        return ResponseEntity.ok(CursoDetalheResponse.from(curso));
    }

    @PostMapping
    public ResponseEntity<CursoResumoResponse> criar(@Valid @RequestBody CursoRequest request) {
        Curso curso = Curso.builder()
                .titulo(request.titulo())
                .descricao(request.descricao())
                .nivel(request.nivel())
                .build();
        return ResponseEntity.status(201).body(CursoResumoResponse.from(cursoRepository.save(curso)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResumoResponse> atualizar(@PathVariable Long id,
                                                          @Valid @RequestBody CursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
        curso.setTitulo(request.titulo());
        curso.setDescricao(request.descricao());
        curso.setNivel(request.nivel());
        return ResponseEntity.ok(CursoResumoResponse.from(cursoRepository.save(curso)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
        curso.setAtivo(false);
        cursoRepository.save(curso);
        return ResponseEntity.noContent().build();
    }
}
