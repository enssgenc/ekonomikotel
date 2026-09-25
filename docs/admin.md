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

## Dönem fiyatı ve oda detayları

Otel düzenleyicide **Oda tipleri** altında kapasite, metrekare, yatak düzeni, manzara, özellikler ve oda başına 12 fotoğraf girilir. **Dönem fiyatları** sekmesinde oda, tarih aralığı, para birimi, gecelik temel fiyat, fiyata dahil yetişkin sayısı, ilave yetişkin ücreti, minimum gece ve çocuk yaş bantları tanımlanır.

- Dönemin son tarihi **son konaklama gecesidir**; çıkış günü ücretlendirilmez.
- Temel oda fiyatı dahil yetişkin sayısına kadar aynıdır; daha az yetişkin için otomatik indirim yapılmaz. Fazlası kişi/gece üzerinden eklenir.
- Çocuk bantları 0–17 yaş arasıdır; ücretsiz bant için ücret 0 girilir. Her çocuk kendi yaş bandına göre gece başına hesaplanır.
- Aynı odanın etkin dönemleri ve çocuk yaş bantları çakışamaz. Kapasite aşımı, eksik gecelik fiyat/yaş bandı, minimum konaklama ihlali veya konaklama içinde para birimi değişimi varsa toplam üretilmez.
- Ziyaretçi en çok 90 gece için hesap yapabilir. Sonuç tarih/gece dökümüyle gösterilir; oda stoku ve kesin rezervasyon garantisi değildir. Turların mevcut başlangıç fiyatı/teklif modeli korunur.

## Ana sayfa ve kampanyalar

**Ana sayfa yönetimi** açılış başlığı, açıklama, görsel, alternatif metin ve bağlantıyı yönetir. Yayındaki otel/turlardan en fazla 12'şer seçim sıralanabilir. Özel seçim yoksa mevcut öne çıkan içeriklerden ilk dördü kullanılır. En fazla altı kampanyanın görseli, metni, bağlantısı, etkinlik durumu ve başlangıç/bitiş günleri belirlenir. Tarih aralığı dışındaki kampanyalar halka gösterilmez. Görseller mevcut yerel kütüphaneden, bağlantılar desteklenen iç sayfalardan seçilir.

## Talepler ve teklifler

Otel/tur sayfasındaki **Beni arayın, teklif almak istiyorum** formu ad, telefon, isteğe bağlı e-posta/not, tarih, misafir, varsa oda ve hesaplanan fiyatı kaydeder. İletişim onayı zorunludur; takip numarası üretilir. Aynı gönderimin tekrarında çift kayıt oluşturulmaz. İstek sınırı ve gizli spam alanı bulunur.

Panelde arama ve durum filtresi, müşteri bilgileri, özel görüşme notları, teklif tutarı/para birimi/açıklaması, sonuç ve önceki görüşme kayıtları bulunur. Durumlar Yeni → Görüşülüyor → Teklif gönderildi → Sonuçlandı şeklindedir. Sonuçlandırmada sonuç, teklif gönderildi durumunda açıklama gerekir. **Panel mesaj göndermez**: müşteriye ilettiğiniz teklifi burada kaydedersiniz. Talepler halka açık katalogda görünmez.

## Kopyalama, Excel ve toplu işlemler

- Kaydedilmiş otel veya tur **Kopyala** ile yeni, benzersiz adresli bir taslak olur. Kaynak içeriği değiştirmez; özel notlar kopyalanmaz.
- Liste ekranında sayfayı seçip istemediğiniz satırları kaldırarak toplu taslak/yayın/arşiv işlemi uygulayın. Bir kayıt geçersiz veya başka sekmede değişmişse grubun tamamı reddedilir.
- **Excel ile aktarım** ekranından `.xlsx` şablonunu indirin. En fazla 2 MB, ilk sayfada 200 kayıt/20 sütun desteklenir. Sütun açıklamaları şablonun ikinci sayfasındadır.
- `tur` alanı `hotel` veya `tour`; `ad` ve `sayfa_adresi` zorunludur. Liste alanlarında `|`, tur programında JSON dizisi kullanılır. Görseller kütüphanede mevcut yerel yollar olmalıdır; uzak URL indirilmez.
- Önizleme satır bazında hataları gösterir. Seçilen geçerli satırlar birlikte **taslak** aktarılır; mevcut kayıtların üzerine yazılmaz. Önizleme 30 dakika geçerlidir; aynı aktarımın tekrar gönderimi çift kayıt üretmez. Formüllü veya karmaşık hücreler kabul edilmez.
- Oda ve dönem fiyatları aktarım sonrası düzenleyicide tamamlanır.

## Otomatik taslak kurtarma

Otel/tur düzenleyici, değişiklikten yaklaşık bir saniye sonra yöneticiye özel kurtarma kopyası tutar. Bu kopya yayındaki kaydı değiştirmez. Forma yeniden girildiğinde kopyayı yükleme veya silme seçeneği görünür. Başarılı normal kayıttan sonra kurtarma kopyası temizlenir. İki sekme çakışması bildirilir; otomatik olarak diğer sekmenin üstüne yazılmaz. Ağ yokken çevrimdışı kayıt yapılmaz; hata ve kaydedilmemiş değişiklik uyarısı gösterilir. Sayfayı kapatmadan kayıt durumunu kontrol edin.

## Otomatik yedekleme

**Yedekleme** ekranında varsayılan olarak 24 saatte bir yedekleme açıktır; 6/12/24 saat seçilebilir veya kapatılabilir. Zamanlayıcı uygulama sunucusu çalışırken aktiftir; açılışta zamanı geçmiş yedeği alır. **Şimdi yedekle** işi başlatır; ekranda gerçek tamamlanma/hata durumu ve son 20 iş görünür.

Her tamamlanan yedek SQLite online kopyası, `uploads/` ve dosya boyutu/SHA-256 özetleri içeren `manifest.json` barındırır. DB bütünlüğü kontrol edilir, tamamlanmamış klasörler `.partial` kalır. Aynı anda bir yedek çalışır. Varsayılan dizin `DATA_DIR/backups`; isteğe bağlı `BACKUP_DIR` ile ayrı kalıcı disk seçilir. Yedekler otomatik silinmez. Sunucu dışına kopyalama yapılandırılmamıştır; aynı disk yedeği disk arızasına karşı korumaz. Aşağıdaki terminal komutu bağımsız manuel kopyadır; panel geçmişi ve manifest üretmez.

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

Eski uygulama statik Nginx/80 kullanıyordu; bu sürüm Node/3000 + kalıcı SQLite kullanır. **Main otomatik deploy tetikler; aşağıdaki ayarlar merge öncesi hazırlanmalıdır.**

1. Kalıcı volume/bind mount hedefini **`/data`** olarak ekleyin. Dizin UID/GID `1000:1000` (node kullanıcısı) tarafından yazılabilir olmalı. DB ve yüklenen görseller burada kalır; container katmanı üzerinde bırakmayın.
2. İç servis portunu **3000** yapın. Healthcheck `/api/health`. Tek uygulama replikası, yerel volume; paylaşımlı ağ dosya sistemi kullanmayın.
3. Runtime ortamı: `NODE_ENV=production`, `DATA_DIR=/data`, `PORT=3000`, `APP_ORIGIN=https://kanonik-alan-adiniz`, `TRUST_PROXY=1`. APP_ORIGIN sonunda `/` olmamalı; yöneticinin kullandığı HTTPS origin ile aynı olmalı. Alternatif alan adlarını kanonik adrese proxy üzerinden yönlendirin. Portu internete ayrıca açmayın; Coolify HTTPS reverse proxy arkasında tutun.
4. İlk container açılışında `node server/create-admin.mjs --if-missing` komutunu post-deployment adımı olarak çalıştırın. Var olan hesabı veya şifresini değiştirmez. İlk kurulum için `ADMIN_USERNAME` ve `ADMIN_PASSWORD` kullanılabilir; şifre dosyası `/data/admin-access.txt`. API ile açık kayıt endpoint'i yoktur.
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

Panel içerik, yayın, dönem fiyatı ve teklif talebi yönetimidir. Oda/gece stokları, kesin müsaitlik, canlı tedarikçi fiyatları, ödeme, rezervasyon onayı, ekip yetkilendirmesi veya otomatik fiyat senkronizasyonu içermez. WhatsApp teklif akışı korunur. Sağlık turizmi bölümü bu panelde düzenlenmez.
