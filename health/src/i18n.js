import { treatmentCategories } from './treatments.js';
import { treatmentTranslations } from './treatment-translations.js';
import { pageTranslations } from './page-translations.js';
import { pageCopyOverrides, treatmentCopyOverrides, treatmentDetailOverrides } from './i18n-overrides.js';
import { englishTreatmentEditorial } from './english-treatment-editorial.js';

export const languages = [
  { code: 'tr', label: 'Türkçe', nativeLabel: 'Türkçe', dir: 'ltr' },
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'ru', label: 'Русский', nativeLabel: 'Русский', dir: 'ltr' },
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français', dir: 'ltr' },
];

export const defaultLocale = 'tr';
export const supportedLocales = languages.map(({ code }) => code);

export const trMessages = {
  site: {
    title: 'Cappadocia Health | Sağlık yolculuğunuz, Kapadokya’da',
    description: 'Sağlık alanlarını tanıyın, uzman değerlendirmesine dayanan tedavi yolculuğunu Kapadokya deneyimiyle birlikte düşünün.',
    skip: 'İçeriğe geç',
    brandAria: 'Cappadocia Health, ana sayfa',
    backToTopAria: 'Cappadocia Health, yukarı dön',
    menuOpen: 'Menüyü aç',
    menuClose: 'Menüyü kapat',
    languageLabel: 'Dil seçin',
  },
  nav: {
    menuAria: 'Ana menü',
    treatments: 'Sağlık alanları',
    process: 'Nasıl işler?',
    cappadocia: 'Kapadokya',
    blog: 'Blog',
    faq: 'Sorular',
    exploreTreatments: 'Tedavileri incele',
  },
  hero: {
    titleLead: 'Sağlık yolculuğunuz,',
    titleAccent: 'Kapadokya’da özenle planlansın.',
    lead: 'Tedavi seçeneklerini tanıyın. Uzman değerlendirmesiyle şekillenen sağlık planına, Kapadokya yolculuğunu dikkatle ekleyin.',
    primary: 'Sağlık alanlarını keşfet',
    secondary: 'Süreç nasıl ilerler?',
    quickTitle: 'Bir alanla başlayın',
    quick: { dis: 'Diş sağlığı', estetik: 'Estetik cerrahi', sac: 'Saç ekimi', goz: 'Göz sağlığı' },
    clinicCaption: 'Sağlık görüşmesi',
    cappadociaCaption: 'Kapadokya',
    medicalFirst: 'Tıbbi karar önce gelir. Yolculuk ona göre şekillenir.',
    approachLink: 'Yaklaşımı gör',
  },
  approach: {
    stepsAria: 'Planlama sırası',
    titleLead: 'Önce doğru sağlık planı.',
    titleAccent: 'Sonra size uygun yolculuk.',
    intro: 'Tedavi kararı, kapsamı ve iyileşme takvimi yetkili sağlık kuruluşunda belirlenir. Kapadokya deneyimi bu plana uyum sağlar.',
    steps: [
      { title: 'İhtiyacınızı belirleyin', body: 'İlgilendiğiniz tedavi alanını ve beklentinizi netleştirin.' },
      { title: 'Uzman değerlendirsin', body: 'Uygunluk, işlem ve kontrol takvimi sağlık kuruluşunda belirlenir.' },
      { title: 'Gezi plana eşlik etsin', body: 'Konaklama ve ziyaretler, hekimin önerdiği iyileşme sürecine göre düzenlenir.' },
    ],
  },
  treatments: {
    title: 'İlgilendiğiniz sağlık alanını bulun.',
    intro: 'Açıklamaları okuyun, seçenekleri karşılaştırın. Uygunluk kararı kişisel muayene ve uzman değerlendirmesiyle verilir.',
    countTreatments: 'tedavi başlığı',
    countAreas: 'sağlık alanı',
    featuredAria: 'Öne çıkan sağlık alanları',
    categoryCount: '{count} tedavi başlığı',
    exploreProcedures: 'İşlemleri incele',
    catalogHeading: 'Tüm tedavi başlıkları',
    catalogIntro: 'Bir alan seçin veya aradığınız işlemi yazın.',
    searchLabel: 'Tedavi veya alan ara',
    searchPlaceholder: 'Örneğin implant, saç ekimi, göz',
    all: 'Tümü',
    filterAria: 'Tedavi alanına göre filtrele',
    resultCount: '{count} tedavi başlığı',
    searchSideTitle: 'Aradığınız konuyu bulun.',
    searchSideBody: 'Sonuçlar tüm sağlık alanlarında aranır.',
    defaultSideTitle: 'Her yolculuk farklı bir yerden başlar.',
    defaultSideBody: '{count} tedavi başlığını arayın veya bir sağlık alanı seçin.',
    noResultsTitle: 'Bu aramayla eşleşen bir başlık bulamadık.',
    noResultsBody: 'Başka bir kelime deneyin veya tüm sağlık alanlarına dönün.',
    clearSearch: 'Aramayı temizle',
    disclaimer: 'Bu içerikler genel bilgilendirme içindir. Sunulabilecek hizmetler sağlık tesisinin izin kapsamına, kişisel uygunluk ise uzman değerlendirmesine bağlıdır.',
    detailNote: 'Uygunluk ve işlem takvimi için yetkili sağlık kuruluşundaki uzman değerlendirmesi gerekir.',
    showLess: 'Daha az göster',
    showAll: 'Tüm {count} başlığı göster',
  },
  care: {
    titleLead: 'Sağlık kararı,',
    titleAccent: 'doğru yerde verilir.',
    body1: 'Tedaviyi yetkili sağlık kuruluşu ve uzman hekim planlar. Yolculuğun çevresindeki ulaşım, konaklama ve gezi seçenekleri ancak bu plan netleştikten sonra anlam kazanır.',
    body2: 'Sağlık kuruluşu, hekim, işlem ve takvim bilgileri her başvuruda ayrıca doğrulanmalıdır.',
  },
  destination: {
    placesAria: 'Kapadokya ziyaret durakları',
    title: 'Kapadokya, planınız elverdiğince sizinle.',
    intro: 'Göreme’nin kaya kiliseleri, Avanos’un çömlek atölyeleri, Uçhisar’ın manzarası… Gezi durakları kendinizi nasıl hissettiğinize ve hekimin önerisine göre seçilir.',
    note: 'Balon uçuşu, uzun yürüyüş ve benzeri etkinlikler hava koşullarına ve tıbbi uygunluğa bağlıdır.',
    imageCaption: 'Kapadokya vadileri',
    places: [
      { name: 'Göreme', description: 'Kayaya oyulmuş kiliseler ve açık hava müzesi' },
      { name: 'Avanos', description: 'Kızılırmak kıyısı ve çömlek geleneği' },
      { name: 'Uçhisar', description: 'Vadilerin üzerinde geniş bir manzara' },
    ],
  },
  faq: {
    title: 'Yola çıkmadan önce bilmeniz gerekenler.',
    intro: 'İyi bir plan doğru sorularla başlar.',
    items: [
      { question: 'Tedavi ve gezi aynı gün planlanabilir mi?', answer: 'Bunun herkese uyan bir yanıtı yok. Gezi takvimi işlemin türüne, kontrol randevularına ve hekimin önerdiği dinlenme süresine göre belirlenir.' },
      { question: 'Hastane ve hekim bilgileri nasıl belirlenir?', answer: 'İlgili branşta hizmet sunan yetkili sağlık kuruluşu ve uzman bilgileri, gerçek başvuru ve hizmet kapsamı doğrultusunda teyit edilmelidir. Tedaviyi sağlık kuruluşu sunar.' },
      { question: 'Balon turu her programa dahil mi?', answer: 'Hayır. Balon uçuşları hava koşullarına bağlıdır. Tedavi sonrasında böyle bir etkinliğin uygun olup olmadığı da hekimin değerlendirmesine göre belirlenir.' },
      { question: 'Dönüş yolculuğu ne zaman planlanmalı?', answer: 'Ameliyat veya girişim sonrası uçuş dahil tüm seyahat kararları kişisel iyileşme ve kontrol planına göre hekimle birlikte alınmalıdır.' },
      { question: 'İşlem sonucu veya fiyatı önceden kesinleşir mi?', answer: 'Muayene yapılmadan kişiye özel yöntem, sonuç veya toplam maliyet hakkında kesin söz vermek doğru değildir. Kapsam, sağlık kuruluşunun değerlendirmesiyle netleşir.' },
    ],
  },
  footer: {
    tagline: 'Sağlık yolculuğunuz, Kapadokya’da.',
    disclaimer: 'Buradaki bilgiler tıbbi tavsiye yerine geçmez. Tanı ve tedavi, yetkili sağlık kuruluşundaki uzmanlarca belirlenir.',
    healthTurkiye: 'HealthTürkiye',
    heritageAuthority: 'Kapadokya Alan Başkanlığı',
  },
  blog: {
    navTitle: 'Blog',
    listTitle: 'Sağlık yolculuğuna dair daha iyi sorular.',
    listIntro: 'Tedavi kararından Kapadokya’daki sakin duraklara uzanan, dikkatle hazırlanmış okuma seçkisi.',
    listKicker: 'Cappadocia Health Journal',
    all: 'Tüm yazılar',
    articleCount: '{count} yazı',
    readArticle: 'Yazıyı oku',
    readTime: '{count} dk okuma',
    backToBlog: 'Tüm yazılara dön',
    relatedTitle: 'Bunları da okuyabilirsiniz',
    moreArticles: 'Daha fazla yazı',
    contents: 'Bu yazıda',
    previous: 'Önceki yazı',
    next: 'Sonraki yazı',
    published: 'Yayınlandı',
    category: 'Kategori',
    categories: {
      dental: 'Diş sağlığı',
      aesthetic: 'Estetik cerrahi',
      hair: 'Saç sağlığı',
      eye: 'Göz sağlığı',
      travel: 'Kapadokya',
      guide: 'Yolculuk rehberi',
    },
    notFoundTitle: 'Aradığınız yazıyı bulamadık.',
    notFoundBody: 'Blogdaki diğer yazılara göz atabilirsiniz.',
    homeTeaserTitle: 'Yolculuğu bilgiyle planlayın.',
    homeTeaserIntro: 'Sağlık kararları ve Kapadokya deneyimi üzerine yararlı okumalar.',
    homeTeaserLink: 'Tüm yazıları keşfet',
    sources: 'Kaynaklar',
    medicalNote: 'Bu yazı genel bilgilendirme amaçlıdır; kişisel tanı veya tedavi önerisi yerine geçmez. Tanı ve tedavi kararları için ilgili sağlık uzmanına başvurun.',
  },
  image: {
    heroClinicAlt: 'Aydınlık bir görüşme ortamında hekim ve danışan',
    heroCappadociaAlt: 'Kapadokya’da taş kemerli aydınlık bir terastan vadi manzarası',
    destinationAlt: 'Gün ışığında Kapadokya vadisi, peri bacaları ve uzakta balonlar',
    inlineValleyAlt: 'Gün ışığında Kapadokya vadisi ve peri bacaları',
    inlineStayAlt: 'Aydınlık bir taş otel odasında dinlenme alanı',
  },
};

for (const [locale, edits] of Object.entries(pageCopyOverrides)) {
  for (const [path, copy] of Object.entries(edits)) {
    const parts = path.split('.');
    const key = parts.pop();
    const target = parts.reduce((node, part) => node[part], pageTranslations[locale]);
    target[key] = copy;
  }
}

for (const [locale, edits] of Object.entries(treatmentCopyOverrides)) {
  for (const [categoryId, override] of Object.entries(edits)) {
    const category = treatmentTranslations[locale].find(({ id }) => id === categoryId);
    if (override.label) category.label = override.label;
    for (const [index, name] of Object.entries(override.items ?? {})) {
      category.items[Number(index)].name = name;
    }
  }
}

for (const [categoryId, editorial] of Object.entries(englishTreatmentEditorial)) {
  const category = treatmentTranslations.en.find(({ id }) => id === categoryId);
  category.description = editorial.description;
  editorial.items.forEach((copy, index) => Object.assign(category.items[index], copy));
}

for (const [locale, categories] of Object.entries(treatmentDetailOverrides)) {
  for (const [categoryId, itemEdits] of Object.entries(categories)) {
    const category = treatmentTranslations[locale].find(({ id }) => id === categoryId);
    for (const [index, copy] of Object.entries(itemEdits)) {
      Object.assign(category.items[Number(index)], copy);
    }
  }
}

export const messages = { tr: trMessages, ...pageTranslations };

export function normalizeLocale(locale) {
  return supportedLocales.includes(locale) ? locale : defaultLocale;
}

export function getMessages(locale = defaultLocale) {
  return messages[normalizeLocale(locale)];
}

export function getTreatmentCategories(locale = defaultLocale) {
  return normalizeLocale(locale) === 'tr' ? treatmentCategories : treatmentTranslations[locale];
}

export function getLocaleDirection(locale = defaultLocale) {
  return normalizeLocale(locale) === 'ar' ? 'rtl' : 'ltr';
}

export function formatMessage(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
