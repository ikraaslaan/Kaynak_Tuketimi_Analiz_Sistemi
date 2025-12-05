const Incident = require('../models/Incident');

// 1. Arızaları Listele (Filtreli)
// GET /api/incidents?durum=AKTIF
exports.getIncidents = async (req, res) => {
  try {
    const { durum } = req.query;
    let query = {};

    // Eğer ?durum=AKTIF gelirse sadece aktifleri getir
    if (durum) {
      query.Durum = durum.toUpperCase();
    }

    const incidents = await Incident.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Planlı Kesinti Ekle (Admin Manuel Ekler)
// POST /api/incidents
exports.createIncident = async (req, res) => {
  try {
    const { Mahalle, Kaynak_Tipi, Aciklama, Baslangic_Tarihi, Bitis_Tarihi } = req.body;

    const newIncident = await Incident.create({
      Mahalle,
      Kaynak_Tipi,
      Tip: 'PLANLI_KESINTI', // Manuel eklenenler genelde planlıdır
      Kaynak_Kaydi: 'MANUEL',
      Durum: 'AKTIF',
      Aciklama,
      Baslangic_Tarihi,
      Bitis_Tarihi
    });

    res.status(201).json({
      success: true,
      data: newIncident
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Arızayı Çöz (Pasife Çek)
// PUT /api/incidents/:id/coz
exports.resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Arıza kaydı bulunamadı' });
    }

    incident.Durum = 'PASIF';
    incident.Bitis_Tarihi = Date.now(); // Şu an bitti
    await incident.save();

    res.status(200).json({
      success: true,
      message: 'Arıza giderildi ve pasife çekildi.',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};