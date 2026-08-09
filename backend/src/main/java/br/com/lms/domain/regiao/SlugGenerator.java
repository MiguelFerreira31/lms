package br.com.lms.domain.regiao;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/**
 * Gera o slug de uma unidade a partir do nome.
 *
 * <p>A coluna {@code unidades.slug} é NOT NULL UNIQUE desde a V13, mas nada no
 * código preenchia esse campo — quem criava unidade pela API sempre esbarrava na
 * constraint. As unidades existentes vieram do seed, onde o slug foi calculado
 * em SQL (V13/V14). Esta classe reproduz aquela normalização em Java:
 * minúsculas, acentos removidos, tudo que não é alfanumérico vira hífen.
 */
final class SlugGenerator {

    private SlugGenerator() {}

    static String gerar(String nome) {
        String base = Normalizer.normalize(nome == null ? "" : nome, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")                 // tira os acentos
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")            // não-alfanumérico vira hífen
                .replaceAll("^-+|-+$", "");               // apara as pontas
        return base.isBlank() ? "unidade" : base;
    }

    /**
     * Acrescenta um sufixo numérico enquanto o slug já estiver em uso.
     * Duas unidades podem legitimamente ter o mesmo nome em regiões diferentes.
     */
    static String gerarUnico(String nome, Predicate<String> jaExiste) {
        String base = gerar(nome);
        String candidato = base;
        int sufixo = 2;
        while (jaExiste.test(candidato)) {
            candidato = base + "-" + sufixo++;
        }
        return candidato;
    }
}
