import numpy as np
import pandas as pd

# --- _gecis FONKSİYONU ---
def _gecis(tarih, deger_a, deger_b, baslangic_gunu=1):
    gun = tarih.day
    gun_sayisi = tarih.days_in_month 
    bitis_gunu = gun_sayisi
    if gun < baslangic_gunu: return deger_a
    if gun > bitis_gunu: return deger_b
    toplam_gecis_gunu = (bitis_gunu - baslangic_gunu)
    if toplam_gecis_gunu <= 0: return deger_b
    oran = (gun - baslangic_gunu) / toplam_gecis_gunu
    return deger_a + (deger_b - deger_a) * oran

# --- MEVSİM FONKSİYONU ---
def get_mevsimsel_carpan(tarih, kaynak_tipi, profil):
    ay = tarih.month
    kurallar = profil.get('mevsimsel_carpani', {})
    
    if kaynak_tipi == 'dogalgaz':
        kis_carpani = kurallar.get('kis', 15.0) 
        if ay in [12, 1, 2]: return kis_carpani 
        if ay in [4, 5, 6, 7, 8, 9]: return 1.0
        if ay == 3: return _gecis(tarih, kis_carpani, 1.0) 
        if ay == 10: return _gecis(tarih, 1.0, kis_carpani * 0.4, baslangic_gunu=20)
        if ay == 11: return _gecis(tarih, kis_carpani * 0.4, kis_carpani)
            
    elif kaynak_tipi == 'elektrik':
        kis_carpani = kurallar.get('kis', 1.4)
        yaz_klima_carpani = kurallar.get('yaz_klima', 1.8)
        if ay in [4, 5]: return 1.0
        if ay == 10: return _gecis(tarih, 1.0, 1.1, baslangic_gunu=20)
        if ay in [7, 8]: return yaz_klima_carpani
        if ay in [12, 1]: return kis_carpani
        if ay == 6: return _gecis(tarih, 1.0, yaz_klima_carpani)
        if ay == 9: return _gecis(tarih, yaz_klima_carpani, 1.0)
        if ay == 11: return _gecis(tarih, 1.1, kis_carpani)
        if ay == 2: return _gecis(tarih, kis_carpani, 1.1)
        if ay == 3: return _gecis(tarih, 1.1, 1.0)

    elif kaynak_tipi == 'su':
        yaz_sulama_carpani = kurallar.get('yaz_su', 1.6)
        if ay in [10, 11, 12, 1, 2, 3]: return 1.0
        if ay in [6, 7, 8]: return yaz_sulama_carpani
        if ay == 4: return _gecis(tarih, 1.0, 1.2)
        if ay == 5: return _gecis(tarih, 1.2, 1.4)
        if ay == 9: return _gecis(tarih, yaz_sulama_carpani, 1.0)

    return 1.0

# --- GÜN TİPİ FONKSİYONU (DÜZELTİLMİŞ) ---
def get_gun_tipi_carpan(tarih, profil):
    """
    YENİ MANTIK:
    Eğer profil 'sanayi' ise 1.0 döndür (saatlik profil yönetecek).
    'konut' ise eski çarpanı kullan.
    """
    profil_tipi = profil.get('tip', 'konut') # Config'den 'tip'i oku
    
    # DÜZELTME: Sanayi ise bu çarpanı pasifize et
    if profil_tipi == 'sanayi':
        return 1.0 
    
    # KONUT profili (eski kod)
    gun_no = tarih.dayofweek # Pazartesi=0, Pazar=6
    kurallar = profil.get('gun_tipi_carpan', {})
    
    if gun_no < 5: # Hafta içi
        return kurallar.get('hici', 0.95) # Varsayılan 0.95
    else: # Hafta sonu
        return kurallar.get('hsonu', 1.1) # Varsayılan 1.1

# --- SAATLİK FONKSİYON ---
def get_saatlik_carpan(tarih, kaynak_tipi, profil):
    anlik_saat = tarih.hour + tarih.minute / 60.0
    hafta_sonu = (tarih.dayofweek >= 5)
    ay = tarih.month

    profil_listeleri = profil.get('saatlik_profiller', {})
    
    key_x = ""
    key_y = ""
    
    if kaynak_tipi == 'elektrik':
        key_x = 'elektrik_hsonu_x' if hafta_sonu else 'elektrik_hici_x'
        key_y = 'elektrik_hsonu_y' if hafta_sonu else 'elektrik_hici_y'
        
    elif kaynak_tipi == 'su':
        key_x = 'su_hsonu_x' if hafta_sonu else 'su_hici_x'
        key_y = 'su_hsonu_y' if hafta_sonu else 'su_hici_y'

    elif kaynak_tipi == 'dogalgaz':
        is_summer = ay in [4, 5, 6, 7, 8, 9] or (ay == 10 and tarih.day <= 20) or (ay == 3 and tarih.day > 15)
        key_x = 'dogalgaz_yaz_x' if is_summer else 'dogalgaz_kis_x'
        key_y = 'dogalgaz_yaz_y' if is_summer else 'dogalgaz_kis_y'

    X_SAATLER = profil_listeleri.get(key_x, [0, 24])
    Y_PROFIL = profil_listeleri.get(key_y, [1.0, 1.0])
    
    return np.interp(anlik_saat, X_SAATLER, Y_PROFIL)