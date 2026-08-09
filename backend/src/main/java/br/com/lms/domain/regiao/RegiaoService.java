package br.com.lms.domain.regiao;

import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CRUD de regiões e das unidades aninhadas nelas.
 */
@Service
@RequiredArgsConstructor
public class RegiaoService {

    private final RegiaoRepository regiaoRepository;
    private final UnidadeRepository unidadeRepository;

    @Transactional(readOnly = true)
    public List<RegiaoResponse> listar() {
        return regiaoRepository.findAllWithUnidades().stream().map(RegiaoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RegiaoResponse detalhe(Long id) {
        return RegiaoResponse.from(buscarRegiao(id));
    }

    @Transactional
    public RegiaoResponse criar(RegiaoRequest request) {
        return RegiaoResponse.from(regiaoRepository.save(
                Regiao.builder().nome(request.nome()).build()));
    }

    @Transactional
    public RegiaoResponse atualizar(Long id, RegiaoRequest request) {
        Regiao regiao = buscarRegiao(id);
        regiao.setNome(request.nome());
        return RegiaoResponse.from(regiaoRepository.save(regiao));
    }

    @Transactional
    public void deletar(Long id) {
        if (!regiaoRepository.existsById(id))
            throw new ResourceNotFoundException("Região", id);
        regiaoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UnidadeResponse> listarUnidades(Long regiaoId) {
        return unidadeRepository.findByRegiaoId(regiaoId).stream().map(UnidadeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UnidadeResponse> listarTodasUnidades() {
        return unidadeRepository.findAllWithRegiao().stream().map(UnidadeResponse::from).toList();
    }

    @Transactional
    public UnidadeResponse criarUnidade(Long regiaoId, UnidadeRequest request) {
        Regiao regiao = buscarRegiao(regiaoId);
        return UnidadeResponse.from(unidadeRepository.save(Unidade.builder()
                .nome(request.nome())
                .endereco(request.endereco())
                .regiao(regiao)
                .build()));
    }

    @Transactional
    public UnidadeResponse atualizarUnidade(Long unidadeId, UnidadeRequest request) {
        Unidade unidade = unidadeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
        unidade.setNome(request.nome());
        unidade.setEndereco(request.endereco());
        return UnidadeResponse.from(unidadeRepository.save(unidade));
    }

    @Transactional
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
