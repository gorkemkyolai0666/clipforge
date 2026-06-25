#!/usr/bin/env python3
"""Generate Stitch-faithful Next.js frontend from stitch-frontend.config.json + STITCH_DESIGN_SYSTEM.json.

Every generated component uses semantic tokens derived from the live Stitch payload —
never hardcoded indigo/cyan/pearl template colors.

Usage:
  python3 stitch_frontend.py <project-root>
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

CONFIG_REL = Path("docs/project/stitch-frontend.config.json")
STITCH_REL = Path("docs/project/STITCH_DESIGN_SYSTEM.json")
STITCH_FALLBACK = Path("stitch_output.json")

FONT_REGISTRY: dict[str, tuple[str, str, list[str]]] = {
    "SORA": ("Sora", "sora", ["latin", "latin-ext"]),
    "JETBRAINS_MONO": ("JetBrains_Mono", "jetbrains-mono", ["latin", "latin-ext"]),
    "DM_SANS": ("DM_Sans", "dm-sans", ["latin", "latin-ext"]),
    "IBM_PLEX_MONO": ("IBM_Plex_Mono", "ibm-plex-mono", ["latin", "latin-ext"]),
    "INTER": ("Inter", "inter", ["latin", "latin-ext"]),
}


@dataclass
class StitchTokens:
    background: str
    surface: str
    accent: str
    secondary: str
    foreground: str
    muted_foreground: str
    color_mode: str
    headline_font: str
    body_font: str
    mono_font: str

    @property
    def is_dark(self) -> bool:
        return self.color_mode.upper() == "DARK"

    @property
    def default_theme(self) -> str:
        return "dark" if self.is_dark else "light"


def hex_to_hsl(hex_color: str) -> str:
    hex_color = hex_color.lstrip("#")
    r, g, b = (int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        h = s = 0.0
    else:
        d = mx - mn
        s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
        if mx == r:
            h = (g - b) / d + (6 if g < b else 0)
        elif mx == g:
            h = (b - r) / d + 2
        else:
            h = (r - g) / d + 4
        h /= 6
    return f"{round(h * 360)} {round(s * 100)}% {round(l * 100)}%"


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
    )


def darken_hex(hex_color: str, factor: float = 0.82) -> str:
    r, g, b = hex_to_rgb(hex_color)
    return f"#{int(r * factor):02x}{int(g * factor):02x}{int(b * factor):02x}"


def extract_theme_block(data: dict) -> dict:
    sc = data.get("generateScreen", {}).get("result", {}).get("structuredContent", {})
    for comp in sc.get("outputComponents", []):
        ds = comp.get("designSystem", {}).get("designSystem", {})
        if ds.get("theme"):
            return ds["theme"]
    return {}


def load_stitch_tokens(project_root: Path) -> StitchTokens:
    for rel in (STITCH_REL, STITCH_FALLBACK):
        stitch_file = project_root / rel
        if not stitch_file.exists():
            continue
        data = json.loads(stitch_file.read_text(encoding="utf-8"))
        colors = data.get("colors") or {}
        theme = extract_theme_block(data)
        named = theme.get("namedColors") or {}

        background = (
            colors.get("background")
            or theme.get("overrideNeutralColor")
            or named.get("background", "#0A1628")
        )
        surface = (
            colors.get("surface")
            or theme.get("overrideTertiaryColor")
            or named.get("surface_container", "#132F38")
        )
        accent = colors.get("accent") or theme.get("customColor") or theme.get("overridePrimaryColor") or "#FF6B4A"
        secondary = colors.get("secondary") or theme.get("overrideSecondaryColor") or "#FFB020"
        foreground = named.get("on_background") or named.get("on_surface") or ("#E2E8F0" if theme.get("colorMode") == "DARK" else "#0F172A")
        muted = named.get("on_surface_variant") or ("#94A3B8" if theme.get("colorMode") == "DARK" else "#475569")
        color_mode = colors.get("colorMode") or theme.get("colorMode") or "DARK"

        return StitchTokens(
            background=background,
            surface=surface,
            accent=accent,
            secondary=secondary,
            foreground=foreground,
            muted_foreground=muted,
            color_mode=color_mode,
            headline_font=theme.get("headlineFont") or theme.get("font") or "SORA",
            body_font=theme.get("bodyFont") or theme.get("font") or "SORA",
            mono_font=theme.get("labelFont") or "JETBRAINS_MONO",
        )

    return StitchTokens(
        background="#0A1628",
        surface="#132F38",
        accent="#FF6B4A",
        secondary="#FFB020",
        foreground="#E2E8F0",
        muted_foreground="#94A3B8",
        color_mode="DARK",
        headline_font="SORA",
        body_font="SORA",
        mono_font="JETBRAINS_MONO",
    )


def load_config(project_root: Path) -> dict[str, Any]:
    config_path = project_root / CONFIG_REL
    if not config_path.exists():
        raise FileNotFoundError(f"Missing {config_path}")
    return json.loads(config_path.read_text(encoding="utf-8"))


def ts(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def font_spec(key: str) -> tuple[str, str, list[str]]:
    return FONT_REGISTRY.get(key.upper().replace(" ", "_"), FONT_REGISTRY["SORA"])


def collect_icons(*sections: list[dict]) -> list[str]:
    icons: set[str] = {"Layers", "ArrowRight", "Check"}
    for section in sections:
        for item in section:
            if icon := item.get("icon"):
                icons.add(icon)
    return sorted(icons)


def write_layout(fe: Path, cfg: dict, tokens: StitchTokens) -> None:
    body_spec = font_spec(tokens.body_font)
    mono_spec = font_spec(tokens.mono_font)
    html_class = tokens.default_theme

    content = f"""import type {{ Metadata }} from 'next';
import {{ {body_spec[0]} }} from 'next/font/google';
import {{ {mono_spec[0]} }} from 'next/font/google';
import {{ AuthProvider }} from '@/lib/auth-context';
import {{ ThemeProvider }} from '@/lib/theme-context';
import {{ ToastProvider }} from '@/lib/toast-context';
import './globals.css';

const bodyFont = {body_spec[0]}({{
  subsets: {json.dumps(body_spec[2])},
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
}});

const monoFont = {mono_spec[0]}({{
  subsets: {json.dumps(mono_spec[2])},
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
}});

export const metadata: Metadata = {{
  title: {ts(cfg.get('meta', {}).get('title', cfg['displayName']))},
  description: {ts(cfg.get('meta', {}).get('description', ''))},
}};

export default function RootLayout({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <html lang="tr" className="{html_class}" suppressHydrationWarning>
      <body className={{`${{bodyFont.variable}} ${{monoFont.variable}} font-sans`}}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{{children}}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}}
"""
    (fe / "src/app/layout.tsx").write_text(content, encoding="utf-8")


def write_theme_context(fe: Path, cfg: dict, tokens: StitchTokens) -> None:
    theme_key = cfg.get("themeKey", f"{cfg['projectSlug']}_theme")
    default = tokens.default_theme
    content = f"""'use client';
import React, {{ createContext, useContext, useEffect, useState }} from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{{ theme: Theme; toggleTheme: () => void }} | null>(null);

export function ThemeProvider({{ children }}: {{ children: React.ReactNode }}) {{
  const [theme, setTheme] = useState<Theme>('{default}');

  useEffect(() => {{
    const saved = (localStorage.getItem({ts(theme_key)}) as Theme) || '{default}';
    setTheme(saved);
    document.documentElement.classList.toggle('light', saved === 'light');
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }}, []);

  const toggleTheme = () => {{
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem({ts(theme_key)}, next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  }};

  return <ThemeContext.Provider value={{{{ theme, toggleTheme }}}}>{{children}}</ThemeContext.Provider>;
}}

export function useTheme() {{
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}}
"""
    (fe / "src/lib/theme-context.tsx").write_text(content, encoding="utf-8")


def write_globals_css(fe: Path, tokens: StitchTokens) -> None:
    bg = hex_to_hsl(tokens.background)
    surface = hex_to_hsl(tokens.surface)
    accent = hex_to_hsl(tokens.accent)
    secondary = hex_to_hsl(tokens.secondary)
    fg = hex_to_hsl(tokens.foreground)
    muted = hex_to_hsl(tokens.muted_foreground)
    ar, ag, ab = hex_to_rgb(tokens.accent)
    sr, sg, sb = hex_to_rgb(tokens.secondary)
    accent_dark = darken_hex(tokens.accent)

    if tokens.is_dark:
        root_block = f"""  :root {{
    --background: {bg};
    --foreground: {fg};
    --card: {surface};
    --card-foreground: {fg};
    --primary: {accent};
    --primary-foreground: 0 0% 100%;
    --secondary: {secondary};
    --secondary-foreground: 216 60% 10%;
    --muted: {surface};
    --muted-foreground: {muted};
    --accent: {secondary};
    --accent-foreground: 216 60% 10%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --success: 152 58% 45%;
    --success-foreground: 0 0% 100%;
    --warning: {secondary};
    --warning-foreground: 216 60% 10%;
    --border: 200 20% 22%;
    --input: {surface};
    --ring: {accent};
    --radius: 0.75rem;
  }}

  .light {{
    --background: 240 20% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: {accent};
    --primary-foreground: 0 0% 100%;
    --secondary: {secondary};
    --secondary-foreground: 0 0% 100%;
    --muted: 240 20% 96%;
    --muted-foreground: 215 16% 40%;
    --accent: {secondary};
    --accent-foreground: 0 0% 100%;
    --border: 240 20% 90%;
    --input: 0 0% 100%;
    --ring: {accent};
  }}"""
        hero_bg = tokens.background
        glass_bg = f"rgba({hex_to_rgb(tokens.surface)[0]}, {hex_to_rgb(tokens.surface)[1]}, {hex_to_rgb(tokens.surface)[2]}, 0.72)"
    else:
        root_block = f"""  :root {{
    --background: 240 20% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: {accent};
    --primary-foreground: 0 0% 100%;
    --secondary: {secondary};
    --secondary-foreground: 0 0% 100%;
    --muted: 240 20% 96%;
    --muted-foreground: {muted};
    --accent: {secondary};
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --success: 152 58% 45%;
    --success-foreground: 0 0% 100%;
    --warning: {secondary};
    --warning-foreground: 222 47% 11%;
    --border: 240 20% 90%;
    --input: 0 0% 100%;
    --ring: {accent};
    --radius: 0.75rem;
  }}

  .dark {{
    --background: {bg};
    --foreground: {fg};
    --card: {surface};
    --card-foreground: {fg};
    --primary: {accent};
    --primary-foreground: 0 0% 100%;
    --secondary: {secondary};
    --secondary-foreground: 216 60% 10%;
    --muted: {surface};
    --muted-foreground: {muted};
    --accent: {secondary};
    --accent-foreground: 216 60% 10%;
    --border: 200 20% 22%;
    --input: {surface};
    --ring: {accent};
  }}"""
        hero_bg = tokens.background if tokens.is_dark else "#F8F7FF"
        glass_bg = f"rgba({hex_to_rgb(tokens.surface)[0]}, {hex_to_rgb(tokens.surface)[1]}, {hex_to_rgb(tokens.surface)[2]}, 0.72)"

    body_font = font_spec(tokens.body_font)[1]
    mono_font = font_spec(tokens.mono_font)[1]

    content = f"""@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {{
{root_block}

  * {{ @apply border-border; }}
  body {{
    @apply bg-background text-foreground antialiased;
    font-family: var(--font-body), '{body_font.replace("-", " ").title()}', system-ui, sans-serif;
  }}
  h1, h2, h3, h4, .font-display {{
    font-family: var(--font-body), '{body_font.replace("-", " ").title()}', system-ui, sans-serif;
  }}
  .font-mono {{
    font-family: var(--font-mono), '{mono_font.replace("-", " ").title()}', monospace;
  }}
}}

@layer components {{
  .glass-card {{
    @apply rounded-xl border border-white/10 shadow-brand-glow backdrop-blur-md;
    background: {glass_bg};
  }}
  .surface-card {{
    @apply glass-card transition-all duration-200 ease-in-out;
  }}
  .forge-hero {{
    @apply relative overflow-hidden bg-background;
    background-image:
      radial-gradient(ellipse at 20% 30%, rgba({ar}, {ag}, {ab}, 0.18) 0%, transparent 52%),
      radial-gradient(ellipse at 80% 70%, rgba({sr}, {sg}, {sb}, 0.12) 0%, transparent 48%);
  }}
  .doc-page {{
    @apply mx-auto max-w-3xl rounded-xl border border-border bg-card p-10 shadow-brand-glow;
  }}
  .conflict-inbox-card {{
    @apply glass-card border-l-4 border-l-primary p-6;
  }}
  .input-field {{
    @apply flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30;
  }}
  .btn-primary {{
    @apply inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand-glow transition-all duration-200 hover:opacity-90;
  }}
  .surface-card-accent {{
    @apply surface-card border-primary/40 ring-2 ring-primary/20;
  }}
}}
"""
    (fe / "src/app/globals.css").write_text(content, encoding="utf-8")


def write_tailwind(fe: Path, tokens: StitchTokens) -> None:
    accent_dark = darken_hex(tokens.accent)
    body_font = font_spec(tokens.body_font)[1]
    mono_font = font_spec(tokens.mono_font)[1]
    ar, ag, ab = hex_to_rgb(tokens.accent)

    content = f"""import type {{ Config }} from 'tailwindcss';

const config: Config = {{
  content: ['./src/**/*.{{js,ts,jsx,tsx,mdx}}'],
  darkMode: 'class',
  theme: {{
    extend: {{
      fontFamily: {{
        sans: ['var(--font-body)', '{body_font.replace("-", " ").title()}', 'system-ui', 'sans-serif'],
        display: ['var(--font-body)', '{body_font.replace("-", " ").title()}', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '{mono_font.replace("-", " ").title()}', 'monospace'],
      }},
      colors: {{
        brand: {{
          DEFAULT: '{tokens.accent}',
          dark: '{accent_dark}',
          light: '{tokens.accent}',
          surface: '{tokens.surface}',
          bg: '{tokens.background}',
        }},
        coral: {{
          DEFAULT: '{tokens.accent}',
          dark: '{accent_dark}',
          light: '{tokens.accent}',
        }},
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {{ DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' }},
        secondary: {{ DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' }},
        destructive: {{ DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' }},
        muted: {{ DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' }},
        accent: {{ DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' }},
        card: {{ DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' }},
        success: {{ DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' }},
        warning: {{ DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' }},
      }},
      borderRadius: {{
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      }},
      boxShadow: {{
        'brand-glow': '0 10px 30px -8px rgba({ar}, {ag}, {ab}, 0.35)',
        'accent-glow': '0 0 16px rgba({ar}, {ag}, {ab}, 0.45)',
      }},
    }},
  }},
  plugins: [],
}};

export default config;
"""
    (fe / "tailwind.config.ts").write_text(content, encoding="utf-8")


def write_landing_page(fe: Path, cfg: dict) -> None:
    landing = cfg["landing"]
    display = cfg["displayName"]
    company = cfg["companyName"]
    demo = cfg["demoEmail"]
    features = landing.get("features", [])
    plans = landing.get("plans", [])
    icons = collect_icons(features)

    feature_lines = []
    for f in features:
        feature_lines.append(
            f"  {{ icon: {f['icon']}, title: {ts(f['title'])}, desc: {ts(f['desc'])} }},"
        )
    features_block = "\n".join(feature_lines)

    plan_blocks = []
    for p in plans:
        items = ", ".join(ts(i) for i in p.get("items", []))
        plan_blocks.append(f"""  {{
    name: {ts(p['name'])},
    price: {ts(p['price'])},
    period: {ts(p.get('period', ''))},
    highlight: {'true' if p.get('highlight') else 'false'},
    items: [{items}],
  }},""")
    plans_block = "\n".join(plan_blocks)

    content = f"""import Link from 'next/link';
import {{ {', '.join(icons)} }} from 'lucide-react';

const features = [
{features_block}
];

const plans = [
{plans_block}
];

export default function LandingPage() {{
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-brand-glow">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">{display}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
              Fiyatlandırma
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Giriş
            </Link>
            <Link href="/register" className="btn-primary">
              Ücretsiz Başla <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="forge-hero">
        <div className="mx-auto max-w-6xl px-8 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/60 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            {landing.get('heroBadge', '')}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {landing.get('heroTitlePrefix', '')}{' '}
            <span className="text-primary">{landing.get('heroHighlight', '')}</span>{' '}
            {landing.get('heroTitleSuffix', '')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {landing.get('heroSubtitle', '')}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base">
              Ücretsiz Başla <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-card/60 px-8 py-3.5 text-base font-semibold text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary/60"
            >
              Fiyatlandırma
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">
            {landing.get('featuresSectionTitle', '')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            {landing.get('featuresSectionSubtitle', '')}
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {{features.map((f) => {{
              const Icon = f.icon;
              return (
                <div key={{f.title}} className="surface-card p-6 hover:shadow-accent-glow">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{{f.title}}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{{f.desc}}</p>
                </div>
              );
            }})}}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">Basit, şeffaf fiyatlandırma</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {{plans.map((p) => (
              <div
                key={{p.name}}
                className={{`surface-card p-8 ${{p.highlight ? 'border-primary/40 ring-2 ring-primary/20' : ''}}`}}
              >
                {{p.highlight && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    En Popüler
                  </span>
                )}}
                <h3 className="font-display text-xl font-bold text-foreground">{{p.name}}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-foreground">{{p.price}}</span>
                  <span className="text-muted-foreground">{{p.period}}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {{p.items.map((item) => (
                    <li key={{item}} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      {{item}}
                    </li>
                  ))}}
                </ul>
                <Link
                  href="/register"
                  className={{`mt-8 block rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-200 ${{
                    p.highlight
                      ? 'bg-primary text-primary-foreground shadow-brand-glow hover:opacity-90'
                      : 'border border-primary/40 text-primary hover:border-primary/60'
                  }}`}}
                >
                  Başla
                </Link>
              </div>
            ))}}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 {display} — {company} · {demo}</p>
      </footer>
    </div>
  );
}}
"""
    (fe / "src/app/page.tsx").write_text(content, encoding="utf-8")


def nav_items_ts(items: list[dict]) -> str:
    lines = []
    for item in items:
        badge = ", badge: true" if item.get("badge") else ""
        lines.append(
            f"  {{ href: {ts(item['href'])}, label: {ts(item['label'])}, icon: {item['icon']}{badge} }},"
        )
    return "\n".join(lines)


def write_sidebar(fe: Path, cfg: dict) -> None:
    sidebar = cfg["sidebar"]
    display = cfg["displayName"]
    tagline = cfg.get("tagline", "Premium Akıl")
    nav_icons = collect_icons(
        sidebar.get("navItems", []),
        sidebar.get("bottomItems", []),
        [{"icon": "Plus"}],
    )
    extra = {"FileText", "Inbox", "FolderOpen", "Archive", "Settings", "HelpCircle", "Moon", "Sun", "LogOut", "Menu", "X", "Plus", "Video"}
    all_icons = sorted(set(nav_icons) | extra)

    content = f"""'use client';
import Link from 'next/link';
import {{ usePathname, useRouter }} from 'next/navigation';
import {{ useAuth }} from '@/lib/auth-context';
import {{ useTheme }} from '@/lib/theme-context';
import {{ cn, label }} from '@/lib/utils';
import {{ {', '.join(all_icons)} }} from 'lucide-react';
import {{ useState }} from 'react';

const navItems = [
{nav_items_ts(sidebar.get('navItems', []))}
];

const bottomItems = [
{nav_items_ts(sidebar.get('bottomItems', []))}
];

export function SidebarNav({{ children }}: {{ children: React.ReactNode }}) {{
  const pathname = usePathname();
  const router = useRouter();
  const {{ user, logout }} = useAuth();
  const {{ theme, toggleTheme }} = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({{ items, mobile = false }}: {{ items: typeof navItems; mobile?: boolean }}) => (
    <>
      {{items.map((item) => {{
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={{item.href}}
            href={{item.href}}
            onClick={{() => mobile && setMobileOpen(false)}}
            className={{cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
            )}}
          >
            <Icon className={{cn('h-4 w-4', active && 'text-primary')}} />
            <span className="flex-1">{{item.label}}</span>
            {{'badge' in item && item.badge && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}}
          </Link>
        );
      }})}}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border p-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-brand-glow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-foreground">{display}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{tagline}</div>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <button className="btn-primary w-full">
            <Plus className="h-4 w-4" />
            {sidebar.get('primaryAction', 'Yeni')}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          <NavLinks items={{navItems}} />
        </nav>

        <div className="border-t border-border p-3">
          <NavLinks items={{bottomItems}} />
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
              {{user?.name}} · {{user?.role ? label('userRole', user.role) : ''}}
            </div>
            <div className="flex gap-2 px-1">
              <button
                onClick={{toggleTheme}}
                className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40"
                aria-label="Tema değiştir"
              >
                {{theme === 'dark' ? <Sun className="mx-auto h-4 w-4" /> : <Moon className="mx-auto h-4 w-4" />}}
              </button>
              <button
                onClick={{() => {{ logout(); router.push('/login'); }}}}
                className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                aria-label="Çıkış yap"
              >
                <LogOut className="mx-auto h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md lg:hidden">
          <Link href="/dashboard" className="font-display font-bold text-foreground">{display}</Link>
          <button onClick={{() => setMobileOpen(!mobileOpen)}} aria-label="Menü">
            {{mobileOpen ? <X size={{20}} /> : <Menu size={{20}} />}}
          </button>
        </header>
        {{mobileOpen && (
          <nav className="border-b border-border bg-card p-3 lg:hidden">
            <NavLinks items={{navItems}} mobile />
          </nav>
        )}}
        <main className="flex flex-1 flex-col overflow-hidden p-8">{{children}}</main>
      </div>
    </div>
  );
}}
"""
    (fe / "src/components/sidebar-nav.tsx").write_text(content, encoding="utf-8")


def write_dashboard(fe: Path, cfg: dict) -> None:
    ws = cfg["workspace"]
    display = cfg["displayName"]
    paragraphs = ws.get("paragraphs", [])
    para_blocks = "\n".join(
        f"              <p>{p.replace('&', '&amp;').replace(chr(39), '&apos;')}</p>" for p in paragraphs
    )
    conflict = ws.get("conflictInbox", {})
    line_chips = "\n".join(
        f'              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">{line}</span>'
        for line in conflict.get("lines", [])
    )
    version_blocks = []
    for v in ws.get("versions", []):
        version_blocks.append(f"""  {{
    id: {ts(v['id'])},
    label: {ts(v['label'])},
    desc: {ts(v['desc'])},
    author: {ts(v['author'])},
    time: {ts(v['time'])},
    current: {'true' if v.get('current') else 'false'},
  }},""")
    versions_block = "\n".join(version_blocks)
    code_snippet = ws.get("codeSnippet", "").replace("`", "\\`")

    content = f"""'use client';
import {{ useState }} from 'react';
import {{ Bell, Clock, GitBranch, History, RotateCcw, User }} from 'lucide-react';
import {{ cn }} from '@/lib/utils';

const versions = [
{versions_block}
];

const tabs = [
  {{ id: 'history', label: 'Geçmiş', icon: History }},
  {{ id: 'compare', label: 'Karşılaştır', icon: GitBranch }},
  {{ id: 'undo', label: 'Geri Al', icon: RotateCcw }},
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function DashboardPage() {{
  const [activeTab, setActiveTab] = useState<TabId>('history');

  return (
    <div className="flex h-full flex-1 flex-col rounded-xl border border-border bg-card/40">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold text-foreground">{display}</span>
          <nav className="hidden items-center gap-4 text-muted-foreground sm:flex">
            <button className="hover:text-foreground">Dosya</button>
            <button className="hover:text-foreground">Düzenle</button>
            <button className="hover:text-foreground">Görünüm</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Geçmiş">
            <Clock className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Bildirimler">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-4 w-4" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto bg-background p-6">
          <div className="doc-page">
            <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              {ws.get('documentTitle', '')}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-secondary">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-secondary" />
              {ws.get('presenceText', '')}
            </p>

            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
{para_blocks}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-brand-bg p-4">
              <pre className="font-mono text-sm leading-relaxed text-secondary">
                <code>{{`{code_snippet}`}}</code>
              </pre>
            </div>
          </div>

          <div className="conflict-inbox-card mx-auto mt-6 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-secondary">
                  {conflict.get('label', 'Gelen Kutusu')}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{conflict.get('summary', '')}</p>
              </div>
              <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">{conflict.get('severity', '')}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
{line_chips}
            </div>
            <button className="btn-primary mt-4">
              {conflict.get('actionLabel', 'Otomatik Birleştir')}
            </button>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-card lg:flex">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Versiyon Denetçisi</h2>
            </div>
            <div className="mt-3 flex gap-1">
              {{tabs.map((tab) => {{
                const Icon = tab.icon;
                return (
                  <button
                    key={{tab.id}}
                    onClick={{() => setActiveTab(tab.id)}}
                    className={{cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-primary/5',
                    )}}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {{tab.label}}
                  </button>
                );
              }})}}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {{activeTab === 'history' && (
              <ul className="space-y-4">
                {{versions.map((v) => (
                  <li
                    key={{v.id}}
                    className={{cn(
                      'relative rounded-xl border p-4 transition-all duration-200',
                      v.current
                        ? 'border-primary/40 bg-primary/10 shadow-brand-glow'
                        : 'border-border hover:border-primary/20',
                    )}}
                  >
                    {{v.current && (
                      <span className="absolute -left-px top-4 h-8 w-1 rounded-r bg-primary" />
                    )}}
                    <p className="font-mono text-xs font-semibold text-primary">{{v.label}}</p>
                    <p className="mt-1 text-sm text-foreground">{{v.desc}}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {{v.author}} · {{v.time}}
                    </p>
                  </li>
                ))}}
              </ul>
            )}}
            {{activeTab === 'compare' && (
              <p className="text-sm text-muted-foreground">
                İki sürüm seçerek farkları karşılaştırın.
              </p>
            )}}
            {{activeTab === 'undo' && (
              <p className="text-sm text-muted-foreground">
                Son değişiklikleri geri almak için bir sürüm seçin.
              </p>
            )}}
          </div>
        </aside>
      </div>
    </div>
  );
}}
"""
    (fe / "src/app/dashboard/page.tsx").write_text(content, encoding="utf-8")


def stitch_has_html_code(project_root: Path) -> bool:
    for rel in (STITCH_REL, STITCH_FALLBACK):
        path = project_root / rel
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        sc = data.get("generateScreen", {}).get("result", {}).get("structuredContent", {})
        for comp in sc.get("outputComponents", []):
            for screen in comp.get("design", {}).get("screens", []):
                if (screen.get("htmlCode") or {}).get("downloadUrl"):
                    return True
    return False


def apply_stitch_html_screens(project_root: Path) -> list[str]:
    """Apply Stitch htmlCode screens when stitch_apply_html.py is available."""
    apply_script = Path(__file__).resolve().parent / "stitch_apply_html.py"
    if not apply_script.exists():
        return []
    import subprocess

    result = subprocess.run(
        [sys.executable, str(apply_script), str(project_root)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError("stitch_apply_html.py failed")
    print(result.stdout.strip())
    manifest = project_root / "docs/project/stitch-applied-manifest.json"
    if manifest.exists():
        data = json.loads(manifest.read_text(encoding="utf-8"))
        return list(data.get("routes", [])) + ["docs/project/stitch-applied-manifest.json"]
    return []


def generate_stitch_frontend(project_root: Path) -> list[str]:
    project_root = project_root.resolve()
    fe = project_root / "frontend"
    if not fe.exists():
        raise FileNotFoundError(f"Missing frontend directory: {fe}")

    cfg = load_config(project_root)
    tokens = load_stitch_tokens(project_root)

    write_layout(fe, cfg, tokens)
    write_theme_context(fe, cfg, tokens)
    write_globals_css(fe, tokens)
    write_tailwind(fe, tokens)

    stitch_cfg = cfg.get("stitchScreens") or {}
    use_html = stitch_cfg.get("enabled", True)
    stitch_data = project_root / STITCH_REL
    has_html = stitch_data.exists() and any(
        s.get("htmlCode", {}).get("downloadUrl")
        for comp in json.loads(stitch_data.read_text()).get("generateScreen", {})
        .get("result", {})
        .get("structuredContent", {})
        .get("outputComponents", [])
        for s in comp.get("design", {}).get("screens", [])
    ) if stitch_data.exists() else False

    files = [
        "frontend/src/app/layout.tsx",
        "frontend/src/lib/theme-context.tsx",
        "frontend/src/app/globals.css",
        "frontend/tailwind.config.ts",
    ]

    if use_html and has_html:
        html_files = apply_stitch_html_screens(project_root)
        files.extend(html_files)
        files.extend([
            "frontend/src/components/stitch-screen.tsx",
            "frontend/src/app/dashboard/layout.tsx",
        ])
    else:
        write_landing_page(fe, cfg)
        write_sidebar(fe, cfg)
        write_dashboard(fe, cfg)
        files.extend([
            "frontend/src/app/page.tsx",
            "frontend/src/components/sidebar-nav.tsx",
            "frontend/src/app/dashboard/page.tsx",
        ])

    return files


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: stitch_frontend.py <project-root>")
        return 1
    root = Path(sys.argv[1])
    try:
        files = generate_stitch_frontend(root)
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    print(f"Generated Stitch-faithful frontend ({len(files)} files) in {root}")
    for f in files:
        print(f"  - {f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
