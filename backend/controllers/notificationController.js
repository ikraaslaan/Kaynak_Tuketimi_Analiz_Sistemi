const Incident = require('../models/Incident');

// GET /api/notifications/unread
// Son 10 dakikada oluşturulmuş arızaları getirir
exports.getUnreadNotifications = async (req, res) => {
  try {
    // Şu andan 10 dakika öncesini hesapla
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentIncidents = await Incident.find({
      createdAt: { $gte: tenMinutesAgo }, // 10 dk önce veya daha yeni
      Durum: 'AKTIF'
    });

    res.status(200).json({
      success: true,
      count: recentIncidents.length,
      data: recentIncidents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};