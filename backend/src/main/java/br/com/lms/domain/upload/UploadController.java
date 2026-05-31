package br.com.lms.domain.upload;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.domain.regiao.Unidade;
import br.com.lms.domain.regiao.UnidadeRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.domain.usuario.UsuarioRepository;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final UnidadeRepository unidadeRepository;

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Usuario usuario) {
        try {
            uploadService.deletar(usuario.getAvatarUrl());
            String url = uploadService.salvar(file, "avatars");
            usuario.setAvatarUrl(url);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("avatarUrl", url));
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/curso/{cursoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadCurso(
            @PathVariable Long cursoId,
            @RequestParam("file") MultipartFile file) {
        Curso curso = cursoRepository.findById(cursoId)
            .orElseThrow(() -> new ResourceNotFoundException("Curso", cursoId));
        try {
            uploadService.deletar(curso.getImagemUrl());
            String url = uploadService.salvar(file, "cursos");
            curso.setImagemUrl(url);
            cursoRepository.save(curso);
            return ResponseEntity.ok(Map.of("imagemUrl", url));
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unidade/{unidadeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadUnidade(
            @PathVariable Long unidadeId,
            @RequestParam("file") MultipartFile file) {
        Unidade unidade = unidadeRepository.findById(unidadeId)
            .orElseThrow(() -> new ResourceNotFoundException("Unidade", unidadeId));
        try {
            uploadService.deletar(unidade.getImagemUrl());
            String url = uploadService.salvar(file, "unidades");
            unidade.setImagemUrl(url);
            unidadeRepository.save(unidade);
            return ResponseEntity.ok(Map.of("imagemUrl", url));
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
