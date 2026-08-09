package br.com.lms.domain.curso;

import br.com.lms.IntegrationTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Trava de regressão para o N+1 do catálogo.
 *
 * <p>{@code Curso} tinha {@code categorias} e {@code tipos} como {@code @ManyToMany}
 * EAGER sobre {@code List} (bags), mais {@code unidade} e {@code area} EAGER — e
 * {@code Categoria} com {@code area} EAGER por cima. Cada curso da página
 * disparava selects próprios.
 *
 * <p>O teto abaixo não é uma meta de performance, é um limite: se alguém voltar a
 * marcar uma associação como EAGER ou remover um fetch join, este teste quebra.
 */
class CursoQueryCountIT extends IntegrationTestBase {

    /**
     * Medição real em 2026-08-09, {@code GET /api/cursos?size=10} com 10 cursos:
     *
     * <table>
     *   <tr><th>estado</th><th>statements JDBC</th></tr>
     *   <tr><td>antes (EAGER em unidade, area, categorias, tipos + Categoria.area)</td><td>36</td></tr>
     *   <tr><td>depois (LAZY + @EntityGraph nos to-one + batch fetch nas coleções)</td><td>4</td></tr>
     * </table>
     *
     * <p>As 4 restantes são: count da paginação, select principal com os joins de
     * unidade/área, batch das categorias e batch dos tipos.
     *
     * <p>O teto tem folga sobre as 4 medidas para absorver variação de plano, mas
     * fica bem abaixo do comportamento antigo — se alguém reintroduzir EAGER ou
     * remover o {@code @EntityGraph}, a contagem estoura.
     */
    private static final int TETO_QUERIES = 8;

    @BeforeEach
    void seed() {
        for (int i = 0; i < 10; i++) {
            criarCurso("Curso de contagem " + i);
        }
    }

    @Test
    void listarCursos_naoDisparaNMaisUmPorCurso() throws Exception {
        long queries = contarQueries(() ->
                mockMvc.perform(get("/api/cursos?size=10"))
                        .andExpect(status().isOk()));

        System.out.println(">>> [MEDICAO] GET /api/cursos (10 cursos) => " + queries + " statements JDBC");
        assertThat(queries)
                .as("GET /api/cursos com 10 cursos deve ficar dentro do teto de %d statements", TETO_QUERIES)
                .isLessThanOrEqualTo(TETO_QUERIES);
    }
}
