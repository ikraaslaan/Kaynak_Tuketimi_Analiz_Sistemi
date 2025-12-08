const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  Mahalle: {
    type: String,
    required: true // Örn: "Sanayi"
  },
  Kaynak_Tipi: {
    type: String,
    required: true,
    enum: ['Elektrik', 'Su', 'Dogalgaz'] // Hangi kaynakta sorun var?
  },
  Tip: {
    type: String,
    enum: ['ARIZA', 'PLANLI_KESINTI'],
    default: 'ARIZA'
  },
  Kaynak_Kaydi: {
    type: String,
    enum: ['OTOMATIK', 'MANUEL'],
    default: 'OTOMATIK'
  },
  Durum: {
    type: String,
    enum: ['AKTIF', 'PASIF'],
    default: 'AKTIF'
  },
  Aciklama: {
    type: String
  },
  Baslangic_Tarihi: {
    type: Date,
    default: Date.now
  },
  Bitis_Tarihi: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Incident', IncidentSchema);