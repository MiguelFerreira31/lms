package br.com.lms.domain.usuario;

import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UsuarioResponse> atualizarRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
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
