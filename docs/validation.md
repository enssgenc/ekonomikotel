# Doğrulama — 25 Eylül 2026

- Üretim derlemesi başarılı: 138 rota ve 404 içeriği statik oluşturuldu.
- `npm run check` başarılı: 129 otelde kaynak metin, kimlikler, olanaklar ve tüm galeri görselleri korundu; 2 tur paketi ve sağlık alt sitesi mevcut.
- Üretilen HTML içindeki 6.210 yerel bağlantı/görsel/script yolu kontrol edildi; eksik hedef bulunmadı.
- 1280px masaüstü ve 390px mobil ana sayfa incelendi. Mobil ana sayfa ve sağlık sayfasında yatay taşma veya bozuk yüklenmiş görsel bulunmadı.
- Göreme araması: 9 sonuç; Spa filtresi: 1 sonuç (Sacred Mansion).
- Favori kaydı sayfa yenilendikten sonra korundu.
- Sacred Mansion galerisi açıldı, 3/10 görselden 4/10 görsele geçildi, Escape ile kapandı.
- Yerel tarih kontrollerinde `input` ve `change` olayları birlikte ele alındı. Giriş tarihi çıkış tarihinin alt sınırını güncelliyor; misafir değişimi tarihleri sıfırlamıyor.
- 15–18 Ekim 2026 tur araması tarihleri sonuç bağlantısına ve detay teklif formuna taşıyor. Çocuk yaşı seçimi mevcut.
- Sağlık alt sitesi yerel resimlerle açıldı. İngilizce dil değişimi ve İngilizce blog bağlantısı doğrulandı; 6 yazı mevcut.
- İncelenen akışlarda tarayıcı konsolunda uygulama hatası görülmedi.
- Kaynak dosyalarında yaygın API/token/private-key kalıpları tarandı; eşleşme yok. `git diff --check` başarılı.

## Sınırlar

- WhatsApp mesajı gönderilmedi; arayüz kullanıcıya gönderilebilir teklif metni hazırlar.
- Canlı stok, ödeme ve rezervasyon oluşturma entegrasyonu mevcut değil.
- Docker bu makinede bulunmadığı için konteyner çalıştırma testi yapılamadı. Üretime dağıtım yapılmadı.
- Vite ana JS paketi 616 kB (gzip 140 kB civarı) boyut uyarısı ve React Router direktif uyarısı veriyor; derleme başarılı.
- Görünüm kontrolü kapsamlı bir ekran okuyucu veya tüm tarayıcı sertifikasyonu değildir.

## Tasarım iyileştirmesi

| Önce | Sonra | Gerekçe |
| --- | --- | --- |
| Soğuk ve geniş açılış görseli | Sıcak teras görseli, çerçeveli masaüstü açılışı ve kısa başlık | Bölgenin atmosferini ilk ekranda güçlendirmek |
| Küçük kart yazıları ve dar mobil kolonlar | Daha büyük fotoğraf/yazı, mobilde kaydırılan geniş kartlar | Otel seçimini ve dokunmayı kolaylaştırmak |
| Sabit dört otel | Tümü/Göreme/Ürgüp/Uçhisar/Avanos bölge seçimi | Ana sayfadan ilgili otellere hızlı ulaşmak |
| Benzer beyaz bölüm düzenleri | Sıcak tur zemini ve fotoğraf üstü bölge başlıkları | Sayfa bölümlerinin ayrımını güçlendirmek |

- `npm run build`, `npm run check`, `git diff --check` başarılı.
- 1280px masaüstünde ana sayfa, arama yüzeyi ve otel vitrini kontrol edildi.
- 325px dar mobilde taşma düzeltildi: sayfa genişliği 325px; yalnızca otel vitrini kendi içinde yatay kaydırılıyor.
- Göreme ve Ürgüp seçimlerinde dört kartın da seçilen bölgeyi gösterdiği doğrulandı.
- Yeni karttan Alden Hotel Cappadocia detay sayfasına geçildi; doğru başlık, sıfır yatay taşma ve sıfır bozuk yüklenmiş görsel doğrulandı.
- Kontrol edilen akışta tarayıcı uygulama hatası görülmedi. Mevcut sağlık ve rezervasyon/teklif kapsamı korunur.

## Admin panel — 2026-09-25

- `npm run build`: public/admin client builds, SSR bundle and static fallback generation pass.
- `npm run test`: 20 tests pass. Covers seed preservation/idempotence, editable source nulls, empty catalogue, auth/session/CSRF, filtered/paginated lists, drafts and private previews, publication and dynamic SSR/sitemap, version conflicts, image decoding, tour program publication, archives, export, logout, login throttling, persistence and aborted client response handling.
- `npm run check`: 129 hotel descriptions and galleries, 2 tours and health integration retained.
- Browser: single-account login; create hotel draft; choose image from library; publish; verify public hotel detail. All write tests used a separate QA database.
- Browser: 1280px dashboard, 390px hotel editor and tour list/program; no horizontal page overflow. Unsaved edits remain after cancelling navigation.
- Resolved browser-discovered issues: aborted JSON requests no longer become malformed successful list data; combined catalogue filters have correct SQL spacing. Regression coverage added for both.
- `npm run backup` against QA database: SQLite integrity check `ok`, 132 expected records in the backup.
- Delivery database: 129 hotels, 2 tours, exactly one administrator; no QA content. Generated credential file is outside Git and mode 0600. Actual local account login verified without logging its password.
- Docker executable unavailable: container, Coolify persistence and public deployment checks remain release steps, documented in `docs/admin.md`. No live deployment performed.
