package br.com.lms.domain.conteudo;

import br.com.lms.domain.curso.Aula;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Conteúdo pedagógico de uma aula (vídeo, PDF, texto ou link).
 */
@Service
@RequiredArgsConstructor
public class ConteudoAulaService {

    private final ConteudoAulaRepository conteudoRepository;
    private final EntityManager em;

    @Transactional(readOnly = true)
    public List<ConteudoAulaResponse> listar(Long aulaId) {
        return conteudoRepository.findByAulaIdOrderByOrdemAsc(aulaId)
                .stream().map(ConteudoAulaResponse::from).toList();
    }

    @Transactional
    public ConteudoAulaResponse criar(Long aulaId, ConteudoAulaRequest request) {
        Aula aula = em.find(Aula.class, aulaId);
        if (aula == null) throw new ResourceNotFoundException("Aula", aulaId);

        ConteudoAula conteudo = ConteudoAula.builder()
                .aula(aula)
                .titulo(request.titulo())
                .tipo(request.tipo())
                .conteudo(request.conteudo())
                .ordem(request.ordem() != null ? request.ordem() : 0)
                .build();
        return ConteudoAulaResponse.from(conteudoRepository.save(conteudo));
    }

    @Transactional
    public ConteudoAulaResponse atualizar(Long conteudoId, ConteudoAulaRequest request) {
        ConteudoAula conteudo = conteudoRepository.findById(conteudoId)
                .orElseThrow(() -> new ResourceNotFoundException("Conteúdo", conteudoId));
        conteudo.setTitulo(request.titulo());
        conteudo.setTipo(request.tipo());
        conteudo.setConteudo(request.conteudo());
        if (request.ordem() != null) conteudo.setOrdem(request.ordem());
        return ConteudoAulaResponse.from(conteudoRepository.save(conteudo));
    }

    @Transactional
    public void deletar(Long conteudoId) {
        if (!conteudoRepository.existsById(conteudoId))
            throw new ResourceNotFoundException("Conteúdo", conteudoId);
        conteudoRepository.deleteById(conteudoId);
    }
}
