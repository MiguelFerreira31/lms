# Relatório de Auditoria — LMS Lite

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
