# Cappadocia Health

Kapadokya sağlık turizmi için hazırlanmış, müşteriye sunulabilecek düzeyde çok dilli site demosu. Ana sayfada 11 sağlık alanında 43 tedavi başlığı aranabilir ve filtrelenebilir. Blogda altı kapsamlı yazı ve fotoğraf gerçekliğinde editoryal görseller bulunur.

İlk ekran sağlık hizmetleri ve güveni öne çıkarır. Kapadokya gezisi, hekimce belirlenen tedavi ve iyileşme planına göre ele alınır. Site Türkçe, İngilizce, Almanca, Rusça, Arapça ve Fransızcadır; Arapça arayüz sağdan sola yerleşir.

## Sayfalar

- `index.html`: sağlık hizmetleri, tedavi kataloğu, planlama süreci, Kapadokya, blog seçkisi, sık sorulan sorular ve iletişim formu (`#iletisim`).
- `blog.html`: altı yazının görsel dizini.
- `article.html?slug=...`: bölüm navigasyonlu yazı sayfası, kaynaklar ve ilgili yazılar.
- `aydinlatma.html`: sağlık turizmi iletişim formunun KVKK aydınlatma metni (altı dil; Türkçe metin esas, diğerleri çeviri). Formdaki iki onay kutusundan yeni sekmede ve tüm sayfaların alt bilgisinden bağlanır.

Dil seçimi bağlantıdaki `lang` parametresine ve tarayıcı belleğine kaydedilir.

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim dosyaları için `npm run build` komutunu kullanın. Çıktı `dist/` klasörüne yazılır. Yerel üretim önizlemesi `npm run preview` ile açılır.

## İçerik düzenleme

- Ana sayfa yapısı: `index.html`; diğer sayfalar: `blog.html`, `article.html`, `aydinlatma.html`.
- Ana sayfa ve ortak arayüz çevirileri: `src/i18n.js`, `src/page-translations.js`, `src/i18n-overrides.js`.
- Tedaviler ve çevirileri: `src/treatments.js`, `src/treatment-translations.js`, `src/english-treatment-editorial.js`.
- Altı blog yazısı ve tüm çevirileri: `src/blogs.js`.
- İletişim formu: `src/contact-form.js`; altı dildeki metinleri `src/contact-translations.js`. Seçenek değerleri ana siteyle ortak `../src/lib/contact-forms.js`, TÜRSAB bilgisi `../src/lib/agency.js` dosyasındadır. Telefon ülke koduyla (+ veya 00) istenir (`INTL_PHONE_PATTERN`).
- KVKK aydınlatma metni: `src/privacy-page.js` (veri sorumlusu bilgileri burada), altı dildeki metin `src/privacy-translations.js`. Metin değişirse altı dil birlikte güncellenmeli ve “Son güncelleme” tarihi değiştirilmelidir.
- Görsel sistem, mobil ve RTL düzen: `src/styles.css`.
- İçerik kaynakları: `CONTENT_SOURCES.md`, `BLOG_SOURCES.md`.
- Tasarım kararları ve araştırma: `DESIGN.md`, `DESIGN_RESEARCH.md`.
- Üretilmiş görsellerin kaydı: `IMAGE_PROVENANCE.md`.

## Yayın öncesi

“Cappadocia Health” geçici marka adıdır. Fotoğraflar bu proje için üretilmiş editoryal görsellerdir; gerçek hastane, hekim veya hastaları göstermez. Sitede doğrulanmamış kurum ve iş ortaklığı iddiaları yoktur. Gerçek hastane ve hekim bilgileri, anlaşmalar, izin belgeleri ve gerekli gizlilik metinleri sağlandığında eklenmelidir.

İletişim formu ana sunucunun `POST /api/contact` uç noktasına (`form: "health"`) gönderir; talepler yönetim panelinde `CH-` numaralı sağlık talebi olarak görünür. Ekonomikotel'in tek hattı (+90 544 341 70 20, telefon ve WhatsApp) üst şeritte, alt bilgide ve formun yanında gösterilir; iletişim onayı ve sağlık verisi için KVKK açık rızası ayrı ayrı alınır; iki onay metni de aydınlatma metnine bağlanır. Sağlık verisi, adı paylaşımdan önce kişiye bildirilecek yetkili sağlık kuruluşuyla paylaşılır; sitede belirli bir kurum veya anlaşma adı geçmez. Site kişisel tıbbi tavsiye vermez. Alt bilgide ve iletişim bölümünde TÜRSAB belge numarası gösterilir.
