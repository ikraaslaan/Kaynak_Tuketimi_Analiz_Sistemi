const mongoose = require("mongoose");

const consumptionSchema = new mongoose.Schema({
  Tarih: Date,
  Mahalle: String,
  Elektrik_Tuketim: Number,
  Su_Tuketim: Number,
  Dogalgaz_Tuketim: Number
});

// üçüncü parametre = MongoDB’deki koleksiyon adı
module.exports = mongoose.model("Consumption", consumptionSchema, "tuketim_kayitlari");
