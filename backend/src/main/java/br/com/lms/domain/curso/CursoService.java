package br.com.lms.domain.curso;

import br.com.lms.domain.area.Area;
import br.com.lms.domain.area.AreaRepository;
import br.com.lms.domain.area.Categoria;
import br.com.lms.domain.area.CategoriaRepository;
import br.com.lms.domain.area.Tipo;
import br.com.lms.domain.area.TipoRepository;
import br.com.lms.domain.matricula.ProgressoAulaRepository;
import br.com.lms.domain.presenca.PresencaAulaRepository;
import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

/**
 * Regras de negócio de curso.
 *
 * <p>Antes desta classe, {@code CursoController.criar/atualizar} gravava o curso,
 * depois sincronizava categorias e depois tipos — cada passo numa transação
 * própria. Uma falha no meio deixava o curso salvo com metade dos vínculos.
 * Aqui a sequência inteira é atômica.
 *
 * <p>O mapeamento para DTO acontece dentro da transação, de propósito: é o que
 * permite desligar o {@code open-in-view} sem estourar LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UnidadeRepository unidadeRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoRepository tipoRepository;
    private final AreaRepository areaRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final PresencaAulaRepository presencaAulaRepository;

    @Transactional(readOnly = true)
    public Page<CursoResumoResponse> listar(Curso.Nivel nivel, Long unidadeId, String areaSlug,
                                            String categoriaSlug, String tipoSlug, Pageable pageable) {
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
        return page.map(CursoResumoResponse::from);
    }

    @Transactional(readOnly = true)
    public CursoDetalheResponse detalhe(Long id) {
        return CursoDetalheResponse.from(cursoRepository.findDetalheById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id)));
    }

    @Transactional
    public CursoResumoResponse criar(CursoRequest request) {
        Curso curso = Curso.builder()
                .titulo(request.titulo())
                .descricao(request.descricao())
                .nivel(request.nivel())
                .unidade(resolverUnidade(request.unidadeId()))
                .area(resolverArea(request.areaId()))
                .build();
        aplicarModulos(curso, request.modulos());

        curso = cursoRepository.save(curso);
        sincronizarCategorias(curso, request.categoriaIds());
        sincronizarTipos(curso, request.tipoIds());
        recarregarAssociacoes(curso);

        log.info("Curso criado: id={} titulo='{}'", curso.getId(), curso.getTitulo());
        return CursoResumoResponse.from(curso);
    }

    @Transactional
    public CursoResumoResponse atualizar(Long id, CursoRequest request) {
        Curso curso = buscar(id);
        curso.setTitulo(request.titulo());
        curso.setDescricao(request.descricao());
        curso.setNivel(request.nivel());
        curso.setUnidade(resolverUnidade(request.unidadeId()));
        curso.setArea(resolverArea(request.areaId()));

        mergeModulos(curso, request.modulos());

        curso = cursoRepository.save(curso);
        sincronizarCategorias(curso, request.categoriaIds());
        sincronizarTipos(curso, request.tipoIds());
        recarregarAssociacoes(curso);

        log.info("Curso atualizado: id={}", curso.getId());
        return CursoResumoResponse.from(curso);
    }

    @Transactional
    public void desativar(Long id) {
        Curso curso = buscar(id);
        curso.setAtivo(false);
        cursoRepository.save(curso);
        log.info("Curso desativado (soft delete): id={}", id);
    }

    private Curso buscar(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
    }

    private void aplicarModulos(Curso curso, List<ModuloRequest> modulos) {
        if (modulos == null) return;
        for (ModuloRequest modReq : modulos) {
            curso.getModulos().add(Modulo.builder()
                    .titulo(modReq.titulo())
                    .ordem(modReq.ordem())
                    .curso(curso)
                    .build());
        }
    }

    /**
     * Merge incremental: módulo com {@code id} existente é atualizado no lugar
     * (preservando suas aulas e o progresso/presença de alunos já registrados
     * nelas); sem {@code id} é criado; o que sai do payload é removido, a menos
     * que alguma de suas aulas já tenha progresso ou presença registrados — nesse
     * caso a edição é rejeitada em vez de apagar histórico do aluno.
     */
    private void mergeModulos(Curso curso, List<ModuloRequest> requestsRecebidos) {
        List<ModuloRequest> requests = requestsRecebidos != null ? requestsRecebidos : List.of();
        // Snapshot dos módulos já persistidos, tirado antes de qualquer adição: um
        // Modulo novo (sem id ainda) é "igual" a outro módulo novo pelo equals()
        // gerado sobre o id (ambos null), então remoção/contains não pode rodar
        // depois de módulos transitórios entrarem na coleção.
        List<Modulo> existentes = List.copyOf(curso.getModulos());

        List<Long> idsMantidos = requests.stream()
                .map(ModuloRequest::id)
                .filter(Objects::nonNull)
                .toList();
        List<Modulo> removidos = existentes.stream()
                .filter(m -> !idsMantidos.contains(m.getId()))
                .toList();
        for (Modulo modulo : removidos) {
            List<Long> aulaIds = modulo.getAulas().stream().map(Aula::getId).toList();
            if (!aulaIds.isEmpty() && (progressoAulaRepository.existsByAula_IdIn(aulaIds)
                    || presencaAulaRepository.existsByAula_IdIn(aulaIds))) {
                throw new IllegalStateException(
                        "O módulo '" + modulo.getTitulo() + "' não pode ser removido: "
                        + "há progresso ou presença de aluno registrados em suas aulas");
            }
        }
        curso.getModulos().removeAll(removidos);

        for (ModuloRequest modReq : requests) {
            if (modReq.id() == null) {
                curso.getModulos().add(Modulo.builder()
                        .titulo(modReq.titulo())
                        .ordem(modReq.ordem())
                        .curso(curso)
                        .build());
                continue;
            }
            Modulo existente = existentes.stream()
                    .filter(m -> modReq.id().equals(m.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Módulo", modReq.id()));
            existente.setTitulo(modReq.titulo());
            existente.setOrdem(modReq.ordem());
        }
    }

    private void recarregarAssociacoes(Curso curso) {
        curso.setCategorias(new LinkedHashSet<>(categoriaRepository.findByCursos_Id(curso.getId())));
        curso.setTipos(new LinkedHashSet<>(tipoRepository.findByCursos_Id(curso.getId())));
    }

    private Unidade resolverUnidade(Long unidadeId) {
        if (unidadeId == null) return null;
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
            if (atuais.stream().noneMatch(c -> c.getId().equals(id))) {
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
            if (atuais.stream().noneMatch(t -> t.getId().equals(id))) {
                Tipo tipo = tipoRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tipo", id));
                tipo.getCursos().add(curso);
                tipoRepository.save(tipo);
            }
        }
    }
}
