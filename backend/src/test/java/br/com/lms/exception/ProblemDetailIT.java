package br.com.lms.exception;

import br.com.lms.IntegrationTestBase;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contrato de erro RFC 7807. Antes da migração a API respondia erro em quatro
 * formatos diferentes; estes testes travam o formato único.
 */
class ProblemDetailIT extends IntegrationTestBase {

    @Test
    void recursoInexistente_retornaProblemDetail() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.pd@lms.com", "senha12345", Usuario.Role.ADMIN);

        mockMvc.perform(get("/api/cursos/999999").header("Authorization", "Bearer " + tokenPara(admin)))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/recurso-nao-encontrado"))
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.instance").value("/api/cursos/999999"));
    }

    @Test
    void falhaDeValidacao_listaOsCamposNaExtensaoErrors() throws Exception {
        // senha com 3 caracteres viola o @Size(min = 8) novo; email invalido viola @Email
        String body = objectMapper.writeValueAsString(
                new RegisterRequest("Fulano", "nao-e-email", "abc"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/validacao"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.senha").exists());
    }

    @Test
    void semToken_entryPointRespondeNoMesmoFormato() throws Exception {
        // Este erro nasce dentro da cadeia de filtros do Security, antes do
        // @RestControllerAdvice — é o caso que antes devolvia um formato próprio.
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/nao-autenticado"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.instance").value("/api/usuarios"));
    }

    @Test
    void notaForaDaEscala_eRejeitadaComo400() throws Exception {
        Usuario prof = criarUsuario("Prof", "prof.pd@lms.com", "senha12345", Usuario.Role.PROFESSOR);
        String body = objectMapper.writeValueAsString(new NotaRequest(new java.math.BigDecimal("99.9")));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/matriculas/1/nota")
                        .header("Authorization", "Bearer " + tokenPara(prof))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nota").exists());
    }
}
