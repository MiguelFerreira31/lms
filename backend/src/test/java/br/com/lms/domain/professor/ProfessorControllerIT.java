package br.com.lms.domain.professor;

import br.com.lms.IntegrationTestBase;
import br.com.lms.domain.curso.Curso;
import br.com.lms.domain.usuario.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Vínculo professor ↔ curso. Controller sem nenhum teste antes da migração.
 */
class ProfessorControllerIT extends IntegrationTestBase {

    @Test
    @DisplayName("ADMIN vincula professor a curso e o vínculo aparece em /meus-cursos")
    void vincular_eDepoisListarMeusCursos() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.prof@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario professor = criarUsuario("Prof", "prof.vinc@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Curso curso = criarCurso("Curso para vincular");

        mockMvc.perform(post("/api/professores/{id}/cursos", professor.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("cursoId", curso.getId()))))
                .andExpect(status().isCreated());

        // o próprio professor enxerga o curso
        mockMvc.perform(get("/api/professores/meus-cursos")
                        .header("Authorization", "Bearer " + tokenPara(professor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Curso para vincular"));
    }

    @Test
    @DisplayName("Vincular duas vezes é idempotente: devolve 200 em vez de estourar a PK composta")
    void vincular_duplicado_ehIdempotente() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.idem@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario professor = criarUsuario("Prof", "prof.idem@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Curso curso = criarCurso("Curso idempotente");
        String body = objectMapper.writeValueAsString(Map.of("cursoId", curso.getId()));

        mockMvc.perform(post("/api/professores/{id}/cursos", professor.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/professores/{id}/cursos", professor.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());

        assertThat(professorCursoRepository.findByProfessorId(professor.getId())).hasSize(1);
    }

    @Test
    @DisplayName("cursoId ausente vira 400, e não mais NullPointerException")
    void vincular_semCursoId_retorna400() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.npe@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario professor = criarUsuario("Prof", "prof.npe@lms.com", "senha12345", Usuario.Role.PROFESSOR);

        // Antes o corpo era Map<String,Long> e body.get("cursoId") devolvia null,
        // que estourava NPE lá dentro (500). Agora é um record com @NotNull.
        mockMvc.perform(post("/api/professores/{id}/cursos", professor.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/validacao"))
                .andExpect(jsonPath("$.errors.cursoId").exists());
    }

    @Test
    @DisplayName("Desvincular remove o vínculo; desvincular o que não existe é 404")
    void desvincular() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.desv@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario professor = criarUsuario("Prof", "prof.desv@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Curso curso = criarCurso("Curso a desvincular");
        String token = "Bearer " + tokenPara(admin);

        mockMvc.perform(post("/api/professores/{id}/cursos", professor.getId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("cursoId", curso.getId()))))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/professores/{p}/cursos/{c}", professor.getId(), curso.getId())
                        .header("Authorization", token))
                .andExpect(status().isNoContent());

        assertThat(professorCursoRepository.findByProfessorId(professor.getId())).isEmpty();

        mockMvc.perform(delete("/api/professores/{p}/cursos/{c}", professor.getId(), curso.getId())
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("ALUNO não pode vincular professor a curso")
    void vincular_comoAluno_retorna403() throws Exception {
        Usuario aluno = criarUsuario("Aluno", "aluno.prof@lms.com", "senha12345", Usuario.Role.ALUNO);
        Curso curso = criarCurso("Curso protegido");

        mockMvc.perform(post("/api/professores/{id}/cursos", aluno.getId())
                        .header("Authorization", "Bearer " + tokenPara(aluno))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("cursoId", curso.getId()))))
                .andExpect(status().isForbidden());
    }
}
