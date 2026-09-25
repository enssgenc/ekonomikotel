export const treatmentCategories = [
  {
    id: 'dis',
    label: 'Ağız ve diş',
    description: 'Diş sağlığı ve gülüşe yönelik seçenekler, muayene ve gerekli görüntüleme sonrası kişiye göre planlanır.',
    items: [
      { name: 'Diş implantı', summary: 'Eksik dişler için implant destekli tedavi seçenekleri değerlendirilir.', detail: 'Kemik yapısı, diş eti sağlığı ve genel durum incelendikten sonra uygun yöntem ve aşamalar diş hekimi tarafından belirlenir.' },
      { name: 'Zirkonyum ve porselen kaplama', summary: 'Dişlerin görünümü ve işlevi için kaplama seçenekleri ele alınır.', detail: 'Dişin mevcut yapısı, kapanış ilişkisi ve beklenti birlikte değerlendirilir; hangi materyalin uygun olduğuna hekim karar verir.' },
      { name: 'Laminate veneer', summary: 'Ön dişlerin görünümü için ince kaplama seçeneği görüşülebilir.', detail: 'Uygunluk, diş yüzeyi ve ağız sağlığı muayenesine bağlıdır. Her diş için aynı yaklaşım geçerli olmayabilir.' },
      { name: 'Diş protezi', summary: 'Eksik dişler için sabit veya hareketli protez planı oluşturulabilir.', detail: 'Hekim, ağızdaki destek dokuları ve mevcut dişleri değerlendirerek seçenekleri açıklar.' },
      { name: 'Ortodonti', summary: 'Diş dizilimi ve çene kapanışı için tedavi seçenekleri incelenir.', detail: 'Tel veya şeffaf plak gibi yöntemler ancak ortodontik değerlendirme sonrasında planlanır; takip takvimi seyahat kararını etkileyebilir.' },
      { name: 'Diş eti tedavileri', summary: 'Diş eti sorunlarında önce tanı ve ağız sağlığı değerlendirmesi yapılır.', detail: 'Temizlikten ileri girişimlere kadar seçenekler, sorunun nedenine ve uzman muayenesine göre belirlenir.' },
      { name: 'Kanal tedavisi', summary: 'Dişin korunmasına yönelik endodontik yaklaşım değerlendirilebilir.', detail: 'Ağrı, enfeksiyon ve diş yapısının durumu muayene ve görüntüleme ile incelenir.' },
    ],
  },
  {
    id: 'sac',
    label: 'Saç ve saçlı deri',
    description: 'Saç dökülmesinin nedenini anlamak, doğru yöntemi seçmenin ilk adımıdır.',
    items: [
      { name: 'Saç ekimi', summary: 'Uygun kişilerde saç ekimi seçenekleri değerlendirilir.', detail: 'Dökülme tipi, donör alan ve beklenti uzman tarafından incelenir. İşlem ve takip planı kişiye göre belirlenir.' },
      { name: 'Kaş ekimi', summary: 'Kaş yoğunluğu ve biçimi için ekim seçeneği görüşülebilir.', detail: 'Mevcut kaş yapısı, donör alan ve olası sonuçlar uzman görüşmesinde ele alınır.' },
      { name: 'Saç dökülmesi değerlendirmesi', summary: 'Dökülmenin nedeni ve tedavi ihtiyacı araştırılır.', detail: 'Hekim, saçlı deri muayenesi ve gerekli gördüğü tetkiklerle cerrahi veya cerrahi dışı seçenekleri tartışır.' },
    ],
  },
  {
    id: 'estetik',
    label: 'Plastik ve estetik cerrahi',
    description: 'Cerrahi seçeneklerde beklenti, işlev, olası riskler ve iyileşme planı birlikte ele alınır.',
    items: [
      { name: 'Burun estetiği', summary: 'Burun görünümü ve solunumla ilgili hedefler birlikte değerlendirilir.', detail: 'Rinoplasti planı, yüz yapısı ve varsa işlevsel yakınmalar dikkate alınarak cerrah tarafından oluşturulur.' },
      { name: 'Göz kapağı estetiği', summary: 'Üst veya alt göz kapağına yönelik cerrahi seçenekler incelenir.', detail: 'Göz çevresinin yapısı, şikâyetler ve tıbbi uygunluk muayenede değerlendirilir.' },
      { name: 'Meme estetiği', summary: 'Büyütme, küçültme veya dikleştirme seçenekleri görüşülebilir.', detail: 'Uygun yöntem, kişinin sağlık durumu ve beklentileri doğrultusunda uzman cerrah tarafından belirlenir.' },
      { name: 'Liposuction', summary: 'Belirli bölgelerdeki yağ dokusu için cerrahi şekillendirme seçeneğidir.', detail: 'Genel sağlık, vücut yapısı, riskler ve iyileşme süreci değerlendirilmeden işlem planlanmaz.' },
      { name: 'Karın germe', summary: 'Karın bölgesine yönelik cerrahi şekillendirme değerlendirilir.', detail: 'Deri ve kas yapısı, önceki ameliyatlar ve iyileşme gereksinimi cerrah görüşmesinde ele alınır.' },
      { name: 'Yüz ve boyun germe', summary: 'Yüz ve boyun dokularına yönelik cerrahi seçenekler incelenebilir.', detail: 'İşlem kapsamı ve beklenen iyileşme, muayene sonrasında kişiye özel olarak açıklanır.' },
      { name: 'Kulak estetiği', summary: 'Kulak biçimine yönelik cerrahi seçenekler değerlendirilebilir.', detail: 'Anatomik yapı ve beklenti cerrah tarafından incelenir; uygunluk kişisel değerlendirmeye bağlıdır.' },
    ],
  },
  {
    id: 'cilt',
    label: 'Cilt ve dermatoloji',
    description: 'Cilt yakınmalarında uygulamadan önce tanı ve uzman değerlendirmesi gerekir.',
    items: [
      { name: 'Cilt analizi ve tedavi planı', summary: 'Cilt tipi, yakınmalar ve önceki uygulamalar değerlendirilir.', detail: 'Dermatolog, ihtiyaç varsa medikal bakım veya girişimsel seçenekleri kişiye göre planlar.' },
      { name: 'Akne ve iz tedavileri', summary: 'Akne ve iz görünümü için farklı dermatolojik yaklaşımlar ele alınır.', detail: 'Aktif aknenin durumu ve iz tipi değerlendirilerek uygun yöntem ve takip süreci seçilir.' },
      { name: 'Leke tedavileri', summary: 'Cilt lekelerinin nedeni araştırılarak seçenekler görüşülür.', detail: 'Her leke aynı nedenle oluşmaz. Uzman muayenesi, hangi işlemin uygun olabileceğini belirler.' },
      { name: 'Medikal estetik uygulamaları', summary: 'Cerrahi dışı yüz ve cilt uygulamaları değerlendirilebilir.', detail: 'Enjeksiyon veya cihazlı uygulamalar, yalnızca yetkili uzman ve uygun sağlık ortamında planlanmalıdır.' },
    ],
  },
  {
    id: 'goz',
    label: 'Göz sağlığı',
    description: 'Görme ve göz sağlığıyla ilgili kararlar ayrıntılı göz muayenesine dayanır.',
    items: [
      { name: 'Lazerle görme düzeltme', summary: 'Görme kusurları için lazer seçenekleri uygunluk halinde incelenir.', detail: 'Kornea yapısı, göz numarası ve genel göz sağlığı değerlendirilerek yöntem hakkında karar verilir.' },
      { name: 'Katarakt cerrahisi', summary: 'Katarakt tanısı ve cerrahi seçenekler göz hekimiyle görüşülür.', detail: 'Görme düzeyi ve göz içi değerlendirmesi sonrasında işlem ve takip planı belirlenir.' },
      { name: 'Göz içi mercek değerlendirmesi', summary: 'Uygun kişilerde mercek seçenekleri ele alınabilir.', detail: 'Mercek seçimi, görme ihtiyacı ve gözün klinik bulguları doğrultusunda hekim tarafından yapılır.' },
    ],
  },
  {
    id: 'metabolik',
    label: 'Kilo ve metabolik sağlık',
    description: 'Beslenme, eşlik eden hastalıklar ve uzun dönem takip, tedavi kararının parçasıdır.',
    items: [
      { name: 'Obezite değerlendirmesi', summary: 'Kilo yönetimi için tıbbi durum ve seçenekler birlikte incelenir.', detail: 'Uzman ekip, cerrahi dışı ve cerrahi yaklaşımları kişinin sağlık öyküsüne göre ele alır.' },
      { name: 'Tüp mide ameliyatı', summary: 'Uygun kişilerde bariatrik cerrahi seçeneklerinden biridir.', detail: 'Ameliyat kararı; kapsamlı değerlendirme, risk görüşmesi ve uzun dönem beslenme takibiyle birlikte verilir.' },
      { name: 'Mide balonu', summary: 'Cerrahi dışı kilo yönetimi seçenekleri arasında değerlendirilebilir.', detail: 'Uygunluk ve takip programı gastroenteroloji veya ilgili uzman ekip tarafından belirlenir.' },
    ],
  },
  {
    id: 'ortopedi',
    label: 'Ortopedi ve hareket',
    description: 'Hareket kısıtlılığı ve ağrıda tanı, tedavi ve rehabilitasyon birlikte düşünülür.',
    items: [
      { name: 'Diz ve kalça protezi değerlendirmesi', summary: 'İleri eklem sorunlarında cerrahi seçenekler incelenebilir.', detail: 'Görüntüleme, hareket düzeyi ve genel sağlık durumu değerlendirilerek cerrahi ve rehabilitasyon planı yapılır.' },
      { name: 'Artroskopik işlemler', summary: 'Bazı eklem sorunlarında kapalı cerrahi seçeneği görüşülebilir.', detail: 'Hangi ekleme ve soruna uygun olduğu ortopedi uzmanının tanısına bağlıdır.' },
      { name: 'Spor yaralanmaları', summary: 'Kas, bağ ve eklem yaralanmaları için kişisel tedavi planı oluşturulur.', detail: 'Muayene ve gerekli görüntülemeye göre dinlenme, rehabilitasyon veya cerrahi seçenekler ele alınır.' },
      { name: 'Omurga ve duruş değerlendirmesi', summary: 'Bel, boyun ve duruş yakınmaları uzman tarafından incelenir.', detail: 'Nedene göre fizik tedavi, takip veya ileri uzmanlık değerlendirmesi planlanabilir.' },
    ],
  },
  {
    id: 'kadin',
    label: 'Kadın sağlığı ve üreme',
    description: 'Jinekolojik ve üreme sağlığı konuları mahremiyet ve uzmanlık gerektirir.',
    items: [
      { name: 'Jinekolojik değerlendirme', summary: 'Kadın sağlığına ilişkin yakınmalar ve kontroller ele alınır.', detail: 'Gerekli muayene ve tetkikler, kişisel öyküye göre kadın hastalıkları uzmanı tarafından seçilir.' },
      { name: 'Üreme sağlığı danışmanlığı', summary: 'Doğurganlıkla ilgili sorular ve seçenekler değerlendirilebilir.', detail: 'Tetkik ve tedavi süreci, ilgili uzmanlar tarafından kişisel durum doğrultusunda planlanır.' },
      { name: 'Yardımcı üreme yöntemleri', summary: 'Tüp bebek dahil seçenekler yetkili merkezde görüşülür.', detail: 'Uygunluk, yasal koşullar ve tedavi takvimi ilgili yetkili birimde uzman değerlendirmesine bağlıdır.' },
    ],
  },
  {
    id: 'kbb',
    label: 'Kulak burun boğaz',
    description: 'Solunum, sinüs ve işitmeyle ilgili yakınmalarda önce doğru tanı hedeflenir.',
    items: [
      { name: 'Burun ve sinüs değerlendirmesi', summary: 'Tıkanıklık ve sinüs yakınmaları için seçenekler incelenir.', detail: 'Muayene ve gerekli tetkikler sonrasında ilaç, takip veya cerrahi seçenekler konuşulur.' },
      { name: 'Septoplasti', summary: 'Burun içi yapıya bağlı solunum sorunları için cerrahi seçenek olabilir.', detail: 'Şikâyetin nedeni ve işlemin uygunluğu KBB uzmanı tarafından değerlendirilir.' },
      { name: 'İşitme değerlendirmesi', summary: 'İşitme yakınmalarının nedeni araştırılır.', detail: 'Test sonuçlarına göre izlem, cihaz veya başka tedavi seçenekleri ilgili uzman tarafından açıklanır.' },
    ],
  },
  {
    id: 'rehab',
    label: 'Fizik tedavi',
    description: 'Hareket ve işlevi destekleyen programlar kişisel tıbbi duruma göre oluşturulur.',
    items: [
      { name: 'Ameliyat sonrası rehabilitasyon', summary: 'Cerrahi sonrasındaki hareket ve güçlenme planı kişiye göre düzenlenir.', detail: 'Program, ameliyatı yapan ekibin önerileri ve fizyoterapistin değerlendirmesiyle uyumlu ilerler.' },
      { name: 'Kas ve eklem rehabilitasyonu', summary: 'Ağrı ve hareket kısıtlılığında fizyoterapi seçenekleri görüşülür.', detail: 'Hedefler ve uygulamalar, tanı ve kişinin günlük yaşam gereksinimleri doğrultusunda belirlenir.' },
      { name: 'Duruş ve hareket eğitimi', summary: 'Günlük hareket alışkanlıkları ve egzersiz ihtiyacı değerlendirilir.', detail: 'Kişiye uygun öneriler, uzman değerlendirmesine dayalı olarak hazırlanır.' },
    ],
  },
  {
    id: 'kontrol',
    label: 'Kontrol ve iç hastalıkları',
    description: 'Koruyucu sağlıkta gereksiz testten kaçınan, ihtiyaca dayalı değerlendirme esastır.',
    items: [
      { name: 'Kişiye özel sağlık kontrolü', summary: 'Muayene ve taramalar yaş, öykü ve risklere göre seçilir.', detail: 'Hekim, gerekli testleri kişisel duruma göre belirler ve sonuçları klinik bağlamda yorumlar.' },
      { name: 'Kardiyoloji değerlendirmesi', summary: 'Kalp ve damar sağlığına ilişkin yakınmalar incelenir.', detail: 'Gerekli muayene, tetkik ve takip planı kardiyoloji uzmanının kararına bağlıdır.' },
      { name: 'İç hastalıkları değerlendirmesi', summary: 'Genel sağlık yakınmaları ve kronik durumlar ele alınır.', detail: 'Dahiliye uzmanı, gerektiğinde diğer branşlarla birlikte tanı ve takip sürecini planlar.' },
    ],
  },
];

export const treatmentCount = treatmentCategories.reduce((total, category) => total + category.items.length, 0);
