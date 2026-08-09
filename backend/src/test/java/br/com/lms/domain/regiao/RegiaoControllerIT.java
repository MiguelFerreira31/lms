package br.com.lms.domain.regiao;

import br.com.lms.IntegrationTestBase;
import br.com.lms.domain.usuario.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * CRUD de regiões e das unidades aninhadas. Controller sem nenhum teste antes
 * da migração — e é o que tem cache com invalidação explícita.
 */
class RegiaoControllerIT extends IntegrationTestBase {

    private String json(Map<String, Object> m) throws Exception {
        return objectMapper.writeValueAsString(m);
    }

    private Map<String, Object> mapa(Object... kv) {
        var m = new LinkedHashMap<String, Object>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @Test
    @DisplayName("ADMIN cria região, edita e a listagem reflete a mudança (cache invalidado)")
    void cicloDeVidaRegiao_invalidaOCache() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.reg@lms.com", "senha12345", Usuario.Role.ADMIN);
        String token = "Bearer " + tokenPara(admin);

        // aquece o cache de regiões
        mockMvc.perform(get("/api/regioes")).andExpect(status().isOk());

        String criada = mockMvc.perform(post("/api/regioes").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "Região de Teste"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Região de Teste"))
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(criada).get("id").asLong();

        // se o @CacheEvict não tivesse funcionado, a listagem devolveria as 4 antigas
        mockMvc.perform(get("/api/regioes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));

        mockMvc.perform(put("/api/regioes/{id}", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "Região Renomeada"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Região Renomeada"));

        mockMvc.perform(delete("/api/regioes/{id}", id).header("Authorization", token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/regioes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));
    }

    @Test
    @DisplayName("Unidade criada dentro da região aparece na contagem e some ao ser removida")
    void cicloDeVidaUnidade() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.uni@lms.com", "senha12345", Usuario.Role.ADMIN);
        String token = "Bearer " + tokenPara(admin);

        long regiaoId = regiaoRepository.findAll().get(0).getId();
        long antes = unidadeRepository.findByRegiaoId(regiaoId).size();

        String criada = mockMvc.perform(post("/api/regioes/{r}/unidades", regiaoId)
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "Unidade Teste", "endereco", "Rua X, 1", "regiaoId", regiaoId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Unidade Teste"))
                // slug derivado do nome: a coluna e NOT NULL UNIQUE e nada
                // preenchia esse campo, entao criar unidade sempre dava 409
                .andExpect(jsonPath("$.slug").value("unidade-teste"))
                .andReturn().getResponse().getContentAsString();
        long unidadeId = objectMapper.readTree(criada).get("id").asLong();

        mockMvc.perform(get("/api/regioes/{r}/unidades", regiaoId).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value((int) antes + 1));

        mockMvc.perform(put("/api/regioes/{r}/unidades/{u}", regiaoId, unidadeId)
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "Unidade Editada", "endereco", "Rua Y, 2", "regiaoId", regiaoId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Unidade Editada"))
                .andExpect(jsonPath("$.slug").value("unidade-editada"));

        mockMvc.perform(delete("/api/regioes/{r}/unidades/{u}", regiaoId, unidadeId)
                        .header("Authorization", token))
                .andExpect(status().isNoContent());

        assertThat(unidadeRepository.findById(unidadeId)).isEmpty();
    }

    @Test
    @DisplayName("Região inexistente é 404 e nome em branco é 400")
    void errosDeRegiao() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.err@lms.com", "senha12345", Usuario.Role.ADMIN);
        String token = "Bearer " + tokenPara(admin);

        mockMvc.perform(get("/api/regioes/{id}", 999999).header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/recurso-nao-encontrado"));

        mockMvc.perform(post("/api/regioes").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(json(mapa("nome", "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nome").exists());
    }

    @Test
    @DisplayName("ALUNO não pode criar região")
    void criar_comoAluno_retorna403() throws Exception {
        Usuario aluno = criarUsuario("Aluno", "aluno.reg@lms.com", "senha12345", Usuario.Role.ALUNO);

        mockMvc.perform(post("/api/regioes").header("Authorization", "Bearer " + tokenPara(aluno))
                        .contentType(MediaType.APPLICATION_JSON).content(json(mapa("nome", "Nao Deve"))))
                .andExpect(status().isForbidden());
    }
}
