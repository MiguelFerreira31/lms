package br.com.lms.domain.conteudo;

import br.com.lms.IntegrationTestBase;
import br.com.lms.domain.curso.Aula;
import br.com.lms.domain.usuario.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Conteúdo pedagógico da aula. Controller sem nenhum teste antes da migração.
 */
class ConteudoAulaControllerIT extends IntegrationTestBase {

    private String corpo(String titulo, String tipo, String conteudo, Integer ordem) throws Exception {
        var m = new java.util.LinkedHashMap<String, Object>();
        m.put("titulo", titulo);
        m.put("tipo", tipo);
        m.put("conteudo", conteudo);
        m.put("ordem", ordem);
        return objectMapper.writeValueAsString(m);
    }

    @Test
    @DisplayName("PROFESSOR cria conteúdo e ele aparece ordenado na listagem")
    void criarEListar_ordenadoPorOrdem() throws Exception {
        Usuario professor = criarUsuario("Prof", "prof.cont@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Aula aula = criarCursoComAula("Curso com conteúdo");
        String token = "Bearer " + tokenPara(professor);

        mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Segundo", "TEXTO", "conteudo b", 2)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Primeiro", "VIDEO", "https://exemplo/v", 1)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/aulas/{id}/conteudos", aula.getId()).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].titulo").value("Primeiro"))
                .andExpect(jsonPath("$[1].titulo").value("Segundo"));
    }

    @Test
    @DisplayName("ordem ausente vira 0 em vez de estourar")
    void criar_semOrdem_usaZero() throws Exception {
        Usuario professor = criarUsuario("Prof", "prof.ord@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Aula aula = criarCursoComAula("Curso ordem default");

        mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", "Bearer " + tokenPara(professor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Sem ordem", "LINK", "https://exemplo", null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ordem").value(0));
    }

    @Test
    @DisplayName("Atualizar e deletar conteúdo")
    void atualizarEDeletar() throws Exception {
        Usuario professor = criarUsuario("Prof", "prof.upd@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Aula aula = criarCursoComAula("Curso update");
        String token = "Bearer " + tokenPara(professor);

        String resposta = mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Original", "TEXTO", "antes", 1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(resposta).get("id").asLong();

        mockMvc.perform(put("/api/aulas/{a}/conteudos/{c}", aula.getId(), id)
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Editado", "TEXTO", "depois", 3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Editado"))
                .andExpect(jsonPath("$.conteudo").value("depois"))
                .andExpect(jsonPath("$.ordem").value(3));

        mockMvc.perform(delete("/api/aulas/{a}/conteudos/{c}", aula.getId(), id)
                        .header("Authorization", token))
                .andExpect(status().isNoContent());

        assertThat(conteudoAulaRepository.findById(id)).isEmpty();
    }

    @Test
    @DisplayName("Aula inexistente vira 404 e conteúdo inexistente também")
    void inexistentes_retornam404() throws Exception {
        Usuario professor = criarUsuario("Prof", "prof.404@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        String token = "Bearer " + tokenPara(professor);

        mockMvc.perform(post("/api/aulas/{id}/conteudos", 999999)
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("X", "TEXTO", "y", 1)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/aulas/{a}/conteudos/{c}", 1, 999999)
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Título em branco é rejeitado com o detalhe do campo")
    void criar_tituloEmBranco_retorna400() throws Exception {
        Usuario professor = criarUsuario("Prof", "prof.val@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        Aula aula = criarCursoComAula("Curso validacao");

        mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", "Bearer " + tokenPara(professor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("", "TEXTO", "x", 1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.titulo").exists());
    }

    @Test
    @DisplayName("ALUNO não pode criar conteúdo")
    void criar_comoAluno_retorna403() throws Exception {
        Usuario aluno = criarUsuario("Aluno", "aluno.cont@lms.com", "senha12345", Usuario.Role.ALUNO);
        Aula aula = criarCursoComAula("Curso aluno");

        mockMvc.perform(post("/api/aulas/{id}/conteudos", aula.getId())
                        .header("Authorization", "Bearer " + tokenPara(aluno))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("X", "TEXTO", "y", 1)))
                .andExpect(status().isForbidden());
    }
}
