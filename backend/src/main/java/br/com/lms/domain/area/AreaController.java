package br.com.lms.domain.area;

import br.com.lms.dto.DTOs.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @GetMapping("/api/areas")
    public ResponseEntity<List<AreaResponse>> listarAreas() {
        return ResponseEntity.ok(areaService.listarAreas());
    }

    @GetMapping("/api/areas/{areaSlug}")
    public ResponseEntity<AreaResponse> detalheArea(@PathVariable String areaSlug) {
        return ResponseEntity.ok(areaService.detalheArea(areaSlug));
    }

    @GetMapping("/api/areas/{areaSlug}/{categoriaSlug}")
    public ResponseEntity<Page<CursoResumoResponse>> cursosPorCategoria(
            @PathVariable String areaSlug,
            @PathVariable String categoriaSlug,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(areaService.cursosPorCategoria(areaSlug, categoriaSlug, pageable));
    }

    @GetMapping("/api/tipos")
    public ResponseEntity<List<TipoResponse>> listarTipos() {
        return ResponseEntity.ok(areaService.listarTipos());
    }

    @GetMapping("/api/tipos/{tipoSlug}/cursos")
    public ResponseEntity<Page<CursoResumoResponse>> cursosPorTipo(
            @PathVariable String tipoSlug,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(areaService.cursosPorTipo(tipoSlug, pageable));
    }
}
