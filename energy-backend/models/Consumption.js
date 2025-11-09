// --------- DOSYA: energy-backend/models/Consumption.js ---------
import mongoose from "mongoose";

const ConsumptionSchema = new mongoose.Schema({
  Mahalle: { type: String, required: true },
  Tarih: { type: Date, required: true },
  Su_Tuketim: { type: Number, required: true },
  Elektrik_Tuketim: { type: Number, required: true },
  Dogalgaz_Tuketim: { type: Number, required: true }
});

// ✅ Doğru koleksiyon
export default mongoose.model("Consumption", ConsumptionSchema, "tuketim_kayitlari");
