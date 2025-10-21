// models/AverageConsumption.js
const mongoose = require("mongoose");

const averageConsumptionSchema = new mongoose.Schema({
  Mahalle: String,
  Baslangic: Date,
  Bitis: Date,
  Ortalama_Su_Tuketim: Number,
  Ortalama_Elektrik_Tuketim: Number,
  Ortalama_Dogalgaz_Tuketim: Number,
});

// Üçüncü parametre ile koleksiyon adını belirle
module.exports = mongoose.model("AverageConsumption", averageConsumptionSchema, "ortalama_tuketimler");