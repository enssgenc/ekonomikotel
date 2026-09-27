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

Üç kaynaktan gelen talepler aynı listede toplanır. Her satırda kaynak rozeti görünür; **Kaynak** filtresi Tümü / Otel ve tur teklifleri / İletişim formu / Sağlık turizmi seçeneklerini sunar.

- **Otel ve tur teklifleri:** otel/tur sayfasındaki **Beni arayın, teklif almak istiyorum** formu ad, telefon, isteğe bağlı e-posta/not, tarih, misafir, varsa oda ve hesaplanan fiyatı kaydeder. Takip numarası `EKO-` ile başlar.
- **İletişim formu (ana site, İletişim sayfası):** konu (otel, tur/paket, balayı, grup/kurumsal, mevcut rezervasyon, diğer), tarih aralığı ve esneklik, yetişkin/çocuk yaşları, oda sayısı, bölge, bütçe aralığı, dönüş yolu (telefon/WhatsApp/e-posta) ve uygun saat, mevcut rezervasyon numarası ile mesajı kaydeder. Takip numarası `EKO-`, başlık `İletişim formu · <konu>` şeklindedir. **Mevcut rezervasyon** ve **Diğer** konularında tarih, misafir, oda, bölge ve bütçe sorulmaz; talep ayrıntısında da bu satırlar gösterilmez. Dönüş yolu e-posta ise uygun saat satırı gizlenir.
- **Sağlık turizmi formu (`/saglik-turizmi/`, altı dil):** tedavi alanı ve seçilen tedavi, yaşanılan ülke, görüşme dili, formun gönderildiği dil, dönüş yolu, seyahat zamanı, refakatçi sayısı, konaklama/transfer/tercüman/gezi istekleri, rapor veya görüntüleme durumu ve mesajı kaydeder. Takip numarası `CH-`, başlık `Sağlık turizmi · <alan>`, teklif para birimi varsayılan olarak EUR'dur.

Tüm formlarda iletişim onayı zorunludur; takip numarası üretilir. Aynı gönderimin tekrarında (aynı form oturumu, ör. bağlantı kopması sonrası yeniden deneme) çift kayıt oluşturulmaz, ilk takip numarası döner ve tekrar istek sınırına sayılmaz. Gizli spam alanı ve IP başına 15 dakikada 5 yeni gönderim sınırı bulunur. Dönüş yolu e-posta seçilirse e-posta adresi zorunludur.

**Telefon kuralları:** otel/tur teklif formu ve İletişim formu; rakam, boşluk, parantez, tire, nokta ve eğik çizgiden oluşan 7–25 karakterlik numaraları kabul eder, başta `+` olabilir (ör. `0532 123 45 67`, `0532.123.45.67`, `+90 532 123 45 67`). Sağlık formunda ülke kodu zorunludur: numara `+` veya `00` ile başlamalıdır (ör. `+44 7700 900123`, `+33 6.12.34.56.78`, `0049 151/2345678`); aksi hâlde "Ülke koduyla birlikte telefon numarası girin" uyarısı gösterilir. Talep ayrıntısındaki **WhatsApp** bağlantısı ülke kodlu numaralarda her zaman görünür; ülke kodu olmayan `0XXXXXXXXXX` veya `5XXXXXXXXX` biçimindeki numaralar yalnızca otel/tur ve İletişim formu taleplerinde Türkiye (+90) numarası sayılır. Sağlık talebinde ülke kodu yoksa WhatsApp bağlantısı gösterilmez; kişiye seçtiği kanaldan ulaşın. Kurallar `src/lib/contact-forms.js` içindedir.

**Sağlık verisi:** sağlık formu, kişinin paylaştığı sağlık bilgisinin işlenmesi ve ön değerlendirme için talebi değerlendirecek yetkili sağlık kuruluşuyla paylaşılması için ayrı **açık rıza** ister; iletişim izni ve açık rıza zamanı talep ayrıntısında görünür. Bu kayıtlar özel nitelikli kişisel veridir: yalnızca talebi değerlendirecek yetkili sağlık kuruluşuyla paylaşın; e-posta zincirlerine, mesaj gruplarına veya tablolara kopyalamayın. Sağlık talepleri denetim kaydına yazılmaz (talep güncellemelerinde yalnızca takip numarası kaydedilir), ancak veritabanı yedeklerinde bulunur; yedekleri buna göre koruyun. Panelde talep silme yoktur; silme veya düzeltme başvurusunda kayıt, yedek alındıktan sonra veritabanından elle kaldırılmalıdır.

Panelde arama, durum ve kaynak filtresi, türe göre müşteri bilgileri, özel görüşme notları, teklif tutarı/para birimi/açıklaması, sonuç ve önceki görüşme kayıtları bulunur. Durumlar Yeni → Görüşülüyor → Teklif gönderildi → Sonuçlandı şeklindedir. Sonuçlandırmada sonuç, teklif gönderildi durumunda açıklama gerekir. **Panel mesaj göndermez ve yeni talep bildirimi yollamaz**: listeyi düzenli kontrol edin; müşteriye ilettiğiniz teklifi burada kaydedersiniz. Talepler halka açık katalogda görünmez.

**KVKK aydınlatma metinleri:** formlardaki aydınlatma bağlantıları ana sitede `/kvkk-aydinlatma` (otel/tur teklif formu ve İletişim formu; sitemap'te yer alır) ve sağlık bölümünde `/saglik-turizmi/aydinlatma.html` (altı dil; sağlık bölümü `noindex` olduğu için sitemap'e eklenmez) sayfalarına gider. Metinlerdeki veri sorumlusu, sitede gösterilen TÜRSAB A-12892 belgesinin sahibi **Kapadokya Alperen Turizm Seyahat Restoran Ticaret Limited Şirketi**'dir (UPTREND TRAVEL; Ekonomik Tatilim / Ekonomikotel markaları, Cappadocia Health bu sitenin sağlık turizmi bölümü); başvuru adresi Çavuşin Köyü 2. Küme Evleri 2. Mevki No:8, Avanos / Nevşehir ve destek@ekonomiktatilim.com. **Bu şirket bilgileri, işleme amaçları, hukuki sebepler, alıcı grupları ve saklama süreleri yayından önce işletme sahibi tarafından (gerekirse hukuk danışmanıyla) kontrol edilmelidir.** Metinler panelden değil kaynak koddan değişir; değişiklikte "Son güncelleme" tarihini de güncelleyip `npm run build` ve yayın yapın. Metinde belirtilen saklama süreleri (iletişim/teklif talepleri talep kapandıktan sonra en çok 2 yıl; sağlık bilgileri ön değerlendirme bitince, en geç talepten 1 yıl sonra silinir veya anonimleştirilir) otomatik uygulanmaz: süresi dolan kayıtları yukarıdaki elle silme yöntemiyle kaldırın ve eski yedekleri buna göre yönetin.

**Barındırma yeri:** uygulama ve veritabanı Hostinger'ın Frankfurt (Almanya) veri merkezindeki VPS'te çalışır (Hostinger API, veri merkezi `fra`). Bu nedenle form verileri yurt dışında saklanır ve iki aydınlatma metni bunu KVKK md. 9 kapsamında bir aktarım olarak açıklar. Düzenli aktarım için md. 9'daki güvencelerin (ör. barındırma sağlayıcısıyla standart sözleşme ve Kurul'a bildirimi) sağlanması veri sorumlusunun sorumluluğundadır; hukukçu kontrolü önerilir. Sunucu Türkiye'ye taşınırsa iki metin de güncellenmelidir.

**İletişim hattı ve TÜRSAB:** sitede gösterilen tek telefon/WhatsApp numarası (0544 341 70 20) ve TÜRSAB belge bilgisi (A-12892, A Grubu Seyahat Acentesi) `src/lib/agency.js` dosyasındadır; form seçenekleri `src/lib/contact-forms.js` içindedir. Bunlar panelden değil kod üzerinden değişir; değişiklikten sonra `npm run build` ve yayın gerekir.

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

Panel içerik, yayın, dönem fiyatı ve teklif talebi yönetimidir. Oda/gece stokları, kesin müsaitlik, canlı tedarikçi fiyatları, ödeme, rezervasyon onayı, ekip yetkilendirmesi veya otomatik fiyat senkronizasyonu içermez. WhatsApp teklif akışı korunur. Sağlık turizmi bölümünün içeriği bu panelde düzenlenmez; yalnızca sağlık formu talepleri **Talepler ve teklifler** altında görünür.
