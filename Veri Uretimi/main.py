import pandas as pd
import time
import numpy as np
import json
from copy import deepcopy

# --- 1. MODÜLLERİ İÇERİ AKTAR ---
import uretim_modelleri as motor
from config import (
    PROFIL_KONUT_STANDART, PROFIL_SANAYI, 
    PROFIL_PARK, PROFIL_KAMPUS
)

# --- 2. AYARLAR VE ŞABLON YÜKLEME ---
baslangic_tarihi = pd.to_datetime("2022-01-01 00:00:00")
bitis_tarihi = pd.to_datetime("2024-12-31 23:30:00")
zaman_adimi = pd.Timedelta(minutes=30)
output_filename = "tuketim_verisi_tum_mahalleler_detayli.csv"

# Şablon Kütüphanesini Hazırla
TANIMLI_PROFIL_SABLONLARI = {
    "konut_standart": PROFIL_KONUT_STANDART,
    "sanayi": PROFIL_SANAYI,
    "park": PROFIL_PARK,
    "kampus": PROFIL_KAMPUS
}
print("Profil şablonları (config.py) hafızaya yüklendi.")

# --- 3. MAHALLELER.JSON'U YÜKLE VE BİRLEŞTİR ---
print("mahalleler.json dosyası okunuyor...")
try:
    with open('mahalleler.json', 'r', encoding='utf-8') as f:
        mahalle_listesi_json = json.load(f)
except FileNotFoundError:
    print("HATA: mahalleler.json dosyası bulunamadı.")
    exit()

# JSON ve Şablonları birleştirerek ana MAHALLE_PROFILLERI sözlüğünü oluştur
MAHALLE_PROFILLERI = {}
for mahalle_data in mahalle_listesi_json:
    mahalle_adi = mahalle_data["mahalle_adi"]
    profil_tipi_adi = mahalle_data["profil_tipi"]
    
    if profil_tipi_adi in TANIMLI_PROFIL_SABLONLARI:
        # 1. Ana şablonu kopyala (deepcopy ile tam bağımsız kopya)
        profil_sablonu = deepcopy(TANIMLI_PROFIL_SABLONLARI[profil_tipi_adi])
        
        # 2. JSON'daki base değerlerini şablona ekle
        profil_sablonu.update(mahalle_data)
        
        # 3. (İzzetpaşa gibi) özel saatlik profiller varsa, ana şablonu "ez"
        if "ozel_saatlik_profiller" in mahalle_data:
            profil_sablonu['saatlik_profiller'].update(mahalle_data["ozel_saatlik_profiller"])
            
        MAHALLE_PROFILLERI[mahalle_adi] = profil_sablonu
    else:
        print(f"UYARI: '{mahalle_adi}' için '{profil_tipi_adi}' profili 'config.py'de bulunamadı.")

print(f"{len(MAHALLE_PROFILLERI)} mahalle (mahalleler.json) simülasyona hazır.")
print(f"Tanımlı Mahalleler: {list(MAHALLE_PROFILLERI.keys())}")
print("-" * 30)
print("Simülatör Başlatılıyor...")
print(f"Simülasyon Aralığı: {baslangic_tarihi} -> {bitis_tarihi}")
print("-" * 30)

# --- 4. ANA SİMÜLASYON DÖNGÜSÜ ---
baslama_zamani_gercek = time.time()
uretilen_veriler = []
sanal_zaman = baslangic_tarihi

while sanal_zaman <= bitis_tarihi:
    for mahalle_adi, profil in MAHALLE_PROFILLERI.items():
        
        # --- TÜM ÇARPANLARI HESAPLA ---
        carpan_mevsim_e = motor.get_mevsimsel_carpan(sanal_zaman, "elektrik", profil)
        carpan_mevsim_s = motor.get_mevsimsel_carpan(sanal_zaman, "su", profil)
        carpan_mevsim_d = motor.get_mevsimsel_carpan(sanal_zaman, "dogalgaz", profil)
        carpan_gun = motor.get_gun_tipi_carpan(sanal_zaman, profil)
        carpan_akademik = motor.get_akademik_carpan(sanal_zaman, profil)
        carpan_saat_e = motor.get_saatlik_carpan(sanal_zaman, "elektrik", profil)
        carpan_saat_s = motor.get_saatlik_carpan(sanal_zaman, "su", profil)
        carpan_saat_d = motor.get_saatlik_carpan(sanal_zaman, "dogalgaz", profil)
        gurultu_e = np.random.normal(1.0, 0.08)
        gurultu_s = np.random.normal(1.0, 0.08)
        gurultu_d = np.random.normal(1.0, 0.05)

        # --- FİNAL HESAPLAMA (BASİT VERSİYON) ---
        anlik_elektrik = (
            profil["base_elektrik"] * carpan_mevsim_e * carpan_gun * carpan_akademik * carpan_saat_e * gurultu_e
        )
        anlik_su = (
            profil["base_su"] * carpan_mevsim_s * carpan_gun * carpan_akademik * carpan_saat_s * gurultu_s
        )
        anlik_dogalgaz = (
            profil["base_dogalgaz"] * carpan_mevsim_d * carpan_gun * carpan_akademik * carpan_saat_d * gurultu_d
        )

        # Listeye Ekle
        uretilen_veriler.append(
            {
                "Tarih": sanal_zaman,
                "Mahalle": mahalle_adi,
                "Elektrik_Tuketim": round(anlik_elektrik, 2),
                "Su_Tuketim": round(anlik_su, 2),
                "Dogalgaz_Tuketim": round(anlik_dogalgaz, 2),
            }
        )

    sanal_zaman = sanal_zaman + zaman_adimi

# --- 5. SİMÜLASYON SONRASI ---
bitis_zamani_gercek = time.time()
df = pd.DataFrame(uretilen_veriler)
print("-" * 30)
print(f"Toplam Üretilen Veri Satırı: {len(df)}")
print(f"Simülasyon Gerçek Süresi: {round(bitis_zamani_gercek - baslama_zamani_gercek, 2)} saniye")
print("-" * 30)

# CSV'ye KAYIT
df.to_csv(output_filename, index=False, encoding="utf-8-sig")
print(f"\n--- Veri '{output_filename}' dosyasına başarıyla kaydedildi! ---")