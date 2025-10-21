const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Consumption = require("./models/Consumption.js");
const Average = require("./models/AverageConsumption.js");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB bağlantısı
mongoose.connect("mongodb+srv://23frontend23_db_user:uIiIKAqkiP0drca9@verikaynagi.bueal8j.mongodb.net/tuketim_analizi_db")
  .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
  .catch(err => console.error("❌ MongoDB bağlantı hatası:", err));

// Tüm verileri çek
app.get("/api/consumptions", async (req, res) => {
  try {
    const data = await Consumption.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Sunucu hatası");
  }
});

app.get("/api/average-consumption", async (req, res) => {
  try {
    const mahalle = "Sanayi";
    const startDate = new Date("2022-01-01");
    const endDate = new Date("2022-01-07");

    // 1. Tarih aralığındaki verileri bul
    const records = await Consumption.find({
      Mahalle: mahalle,
      Tarih: { $gte: startDate, $lte: endDate }
    });

    if (records.length === 0) {
      return res.status(404).json({ message: "Veri bulunamadı. Bu tarih aralığında Sanayi mahallesine ait kayıt yok." });
    }

    // 2. ORTALAMA HESAPLAMA BLOĞU (BU KISIM EKSİK OLMAMALI!)
    const total = records.reduce(
      (acc, item) => {
        // Alan adlarının doğru olduğundan emin ol: Elektrik_Tuketim vb.
        acc.su += item.Su_Tuketim;
        acc.elektrik += item.Elektrik_Tuketim;
        acc.dogalgaz += item.Dogalgaz_Tuketim;
        return acc;
      },
      { su: 0, elektrik: 0, dogalgaz: 0 }
    );

    const count = records.length;
    
    // 🔥🔥 ORTALAMA OBJESİ BURADA TANIMLANIYOR 🔥🔥
    const ortalama = {
      Mahalle: mahalle,
      Baslangic: startDate,
      Bitis: endDate,
      Ortalama_Su_Tuketim: total.su / count,
      Ortalama_Elektrik_Tuketim: total.elektrik / count,
      Ortalama_Dogalgaz_Tuketim: total.dogalgaz / count,
    };

    // 3. Hesaplanan sonucu MongoDB’ye kaydet
    await Average.create(ortalama);

    // 4. Çıktıyı döndür
    res.json({
      message: "Haftalık ortalama başarıyla hesaplandı ve kaydedildi.",
      ortalama
    });

  } catch (err) {
    console.error("HATA AYRINTISI:", err.message);
    res.status(500).send("Sunucu hatası. Detaylar için konsolu kontrol edin.");
  }
});


app.listen(5000, () => console.log("🚀 Server http://localhost:5000 üzerinde çalışıyor"));
