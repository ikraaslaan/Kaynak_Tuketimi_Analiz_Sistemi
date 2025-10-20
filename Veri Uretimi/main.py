import pandas as pd
import time
import numpy as np 
# DİKKAT: Fonksiyon adları değişti (artık 'profil' alıyorlar)
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
# (Geri kalan kodun tamamı aynı, değişiklik yok)
bitis_zamani_gercek = time.time()
toplam_gecen_sure = bitis_zamani_gercek - baslama_zamani_gercek
print("Simülasyon Tamamlandı.")
print("Veri DataFrame'e dönüştürülüyor...")
df = pd.DataFrame(uretilen_veriler)
print("-" * 30)
print(f"Toplam Üretilen Veri Satırı: {len(df)}") 
print(f"Toplam Geçen Gerçek Süre: {toplam_gecen_sure:.2f} saniye")
print("-" * 30)
output_filename = 'tuketim_verisi_tum_mahalleler_detayli.csv'
df.to_csv(output_filename, index=False, encoding='utf-8-sig')
print(f"\n--- Veri '{output_filename}' dosyasına başarıyla kaydedildi! ---")