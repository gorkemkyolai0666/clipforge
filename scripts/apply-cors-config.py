#!/usr/bin/env python3
"""Apply shared CORS configuration to a project backend (template source of truth)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

CORS_IMPORT = "import { configureCors } from './cors.config';"
CORS_CALL = "  configureCors(app);"


def apply_cors_config(project_root: Path, template_root: Path | None = None) -> bool:
    project_root = project_root.resolve()
    if template_root is None:
        template_root = Path(__file__).resolve().parents[1]
        if template_root.name == "scripts":
            template_root = template_root.parent

    backend = project_root / "backend"
    main_ts = backend / "src/main.ts"
    cors_src = template_root / "backend/src/cors.config.ts"
    cors_dst = backend / "src/cors.config.ts"

    if not main_ts.exists():
        print(f"Skip CORS: missing {main_ts}")
        return False
    if not cors_src.exists():
        print(f"Skip CORS: missing template {cors_src}")
        return False

    cors_dst.parent.mkdir(parents=True, exist_ok=True)
    cors_dst.write_text(cors_src.read_text(encoding="utf-8"), encoding="utf-8")

    text = main_ts.read_text(encoding="utf-8")

    # Remove inline enableCors blocks (including multiline).
    text = re.sub(
        r"\n?\s*app\.enableCors\(\{[\s\S]*?\}\);\n?",
        "\n",
        text,
        count=1,
    )

    if CORS_IMPORT not in text:
        text = text.replace(
            "import { AppModule } from './app.module';",
            "import { AppModule } from './app.module';\n" + CORS_IMPORT,
        )

    if "configureCors(app)" not in text:
        text = re.sub(
            r"(const app = await NestFactory\.create\(AppModule\);\n)",
            r"\1\n" + CORS_CALL + "\n",
            text,
            count=1,
        )

    # Ensure CORS runs before global prefix.
    text = re.sub(
        r"(configureCors\(app\);\n)(\s*app\.setGlobalPrefix)",
        r"\1\n\2",
        text,
    )

    main_ts.write_text(text, encoding="utf-8")
    print(f"Applied CORS config: {cors_dst.relative_to(project_root)}")
    print(f"Patched: {main_ts.relative_to(project_root)}")
    return True


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: apply-cors-config.py <project-root> [template-root]")
        return 1
    root = Path(sys.argv[1])
    template = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    if not apply_cors_config(root, template):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
