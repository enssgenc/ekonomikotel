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
- Tarih/misafir seçimi ve Ekonomikotel WhatsApp hattında açılan teklif metni.
- Tek iletişim hattı **0544 341 70 20** (telefon ve WhatsApp) ve **TÜRSAB Belge No: A-12892 · A Grubu Seyahat Acentesi** bağlantısı hem ana sitede hem sağlık turizmi bölümünde gösterilir. Numara ve belge bilgisi yalnızca `src/lib/agency.js` içinde tutulur; değişiklikte orayı güncelleyip yeniden derleyin.
- Sektöre göre ayrılmış iki iletişim formu: İletişim sayfasında otel/tur formu (konu, tarih ve esneklik, misafir/çocuk yaşları, oda, bölge, bütçe, dönüş yolu ve saati, mevcut rezervasyon numarası) ve sağlık turizmi bölümünde altı dilli ön değerlendirme formu (tedavi alanı ve tedavi, yaşanılan ülke, görüşme dili, seyahat zamanı, refakatçi, konaklama/transfer/tercüman istekleri, rapor durumu, sağlık verisi için açık rıza). Gönderimler panelde **Talepler ve teklifler** altında `EKO-` ve `CH-` takip numaralarıyla toplanır. Ortak seçenek listeleri ve telefon kuralları (sağlık formunda ülke kodu zorunlu) `src/lib/contact-forms.js` içindedir.
- KVKK aydınlatma metinleri: ana sitede `/kvkk-aydinlatma`, sağlık bölümünde `/saglik-turizmi/aydinlatma.html` (altı dil). Veri sorumlusu bilgisi TÜRSAB A-12892 belgesinin sahibi Kapadokya Alperen Turizm Seyahat Restoran Ticaret Ltd. Şti.'ye aittir ve yayından önce işletme sahibince kontrol edilmelidir; ayrıntılar [Yönetim ve kurulum](docs/admin.md#talepler-ve-teklifler) belgesindedir.
- Altı dilli sağlık içeriği ve blog; ana tatil sitesine dönüş bağlantısı.
- Veritabanından sunucuda oluşturulan güncel sayfalar, 404, dinamik sitemap ve yerel fontlar.
- Tek yönetici hesabı, otel/tur ekleme-düzenleme, taslak/yayın/arşiv, görsel yükleme, sürüm geçmişi ve JSON dışa aktarma.
- Oda detayları ve dönem/çocuk yaşına göre gösterge fiyatı, ana sayfa/kampanya yönetimi, müşteri talepleri ve teklif kayıtları.
- Taslak kopyalama, Excel önizleme/aktarım, toplu durum değişikliği, otomatik taslak kurtarma ve zamanlanmış DB/görsel yedeği.

Kaynak, `enssgenc/ekonomiltatilimv2` reposunun `bbade297e884fe5f67626f9c4b078ff9cb0468c3` commitidir. Özgün içerikler ve görsel eşlemesi `docs/source/` altında korunur. Yeniden içe aktarma için kaynak repoyu kardeş `../source-ett` klasörüne koyup `node scripts/import-catalog.mjs` çalıştırın.

## İşlev sınırı

Katalog bir kaynak anlık görüntüsüdür. Canlı fiyat, stok, ödeme veya rezervasyon altyapısı bağlı değildir. Tarihler sorgulama ölçütleridir; sonuçlar tarihe göre müsaitlik göstermez. WhatsApp düğmesi taslak mesajı açar; kullanıcı mesajı kendisi gönderir. İletişim formları e-posta, SMS veya WhatsApp bildirimi göndermez; yeni talepler yalnızca yönetim panelinde görünür. Sağlık formu tıbbi tavsiye veya tanı değildir; ön değerlendirmeyi talebi değerlendirecek yetkili sağlık kuruluşu yapar. Kaynakta bulunan sayısal fiyatlar ve değerlendirme puanları güncel teklif gibi gösterilmez.

## Yayın

Dockerfile Node24 sunucusu, SQLite ve kalıcı `/data` dizini kullanır. Coolify'da port 3000, HTTPS APP_ORIGIN ve kalıcı volume gereklidir. **Main otomatik yayına bağlıdır; merge öncesi [yayın geçiş adımlarını](docs/admin.md#coolify-için-gerekli-geçiş) tamamlayın.** Üretim adresi `https://ekonomikotel.com`; dağıtım tamamlanması Coolify durumu ve canlı HTTP kontrolleriyle doğrulanır.

Sağlık bölümü mevcut `noindex` ayarını korur. Tasarım yönü: `DESIGN.md`; ürün kapsamı: `PRODUCT.md`.
