// energy-backend/models/Consumption.js
import mongoose from "mongoose";

const ConsumptionSchema = new mongoose.Schema({
  Mahalle: String,
  Tarih: Date,
  Su_Tuketim: Number,
  Elektrik_Tuketim: Number,
  Dogalgaz_Tuketim: Number,
}, { timestamps: false });

// 3. parametre = koleksiyon adı
export default mongoose.model(
  "Consumption",
  ConsumptionSchema,
  "tuketim_kayitlari"
);
