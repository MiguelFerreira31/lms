package br.com.lms.domain.usuario;

import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.domain.upload.UploadService;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Gestão de usuários (listagem, edição, avatar e troca de role).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private static final long TAMANHO_MAX_AVATAR = 2L * 1024 * 1024;

    private final UsuarioRepository usuarioRepository;
    private final UnidadeRepository unidadeRepository;
    private final UploadService uploadService;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList();
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = buscar(id);
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setRole(request.role());
        usuario.setUnidade(resolverUnidade(request.unidadeId()));
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /**
     * Grava o avatar via {@link UploadService}.
     *
     * <p>Antes, este fluxo escrevia direto em {@code user.dir/uploads/avatars/} — um
     * terceiro diretório, diferente do que o resource handler serve — e gravava o
     * arquivo <em>antes</em> de verificar se o usuário existia, deixando arquivo
     * órfão em caso de 404. Agora o usuário é resolvido primeiro e o arquivo vai
     * para o mesmo destino de todos os outros uploads.
     */
    @Transactional
    public UsuarioResponse atualizarFoto(Long id, MultipartFile file) throws IOException {
        Usuario usuario = buscar(id);
        if (file.isEmpty()) throw new IllegalArgumentException("Arquivo vazio");
        if (file.getSize() > TAMANHO_MAX_AVATAR)
            throw new IllegalArgumentException("Imagem deve ter no máximo 2MB");

        String anterior = usuario.getAvatarUrl();
        String url = uploadService.salvar(file, "avatars");
        usuario.setAvatarUrl(url);
        usuarioRepository.save(usuario);
        // Só remove a imagem antiga depois que a nova está gravada e persistida.
        uploadService.deletar(anterior);

        log.info("Avatar atualizado: usuario={}", id);
        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public UsuarioResponse atualizarRole(Long id, RoleUpdateRequest request) {
        Usuario usuario = buscar(id);
        usuario.setRole(request.role());
        usuarioRepository.save(usuario);
        log.info("Role alterada: usuario={} novaRole={}", id, request.role());
        return UsuarioResponse.from(usuario);
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }

    private Unidade resolverUnidade(Long unidadeId) {
        if (unidadeId == null) return null;
        return unidadeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
    }
}
