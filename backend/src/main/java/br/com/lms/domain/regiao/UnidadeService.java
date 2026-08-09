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
    private final AreaRepository areaRepository;
    private final TipoRepository tipoRepository;

    /**
     * Antes, este método chamava {@code findByAtivoTrueAndUnidade_Id(id, Pageable.unpaged())}
     * — carregando <em>todos</em> os cursos da unidade, com as coleções de cada um —
     * apenas para extrair áreas e tipos distintos em memória. Agora são duas
     * queries {@code SELECT DISTINCT} que trazem só o que o DTO precisa.
     */
    @Transactional(readOnly = true)
    public UnidadeDetalheResponse buscarPorSlug(String slug) {
        Unidade unidade = buscar(slug);
        List<Area> areas = areaRepository.findComCursoAtivoNaUnidade(unidade.getId());
        List<Tipo> tipos = tipoRepository.findComCursoAtivoNaUnidade(unidade.getId());
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
