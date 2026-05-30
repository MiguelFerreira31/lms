package br.com.lms.domain.area;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
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

    private final AreaRepository areaRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoRepository tipoRepository;
    private final CursoRepository cursoRepository;

    @GetMapping("/api/areas")
    public ResponseEntity<List<AreaResponse>> listarAreas() {
        return ResponseEntity.ok(
            areaRepository.findAllWithCategorias().stream().map(AreaResponse::from).toList()
        );
    }

    @GetMapping("/api/areas/{areaSlug}")
    public ResponseEntity<AreaResponse> detalheArea(@PathVariable String areaSlug) {
        Area area = areaRepository.findBySlug(areaSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Área", areaSlug));
        return ResponseEntity.ok(AreaResponse.from(area));
    }

    @GetMapping("/api/areas/{areaSlug}/{categoriaSlug}")
    public ResponseEntity<Page<CursoResumoResponse>> cursosPorCategoria(
            @PathVariable String areaSlug,
            @PathVariable String categoriaSlug,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        categoriaRepository.findByArea_SlugAndSlug(areaSlug, categoriaSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", categoriaSlug));
        Page<Curso> page = cursoRepository.findByCategoriaSlug(areaSlug, categoriaSlug, pageable);
        return ResponseEntity.ok(page.map(CursoResumoResponse::from));
    }

    @GetMapping("/api/tipos")
    public ResponseEntity<List<TipoResponse>> listarTipos() {
        return ResponseEntity.ok(
            tipoRepository.findAllByOrderByNomeAsc().stream().map(TipoResponse::from).toList()
        );
    }

    @GetMapping("/api/tipos/{tipoSlug}/cursos")
    public ResponseEntity<Page<CursoResumoResponse>> cursosPorTipo(
            @PathVariable String tipoSlug,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        tipoRepository.findBySlug(tipoSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo", tipoSlug));
        Page<Curso> page = cursoRepository.findByTipoSlug(tipoSlug, pageable);
        return ResponseEntity.ok(page.map(CursoResumoResponse::from));
    }
}
