# Transform Rules — Build Script Guardrails

When generating a new titan variant via `scripts/build-*.py`, follow these rules to avoid breaking CI/CD.

## Protected paths (never apply competitor global replacements)

- `.github/workflows/**` — Loom Actions context expressions
- `**/package-lock.json` — npm package names (e.g. `istanbul-reports`)
- `scripts/provision-*.ts`, `scripts/provision-railway.sh`, `scripts/provision-all.ts`
- `backend/Procfile`

## Forbidden global replacements

Never use repository-wide replace for these tokens without path exclusions:

| Token | Why |
|-------|-----|
| `github` | Breaks `github.ref`, `github.event.repository.name` in CI |
| `repo` | Breaks `repository`, `reporterId`, npm `is-shared-array-buffer` |
| `share` | Breaks npm packages and valid domain terms |
| `dependency` | Breaks Prisma models and TypeScript identifiers |

## Required post-transform steps

After every `build-*.py` run, execute in order:

```bash
# 1. Stitch-aligned frontend (requires docs/project/stitch-frontend.config.json)
python3 scripts/stitch_frontend.py project-artifacts/<project>

# 2. CI workflow sanitizer
python3 scripts/sanitize-ci-workflows.py project-artifacts/<project>
```

See `docs/company/STITCH_FRONTEND.md` for config schema and generated files.

The `stitch_frontend.py` generator is **project-agnostic** — product names live only in `stitch-frontend.config.json`, not in the generator script.

## CI workflow whitelist

Only these replacements are safe in `.github/workflows/ci.yml`:

- Project name / postgres credentials
- Port numbers
- JWT secret prefix

All other competitor metaphor replacements must stay out of workflow files.
