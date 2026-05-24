import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/cursos/lista-cursos/lista-cursos.component').then(m => m.ListaCursosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./features/cursos/detalhe-curso/detalhe-curso.component').then(m => m.DetalheCursoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'matriculas',
    loadComponent: () => import('./features/matriculas/minhas-matriculas.component').then(m => m.MinhasMatriculasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'cursos',
        loadComponent: () => import('./features/admin/cursos/admin-cursos.component').then(m => m.AdminCursosComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'regioes',
        loadComponent: () => import('./features/admin/regioes/admin-regioes.component').then(m => m.AdminRegioesComponent)
      },
      {
        path: 'professores',
        loadComponent: () => import('./features/admin/professores/admin-professores.component').then(m => m.AdminProfessoresComponent)
      },
      { path: '', redirectTo: 'cursos', pathMatch: 'full' }
    ]
  },
  {
    path: 'professor',
    canActivate: [authGuard],
    children: [
      {
        path: 'cursos',
        loadComponent: () => import('./features/professor/meus-cursos/professor-cursos.component').then(m => m.ProfessorCursosComponent)
      },
      { path: '', redirectTo: 'cursos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
