const Reading = require('../models/Reading');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Veritabanından verileri çek ve Mahalle bazında grupla
        const stats = await Reading.aggregate([
            {
                $group: {
                    _id: "$Mahalle", // Gruplama anahtarı: Mahalle Adı
                    
                    // Veritabanındaki alan isimlerin 'Elektrik_Tuketim' ise burası çalışır
                    avgElektrik: { $avg: "$Elektrik_Tuketim" }, 
                    avgSu: { $avg: "$Su_Tuketim" },             
                    avgDogalgaz: { $avg: "$Dogalgaz_Tuketim" }  
                }
            },
            {
                // 2. Çıkan sonucu Frontend'in istediği formata dönüştür
                $project: {
                    _id: 0,
                    mahalle: "$_id",
                    elektrik: { 
                        ortalama: { $round: ["$avgElektrik", 2] } // Virgülden sonra 2 basamak
                    },
                    su: { 
                        ortalama: { $round: ["$avgSu", 2] } 
                    },
                    dogalgaz: { 
                        ortalama: { $round: ["$avgDogalgaz", 2] } 
                    }
                }
            },
            { $sort: { mahalle: 1 } } // Alfabetik sırala
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Veri Çekme Hatası:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};