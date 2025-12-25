const Incident = require('../models/Incident');
const LiveTuketim = require('../models/LiveTuketim'); // Yeni eklediğimiz model
const ActiveAlarm = require('../models/ActiveAlarm'); 

// Arıza Listesi
exports.getIncidents = async (req, res) => {
  try {
    // Önce zamanı gelmiş planlı kesintileri aktifleştir
    const now = new Date();
    await Incident.updateMany(
      { 
        Tur: 'Planlı Kesinti', 
        Baslangic_Zamani: { $lte: now }, 
        Durum: 'Pasif' 
      },
      { $set: { Durum: 'Aktif' } }
    );

    const incidents = await Incident.find().sort({ Tarih: -1 });
    res.status(200).json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Planlı Kesinti Oluşturma
exports.createPlannedOutage = async (req, res) => {
  try {
    const { Mahalle, Kaynak_Tipi, Aciklama, Tahmini_Sure, Baslangic_Zamani } = req.body;

    // Başlangıç zamanı kontrolü
    const start = new Date(Baslangic_Zamani);
    const now = new Date();
    
    // Eğer tarih gelecekteyse "Pasif", geçmiş veya şu an ise "Aktif"
    const durum = start > now ? 'Pasif' : 'Aktif';

    const newIncident = new Incident({
      Mahalle,
      Kaynak_Tipi,
      Tur: 'Planlı Kesinti',
      Aciklama,
      Tahmini_Sure,
      Durum: durum, 
      Baslangic_Zamani: start,
      Tarih: now 
    });

    await newIncident.save();
    res.status(201).json({ success: true, data: newIncident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Anlık Arıza Oluşturma
exports.createInstantIncident = async (req, res) => {
  try {
    const { Mahalle, Kaynak_Tipi, Aciklama } = req.body;

    // Mükerrer Kayıt Kontrolü (Aynı mahallede, aynı kaynakta aktif arıza var mı?)
    const existing = await Incident.findOne({
      Mahalle,
      Kaynak_Tipi,
      Durum: 'Aktif'
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `HATA: ${Mahalle} mahallesinde zaten aktif bir ${Kaynak_Tipi} arızası mevcut!` 
      });
    }

    const newIncident = new Incident({
      Mahalle,
      Kaynak_Tipi,
      Tur: 'Anlık Arıza',
      Aciklama,
      Durum: 'Aktif',
      Tarih: new Date()
    });

    await newIncident.save();
    res.status(201).json({ success: true, data: newIncident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Arıza Çözme (Yönetici Onayı)
exports.resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Arıza bulunamadı' });

    incident.Durum = 'Çözüldü';
    await incident.save();

    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// SİSTEM ALARMLARINI GETİR (Bildirim Çubuğu İçin)
// =========================================================================
exports.getSystemAlerts = async (req, res) => {
    try {
        console.log("🔍 Alarm kontrolü yapılıyor..."); 

        // Veritabanındaki 'aktif_alarmlar' tablosundaki her şeyi çek
        const alerts = await ActiveAlarm.find().sort({ _id: -1 });

        console.log(`✅ Bulunan Alarm Sayısı: ${alerts.length}`);
        
        if (alerts.length === 0) {
            return res.status(200).json({ success: true, alerts: [] });
        }

        res.status(200).json({ success: true, alerts: alerts });

    } catch (error) {
        console.error("Alarm Çekme Hatası:", error);
        res.status(500).json({ success: false, message: "Alarmlar alınamadı." });
    }
};

// =========================================================================
// YENİ: CANLI VERİ TABLOSUNDAN SON KAYDI ÇEK (tuketim_kayitlari)
// =========================================================================
exports.getLiveDashboardData = async (req, res) => {
    try {
        // 1. Veritabanındaki tüm mahalle isimlerini bul
        const neighborhoods = await LiveTuketim.distinct("Mahalle");
        
        const liveData = [];

        for (const mahalleIsmi of neighborhoods) {
            // 2. Her mahalle için EN SON eklenen kaydı (Tarih veya ID'ye göre) çek
            const latestRecord = await LiveTuketim.findOne({ Mahalle: mahalleIsmi })
                                                  .sort({ _id: -1 }); // En yeni kayıt en üstte

            if (latestRecord) {
                // Frontend'in beklediği formata çeviriyoruz
                // (Frontend 'ortalama' bekliyor, biz ona gerçek 'tuketim' değerini veriyoruz)
                liveData.push({
                    mahalle: latestRecord.Mahalle,
                    elektrik: { ortalama: latestRecord.Elektrik_Tuketim }, 
                    su: { ortalama: latestRecord.Su_Tuketim },
                    dogalgaz: { ortalama: latestRecord.Dogalgaz_Tuketim }
                });
            }
        }

        res.status(200).json({ success: true, data: liveData });

    } catch (error) {
        console.error("Canlı Veri Hatası:", error);
        res.status(500).json({ success: false, message: "Canlı veriler alınamadı" });
    }
};