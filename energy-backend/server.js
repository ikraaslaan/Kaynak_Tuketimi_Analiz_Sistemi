// energy-backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

import Consumption from "./models/Consumption.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

const { MONGO_URI, DB_NAME } = process.env;
console.log("✅ MONGO_URI var mı?:", !!MONGO_URI, " | DB_NAME:", DB_NAME);

mongoose
  .connect(MONGO_URI, { dbName: DB_NAME })   // ✅ ÖNEMLİ: DB_NAME burada
  .then(() => {
    console.log(`✅ MongoDB bağlantısı başarılı (db: ${mongoose.connection.name})`);
  })
  .catch((err) => {
    console.error("❌ Mongo bağlantı hatası:", err);
  });


// Hızlı teşhis endpoint: bağlı DB, koleksiyon adı ve toplam kayıt
app.get("/__info", async (_req, res) => {
  try {
    const db = mongoose.connection?.name;
    const collection = Consumption.collection?.name;
    const count = await Consumption.countDocuments();
    res.json({ db, collection, count });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/neighborhood-names", async (_req, res) => {
  try {
    const names = await Consumption.aggregate([
      { $group: { _id: { $trim: { input: "$Mahalle" } } } },
      { $project: { _id: 0, Mahalle: "$_id" } },
    ]);
    res.json(names.map(n => n.Mahalle));
  } catch (err) {
    console.error("MAHALLE API HATASI:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.get("/api/average/:neighborhood", async (req, res) => {
  try {
    const neighborhood = req.params.neighborhood;
    const period = req.query.period || "all";

    const lastRecord = await Consumption.findOne({
      Mahalle: { $regex: `^${neighborhood}$`, $options: "i" }
    }).sort({ Tarih: -1 });

    if (!lastRecord) return res.json(null);

    let dateFilter = {};
    if (period === "week") {
      const end = lastRecord.Tarih;
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.Tarih = { $gte: start, $lte: end };
    } else if (period === "month") {
      const end = lastRecord.Tarih;
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.Tarih = { $gte: start, $lte: end };
    }

    const result = await Consumption.aggregate([
      { $match: { Mahalle: { $regex: `^${neighborhood}$`, $options: "i" }, ...dateFilter }},
      { $group: {
          _id: "$Mahalle",
          Ortalama_Su_Tuketim: { $avg: "$Su_Tuketim" },
          Ortalama_Elektrik_Tuketim: { $avg: "$Elektrik_Tuketim" },
          Ortalama_Dogalgaz_Tuketim: { $avg: "$Dogalgaz_Tuketim" },
      } }
    ]);

    res.json(result.length ? result[0] : null);
  } catch (err) {
    console.error("AVERAGE API HATASI:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Backend çalışıyor: http://localhost:${PORT}`));
