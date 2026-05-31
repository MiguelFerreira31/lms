import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ avatarUrl: string }>(`${this.api}/upload/avatar`, form);
  }

  uploadCurso(cursoId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imagemUrl: string }>(`${this.api}/upload/curso/${cursoId}`, form);
  }

  uploadUnidade(unidadeId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imagemUrl: string }>(`${this.api}/upload/unidade/${unidadeId}`, form);
  }
}
