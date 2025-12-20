import numpy as np
import random
from datetime import datetime

# --- HAFIZA (MEMORY) ---
# Simülasyon çalışırken hangi mahallede ne bozuk, burada tutacağız.
SIMULASYON_HAFIZASI = {}

def ariza_uygula(mahalle_adi, veri_paketi, db_aktif_bakimlar, db):
    """
    Artık 'db' parametresi de alıyoruz. 
    Çünkü arıza başlayınca veritabanına bildirim atacağız,
    Arıza çözülünce veritabanından bildirimi sileceğiz.
    """
    
    col_alarmlar = db["aktif_alarmlar"] # Yeni bildirim tablomuz
    
    # Veri paketini kopyala
    yeni_veri = veri_paketi.copy()
    olay_logu = None
    
    # ---------------------------------------------------------
    # 1. ADIM: YÖNETİCİ MÜDAHALESİ KONTROLÜ (Veritabanı Önceliği)
    # ---------------------------------------------------------
    db_mudahalesi_var_mi = False
    
    if mahalle_adi in db_aktif_bakimlar:
        etkilenen_kaynaklar = db_aktif_bakimlar[mahalle_adi]
        
        # Eğer hafızamızda bu mahallede bir arıza varsa ama Admin sisteme girdiyse:
        if mahalle_adi in SIMULASYON_HAFIZASI:
            ariza_tipi = SIMULASYON_HAFIZASI[mahalle_adi]
            
            # Eğer adminin girdiği kayıt, bizim yarattığımız arızayı kapsıyorsa:
            if ariza_tipi in etkilenen_kaynaklar:
                
                # 1. Hafızadan sil (Artık rastgele arıza değil, kayıtlı arıza oldu)
                del SIMULASYON_HAFIZASI[mahalle_adi]
                
                # 2. [YENİ] Bildirim tablosundan sil (Frontend uyarısı kalksın)
                col_alarmlar.delete_one({
                    "Mahalle": mahalle_adi,
                    "Kaynak": ariza_tipi
                })
                
                print(f"✅ {mahalle_adi} - {ariza_tipi} arızası YÖNETİCİ tarafından fark edildi. Alarm silindi.")

        db_mudahalesi_var_mi = True

    if db_mudahalesi_var_mi:
        return yeni_veri, None

    # ---------------------------------------------------------
    # 2. ADIM: DEVAM EDEN SİMÜLASYON ARIZALARI
    # ---------------------------------------------------------
    if mahalle_adi in SIMULASYON_HAFIZASI:
        bozuk_kaynak = SIMULASYON_HAFIZASI[mahalle_adi]
        
        if bozuk_kaynak == "Elektrik":
            yeni_veri["Elektrik_Tuketim"] *= 5.0
            olay_logu = f"🔥 {mahalle_adi}: Elektrik kaçağı DEVAM EDİYOR! (Alarm Tabloda Mevcut)"
        elif bozuk_kaynak == "Su":
            yeni_veri["Su_Tuketim"] *= 10.0
            olay_logu = f"💧 {mahalle_adi}: Su borusu patlak DEVAM EDİYOR! (Alarm Tabloda Mevcut)"
        elif bozuk_kaynak == "Dogalgaz":
            yeni_veri["Dogalgaz_Tuketim"] *= 8.0
            olay_logu = f"⚠️ {mahalle_adi}: Gaz kaçağı DEVAM EDİYOR! (Alarm Tabloda Mevcut)"
            
        return yeni_veri, olay_logu

    # ---------------------------------------------------------
    # 3. ADIM: YENİ RASTGELE ARIZA OLUŞTURMA
    # ---------------------------------------------------------
    if random.random() < 0.01: # %1 İhtimal
        
        zar = random.choice(["Elektrik", "Su", "Dogalgaz"])
        
        # 1. Hafızaya kaydet
        SIMULASYON_HAFIZASI[mahalle_adi] = zar
        
        # 2. [YENİ] Veritabanına ALARM olarak ekle
        # Frontend burayı okuyup "Kırmızı Işık" yakacak.
        yeni_alarm = {
            "Mahalle": mahalle_adi,
            "Kaynak": zar,
            "Mesaj": f"ACİL: {mahalle_adi} bölgesinde {zar} tüketiminde anomali tespit edildi!",
            "Tarih": veri_paketi["Tarih"],
            "Durum": "BEKLIYOR" # Admin henüz görmedi
        }
        col_alarmlar.insert_one(yeni_alarm)
        
        # Değerleri boz
        if zar == "Elektrik":
            yeni_veri["Elektrik_Tuketim"] *= 5.0
            olay_logu = f"💥 DİKKAT: {mahalle_adi} bölgesinde YENİ Elektrik kaçağı başladı! (DB'ye Yazıldı)"
        elif zar == "Su":
            yeni_veri["Su_Tuketim"] *= 10.0
            olay_logu = f"💥 DİKKAT: {mahalle_adi} bölgesinde YENİ Su borusu patladı! (DB'ye Yazıldı)"
        elif zar == "Dogalgaz":
            yeni_veri["Dogalgaz_Tuketim"] *= 8.0
            olay_logu = f"💥 DİKKAT: {mahalle_adi} bölgesinde YENİ Doğalgaz kaçağı başladı! (DB'ye Yazıldı)"

    return yeni_veri, olay_logu