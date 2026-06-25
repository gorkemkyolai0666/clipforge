#!/usr/bin/env python3
"""Remove files that break Vercel/Railway deploys if accidentally committed."""
from __future__ import annotations

import sys
from pathlib import Path

RESERVED_VERCEL_FILE = Path("frontend/.vercel")


def sanitize_project(root: Path) -> bool:
    target = root / RESERVED_VERCEL_FILE
    if target.is_file():
        target.unlink()
        print(f"Removed reserved file: {target}")
        return True
    return False


def main() -> int:
    roots = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else [Path(".")]
    removed = 0
    for root in roots:
        if sanitize_project(root):
            removed += 1
    print(f"Done. {removed} project(s) sanitized.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
