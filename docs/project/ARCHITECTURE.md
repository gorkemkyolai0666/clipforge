# ClipForge — Mimari

## Genel Bakış

ClipForge, NestJS backend + Next.js frontend + PostgreSQL (Prisma) ile çalışan
çok kiracılı async video intelligence platformudur.

## Backend Modülleri

- **auth**: JWT tabanlı kimlik doğrulama (`POST /api/auth/login` → 200, `POST /api/auth/register` → 201)
- **boards**: Klip yönetimi (Loom/Vidyard klip metaforu)
- **sprints**: Kayıt oturumları
- **issues**: Bölüm geçmişi / segment kayıtları
- **triage**: İzleyici drop-off inbox + auto-highlight kuralları
- **cycle-analytics**: Sahne bölüm blast radius ısı haritası
- **dependencies**: Embed cascade radarı
- **ceremonies**: Yayından kaldırma seremonileri
- **teams/users/organizations**: Enterprise org yönetimi

## Frontend Yapısı

- `/dashboard` — Ana workspace
- `/dashboard/triage` — İzleyici drop-off inbox
- `/dashboard/cycle-analytics` — Chapter radius heatmap
- `/dashboard/dependencies` — Embed cascade radar
- `/dashboard/settings` — Billing, API keys, profil

## Veritabanı İlişkileri

Organization → Teams → Users → Issues (klip segment kayıtları)
Board (Klip) → Sprint (Recording Session) → Issue → Comments
TriageRule, Dependency, Ceremony modelleri mutation özelliklerini destekler.

## Port Yapılandırması

- Backend: 5170
- Frontend: 4170
- Production backend Railway PORT: 8080
