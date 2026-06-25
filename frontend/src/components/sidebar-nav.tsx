'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { cn, label } from '@/lib/utils';
import { Archive, ArrowRight, Check, FileText, FolderOpen, HelpCircle, Inbox, Layers, LogOut, Menu, Moon, Plus, Settings, Sun, Video, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: "/dashboard", label: "Kliplerim", icon: FileText },
  { href: "/dashboard/triage", label: "Çalışma Gelen Kutusu", icon: Inbox, badge: true },
  { href: "/dashboard/boards", label: "Takım Klasörleri", icon: FolderOpen },
  { href: "/dashboard/issues", label: "Arşiv", icon: Archive },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
  { href: "/dashboard/team", label: "Yardım", icon: HelpCircle },
];

export function SidebarNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ items, mobile = false }: { items: typeof navItems; mobile?: boolean }) => (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-primary')} />
            <span className="flex-1">{item.label}</span>
            {'badge' in item && item.badge && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
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
              <div className="font-display text-base font-bold text-foreground">ClipForge</div>
              <div className="text-[11px] font-medium text-muted-foreground">Premium Akıl</div>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <button className="btn-primary w-full">
            <Plus className="h-4 w-4" />
            Yeni Doküman
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          <NavLinks items={navItems} />
        </nav>

        <div className="border-t border-border p-3">
          <NavLinks items={bottomItems} />
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
              {user?.name} · {user?.role ? label('userRole', user.role) : ''}
            </div>
            <div className="flex gap-2 px-1">
              <button
                onClick={toggleTheme}
                className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40"
                aria-label="Tema değiştir"
              >
                {theme === 'dark' ? <Sun className="mx-auto h-4 w-4" /> : <Moon className="mx-auto h-4 w-4" />}
              </button>
              <button
                onClick={() => { logout(); router.push('/login'); }}
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
          <Link href="/dashboard" className="font-display font-bold text-foreground">ClipForge</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menü">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {mobileOpen && (
          <nav className="border-b border-border bg-card p-3 lg:hidden">
            <NavLinks items={navItems} mobile />
          </nav>
        )}
        <main className="flex flex-1 flex-col overflow-hidden p-8">{children}</main>
      </div>
    </div>
  );
}
