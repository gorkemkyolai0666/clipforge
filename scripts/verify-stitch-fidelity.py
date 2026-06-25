#!/usr/bin/env python3
"""Fail the build if Stitch-generated frontend still contains forbidden template colors."""
from __future__ import annotations

import json
import sys
from pathlib import Path

FORBIDDEN_BY_FILE: dict[str, list[str]] = {
    "frontend/src/app/page.tsx": [
        "bg-pearl",
        "bg-indigo",
        "text-indigo",
        "border-indigo",
        "#F8F7FF",
        "#0F172A",
        "#475569",
    ],
    "frontend/src/app/globals.css": [
        "#F8F7FF",
        "rgba(79, 70, 229",
        "shadow-indigo-glow",
        "border-indigo",
    ],
    "frontend/src/components/sidebar-nav.tsx": [
        "bg-pearl",
        "bg-indigo",
        "border-indigo",
        "#0F172A",
    ],
    "frontend/src/app/dashboard/page.tsx": [
        "bg-pearl",
        "bg-indigo",
        "border-indigo",
    ],
    "frontend/tailwind.config.ts": [
        "indigo: { DEFAULT:",
        "pearl: { DEFAULT:",
        "cyan: { DEFAULT: '#06B6D4'",
    ],
}

REQUIRED_BY_FILE: dict[str, list[str]] = {
    "frontend/src/app/globals.css": ["shadow-brand-glow"],
    "frontend/tailwind.config.ts": ["brand-glow"],
}

STITCH_HTML_REQUIRED = [
    "frontend/src/components/stitch-screen.tsx",
    "docs/project/stitch-applied-manifest.json",
]

STITCH_HTML_FORBIDDEN_IN_DASHBOARD = [
    "AppLayout",
    "SidebarNav",
]


def uses_stitch_html(project_root: Path) -> bool:
    manifest = project_root / "docs/project/stitch-applied-manifest.json"
    return manifest.exists()


def verify(project_root: Path) -> list[str]:
    errors: list[str] = []
    stitch_html = uses_stitch_html(project_root)

    check_files = dict(FORBIDDEN_BY_FILE)
    if stitch_html:
        check_files.pop("frontend/src/components/sidebar-nav.tsx", None)
        check_files["frontend/src/app/dashboard/page.tsx"] = [
            "bg-pearl",
            "bg-indigo",
            "border-indigo",
            "Versiyon Denetçisi",
            "documentTitle",
        ]

    for rel, forbidden in check_files.items():
        path = project_root / rel
        if not path.exists():
            if stitch_html and rel in (
                "frontend/src/components/sidebar-nav.tsx",
                "frontend/src/app/page.tsx",
            ):
                continue
            errors.append(f"Missing Stitch shell file: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in forbidden:
            if snippet in text:
                errors.append(f"{rel}: forbidden template token '{snippet}'")

    for rel, required in REQUIRED_BY_FILE.items():
        path = project_root / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in required:
            if snippet not in text:
                errors.append(f"{rel}: missing required Stitch token '{snippet}'")

    if stitch_html:
        for rel in STITCH_HTML_REQUIRED:
            if not (project_root / rel).exists():
                errors.append(f"Missing Stitch HTML artifact: {rel}")

        dash_page = project_root / "frontend/src/app/dashboard/page.tsx"
        if dash_page.exists():
            text = dash_page.read_text(encoding="utf-8")
            if "StitchScreen" not in text:
                errors.append("dashboard/page.tsx: must use StitchScreen when htmlCode is applied")
            for forbidden in STITCH_HTML_FORBIDDEN_IN_DASHBOARD:
                if forbidden in text:
                    errors.append(f"dashboard/page.tsx: must not use {forbidden} with Stitch HTML")

        tw = project_root / "frontend/tailwind.config.ts"
        if tw.exists():
            tw_text = tw.read_text(encoding="utf-8")
            for token in ("surface-container", "on-surface", "primary-container"):
                if token not in tw_text:
                    errors.append(f"tailwind.config.ts: missing Stitch color '{token}' from htmlCode")

        dash_layout = project_root / "frontend/src/app/dashboard/layout.tsx"
        if dash_layout.exists():
            layout_text = dash_layout.read_text(encoding="utf-8")
            if "AppLayout" in layout_text:
                errors.append("dashboard/layout.tsx: AppLayout wraps Stitch HTML — causes double sidebar")

    layout = project_root / "frontend/src/app/layout.tsx"
    stitch = project_root / "docs/project/STITCH_DESIGN_SYSTEM.json"
    if layout.exists() and stitch.exists():
        data = json.loads(stitch.read_text(encoding="utf-8"))
        colors = data.get("colors") or {}
        theme_block = {}
        sc = data.get("generateScreen", {}).get("result", {}).get("structuredContent", {})
        for comp in sc.get("outputComponents", []):
            ds = comp.get("designSystem", {}).get("designSystem", {})
            if ds.get("theme"):
                theme_block = ds["theme"]
                break
        color_mode = (colors.get("colorMode") or theme_block.get("colorMode") or "DARK").upper()
        layout_text = layout.read_text(encoding="utf-8")
        if color_mode == "DARK" and 'className="dark"' not in layout_text:
            errors.append("layout.tsx: Stitch colorMode is DARK but html class is not dark")
        if color_mode == "LIGHT" and 'className="light"' not in layout_text:
            errors.append("layout.tsx: Stitch colorMode is LIGHT but html class is not light")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: verify-stitch-fidelity.py <project-root>")
        return 1
    root = Path(sys.argv[1]).resolve()
    errors = verify(root)
    if errors:
        print("STITCH FIDELITY CHECK FAILED:")
        for err in errors:
            print(f"  - {err}")
        return 1
    print(f"Stitch fidelity OK: {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
