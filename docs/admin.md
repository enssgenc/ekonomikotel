# Ekonomikotel yönetimi

## Günlük kullanım

`/admin` tek yönetici hesabının giriş adresidir. Oturum 12 saat sürer. İlk şifre terminalde oluşturulur; varsayılan/paylaşılan bir üretim şifresi yoktur. Panelde Ayarlar bölümünden hesap adı ve şifre değiştirilebilir. Hesap değişince bütün oturumlar kapanır.

- **Oteller:** ad, adres, konum, açıklamalar, kapak/galeri, olanaklar, oda tipleri ve kapasiteleri.
- **Turlar:** süre, ulaşım, konaklama, günlük program, dahil/hariç hizmetler, çıkış şehri/tarihleri, rotalar ve koşullar.
- **Fiyat ve SEO:** istek üzerine teklif veya son geçerlilik tarihli başlangıç fiyatı, para birimi, fiyat birimi, sayfa başlığı ve açıklaması. Süresi dolan fiyat halka gösterilmez. Başlangıç fiyatı müsaitlik veya kesin rezervasyon değildir.
- **Yayın:** yeni içerik taslak başlar. Eksik alanlarla yayınlama engellenir. Kaydetmek mevcut yayın durumunu uygular; yayındaki içerikte kaydetme siteyi hemen değiştirir. Arşivleme içerik ve geçmişini korur, ziyaretçi sayfasını kaldırır.
- **Önizleme:** kaydedilmiş taslakları yalnızca giriş yapmış yönetici görebilir. Önizleme kaydedilmemiş form değişikliklerini içermez.
- **Görseller:** JPEG/PNG/WebP en çok 12 MB; sunucu görüntüyü doğrular, en çok 1800 piksel WebP üretir. Kütüphanede seçme, sıralama, kapak belirleme ve galeriden çıkarma vardır. Dosyalar başka içeriklerde kullanılıyor olabileceği için kalıcı silme sunulmaz.
- **Geçmiş:** önceki sürümü forma yükleyip inceleyin, uygulamak için tekrar kaydedin. İki sekme aynı sürümü değiştirirse ikinci kayıt reddedilir; güncel kaydı yenileyin.
- **Dışa aktarma:** JSON katalog ve görsel kayıtlarını verir. Görsel dosyalarını ve kullanıcı/oturum veritabanını içermez; tam yedek değildir.

İç notlar, taslaklar, arşivler ve hesap bilgileri halka açık katalogdan çıkarılır. İlk açılışta 129 otel ve 2 tur SQLite'a bir kez aktarılır. Sonraki açılışlar/deploylar yönetici değişikliklerini ezmez. `src/data/catalog.json` yalnızca ilk kurulum kaynağıdır; mevcut kayıtlar panelden değiştirilir.

## Yerel kurulum

Node.js 24.14+ gerekir (yerleşik SQLite kullanılır).

```sh
npm ci
npm run build
npm run admin:create
npm start
```

Site `http://127.0.0.1:4173/`, panel `/admin`. İlk yönetici `yonetici`; rastgele şifre `data/admin-access.txt` içinde, yalnız dosya sahibine okunabilir izinle saklanır. Komut mevcut hesabı değiştirmez. Dosyayı şifre yöneticisine aktardıktan sonra erişimini koruyun. İsteğe bağlı `ADMIN_USERNAME`, `ADMIN_NAME`, `ADMIN_CREDENTIALS_FILE` kullanılır. Ortam değişkenleri otomatik `.env` yüklemez.

Geliştirme: bir terminalde `npm start`, diğerinde `npm run dev`. Public frontend 5173'ten API'yi 4173'e vekiller. Admin testini derlenmiş 4173 adresinde yapın; değişikliklerden sonra `npm run build` ve sayfa yenileme gerekir. Sunucu/SSR değişikliklerinde sunucuyu yeniden başlatın.

```sh
npm run test
npm run check
```

Testler izole geçici veritabanıyla çalışır; gerçek katalog kayıtlarını değiştirmez.

## Coolify için gerekli geçiş

Bu dal henüz üretime dağıtılmadı. Eski uygulama statik Nginx/80 kullanıyor; yeni sürüm Node/3000 + kalıcı SQLite kullanır. **Main otomatik deploy tetikler; aşağıdaki ayarlar merge öncesi hazırlanmalıdır.**

1. Kalıcı volume/bind mount hedefini **`/data`** olarak ekleyin. Dizin UID/GID `1000:1000` (node kullanıcısı) tarafından yazılabilir olmalı. DB ve yüklenen görseller burada kalır; container katmanı üzerinde bırakmayın.
2. İç servis portunu **3000** yapın. Healthcheck `/api/health`. Tek uygulama replikası, yerel volume; paylaşımlı ağ dosya sistemi kullanmayın.
3. Runtime ortamı: `NODE_ENV=production`, `DATA_DIR=/data`, `PORT=3000`, `APP_ORIGIN=https://kanonik-alan-adiniz`, `TRUST_PROXY=1`. APP_ORIGIN sonunda `/` olmamalı; yöneticinin kullandığı HTTPS origin ile aynı olmalı. Alternatif alan adlarını kanonik adrese proxy üzerinden yönlendirin. Portu internete ayrıca açmayın; Coolify HTTPS reverse proxy arkasında tutun.
4. İlk container açılışından sonra container terminalinde `npm run admin:create`. Şifre dosyası `/data/admin-access.txt`. Bir kez oluşturun; API ile açık kayıt endpoint'i yoktur.
5. İlk giriş, görsel yükleme, bir taslak, yayınlama, tekrar arşivleme ve container yeniden oluşturulduktan sonra kayıt/görsel kalıcılığını doğrulayın. Gerçek müşteri içeriğini test için kullanmayın.
6. Günlük yedekleri ayrı diske/uzak depoya alın. `/data` volume'unu silmek geri dönüşsüz veri kaybına yol açar. Birden fazla replika gerekirse önce sunucu veritabanı ve nesne depolama mimarisine geçin.

Dockerfile Node24 kullanır, root yerine `node` kullanıcısı ile çalışır. Yerel Docker daemon bulunmadığında container testi yapılmış sayılmaz; sunucu testleri container/persistence testinin yerini almaz.

## Tam yedek ve geri yükleme

```sh
npm run backup -- /guvenli-yedek-dizini/2026-09-25
```

SQLite online backup API ile tutarlı DB kopyası ve `uploads/` dosyaları oluşturulur. Yedek dizini özeldir; kullanıcı parola hashleri ve oturumlar içerir. Görseller fiziksel silinmediği için veritabanı yedeğinden sonra dosya kopyası güvenlidir. JSON dışa aktarma bunun alternatifi değildir. Hedefi mümkünse `/data` dışında tutun ve ayrıca sunucu dışında saklayın.

Geri yükleme: uygulamayı durdurun; mevcut `/data` dizinini ayrı bir yedeğe taşıyın; yedekteki `ekonomikotel.sqlite` ve `uploads/` klasörünü temiz `/data` dizinine koyun, node kullanıcısının erişimini sağlayın. Eski `-wal`/`-shm` dosyalarını yeni DB ile birlikte kullanmayın. Uygulamayı başlatıp kayıt/görsel sayısını doğrulayın; hesap şifresini panelde değiştirerek eski oturumları kapatın. Eski veri yedeğini doğrulama bitene kadar saklayın.

## Kapsam

Panel içerik ve yayın yönetimidir. Oda/gece stokları, kesin müsaitlik, canlı tedarikçi fiyatları, ödeme, rezervasyon onayı, ekip yetkilendirmesi veya otomatik fiyat senkronizasyonu içermez. WhatsApp teklif akışı korunur. Sağlık turizmi bölümü bu panelde düzenlenmez.
