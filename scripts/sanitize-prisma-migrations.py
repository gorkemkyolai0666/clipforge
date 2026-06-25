#!/usr/bin/env python3
"""Strip Prisma CLI banners accidentally captured in migration.sql files.

When `prisma migrate dev` stdout is redirected into migration.sql, the
"Update available" box-drawing banner becomes invalid SQL and breaks CI.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

# Box-drawing and similar decorative chars Prisma prints to stdout
BOX_CHAR_RE = re.compile(r"[┌┐└┘│─╔╗╚╝║═▲▼◀▶]")
PRISMA_BANNER_RE = re.compile(
    r"^\s*(Update available|Run the following to update|This is a major update)",
    re.IGNORECASE,
)


def sanitize_content(text: str) -> tuple[str, bool]:
    lines = text.splitlines()
    cleaned: list[str] = []
    changed = False

    for line in lines:
        if (
            BOX_CHAR_RE.search(line)
            or PRISMA_BANNER_RE.search(line)
            or "pris.ly/d/major-version-upgrade" in line
            or re.search(r"npm i --save-dev prisma@latest", line)
            or re.search(r"npm i @prisma/client@latest", line)
        ):
            changed = True
            break
        cleaned.append(line)

    result = "\n".join(cleaned).rstrip() + "\n"
    return result, changed or result != text


def sanitize_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    cleaned, changed = sanitize_content(original)
    if changed:
        path.write_text(cleaned, encoding="utf-8")
    return changed


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: sanitize-prisma-migrations.py <migrations-dir> [more-dirs...]")
        return 1

    total = 0
    for arg in sys.argv[1:]:
        root = Path(arg)
        if not root.exists():
            print(f"WARN: missing path {root}")
            continue
        for sql in sorted(root.rglob("migration.sql")):
            if sanitize_file(sql):
                total += 1
                print(f"Cleaned: {sql}")

    print(f"Done. {total} migration file(s) sanitized.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
