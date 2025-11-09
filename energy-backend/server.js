// --------- DOSYA: energy-backend/server.js ---------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

import Consumption from "./models/Consumption.js";

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
  .catch((err) => console.error("❌ Mongo bağlantı hatası:", err));


// ✅ Mahalle listesi
app.get("/api/neighborhood-names", async (req, res) => {
  try {
    const names = await Consumption.distinct("Mahalle");
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});


// ✅ Ortalama veri (EN DÜZGÜN HALİ — TÜRKÇE & CASE-INSENSITIVE TAM EŞLEŞME)
app.get("/api/average/:neighborhood", async (req, res) => {
  try {
    const neighborhood = req.params.neighborhood;
    const period = req.query.period || "all";

    // 1) Verideki en son tarih bulunur
    const lastRecord = await Consumption.findOne({
      Mahalle: { $regex: `^${neighborhood}$`, $options: "i" }
    }).sort({ Tarih: -1 });

    if (!lastRecord) return res.json(null);

    let dateFilter = {};

    if (period === "week") {
      const end = lastRecord.Tarih;
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.Tarih = { $gte: start, $lte: end };
    }

    if (period === "month") {
      const end = lastRecord.Tarih;
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.Tarih = { $gte: start, $lte: end };
    }

    const result = await Consumption.aggregate([
      {
        $match: {
          Mahalle: { $regex: `^${neighborhood}$`, $options: "i" },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$Mahalle",
          Ortalama_Su_Tuketim: { $avg: "$Su_Tuketim" },
          Ortalama_Elektrik_Tuketim: { $avg: "$Elektrik_Tuketim" },
          Ortalama_Dogalgaz_Tuketim: { $avg: "$Dogalgaz_Tuketim" },
        }
      }
    ]);

    res.json(result.length ? result[0] : null);

  } catch (err) {
    console.error("AVERAGE API HATASI:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});





// ✅ Sunucu Başlat
const PORT = process.env.PORT || 5002;
app.listen(PORT, () =>
  console.log(`🚀 Backend çalışıyor: http://localhost:${PORT}`)
);
