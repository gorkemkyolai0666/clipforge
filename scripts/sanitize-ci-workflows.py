#!/usr/bin/env python3
"""Restore GitHub Actions workflow contexts after competitor-name transforms.

Build scripts that map titans (e.g. GitHub -> Google Docs) must never corrupt
.github/workflows/*.yml expressions like github.ref or github.event.repository.name.

Run this after every build-* transform and before committing project artifacts.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

# Competitor slug -> canonical GitHub Actions context prefix
CONTEXT_PREFIX_FIXES = [
    ("google-docs", "github"),
    ("gitlab", "github"),
    ("dropbox", "github"),
    ("notion", "github"),
    ("slack", "github"),
    ("linear", "github"),
    ("figma", "github"),
    ("shopify", "github"),
    ("uber", "github"),
    ("tinder", "github"),
    ("airtable", "github"),
    ("miro", "github"),
]

WORKFLOW_EXPRESSION_FIXES = [
    (r"\$\{\{\s*google-docs\.event\.docsitory\.name\s*\}\}", "${{ github.event.repository.name }}"),
    (r"\$\{\{\s*google-docs\.docsitory\s*\}\}", "${{ github.repository }}"),
    (r"\$\{\{\s*google-docs\.event\.repository\.name\s*\}\}", "${{ github.event.repository.name }}"),
    (r"\$\{\{\s*google-docs\.repository\s*\}\}", "${{ github.repository }}"),
    (r"\bgoogle-docs\.event\.docsitory\.name\b", "github.event.repository.name"),
    (r"\bgoogle-docs\.docsitory\b", "github.repository"),
    (r"\bgoogle-docs\.event\.repository\.name\b", "github.event.repository.name"),
    (r"\bgoogle-docs\.repository\b", "github.repository"),
    (r"\bgoogle-docs\.ref\b", "github.ref"),
    (r"\bgoogle-docs\.event_name\b", "github.event_name"),
    (r"\$\{\{\s*google-docs\.", "${{ github."),
    (r"\bif:\s*google-docs\.", "if: github."),
]

API_FIXES = [
    ("https://api.google-docs.com/", "https://api.github.com/"),
    ("application/vnd.google-docs+json", "application/vnd.github+json"),
    ("https://google-docs.com/", "https://github.com/"),
]

REQUIRED_SNIPPETS = [
    "if: github.ref == 'refs/heads/main' && github.event_name == 'push'",
    "PROJECT_NAME: ${{ github.event.repository.name }}",
    "GITHUB_REPOSITORY: ${{ github.repository }}",
]


def sanitize_text(text: str) -> str:
    for old, new in CONTEXT_PREFIX_FIXES:
        text = re.sub(rf"\$\{{\{{\s*{re.escape(old)}\.", "${{ github.", text)
        text = re.sub(rf"\b{re.escape(old)}\.", f"{new}.", text)

    for pattern, replacement in WORKFLOW_EXPRESSION_FIXES:
        text = re.sub(pattern, replacement, text)

    # repo -> doc transform side effect inside "repository"
    text = text.replace("docsitory", "repository")

    for old, new in API_FIXES:
        text = text.replace(old, new)

    return text


def sanitize_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = sanitize_text(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        print(f"Sanitized: {path}")
        return True
    return False


def sanitize_project(root: Path) -> int:
    changed = 0
    workflows = root / ".github" / "workflows"
    if workflows.is_dir():
        for yml in sorted(workflows.glob("*.yml")):
            if sanitize_file(yml):
                changed += 1
        for yaml in sorted(workflows.glob("*.yaml")):
            if sanitize_file(yaml):
                changed += 1

    create_repo = root / "scripts" / "create-repo.js"
    if create_repo.is_file() and sanitize_file(create_repo):
        changed += 1

    return changed


def verify_ci_workflow(root: Path) -> list[str]:
    errors: list[str] = []
    ci = root / ".github" / "workflows" / "ci.yml"
    if not ci.is_file():
        return errors

    text = ci.read_text(encoding="utf-8")
    for snippet in REQUIRED_SNIPPETS:
        if snippet not in text:
            errors.append(f"Missing required CI snippet: {snippet}")

    if re.search(r"\bgoogle-docs\.", text):
        errors.append("ci.yml still contains google-docs.* context")

    if "docsitory" in text:
        errors.append("ci.yml still contains corrupted docsitory token")

    return errors


def main() -> int:
    roots = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else [Path(".")]
    total = 0
    failed = False

    for root in roots:
        total += sanitize_project(root)
        errors = verify_ci_workflow(root)
        for err in errors:
            print(f"ERROR [{root}]: {err}", file=sys.stderr)
            failed = True

    print(f"Done. {total} workflow file(s) sanitized.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
