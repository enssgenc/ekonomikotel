// Ekonomikotel (otel/tur) ve Cappadocia Health (sağlık turizmi) iletişim
// formlarının ortak değer listeleri. Sunucu doğrulaması, iki form ve yönetim
// paneli aynı değerleri buradan okur. Etiketler Türkçedir; sağlık formunun
// diğer dillerdeki etiketleri health/src/contact-translations.js içindedir.

export const TRAVEL_TOPICS = [
  ["hotel", "Otel konaklaması"],
  ["tour", "Kapadokya turu veya tatil paketi"],
  ["honeymoon", "Balayı"],
  ["group", "Grup veya kurumsal konaklama"],
  ["existing", "Mevcut rezervasyonum hakkında"],
  ["other", "Diğer"],
];

export const TRAVEL_AREAS = [
  ["", "Fark etmez"],
  ["urgup", "Ürgüp"],
  ["goreme", "Göreme"],
  ["uchisar", "Uçhisar"],
  ["avanos", "Avanos"],
  ["ortahisar", "Ortahisar"],
  ["mustafapasa", "Mustafapaşa"],
  ["nevsehir", "Nevşehir merkez"],
];

export const TRAVEL_BUDGETS = [
  ["", "Belirtmek istemiyorum"],
  ["economy", "Ekonomik"],
  ["standard", "Orta segment"],
  ["boutique", "Butik veya mağara otel"],
  ["premium", "Lüks"],
];

export const CONTACT_METHODS = [
  ["phone", "Telefon"],
  ["whatsapp", "WhatsApp"],
  ["email", "E-posta"],
];

export const CONTACT_TIMES = [
  ["", "Fark etmez"],
  ["morning", "Sabah (09.00–12.00)"],
  ["afternoon", "Öğleden sonra (12.00–17.00)"],
  ["evening", "Akşam (17.00–21.00)"],
];

// Kimlikler health/src/treatments.js kategori kimlikleriyle aynıdır (testle
// denetlenir); "other" formun "emin değilim" seçeneğidir.
export const HEALTH_AREAS = [
  ["dis", "Ağız ve diş"],
  ["sac", "Saç ve saçlı deri"],
  ["estetik", "Plastik ve estetik cerrahi"],
  ["cilt", "Cilt ve dermatoloji"],
  ["goz", "Göz sağlığı"],
  ["metabolik", "Kilo ve metabolik sağlık"],
  ["ortopedi", "Ortopedi ve hareket"],
  ["kadin", "Kadın sağlığı ve üreme"],
  ["kbb", "Kulak burun boğaz"],
  ["rehab", "Fizik tedavi"],
  ["kontrol", "Kontrol ve iç hastalıkları"],
  ["other", "Diğer / emin değilim"],
];

export const HEALTH_TRAVEL_WINDOWS = [
  ["", "Henüz belli değil"],
  ["1m", "1 ay içinde"],
  ["1-3m", "1–3 ay içinde"],
  ["3-6m", "3–6 ay içinde"],
  ["6m+", "6 aydan sonra"],
];

export const HEALTH_SERVICES = [
  ["accommodation", "Kapadokya’da konaklama"],
  ["transfer", "Havalimanı ve klinik transferi"],
  ["interpreter", "Tercüman desteği"],
  ["tour", "İyileşmeye uygun Kapadokya gezisi"],
];

export const HEALTH_REPORTS = [
  ["", "Belirtilmedi"],
  ["yes", "Var"],
  ["no", "Yok"],
];

export const HEALTH_LOCALES = ["tr", "en", "de", "ru", "ar", "fr"];

export const HEALTH_LANGUAGES = [
  ["tr", "Türkçe"],
  ["en", "İngilizce"],
  ["de", "Almanca"],
  ["ru", "Rusça"],
  ["ar", "Arapça"],
  ["fr", "Fransızca"],
];

// Telefon: rakam, boşluk, parantez, tire, nokta ve eğik çizgi kabul edilir.
// Sağlık formu yurt dışı ağırlıklı olduğundan ülke kodu (+ veya 00) zorunludur.
export const PHONE_PATTERN = /^\+?[\d ()./-]{7,25}$/;
export const INTL_PHONE_PATTERN = /^(?:\+|00)[\d ()./-]{7,25}$/;

// "Mevcut rezervasyon" ve "Diğer" konularında tarih/misafir/bütçe sorulmaz,
// mesaj zorunludur.
export const isPlanningTopic = (topic) =>
  topic !== "existing" && topic !== "other";
export const needsMessageTopic = (topic) =>
  topic === "existing" || topic === "other";

export const values = (list) => list.map(([value]) => value);
export const labelOf = (list, value) =>
  list.find(([key]) => key === value)?.[1] ?? value;
