package br.com.lms.domain.area;

import br.com.lms.config.CacheConfig;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Catálogo por Área → Categoria e por Tipo. Só leitura.
 */
@Service
@RequiredArgsConstructor
public class AreaService {

    private final AreaRepository areaRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoRepository tipoRepository;
    private final CursoRepository cursoRepository;

    @Cacheable(CacheConfig.AREAS)
    @Transactional(readOnly = true)
    public List<AreaResponse> listarAreas() {
        return areaRepository.findAllWithCategorias().stream().map(AreaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AreaResponse detalheArea(String areaSlug) {
        return AreaResponse.from(areaRepository.findBySlug(areaSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Área", areaSlug)));
    }

    @Transactional(readOnly = true)
    public Page<CursoResumoResponse> cursosPorCategoria(String areaSlug, String categoriaSlug, Pageable pageable) {
        categoriaRepository.findByArea_SlugAndSlug(areaSlug, categoriaSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", categoriaSlug));
        return cursoRepository.findByCategoriaSlug(areaSlug, categoriaSlug, pageable)
                .map(CursoResumoResponse::from);
    }

    @Cacheable(CacheConfig.TIPOS)
    @Transactional(readOnly = true)
    public List<TipoResponse> listarTipos() {
        return tipoRepository.findAllByOrderByNomeAsc().stream().map(TipoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<CursoResumoResponse> cursosPorTipo(String tipoSlug, Pageable pageable) {
        tipoRepository.findBySlug(tipoSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo", tipoSlug));
        return cursoRepository.findByTipoSlug(tipoSlug, pageable).map(CursoResumoResponse::from);
    }
}
