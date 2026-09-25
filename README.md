# Ekonomikotel

Kapadokya otelleri ve tatil paketleri için React/Vite web sitesi. Mevcut sağlık turizmi projesi `/saglik-turizmi/` altında bulunur.

## Çalıştırma

Node.js 24 ile:

```sh
npm ci
npm run build
npm run check
npm run admin:create
npm start
```

Önizleme: `http://127.0.0.1:4173/`. Admin: `/admin`. İlk giriş bilgileri `data/admin-access.txt` içinde oluşturulur. Detaylar: [Yönetim ve kurulum](docs/admin.md).

## İçerik ve işlevler

- 129 otel, 2 tur paketi ve 1.297 yerel WebP görsel.
- Bölge/otel adı ve olanak filtreleri, sıralama, daha fazla sonuç, tarayıcıda saklanan favoriler.
- Tüm otel galerileri, tur programları, dahil olan hizmetler ve kaynak koşulları.
- Tarih/misafir seçimi ve mevcut Ekonomikotel WhatsApp hattında açılan teklif metni.
- Altı dilli sağlık içeriği ve blog; ana tatil sitesine dönüş bağlantısı.
- Veritabanından sunucuda oluşturulan güncel sayfalar, 404, dinamik sitemap ve yerel fontlar.
- Tek yönetici hesabı, otel/tur ekleme-düzenleme, taslak/yayın/arşiv, görsel yükleme, sürüm geçmişi ve JSON dışa aktarma.

Kaynak, `enssgenc/ekonomiltatilimv2` reposunun `bbade297e884fe5f67626f9c4b078ff9cb0468c3` commitidir. Özgün içerikler ve görsel eşlemesi `docs/source/` altında korunur. Yeniden içe aktarma için kaynak repoyu kardeş `../source-ett` klasörüne koyup `node scripts/import-catalog.mjs` çalıştırın.

## İşlev sınırı

Katalog bir kaynak anlık görüntüsüdür. Canlı fiyat, stok, ödeme veya rezervasyon altyapısı bağlı değildir. Tarihler sorgulama ölçütleridir; sonuçlar tarihe göre müsaitlik göstermez. WhatsApp düğmesi taslak mesajı açar; kullanıcı mesajı kendisi gönderir. Kaynakta bulunan sayısal fiyatlar ve değerlendirme puanları güncel teklif gibi gösterilmez.

## Yayın

Dockerfile Node24 sunucusu, SQLite ve kalıcı `/data` dizini kullanır. Coolify'da port 3000, HTTPS APP_ORIGIN ve kalıcı volume gereklidir. **Main otomatik yayına bağlıdır; merge öncesi [yayın geçiş adımlarını](docs/admin.md#coolify-için-gerekli-geçiş) tamamlayın.** Çalışma `codex/ekonomikotel-travel-design` dalındadır, üretime dağıtılmamıştır.

Sağlık bölümü mevcut `noindex` ayarını korur. Tasarım yönü: `DESIGN.md`; ürün kapsamı: `PRODUCT.md`.
