package br.com.lms.domain.regiao;

import br.com.lms.domain.area.Area;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Consulta pública de unidade por slug e do catálogo de cursos daquela unidade.
 */
@Service
@RequiredArgsConstructor
public class UnidadeService {

    private final UnidadeRepository unidadeRepository;
    private final CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public UnidadeDetalheResponse buscarPorSlug(String slug) {
        Unidade unidade = buscar(slug);

        // TODO(A4): esta varredura carrega todos os cursos da unidade em memória
        // só para extrair áreas e tipos distintos — vira duas queries SELECT DISTINCT.
        List<Curso> cursosDaUnidade = cursoRepository
                .findByAtivoTrueAndUnidade_Id(unidade.getId(), Pageable.unpaged()).getContent();

        List<Area> areas = cursosDaUnidade.stream()
                .flatMap(c -> c.getCategorias().stream())
                .map(Categoria -> Categoria.getArea())
                .distinct()
                .toList();

        List<Tipo> tipos = cursosDaUnidade.stream()
                .flatMap(c -> c.getTipos().stream())
                .distinct()
                .toList();

        return UnidadeDetalheResponse.from(unidade, areas, tipos);
    }

    @Transactional(readOnly = true)
    public Page<CursoResumoResponse> cursosDaUnidade(String slug, String tipoSlug, String areaSlug,
                                                     Pageable pageable) {
        Unidade unidade = buscar(slug);
        Page<Curso> page;
        if (tipoSlug != null) {
            page = cursoRepository.findByUnidadeAndTipo(unidade.getId(), tipoSlug, pageable);
        } else if (areaSlug != null) {
            page = cursoRepository.findByUnidadeAndArea(unidade.getId(), areaSlug, pageable);
        } else {
            page = cursoRepository.findByAtivoTrueAndUnidade_Id(unidade.getId(), pageable);
        }
        return page.map(CursoResumoResponse::from);
    }

    private Unidade buscar(String slug) {
        return unidadeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", slug));
    }
}
