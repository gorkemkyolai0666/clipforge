# Stitch → Frontend Pipeline

## Problem

Saving `STITCH_DESIGN_SYSTEM.json` alone is **not** frontend implementation. The factory must apply Stitch **htmlCode** output — not invent a generic React template with only color tokens.

## Required pipeline (every new product)

```
stitch-<product>.py              → STITCH_DESIGN_SYSTEM.json (live Stitch API, includes htmlCode URLs)
docs/project/stitch-frontend.config.json  → product copy + stitchScreens route mapping
stitch_frontend.py <project-root>         → layout, theme, globals + delegates to stitch_apply_html
stitch_apply_html.py <project-root>       → downloads htmlCode, applies Tailwind/styles/pages verbatim
apply-stitch-tokens.py <project-root>     → optional CSS token patch (fallback)
verify-stitch-fidelity.py <project-root>  → MUST pass — blocks template leaks + missing htmlCode apply
npm run build                             → verify
```

## Stitch HTML apply (primary path)

**Script:** `scripts/stitch_apply_html.py` (template source of truth)

When `stitchScreens.enabled: true` and `STITCH_DESIGN_SYSTEM.json` contains `htmlCode.downloadUrl`:

1. Download each screen HTML from Stitch
2. Parse `<script id="tailwind-config">` → full `tailwind.config.ts` (all `surface-container`, `on-surface`, etc.)
3. Extract `<style>` blocks → append to `globals.css`
4. Extract `<body>` innerHTML → `frontend/src/stitch-screens/{slug}.html.ts`
5. Generate `StitchScreen` component + route pages
6. Replace `dashboard/layout.tsx` — **no AppLayout/SidebarNav** (Stitch HTML includes its own sidebar)

## Config: stitchScreens route mapping

**Example:** `docs/project/stitch-frontend.config.example.json`

```json
"stitchScreens": {
  "enabled": true,
  "routes": [
    { "match": "Workspace", "route": "frontend/src/app/dashboard/page.tsx" },
    { "match": "Metrics", "route": "frontend/src/app/dashboard/cycle-heatmap/page.tsx" },
    { "match": "Settings", "route": "frontend/src/app/dashboard/settings/page.tsx" },
    { "match": "Landing", "route": "frontend/src/app/page.tsx" }
  ]
}
```

Title keywords auto-map if routes omitted: `workspace`, `metric`, `setting`, `team`.

Screens with `logo`/`icon` in title are stored but not routed (asset-only).

## Fallback path (no htmlCode)

If Stitch payload has no `htmlCode`, `stitch_frontend.py` generates token-based shell from config JSON (legacy).

## Generated files (htmlCode path)

| File | Source |
|------|--------|
| `frontend/src/stitch-screens/*.html.ts` | Stitch htmlCode body |
| `frontend/src/components/stitch-screen.tsx` | HTML renderer |
| `frontend/src/app/dashboard/page.tsx` | Mapped Stitch screen |
| `frontend/tailwind.config.ts` | Stitch tailwind-config script |
| `frontend/src/app/globals.css` | Base tokens + Stitch inline styles |
| `frontend/src/app/layout.tsx` | Root layout + Material Symbols |
| `frontend/src/app/dashboard/layout.tsx` | Auth only — no double sidebar |
| `docs/project/stitch-applied-manifest.json` | Applied screen/route manifest |

## Wiring in build-*.py

After competitor text replacements, call:

```python
def copy_sanitize_scripts() -> None:
    for name in (
        "stitch_frontend.py",
        "stitch_apply_html.py",
        "apply-stitch-tokens.py",
        "verify-stitch-fidelity.py",
        ...
    ):
        ...

def apply_stitch_frontend() -> None:
    subprocess.run(["python3", str(ROOT / "scripts/stitch_frontend.py"), str(ROOT)], check=False)

def verify_stitch_fidelity() -> None:
    subprocess.run(["python3", str(ROOT / "scripts/verify-stitch-fidelity.py"), str(ROOT)], check=True)
```

## Anti-patterns (forbidden)

- Ignoring Stitch `htmlCode` and shipping a DocForge-style document workspace
- Wrapping Stitch pages with `AppLayout` / `SidebarNav` (double sidebar)
- Only patching colors (`coral` alias) without applying Stitch HTML/layout
- Hardcoded `indigo`, `cyan`, `pearl`, `#F8F7FF` in generated components
- `verify-stitch-fidelity.py` passing without `surface-container` in tailwind config
