package br.com.lms.domain.usuario;

import br.com.lms.IntegrationTestBase;
import br.com.lms.dto.DTOs.AuthRequest;
import br.com.lms.dto.DTOs.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIT extends IntegrationTestBase {

    @Test
    void login_comCredenciaisValidas_retornaToken() throws Exception {
        criarUsuario("Aluno Teste", "aluno@teste.com", "senha123", Usuario.Role.ALUNO);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("aluno@teste.com", "senha123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not("")))
                .andExpect(jsonPath("$.role").value("ALUNO"))
                .andExpect(jsonPath("$.email").value("aluno@teste.com"));
    }

    @Test
    void login_comCredenciaisInvalidas_retorna401() throws Exception {
        criarUsuario("Aluno Teste", "aluno2@teste.com", "senha123", Usuario.Role.ALUNO);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("aluno2@teste.com", "senhaErrada"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_novoUsuario_criaComRoleAluno() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Novo Aluno", "novo@teste.com", "senha123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ALUNO"))
                .andExpect(jsonPath("$.email").value("novo@teste.com"));

        assertTrue(usuarioRepository.existsByEmail("novo@teste.com"));
    }

    @Test
    void acessarRotaProtegida_semToken_retorna401() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isUnauthorized());
    }
}
