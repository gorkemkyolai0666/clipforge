import Link from 'next/link';
import { Layers, Check, ArrowRight } from 'lucide-react';

const tiers = [
  {
    id: 'starter',
    name: 'Başlangıç',
    price: 'Ücretsiz',
    period: '',
    description: 'Küçük ekipler ve bireysel projeler için.',
    features: ['3 klip', '5 kullanıcı', 'Temel kanban', '1 aktif sprint', 'E-posta desteği'],
    missing: ['Velocity planner', 'Bağımlılık grafiği', 'Burndown analitiği', 'SSO'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₺299',
    period: '/kullanıcı/ay',
    description: 'Büyüyen yazılım ekipleri için tam güç.',
    highlight: true,
    features: ['Sınırsız klip', '25 kullanıcı', 'Velocity-aware sprint planner', 'Cross-board bağımlılık grafiği', 'Burndown & velocity analitiği', 'AI sprint kredileri (50/ay)', 'Öncelikli destek'],
    missing: ['SSO/SAML', 'White-label'],
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 'Özel Paylaşım',
    period: '',
    description: 'Kurumsal IT ve çoklu workspace yönetimi.',
    features: ['Sınırsız kullanıcı & klip', 'SSO/SAML entegrasyonu', 'KVKK denetim raporları', 'API & webhook erişimi', 'Çoklu workspace', 'Özel hesap yöneticisi', 'White-label portal', 'SLA garantisi'],
    missing: [],
  },
];

const comparison = [
  { feature: 'Kanban klipları', starter: '3', pro: 'Sınırsız', enterprise: 'Sınırsız' },
  { feature: 'Kullanıcı limiti', starter: '5', pro: '25', enterprise: 'Sınırsız' },
  { feature: 'Velocity planner', starter: false, pro: true, enterprise: true },
  { feature: 'Bağımlılık grafiği', starter: false, pro: true, enterprise: true },
  { feature: 'Burndown analitiği', starter: false, pro: true, enterprise: true },
  { feature: 'KVKK denetim izi', starter: 'Temel', pro: 'Tam', enterprise: 'Tam + rapor' },
  { feature: 'SSO/SAML', starter: false, pro: false, enterprise: true },
  { feature: 'API erişimi', starter: false, pro: 'Kredi bazlı', enterprise: 'Sınırsız' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral text-primary-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-extrabold">ClipForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Giriş</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-coral-dark">
              Ücretsiz Başla <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Şeffaf paylaşımlandırma</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Jira Standard ($7.75/kullanıcı) ve Trello Premium ($5/kullanıcı) ile rekabetçi konumlandırma.
          ClipForge Pro: <span className="font-mono text-coral-light">₺299/kullanıcı/ay</span>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.id} className={t.highlight ? 'surface-card-accent p-7' : 'surface-card p-7'}>
              {t.highlight && <span className="mb-3 inline-block rounded-full bg-coral px-3 py-1 text-xs font-semibold text-primary-foreground">En popüler</span>}
              <h2 className="font-display text-xl font-bold">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-4xl font-bold">{t.price}</span>
                <span className="mb-1 text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral-light" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className={t.highlight
                ? 'mt-7 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-coral-dark'
                : 'mt-7 inline-flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted'}>
                {t.id === 'enterprise' ? 'İletişime Geç' : 'Başla'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-2xl font-bold">Özellik karşılaştırması</h2>
          <div className="mt-8 overflow-x-auto rounded-lg border border-border">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Özellik</th>
                  <th>Başlangıç</th>
                  <th>Pro</th>
                  <th>Kurumsal</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature}>
                    <td className="font-medium">{row.feature}</td>
                    {(['starter', 'pro', 'enterprise'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="font-mono text-sm">
                          {typeof val === 'boolean' ? (val ? <Check className="h-4 w-4 text-success" /> : '—') : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ClipForge · Tüm paylaşımlar KDV hariçtir.</p>
      </footer>
    </div>
  );
}
