#!/usr/bin/env python3
"""Verify Stitch tokens are applied — re-runs stitch_frontend globals if stale.

apply-stitch-tokens.py no longer patches light-only :root vars (that broke DARK Stitch themes).
The source of truth is stitch_frontend.py which reads STITCH_DESIGN_SYSTEM.json end-to-end.
"""
from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: apply-stitch-tokens.py <project-root>")
        return 1
    root = Path(sys.argv[1]).resolve()
    css = root / "frontend/src/app/globals.css"
    if not css.exists():
        print(f"Missing {css}")
        return 1

    text = css.read_text(encoding="utf-8")
    if "shadow-brand-glow" in text and "forge-hero" in text:
        print(f"Stitch tokens already applied in {css} — skipping legacy patch")
        return 0

    stitch_script = root / "scripts/stitch_frontend.py"
    if not stitch_script.exists():
        stitch_script = Path(__file__).resolve().parent / "stitch_frontend.py"
    if stitch_script.exists():
        import subprocess
        print("Stale CSS detected — regenerating via stitch_frontend.py")
        return subprocess.call(["python3", str(stitch_script), str(root)])

    print(f"Warning: could not verify Stitch tokens in {css}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
