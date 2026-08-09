package br.com.lms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentação da API em {@code /swagger-ui.html}.
 *
 * <p>O esquema {@code bearerAuth} é declarado globalmente para que o botão
 * "Authorize" do Swagger UI aceite o JWT emitido por {@code POST /api/auth/login}.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lmsOpenAPI() {
        final String esquemaJwt = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("LMS Lite API")
                        .version("v1")
                        .description("""
                                Sistema de gestão de cursos educacionais.

                                Autenticação: `POST /api/auth/login` devolve um JWT; envie-o \
                                como `Authorization: Bearer <token>`.

                                Erros seguem RFC 7807 (`application/problem+json`).""")
                        .license(new License().name("Portfólio — Miguel Ferreira")))
                .addSecurityItem(new SecurityRequirement().addList(esquemaJwt))
                .components(new Components().addSecuritySchemes(esquemaJwt,
                        new SecurityScheme()
                                .name(esquemaJwt)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
