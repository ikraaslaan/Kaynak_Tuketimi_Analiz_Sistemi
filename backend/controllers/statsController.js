const Reading = require('../models/Reading');

exports.getDashboardStats = async (req, res) => {
  console.log("➡️ İstatistik isteği işleniyor...");

  try {
    // Veritabanı boş mu kontrolü
    const count = await Reading.countDocuments();
    if (count === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    const stats = await Reading.aggregate([
      {
        $group: {
          _id: "$Mahalle",
          // DÜZELTME BURADA YAPILDI: Sonundaki 'i' harfleri silindi!
          // Veritabanında "Elektrik_Tuketim" yazıyor, biz de aynısını yazdık.
          avgElektrik: { $avg: "$Elektrik_Tuketim" },   
          avgSu: { $avg: "$Su_Tuketim" },               
          avgDogalgaz: { $avg: "$Dogalgaz_Tuketim" }    
        }
      },
      {
        $project: {
          _id: 0,
          mahalle: "$_id",
          elektrik: { ortalama: { $round: ["$avgElektrik", 2] } },
          su: { ortalama: { $round: ["$avgSu", 2] } },
          dogalgaz: { ortalama: { $round: ["$avgDogalgaz", 2] } }
        }
      },
      { $sort: { mahalle: 1 } } // Alfabetik sırala
    ]);

    console.log(`✅ ${stats.length} mahalle için veriler başarıyla çekildi.`);
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("❌ Stats Hatası:", error);
    res.status(500).json({ success: false, message: "Veri çekme hatası oluştu." });
  }
};