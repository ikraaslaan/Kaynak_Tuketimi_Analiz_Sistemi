const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Consumption = require("./models/Consumption.js");
const Average = require("./models/AverageConsumption.js");

const app = express();
app.use(express.json());

// ✅ CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ✅ MongoDB Bağlantısı
mongoose.connect("mongodb+srv://23frontend23_db_user:uIiIKAqkiP0drca9@verikaynagi.bueal8j.mongodb.net/tuketim_analizi_db")
  .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
  .catch(err => console.error("❌ MongoDB bağlantı hatası:", err));

// ✅ Mahalle Listesi
app.get("/api/neighborhood-names", async (req, res) => {
  try {
    const results = [];
    const csvFilePath = path.join(__dirname, "Veri Uretimi", "tuketim_verisi_tum_mahalleler_detayli.csv");

    console.log(`📂 CSV dosyası okunuyor: ${csvFilePath}`);

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log(`✅ CSV okundu: ${results.length} kayıt bulundu`);

        // MongoDB'yi temizle (isteğe bağlı)
        await Consumption.deleteMany({});
        console.log("🗑️ Eski veriler silindi");

        // Verileri MongoDB'ye aktar
        const documents = results.map((row) => ({
          Tarih: new Date(row.Tarih),
          Mahalle: row.Mahalle,
          Elektrik_Tuketim: parseFloat(row.Elektrik_Tuketim),
          Su_Tuketim: parseFloat(row.Su_Tuketim),
          Dogalgaz_Tuketim: parseFloat(row.Dogalgaz_Tuketim),
        }));

        await Consumption.insertMany(documents);
        console.log(`✅ ${documents.length} kayıt MongoDB'ye aktarıldı`);

        res.json({
          success: true,
          message: "CSV verisi başarıyla içe aktarıldı",
          recordCount: documents.length,
        });
      })
      .on("error", (err) => {
        console.error("❌ CSV okuma hatası:", err);
        res.status(500).json({ error: err.message });
      });
  } catch (err) {
    console.error("❌ İçe aktarma hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

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

// Mahalle verilerini haftalık olarak gruplandır - CSV'den direkt okuma
app.get("/api/neighborhoods", (req, res) => {
  console.log("📥 /api/neighborhoods çağrıldı");
  const results = {};
  const csvFilePath = path.join(__dirname, "Veri Uretimi", "tuketim_verisi_tum_mahalleler_detayli.csv");
  
  console.log(`📂 CSV dosyası: ${csvFilePath}`);
  
  if (!fs.existsSync(csvFilePath)) {
    console.error("❌ CSV dosyası bulunamadı:", csvFilePath);
    return res.status(500).json({ error: "CSV dosyası bulunamadı" });
  }

  const stream = fs.createReadStream(csvFilePath);
  
  stream
    .pipe(csv())
    .on("data", (data) => {
      const neighborhood = data.Mahalle?.trim();
      if (!neighborhood) return;
      
      if (!results[neighborhood]) {
        results[neighborhood] = {
          name: neighborhood,
          electricity: [],
          water: [],
          gas: []
        };
      }
      
      const elec = parseFloat(data.Elektrik_Tuketim);
      const water = parseFloat(data.Su_Tuketim);
      const gas = parseFloat(data.Dogalgaz_Tuketim);
      
      if (!isNaN(elec)) results[neighborhood].electricity.push(elec);
      if (!isNaN(water)) results[neighborhood].water.push(water);
      if (!isNaN(gas)) results[neighborhood].gas.push(gas);
    })
    .on("end", () => {
      console.log(`📊 ${Object.keys(results).length} mahalle için veri toplandı`);
      
      // Haftalık ortalamaları hesapla (her 336 kayıt bir haftayı temsil eder)
      const result = Object.values(results).map(neighborhood => {
        const { electricity, water, gas } = neighborhood;
        const chunkSize = 336; // 48 entries/day * 7 days
        
        const weeklyElectricity = [];
        const weeklyWater = [];
        const weeklyGas = [];
        
        for (let i = 0; i < electricity.length; i += chunkSize) {
          const chunkE = electricity.slice(i, i + chunkSize);
          const chunkW = water.slice(i, i + chunkSize);
          const chunkG = gas.slice(i, i + chunkSize);
          
          if (chunkE.length > 0) {
            weeklyElectricity.push(
              Math.round(chunkE.reduce((a, b) => a + b, 0) / chunkE.length)
            );
          }
          if (chunkW.length > 0) {
            weeklyWater.push(
              Math.round(chunkW.reduce((a, b) => a + b, 0) / chunkW.length)
            );
          }
          if (chunkG.length > 0) {
            weeklyGas.push(
              Math.round(chunkG.reduce((a, b) => a + b, 0) / chunkG.length)
            );
          }
        }
        
        return {
          name: neighborhood.name,
          electricity: weeklyElectricity,
          water: weeklyWater,
          gas: weeklyGas
        };
      });
      
      console.log(`✅ ${result.length} mahalle işlendi`);
      res.json(result);
    })
    .on("error", (err) => {
      console.error("❌ CSV okuma hatası:", err);
      res.status(500).json({ error: "CSV dosyası okunamadı", details: err.message });
    });
});

// Mahalle arama endpoint'i - CSV'den direkt okuma
app.get("/api/neighborhoods/search", (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const results = {};
  const csvFilePath = path.join(__dirname, "Veri Uretimi", "tuketim_verisi_tum_mahalleler_detayli.csv");

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => {
      const neighborhood = data.Mahalle?.trim();
      if (!neighborhood) return;
      
      // Filter by query if provided
      if (query && !neighborhood.toLowerCase().includes(query)) return;
      
      if (!results[neighborhood]) {
        results[neighborhood] = {
          name: neighborhood,
          electricity: [],
          water: [],
          gas: []
        };
      }
      
      const elec = parseFloat(data.Elektrik_Tuketim);
      const water = parseFloat(data.Su_Tuketim);
      const gas = parseFloat(data.Dogalgaz_Tuketim);
      
      if (!isNaN(elec)) results[neighborhood].electricity.push(elec);
      if (!isNaN(water)) results[neighborhood].water.push(water);
      if (!isNaN(gas)) results[neighborhood].gas.push(gas);
    })
    .on("end", () => {
      const result = Object.values(results).map(neighborhood => {
        const { electricity, water, gas } = neighborhood;
        const chunkSize = 336;
        
        const weeklyElectricity = [];
        const weeklyWater = [];
        const weeklyGas = [];
        
        for (let i = 0; i < electricity.length; i += chunkSize) {
          const chunkE = electricity.slice(i, i + chunkSize);
          const chunkW = water.slice(i, i + chunkSize);
          const chunkG = gas.slice(i, i + chunkSize);
          
          if (chunkE.length > 0) {
            weeklyElectricity.push(
              Math.round(chunkE.reduce((a, b) => a + b, 0) / chunkE.length)
            );
          }
          if (chunkW.length > 0) {
            weeklyWater.push(
              Math.round(chunkW.reduce((a, b) => a + b, 0) / chunkW.length)
            );
          }
          if (chunkG.length > 0) {
            weeklyGas.push(
              Math.round(chunkG.reduce((a, b) => a + b, 0) / chunkG.length)
            );
          }
        }
        
        return {
          name: neighborhood.name,
          electricity: weeklyElectricity,
          water: weeklyWater,
          gas: weeklyGas
        };
      });
      
      res.json(result);
    })
    .on("error", (err) => {
      console.error("❌ Arama hatası:", err);
      res.status(500).json({ error: "CSV dosyası okunamadı" });
    });
});

// Enerji özet istatistikleri
app.get("/api/energy", async (req, res) => {
  try {
    const data = await Consumption.find();
    
    const totalElectricity = data.reduce((sum, item) => sum + item.Elektrik_Tuketim, 0);
    const totalWater = data.reduce((sum, item) => sum + item.Su_Tuketim, 0);
    const totalGas = data.reduce((sum, item) => sum + item.Dogalgaz_Tuketim, 0);
    
    res.json({
      totalElectricity: Math.round(totalElectricity),
      totalWater: Math.round(totalWater),
      totalGas: Math.round(totalGas),
      recordCount: data.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Sunucu hatası");
  }
});

// Admin paneli verileri
app.get("/api/admin", async (req, res) => {
  try {
    const data = await Consumption.find();
    const neighborhoods = [...new Set(data.map(item => item.Mahalle))];
    
    const neighborhoodStats = neighborhoods.map(name => {
      const neighborhoodData = data.filter(item => item.Mahalle === name);
      const avgElectricity = neighborhoodData.reduce((sum, item) => sum + item.Elektrik_Tuketim, 0) / neighborhoodData.length;
      const avgWater = neighborhoodData.reduce((sum, item) => sum + item.Su_Tuketim, 0) / neighborhoodData.length;
      const avgGas = neighborhoodData.reduce((sum, item) => sum + item.Dogalgaz_Tuketim, 0) / neighborhoodData.length;
      
      return {
        name,
        avgElectricity: Math.round(avgElectricity),
        avgWater: Math.round(avgWater),
        avgGas: Math.round(avgGas)
      };
    });
    
    res.json({
      totalNeighborhoods: neighborhoods.length,
      totalRecords: data.length,
      neighborhoods: neighborhoodStats
    });
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

    // 3. Hesaplanan sonucu MongoDB'ye kaydet
    await Average.create(ortalama);

    // 4. Çıktıyı döndür
    res.json({
      name: result[0]._id,
      electricity: result[0].avgElectricity || 0,
      water: result[0].avgWater || 0,
      gas: result[0].avgGas || 0,
    });

  } catch (err) {
    console.error("HATA AYRINTISI:", err.message);
    res.status(500).send("Sunucu hatası. Detaylar için konsolu kontrol edin.");
  }
});


// Catch-all handler: send back React's index.html file for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT} üzerinde çalışıyor`));
