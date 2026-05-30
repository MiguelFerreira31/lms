package br.com.lms.config;

import br.com.lms.security.JwtAuthFilter;
import br.com.lms.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfig()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Auth — público
                .requestMatchers("/api/auth/**").permitAll()
                // Cursos — leitura pública, escrita ADMIN
                .requestMatchers(HttpMethod.GET, "/api/cursos", "/api/cursos/{id}").permitAll()
                // Áreas, Categorias e Tipos — totalmente públicos
                .requestMatchers(HttpMethod.GET, "/api/areas/**", "/api/tipos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/cursos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/cursos/**").hasRole("ADMIN")
                // Usuários
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/usuarios/**").hasRole("ADMIN")
                // Regiões e Unidades — lista e todas-unidades são públicas, detalhes exigem auth
                .requestMatchers(HttpMethod.GET, "/api/regioes", "/api/regioes/unidades").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/regioes/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/regioes", "/api/regioes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/regioes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/regioes/**").hasRole("ADMIN")
                // Professores
                .requestMatchers("/api/professores/meus-cursos").hasAnyRole("ADMIN", "PROFESSOR")
                .requestMatchers(HttpMethod.GET, "/api/professores/**").hasAnyRole("ADMIN", "PROFESSOR")
                .requestMatchers(HttpMethod.POST, "/api/professores/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/professores/**").hasRole("ADMIN")
                // Conteúdo das aulas
                .requestMatchers(HttpMethod.GET, "/api/aulas/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/aulas/**").hasAnyRole("ADMIN", "PROFESSOR")
                .requestMatchers(HttpMethod.PUT, "/api/aulas/**").hasAnyRole("ADMIN", "PROFESSOR")
                .requestMatchers(HttpMethod.DELETE, "/api/aulas/**").hasAnyRole("ADMIN", "PROFESSOR")
                // Presença
                .requestMatchers(HttpMethod.POST, "/api/presenca").hasAnyRole("ADMIN", "PROFESSOR")
                .requestMatchers(HttpMethod.GET, "/api/presenca/**").authenticated()
                // Matrículas — listagem por curso para admin/professor
                .requestMatchers(HttpMethod.GET, "/api/matriculas/curso/**").hasAnyRole("ADMIN", "PROFESSOR")
                // Nota
                .requestMatchers(HttpMethod.PATCH, "/api/matriculas/*/nota").hasAnyRole("ADMIN", "PROFESSOR")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
