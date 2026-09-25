# Ekonomikotel

Kapadokya otelleri ve tatil paketleri için React/Vite web sitesi. Mevcut sağlık turizmi projesi `/saglik-turizmi/` altında bulunur.

## Çalıştırma

Node.js 24 ile:

```sh
npm ci
npm run build
npm run check
npm run preview
```

Önizleme: `http://127.0.0.1:4173/`. Geliştirme: `npm run dev`.

## İçerik ve işlevler

- 129 otel, 2 tur paketi ve 1.297 yerel WebP görsel.
- Bölge/otel adı ve olanak filtreleri, sıralama, daha fazla sonuç, tarayıcıda saklanan favoriler.
- Tüm otel galerileri, tur programları, dahil olan hizmetler ve kaynak koşulları.
- Tarih/misafir seçimi ve mevcut Ekonomikotel WhatsApp hattında açılan teklif metni.
- Altı dilli sağlık içeriği ve blog; ana tatil sitesine dönüş bağlantısı.
- 138 önceden oluşturulan sayfa, ayrı 404 sayfası, sitemap ve yerel fontlar.

Kaynak, `enssgenc/ekonomiltatilimv2` reposunun `bbade297e884fe5f67626f9c4b078ff9cb0468c3` commitidir. Özgün içerikler ve görsel eşlemesi `docs/source/` altında korunur. Yeniden içe aktarma için kaynak repoyu kardeş `../source-ett` klasörüne koyup `node scripts/import-catalog.mjs` çalıştırın.

## İşlev sınırı

Katalog bir kaynak anlık görüntüsüdür. Canlı fiyat, stok, ödeme veya rezervasyon altyapısı bağlı değildir. Tarihler sorgulama ölçütleridir; sonuçlar tarihe göre müsaitlik göstermez. WhatsApp düğmesi taslak mesajı açar; kullanıcı mesajı kendisi gönderir. Kaynakta bulunan sayısal fiyatlar ve değerlendirme puanları güncel teklif gibi gösterilmez.

## Yayın

Dockerfile, önce siteyi oluşturup kontrol eder, ardından `dist/` klasörünü Nginx ile sunar. Coolify mevcut repo ve Dockerfile düzenini kullanabilir. Projenin `main` dalı otomatik yayına bağlıdır; bu tasarım `codex/ekonomikotel-travel-design` dalında hazırlanmıştır. İlk teslimde üretime yayın yapılmamıştır.

Sağlık bölümü mevcut `noindex` ayarını korur. Docker/Nginx konteyner çalıştırma kontrolü bu makinede Docker bulunmadığı için yapılmamıştır; yerel üretim derlemesi ve tarayıcı kontrolleri yapılmıştır.

Tasarım yönü ve uygulanan skill kaynakları: `DESIGN.md`, ürün kapsamı: `PRODUCT.md`.
