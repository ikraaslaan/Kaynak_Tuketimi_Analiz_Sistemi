# 📊 CSV Veri Entegrasyonu Rehberi

Bu rehber, Python tarafından üretilen CSV verilerinin Node.js backend'e ve React frontend'e entegre edilmesi işlemlerini açıklar.

## 🎯 Özet

Proje şu şekilde çalışır:
1. **Python** → CSV dosyası oluşturur (`tuketim_verisi_tum_mahalleler_detayli.csv`)
2. **Node.js Backend** → CSV'yi MongoDB'ye aktarır
3. **React Frontend** → Backend'den veriyi çeker ve grafikleri oluşturur

## 🚀 Kurulum Adımları

### 1. Gerekli Paketleri Yükleme (✅ TAMAMLANDI)

```bash
npm install csv-parser
```

### 2. CSV Verilerini İçe Aktarma

Backend'i başlatın:

```bash
node server.js
```

Ardından tarayıcıda şu URL'yi açın:
```
http://localhost:5000/api/import-csv
```

Bu işlem:
- CSV dosyasını okur
- MongoDB'ye verileri aktarır
- Sonucu JSON formatında döndürür

**Alternatif:** Terminal'den test edebilirsiniz:

```bash
curl http://localhost:5000/api/import-csv
```

### 3. Verileri Kontrol Etme

Frontend'i başlatın:

```bash
cd client
npm start
```

Ardından tarayıcıda şu adresi açın:
```
http://localhost:3000
```

Dashboard ve Admin sayfaları artık gerçek Python verilerini gösterecektir.

## 🔧 Mevcut API Endpoint'leri

### `/api/import-csv` (GET)
CSV dosyasından veri içe aktarma işlemini başlatır.

**Örnek Y.Response:**
```json
{
  "success": true,
  "message": "CSV verisi başarıyla içe aktarıldı",
  "recordCount": 157776
}
```

### `/api/neighborhoods` (GET)
Tüm mahallelerin haftalık tüketim verilerini döndürür.

**Kullanım:**
- Dashboard.js ve Admin.js otomatik olarak bu endpoint'i kullanır
- Veri formatı: `{ name, electricity[], water[], gas[] }`

### `/api/neighborhoods/search?q=MahalleAdı` (GET)
Belirli bir mahalleye göre arama yapar.

### `/api/energy` (GET)
Toplam enerji istatistiklerini döndürür.

### `/api/admin` (GET)
Yönetici paneli için toplu veri ve istatistikler.

## 📁 Dosya Yapısı

```
Kaynak_Tuketimi_Analiz_Sistemi/
├── server.js                          # Backend server
├── models/
│   ├── Consumption.js                 # MongoDB model
│   └── AverageConsumption.js
├── Veri Uretimi/
│   └── tuketim_verisi_tum_mahalleler_detayli.csv  # Python üretimi
└── client/
    └── src/
        └── pages/
            ├── Dashboard.js           # Frontend dashboard
            └── Admin.js               # Frontend admin panel
```

## 🧪 Test Etme

### 1. Backend Testi

Terminal'de server'ı başlatın:
```bash
node server.js
```

Ardından başka bir terminal'de:
```bash
# Import endpoint'ini test et
curl http://localhost:5000/api/import-csv

# Neighborhoods endpoint'ini test et
curl http://localhost:5000/api/neighborhoods

# Search endpoint'ini test et
curl "http://localhost:5000/api/neighborhoods/search?q=Sanayi"
```

### 2. Frontend Testi

```bash
cd client
npm start
```

Tarayıcıda `http://localhost:3000` adresini açın.

**Beklenen Sonuç:**
- Dashboard sayfasında mahalle seçimi dropdown'u
- Seçilen mahalle için elektrik, su, gaz grafikleri
- Admin sayfasında tüm mahallelerin istatistikleri

## 🎨 Frontend Entegrasyonu (✅ HALİHAZIRDA YAPILIŞMIŞ)

`client/src/pages/Dashboard.js` ve `Admin.js` zaten backend'e bağlanmış durumda:

```javascript
// Otomatik olarak /api/neighborhoods endpoint'ini kullanır
const fetchNeighborhoods = async () => {
  const res = await fetch("/api/neighborhoods");
  const data = await res.json();
  return data;
};
```

Herhangi bir değişiklik yapmanıza gerek yok!

## 🔄 Veri Akışı

```
Python Script → CSV Export
     ↓
CSV Dosyası (tuketim_verisi_tum_mahalleler_detayli.csv)
     ↓
/api/import-csv endpoint → MongoDB Import
     ↓
MongoDB (MongoDB Atlas)
     ↓
/api/neighborhoods endpoint → JSON Response
     ↓
React Frontend (Dashboard.js, Admin.js)
     ↓
Charts & UI (Recharts)
```

## ⚠️ Sorun Giderme

### MongoDB bağlantı hatası
`.env` dosyasında `MONGO_URI` değişkenini kontrol edin.

### CSV dosyası bulunamadı
`server.js` içindeki `csvFilePath` yolunu kontrol edin. Varsayılan olarak:
```javascript
path.join(__dirname, "Veri Uretimi", "tuketim_verisi_tum_mahalleler_detayli.csv")
```

### Frontend'te veri görünmüyor
1. Browser Console'da hata olup olmadığını kontrol edin
2. Network tab'ında API isteklerinin başarılı olup olmadığını kontrol edin
3. Backend'in `http://localhost:5000` adresinde çalıştığından emin olun

## 📈 Gelişmiş Özellikler

### Otomatik CSV Import
Server başlangıcında otomatik olarak CSV'yi içe aktarmak için `server.js`'e şu kodu ekleyebilirsiniz:

```javascript
// MongoDB bağlantısından sonra
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB bağlantısı başarılı");
    
    // Veri yoksa CSV'den içe aktar
    const count = await Consumption.countDocuments();
    if (count === 0) {
      console.log("📥 Veri yok, CSV'den içe aktarılıyor...");
      // İçe aktarma işlemi için gerekli kodu buraya ekleyin
    }
  })
  .catch(err => console.error("❌ MongoDB bağlantı hatası:", err));
```

## ✅ Sonuç

Artık Python tarafından üretilen veriler otomatik olarak:
- ✅ MongoDB'ye aktarılıyor
- ✅ RESTful API ile erişilebilir hale geliyor
- ✅ React frontend'de dinamik grafikler olarak görüntüleniyor

Herhangi bir sorun yaşarsanız, console log'larını kontrol edin ve MongoDB bağlantınızı doğrulayın.

