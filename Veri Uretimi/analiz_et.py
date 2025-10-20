import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

print("Nihai Karşılaştırmalı Analiz script'i başlatıldı...")
print("-" * 30)

# --- AYARLAR ---
CSV_DOSYASI = 'tuketim_verisi_tum_mahalleler_detayli.csv'
ANALIZ_MAHALLE = 'Çaydaçıra' # Hangi mahalleyi görmek istiyorsunuz?

# --- Karşılaştırılacak 4 Senaryo için Tarihleri Tanımla ---
# (Bu tarihlerin CSV dosyanızda olduğundan emin olun)
TARIH_KIS_HICI = '2023-01-09'  # Pazartesi (Kış - Hafta İçi)
TARIH_KIS_HSONU = '2023-01-14' # Cumartesi (Kış - Hafta Sonu)
TARIH_YAZ_HICI = '2023-07-10'  # Pazartesi (Yaz - Hafta İçi)
TARIH_YAZ_HSONU = '2023-07-15' # Cumartesi (Yaz - Hafta Sonu)

print(f"Analiz Mahallesi: {ANALIZ_MAHALLE}")
print(f"1. {TARIH_KIS_HICI} (Kış - Hafta İçi)")
print(f"2. {TARIH_KIS_HSONU} (Kış - Hafta Sonu)")
print(f"3. {TARIH_YAZ_HICI} (Yaz - Hafta İçi)")
print(f"4. {TARIH_YAZ_HSONU} (Yaz - Hafta Sonu)")
print("-" * 30)

# --- 1. Veriyi Oku ---
print(f"'{CSV_DOSYASI}' dosyası okunuyor...")
try:
    df = pd.read_csv(CSV_DOSYASI, parse_dates=['Tarih'])
except FileNotFoundError:
    print(f"HATA: '{CSV_DOSYASI}' bulunamadı.")
    print("Lütfen önce 'main.py' script'ini çalıştırarak veriyi oluşturun.")
    exit()

print("Veri başarıyla okundu.")

# --- 2. Veriyi Filtrele ---
df_mahalle = df[df['Mahalle'] == ANALIZ_MAHALLE].copy()

# Tarih objelerini al
date_kis_hici = pd.to_datetime(TARIH_KIS_HICI).date()
date_kis_hsonu = pd.to_datetime(TARIH_KIS_HSONU).date()
date_yaz_hici = pd.to_datetime(TARIH_YAZ_HICI).date()
date_yaz_hsonu = pd.to_datetime(TARIH_YAZ_HSONU).date()

# 4 DataFrame'i de filtrele
df_kis_hici = df_mahalle[df_mahalle['Tarih'].dt.date == date_kis_hici].copy()
df_kis_hsonu = df_mahalle[df_mahalle['Tarih'].dt.date == date_kis_hsonu].copy()
df_yaz_hici = df_mahalle[df_mahalle['Tarih'].dt.date == date_yaz_hici].copy()
df_yaz_hsonu = df_mahalle[df_mahalle['Tarih'].dt.date == date_yaz_hsonu].copy()

if df_kis_hici.empty or df_kis_hsonu.empty or df_yaz_hici.empty or df_yaz_hsonu.empty:
    print(f"HATA: Tanımlanan 4 tarihten biri veya birkaçı için veri bulunamadı.")
    exit()

# Hepsine 'Saat' eksenini ekle
for df_gun in [df_kis_hici, df_kis_hsonu, df_yaz_hici, df_yaz_hsonu]:
    df_gun['Saat'] = df_gun['Tarih'].dt.hour + df_gun['Tarih'].dt.minute / 60.0

print("4 senaryo başarıyla filtrelendi.")

# --- 3. Karşılaştırmalı Grafiği Çiz (4 Çizgili) ---

fig, axes = plt.subplots(nrows=3, ncols=1, figsize=(16, 15), sharex=True) # Pencereyi büyüt
fig.suptitle(f"{ANALIZ_MAHALLE} Mahallesi - 4'lü Senaryo Karşılaştırması", fontsize=18)

# --- Grafik 1: Elektrik ---
axes[0].plot(df_kis_hici['Saat'], df_kis_hici['Elektrik_Tuketim'], color='blue', linestyle='-', label=f'Kış - Hafta İçi ({TARIH_KIS_HICI})')
axes[0].plot(df_kis_hsonu['Saat'], df_kis_hsonu['Elektrik_Tuketim'], color='deepskyblue', linestyle='--', label=f'Kış - Hafta Sonu ({TARIH_KIS_HSONU})')
axes[0].plot(df_yaz_hici['Saat'], df_yaz_hici['Elektrik_Tuketim'], color='red', linestyle='-', label=f'Yaz - Hafta İçi ({TARIH_YAZ_HICI})')
axes[0].plot(df_yaz_hsonu['Saat'], df_yaz_hsonu['Elektrik_Tuketim'], color='orange', linestyle='--', label=f'Yaz - Hafta Sonu ({TARIH_YAZ_HSONU})')
axes[0].set_title('Elektrik Tüketimi')
axes[0].set_ylabel('Tüketim (kW)')
axes[0].grid(True)
axes[0].legend()

# --- Grafik 2: Su ---
axes[1].plot(df_kis_hici['Saat'], df_kis_hici['Su_Tuketim'], color='blue', linestyle='-', label=f'Kış - Hafta İçi ({TARIH_KIS_HICI})')
axes[1].plot(df_kis_hsonu['Saat'], df_kis_hsonu['Su_Tuketim'], color='deepskyblue', linestyle='--', label=f'Kış - Hafta Sonu ({TARIH_KIS_HSONU})')
axes[1].plot(df_yaz_hici['Saat'], df_yaz_hici['Su_Tuketim'], color='red', linestyle='-', label=f'Yaz - Hafta İçi ({TARIH_YAZ_HICI})')
axes[1].plot(df_yaz_hsonu['Saat'], df_yaz_hsonu['Su_Tuketim'], color='orange', linestyle='--', label=f'Yaz - Hafta Sonu ({TARIH_YAZ_HSONU})')
axes[1].set_title('Su Tüketimi')
axes[1].set_ylabel('Tüketim (m³/saat)')
axes[1].grid(True)
axes[1].legend()

# --- Grafik 3: Doğalgaz ---
axes[2].plot(df_kis_hici['Saat'], df_kis_hici['Dogalgaz_Tuketim'], color='blue', linestyle='-', label=f'Kış - Hafta İçi ({TARIH_KIS_HICI})')
axes[2].plot(df_kis_hsonu['Saat'], df_kis_hsonu['Dogalgaz_Tuketim'], color='deepskyblue', linestyle='--', label=f'Kış - Hafta Sonu ({TARIH_KIS_HSONU})')
axes[2].plot(df_yaz_hici['Saat'], df_yaz_hici['Dogalgaz_Tuketim'], color='red', linestyle='-', label=f'Yaz - Hafta İçi ({TARIH_YAZ_HICI})')
axes[2].plot(df_yaz_hsonu['Saat'], df_yaz_hsonu['Dogalgaz_Tuketim'], color='orange', linestyle='--', label=f'Yaz - Hafta Sonu ({TARIH_YAZ_HSONU})')
axes[2].set_title('Doğalgaz Tüketimi')
axes[2].set_ylabel('Tüketim (m³/saat)')
axes[2].grid(True)
axes[2].legend()

# X eksenini (Saat) daha okunaklı yap
axes[2].set_xticks(range(0, 25, 2)) # 0'dan 24'e 2 saatte bir
plt.xlabel('Günün Saati')

plt.tight_layout(rect=[0, 0.03, 1, 0.96])
print("Grafik penceresi açılıyor...")
plt.show()