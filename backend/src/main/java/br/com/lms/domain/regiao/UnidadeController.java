package br.com.lms.domain.regiao;

import br.com.lms.domain.area.Area;
import br.com.lms.domain.area.AreaRepository;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.area.TipoRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/unidades")
@RequiredArgsConstructor
public class UnidadeController {

    private final UnidadeRepository unidadeRepository;
    private final CursoRepository cursoRepository;
    private final AreaRepository areaRepository;
    private final TipoRepository tipoRepository;

    @GetMapping("/{slug}")
    public ResponseEntity<UnidadeDetalheResponse> buscarPorSlug(@PathVariable String slug) {
        Unidade unidade = unidadeRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Unidade", slug));

        // Áreas e tipos com cursos nessa unidade
        List<Curso> cursosDaUnidade = cursoRepository
            .findByAtivoTrueAndUnidade_Id(unidade.getId(), Pageable.unpaged()).getContent();

        List<Area> areas = cursosDaUnidade.stream()
            .flatMap(c -> c.getCategorias().stream())
            .map(cat -> cat.getArea())
            .distinct()
            .collect(Collectors.toList());

        List<Tipo> tipos = cursosDaUnidade.stream()
            .flatMap(c -> c.getTipos().stream())
            .distinct()
            .collect(Collectors.toList());

        return ResponseEntity.ok(UnidadeDetalheResponse.from(unidade, areas, tipos));
    }

    @GetMapping("/{slug}/cursos")
    public ResponseEntity<Page<CursoResumoResponse>> cursosDaUnidade(
            @PathVariable String slug,
            @RequestParam(required = false) String tipoSlug,
            @RequestParam(required = false) String areaSlug,
            @PageableDefault(size = 100) Pageable pageable) {

        Unidade unidade = unidadeRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Unidade", slug));

        Page<Curso> page;
        if (tipoSlug != null) {
            page = cursoRepository.findByUnidadeAndTipo(unidade.getId(), tipoSlug, pageable);
        } else if (areaSlug != null) {
            page = cursoRepository.findByUnidadeAndArea(unidade.getId(), areaSlug, pageable);
        } else {
            page = cursoRepository.findByAtivoTrueAndUnidade_Id(unidade.getId(), pageable);
        }

        return ResponseEntity.ok(page.map(CursoResumoResponse::from));
    }
}
