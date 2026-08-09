package br.com.lms.domain.area;

import br.com.lms.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Catálogo público: Área → Categoria, Tipo, Região e Unidade.
 *
 * <p>Estes quatro controllers foram movidos para services na migração e não
 * tinham nenhum teste. Como também são os endpoints cacheados (áreas, tipos,
 * regiões) e os que mais sofreram com a mudança de EAGER para LAZY, é aqui que
 * uma regressão silenciosa apareceria.
 */
class CatalogoPublicoIT extends IntegrationTestBase {

    // ─── Áreas e categorias ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/areas é público e traz as categorias aninhadas")
    void listarAreas_publico_comCategoriasAninhadas() throws Exception {
        mockMvc.perform(get("/api/areas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nome").exists())
                .andExpect(jsonPath("$[0].slug").exists())
                // O join fetch de categorias precisa continuar funcionando com
                // Area.categorias em LAZY.
                .andExpect(jsonPath("$[?(@.slug=='tecnologia-da-informacao')].categorias").exists());
    }

    @Test
    @DisplayName("GET /api/areas/{slug} devolve a área e 404 para slug inexistente")
    void detalheArea() throws Exception {
        mockMvc.perform(get("/api/areas/tecnologia-da-informacao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("tecnologia-da-informacao"));

        mockMvc.perform(get("/api/areas/area-que-nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://lms.local/erros/recurso-nao-encontrado"));
    }

    @Test
    @DisplayName("GET /api/areas/{area}/{categoria} pagina no formato PagedModel")
    void cursosPorCategoria_usaShapePagedModel() throws Exception {
        mockMvc.perform(get("/api/areas/tecnologia-da-informacao/desenvolvimento-web?size=5"))
                .andExpect(status().isOk())
                // O shape mudou na migração: os metadados saíram da raiz e foram
                // para "page". O frontend depende exatamente disto.
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.size").value(5))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.totalElements").exists())
                .andExpect(jsonPath("$.page.totalPages").exists());
    }

    // ─── Tipos ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/tipos é público e GET /api/tipos/{slug}/cursos pagina")
    void tipos() throws Exception {
        mockMvc.perform(get("/api/tipos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].slug").exists());

        mockMvc.perform(get("/api/tipos/livre/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").exists());

        mockMvc.perform(get("/api/tipos/tipo-inexistente/cursos"))
                .andExpect(status().isNotFound());
    }

    // ─── Unidades ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/unidades/{slug} devolve áreas e tipos com curso ativo na unidade")
    void detalheUnidade() throws Exception {
        // Este endpoint carregava TODOS os cursos da unidade com Pageable.unpaged()
        // só para extrair áreas e tipos distintos em memória. Virou dois
        // SELECT DISTINCT — o contrato de saída tem que ser o mesmo.
        mockMvc.perform(get("/api/unidades/santo-amaro"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("santo-amaro"))
                .andExpect(jsonPath("$.nome").exists())
                .andExpect(jsonPath("$.regiaoNome").exists())
                .andExpect(jsonPath("$.areas").isArray())
                .andExpect(jsonPath("$.tipos").isArray());

        mockMvc.perform(get("/api/unidades/unidade-inexistente"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/unidades/{slug}/cursos filtra por área e por tipo")
    void cursosDaUnidade() throws Exception {
        mockMvc.perform(get("/api/unidades/santo-amaro/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        mockMvc.perform(get("/api/unidades/santo-amaro/cursos?areaSlug=tecnologia-da-informacao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        mockMvc.perform(get("/api/unidades/santo-amaro/cursos?tipoSlug=livre"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // ─── Regiões ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/regioes traz as 4 regiões do seed com a contagem de unidades")
    void listarRegioes() throws Exception {
        // RegiaoRepository.findAllWithUnidades() usa LEFT JOIN FETCH sobre uma
        // coleção List (bag). O Hibernate 6 removeu a dedupe implícita do
        // DISTINCT, então a contagem é o que denunciaria linhas infladas.
        mockMvc.perform(get("/api/regioes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].totalUnidades").isNumber());
    }

    @Test
    @DisplayName("GET /api/regioes/unidades traz as 64 unidades do seed")
    void listarTodasUnidades() throws Exception {
        mockMvc.perform(get("/api/regioes/unidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(64))
                .andExpect(jsonPath("$[0].regiaoNome").exists());
    }

    @Test
    @DisplayName("Teto de page size impede ?size=100000 de materializar a tabela")
    void pageSizeTemTeto() throws Exception {
        mockMvc.perform(get("/api/cursos?size=100000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.size").value(100));
    }
}
