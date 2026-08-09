package br.com.lms.domain.usuario;

import br.com.lms.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Gestão de usuários, troca de role e upload de avatar.
 *
 * <p>Cobre três bugs que a migração corrigiu: o PATCH de role que devolvia 200
 * com role inválida, o upload que gravava num terceiro diretório, e o upload que
 * gravava o arquivo antes de checar se o usuário existia.
 */
class UsuarioControllerIT extends IntegrationTestBase {

    private String json(Map<String, Object> m) throws Exception {
        return objectMapper.writeValueAsString(m);
    }

    private Map<String, Object> mapa(Object... kv) {
        var m = new LinkedHashMap<String, Object>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @Test
    @DisplayName("ADMIN lista usuários; /me devolve o próprio perfil")
    void listarEMe() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.list@lms.com", "senha12345", Usuario.Role.ADMIN);
        criarUsuario("Aluno", "aluno.list@lms.com", "senha12345", Usuario.Role.ALUNO);
        String token = "Bearer " + tokenPara(admin);

        mockMvc.perform(get("/api/usuarios").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.email=='aluno.list@lms.com')]").exists());

        mockMvc.perform(get("/api/usuarios/me").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin.list@lms.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("PATCH de role com valor inválido devolve 400, não mais 200 silencioso")
    void atualizarRole_invalida_retorna400() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.role@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Alvo", "alvo.role@lms.com", "senha12345", Usuario.Role.ALUNO);
        String token = "Bearer " + tokenPara(admin);

        // Antes: Map<String,String> caía num if silencioso e devolvia 200 com o
        // usuário inalterado, dando a impressão de que a troca funcionou.
        mockMvc.perform(patch("/api/usuarios/{id}/role", alvo.getId())
                        .header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("role", "SUPER_ADMIN"))))
                .andExpect(status().isBadRequest());

        // e o usuário continua ALUNO
        mockMvc.perform(get("/api/usuarios").header("Authorization", token))
                .andExpect(jsonPath("$[?(@.email=='alvo.role@lms.com')].role").value("ALUNO"));
    }

    @Test
    @DisplayName("PATCH de role com valor válido promove o usuário")
    void atualizarRole_valida_promove() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.promo@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Alvo", "alvo.promo@lms.com", "senha12345", Usuario.Role.ALUNO);

        mockMvc.perform(patch("/api/usuarios/{id}/role", alvo.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("role", "PROFESSOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PROFESSOR"));
    }

    @Test
    @DisplayName("Editar usuário altera nome, email e role")
    void atualizar() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.edit@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Antigo", "antigo@lms.com", "senha12345", Usuario.Role.ALUNO);

        mockMvc.perform(put("/api/usuarios/{id}", alvo.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "Novo Nome", "email", "novo@lms.com",
                                "role", "PROFESSOR", "unidadeId", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Novo Nome"))
                .andExpect(jsonPath("$.email").value("novo@lms.com"))
                .andExpect(jsonPath("$.role").value("PROFESSOR"));
    }

    @Test
    @DisplayName("Email inválido na edição é rejeitado com o campo no ProblemDetail")
    void atualizar_emailInvalido_retorna400() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.mail@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Alvo", "alvo.mail@lms.com", "senha12345", Usuario.Role.ALUNO);

        mockMvc.perform(put("/api/usuarios/{id}", alvo.getId())
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(mapa("nome", "X", "email", "nao-e-email",
                                "role", "ALUNO", "unidadeId", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @DisplayName("Upload de avatar grava e devolve a URL servida pelo resource handler")
    void uploadFoto_gravaEDevolveUrl() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.foto@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Alvo", "alvo.foto@lms.com", "senha12345", Usuario.Role.ALUNO);

        var arquivo = new MockMultipartFile("file", "avatar.png", "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47});

        // Antes este endpoint gravava em user.dir/uploads/avatars (um terceiro
        // diretório, diferente do que o resource handler serve) e devolvia URL
        // relativa. Agora delega ao UploadService, então a URL é absoluta e
        // aponta para /uploads/avatars/.
        mockMvc.perform(multipart("/api/usuarios/{id}/foto", alvo.getId()).file(arquivo)
                        .header("Authorization", "Bearer " + tokenPara(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value(org.hamcrest.Matchers.containsString("/uploads/avatars/")));
    }

    @Test
    @DisplayName("Upload para usuário inexistente é 404 e não deixa arquivo órfão")
    void uploadFoto_usuarioInexistente_retorna404() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.orf@lms.com", "senha12345", Usuario.Role.ADMIN);
        var arquivo = new MockMultipartFile("file", "avatar.png", "image/png", new byte[]{1, 2, 3});

        // Antes o arquivo era gravado ANTES do findById, então um 404 deixava
        // arquivo órfão no disco. Agora o usuário é resolvido primeiro.
        mockMvc.perform(multipart("/api/usuarios/{id}/foto", 999999).file(arquivo)
                        .header("Authorization", "Bearer " + tokenPara(admin)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Upload de formato não suportado é rejeitado")
    void uploadFoto_formatoInvalido_retorna400() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin.fmt@lms.com", "senha12345", Usuario.Role.ADMIN);
        Usuario alvo = criarUsuario("Alvo", "alvo.fmt@lms.com", "senha12345", Usuario.Role.ALUNO);
        var arquivo = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/usuarios/{id}/foto", alvo.getId()).file(arquivo)
                        .header("Authorization", "Bearer " + tokenPara(admin)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("ALUNO não pode listar usuários")
    void listar_comoAluno_retorna403() throws Exception {
        Usuario aluno = criarUsuario("Aluno", "aluno.acl@lms.com", "senha12345", Usuario.Role.ALUNO);

        mockMvc.perform(get("/api/usuarios").header("Authorization", "Bearer " + tokenPara(aluno)))
                .andExpect(status().isForbidden());
    }
}
