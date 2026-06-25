# ClipForge — Evrim Stratejisi

**Hedef Titan:** Loom / Vidyard
**Ürün:** ClipForge — Async video intelligence platformu
**Hedef Pazar:** Remote ürün ekipleri, sales enablement, creator eğitmenler, prosumer async video üreticileri

---

## Rakip Analizi Özeti

Loom ve Vidyard, global async video standardıdır; ancak üç kritik eksiklik barındırır:

1. **İzleyici drop-off analitiği yüzeysel:** Saniye bazlı drop-off, rewind hotspot ve engagement drift farklı panellerde; unified viewer drop-off inbox yok.
2. **Sahne bölüm blast radius analitiği parçalı:** Auto-chapter impact, segment engagement ve cascade risk scoring built-in değil; harici video analytics araçlarına bağımlı.
3. **Embed cascade etki simülasyonu yok:** Klip yayından kaldırma veya embed revoke'da downstream cascade önizlemesi sınırlı.

---

## Üç Teknik Mutasyon (Loom/Vidyard'a Karşı Rekabet Avantajı)

### Mutasyon 1: İzleyici Drop-off Inbox + Otomatik Highlight Kuralları (Tüm Planlarda)

**Loom/Vidyard'da yok:** Saniye bazlı drop-off, rewind hotspot ve engagement failure'ları tek inbox'ta kümeleyen, severity skorlayan ve kural tabanlı auto-highlight motoru yok.

**ClipForge uygulaması:**
- İzleyici drop-off inbox: drop-off/rewind drift'leri severity skoruyla listeler
- Klip kümeleme: Pazarlama, Ürün Demo, Eğitim klip badge'leri ile cluster
- Auto-highlight kural motoru: segment tipi/süre koşullarına göre otomatik highlight önerisi
- API: `GET /api/triage/inbox`, `GET/POST /api/triage/rules`

**İş değeri:** Drop-off çözüm süresini %62 azaltır; engagement failure riskini anında görünür kılar.

### Mutasyon 2: Sahne Bölüm Blast Radius Isı Haritası + Engagement Impact Score (Tüm Planlarda)

**Loom/Vidyard'da yok:** Klip × segment chapter heatmap, blast radius score ve cascade severity built-in değil.

**ClipForge uygulaması:**
- Heatmap grid: klip × segment hücreleri, chapter severity renkleri
- Chapter radius score tahmini: geçmiş izleyici verisinden klip bazlı risk olasılığı (%)
- Chapter overload uyarıları: yüksek segment yoğunluğunda görsel alarm
- API: `GET /api/cycle-analytics/heatmap`, `GET /api/cycle-analytics/forecast`

**İş değeri:** İçerik optimizasyonunu %48 hızlandırır; chapter radius'ı anında tespit eder.

### Mutasyon 3: Embed Cascade Radarı + Yayından Kaldırma Etki Simulator (Enterprise)

**Loom/Vidyard'da yok:** Klip unpublish'de bağlı embed noktalarında downstream etki grafiği cascade önizlemesi sınırlı.

**ClipForge uygulaması:**
- Radial clip graph: klip/sürüm node'ları, embed connector çizgileri
- Cascade endpoint: klip yayından kaldırıldığında etkilenen downstream embed ve kayıt session listesi
- Unpublish change simulator: kaldırma öncesi/sonrası erişim bütünlüğü projeksiyonu
- API: `GET /api/dependencies/radar`, `GET /api/dependencies/blast-radius/:issueId`

**İş değeri:** Broken embed hatalarını %70 daha erken yakalar; içerik kaybını önler.

---

## Monetizasyon Katmanları

| Katman | Kısa Vade | Orta Vade | Uzun Vade |
|--------|-----------|-----------|-----------|
| Starter | 3 klip, 5 kayıt session | — | — |
| Pro | Sınırsız klip, drop-off inbox + chapter radius heatmap | AI highlight kredileri, gelişmiş engagement score | — |
| Enterprise | Tüm Pro özellikleri | Cascade radar + unpublish simulator | SSO, org analytics lisansı |

---

## Doğrulama Kilidi

Bu üç mutasyon Loom/Vidyard'ın mevcut ürününde bulunmuyor ve async video workflow'unu gerçek anlamda değiştiriyor.
