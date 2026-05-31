package br.com.lms.domain.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class UploadService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.base-url}")
    private String baseUrl;

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp"
    );

    public String salvar(MultipartFile file, String subpasta) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Formato inválido. Use JPEG, PNG ou WebP.");
        }

        String extensao = getExtensao(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.jpg");
        String nomeArquivo = UUID.randomUUID() + "." + extensao;

        Path diretorio = Paths.get(uploadDir, subpasta);
        Files.createDirectories(diretorio);

        Path destino = diretorio.resolve(nomeArquivo);
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/uploads/" + subpasta + "/" + nomeArquivo;
    }

    public void deletar(String urlAtual) {
        if (urlAtual == null || urlAtual.isBlank()) return;
        try {
            // Extrai o caminho relativo após /uploads/
            int idx = urlAtual.indexOf("/uploads/");
            if (idx < 0) return;
            String relativo = urlAtual.substring(idx + "/uploads/".length());
            Path arquivo = Paths.get(uploadDir, relativo.split("/"));
            Files.deleteIfExists(arquivo);
        } catch (IOException ignored) {}
    }

    private String getExtensao(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot > 0) {
            String ext = filename.substring(dot + 1).toLowerCase();
            return Set.of("jpg", "jpeg", "png", "webp").contains(ext) ? ext : "jpg";
        }
        return "jpg";
    }
}
