# Kaynak Tüketimi Analiz Sistemi

Sistemin amacı, kentsel enerji, su ve doğalgaz tüketim verilerini simüle etmek, analiz etmek ve görselleştirmek için kapsamlı bir platform sunmaktır.

## 🧠 System Architecture

### 🐍 1. Python Simulation Layer — `Veri Uretimi/`

Simülasyon katmanı, gerçekçi tüketim verileri üretmek için Python kullanır:

- **`uretim_modelleri.py`** → Mevsimsel, günlük ve saatlik profiller içeren matematiksel modeller
- **`main.py`** → Ana simülasyon motoru ve veri üretimi
- **`analiz_et.py`** → Tüketim analizi ve özet istatistikler
- **`config.py`** → Mahalle profil konfigürasyonları (konut/sanayi)
- **`tuketim_verisi_tum_mahalleler_detayli.csv`** → Çıktı verisi

**Özellikler:**
- Mevsimsel dalgalanmalar (kış/yaz)
- Gün tipi farklılıkları (hafta içi/sonı)
- Saatlik tüketim profilleri
- Doğalgaz, elektrik ve su için özelleştirilmiş modeller
- Sanayi ve konut profilleri arası fark

### ⚙️ 2. Node.js Backend — `server.js`

Express.js kullanan backend, MongoDB ile entegre çalışır ve RESTful API sağlar:

**API Endpoints:**

- `GET /api/import-csv` → CSV dosyasından MongoDB'ye veri içe aktarma ⭐ YENİ
- `GET /api/consumptions` → Tüm tüketim kayıtları
- `GET /api/neighborhoods` → Mahalle bazında haftalık veriler
- `GET /api/neighborhoods/search?q=query` → Mahalle arama
- `GET /api/energy` → Enerji özet istatistikleri
- `GET /api/admin` → Yönetici paneli verileri
- `GET /api/average-consumption` → Haftalık ortalama hesaplama

**Teknolojiler:**
- Node.js & Express.js
- MongoDB Atlas (cloud database)
- Mongoose (ODM)
- csv-parser (CSV işleme)

### 💻 3. React Frontend — `client/`

Modern ve interaktif React uygulaması:

**Sayfalar:**
- **Dashboard** → Haftalık tüketim trendleri ve mahalle analizi
- **Admin** → Sistem istatistikleri ve mahalle yönetimi
- **Electricity** → Elektrik tüketim detayları
- **Water** → Su tüketim detayları
- **Gas** → Doğalgaz tüketim detayları

**Özellikler:**
- Arama ve filtreleme
- Recharts ile interaktif grafikler
- Responsive tasarım
- Loading states ve error handling

## 📊 Teknolojiler

- **Frontend:** React.js, Recharts, JavaScript, CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Simülasyon:** Python, Pandas, NumPy
- **Veri Depolama:** MongoDB Atlas / CSV
- **Araçlar:** VS Code, npm, Git

## 📁 Dizin Yapısı

```
Kaynak_Tuketimi_Analiz_Sistemi/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # React bileşenleri
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   └── Chart.js
│   │   ├── pages/                   # Sayfa bileşenleri
│   │   │   ├── Dashboard.js
│   │   │   ├── Admin.js
│   │   │   ├── Electricity.js
│   │   │   ├── Water.js
│   │   │   └── Gas.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── Veri Uretimi/                    # Python simülasyon
│   ├── main.py
│   ├── analiz_et.py
│   ├── uretim_modelleri.py
│   ├── config.py
│   └── tuketim_verisi_*.csv
├── models/                          # MongoDB şemaları
│   ├── Consumption.js
│   └── AverageConsumption.js
├── server.js                        # Backend server
├── package.json
└── README.md
```

## 🚀 Kurulum ve Çalıştırma

### 1. Gereksinimler

- Node.js (v14+)
- Python 3.7+
- MongoDB Atlas hesabı veya local MongoDB

### 2. Backend Kurulumu

```bash
# Ana dizinde
npm install

# Backend'i başlat
node server.js
# veya
npm start
```

Backend `http://localhost:5002` adresinde çalışır.

**📥 Python CSV Verilerini İçe Aktarma:**

CSV dosyasından verileri MongoDB'ye aktarmak için:

```bash
# Backend çalışırken tarayıcıda aç:
http://localhost:5002/api/import-csv

# Veya terminal'den:
curl http://localhost:5002/api/import-csv
```

Detaylı entegrasyon rehberi için: [CSV_INTEGRATION_GUIDE.md](./CSV_INTEGRATION_GUIDE.md)

### 3. Frontend Kurulumu

```bash
# Client dizininde
cd client
npm install

# React uygulamasını başlat
npm start
```

Frontend `http://localhost:3000` adresinde çalışır.

### 4. Python Simülasyonu (Opsiyonel)

```bash
# Veri Uretimi dizininde
cd "Veri Uretimi"

# Gerekli Python paketlerini yükle
pip install pandas numpy

# Simülasyonu çalıştır
python main.py
```

## 📈 Özellikler

### Dinamik Veri Simülasyonu
- Çoklu mahalle desteği (Çaydaçıra, İzzetpaşa, Sanayi)
- Gerçekçi mevsimsel ve günlük dalgalanmalar
- 30 dakika aralıklarla detaylı kayıt

### İnteraktif Analiz
- Haftalık trend grafikleri
- Mahalle karşılaştırma
- Arama ve filtreleme
- Özet istatistikler

### RESTful API
- MongoDB entegrasyonu
- Haftalık gruplama ve ortalama hesaplama
- Arama ve filtreleme desteği
- Admin paneli API'leri

## 🎯 Kullanım

1. Backend'i başlatın (`node server.js`)
2. Frontend'i başlatın (`cd client && npm start`)
3. Tarayıcıda `http://localhost:3000` açın
4. Dashboard'da mahalle seçin ve grafikleri inceleyin
5. Admin panelinde sistem istatistiklerini görün

## 📝 Notlar

- MongoDB bağlantı bilgileri `server.js` içinde bulunur
- Proxy ayarı `client/package.json` içinde yapılandırılmıştır
- Simülasyon 2022-2024 arası veri üretir
- Her mahalle için ayrı tüketim profilleri tanımlanmıştır

## 🔧 Geliştirme

### Yeni Mahalle Ekleme
1. `Veri Uretimi/config.py` içinde yeni profil tanımla
2. Python simülasyonunu çalıştır
3. Verileri MongoDB'ye yükle

### Yeni API Endpoint Ekleme
1. `server.js` içine yeni endpoint ekle
2. Frontend'de kullanıcı arayüzü oluştur
3. Gerekli MongoDB sorgularını yaz

## 📄 Lisans

Bu proje eğitim ve araştırma amaçlı geliştirilmiştir.
