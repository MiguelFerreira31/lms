# Roadmap — LMS Lite

## Status atual

### v0.1 — MVP (2026-05-24)
- [x] Autenticação JWT (login/cadastro) com roles ADMIN/PROFESSOR/ALUNO
- [x] CRUD de cursos (soft delete via `ativo=false`)
- [x] Estrutura de módulos e aulas
- [x] Matrícula de aluno em curso
- [x] Progresso por aula (marcar aula como concluída)
- [x] Dashboard do aluno
- [x] Sidebar de navegação com controle por role
- [x] Visual com Tailwind CSS + Angular Material

### v0.2 — Gestão completa (2026-05-24)
- [x] Regiões e unidades (CRUD completo)
- [x] Vínculo usuário → unidade
- [x] Professores e vínculo professor ↔ curso
- [x] Conteúdo de aulas (vídeo, PDF, texto, link)
- [x] Presença de alunos (upsert por matrícula + aula + data)
- [x] Lançamento de notas (nota ≥ 6.0 = aprovado)
- [x] CRUD de usuários com edição inline (nome/email/role/unidade)
- [x] Painel "Alunos & Notas" por curso no admin
- [x] Admin de regiões com unidades em MatExpansionPanel

### v0.3 — Portfólio público (2026-05-30)
- [x] Áreas, categorias e tipos de curso (domínio + API pública + frontend)
- [x] 10 áreas, 44 categorias, 11 tipos de curso
- [x] Seed rico: 4 regiões, 64 unidades reais do Senac SP, 35 cursos reais
- [x] Navbar pública branca com mega-dropdown (Cursos: áreas + tipos; Unidades: grid 4 colunas por região)
- [x] Responsividade da nav: hamburger abaixo de 1024px, accordion mobile com dados reais
- [x] Filtro por região e unidade em `/cursos`
- [x] Página `/unidades` com dados reais da API, seções por região, destaque via query param
- [x] Rotas públicas: `/home`, `/sobre`, `/unidades`, `/cursos/areas/**`, `/cursos/tipos/**`
- [x] Documentação completa (CLAUDE.md, DOCUMENTACAO.md, README.md, ROADMAP.md)

---

## Em progresso

- [ ] Módulos e aulas criados via interface admin (atualmente criados diretamente no banco)
- [ ] Deploy em produção

---

## Próximas features — curto prazo

- [ ] **Busca global** de cursos por texto livre (`/api/cursos?q=java`)
- [ ] **Certificado de conclusão** gerado em PDF ao concluir 100% do curso
- [ ] **Avaliação de cursos** pelos alunos (rating 1–5 + comentário)
- [ ] **Página de perfil do aluno** com foto, bio e histórico de cursos
- [ ] **Notificações in-app** (prazo de matrícula, novo conteúdo disponível)
- [ ] **CRUD de módulos e aulas** via interface admin (sem edição manual no banco)
- [ ] **Filtro de alunos** por unidade/região nos relatórios do admin

---

## Próximas features — médio prazo

- [ ] Sistema de cupons e descontos
- [ ] Pagamento integrado (Pix / cartão de crédito)
- [ ] Fórum de discussão por curso (tópicos + respostas)
- [ ] App mobile com Angular + Capacitor
- [ ] Dashboard analytics para admin — gráficos de:
  - Matrículas por período
  - Taxa de conclusão por curso
  - Distribuição de notas
  - Presença média por unidade

---

## Melhorias técnicas

- [ ] **Testes unitários backend** — JUnit 5 + Mockito, cobertura mínima 70%
- [ ] **Testes e2e frontend** — Playwright, cobertura dos fluxos críticos (login, matrícula, nota)
- [ ] **CI/CD** com GitHub Actions (build + test em PR, deploy em merge para main)
- [ ] **Deploy em produção** — Railway (backend) + Vercel ou Netlify (frontend)
- [ ] **Cache com Redis** para endpoints públicos de alta leitura (`/api/cursos`, `/api/areas`)
- [ ] **Rate limiting** na API para endpoints públicos
- [ ] **Documentação Swagger/OpenAPI** via SpringDoc
- [ ] **Refresh token** para renovar JWT sem relogin
- [ ] **Paginação** nas respostas do admin (usuários, regiões)

---

## Histórico de versões

| Versão | Data | Destaques |
|--------|------|-----------|
| v0.1 | 2026-05-24 | MVP: auth JWT, CRUD cursos, matrícula, progresso de aulas, visual Tailwind |
| v0.2 | 2026-05-24 | Regiões, unidades, professores, conteúdo de aulas, presença, notas, CRUD usuários |
| v0.3 | 2026-05-30 | Áreas/categorias/tipos, seed rico (64 unidades, 35 cursos), navbar pública mega-dropdown, páginas públicas, docs |
