package br.com.lms.domain.professor;

import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.curso.CursoRepository;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.domain.usuario.UsuarioRepository;
import br.com.lms.dto.DTOs.*;
import br.com.lms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Vínculo professor ↔ curso.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessorService {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final ProfessorCursoRepository professorCursoRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarProfessores() {
        return usuarioRepository.findByRole(Usuario.Role.PROFESSOR)
                .stream().map(UsuarioResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CursoResumoResponse> cursosDoProfessor(Long professorId) {
        return professorCursoRepository.findByProfessorId(professorId)
                .stream().map(pc -> CursoResumoResponse.from(pc.getCurso())).toList();
    }

    /** @return true se criou o vínculo, false se ele já existia (idempotente). */
    @Transactional
    public boolean vincular(Long professorId, Long cursoId) {
        if (professorCursoRepository.existsByProfessorIdAndCursoId(professorId, cursoId))
            return false;

        Usuario professor = usuarioRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professor", professorId));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", cursoId));

        professorCursoRepository.save(ProfessorCurso.builder()
                .id(new ProfessorCursoId(professorId, cursoId))
                .professor(professor)
                .curso(curso)
                .build());
        log.info("Vínculo criado: professor={} curso={}", professorId, cursoId);
        return true;
    }

    @Transactional
    public void desvincular(Long professorId, Long cursoId) {
        ProfessorCursoId pk = new ProfessorCursoId(professorId, cursoId);
        if (!professorCursoRepository.existsById(pk))
            throw new ResourceNotFoundException("Vínculo professor-curso", professorId);
        professorCursoRepository.deleteById(pk);
        log.info("Vínculo removido: professor={} curso={}", professorId, cursoId);
    }
}
