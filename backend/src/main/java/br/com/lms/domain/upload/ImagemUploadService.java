package br.com.lms.domain.upload;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.domain.usuario.UsuarioRepository;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Orquestra "gravar imagem + apontar a entidade para ela".
 *
 * <p>{@link UploadService} cuida só do armazenamento; esta classe amarra o
 * arquivo à entidade dentro de uma transação.
 *
 * <p>A ordem importa: antes o fluxo apagava a imagem antiga <em>antes</em> de
 * gravar a nova, então uma falha na gravação deixava a entidade apontando para
 * um arquivo que já não existia. Agora a antiga só é removida depois que a nova
 * está gravada e persistida.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImagemUploadService {

    private final UploadService uploadService;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final UnidadeRepository unidadeRepository;

    @Transactional
    public String atualizarAvatar(Usuario usuario, MultipartFile file) throws IOException {
        String anterior = usuario.getAvatarUrl();
        String url = uploadService.salvar(file, "avatars");
        usuario.setAvatarUrl(url);
        usuarioRepository.save(usuario);
        uploadService.deletar(anterior);
        log.info("Avatar atualizado via /api/upload: usuario={}", usuario.getId());
        return url;
    }

    @Transactional
    public String atualizarImagemCurso(Long cursoId, MultipartFile file) throws IOException {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", cursoId));
        String anterior = curso.getImagemUrl();
        String url = uploadService.salvar(file, "cursos");
        curso.setImagemUrl(url);
        cursoRepository.save(curso);
        uploadService.deletar(anterior);
        log.info("Imagem de curso atualizada: curso={}", cursoId);
        return url;
    }

    @Transactional
    public String atualizarImagemUnidade(Long unidadeId, MultipartFile file) throws IOException {
        Unidade unidade = unidadeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
        String anterior = unidade.getImagemUrl();
        String url = uploadService.salvar(file, "unidades");
        unidade.setImagemUrl(url);
        unidadeRepository.save(unidade);
        uploadService.deletar(anterior);
        log.info("Imagem de unidade atualizada: unidade={}", unidadeId);
        return url;
    }
}
