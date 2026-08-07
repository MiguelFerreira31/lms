package br.com.lms.domain.curso;

import br.com.lms.domain.area.Area;
import br.com.lms.domain.area.AreaRepository;
import br.com.lms.domain.area.Categoria;
import br.com.lms.domain.area.CategoriaRepository;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.area.TipoRepository;
import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoRepository cursoRepository;
    private final UnidadeRepository unidadeRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoRepository tipoRepository;
    private final AreaRepository areaRepository;

    @GetMapping
    public ResponseEntity<Page<CursoResumoResponse>> listar(
            @RequestParam(required = false) Curso.Nivel nivel,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) String areaSlug,
            @RequestParam(required = false) String categoriaSlug,
            @RequestParam(required = false) String tipoSlug,
            @PageableDefault(size = 10, sort = "criadoEm") Pageable pageable) {
        Page<Curso> page;
        if (tipoSlug != null) {
            page = cursoRepository.findByTipoSlug(tipoSlug, pageable);
        } else if (categoriaSlug != null && areaSlug != null) {
            page = cursoRepository.findByCategoriaSlug(areaSlug, categoriaSlug, pageable);
        } else if (areaSlug != null) {
            page = cursoRepository.findByAreaSlug(areaSlug, pageable);
        } else if (nivel != null && unidadeId != null) {
            page = cursoRepository.findByAtivoTrueAndNivelAndUnidade_Id(nivel, unidadeId, pageable);
        } else if (nivel != null) {
            page = cursoRepository.findByAtivoTrueAndNivel(nivel, pageable);
        } else if (unidadeId != null) {
            page = cursoRepository.findByAtivoTrueAndUnidade_Id(unidadeId, pageable);
        } else {
            page = cursoRepository.findByAtivoTrue(pageable);
        }
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
        Unidade unidade = resolverUnidade(request.unidadeId());
        Area area = resolverArea(request.areaId());
        Curso curso = Curso.builder()
                .titulo(request.titulo())
                .descricao(request.descricao())
                .nivel(request.nivel())
                .unidade(unidade)
                .area(area)
                .build();

        if (request.modulos() != null) {
            for (ModuloRequest modReq : request.modulos()) {
                Modulo modulo = Modulo.builder()
                        .titulo(modReq.titulo())
                        .ordem(modReq.ordem())
                        .curso(curso)
                        .build();
                curso.getModulos().add(modulo);
            }
        }
        curso = cursoRepository.save(curso);
        sincronizarCategorias(curso, request.categoriaIds());
        sincronizarTipos(curso, request.tipoIds());
        curso.setCategorias(categoriaRepository.findByCursos_Id(curso.getId()));
        curso.setTipos(tipoRepository.findByCursos_Id(curso.getId()));
        return ResponseEntity.status(201).body(CursoResumoResponse.from(curso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResumoResponse> atualizar(@PathVariable Long id,
            @Valid @RequestBody CursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
        curso.setTitulo(request.titulo());
        curso.setDescricao(request.descricao());
        curso.setNivel(request.nivel());
        curso.setUnidade(resolverUnidade(request.unidadeId()));
        curso.setArea(resolverArea(request.areaId()));
        curso.getModulos().clear();

        if (request.modulos() != null) {
            for (ModuloRequest modReq : request.modulos()) {
                Modulo modulo = Modulo.builder()
                        .id(modReq.id())
                        .titulo(modReq.titulo())
                        .ordem(modReq.ordem())
                        .curso(curso)
                        .build();
                curso.getModulos().add(modulo);
            }
        }

        curso = cursoRepository.save(curso);
        sincronizarCategorias(curso, request.categoriaIds());
        sincronizarTipos(curso, request.tipoIds());
        curso.setCategorias(categoriaRepository.findByCursos_Id(curso.getId()));
        curso.setTipos(tipoRepository.findByCursos_Id(curso.getId()));
        return ResponseEntity.ok(CursoResumoResponse.from(curso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
        curso.setAtivo(false);
        cursoRepository.save(curso);
        return ResponseEntity.noContent().build();
    }

    private Unidade resolverUnidade(Long unidadeId) {
        if (unidadeId == null)
            return null;
        return unidadeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
    }

    private Area resolverArea(Long areaId) {
        return areaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Área", areaId));
    }

    private void sincronizarCategorias(Curso curso, List<Long> categoriaIds) {
        List<Long> ids = categoriaIds != null ? categoriaIds : List.of();
        List<Categoria> atuais = categoriaRepository.findByCursos_Id(curso.getId());
        for (Categoria categoria : atuais) {
            if (!ids.contains(categoria.getId())) {
                categoria.getCursos().removeIf(c -> c.getId().equals(curso.getId()));
                categoriaRepository.save(categoria);
            }
        }
        for (Long id : ids) {
            boolean jaAssociada = atuais.stream().anyMatch(c -> c.getId().equals(id));
            if (!jaAssociada) {
                Categoria categoria = categoriaRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
                categoria.getCursos().add(curso);
                categoriaRepository.save(categoria);
            }
        }
    }

    private void sincronizarTipos(Curso curso, List<Long> tipoIds) {
        List<Long> ids = tipoIds != null ? tipoIds : List.of();
        List<Tipo> atuais = tipoRepository.findByCursos_Id(curso.getId());
        for (Tipo tipo : atuais) {
            if (!ids.contains(tipo.getId())) {
                tipo.getCursos().removeIf(c -> c.getId().equals(curso.getId()));
                tipoRepository.save(tipo);
            }
        }
        for (Long id : ids) {
            boolean jaAssociado = atuais.stream().anyMatch(t -> t.getId().equals(id));
            if (!jaAssociado) {
                Tipo tipo = tipoRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tipo", id));
                tipo.getCursos().add(curso);
                tipoRepository.save(tipo);
            }
        }
    }
}
