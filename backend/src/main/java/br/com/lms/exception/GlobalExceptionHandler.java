package br.com.lms.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Tratamento centralizado de erros no formato RFC 7807/9457 ({@code ProblemDetail},
 * {@code application/problem+json}).
 *
 * <p>Antes a API respondia erro em quatro formatos diferentes: um record
 * {@code ErrorResponse}, um {@code Map<String,String>} na validação, um JSON
 * escrito à mão no {@code authenticationEntryPoint} do SecurityConfig e um
 * {@code {"error": ...}} no upload. Agora todos convergem para o mesmo contrato,
 * incluindo os erros que acontecem dentro da cadeia de filtros do Security
 * (ver {@code SecurityConfig}, que usa o mesmo formato).
 */
/*
 * Estende ResponseEntityExceptionHandler para poder sobrescrever o tratamento das
 * exceções do próprio Spring MVC. Sem isso, o handler embutido que o
 * spring.mvc.problemdetails.enabled liga tem precedência sobre um @ExceptionHandler
 * avulso, e a resposta de validação saía sem os campos type/errors.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String BASE_TYPE = "https://lms.local/erros/";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "Recurso não encontrado",
                ex.getMessage(), "recurso-nao-encontrado");
    }

    /** Regra de negócio violada (ex.: matrícula duplicada, e-mail já cadastrado). */
    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleBusiness(IllegalStateException ex) {
        return problem(HttpStatus.CONFLICT, "Conflito de regra de negócio",
                ex.getMessage(), "conflito");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleForbidden(AccessDeniedException ex) {
        return problem(HttpStatus.FORBIDDEN, "Acesso negado",
                "Você não tem permissão para executar esta ação", "acesso-negado");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ProblemDetail handleAuthentication(AuthenticationException ex) {
        return problem(HttpStatus.UNAUTHORIZED, "Não autenticado",
                "Credenciais inválidas", "nao-autenticado");
    }

    /** Erros de Bean Validation: o detalhe por campo vai na extensão {@code errors}. */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.merge(fe.getField(), fe.getDefaultMessage(), (a, b) -> a + "; " + b);
        }
        ProblemDetail pd = problem(HttpStatus.BAD_REQUEST, "Falha de validação",
                errors.size() == 1 ? "1 campo inválido" : errors.size() + " campos inválidos",
                "validacao");
        pd.setProperty("errors", errors);
        return ResponseEntity.badRequest().body(pd);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        return ResponseEntity.badRequest().body(problem(HttpStatus.BAD_REQUEST,
                "Corpo da requisição inválido", "JSON inválido ou mal formado", "json-invalido"));
    }

    @Override
    protected ResponseEntity<Object> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem(HttpStatus.NOT_FOUND,
                "Rota não encontrada", "Nenhum recurso mapeado para " + ex.getResourcePath(),
                "rota-nao-encontrada"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return problem(HttpStatus.BAD_REQUEST, "Parâmetro inválido",
                "O parâmetro '" + ex.getName() + "' recebeu um valor incompatível", "parametro-invalido");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Violação de integridade no banco", ex);
        return problem(HttpStatus.CONFLICT, "Violação de integridade",
                "Registro duplicado ou violação de restrição de dados", "integridade");
    }

    // Override, não @ExceptionHandler: a ResponseEntityExceptionHandler já mapeia
    // esta exceção, e declarar as duas torna o mapeamento ambíguo (o contexto nem sobe).
    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(problem(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo muito grande",
                        "O arquivo excede o tamanho máximo permitido", "arquivo-grande"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadArgument(IllegalArgumentException ex) {
        return problem(HttpStatus.BAD_REQUEST, "Requisição inválida",
                ex.getMessage(), "requisicao-invalida");
    }

    /**
     * Rede de segurança. Diferente da versão anterior, que engolia a exceção sem
     * registrar nada — o projeto não tinha um único Logger, então erro 500 era
     * invisível em produção.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneral(Exception ex) {
        log.error("Erro não tratado", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno",
                "Erro interno do servidor", "erro-interno");
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail, String tipo) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle(title);
        pd.setType(URI.create(BASE_TYPE + tipo));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
