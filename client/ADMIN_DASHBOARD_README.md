# Kentsel Tüketim Analizi Platformu - Admin Dashboard

Modern ve responsive admin dashboard web uygulaması React + Tailwind CSS kullanılarak geliştirilmiştir.

## ✨ Özellikler

- **Modern Navigasyon**: Fixed top navbar ile kolay erişim
- **Dinamik İçerik**: Elektrik, Su, Doğalgaz ve Yönetici bölümleri
- **Kart Tabanlı Arayüz**: Soft shadows, rounded corners ve hover efektleri
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Smooth Animations**: Geçişlerde fade-in animasyonları
- **Lucide React İkonları**: Modern ve profesyonel görünüm

## 📋 Yeni Yapı

### Bileşenler (Components)
- `Navbar.js` - Top navigation bar
- `Elektrik.js` - Elektrik tüketim sayfası
- `Su.js` - Su tüketim sayfası  
- `Dogalgaz.js` - Doğalgaz tüketim sayfası
- `Yonetici.js` - Yönetici paneli

### Menü Yapısı
- ⚡ **Elektrik** (`/elektrik`) - Elektrik tüketim verileri
- 💧 **Su** (`/su`) - Su tüketim verileri
- 🔥 **Doğalgaz** (`/dogalgaz`) - Doğalgaz tüketim verileri
- 👤 **Yönetici** (`/yonetici`) - Sistem yönetim paneli

## 🚀 Çalıştırma

```bash
cd client
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🎨 Tasarım Özellikleri

- **Renk Paleti**: Blue-gray tonları
- **Kartlar**: White background, soft shadows, border-gray-100
- **Hover Efektleri**: Smooth transitions
- **Typography**: Inter font family
- **Animations**: Fade-in effects for content loading

## 📊 Veri Yapısı

Her kategori (Elektrik, Su, Doğalgaz) için:
- 6 mahalle kartı
- Ortalama tüketim değerleri
- Değişim yüzdeleri
- Sistem istatistikleri (Toplam Mahalle, Aktif Veri Kaynakları, Toplam Tüketim)

Yönetici paneli için:
- 6 yönetim kartı
- Sistem özeti (veri, uptime, güncellemeler)

## 🛠️ Teknolojiler

- React 19.2.0
- React Router DOM 7.9.4
- Tailwind CSS 3.4.14
- Lucide React (icons)
- Recharts (mevcut Dashboard'da kullanılıyor)

