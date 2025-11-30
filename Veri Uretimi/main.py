import pandas as pd
import time
import numpy as np
import json
from copy import deepcopy
from pymongo import MongoClient
import sys
sys.stdout.reconfigure(encoding='utf-8')

# --- 1. MODÜLLERİ İÇERİ AKTAR ---
import uretim_modelleri as motor
from config import (
    PROFIL_KONUT_STANDART, PROFIL_SANAYI, 
    PROFIL_PARK, PROFIL_KAMPUS
)

# --- 2. AYARLAR ---
baslangic_tarihi = pd.to_datetime("2022-01-01 00:00:00")
bitis_tarihi     = pd.to_datetime("2022-12-31 23:30:00") 
zaman_adimi      = pd.Timedelta(minutes=30)

output_filename = "tuketim_verisi_tum_mahalleler_detayli.csv"

# --- PROFİL ŞABLONLARINI YÜKLE ---
TANIMLI_PROFIL_SABLONLARI = {
    "konut_standart": PROFIL_KONUT_STANDART,
    "sanayi": PROFIL_SANAYI,
    "park": PROFIL_PARK,
    "kampus": PROFIL_KAMPUS
}
print("Profil şablonları (config.py) hafızaya yüklendi.")

# --- 3. MAHALLELER.JSON YÜKLE ---
print("mahalleler.json dosyası okunuyor...")
try:
    with open('mahalleler.json', 'r', encoding='utf-8') as f:
        mahalle_listesi_json = json.load(f)
except FileNotFoundError:
    print("HATA: mahalleler.json dosyası bulunamadı.")
    exit()

# JSON → PROFİL BİRLEŞTİR
MAHALLE_PROFILLERI = {}
for mahalle_data in mahalle_listesi_json:
    mahalle_adi = mahalle_data["mahalle_adi"]
    profil_tipi_adi = mahalle_data["profil_tipi"]
    
    if profil_tipi_adi in TANIMLI_PROFIL_SABLONLARI:
        profil_sablonu = deepcopy(TANIMLI_PROFIL_SABLONLARI[profil_tipi_adi])
        profil_sablonu.update(mahalle_data)

        if "ozel_saatlik_profiller" in mahalle_data:
            profil_sablonu['saatlik_profiller'].update(mahalle_data["ozel_saatlik_profiller"])

        MAHALLE_PROFILLERI[mahalle_adi] = profil_sablonu
    else:
        print(f"UYARI → '{mahalle_adi}' için profil bulunamadı: {profil_tipi_adi}")

print(f"{len(MAHALLE_PROFILLERI)} mahalle ile 1 yıllık simülasyon başlatılıyor")
print("-"*30)

# --- 4. SİMÜLASYON ---
print("Simülatör çalışıyor...")
baslama_zaman = time.time()
uretilen_veriler = []
sanal_zaman = baslangic_tarihi

while sanal_zaman <= bitis_tarihi:
    for mahalle_adi, profil in MAHALLE_PROFILLERI.items():

        carpan_mevsim_e = motor.get_mevsimsel_carpan(sanal_zaman, "elektrik", profil)
        carpan_mevsim_s = motor.get_mevsimsel_carpan(sanal_zaman, "su", profil)
        carpan_mevsim_d = motor.get_mevsimsel_carpan(sanal_zaman, "dogalgaz", profil)

        carpan_gun     = motor.get_gun_tipi_carpan(sanal_zaman, profil)
        carpan_akademik= motor.get_akademik_carpan(sanal_zaman, profil)

        carpan_saat_e  = motor.get_saatlik_carpan(sanal_zaman, "elektrik", profil)
        carpan_saat_s  = motor.get_saatlik_carpan(sanal_zaman, "su", profil)
        carpan_saat_d  = motor.get_saatlik_carpan(sanal_zaman, "dogalgaz", profil)

        gurultu_e = np.random.normal(1.0, 0.08)
        gurultu_s = np.random.normal(1.0, 0.08)
        gurultu_d = np.random.normal(1.0, 0.05)

        uretilen_veriler.append({
            "Tarih": sanal_zaman.to_pydatetime(),
            "Mahalle": mahalle_adi,
            "Elektrik_Tuketim": round(profil["base_elektrik"] * carpan_mevsim_e * carpan_gun * carpan_akademik * carpan_saat_e * gurultu_e, 2),
            "Su_Tuketim":       round(profil["base_su"]       * carpan_mevsim_s * carpan_gun * carpan_akademik * carpan_saat_s * gurultu_s, 2),
            "Dogalgaz_Tuketim": round(profil["base_dogalgaz"] * carpan_mevsim_d * carpan_gun * carpan_akademik * carpan_saat_d * gurultu_d, 2),
        })

    sanal_zaman += zaman_adimi

df = pd.DataFrame(uretilen_veriler)
print("-"*30)
print("Toplam Üretilen Kayıt:", len(df))
print("-"*30)


# ---------------------------------------------------------
# --- MONGODB KAYIT (YENİ URI İLE) ---
# ---------------------------------------------------------

MONGODB_URI = "mongodb+srv://23frontend23_db_user:PaoDBStFSwY3nPR0@verikaynagi.bueal8j.mongodb.net"

DB_NAME = "tuketim_analizi_db"
COLLECTION_NAME = "tuketim_kayitlari"

try:
    print(f"MongoDB'ye bağlanılıyor -> {DB_NAME}.{COLLECTION_NAME}")
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    batch_size = 5000
    total = len(uretilen_veriler)
    print(f"{total} kayıt -> {batch_size}'lik paketlerle yükleniyor...")

    for i in range(0, total, batch_size):
        collection.insert_many(uretilen_veriler[i:i+batch_size])
        print(f"{min(i+batch_size,total)} / {total} yüklendi...")

    print("MongoDB'ye tüm kayıtlar başarıyla kaydedildi!")

except Exception as e:
    print("MongoDB Hatası:", e)

finally:
    try: client.close()
    except: pass
    print("Bağlantı kapatıldı.")



df.to_csv(output_filename, index=False, encoding="utf-8-sig")
print(f"\n CSV Kaydedildi → {output_filename}")
