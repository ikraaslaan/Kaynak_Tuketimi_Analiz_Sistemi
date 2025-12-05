const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  Tarih: { type: Date, required: true },
  Mahalle: { type: String, required: true },
  Elektrik_Tuketim: { type: Number, required: true },
  Su_Tuketim: { type: Number, required: true },
  Dogalgaz_Tuketim: { type: Number, required: true }
}, { 
  collection: 'tuketim_kayitlari', // <--- BURASI MONGODB İLE BİREBİR AYNI OLMALI
  timestamps: false // Senin hazır verinde createdAt/updatedAt yoksa bunu false yapalım hata vermesin
});

module.exports = mongoose.model('Reading', ReadingSchema);