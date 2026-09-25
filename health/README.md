# Cappadocia Health

Kapadokya sağlık turizmi için hazırlanmış, müşteriye sunulabilecek düzeyde çok dilli site demosu. Ana sayfada 11 sağlık alanında 43 tedavi başlığı aranabilir ve filtrelenebilir. Blogda altı kapsamlı yazı ve fotoğraf gerçekliğinde editoryal görseller bulunur.

İlk ekran sağlık hizmetleri ve güveni öne çıkarır. Kapadokya gezisi, hekimce belirlenen tedavi ve iyileşme planına göre ele alınır. Site Türkçe, İngilizce, Almanca, Rusça, Arapça ve Fransızcadır; Arapça arayüz sağdan sola yerleşir.

## Sayfalar

- `index.html`: sağlık hizmetleri, tedavi kataloğu, planlama süreci, Kapadokya, blog seçkisi ve sık sorulan sorular.
- `blog.html`: altı yazının görsel dizini.
- `article.html?slug=...`: bölüm navigasyonlu yazı sayfası, kaynaklar ve ilgili yazılar.

Dil seçimi bağlantıdaki `lang` parametresine ve tarayıcı belleğine kaydedilir.

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim dosyaları için `npm run build` komutunu kullanın. Çıktı `dist/` klasörüne yazılır. Yerel üretim önizlemesi `npm run preview` ile açılır.

## İçerik düzenleme

- Ana sayfa yapısı: `index.html`; diğer sayfalar: `blog.html`, `article.html`.
- Ana sayfa ve ortak arayüz çevirileri: `src/i18n.js`, `src/page-translations.js`, `src/i18n-overrides.js`.
- Tedaviler ve çevirileri: `src/treatments.js`, `src/treatment-translations.js`, `src/english-treatment-editorial.js`.
- Altı blog yazısı ve tüm çevirileri: `src/blogs.js`.
- Görsel sistem, mobil ve RTL düzen: `src/styles.css`.
- İçerik kaynakları: `CONTENT_SOURCES.md`, `BLOG_SOURCES.md`.
- Tasarım kararları ve araştırma: `DESIGN.md`, `DESIGN_RESEARCH.md`.
- Üretilmiş görsellerin kaydı: `IMAGE_PROVENANCE.md`.

## Yayın öncesi

“Cappadocia Health” geçici marka adıdır. Fotoğraflar bu proje için üretilmiş editoryal görsellerdir; gerçek hastane, hekim veya hastaları göstermez. Sitede doğrulanmamış kurum ve iş ortaklığı iddiaları yoktur. Gerçek hastane ve hekim bilgileri, anlaşmalar, iletişim kanalları, izin belgeleri ve gerekli gizlilik metinleri sağlandığında eklenmelidir. Mevcut sürüm başvuru verisi toplamaz ve kişisel tıbbi tavsiye vermez.
