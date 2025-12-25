const mongoose = require('mongoose');

// Arkadaşının oluşturduğu 'aktif_alarmlar' koleksiyonunu okuyacak model.
// strict: false dedik ki, içeride hangi veri varsa (mahalle, tarih, seviye) hepsini hatasız çeksin.
const ActiveAlarmSchema = new mongoose.Schema({
  // Buraya özel bir alan tanımlamıyorum, ne gelirse kabul etsin.
}, { 
    collection: 'aktif_alarmlar', // Veritabanındaki klasör adı (Screenshot'taki isim)
    strict: false,
    timestamps: true 
});

module.exports = mongoose.model('ActiveAlarm', ActiveAlarmSchema);