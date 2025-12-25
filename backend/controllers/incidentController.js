const Incident = require('../models/Incident');
const Reading = require('../models/Reading');
const Subscriber = require('../models/Subscriber');
const emailService = require('../services/emailService');

// =========================================================================
// YARDIMCI FONKSİYON: Mahalle adlarını temizleme ve standardize etme
// =========================================================================
const cleanString = (str) => {
    if (!str) return '';
    return str.toLocaleLowerCase('tr').trim();
};

// =========================================================================
// 1. Planlı Kesinti Oluşturma (createPlannedOutage) - DÜZELTİLDİ
// =========================================================================
exports.createPlannedOutage = async (req, res) => {
  try {
    const { Mahalle, Kaynak_Tipi, Aciklama, Tarih, Baslangic_Saat, Bitis_Saat } = req.body;

    console.log(`\n🔴 --- PLANLI KESİNTİ İŞLEMİ BAŞLADI ---`);

    // --- (BERFİN GÖREVİ) DUPLICATE KONTROLÜ ---
    // Aynı mahallede ve aynı kaynak tipinde zaten AKTİF bir kesinti/arıza var mı?
    const existingIncident = await Incident.findOne({
        Mahalle: Mahalle,
        Kaynak_Tipi: Kaynak_Tipi,
        Durum: 'AKTIF' // Sadece aktif olanları kontrol et, pasifler (gelecek planlılar) sorun değil.
    });

    if (existingIncident) {
        console.log("⚠️ HATA: Bu mahallede zaten aktif bir kesinti mevcut.");
        return res.status(400).json({
            success: false,
            message: `HATA: ${Mahalle} mahallesinde ${Kaynak_Tipi} için zaten aktif bir kayıt var! Önce mevcut olanı çözün.`
        });
    }

    // 1. Tarih Ayarlaması
    const startDateTime = new Date(`${Tarih}T${Baslangic_Saat}`);
    const endDateTime = new Date(`${Tarih}T${Bitis_Saat}`);
    const now = new Date();

    // --- (EMİR GÖREVİ) DURUM BELİRLEME ---
    // Eğer başlangıç tarihi şu andan ilerideyse PASIF, değilse AKTIF olsun.
    let baslangicDurumu = 'AKTIF';
    if (startDateTime > now) {
        baslangicDurumu = 'PASIF';
        console.log(`🕒 Bu bir ileri tarihli kesinti. Durum 'PASIF' olarak ayarlandı. Başlangıç: ${startDateTime}`);
    }

    // 2. Kesintiyi Kaydet
    const newIncident = await Incident.create({
      Mahalle, 
      Kaynak_Tipi, 
      Aciklama, 
      Tip: 'PLANLI', 
      Durum: baslangicDurumu, // Hesapladığımız durum
      Baslangic_Tarihi: startDateTime, 
      Bitis_Tarihi: endDateTime
    });

    // 3. Abone Verilerini Çekme ve Mail Atma (Sadece AKTİF ise hemen mail atabiliriz veya her türlü bilgi maili atabiliriz)
    // NOT: Genelde planlı kesintiler önceden bildirilir, o yüzden PASIF olsa bile mail atıyoruz.
    const allSubscribers = await Subscriber.find({});
    const targetMahalle = cleanString(Mahalle);
    
    const affectedSubscribers = allSubscribers.filter(sub => {
        const dbMahalle = cleanString(sub.neighborhood);
        return dbMahalle === targetMahalle;
    });

    if (affectedSubscribers.length > 0) {
        affectedSubscribers.forEach(sub => {
            if (emailService.sendOutageNotification) {
                emailService.sendOutageNotification(sub.email, {
                    mahalle: Mahalle,
                    kaynak: Kaynak_Tipi,
                    baslangic: startDateTime.toLocaleString('tr-TR'),
                    bitis: endDateTime.toLocaleString('tr-TR'),
                    aciklama: `PLANLI ÇALIŞMA BİLGİLENDİRMESİ: ${Aciklama}`
                }).catch(err => console.error(`❌ Mail Hatası (${sub.email}):`, err.message));
            }
        });
    }

    console.log(`🔴 --- İŞLEM BİTTİ ---\n`);

    res.status(201).json({ 
        success: true, 
        message: `Planlı kesinti (${baslangicDurumu}) olarak oluşturuldu.`, 
        data: newIncident 
    });

  } catch (error) {
    console.error("GENEL HATA:", error);
    res.status(500).json({ message: error.message });
  }
};


// =========================================================================
// 2. Anlık Arıza Oluşturma (createInstantIncident) - DÜZELTİLDİ
// =========================================================================
exports.createInstantIncident = async (req, res) => {
    try {
        const { Mahalle, Kaynak_Tipi, Aciklama } = req.body;
        
        console.log(`\n🔴 --- ANLIK ARIZA İŞLEMİ BAŞLADI ---`);

        // --- (BERFİN GÖREVİ) DUPLICATE KONTROLÜ ---
        // Butona defalarca basılmasını backend'de engelliyoruz.
        const existingIncident = await Incident.findOne({
            Mahalle: Mahalle,
            Kaynak_Tipi: Kaynak_Tipi,
            Durum: 'AKTIF'
        });

        if (existingIncident) {
            console.log("⚠️ ENGELLENDİ: Mükerrer kayıt girişimi.");
            return res.status(400).json({
                success: false,
                message: `DİKKAT: ${Mahalle} mahallesinde ${Kaynak_Tipi} kaynağında zaten devam eden bir arıza kaydı var!`
            });
        }

        // 1. ANLIK ARIZAYI KAYDET
        const newIncident = await Incident.create({
            Mahalle, 
            Kaynak_Tipi, 
            Aciklama, 
            Tip: 'ARIZA', 
            Durum: 'AKTIF', 
            Baslangic_Tarihi: new Date()
        });

        // 2. ABONELERİ BULMA VE BİLDİRİM
        const allSubscribers = await Subscriber.find({});
        const targetMahalle = cleanString(Mahalle);
        
        const affectedSubscribers = allSubscribers.filter(sub => {
            const dbMahalle = cleanString(sub.neighborhood);
            return dbMahalle === targetMahalle;
        });

        if (affectedSubscribers.length > 0) {
            affectedSubscribers.forEach(sub => {
                if (emailService.sendOutageNotification) {
                    emailService.sendOutageNotification(sub.email, {
                        mahalle: Mahalle,
                        kaynak: Kaynak_Tipi,
                        baslangic: new Date().toLocaleString('tr-TR'),
                        bitis: 'Bilinmiyor (Ekipler Müdahale Ediyor)', 
                        aciklama: `ACİL ARIZA: ${Aciklama}`
                    }).catch(err => console.error(`❌ Mail Hatası (${sub.email}):`, err.message));
                }
            });
        }

        console.log(`🔴 --- İŞLEM BİTTİ ---\n`);
        
        res.status(201).json({ 
            success: true, 
            message: `Arıza kaydedildi.`, 
            data: newIncident 
        });

    } catch (error) { 
        console.error("GENEL HATA:", error);
        res.status(500).json({ message: error.message }); 
    }
};
  
// =========================================================================
// 3. Arıza Listesini Çekme (getIncidents) - DÜZELTİLDİ (LAZY LOAD EKLENDİ)
// =========================================================================
exports.getIncidents = async (req, res) => {
    try {
      // --- (EMİR GÖREVİ EKSTRA) ---
      // Listeyi çekmeden önce: Zamanı gelmiş 'PASIF' planlı kesintileri 'AKTIF' yap.
      const now = new Date();
      
      // Update: Tip=PLANLI, Durum=PASIF ve Başlangıç Tarihi <= Şimdi olanları bul ve AKTIF yap.
      await Incident.updateMany(
          { 
              Tip: 'PLANLI', 
              Durum: 'PASIF', 
              Baslangic_Tarihi: { $lte: now } 
          },
          { 
              $set: { Durum: 'AKTIF' } 
          }
      );

      // Şimdi güncel listeyi çek
      const incidents = await Incident.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
  
// =========================================================================
// 4. Arızayı Çözme (resolveIncident)
// =========================================================================
exports.resolveIncident = async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);
      if (!incident) return res.status(404).json({ message: 'Kayıt bulunamadı' });
      
      incident.Durum = 'PASIF';
      incident.Bitis_Tarihi = Date.now(); // Bitiş tarihini şu an olarak güncelle
      
      await incident.save();
      res.status(200).json({ success: true, message: 'Arıza çözüldü ve Pasif yapıldı.', data: incident });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// =========================================================================
// 5. SİSTEM DURUM KONTROLÜ (GÜNCELLENDİ: Hem Manuel Hem Otomatik)
// =========================================================================
exports.getSystemAlerts = async (req, res) => {
    try {
        // 1. Manuel Eklenen Arızaları Çek (Senin yönetim panelinden eklediklerin)
        const manualAlerts = await Incident.find({
            Durum: 'AKTIF',
            Tip: 'ARIZA' 
        }).select('Mahalle Kaynak_Tipi Aciklama createdAt');

        // 2. Otomatik Sistem Alarmlarını Çek (aktif_alarmlar klasörü)
        // Eğer veritabanında böyle bir tablo henüz yoksa hata vermesin diye try-catch içine alabiliriz 
        // veya boş döner. Modelde 'strict: false' dediğimiz için sorun çıkmaz.
        let autoAlertsRaw = [];
        try {
            autoAlertsRaw = await ActiveAlarm.find({});
        } catch (err) {
            console.log("Otomatik alarm tablosu okunamadı (henüz boş olabilir):", err.message);
        }
        
        // Otomatik verileri bizim formatımıza uyduralım
        const formattedAutoAlerts = autoAlertsRaw.map(alert => ({
            Mahalle: alert.mahalle || alert.Mahalle || "Bilinmeyen Bölge",
            Kaynak_Tipi: alert.kaynak || alert.tur || "SİSTEM",
            Aciklama: alert.mesaj || alert.aciklama || "Otomatik Sistem Uyarısı",
            createdAt: alert.createdAt || new Date(),
            isAuto: true 
        }));

        // 3. İkisini Birleştir
        const allAlerts = [...manualAlerts, ...formattedAutoAlerts];

        console.log(`🔍 BİLDİRİM KONTROLÜ: Manuel: ${manualAlerts.length}, Otomatik: ${formattedAutoAlerts.length}`);

        res.status(200).json({ 
            success: true, 
            alertCount: allAlerts.length, 
            alerts: allAlerts 
        });

    } catch (error) {
        console.error("Alarm Çekme Hatası:", error);
        res.status(500).json({ message: error.message });
    }
};

// =========================================================================
// 6. SİMÜLASYON: OTOMATİK SENSÖR ALARMI ÜRET (YENİ)
// Bu linke her istek atıldığında sistem rastgele bir arıza uydurup veritabanına yazar.
// =========================================================================
exports.simulateAutoAlarm = async (req, res) => {
    try {
        const ActiveAlarm = require('../models/ActiveAlarm'); // Modeli çağıralım

        // Rastgele seçimler için listeler
        const mahalleler = ["Kültür", "Fevzi Çakmak", "Cumhuriyet", "Yıldız", "Ataşehir", "Çaydaçıra"];
        const kaynaklar = ["Elektrik", "Su", "Doğalgaz"];
        const hatalar = [
            "Ani Voltaj Yükselmesi (Sensör #402)",
            "Ana Boru Hattı Basınç Kaybı",
            "Gaz Dağıtım Merkezinde Sızıntı Sinyali",
            "Trafo Sıcaklığı Kritik Seviyede",
            "Şebeke Frekans Sapması"
        ];

        // Rastgele veri seç
        const randMahalle = mahalleler[Math.floor(Math.random() * mahalleler.length)];
        const randKaynak = kaynaklar[Math.floor(Math.random() * kaynaklar.length)];
        const randHata = hatalar[Math.floor(Math.random() * hatalar.length)];

        // Veritabanına kaydet (Arkadaşının formatına uygun)
        const newAlarm = await ActiveAlarm.create({
            mahalle: randMahalle,
            tur: randKaynak, // Frontend 'Kaynak_Tipi' bekliyor ama biz çekerken dönüştürüyoruz zaten.
            aciklama: randHata,
            seviye: "KRITIK", // Ekstra bilgi
            createdAt: new Date()
        });

        console.log(`🤖 OTOMATİK ALARM ÜRETİLDİ: ${randMahalle} - ${randHata}`);

        res.status(201).json({
            success: true,
            message: "Sistem tarafından otomatik alarm üretildi.",
            data: newAlarm
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};