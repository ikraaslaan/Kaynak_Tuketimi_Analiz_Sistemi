const Reading = require('../models/Reading');

exports.getDashboardStats = async (req, res) => {
  try {
    // URL'den tarihleri al (Örn: ?baslangic=2022-01-01&bitis=2022-02-01)
    const { baslangic, bitis } = req.query;

    // Filtre objesi oluştur
    let matchStage = {};

    // Eğer tarih geldiyse filtreye ekle
    if (baslangic && bitis) {
      matchStage = {
        Tarih: {
          $gte: new Date(baslangic), // Büyük veya eşit
          $lte: new Date(bitis)      // Küçük veya eşit
        }
      };
    }

    const stats = await Reading.aggregate([
      // 1. ADIM: Önce tarih filtresini uygula (Performans için en başa koyduk)
      { $match: matchStage }, 

      // 2. ADIM: Gruplama (Eski kodun aynısı)
      {
        $group: {
          _id: "$Mahalle",
          ort_elektrik: { $avg: "$Elektrik_Tuketim" },
          max_elektrik: { $max: "$Elektrik_Tuketim" },
          min_elektrik: { $min: "$Elektrik_Tuketim" },
          ort_su: { $avg: "$Su_Tuketim" },
          max_su: { $max: "$Su_Tuketim" },
          ort_dogalgaz: { $avg: "$Dogalgaz_Tuketim" },
          max_dogalgaz: { $max: "$Dogalgaz_Tuketim" },
          toplam_veri_sayisi: { $sum: 1 }
        }
      },
      // 3. ADIM: Veriyi Düzenle (Eski kodun aynısı)
      {
        $project: {
          mahalle: "$_id",
          _id: 0,
          elektrik: {
            ortalama: { $round: ["$ort_elektrik", 2] },
            en_yuksek: "$max_elektrik",
            en_dusuk: "$min_elektrik"
          },
          su: {
            ortalama: { $round: ["$ort_su", 2] },
            en_yuksek: "$max_su"
          },
          dogalgaz: {
            ortalama: { $round: ["$ort_dogalgaz", 2] },
            en_yuksek: "$max_dogalgaz"
          },
          kayit_sayisi: "$toplam_veri_sayisi"
        }
      },
      { $sort: { mahalle: 1 } }
    ]);

    res.status(200).json({
      success: true,
      tarih_araligi: { baslangic, bitis }, // Bilgi amaçlı geri dönüyoruz
      count: stats.length,
      data: stats
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};