package br.com.lms.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " não encontrado(a) com id: " + id);
    }

    public ResourceNotFoundException(String resource, String slug) {
        super(resource + " não encontrado(a): " + slug);
    }
}
