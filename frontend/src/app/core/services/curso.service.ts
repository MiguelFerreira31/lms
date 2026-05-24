import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Curso { id: number; titulo: string; descricao: string; nivel: string; criadoEm: string; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }
export interface Matricula { id: number; cursoId: number; cursoTitulo: string; status: string; matriculadoEm: string; }
export interface Progresso { matriculaId: number; aulasConcluidas: number; totalAulas: number; percentual: number; }

@Injectable({ providedIn: 'root' })
export class CursoService {
  constructor(private http: HttpClient) {}

  listarCursos(page = 0, nivel?: string) {
    let params = new HttpParams().set('page', page).set('size', 10);
    if (nivel) params = params.set('nivel', nivel);
    return this.http.get<Page<Curso>>(`${environment.apiUrl}/cursos`, { params });
  }

  buscarCurso(id: number) {
    return this.http.get<Curso>(`${environment.apiUrl}/cursos/${id}`);
  }

  matricular(cursoId: number) {
    return this.http.post<Matricula>(`${environment.apiUrl}/matriculas`, { cursoId });
  }

  minhasMatriculas() {
    return this.http.get<Matricula[]>(`${environment.apiUrl}/matriculas/minhas`);
  }

  progresso(matriculaId: number) {
    return this.http.get<Progresso>(`${environment.apiUrl}/matriculas/${matriculaId}/progresso`);
  }

  criarCurso(data: { titulo: string; descricao: string; nivel: string }) {
    return this.http.post<Curso>(`${environment.apiUrl}/cursos`, data);
  }

  atualizarCurso(id: number, data: { titulo: string; descricao: string; nivel: string }) {
    return this.http.put<Curso>(`${environment.apiUrl}/cursos/${id}`, data);
  }

  deletarCurso(id: number) {
    return this.http.delete(`${environment.apiUrl}/cursos/${id}`);
  }

  listarUsuarios() {
    return this.http.get<any[]>(`${environment.apiUrl}/usuarios`);
  }

  criarUsuario(data: { nome: string; email: string; senha: string }) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data);
  }

  atualizarRole(id: number, role: string) {
    return this.http.patch<any>(`${environment.apiUrl}/usuarios/${id}/role`, { role });
  }
}
