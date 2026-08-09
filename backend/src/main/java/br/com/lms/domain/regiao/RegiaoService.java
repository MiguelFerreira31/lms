package br.com.lms.domain.regiao;

import br.com.lms.config.CacheConfig;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CRUD de regiões e das unidades aninhadas nelas.
 *
 * <p>As leituras de listagem são cacheadas (dados de referência: 4 regiões e 64
 * unidades do seed). Toda escrita — em região <em>ou</em> em unidade — limpa o
 * cache inteiro de regiões, porque {@code RegiaoResponse} carrega as unidades
 * aninhadas: mexer numa unidade muda a resposta da listagem de regiões.
 */
@Service
@RequiredArgsConstructor
public class RegiaoService {

    private final RegiaoRepository regiaoRepository;
    private final UnidadeRepository unidadeRepository;

    @Cacheable(CacheConfig.REGIOES)
    @Transactional(readOnly = true)
    public List<RegiaoResponse> listar() {
        return regiaoRepository.findAllWithUnidades().stream().map(RegiaoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RegiaoResponse detalhe(Long id) {
        return RegiaoResponse.from(buscarRegiao(id));
    }

    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public RegiaoResponse criar(RegiaoRequest request) {
        return RegiaoResponse.from(regiaoRepository.save(
                Regiao.builder().nome(request.nome()).build()));
    }

    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public RegiaoResponse atualizar(Long id, RegiaoRequest request) {
        Regiao regiao = buscarRegiao(id);
        regiao.setNome(request.nome());
        return RegiaoResponse.from(regiaoRepository.save(regiao));
    }

    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public void deletar(Long id) {
        if (!regiaoRepository.existsById(id))
            throw new ResourceNotFoundException("Região", id);
        regiaoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UnidadeResponse> listarUnidades(Long regiaoId) {
        return unidadeRepository.findByRegiaoId(regiaoId).stream().map(UnidadeResponse::from).toList();
    }

    @Cacheable(value = CacheConfig.REGIOES, key = "'todas-unidades'")
    @Transactional(readOnly = true)
    public List<UnidadeResponse> listarTodasUnidades() {
        return unidadeRepository.findAllWithRegiao().stream().map(UnidadeResponse::from).toList();
    }

    /**
     * O slug é derivado do nome. A coluna é NOT NULL UNIQUE desde a V13, mas
     * nada preenchia esse campo: criar unidade pela API sempre esbarrava na
     * constraint e voltava 409. As unidades do seed têm slug porque ele foi
     * calculado em SQL na própria migration.
     */
    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public UnidadeResponse criarUnidade(Long regiaoId, UnidadeRequest request) {
        Regiao regiao = buscarRegiao(regiaoId);
        return UnidadeResponse.from(unidadeRepository.save(Unidade.builder()
                .nome(request.nome())
                .slug(slugUnico(request.nome(), null))
                .endereco(request.endereco())
                .regiao(regiao)
                .build()));
    }

    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public UnidadeResponse atualizarUnidade(Long unidadeId, UnidadeRequest request) {
        Unidade unidade = unidadeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
        // Renomear reflete no slug — que é o identificador da rota pública
        // /api/unidades/{slug} — mas só se o nome de fato mudou, para não
        // invalidar links de unidades já publicadas sem necessidade.
        if (!unidade.getNome().equals(request.nome())) {
            unidade.setSlug(slugUnico(request.nome(), unidade.getId()));
        }
        unidade.setNome(request.nome());
        unidade.setEndereco(request.endereco());
        return UnidadeResponse.from(unidadeRepository.save(unidade));
    }

    private String slugUnico(String nome, Long idIgnorado) {
        return SlugGenerator.gerarUnico(nome, candidato ->
                unidadeRepository.findBySlug(candidato)
                        .filter(u -> idIgnorado == null || !u.getId().equals(idIgnorado))
                        .isPresent());
    }

    @Transactional
    @CacheEvict(value = CacheConfig.REGIOES, allEntries = true)
    public void deletarUnidade(Long unidadeId) {
        if (!unidadeRepository.existsById(unidadeId))
            throw new ResourceNotFoundException("Unidade", unidadeId);
        unidadeRepository.deleteById(unidadeId);
    }

    private Regiao buscarRegiao(Long id) {
        return regiaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Região", id));
    }
}
