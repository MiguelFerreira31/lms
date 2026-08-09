package br.com.lms.domain.regiao;

import br.com.lms.dto.DTOs.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/unidades")
@RequiredArgsConstructor
public class UnidadeController {

    private final UnidadeService unidadeService;

    @GetMapping("/{slug}")
    public ResponseEntity<UnidadeDetalheResponse> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(unidadeService.buscarPorSlug(slug));
    }

    @GetMapping("/{slug}/cursos")
    public ResponseEntity<Page<CursoResumoResponse>> cursosDaUnidade(
            @PathVariable String slug,
            @RequestParam(required = false) String tipoSlug,
            @RequestParam(required = false) String areaSlug,
            @PageableDefault(size = 100) Pageable pageable) {
        return ResponseEntity.ok(unidadeService.cursosDaUnidade(slug, tipoSlug, areaSlug, pageable));
    }
}
