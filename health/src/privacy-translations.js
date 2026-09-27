// KVKK aydınlatma metni (aydinlatma.html) — sağlık turizmi iletişim formu.
// Türkçe metin esastır; diğer beş dil onun çevirisidir ve bunu translationNote
// satırında belirtir. Metni değiştirirken altı dili birlikte güncelleyin.
// Belirteçler privacy-page.js içinde doldurulur: {legalName}, {address},
// {email}, {phone}, {tursabNo}. [[...]] bölümü bağlantı olarak çizilir
// (translationNote içinde Türkçe metne gider).
// Bölüm alanları sırayla çizilir: p, box ('controller' | 'channels'), items,
// list, after, note.
export const privacyTranslations = {
  tr: {
    meta: {
      title: 'Aydınlatma Metni | Cappadocia Health',
      description: 'Cappadocia Health sağlık turizmi iletişim formu için 6698 sayılı KVKK kapsamında aydınlatma metni.',
    },
    back: 'İletişim formuna dön',
    eyebrow: '6698 sayılı KVKK · md. 10',
    title: 'Sağlık turizmi iletişim formu aydınlatma metni',
    intro: 'Bu metin, ekonomikotel.com’un sağlık turizmi bölümü Cappadocia Health’teki iletişim formunu doldurduğunuzda ve bu talep üzerine sizinle yürüttüğümüz görüşmelerde kişisel verilerinizin nasıl işlendiğini açıklar.',
    updated: 'Son güncelleme: 27 Eylül 2026',
    translationNote: '',
    contents: 'Bu metinde',
    controllerRows: [
      ['Ticaret unvanı', '{legalName}'],
      ['Ticari ad ve markalar', 'UPTREND TRAVEL; Ekonomik Tatilim ve Ekonomikotel markaları. Cappadocia Health, ekonomikotel.com’un sağlık turizmi bölümüdür.'],
      ['TÜRSAB belge no', '{tursabNo} · A Grubu seyahat acentesi'],
      ['Adres', '{address}'],
      ['E-posta', '{email}'],
      ['Bilgi hattı', '{phone}'],
    ],
    channelRows: [
      ['E-posta', '{email}'],
      ['Yazılı başvuru', '{address} adresine ıslak imzalı dilekçeyle'],
      ['Bilgi hattı', '{phone} (sorularınız için; başvurular yazılı olarak veya e-postayla yapılır)'],
      ['Yanıt süresi', 'Başvurunuzu niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak sonuçlandırırız. İşlemin ayrıca bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu’nun belirlediği tarifedeki ücret alınabilir.'],
    ],
    sections: [
      {
        heading: 'Veri sorumlusu',
        p: ['6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu, bilgileri aşağıda yer alan şirkettir:'],
        box: 'controller',
      },
      {
        heading: 'Hangi kişisel verileri işliyoruz?',
        p: ['Formda yalnızca talebinizi anlamak ve size dönmek için gereken bilgileri istiyoruz:'],
        items: [
          ['Kimlik', 'Adınız ve soyadınız.'],
          ['İletişim', 'Telefon veya WhatsApp numaranız, e-posta adresiniz (e-postayla dönüş seçmediyseniz isteğe bağlıdır), yaşadığınız ülke, tercih ettiğiniz iletişim yöntemi ve görüşme dili.'],
          ['Sağlık verileri (özel nitelikli)', 'İlgilendiğiniz tedavi alanı ve işlem, ihtiyacınızı anlatan açıklama ve yakın tarihli rapor, röntgen veya fotoğrafınız olup olmadığı bilgisi.'],
          ['Seyahat planı', 'Düşündüğünüz seyahat zamanı, size eşlik edecek kişi sayısı ve planlamamızı istediğiniz ek hizmetler (konaklama, transfer, tercüman, gezi).'],
          ['İşlem kayıtları', 'Talep numarası, gönderim tarihi ve saati, onaylarınızın kaydı ve formu doldurduğunuz sayfanın dili. Kötüye kullanımı sınırlamak için IP adresiniz özetlenmiş (hash) biçimde kısa süreli işlenir; talebinizle birlikte saklanmaz.'],
        ],
        after: ['Talebiniz üzerine telefon, WhatsApp veya e-postayla yaptığımız görüşmelerde bize ilettiğiniz bilgiler de bu metindeki amaçlarla işlenir.'],
        note: 'Formda tahlil sonucu, rapor veya ayrıntılı tıbbi geçmiş istemiyoruz; lütfen bunları forma yazmayın ve dosya göndermeyin. Belge gerekirse talebinizi değerlendirecek sağlık kuruluşu bunları sizden ayrıca ister. Site, seçtiğiniz dili yalnızca tarayıcınızda saklar; bu bilgi bize gönderilmez.',
      },
      {
        heading: 'Verilerinizi hangi amaçlarla işliyoruz?',
        list: [
          'Sağlık turizmi talebinizi almak, kaydetmek ve ön değerlendirmesini yapmak',
          'Seçtiğiniz yöntemle ve dilde sizinle iletişime geçmek, sorularınızı yanıtlamak',
          'Açık rızanız varsa talebinizi, onu değerlendirecek yetkili sağlık kuruluşuna ön değerlendirme için iletmek',
          'İstediğiniz konaklama, transfer, tercüman ve gezi hizmetlerini planlamak ve bunlar için teklif hazırlamak',
          'Talep kayıtlarını yönetmek, mükerrer ve kötü amaçlı gönderimleri önlemek, bilgi güvenliğini sağlamak',
        ],
      },
      {
        heading: 'Hukuki sebepler ve toplama yöntemi',
        items: [
          ['Kimlik, iletişim ve seyahat planı verileri', 'Talebiniz üzerine sözleşme kurulmasına yönelik adımlar için KVKK md. 5/2-c (bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması); talebinizi yanıtlama, kayıtları yönetme ve kötüye kullanımı önleme konusundaki meşru menfaatimiz için KVKK md. 5/2-f.'],
          ['Sağlık verileri', 'KVKK md. 6 uyarınca açık rızanız. Rızanızı formdaki ayrı onay kutusuyla verirsiniz.'],
          ['Rezervasyona dönüşen talepler', 'Talebiniz bir rezervasyona dönüşürse fatura düzenleme ve kayıt tutma gibi yasal yükümlülükler için KVKK md. 5/2-ç (hukuki yükümlülük).'],
        ],
        after: [
          'Açık rıza vermek zorunda değilsiniz. Ancak form sağlık alanı bilgisi içerdiği için rızanız olmadan gönderilemez; bu durumda genel sorularınız için bilgi hattımızı arayabilirsiniz.',
          'Verileriniz elektronik ortamda, web sitesindeki form ve sonrasında seçtiğiniz iletişim kanalları (telefon, WhatsApp, e-posta) aracılığıyla toplanır.',
        ],
      },
      {
        heading: 'Verilerinizi kimlerle paylaşıyoruz?',
        items: [
          ['Talebinizi değerlendirecek yetkili sağlık kuruluşu', 'Yalnızca açık rızanız varsa ve ön değerlendirme amacıyla, sağlık verileriniz ile değerlendirme için gereken kimlik ve iletişim bilgileriniz bu kuruluşa iletilir. Kuruluşun adını paylaşımdan önce size bildiririz; bu aşamada rızanızı geri çekerseniz bilgileriniz o kuruluşa iletilmez. Kuruluşun sizden doğrudan istediği bilgi ve belgeler bakımından veri sorumlusu o kuruluştur.'],
          ['Seyahat hizmeti sağlayıcıları', 'Yalnızca konaklama, transfer, tercüman veya gezi hizmetiyle rezervasyona geçmek istemeniz hâlinde, hizmet için gereken ad, tarih ve iletişim bilgileri ilgili otel, transfer, tercüman veya tur sağlayıcısına iletilir. Talebinizin sağlıkla ilgili ayrıntıları, hizmet için zorunlu olmadıkça bu sağlayıcılarla paylaşılmaz.'],
          ['Barındırma ve altyapı sağlayıcısı', 'Form kayıtları, barındırma hizmeti aldığımız Hostinger’ın Almanya’daki (Frankfurt) veri merkezinde bulunan sunucuda (VPS) tutulur. Sağlayıcı, bu altyapıyı hizmetinin teknik gereği olarak işletir.'],
          ['Yetkili kamu kurum ve kuruluşları', 'Yalnızca mevzuattan doğan bir yükümlülük veya yetkili makamların talebi hâlinde.'],
        ],
        note: 'WhatsApp’ı iletişim yöntemi olarak seçerseniz yazışmalarımız WhatsApp altyapısı üzerinden yürür; bu hizmetin kendi gizlilik koşulları geçerlidir.',
      },
      {
        heading: 'Yurt dışına aktarım',
        p: [
          'Form kayıtları Almanya’daki sunucuda saklandığından, formu gönderdiğinizde verileriniz yurt dışına aktarılmış olur; bu aktarım KVKK md. 9 kapsamındadır. Bunun dışında verileriniz yurt dışına yalnızca açık rızanızla ya da yurt dışındaki bir sağlık kuruluşunu veya hizmet sağlayıcısını kendiniz tercih etmeniz hâlinde KVKK md. 9’daki şartlar sağlanarak aktarılır.',
          'Yurt dışında yaşıyorsanız sizinle, seçtiğiniz kanal üzerinden (telefon, WhatsApp veya e-posta) iletişim kurarız. Bu iletişim, sizin ve bizim kullandığımız iletişim hizmetlerinin altyapısı üzerinden yürür.',
        ],
      },
      {
        heading: 'Ne kadar süre saklıyoruz?',
        items: [
          ['İletişim ve talep kayıtları', 'Kimlik, iletişim ve seyahat planı bilgileri, talebin kapatılmasından itibaren en fazla 2 yıl saklanır.'],
          ['Sağlık verileri', 'Ön değerlendirme sona erdiğinde ve her hâlde talep tarihinden itibaren en geç 1 yıl içinde silinir veya anonim hâle getirilir.'],
          ['Özetlenmiş IP kaydı', 'Yalnızca kötüye kullanımı sınırlamak için kısa süreli tutulur.'],
        ],
        after: ['Talebiniz rezervasyona dönüşürse veya bir yasal yükümlülük daha uzun saklamayı gerektirirse ilgili veriler bu süre boyunca saklanır. Süre dolduğunda verileriniz silinir, yok edilir veya anonim hâle getirilir.'],
      },
      {
        heading: 'Açık rızanızı geri alma',
        p: ['Sağlık verileriniz için verdiğiniz açık rızayı dilediğiniz zaman, aşağıdaki başvuru kanallarından bize bildirerek geri alabilirsiniz. Geri alma, sonraki işlemeleri durdurur; o ana kadar rızanıza dayanılarak yapılan işlemleri geçersiz kılmaz. Rızanızı geri alırsanız ön değerlendirme süreci devam edemeyebilir.'],
      },
      {
        heading: 'KVKK md. 11 kapsamındaki haklarınız',
        p: ['KVKK’nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:'],
        list: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
          'İşlenmişse buna ilişkin bilgi talep etme',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
          'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
          'KVKK md. 7 çerçevesinde silinmesini veya yok edilmesini isteme',
          'Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme',
          'İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme',
          'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
        ],
      },
      {
        heading: 'Başvuru yolları',
        p: ['Haklarınızı kullanmak veya açık rızanızı geri almak için bize aşağıdaki yollarla başvurabilirsiniz. Başvurunuzda adınızı ve soyadınızı, iletişim bilginizi, varsa talep numaranızı (ör. CH-…) ve talebinizin konusunu belirtin. Kimliğinizi doğrulamak için ek bilgi isteyebiliriz.'],
        box: 'channels',
        after: ['Başvurunuz reddedilirse, verdiğimiz yanıtı yetersiz bulursanız veya süresinde yanıt verilmezse; yanıtı öğrendiğiniz tarihten itibaren 30 gün ve her hâlde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu’na şikâyette bulunabilirsiniz.'],
      },
    ],
  },
  en: {
    meta: {
      title: 'Privacy notice | Cappadocia Health',
      description: 'Privacy notice under Turkey’s Personal Data Protection Law (KVKK, No. 6698) for the Cappadocia Health contact form.',
    },
    back: 'Back to the contact form',
    eyebrow: 'Law No. 6698 (KVKK) · Article 10',
    title: 'Privacy notice for the health travel contact form',
    intro: 'This notice explains how your personal data is processed when you fill in the contact form on Cappadocia Health, the health tourism section of ekonomikotel.com, and in the conversations we have with you about that request.',
    updated: 'Last updated: 27 September 2026',
    translationNote: 'This is a translation; the [[Turkish text]] is the authoritative version.',
    contents: 'In this notice',
    controllerRows: [
      ['Legal name', '{legalName}'],
      ['Trade name and brands', 'UPTREND TRAVEL; the Ekonomik Tatilim and Ekonomikotel brands. Cappadocia Health is the health tourism section of ekonomikotel.com.'],
      ['TÜRSAB licence no.', '{tursabNo} · Group A travel agency'],
      ['Address', '{address}'],
      ['Email', '{email}'],
      ['Information line', '{phone}'],
    ],
    channelRows: [
      ['Email', '{email}'],
      ['In writing', 'By signed letter to {address}'],
      ['Information line', '{phone} (for questions; applications are made in writing or by email)'],
      ['Response time', 'We handle your application free of charge, as quickly as its nature allows and within 30 days at the latest. If the process involves an additional cost, a fee set in the Personal Data Protection Board’s tariff may be charged.'],
    ],
    sections: [
      {
        heading: 'Data controller',
        p: ['Under Turkey’s Personal Data Protection Law No. 6698 (“KVKK”), the data controller is the company below:'],
        box: 'controller',
      },
      {
        heading: 'What personal data we process',
        p: ['The form only asks for what we need to understand your request and get back to you:'],
        items: [
          ['Identity', 'Your first and last name.'],
          ['Contact details', 'Your phone or WhatsApp number, your email address (optional unless you ask us to reply by email), your country of residence, and your preferred contact method and language.'],
          ['Health data (special category)', 'The care area and treatment you are interested in, your description of what you need, and whether you have recent reports, X-rays or photos.'],
          ['Travel plans', 'When you are thinking of travelling, how many people will accompany you, and any extra services you would like us to arrange (accommodation, transfers, interpreter, outings).'],
          ['Request records', 'Your reference number, the date and time of submission, a record of your consents and the language of the page. To limit misuse, your IP address is processed briefly in hashed form; it is not stored with your request.'],
        ],
        after: ['Information you give us in phone, WhatsApp or email conversations about your request is processed for the purposes described in this notice.'],
        note: 'The form does not ask for test results, reports or a detailed medical history — please don’t enter them or send files. If documents are needed, the healthcare provider evaluating your request will ask you for them separately. The site stores your language choice only in your browser; it is not sent to us.',
      },
      {
        heading: 'Why we process your data',
        list: [
          'To receive and record your health travel request and carry out its preliminary review',
          'To contact you by the method and in the language you chose, and answer your questions',
          'With your explicit consent, to pass your request to the licensed healthcare provider that will evaluate it, for a preliminary review',
          'To plan the accommodation, transfer, interpreter and outing services you ask for, and prepare quotes for them',
          'To manage request records, prevent duplicate and malicious submissions, and keep information secure',
        ],
      },
      {
        heading: 'Legal bases and how we collect data',
        items: [
          ['Identity, contact and travel data', 'KVKK Art. 5(2)(c) — processing directly related to concluding or performing a contract — for the steps towards a contract that you request; and KVKK Art. 5(2)(f) — our legitimate interest in answering your request, managing records and preventing misuse.'],
          ['Health data', 'Your explicit consent under KVKK Art. 6, given with the separate checkbox in the form.'],
          ['Requests that become bookings', 'If your request becomes a booking, KVKK Art. 5(2)(ç) — legal obligation — for duties such as invoicing and record keeping.'],
        ],
        after: [
          'You do not have to give explicit consent. However, because the form includes health information, it cannot be sent without your consent; in that case you can call our information line with general questions.',
          'Your data is collected electronically through the form on the website and then through the contact channels you chose (phone, WhatsApp, email).',
        ],
      },
      {
        heading: 'Who we share your data with',
        items: [
          ['The licensed healthcare provider that will evaluate your request', 'Only with your explicit consent and for the preliminary review, your health data and the identity and contact details needed for the evaluation are passed to this provider. We tell you the provider’s name before sharing; if you withdraw your consent at that point, your information is not passed to that provider. For information and documents the provider asks you for directly, that provider is the data controller.'],
          ['Travel service providers', 'Only if you decide to go ahead with a booking for accommodation, transfers, an interpreter or outings, the name, dates and contact details needed for the service are passed to the hotel, transfer, interpreter or tour provider concerned. Health-related details of your request are not shared with them unless the service requires it.'],
          ['Hosting and infrastructure provider', 'Form records are kept on a server (VPS) in the Frankfurt, Germany data centre of Hostinger, our hosting provider. The provider operates this infrastructure as a technical part of its service.'],
          ['Authorised public bodies', 'Only where the law requires it or at the request of competent authorities.'],
        ],
        note: 'If you choose WhatsApp as your contact method, our messages run over WhatsApp’s infrastructure and that service’s own privacy terms apply.',
      },
      {
        heading: 'Transfers abroad',
        p: [
          'Because form records are stored on a server in Germany, sending the form transfers your data abroad; this transfer falls under Article 9 of the KVKK. Apart from that, your personal data is transferred abroad only with your explicit consent, or if you yourself choose a healthcare provider or service provider abroad, and only where the conditions of KVKK Article 9 are met.',
          'If you live outside Turkey, we contact you through the channel you chose (phone, WhatsApp or email). This communication runs over the infrastructure of the communication services you and we use.',
        ],
      },
      {
        heading: 'How long we keep your data',
        items: [
          ['Contact and request records', 'Identity, contact and travel details are kept for up to 2 years after the request is closed.'],
          ['Health data', 'Deleted or anonymised when the preliminary review ends, and in any case no later than 1 year after the request.'],
          ['Hashed IP record', 'Kept only briefly, to limit misuse.'],
        ],
        after: ['If your request becomes a booking or a legal obligation requires longer retention, the relevant data is kept for that period. When the period ends, your data is deleted, destroyed or anonymised.'],
      },
      {
        heading: 'Withdrawing your explicit consent',
        p: ['You can withdraw the explicit consent you gave for your health data at any time by telling us through the application channels below. Withdrawal stops any further processing; it does not invalidate processing carried out on the basis of your consent before then. If you withdraw your consent, the preliminary review may not be able to continue.'],
      },
      {
        heading: 'Your rights under KVKK Article 11',
        p: ['Under Article 11 of the KVKK, you have the right to:'],
        list: [
          'Learn whether your personal data is processed',
          'Request information about it if it has been processed',
          'Learn the purpose of the processing and whether the data is used accordingly',
          'Know the third parties in Turkey or abroad to whom it has been transferred',
          'Ask for it to be corrected if it is incomplete or inaccurate',
          'Ask for it to be deleted or destroyed under Article 7 of the KVKK',
          'Ask for corrections, deletions and destructions to be notified to the third parties to whom the data was transferred',
          'Object to a result against you that arises from analysis of your data exclusively by automated systems',
          'Claim compensation if you suffer damage because of unlawful processing',
        ],
      },
      {
        heading: 'How to apply',
        p: ['To exercise your rights or withdraw your explicit consent, you can apply to us as follows. Please include your full name, your contact details, your reference number if you have one (e.g. CH-…) and what your request is about. We may ask for additional information to verify your identity.'],
        box: 'channels',
        after: ['If your application is rejected, you find our answer insufficient, or we do not answer in time, you may complain to the Personal Data Protection Board (Kişisel Verileri Koruma Kurulu) within 30 days of learning of our answer and in any case within 60 days of your application.'],
      },
    ],
  },
  de: {
    meta: {
      title: 'Datenschutzhinweise | Cappadocia Health',
      description: 'Datenschutzhinweise nach dem türkischen Datenschutzgesetz (KVKK, Nr. 6698) zum Kontaktformular von Cappadocia Health.',
    },
    back: 'Zurück zum Kontaktformular',
    eyebrow: 'Gesetz Nr. 6698 (KVKK) · Art. 10',
    title: 'Datenschutzhinweise zum Kontaktformular für Gesundheitsreisen',
    intro: 'Diese Hinweise erläutern, wie Ihre personenbezogenen Daten verarbeitet werden, wenn Sie das Kontaktformular von Cappadocia Health – dem Bereich für Gesundheitstourismus auf ekonomikotel.com – ausfüllen und wenn wir anschließend mit Ihnen über Ihre Anfrage sprechen.',
    updated: 'Zuletzt aktualisiert: 27. September 2026',
    translationNote: 'Dies ist eine Übersetzung; maßgeblich ist der [[türkische Text]].',
    contents: 'Inhalt',
    controllerRows: [
      ['Firma', '{legalName}'],
      ['Handelsname und Marken', 'UPTREND TRAVEL; die Marken Ekonomik Tatilim und Ekonomikotel. Cappadocia Health ist der Bereich für Gesundheitstourismus auf ekonomikotel.com.'],
      ['TÜRSAB-Lizenznr.', '{tursabNo} · Reisebüro der Gruppe A'],
      ['Anschrift', '{address}'],
      ['E-Mail', '{email}'],
      ['Infotelefon', '{phone}'],
    ],
    channelRows: [
      ['E-Mail', '{email}'],
      ['Schriftlich', 'Per unterschriebenem Brief an {address}'],
      ['Infotelefon', '{phone} (für Fragen; Anträge bitte schriftlich oder per E-Mail)'],
      ['Antwortfrist', 'Wir bearbeiten Ihren Antrag kostenlos, je nach Art so schnell wie möglich und spätestens innerhalb von 30 Tagen. Verursacht die Bearbeitung zusätzliche Kosten, kann eine Gebühr nach dem Tarif des Rates für den Schutz personenbezogener Daten erhoben werden.'],
    ],
    sections: [
      {
        heading: 'Verantwortlicher',
        p: ['Verantwortlicher im Sinne des türkischen Gesetzes Nr. 6698 zum Schutz personenbezogener Daten („KVKK“) ist das folgende Unternehmen:'],
        box: 'controller',
      },
      {
        heading: 'Welche Daten wir verarbeiten',
        p: ['Im Formular fragen wir nur, was wir brauchen, um Ihre Anfrage zu verstehen und uns bei Ihnen zu melden:'],
        items: [
          ['Identität', 'Ihr Vor- und Nachname.'],
          ['Kontaktdaten', 'Ihre Telefon- oder WhatsApp-Nummer, Ihre E-Mail-Adresse (freiwillig, außer Sie wünschen eine Antwort per E-Mail), Ihr Wohnsitzland sowie Ihr bevorzugter Kontaktweg und Ihre bevorzugte Sprache.'],
          ['Gesundheitsdaten (besondere Kategorie)', 'Der Behandlungsbereich und die Behandlung, die Sie interessieren, Ihre Beschreibung Ihres Anliegens und die Angabe, ob Sie aktuelle Befunde, Röntgenbilder oder Fotos haben.'],
          ['Reiseplanung', 'Ihr ungefährer Reisezeitraum, die Zahl Ihrer Begleitpersonen und gewünschte Zusatzleistungen (Unterkunft, Transfer, Dolmetscher, Ausflüge).'],
          ['Vorgangsdaten', 'Referenznummer, Datum und Uhrzeit des Absendens, ein Nachweis Ihrer Einwilligungen und die Sprache der Seite. Zur Begrenzung von Missbrauch wird Ihre IP-Adresse kurzzeitig in gehashter Form verarbeitet; sie wird nicht mit Ihrer Anfrage gespeichert.'],
        ],
        after: ['Angaben, die Sie uns in Gesprächen per Telefon, WhatsApp oder E-Mail zu Ihrer Anfrage machen, werden zu den in diesen Hinweisen genannten Zwecken verarbeitet.'],
        note: 'Wir fragen im Formular nicht nach Laborwerten, Befunden oder einer ausführlichen Krankengeschichte – bitte tragen Sie diese nicht ein und senden Sie keine Dateien. Falls Unterlagen nötig sind, fordert die Gesundheitseinrichtung, die Ihre Anfrage prüft, sie gesondert bei Ihnen an. Die Website speichert Ihre Sprachwahl nur in Ihrem Browser; sie wird nicht an uns übermittelt.',
      },
      {
        heading: 'Zwecke der Verarbeitung',
        list: [
          'Ihre Anfrage zur Gesundheitsreise entgegennehmen, erfassen und vorab prüfen',
          'Sie auf dem gewählten Weg und in der gewählten Sprache kontaktieren und Ihre Fragen beantworten',
          'Mit Ihrer ausdrücklichen Einwilligung Ihre Anfrage zur Vorabprüfung an die zugelassene Gesundheitseinrichtung weitergeben, die sie prüfen wird',
          'Die gewünschte Unterkunft, Transfers, Dolmetscher und Ausflüge planen und Angebote dafür erstellen',
          'Anfragen verwalten, doppelte und missbräuchliche Übermittlungen verhindern und die Informationssicherheit gewährleisten',
        ],
      },
      {
        heading: 'Rechtsgrundlagen und Art der Erhebung',
        items: [
          ['Identitäts-, Kontakt- und Reisedaten', 'Art. 5 Abs. 2 lit. c KVKK (unmittelbarer Zusammenhang mit dem Abschluss oder der Erfüllung eines Vertrags) für die Schritte zu einem Vertrag, die Sie anfragen; Art. 5 Abs. 2 lit. f KVKK (unser berechtigtes Interesse, Ihre Anfrage zu beantworten, Vorgänge zu verwalten und Missbrauch zu verhindern).'],
          ['Gesundheitsdaten', 'Ihre ausdrückliche Einwilligung nach Art. 6 KVKK, die Sie über das gesonderte Kästchen im Formular erteilen.'],
          ['Anfragen, aus denen eine Buchung wird', 'Wird aus Ihrer Anfrage eine Buchung: Art. 5 Abs. 2 lit. ç KVKK (rechtliche Verpflichtung) für Pflichten wie Rechnungsstellung und Aufbewahrung.'],
        ],
        after: [
          'Sie sind nicht verpflichtet, eine ausdrückliche Einwilligung zu erteilen. Da das Formular Gesundheitsangaben enthält, kann es ohne Ihre Einwilligung jedoch nicht abgesendet werden; allgemeine Fragen können Sie uns dann über das Infotelefon stellen.',
          'Ihre Daten werden elektronisch über das Formular auf der Website und anschließend über die von Ihnen gewählten Kontaktwege (Telefon, WhatsApp, E-Mail) erhoben.',
        ],
      },
      {
        heading: 'Empfänger',
        items: [
          ['Die zugelassene Gesundheitseinrichtung, die Ihre Anfrage prüft', 'Nur mit Ihrer ausdrücklichen Einwilligung und zur Vorabprüfung werden Ihre Gesundheitsdaten sowie die dafür nötigen Identitäts- und Kontaktdaten an diese Einrichtung weitergegeben. Den Namen der Einrichtung nennen wir Ihnen vor der Weitergabe; widerrufen Sie Ihre Einwilligung zu diesem Zeitpunkt, werden Ihre Angaben nicht an diese Einrichtung weitergegeben. Für Angaben und Unterlagen, die die Einrichtung direkt bei Ihnen anfordert, ist sie selbst Verantwortliche.'],
          ['Anbieter von Reiseleistungen', 'Nur wenn Sie Unterkunft, Transfer, Dolmetscher oder Ausflüge verbindlich buchen möchten, werden Name, Daten und Kontaktangaben, die für die Leistung nötig sind, an das jeweilige Hotel bzw. den Transfer-, Dolmetsch- oder Touranbieter weitergegeben. Gesundheitsbezogene Einzelheiten Ihrer Anfrage erhalten sie nur, wenn die Leistung es erfordert.'],
          ['Hosting- und Infrastrukturanbieter', 'Die Formulardaten werden auf einem Server (VPS) im Rechenzentrum unseres Hosting-Anbieters Hostinger in Frankfurt (Deutschland) gespeichert. Der Anbieter betreibt diese Infrastruktur als technischen Teil seiner Leistung.'],
          ['Zuständige Behörden', 'Nur bei gesetzlicher Verpflichtung oder auf Anforderung zuständiger Stellen.'],
        ],
        note: 'Wenn Sie WhatsApp als Kontaktweg wählen, läuft unsere Kommunikation über die Infrastruktur von WhatsApp; es gelten die Datenschutzbestimmungen dieses Dienstes.',
      },
      {
        heading: 'Übermittlung ins Ausland',
        p: [
          'Da die Formulardaten auf einem Server in Deutschland gespeichert werden, werden Ihre Daten mit dem Absenden des Formulars ins Ausland übermittelt; diese Übermittlung fällt unter Art. 9 KVKK. Darüber hinaus werden Ihre Daten nur mit Ihrer ausdrücklichen Einwilligung oder dann ins Ausland übermittelt, wenn Sie selbst eine Gesundheitseinrichtung oder einen Dienstleister im Ausland wählen, und nur unter den Voraussetzungen von Art. 9 KVKK.',
          'Wenn Sie außerhalb der Türkei leben, kontaktieren wir Sie über den von Ihnen gewählten Weg (Telefon, WhatsApp oder E-Mail). Diese Kommunikation läuft über die Infrastruktur der Kommunikationsdienste, die Sie und wir nutzen.',
        ],
      },
      {
        heading: 'Speicherdauer',
        items: [
          ['Kontakt- und Anfragedaten', 'Identitäts-, Kontakt- und Reisedaten werden bis zu 2 Jahre nach Abschluss der Anfrage gespeichert.'],
          ['Gesundheitsdaten', 'Werden nach Ende der Vorabprüfung, spätestens jedoch 1 Jahr nach der Anfrage gelöscht oder anonymisiert.'],
          ['Gehashter IP-Eintrag', 'Wird nur kurzzeitig zur Begrenzung von Missbrauch gespeichert.'],
        ],
        after: ['Wird aus Ihrer Anfrage eine Buchung oder verlangt eine gesetzliche Pflicht eine längere Aufbewahrung, werden die betreffenden Daten für diesen Zeitraum gespeichert. Danach werden Ihre Daten gelöscht, vernichtet oder anonymisiert.'],
      },
      {
        heading: 'Widerruf Ihrer ausdrücklichen Einwilligung',
        p: ['Sie können Ihre ausdrückliche Einwilligung für Ihre Gesundheitsdaten jederzeit widerrufen, indem Sie uns über die unten genannten Wege Bescheid geben. Der Widerruf beendet die weitere Verarbeitung; die bis dahin auf Grundlage Ihrer Einwilligung erfolgte Verarbeitung bleibt davon unberührt. Nach einem Widerruf kann die Vorabprüfung möglicherweise nicht fortgesetzt werden.'],
      },
      {
        heading: 'Ihre Rechte nach Art. 11 KVKK',
        p: ['Nach Art. 11 KVKK haben Sie folgende Rechte:'],
        list: [
          'Auskunft darüber, ob Ihre personenbezogenen Daten verarbeitet werden',
          'Informationen über die Verarbeitung, falls sie erfolgt',
          'Kenntnis des Verarbeitungszwecks und ob die Daten zweckentsprechend verwendet werden',
          'Kenntnis der Dritten im In- oder Ausland, an die die Daten übermittelt wurden',
          'Berichtigung unvollständiger oder unrichtiger Daten',
          'Löschung oder Vernichtung nach Art. 7 KVKK',
          'Mitteilung von Berichtigung, Löschung und Vernichtung an die Dritten, an die die Daten übermittelt wurden',
          'Widerspruch gegen ein für Sie nachteiliges Ergebnis, das sich aus einer ausschließlich automatisierten Auswertung Ihrer Daten ergibt',
          'Ersatz des Schadens, der Ihnen durch eine rechtswidrige Verarbeitung entsteht',
        ],
      },
      {
        heading: 'So wenden Sie sich an uns',
        p: ['Um Ihre Rechte auszuüben oder Ihre ausdrückliche Einwilligung zu widerrufen, können Sie sich wie folgt an uns wenden. Bitte nennen Sie Ihren Vor- und Nachnamen, Ihre Kontaktdaten, gegebenenfalls Ihre Referenznummer (z. B. CH-…) und Ihr Anliegen. Zur Prüfung Ihrer Identität können wir zusätzliche Angaben anfordern.'],
        box: 'channels',
        after: ['Wird Ihr Antrag abgelehnt, halten Sie unsere Antwort für unzureichend oder antworten wir nicht fristgerecht, können Sie innerhalb von 30 Tagen, nachdem Sie von unserer Antwort erfahren haben, und in jedem Fall innerhalb von 60 Tagen ab Antragstellung Beschwerde beim Rat für den Schutz personenbezogener Daten (Kişisel Verileri Koruma Kurulu) einlegen.'],
      },
    ],
  },
  ru: {
    meta: {
      title: 'Обработка персональных данных | Cappadocia Health',
      description: 'Уведомление об обработке персональных данных по турецкому закону KVKK (№ 6698) для контактной формы Cappadocia Health.',
    },
    back: 'Вернуться к форме',
    eyebrow: 'Закон № 6698 (KVKK) · ст. 10',
    title: 'Уведомление об обработке персональных данных для формы медицинского туризма',
    intro: 'Здесь объясняется, как обрабатываются ваши персональные данные, когда вы заполняете контактную форму Cappadocia Health — раздела медицинского туризма сайта ekonomikotel.com, — и когда мы затем обсуждаем с вами ваш запрос.',
    updated: 'Последнее обновление: 27 сентября 2026 г.',
    translationNote: 'Это перевод; основным является [[текст на турецком языке]].',
    contents: 'Содержание',
    controllerRows: [
      ['Наименование компании', '{legalName}'],
      ['Торговое название и бренды', 'UPTREND TRAVEL; бренды Ekonomik Tatilim и Ekonomikotel. Cappadocia Health — раздел медицинского туризма сайта ekonomikotel.com.'],
      ['Лицензия TÜRSAB №', '{tursabNo} · туристическое агентство группы A'],
      ['Адрес', '{address}'],
      ['Эл. почта', '{email}'],
      ['Информационная линия', '{phone}'],
    ],
    channelRows: [
      ['Эл. почта', '{email}'],
      ['Письменно', 'Подписанным письмом по адресу: {address}'],
      ['Информационная линия', '{phone} (для вопросов; обращения подаются письменно или по эл. почте)'],
      ['Срок ответа', 'Мы рассматриваем обращение бесплатно, как можно быстрее с учётом его характера и не позднее чем через 30 дней. Если рассмотрение требует дополнительных расходов, может взиматься плата по тарифу Совета по защите персональных данных.'],
    ],
    sections: [
      {
        heading: 'Оператор данных',
        p: ['В соответствии с турецким законом № 6698 о защите персональных данных («KVKK») оператором данных является следующая компания:'],
        box: 'controller',
      },
      {
        heading: 'Какие данные мы обрабатываем',
        p: ['В форме мы запрашиваем только то, что нужно, чтобы понять ваш запрос и связаться с вами:'],
        items: [
          ['Идентификационные данные', 'Ваши имя и фамилия.'],
          ['Контактные данные', 'Номер телефона или WhatsApp, адрес электронной почты (необязательно, если вы не выбрали ответ по почте), страна проживания, удобный способ связи и язык общения.'],
          ['Данные о здоровье (особая категория)', 'Интересующее вас направление лечения и процедура, ваше описание запроса и сведения о том, есть ли у вас недавние заключения, рентгеновские снимки или фото.'],
          ['Планы поездки', 'Предполагаемые сроки поездки, число сопровождающих и дополнительные услуги, которые вы хотите заказать (проживание, трансфер, переводчик, прогулки).'],
          ['Данные о запросе', 'Номер запроса, дата и время отправки, запись о ваших согласиях и язык страницы. Чтобы ограничить злоупотребления, ваш IP-адрес кратковременно обрабатывается в хешированном виде; вместе с запросом он не хранится.'],
        ],
        after: ['Сведения, которые вы сообщаете нам по телефону, в WhatsApp или по электронной почте в связи с запросом, обрабатываются в целях, указанных в этом уведомлении.'],
        note: 'Мы не запрашиваем в форме результаты анализов, заключения или подробную историю болезни — пожалуйста, не указывайте их и не присылайте файлы. Если понадобятся документы, их отдельно запросит медицинское учреждение, которое будет рассматривать ваш запрос. Сайт хранит выбранный язык только в вашем браузере; нам эти сведения не передаются.',
      },
      {
        heading: 'Цели обработки',
        list: [
          'Принять, зарегистрировать и предварительно рассмотреть ваш запрос о медицинской поездке',
          'Связаться с вами выбранным способом и на выбранном языке, ответить на ваши вопросы',
          'С вашего явного согласия передать запрос для предварительной оценки лицензированному медицинскому учреждению, которое будет его рассматривать',
          'Спланировать проживание, трансфер, услуги переводчика и прогулки, которые вы запросили, и подготовить предложения',
          'Вести учёт запросов, предотвращать повторные и злонамеренные отправки, обеспечивать информационную безопасность',
        ],
      },
      {
        heading: 'Правовые основания и способ сбора',
        items: [
          ['Идентификационные и контактные данные, планы поездки', 'Подп. «c» п. 2 ст. 5 KVKK (непосредственная связь с заключением или исполнением договора) — для шагов к договору, о которых вы просите; подп. «f» п. 2 ст. 5 KVKK (наш законный интерес — ответить на запрос, вести учёт и предотвращать злоупотребления).'],
          ['Данные о здоровье', 'Ваше явное согласие по ст. 6 KVKK, которое вы даёте отдельной отметкой в форме.'],
          ['Запросы, ставшие бронированием', 'Если запрос переходит в бронирование, — подп. «ç» п. 2 ст. 5 KVKK (юридическая обязанность) для таких обязанностей, как выставление счетов и хранение документов.'],
        ],
        after: [
          'Вы не обязаны давать явное согласие. Однако форма содержит сведения о здоровье, поэтому без согласия её нельзя отправить; в этом случае с общими вопросами можно позвонить на нашу информационную линию.',
          'Данные собираются в электронном виде через форму на сайте, а затем через выбранные вами каналы связи (телефон, WhatsApp, эл. почта).',
        ],
      },
      {
        heading: 'Кому мы передаём данные',
        items: [
          ['Лицензированное медицинское учреждение, которое будет рассматривать запрос', 'Только с вашего явного согласия и для предварительной оценки этому учреждению передаются данные о здоровье, а также необходимые для оценки идентификационные и контактные данные. Название учреждения мы сообщаем вам до передачи; если на этом этапе вы отзовёте согласие, сведения этому учреждению не передаются. В отношении сведений и документов, которые учреждение запрашивает у вас напрямую, оператором данных является само учреждение.'],
          ['Поставщики туристических услуг', 'Только если вы решите забронировать проживание, трансфер, переводчика или прогулки, имя, даты и контактные данные, необходимые для услуги, передаются соответствующему отелю, трансферной компании, переводчику или туроператору. Сведения о здоровье из вашего запроса им не передаются, если этого не требует сама услуга.'],
          ['Хостинг-провайдер и поставщик инфраструктуры', 'Данные из формы хранятся на сервере (VPS) в дата-центре нашего хостинг-провайдера Hostinger во Франкфурте (Германия). Провайдер обслуживает эту инфраструктуру в рамках технической части своих услуг.'],
          ['Уполномоченные государственные органы', 'Только если это требуется по закону или по запросу компетентных органов.'],
        ],
        note: 'Если вы выберете WhatsApp для связи, переписка будет идти через инфраструктуру WhatsApp, и к ней применяются условия конфиденциальности этого сервиса.',
      },
      {
        heading: 'Передача за границу',
        p: [
          'Поскольку данные из формы хранятся на сервере в Германии, при отправке формы ваши данные передаются за границу; такая передача регулируется статьёй 9 KVKK. Помимо этого, ваши персональные данные передаются за границу только с вашего явного согласия или если вы сами выбираете медицинское учреждение или поставщика услуг за рубежом, и только при соблюдении условий статьи 9 KVKK.',
          'Если вы живёте за пределами Турции, мы связываемся с вами по выбранному вами каналу (телефон, WhatsApp или эл. почта). Такая связь идёт через инфраструктуру сервисов связи, которыми пользуетесь вы и мы.',
        ],
      },
      {
        heading: 'Сроки хранения',
        items: [
          ['Контактные данные и данные запроса', 'Идентификационные и контактные данные, а также планы поездки хранятся не более 2 лет после закрытия запроса.'],
          ['Данные о здоровье', 'Удаляются или обезличиваются по окончании предварительной оценки и в любом случае не позднее 1 года после запроса.'],
          ['Хешированная запись IP-адреса', 'Хранится кратковременно, только для ограничения злоупотреблений.'],
        ],
        after: ['Если запрос переходит в бронирование или закон требует более длительного хранения, соответствующие данные хранятся в течение этого срока. По истечении срока данные удаляются, уничтожаются или обезличиваются.'],
      },
      {
        heading: 'Отзыв явного согласия',
        p: ['Вы можете в любой момент отозвать явное согласие на обработку данных о здоровье, сообщив нам об этом по указанным ниже каналам. Отзыв прекращает дальнейшую обработку, но не отменяет обработку, проведённую на основании согласия до этого момента. После отзыва согласия предварительная оценка может оказаться невозможной.'],
      },
      {
        heading: 'Ваши права по ст. 11 KVKK',
        p: ['Согласно ст. 11 KVKK вы вправе:'],
        list: [
          'Узнать, обрабатываются ли ваши персональные данные',
          'Запросить сведения об обработке, если она ведётся',
          'Узнать цель обработки и используются ли данные в соответствии с ней',
          'Знать третьих лиц в Турции или за рубежом, которым переданы данные',
          'Потребовать исправления неполных или неточных данных',
          'Потребовать удаления или уничтожения данных в соответствии со ст. 7 KVKK',
          'Потребовать уведомить об исправлении, удалении или уничтожении третьих лиц, которым были переданы данные',
          'Возразить против неблагоприятного для вас результата, полученного исключительно автоматизированным анализом ваших данных',
          'Требовать возмещения ущерба, причинённого незаконной обработкой',
        ],
      },
      {
        heading: 'Как подать обращение',
        p: ['Чтобы воспользоваться своими правами или отозвать явное согласие, обратитесь к нам одним из способов ниже. Укажите имя и фамилию, контактные данные, номер запроса, если он есть (например, CH-…), и суть обращения. Для подтверждения личности мы можем запросить дополнительные сведения.'],
        box: 'channels',
        after: ['Если обращение отклонено, ответ вас не устраивает или мы не ответили в срок, вы можете подать жалобу в Совет по защите персональных данных (Kişisel Verileri Koruma Kurulu) в течение 30 дней с момента, когда узнали об ответе, и в любом случае не позднее 60 дней с даты обращения.'],
      },
    ],
  },
  ar: {
    meta: {
      title: 'إشعار الخصوصية | Cappadocia Health',
      description: 'إشعار الخصوصية وفق قانون حماية البيانات الشخصية التركي (KVKK رقم 6698) لنموذج التواصل في Cappadocia Health.',
    },
    back: 'العودة إلى نموذج التواصل',
    eyebrow: 'القانون رقم 6698 (KVKK) · المادة 10',
    title: 'إشعار الخصوصية لنموذج التواصل الخاص بالسياحة العلاجية',
    intro: 'يوضّح هذا الإشعار كيفية معالجة بياناتك الشخصية عند تعبئة نموذج التواصل في Cappadocia Health، قسم السياحة العلاجية في موقع ekonomikotel.com، وخلال المحادثات التي نجريها معك بشأن طلبك.',
    updated: 'آخر تحديث: 27 سبتمبر 2026',
    translationNote: 'هذه ترجمة، والنص المعتمد هو [[النص التركي]].',
    contents: 'محتويات الإشعار',
    controllerRows: [
      ['الاسم التجاري الرسمي', '{legalName}'],
      ['الاسم التجاري والعلامات', 'UPTREND TRAVEL؛ وعلامتا Ekonomik Tatilim وEkonomikotel. وCappadocia Health هو قسم السياحة العلاجية في موقع ekonomikotel.com.'],
      ['رقم ترخيص TÜRSAB', '{tursabNo} · وكالة سفر من الفئة A'],
      ['العنوان', '{address}'],
      ['البريد الإلكتروني', '{email}'],
      ['خط المعلومات', '{phone}'],
    ],
    channelRows: [
      ['البريد الإلكتروني', '{email}'],
      ['كتابيًا', 'برسالة موقّعة إلى العنوان: {address}'],
      ['خط المعلومات', '{phone} (للاستفسارات؛ تُقدَّم الطلبات كتابيًا أو عبر البريد الإلكتروني)'],
      ['مدة الرد', 'نبتّ في طلبك مجانًا في أقرب وقت بحسب طبيعته، وفي موعد أقصاه 30 يومًا. وإذا تطلّب الإجراء تكلفة إضافية، فقد تُستوفى رسوم وفق التعرفة التي يحددها مجلس حماية البيانات الشخصية.'],
    ],
    sections: [
      {
        heading: 'المسؤول عن البيانات',
        p: ['وفقًا لقانون حماية البيانات الشخصية التركي رقم 6698 («KVKK»)، فإن المسؤول عن البيانات هو الشركة التالية:'],
        box: 'controller',
      },
      {
        heading: 'البيانات التي نعالجها',
        p: ['لا نطلب في النموذج إلا ما نحتاج إليه لفهم طلبك والتواصل معك:'],
        items: [
          ['بيانات الهوية', 'اسمك الأول واسم العائلة.'],
          ['بيانات التواصل', 'رقم الهاتف أو واتساب، وبريدك الإلكتروني (اختياري ما لم تطلب الرد عبر البريد الإلكتروني)، وبلد إقامتك، وطريقة التواصل ولغة التواصل المفضّلتان لديك.'],
          ['البيانات الصحية (فئة خاصة)', 'مجال العلاج والإجراء اللذان يهمّانك، ووصفك لاحتياجك، وما إذا كانت لديك تقارير أو صور أشعة أو صور حديثة.'],
          ['خطة السفر', 'الموعد التقريبي للسفر، وعدد المرافقين، والخدمات الإضافية التي تودّ أن نرتّبها (الإقامة، النقل، المترجم، الجولات).'],
          ['سجلات الطلب', 'رقم الطلب، وتاريخ الإرسال ووقته، وسجل موافقاتك، ولغة الصفحة. وللحدّ من إساءة الاستخدام، يُعالَج عنوان IP الخاص بك لفترة قصيرة بصيغة مُجزّأة (hash)، ولا يُحفظ مع طلبك.'],
        ],
        after: ['تُعالَج المعلومات التي تقدّمها لنا عبر الهاتف أو واتساب أو البريد الإلكتروني بشأن طلبك للأغراض الواردة في هذا الإشعار.'],
        note: 'لا نطلب في النموذج نتائج تحاليل أو تقارير أو تاريخًا طبيًا مفصّلًا؛ يُرجى عدم كتابتها أو إرسال ملفات. وإذا لزمت مستندات، فستطلبها منك بشكل منفصل المنشأة الصحية التي ستتولى تقييم طلبك. يحفظ الموقع اللغة التي تختارها في متصفحك فقط، ولا تُرسل إلينا.',
      },
      {
        heading: 'أغراض المعالجة',
        list: [
          'استلام طلب السياحة العلاجية وتسجيله وإجراء تقييمه الأولي',
          'التواصل معك بالطريقة واللغة اللتين اخترتهما والإجابة عن أسئلتك',
          'إحالة طلبك، بموافقتك الصريحة، إلى المنشأة الصحية المرخّصة التي ستتولى تقييمه لإجراء التقييم الأولي',
          'تخطيط خدمات الإقامة والنقل والمترجم والجولات التي تطلبها وإعداد العروض الخاصة بها',
          'إدارة سجلات الطلبات، ومنع الإرسال المكرر أو الضار، وضمان أمن المعلومات',
        ],
      },
      {
        heading: 'الأسس القانونية وطريقة الجمع',
        items: [
          ['بيانات الهوية والتواصل وخطة السفر', 'المادة ⁦5/2-c⁩ من KVKK (الارتباط المباشر بإبرام عقد أو تنفيذه) للخطوات التي تطلبها نحو التعاقد، والمادة ⁦5/2-f⁩ من KVKK (مصلحتنا المشروعة في الرد على طلبك وإدارة السجلات ومنع إساءة الاستخدام).'],
          ['البيانات الصحية', 'موافقتك الصريحة وفق المادة 6 من KVKK، وتمنحها عبر خانة الموافقة المستقلة في النموذج.'],
          ['الطلبات التي تتحول إلى حجز', 'إذا تحوّل طلبك إلى حجز، فالمادة ⁦5/2-ç⁩ من KVKK (الالتزام القانوني) لالتزامات مثل إصدار الفواتير وحفظ السجلات.'],
        ],
        after: [
          'لست ملزمًا بمنح الموافقة الصريحة، لكن النموذج يتضمن معلومات صحية ولذلك لا يمكن إرساله دون موافقتك؛ وفي هذه الحالة يمكنك الاتصال بخط المعلومات لطرح أسئلتك العامة.',
          'تُجمع بياناتك إلكترونيًا عبر النموذج في الموقع، ثم عبر قنوات التواصل التي تختارها (الهاتف، واتساب، البريد الإلكتروني).',
        ],
      },
      {
        heading: 'الجهات التي نشارك معها بياناتك',
        items: [
          ['المنشأة الصحية المرخّصة التي ستتولى تقييم طلبك', 'بموافقتك الصريحة فقط ولغرض التقييم الأولي، تُحال إلى هذه المنشأة بياناتك الصحية وما يلزم للتقييم من بيانات الهوية والتواصل. نُبلغك باسم المنشأة قبل المشاركة، وإذا سحبت موافقتك في هذه المرحلة فلن تُحال معلوماتك إليها. أما المعلومات والمستندات التي تطلبها المنشأة منك مباشرة، فالمنشأة نفسها هي المسؤولة عن البيانات فيها.'],
          ['مقدّمو خدمات السفر', 'فقط إذا قررت المضي في حجز الإقامة أو النقل أو المترجم أو الجولات، يُرسل الاسم والتواريخ وبيانات التواصل اللازمة للخدمة إلى الفندق أو مقدّم خدمة النقل أو الترجمة أو الجولة المعني. ولا تُشارك معهم التفاصيل الصحية لطلبك ما لم تتطلبها الخدمة.'],
          ['مزوّد الاستضافة والبنية التحتية', 'تُحفظ بيانات النموذج على خادم (VPS) في مركز بيانات مزوّد الاستضافة Hostinger في فرانكفورت بألمانيا. ويشغّل المزوّد هذه البنية التحتية كجزء تقني من خدمته.'],
          ['الجهات العامة المختصة', 'فقط عند وجود التزام قانوني أو بطلب من السلطات المختصة.'],
        ],
        note: 'إذا اخترت واتساب وسيلةً للتواصل، فإن مراسلاتنا تمرّ عبر البنية التحتية لواتساب، وتسري عليها شروط الخصوصية الخاصة بهذه الخدمة.',
      },
      {
        heading: 'النقل إلى خارج تركيا',
        p: [
          'نظرًا لأن بيانات النموذج تُحفظ على خادم في ألمانيا، فإن إرسال النموذج يعني نقل بياناتك إلى خارج تركيا، ويخضع هذا النقل للمادة 9 من قانون KVKK. وفيما عدا ذلك، لا تُنقل بياناتك الشخصية إلى الخارج إلا بموافقتك الصريحة أو إذا اخترت بنفسك مؤسسة صحية أو مقدّم خدمة في الخارج، ومع استيفاء شروط المادة 9 من قانون KVKK.',
          'إذا كنت تقيم خارج تركيا، فإننا نتواصل معك عبر القناة التي اخترتها (الهاتف أو واتساب أو البريد الإلكتروني)، ويجري هذا التواصل عبر البنية التحتية لخدمات الاتصال التي نستخدمها نحن وأنت.',
        ],
      },
      {
        heading: 'مدة الاحتفاظ',
        items: [
          ['سجلات التواصل والطلبات', 'تُحفظ بيانات الهوية والتواصل وخطة السفر لمدة أقصاها سنتان من إغلاق الطلب.'],
          ['البيانات الصحية', 'تُحذف أو تُجعل مجهولة الهوية عند انتهاء التقييم الأولي، وفي جميع الأحوال في موعد أقصاه سنة واحدة من تاريخ الطلب.'],
          ['سجل عنوان IP المُجزّأ', 'يُحفظ لفترة قصيرة فقط للحدّ من إساءة الاستخدام.'],
        ],
        after: ['إذا تحوّل طلبك إلى حجز أو اقتضى التزام قانوني مدة أطول، تُحفظ البيانات المعنية طوال تلك المدة. وعند انتهائها تُحذف بياناتك أو تُتلف أو تُجعل مجهولة الهوية.'],
      },
      {
        heading: 'سحب الموافقة الصريحة',
        p: ['يمكنك في أي وقت سحب الموافقة الصريحة التي منحتها لبياناتك الصحية بإبلاغنا عبر قنوات تقديم الطلبات أدناه. يوقف السحب أي معالجة لاحقة، ولا يُبطل المعالجة التي تمت استنادًا إلى موافقتك قبل ذلك. وقد لا يمكن متابعة التقييم الأولي بعد سحب الموافقة.'],
      },
      {
        heading: 'حقوقك وفق المادة 11 من KVKK',
        p: ['وفقًا للمادة 11 من KVKK، يحق لك:'],
        list: [
          'معرفة ما إذا كانت بياناتك الشخصية تُعالَج',
          'طلب معلومات عن المعالجة إن تمّت',
          'معرفة غرض المعالجة وما إذا كانت البيانات تُستخدم وفقًا له',
          'معرفة الأطراف الثالثة داخل تركيا أو خارجها التي نُقلت إليها البيانات',
          'طلب تصحيح البيانات الناقصة أو غير الصحيحة',
          'طلب حذف البيانات أو إتلافها وفق المادة 7 من KVKK',
          'طلب إبلاغ الأطراف الثالثة التي نُقلت إليها البيانات بعمليات التصحيح أو الحذف أو الإتلاف',
          'الاعتراض على نتيجة في غير صالحك تنشأ عن تحليل بياناتك بوسائل آلية حصرًا',
          'المطالبة بالتعويض عن الضرر الناتج عن معالجة غير قانونية',
        ],
      },
      {
        heading: 'طرق تقديم الطلبات',
        p: ['لممارسة حقوقك أو سحب موافقتك الصريحة، يمكنك التقدّم إلينا بالطرق التالية. يُرجى ذكر اسمك الكامل وبيانات التواصل ورقم الطلب إن وُجد (مثل ⁦CH-…⁩) وموضوع طلبك. وقد نطلب معلومات إضافية للتحقق من هويتك.'],
        box: 'channels',
        after: ['إذا رُفض طلبك، أو وجدت ردّنا غير كافٍ، أو لم نردّ في الموعد، يحق لك تقديم شكوى إلى مجلس حماية البيانات الشخصية (Kişisel Verileri Koruma Kurulu) خلال 30 يومًا من علمك بالرد، وفي جميع الأحوال خلال 60 يومًا من تاريخ تقديم الطلب.'],
      },
    ],
  },
  fr: {
    meta: {
      title: 'Données personnelles | Cappadocia Health',
      description: 'Notice d’information au titre de la loi turque sur la protection des données personnelles (KVKK, n° 6698) pour le formulaire de contact de Cappadocia Health.',
    },
    back: 'Retour au formulaire de contact',
    eyebrow: 'Loi n° 6698 (KVKK) · article 10',
    title: 'Notice d’information sur les données personnelles du formulaire de tourisme médical',
    intro: 'Cette notice explique comment vos données personnelles sont traitées lorsque vous remplissez le formulaire de contact de Cappadocia Health, la rubrique de tourisme médical d’ekonomikotel.com, ainsi que lors des échanges que nous avons ensuite avec vous au sujet de votre demande.',
    updated: 'Dernière mise à jour : 27 septembre 2026',
    translationNote: 'Ceci est une traduction ; seul le [[texte turc]] fait foi.',
    contents: 'Sommaire',
    controllerRows: [
      ['Raison sociale', '{legalName}'],
      ['Nom commercial et marques', 'UPTREND TRAVEL ; les marques Ekonomik Tatilim et Ekonomikotel. Cappadocia Health est la rubrique de tourisme médical d’ekonomikotel.com.'],
      ['Licence TÜRSAB n°', '{tursabNo} · agence de voyages du groupe A'],
      ['Adresse', '{address}'],
      ['E-mail', '{email}'],
      ['Ligne d’information', '{phone}'],
    ],
    channelRows: [
      ['E-mail', '{email}'],
      ['Par écrit', 'Par lettre signée à l’adresse : {address}'],
      ['Ligne d’information', '{phone} (pour vos questions ; les demandes se font par écrit ou par e-mail)'],
      ['Délai de réponse', 'Nous traitons votre demande gratuitement, dans les meilleurs délais selon sa nature et au plus tard sous 30 jours. Si le traitement entraîne un coût supplémentaire, des frais peuvent être perçus selon le barème fixé par le Conseil de la protection des données personnelles.'],
    ],
    sections: [
      {
        heading: 'Responsable du traitement',
        p: ['Au sens de la loi turque n° 6698 sur la protection des données personnelles (« KVKK »), le responsable du traitement est la société suivante :'],
        box: 'controller',
      },
      {
        heading: 'Données que nous traitons',
        p: ['Le formulaire ne demande que ce dont nous avons besoin pour comprendre votre demande et vous recontacter :'],
        items: [
          ['Identité', 'Vos nom et prénom.'],
          ['Coordonnées', 'Votre numéro de téléphone ou WhatsApp, votre adresse e-mail (facultative, sauf si vous souhaitez une réponse par e-mail), votre pays de résidence, ainsi que le moyen de contact et la langue que vous préférez.'],
          ['Données de santé (catégorie particulière)', 'Le domaine de soins et le soin qui vous intéressent, la description de votre besoin et le fait de disposer ou non de comptes rendus, radiographies ou photos récents.'],
          ['Projet de voyage', 'La période envisagée, le nombre d’accompagnants et les services supplémentaires que vous souhaitez (hébergement, transferts, interprète, visites).'],
          ['Traces de la demande', 'Numéro de référence, date et heure d’envoi, enregistrement de vos consentements et langue de la page. Pour limiter les abus, votre adresse IP est traitée brièvement sous forme hachée ; elle n’est pas conservée avec votre demande.'],
        ],
        after: ['Les informations que vous nous communiquez par téléphone, WhatsApp ou e-mail au sujet de votre demande sont traitées pour les finalités décrites dans cette notice.'],
        note: 'Le formulaire ne demande ni résultats d’analyses, ni comptes rendus, ni antécédents médicaux détaillés : merci de ne pas les saisir et de ne pas envoyer de fichiers. Si des documents sont nécessaires, l’établissement de santé qui examinera votre demande vous les demandera séparément. Le site conserve la langue choisie uniquement dans votre navigateur ; elle ne nous est pas transmise.',
      },
      {
        heading: 'Finalités du traitement',
        list: [
          'Recevoir, enregistrer et examiner à titre préliminaire votre demande de voyage médical',
          'Vous contacter par le moyen et dans la langue choisis, et répondre à vos questions',
          'Avec votre consentement explicite, transmettre votre demande pour évaluation préliminaire à l’établissement de santé agréé qui l’examinera',
          'Organiser l’hébergement, les transferts, l’interprète et les visites que vous demandez, et établir les devis correspondants',
          'Gérer les demandes, éviter les envois en double ou malveillants et assurer la sécurité des informations',
        ],
      },
      {
        heading: 'Bases juridiques et mode de collecte',
        items: [
          ['Données d’identité, de contact et de voyage', 'Article 5, paragraphe 2, point c) de la KVKK (lien direct avec la conclusion ou l’exécution d’un contrat) pour les démarches vers un contrat que vous demandez ; article 5, paragraphe 2, point f) de la KVKK (notre intérêt légitime à répondre à votre demande, à gérer les dossiers et à prévenir les abus).'],
          ['Données de santé', 'Votre consentement explicite au titre de l’article 6 de la KVKK, donné au moyen de la case distincte du formulaire.'],
          ['Demandes devenues réservations', 'Si votre demande aboutit à une réservation : article 5, paragraphe 2, point ç) de la KVKK (obligation légale) pour des obligations comme la facturation et la conservation des pièces.'],
        ],
        after: [
          'Vous n’êtes pas tenu(e) de donner votre consentement explicite. Toutefois, le formulaire comportant des informations de santé, il ne peut pas être envoyé sans votre consentement ; vous pouvez alors appeler notre ligne d’information pour vos questions générales.',
          'Vos données sont collectées par voie électronique au moyen du formulaire du site, puis par les canaux de contact que vous avez choisis (téléphone, WhatsApp, e-mail).',
        ],
      },
      {
        heading: 'Destinataires',
        items: [
          ['L’établissement de santé agréé qui examinera votre demande', 'Uniquement avec votre consentement explicite et pour l’évaluation préliminaire, vos données de santé ainsi que les données d’identité et de contact nécessaires à l’évaluation sont transmises à cet établissement. Nous vous communiquons son nom avant la transmission ; si vous retirez votre consentement à ce stade, vos informations ne lui sont pas transmises. Pour les informations et documents qu’il vous demande directement, l’établissement est lui-même responsable du traitement.'],
          ['Prestataires de voyage', 'Uniquement si vous décidez de réserver un hébergement, des transferts, un interprète ou des visites, les nom, dates et coordonnées nécessaires au service sont transmis à l’hôtel ou au prestataire de transfert, d’interprétariat ou de visite concerné. Les détails de santé de votre demande ne leur sont pas communiqués, sauf si le service l’exige.'],
          ['Hébergeur et prestataire d’infrastructure', 'Les données du formulaire sont conservées sur un serveur (VPS) situé dans le centre de données de notre hébergeur Hostinger à Francfort (Allemagne). L’hébergeur exploite cette infrastructure dans le cadre technique de son service.'],
          ['Autorités publiques compétentes', 'Uniquement en cas d’obligation légale ou à la demande des autorités compétentes.'],
        ],
        note: 'Si vous choisissez WhatsApp comme moyen de contact, nos échanges passent par l’infrastructure de WhatsApp et les conditions de confidentialité de ce service s’appliquent.',
      },
      {
        heading: 'Transferts à l’étranger',
        p: [
          'Les données du formulaire étant conservées sur un serveur en Allemagne, l’envoi du formulaire entraîne un transfert de vos données à l’étranger ; ce transfert relève de l’article 9 de la KVKK. En dehors de ce cas, vos données personnelles ne sont transférées à l’étranger qu’avec votre consentement explicite ou si vous choisissez vous-même un établissement de santé ou un prestataire à l’étranger, et uniquement dans le respect des conditions de l’article 9 de la KVKK.',
          'Si vous résidez hors de Turquie, nous vous contactons par le canal que vous avez choisi (téléphone, WhatsApp ou e-mail). Ces échanges passent par l’infrastructure des services de communication que vous et nous utilisons.',
        ],
      },
      {
        heading: 'Durées de conservation',
        items: [
          ['Coordonnées et dossiers de demande', 'Les données d’identité, de contact et de voyage sont conservées au plus 2 ans après la clôture de la demande.'],
          ['Données de santé', 'Supprimées ou anonymisées à la fin de l’évaluation préliminaire et, en tout état de cause, au plus tard 1 an après la demande.'],
          ['Trace IP hachée', 'Conservée brièvement, uniquement pour limiter les abus.'],
        ],
        after: ['Si votre demande aboutit à une réservation ou si une obligation légale impose une conservation plus longue, les données concernées sont conservées pendant cette durée. À l’issue de la période, vos données sont supprimées, détruites ou anonymisées.'],
      },
      {
        heading: 'Retrait de votre consentement explicite',
        p: ['Vous pouvez retirer à tout moment le consentement explicite donné pour vos données de santé en nous l’indiquant par les canaux ci-dessous. Le retrait met fin aux traitements ultérieurs, sans remettre en cause ceux effectués auparavant sur la base de votre consentement. Après un retrait, l’évaluation préliminaire pourra ne pas se poursuivre.'],
      },
      {
        heading: 'Vos droits au titre de l’article 11 de la KVKK',
        p: ['Conformément à l’article 11 de la KVKK, vous avez le droit de :'],
        list: [
          'Savoir si vos données personnelles sont traitées',
          'Demander des informations sur ce traitement le cas échéant',
          'Connaître la finalité du traitement et savoir si les données sont utilisées conformément à celle-ci',
          'Connaître les tiers, en Turquie ou à l’étranger, auxquels les données ont été transférées',
          'Demander la rectification de données incomplètes ou inexactes',
          'Demander l’effacement ou la destruction des données dans le cadre de l’article 7 de la KVKK',
          'Demander que les rectifications, effacements et destructions soient notifiés aux tiers auxquels les données ont été transférées',
          'Vous opposer à un résultat défavorable découlant d’une analyse de vos données exclusivement par des systèmes automatisés',
          'Demander réparation du préjudice subi du fait d’un traitement illicite',
        ],
      },
      {
        heading: 'Comment exercer vos droits',
        p: ['Pour exercer vos droits ou retirer votre consentement explicite, vous pouvez vous adresser à nous comme indiqué ci-dessous. Merci de préciser vos nom et prénom, vos coordonnées, votre numéro de référence le cas échéant (par ex. CH-…) et l’objet de votre demande. Nous pouvons demander des informations complémentaires pour vérifier votre identité.'],
        box: 'channels',
        after: ['Si votre demande est rejetée, si vous jugez notre réponse insuffisante ou si nous ne répondons pas dans le délai, vous pouvez saisir le Conseil de la protection des données personnelles (Kişisel Verileri Koruma Kurulu) dans les 30 jours suivant la date à laquelle vous avez pris connaissance de la réponse et, en tout état de cause, dans les 60 jours suivant votre demande.'],
      },
    ],
  },
};
