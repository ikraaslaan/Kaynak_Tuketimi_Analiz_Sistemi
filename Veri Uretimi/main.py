import pandas as pd
import time
import numpy as np 
# DİKKAT: Fonksiyon adları değişti (artık 'profil' alıyorlar)
from pymongo import MongoClient
from uretim_modelleri import get_mevsimsel_carpan, get_gun_tipi_carpan, get_saatlik_carpan
from config import MAHALLE_PROFILLERI

print("Simülatör Başlatılıyor...")
print(f"Tanımlı Mahalle Profilleri: {list(MAHALLE_PROFILLERI.keys())}")
print("-" * 30)

baslangic_tarihi = pd.to_datetime('2022-01-01 00:00:00')
bitis_tarihi = pd.to_datetime('2024-12-31 23:30:00')
zaman_adimi = pd.Timedelta(minutes=30)
 
sanal_zaman = baslangic_tarihi
print(f"Simülasyon Aralığı: {baslangic_tarihi} -> {bitis_tarihi}")
print("-" * 30)
 
baslama_zamani_gercek = time.time()
uretilen_veriler = []

# --- Ana Simülasyon Döngüsü ---
while sanal_zaman <= bitis_tarihi:
    
    # DİKKAT: 'mahalle_adi' yerine artık 'profil' sözlüğünü alıyoruz
    for mahalle_adi, profil in MAHALLE_PROFILLERI.items():
    
        # --- TÜM ÇARPANLARI HESAPLA ---
        # Fonksiyonlara artık 'mahalle_adi' yerine 'profil' sözlüğünü yolluyoruz
        
        # 1. Mevsim
        carpan_mevsim_e = get_mevsimsel_carpan(sanal_zaman, 'elektrik', profil)
        carpan_mevsim_s = get_mevsimsel_carpan(sanal_zaman, 'su', profil)
        carpan_mevsim_d = get_mevsimsel_carpan(sanal_zaman, 'dogalgaz', profil)
        
        # 2. Gün Tipi
        carpan_gun = get_gun_tipi_carpan(sanal_zaman, profil)
        
        # 3. Saatlik Profil
        carpan_saat_e = get_saatlik_carpan(sanal_zaman, 'elektrik', profil)
        carpan_saat_s = get_saatlik_carpan(sanal_zaman, 'su', profil)
        carpan_saat_d = get_saatlik_carpan(sanal_zaman, 'dogalgaz', profil)
        
        # 4. Gürültü
        gurultu_e = np.random.normal(1.0, 0.08) 
        gurultu_s = np.random.normal(1.0, 0.08)
        gurultu_d = np.random.normal(1.0, 0.05) # En son %0.5'te karar kılmıştık
        
        # --- FİNAL HESAPLAMA ---
        
        anlik_elektrik = (profil['base_elektrik'] * carpan_mevsim_e * carpan_gun * carpan_saat_e * gurultu_e)
        anlik_su = (profil['base_su'] * carpan_mevsim_s * carpan_gun * carpan_saat_s * gurultu_s)
        anlik_dogalgaz = (profil['base_dogalgaz'] * carpan_mevsim_d * carpan_gun * carpan_saat_d * gurultu_d)
        
        # 4. Listeye Ekle
        uretilen_veriler.append({
            'Tarih': sanal_zaman,
            'Mahalle': mahalle_adi,
            'Elektrik_Tuketim': round(anlik_elektrik, 2),
            'Su_Tuketim': round(anlik_su, 2),
            'Dogalgaz_Tuketim': round(anlik_dogalgaz, 2)
        })

    sanal_zaman = sanal_zaman + zaman_adimi
 
# --- Simülasyon Sonrası ---
bitis_zamani_gercek = time.time()
# ... (sizin kodunuz aynı kalıyor) ...
df = pd.DataFrame(uretilen_veriler)
print("-" * 30)
print(f"Toplam Üretilen Veri Satırı: {len(df)}") 
# ... (sizin kodunuz aynı kalıyor) ...
print("-" * 30)


# --- 2. YENİ BÖLÜM: MONGODB'YE KAYDETME ---

# !!! 1. Adım: KENDİ BİLGİLERİNİZİ GİRİN !!!
# Adım 2'de kopyaladığınız bağlantı adresiniz:
MONGODB_URI = "mongodb+srv://23frontend23_db_user:uIiIKAqkiP0drca9@verikaynagi.bueal8j.mongodb.net/?retryWrites=true&w=majority&appName=VeriKaynagi"
DB_NAME = "tuketim_analizi_db"       # İstediğiniz bir veritabanı adı
COLLECTION_NAME = "tuketim_kayitlari"  # İstediğiniz bir koleksiyon adı

try:
    print(f"MongoDB Cloud'a bağlanılıyor ({DB_NAME}.{COLLECTION_NAME})...")
    
    # 2. Adım: Bağlantıyı kur
    client = MongoClient(MONGODB_URI)
    
    # 3. Adım: Veritabanını ve Koleksiyonu seç
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # (Opsiyonel): Her çalıştırmada eski verileri silmek isterseniz bu satırı açın
    # print("Eski veriler siliniyor...")
    # collection.delete_many({}) 

    print(f"MongoDB'ye {len(uretilen_veriler)} adet JSON belgesi yükleniyor...")
    
    # 4. Adım: Tüm verileri tek seferde toplu olarak gönder
    # 'uretilen_veriler' listeniz zaten [{}, {}, ...] formatında olduğu için mükemmeldir
    collection.insert_many(uretilen_veriler) 
    
    print("MongoDB'ye kayıt başarıyla tamamlandı.")

except Exception as e:
    print(f"!!! HATA: MongoDB'ye kayıt başarısız: {e}")
    print("Lütfen Adım 2 (Connection String) ve Adım 3 (IP Adresi) ayarlarınızı kontrol edin.")

finally:
    # 5. Adım: Bağlantıyı kapat
    if 'client' in locals() and client:
        client.close()
        print("MongoDB bağlantısı kapatıldı.")

# --- YENİ BÖLÜMÜN SONU ---


print("-" * 30)
output_filename = 'tuketim_verisi_tum_mahalleler_detayli.csv'
# BU KOD AYNI KALIYOR (CSV'ye de kaydetmeye devam edecek)
df.to_csv(output_filename, index=False, encoding='utf-8-sig')
print(f"\n--- Veri '{output_filename}' dosyasına başarıyla kaydedildi! ---")