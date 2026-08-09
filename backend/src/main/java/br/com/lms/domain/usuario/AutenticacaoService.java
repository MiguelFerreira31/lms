package br.com.lms.domain.usuario;

import br.com.lms.dto.DTOs.*;
import br.com.lms.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Login e auto-registro.
 *
 * <p>Nome propositalmente em português: {@code AuthService} colidiria
 * conceitualmente com as abstrações de autenticação do próprio Spring Security.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AutenticacaoService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        String token = tokenProvider.generate(auth);
        Usuario user = (Usuario) auth.getPrincipal();
        log.info("Login efetuado: email={} role={}", user.getEmail(), user.getRole());
        return new AuthResponse(token, "Bearer", user.getNome(), user.getEmail(),
                user.getRole().name(), user.getAvatarUrl());
    }

    /** Auto-registro sempre cria com role ALUNO; promoção é ação de ADMIN. */
    @Transactional
    public UsuarioResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email()))
            throw new IllegalStateException("Email já cadastrado");
        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(passwordEncoder.encode(request.senha()))
                .role(Usuario.Role.ALUNO)
                .build();
        log.info("Novo usuário registrado: email={}", request.email());
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }
}
