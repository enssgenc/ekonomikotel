// Ekonomikotel iletişim hattı ve TÜRSAB künyesi. Numara veya belge bilgisi
// değişirse yalnızca burayı güncelleyin; ana site, sağlık bölümü ve testler
// buradan okur.
export const AGENCY = {
  phoneDisplay: "0544 341 70 20",
  // Yurt dışından aranabilen biçim; çok dilli sağlık bölümünde gösterilir.
  phoneIntl: "+90 544 341 70 20",
  tel: "+905443417020",
  whatsappE164: "905443417020",
  tursabNo: "A-12892",
  tursabGroup: "A Grubu Seyahat Acentesi",
  tursabVerifyUrl: "https://www.tursab.org.tr/tr/ddsv",
};

// KVKK veri sorumlusu (TÜRSAB A-12892 belgesinin sahibi). Ana sitedeki
// /kvkk-aydinlatma sayfası ve sağlık bölümündeki aydinlatma.html buradan okur.
export const DATA_CONTROLLER = {
  legalName:
    "Kapadokya Alperen Turizm Seyahat Restoran Ticaret Limited Şirketi",
  address:
    "Çavuşin Köyü 2. Küme Evleri 2. Mevki No:8, Avanos / Nevşehir, Türkiye",
  email: "destek@ekonomiktatilim.com",
};

export const whatsappUrl = (text = "") =>
  `https://wa.me/${AGENCY.whatsappE164}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
