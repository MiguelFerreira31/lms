# Relatório de Auditoria — LMS Lite

---

## Validação pós-migração — 2026-08-09

Cobertura ampliada de 19 → **52** testes de integração no backend, 12 → **33** unitários no frontend, e **19** cenários end-to-end novos (Playwright). Os 5 controllers que a migração refatorou sem nenhuma rede de proteção — ConteudoAula, Professor, Regiao, Unidade e Upload — passaram a ter teste.

**Bug de produção encontrado pelos testes novos:** `POST /api/regioes/{id}/unidades` **nunca funcionou**. A coluna `unidades.slug` é NOT NULL UNIQUE desde a V13, mas nada preenchia esse campo — nem o controller original, nem um `@PrePersist`. Toda criação de unidade pelo painel admin morria na constraint e voltava 409. As unidades existentes só têm slug porque ele foi calculado em SQL dentro da própria migration. Corrigido com `SlugGenerator`, que reproduz aquela normalização em Java (minúsculas, sem acentos, não-alfanumérico vira hífen) e resolve colisão com sufixo numérico. Renomear a unidade agora também atualiza o slug.

**Dois defeitos que o zoneless expôs:**

- `LoginComponent.loading` era um campo comum mutado dentro de callback de HTTP. Sem zone.js isso não notifica o Angular; o componente só continuava funcionando por estar marcado como `Eager`, e a escrita caía no meio do ciclo, disparando NG0100 no `[disabled]` do botão. Virou `signal`.
- `AuthService` revalidava o usuário com `setTimeout(..., 100)` — um atraso arbitrário torcendo para cair depois do primeiro render do zone.js. Passou a usar `afterNextRender`.

**Diferença de comportamento do zoneless em testes:** `fixture.detectChanges()` refaz a verificação de *todos* os fixtures anexados, e não só do que recebeu a chamada. Um fixture criado em `beforeEach` com `@Input` ainda não preenchido quebra os testes seguintes — por isso os specs de componente criam o fixture dentro de cada teste.

**Pendência conhecida (só em dev):** `AppComponent` emite NG0100 na transição de layout do login (`Previous value: '1'. Current value: '0'`), porque `isLoggedIn()` e `currentUrl` mudam dentro do mesmo ciclo disparado pela navegação. Verificado contra o build de **produção**: zero erro de console e os 3 gráficos montando normalmente. O `checkNoChanges` que reporta isso só roda em dev.

---

## Migração de stack — 2026-08-09

Java 17 → 25 LTS · Spring Boot 3.5.14 → 4.1.0 · PostgreSQL 15 → 18 · Angular 18 → 22 · Tailwind 3 → 4 · Karma → Vitest.

**Bugs estruturais corrigidos no caminho** (nenhum deles causado pela migração):

| Achado | Impacto |
|---|---|
| Zero `@Transactional` em `src/main`; `CursoController.criar/atualizar` gravava curso, categorias e tipos em transações separadas | Falha no meio deixava curso salvo com metade dos vínculos |
| `Curso.categorias` e `.tipos` EAGER sobre bags `List` | 36 queries por página de 10 cursos → **4** |
| 13 FKs sem índice (o Postgres não indexa FK automaticamente); havia 1 `CREATE INDEX` em 16 migrations | Seq scan em todo join e `ON DELETE CASCADE` |
| `WebConfig` e `UploadConfig` registravam `/uploads/**` para diretórios diferentes; `UsuarioController.uploadFoto` gravava num terceiro | Avatar gravado por uma rota não era servido |
| Upload apagava a imagem antiga antes de gravar a nova | Falha na gravação deixava a entidade apontando para arquivo inexistente |
| `PATCH /api/usuarios/{id}/role` com `Map<String,String>` | Role inválida devolvia 200 com o usuário inalterado |
| `POST /api/professores/{id}/cursos` com `Map<String,Long>` | NPE quando `cursoId` vinha ausente |
| Rotas `/admin/*` e `/professor/*` protegidas só por `authGuard` | ALUNO autenticado renderizava a UI de admin (a API barrava, a tela não) |
| `@Data` do Lombok em 15 entidades, com `equals`/`hashCode` sobre associações | `List.contains()` forçava a carga do grafo inteiro |
| `@ExceptionHandler(Exception.class)` sem nenhum `Logger` no projeto | Erro 500 invisível em produção |
| `MutationObserver` sobre `document.body` nunca desconectado | Seguia vivo após o componente ser destruído |
| `.gitattributes` não fixava `*.sql` com `core.autocrlf=true` | Windows e o runner Linux do CI geravam checksums de Flyway diferentes para o mesmo repositório |

**Bug introduzido e pego pelos testes novos**: o `@EntityGraph` adicionado para matar o N+1 incluía `modulos` e `modulos.aulas` juntos, o que dispara `MultipleBagFetchException` e quebrava `GET /api/cursos/{id}`. Os testes existentes não pegaram porque só exercitam POST/PUT — o teste de contrato de erro é que expôs.

**Armadilhas de migração que falham em silêncio** (build passa, sem warning):

- O builder esbuild do Angular lê `.postcssrc.json`, **não** `postcss.config.js`. Com o arquivo errado, o Tailwind 4 expandia `@apply` mas não varria os templates: CSS de 75 KB → 32 KB, sem nenhuma utility usada no HTML.
- No Boot 4 a auto-configuração foi dividida por tecnologia: declarar `flyway-core` cru não liga mais o Flyway. O schema não migrava e o `ddl-auto=validate` falhava com `missing table [areas]`.
- A schematic de control flow converte `trackBy` para `track f(i, item)`, que não compila — no `@for`, `track` é expressão de identidade.

**Verificação final**: 19/19 testes de integração no backend (Postgres 18 via Testcontainers), 12/12 no frontend (Vitest), 12 rotas renderizadas em Chrome headless com zero erro de console, os 3 gráficos Chart.js montando sob zoneless e o guard de role bloqueando ALUNO em `/admin/*`.

---

## Auditoria anterior — 2026-05-31

Dead code `ListaCursosComponent`, tipagem `any`, `error.interceptor`, `GlobalExceptionHandler` (8 handlers), `trackBy` em 20 `*ngFor`, `forkJoin` em 6 componentes — todos resolvidos. Detalhes preservados abaixo na secção histórica.

---

## Auditoria de Higiene — 2026-06-05

**Branch:** `chore/auditoria-limpeza`
**Objectivo:** remover ficheiros órfãos, scripts ad-hoc, imagens de referência, READMEs desatualizados e fechar gaps no `.gitignore`.

---

### Resultados por item

| # | Arquivo | Ação | Commit | Status |
|---|---------|------|--------|--------|
| 1 | `senacTemplate.png` (3,8 MB) | `git rm` | `6557c28` | ✅ |
| 2 | `templateArea.png` (6,3 MB) | `git rm` | `6557c28` | ✅ |
| 3 | `templateTipo.png` (3,3 MB) | `git rm` | `6557c28` | ✅ |
| 4 | `ss_usuarios.js` | `git rm` | `f98a795` | ✅ |
| 5 | `test_no_hash.js` | `git rm` | `f98a795` | ✅ |
| 6 | `validate-final.js` | `git rm` | `f98a795` | ✅ |
| 7 | `ss_admin.js` (untracked) | `rm` local | — | ✅ |
| 8 | `ss_forms.js` (untracked) | `rm` local | — | ✅ |
| 9–10 | `ss_home.png`, `ss_login.png` (untracked) | `rm` local | — | ✅ |
| 11 | `01_…` – `08_…` *.png* (8 ficheiros, untracked) | `rm` local | — | ✅ |
| 12 | `.idea/` raiz (untracked) | `rm` local | — | ✅ |
| 13 | `backend/README.md` | Actualizado (não removido) | `a90024f` | ✅ |
| 14 | `frontend/README.md` | `git rm` | `451d3da` | ✅ |
| 15 | `frontend/src/app/app.component.spec.ts` | `git rm` | `9a3b0c8` | ✅ |
| 16 | `backend/uploads/avatars/*.jpeg/png` | Nunca rastreado — gitignore adicionado | `5463cfa` | ✅ |

### `.gitignore` raiz — gaps corrigidos

Commit `5463cfa` — padrões ancorados adicionados:

```gitignore
# Scripts e screenshots de sessão de testes (somente raiz)
/ss_*.js
/ss_*.png
/[0-9][0-9]_*.png

# IDE / runtime
/.idea/
/backend/uploads/
```

### Items mantidos (conforme aprovação)

| Item | Decisão |
|------|---------|
| `backend/src/main/resources/static/` e `templates/` | Mantidos — esperados pelo Spring Boot |
| `backend/src/test/…/LmsBackendApplicationTests.java` | Mantido — context-load test válido |
| `frontend/.vscode/extensions.json`, `launch.json`, `tasks.json` | Mantidos — explicitamente des-ignorados no `frontend/.gitignore` |
| `backend/.gitignore` e `frontend/.gitignore` | Mantidos sem alteração — têm entradas únicas legítimas |

---

### Validação pós-limpeza

| Validação | Resultado |
|-----------|-----------|
| `cd backend && ./mvnw.cmd clean compile` | ✅ SUCCESS — apenas 4 avisos Lombok/JDK esperados |
| `cd frontend && npx ng build` | ✅ `Application bundle generation complete. [11.312 seconds]` |

---

### Resumo de impacto

| Métrica | Valor |
|---------|-------|
| Ficheiros rastreados removidos do git | 9 (3 PNGs + 3 scripts + README frontend + spec + README backend substituído) |
| Ficheiros não rastreados removidos do disco | 13 (scripts + screenshots + .idea/) |
| Redução de tamanho no working tree | ~18 MB (13,4 MB imagens + scripts + screenshots) |
| Redução no histórico git | **0** — sem reescrita de histórico (git rm normal) |
| Builds a passar | 2/2 (backend compile + frontend build) |

> **Nota:** `git rm` remove os ficheiros das *commits futuras* mas não purga o histórico passado. As imagens de design (13,4 MB) permanecem acessíveis via `git log` em commits anteriores. Para purga do histórico seria necessário `git filter-repo` / BFG — não executado conforme instrução.

---

### Commits da branch `chore/auditoria-limpeza`

```
451d3da  chore: remove frontend/README boilerplate do Angular CLI
a90024f  docs: atualiza backend/README com stack e domínios atuais
9a3b0c8  refactor: remove app.component.spec.ts obsoleto
f98a795  chore: remove scripts ad-hoc de validação e screenshot
6557c28  chore: remove imagens de referência de design da raiz
5463cfa  chore: adiciona padrões ancorados ao .gitignore raiz
```

Branch pronta para revisão e PR. Sem merge nem push efectuados.

---

## Histórico — Auditoria 2026-05-31

### Backend

- [x] `DTOs.java` — `AuthResponse` com `avatarUrl` adicionado
- [x] `AuthController.login()` — inclui `avatarUrl` na resposta
- [x] `GlobalExceptionHandler` — 8 handlers (era 4): `HttpMessageNotReadableException`, `DataIntegrityViolationException`, `IllegalArgumentException`, `Exception` catch-all adicionados

### Frontend

- [x] `DetalheCursoComponent.curso` — `signal<any>` → `signal<CursoDetalhe | null>`; interfaces `AulaInfo`, `ModuloInfo`, `CursoDetalhe` adicionadas
- [x] `error.interceptor.ts` criado em `core/interceptors/` — logout automático em 401 com token presente
- [x] `DashboardComponent.irParaCursos()` — redirect directo para `/cursos/areas` (era via `/cursos`)
- [x] `ListaCursosComponent` — removido (`features/cursos/lista-cursos/` excluído)
- [x] `trackBy` — adicionado em 20 `*ngFor` com dados de API
- [x] `forkJoin` — 6 componentes convertidos para chamadas paralelas
- [x] Error handlers — 7 subscribes sem `error:` corrigidos
- [x] CSS custom properties (`--color-primary` etc.) — adicionadas ao `styles.scss`

### Métricas finais (2026-05-31)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Uso de `any` | 1 | 0 |
| Exception handlers | 4 | 8 |
| `*ngFor` sem `trackBy` | ~20 | 0 |
| Componentes dead code | 1 | 0 |
| Interceptors registados | 1 | 2 |
| Build Angular — erros | 19 | 0 |
| Warnings backend (esperados) | 4 | 4 |
