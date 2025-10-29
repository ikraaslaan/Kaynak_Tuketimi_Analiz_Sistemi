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

# --- MEVSİM FONKSİYONU (DÜZELTİLMİŞ) ---
# --- MEVSİM FONKSİYONU (TAMAMEN GÜNCELLENMİŞ HALİ) ---
def get_mevsimsel_carpan(tarih, kaynak_tipi, profil):
    ay = tarih.month
    kurallar = profil.get('mevsimsel_carpani', {})
    
    if kaynak_tipi == 'dogalgaz':
        # --- (Bu blok aynı, dokunulmadı) ---
        kis_carpani = kurallar.get('dogalgaz_kis', 15.0) 
        if ay in [12, 1, 2]: return kis_carpani 
        if ay in [4, 5, 6, 7, 8, 9]: return 1.0
        if ay == 3: return _gecis(tarih, kis_carpani, 1.0) 
        if ay == 10: return _gecis(tarih, 1.0, kis_carpani * 0.4, baslangic_gunu=20)
        if ay == 11: return _gecis(tarih, kis_carpani * 0.4, kis_carpani)
            
    elif kaynak_tipi == 'elektrik':
        # --- (Bu blok aynı, dokunulmadı) ---
        kis_carpani = kurallar.get('elektrik_kis', 1.4)
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
        # --- DÜZELTME VE GÜNCELLEME BURADA ---
        
        # 1. Profilden özel çarpanları oku (Varsayılan değerlerle)
        yaz_carpani = kurallar.get('yaz_su', 1.6) # Konut için 1.6, Park için 12.0
        kis_carpani = kurallar.get('kis_su', 1.0) # Konut için 1.0 (varsayılan), Park için 6.0
        
        # 2. Hangi profilde olduğumuzu anla (Basit bir kontrol)
        #    Eğer kış çarpanı 1.0'dan büyükse veya yaz 3'ten büyükse, bu 'Park' gibi özel bir profildir.
        is_ozel_profil = (kis_carpani > 1.0) or (yaz_carpani > 3.0) 

        if not is_ozel_profil:
            # --- STANDART KONUT MANTIĞI ---
            # (Hiç dokunulmadı, eskisi gibi Çaydaçıra/İzzetpaşa için çalışır)
            if ay in [10, 11, 12, 1, 2, 3]: return 1.0 # <-- Kış 1.0 (Doğru)
            if ay in [6, 7, 8]: return yaz_carpani # 1.6 dönecek
            if ay == 4: return _gecis(tarih, 1.0, 1.2)
            if ay == 5: return _gecis(tarih, 1.2, 1.4)
            if ay == 9: return _gecis(tarih, yaz_carpani, 1.0)
        
        else:
            # --- ÖZEL KÜLTÜRPARK MANTIĞI (Sizin Senaryonuz) ---
            # (config'den kis_carpani=6.0 ve yaz_carpani=12.0 okuyacak)
            
            if ay in [11, 12, 1, 2]: return kis_carpani # <-- 1.0 YERİNE 6.0 DÖNECEK
            if ay in [6, 7, 8]: return yaz_carpani       # <-- 12.0 DÖNECEK
            
            # Park profili için daha yumuşak ve mantıklı geçişler
            if ay == 3: return _gecis(tarih, kis_carpani, kis_carpani * 0.8) # Kıştan çıkış (6.0 -> 4.8)
            if ay == 4: return _gecis(tarih, kis_carpani * 0.8, yaz_carpani * 0.3) # Yaza hazırlık (4.8 -> 3.6)
            if ay == 5: return _gecis(tarih, yaz_carpani * 0.3, yaz_carpani) # Yaza giriş (3.6 -> 12.0)
            if ay == 9: return _gecis(tarih, yaz_carpani, kis_carpani * 1.5) # Yazdan çıkış (12.0 -> 9.0)
            if ay == 10: return _gecis(tarih, kis_carpani * 1.5, kis_carpani) # Kışa giriş (9.0 -> 6.0)
            
    return 1.0 # Güvenlik için

# --- GÜN TİPİ FONKSİYONU (Aynı kalıyor) ---
def get_gun_tipi_carpan(tarih, profil):
    """
    Sürüm: Her profil tipinin davranışını açıkça tanımlayan
    if/elif yapısı. (Kullanıcının isteği)
    """
    
    profil_tipi = profil.get('tip', 'konut',) # 'tip'i oku
    kurallar = profil.get('gun_tipi_carpan', {})
    gun_no = tarih.dayofweek # Pazartesi=0, Pazar=6

    # 1. Sanayi Davranışı
    if profil_tipi == 'sanayi':
        return 1.0 # Hafta içi/sonu çarpanı yok

    # 2. Konut Davranışı
    elif profil_tipi == 'konut':
        if gun_no < 5: # Hafta içi
            return kurallar.get('hici', 0.95) 
        else: # Hafta sonu
            return kurallar.get('hsonu', 1.4)

    # 3. Park Davranışı
    elif profil_tipi == 'park':
        if gun_no < 5: # Hafta içi
            # (config'den 'hici': 0.8 okuyacak)
            return kurallar.get('hici', 0.95) 
        else: # Hafta sonu
            # (config'den 'hsonu': 1.4 okuyacak)
            return kurallar.get('hsonu', 1.1)
    
    # 4. (Gelecekte eklenecek 'ticari' tipi buraya gelecek)
    # elif profil_tipi == 'ticari':
    #     if gun_no < 5: 
    #         return kurallar.get('hici', 1.0)
    #     else: 
    #         return kurallar.get('hsonu', 1.3)
    
    # 5. Bilinmeyen / Tanımlanmamış tipler için varsayılan davranış
    else:
        # Varsayılan olarak 'konut' gibi davran
        if gun_no < 5: 
            return kurallar.get('hici', 0.95) 
        else: 
            return kurallar.get('hsonu', 1.1)

# --- SAATLİK FONKSİYON (SU İÇİN DÜZELTİLMİŞ HALİ) ---
def get_saatlik_carpan(tarih, kaynak_tipi, profil):
    anlik_saat = tarih.hour + tarih.minute / 60.0
    hafta_sonu = (tarih.dayofweek >= 5)
    ay = tarih.month
    profil_listeleri = profil.get('saatlik_profiller', {})
    key_x = ""
    key_y = ""
    
    if kaynak_tipi == 'elektrik':
        # ... (Bu kısım aynı) ...
        key_x = 'elektrik_hsonu_x' if hafta_sonu else 'elektrik_hici_x'
        key_y = 'elektrik_hsonu_y' if hafta_sonu else 'elektrik_hici_y'
        
    elif kaynak_tipi == 'su':
        # --- DÜZELTME BURADA BAŞLIYOR ---
        
        # 1. Yaz/Kış ayrımı için mevsimi belirle
        # (Park/Sulama profili için 'yaz' ayları)
        is_summer = ay in [4, 5, 6, 7, 8, 9] 

        # 2. Aranan anahtarları belirle (hem yeni hem eski sistem için)
        yaz_key_x = 'su_yaz_hsonu_x' if hafta_sonu else 'su_yaz_hici_x'
        kis_key_x = 'su_kis_hsonu_x' if hafta_sonu else 'su_kis_hici_x'
        standart_key_x = 'su_hsonu_x' if hafta_sonu else 'su_hici_x'

        # 3. Kontrol et: Profil, 'yaz' anahtarını içeriyor mu? (Kültürpark gibi)
        if yaz_key_x in profil_listeleri:
            # Evet, bu detaylı bir profil. Mevsime göre seç.
            key_x = yaz_key_x if is_summer else kis_key_x
            key_y = key_x.replace('_x', '_y') # örn: 'su_yaz_hici_x' -> 'su_yaz_hici_y'
        
        else:
            # Hayır, bu standart bir profil (Konut gibi). Eski sistemi kullan.
            key_x = standart_key_x
            key_y = key_x.replace('_x', '_y') # örn: 'su_hici_x' -> 'su_hici_y'
            
        # --- DÜZELTME BURADA BİTİYOR ---

    elif kaynak_tipi == 'dogalgaz':
        # ... (Bu kısım aynı) ...
        is_summer = ay in [4, 5, 6, 7, 8, 9] or (ay == 10 and tarih.day <= 20) or (ay == 3 and tarih.day > 15)
        key_x = 'dogalgaz_yaz_x' if is_summer else 'dogalgaz_kis_x'
        key_y = 'dogalgaz_yaz_y' if is_summer else 'dogalgaz_kis_y'

    X_SAATLER = profil_listeleri.get(key_x, [0, 24])
    Y_PROFIL = profil_listeleri.get(key_y, [1.0, 1.0])
    
    return np.interp(anlik_saat, X_SAATLER, Y_PROFIL)