package br.com.lms.domain.curso;

import br.com.lms.IntegrationTestBase;
import br.com.lms.domain.area.Area;
import br.com.lms.domain.usuario.Usuario;
import br.com.lms.dto.DTOs.CursoRequest;
import br.com.lms.dto.DTOs.ModuloRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CursoControllerIT extends IntegrationTestBase {

    @Test
    void criarCurso_comModulosAninhados_retornaCriado() throws Exception {
        Usuario admin = criarUsuario("Admin", "admin@teste.com", "senha123", Usuario.Role.ADMIN);
        Area area = areaRepository.findAll().get(0);
        CursoRequest request = new CursoRequest(
                "Curso Com Módulos", "desc", Curso.Nivel.BASICO, null, area.getId(),
                List.of(new ModuloRequest(null, "Módulo 1", 1), new ModuloRequest(null, "Módulo 2", 2)),
                null, null);

        String resposta = mockMvc.perform(post("/api/cursos")
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Curso Com Módulos"))
                .andReturn().getResponse().getContentAsString();

        long cursoId = objectMapper.readTree(resposta).get("id").asLong();
        Curso curso = cursoRepository.findById(cursoId).orElseThrow();
        assertEquals(2, curso.getModulos().size());
    }

    @Test
    void atualizarCurso_comNovosModulos_substituiTodosOsModulosAntigos_replaceAll() throws Exception {
        // Documenta comportamento atual conhecido do PUT /api/cursos/{id}: os módulos são
        // sempre limpos e recriados a partir do request (replace-all), não há merge por id.
        // Isso é debt conhecido do projeto — não é corrigido nesta tarefa, apenas registrado.
        Usuario admin = criarUsuario("Admin", "admin2@teste.com", "senha123", Usuario.Role.ADMIN);
        Area area = areaRepository.findAll().get(0);
        CursoRequest criar = new CursoRequest(
                "Curso Original", "desc", Curso.Nivel.BASICO, null, area.getId(),
                List.of(new ModuloRequest(null, "Módulo Original", 1)), null, null);

        String resposta = mockMvc.perform(post("/api/cursos")
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(criar)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long cursoId = objectMapper.readTree(resposta).get("id").asLong();

        CursoRequest atualizar = new CursoRequest(
                "Curso Original", "desc", Curso.Nivel.BASICO, null, area.getId(),
                List.of(new ModuloRequest(null, "Módulo Novo A", 1), new ModuloRequest(null, "Módulo Novo B", 2)),
                null, null);

        mockMvc.perform(put("/api/cursos/{id}", cursoId)
                        .header("Authorization", "Bearer " + tokenPara(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(atualizar)))
                .andExpect(status().isOk());

        Curso curso = cursoRepository.findById(cursoId).orElseThrow();
        assertEquals(2, curso.getModulos().size());
        assertTrue(curso.getModulos().stream().noneMatch(m -> m.getTitulo().equals("Módulo Original")));
        assertTrue(curso.getModulos().stream().anyMatch(m -> m.getTitulo().equals("Módulo Novo A")));
    }

    @Test
    void criarCurso_comoAluno_retorna403() throws Exception {
        Usuario aluno = criarUsuario("Aluno", "aluno@teste.com", "senha123", Usuario.Role.ALUNO);
        Area area = areaRepository.findAll().get(0);
        CursoRequest request = new CursoRequest(
                "Curso Proibido", "desc", Curso.Nivel.BASICO, null, area.getId(), null, null, null);

        mockMvc.perform(post("/api/cursos")
                        .header("Authorization", "Bearer " + tokenPara(aluno))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
