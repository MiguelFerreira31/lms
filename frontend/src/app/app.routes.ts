import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'unidades',
    loadComponent: () => import('./features/unidades/unidades.component').then(m => m.UnidadesComponent)
  },
  {
    path: 'unidades/:unidadeSlug',
    loadComponent: () => import('./features/unidades/detalhe-unidade/detalhe-unidade.component').then(m => m.DetalheUnidadeComponent)
  },
  {
    path: 'unidades/:unidadeSlug/areas/:areaSlug',
    loadComponent: () => import('./features/unidades/cursos-unidade-area/cursos-unidade-area.component').then(m => m.CursosUnidadeAreaComponent)
  },
  {
    path: 'unidades/:unidadeSlug/:tipoSlug',
    loadComponent: () => import('./features/unidades/cursos-unidade-tipo/cursos-unidade-tipo.component').then(m => m.CursosUnidadeTipoComponent)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/sobre/sobre.component').then(m => m.SobreComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  // Public course catalog and detail (API is public)
  { path: 'cursos', redirectTo: '/cursos/areas', pathMatch: 'full' },
  {
    path: 'cursos/areas',
    loadComponent: () => import('./features/areas/lista-areas/lista-areas.component').then(m => m.ListaAreasComponent)
  },
  {
    path: 'cursos/areas/:areaSlug',
    loadComponent: () => import('./features/areas/detalhe-area/detalhe-area.component').then(m => m.DetalheAreaComponent)
  },
  {
    path: 'cursos/areas/:areaSlug/:categoriaSlug',
    loadComponent: () => import('./features/areas/lista-cursos-categoria/lista-cursos-categoria.component').then(m => m.ListaCursosCategoriaComponent)
  },
  {
    path: 'cursos/tipos/:tipoSlug',
    loadComponent: () => import('./features/areas/lista-cursos-tipo/lista-cursos-tipo.component').then(m => m.ListaCursosTipoComponent)
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./features/cursos/detalhe-curso/detalhe-curso.component').then(m => m.DetalheCursoComponent)
  },
  // Authenticated routes
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
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
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
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
  { path: '**', redirectTo: '/home' }
];
