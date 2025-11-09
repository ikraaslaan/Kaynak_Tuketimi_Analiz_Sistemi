import mongoose from "mongoose";

const AverageConsumptionSchema = new mongoose.Schema({
  Mahalle: { type: String, required: true },
  Baslangic: { type: Date, required: true },
  Bitis: { type: Date, required: true },
  Ortalama_Su_Tuketim: { type: Number, required: true },
  Ortalama_Elektrik_Tuketim: { type: Number, required: true },
  Ortalama_Dogalgaz_Tuketim: { type: Number, required: true }
});

// Burada model oluşturuyoruz
const Average = mongoose.model(
  "AverageConsumption",
  AverageConsumptionSchema
);

// Default export
export default Average;
