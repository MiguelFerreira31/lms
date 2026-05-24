package br.com.lms.domain.usuario;

import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UnidadeRepository unidadeRepository;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
        @PathVariable Long id,
        @Valid @RequestBody UsuarioUpdateRequest request
    ) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));

        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setRole(request.role());

        if (request.unidadeId() != null) {
            Unidade unidade = unidadeRepository.findById(request.unidadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidade", request.unidadeId()));
            usuario.setUnidade(unidade);
        } else {
            usuario.setUnidade(null);
        }

        return ResponseEntity.ok(UsuarioResponse.from(usuarioRepository.save(usuario)));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UsuarioResponse> atualizarRole(
        @PathVariable Long id,
        @RequestBody java.util.Map<String, String> body
    ) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
        String novaRole = body.get("role");
        if (novaRole != null && (novaRole.equals("ADMIN") || novaRole.equals("ALUNO") || novaRole.equals("PROFESSOR"))) {
            usuario.setRole(Usuario.Role.valueOf(novaRole));
            usuarioRepository.save(usuario);
        }
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }
}
