import Link from 'next/link';
import { ArrowRight, Check, GitBranch, Layers, MessageSquare, Shield, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  { icon: Sparkles, title: "İzleyici Drop-off Inbox", desc: "Eşzamanlı düzenlemeleri otomatik kümeleme ile önceliklendirin — çakışma fişleri, önem derecesi rozetleri ve otomatik birleştirme önerileri." },
  { icon: TrendingUp, title: "Sahne Bölüm Blast Radius", desc: "Klip × bölüm ısı haritası, etki alanı severity renkleri ve işbirliği etki puanı — regression riskini anında görün." },
  { icon: GitBranch, title: "Embed Cascade Radarı", desc: "İzin değişikliklerinde bağlı kliplerde downstream etki önizlemesi — paylaşım kırılmalarını önleyin." },
  { icon: MessageSquare, title: "Versiyon Denetçisi", desc: "Geçmiş, karşılaştır ve geri al sekmeleriyle tam sürüm kontrolü — her değişiklik kim tarafından, ne zaman." },
  { icon: Shield, title: "KVKK Uyumlu Denetim İzi", desc: "Her klip değişikliği ve paylaşım kararı kayıt altında — kurumsal compliance hazır." },
  { icon: Layers, title: "Gerçek Zamanlı İşbirliği", desc: "Presence göstergeleri, cyan-threaded düzenleme izleri ve AI destekli analiz — tek workspace'te." },
];

const plans = [
  {
    name: "Başlangıç",
    price: "Ücretsiz",
    period: "",
    highlight: false,
    items: ["5 klip", "3 kullanıcı", "Temel çakışma inbox", "Sürüm geçmişi", "E-posta desteği"],
  },
  {
    name: "Pro",
    price: "₺549",
    period: "/ay",
    highlight: true,
    items: ["Sınırsız klip", "25 kullanıcı", "Blast radius heatmap", "Otomatik birleştirme", "AI analiz kredileri", "Öncelikli destek"],
  },
  {
    name: "Kurumsal",
    price: "Özel",
    period: "",
    highlight: false,
    items: ["Sınırsız kullanıcı", "Cascade radar + SSO", "API anahtar matrisi", "Org analytics", "Webhook", "Özel hesap yöneticisi"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-brand-glow">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">ClipForge</span>
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
            Loom kalitesinde, klip intelligence ile
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Ekipler için 
            <span className="text-primary">conflict-aware</span> 
            klip yönetimi
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ClipForge; izleyici drop-off inbox, sahne bölüm blast radius ısı haritası, embed cascade radarı ve versiyon denetçisini tek bir premium platformda birleştirir. Tam Türkçe arayüz, gerçek zamanlı işbirliği.
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
            Loom'u aşan üç mutasyon
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Built-in izleyici drop-off intelligence, permission dependency analysis ve template embed cascade — harici eklenti veya manuel sync gerektirmez.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="surface-card p-6 hover:shadow-accent-glow">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">Basit, şeffaf fiyatlandırma</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`surface-card p-8 ${p.highlight ? 'border-primary/40 ring-2 ring-primary/20' : ''}`}
              >
                {p.highlight && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    En Popüler
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-foreground">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                    p.highlight
                      ? 'bg-primary text-primary-foreground shadow-brand-glow hover:opacity-90'
                      : 'border border-primary/40 text-primary hover:border-primary/60'
                  }`}
                >
                  Başla
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 ClipForge — Video İşbirliği A.Ş. · demo@clipforge.com.tr</p>
      </footer>
    </div>
  );
}
