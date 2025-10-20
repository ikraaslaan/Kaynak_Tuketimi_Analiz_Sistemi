# config.py
# DÜZELTME: Sanayi profili "Mesai" (5 gün) modelinden "Vardiya" (7/24) modeline geçirildi.

# --- ŞABLONLAR ---

PROFIL_KONUT_STANDART = {
    'tip': 'konut', 
    'mevsimsel_carpani': {
        'dogalgaz_kis': 15.0,  # <-- Anahtarı değiştirdik
        'elektrik_kis': 1.4,  # <-- Yeni anahtar ekledik
        'yaz_klima': 1.8, 
        'yaz_su': 1.6
    },
    'gun_tipi_carpan': {'hici': 0.95, 'hsonu': 1.1},
    'saatlik_profiller': {
        'elektrik_hici_x':  [0,  5,  7,  8,  10, 16, 18, 20, 22, 24],
        'elektrik_hici_y':  [0.8, 0.3, 1.6, 1.6, 0.8, 0.8, 1.5, 2.0, 1.5, 0.8],
        'elektrik_hsonu_x': [0, 6, 8, 10, 17, 18, 20, 22, 24],
        'elektrik_hsonu_y': [0.8, 0.3, 1.1, 1.1, 1.2, 1.5, 2.0, 1.5, 0.8],
        
        'su_hici_x':        [0,  4,  8,  9.5, 11, 17, 19, 21, 24],
        'su_hici_y':        [0.4, 0.1, 2.2, 2.2, 0.7, 0.7, 1.5, 1.5, 0.4],
        'su_hsonu_x':       [0,  6, 10, 11.5, 13, 17, 19, 21, 24],
        'su_hsonu_y':       [0.4, 0.1, 2.0, 2.0, 0.8, 0.7, 1.5, 1.5, 0.4],
        
        'dogalgaz_kis_x':   [0,  4,  7,  10, 16, 18, 22, 24],
        'dogalgaz_kis_y':   [1.0, 0.95, 1.05, 0.98, 0.98, 1.02, 1.02, 1.0], 
        'dogalgaz_yaz_x':   [0,  5,  7,  9,  11, 17, 19, 21, 24],
        'dogalgaz_yaz_y':   [0.4, 0.1, 2.0, 1.5, 0.5, 0.5, 1.8, 1.0, 0.4],
    }
}

# --- SANAYİ PROFİLİ (DEĞİŞİKLİKLER BURADA) ---
PROFIL_SANAYI = {
    'tip': 'sanayi',
    'mevsimsel_carpani': {'kis': 1.0, 'yaz_klima': 1.0, 'yaz_su': 1.0},
    'gun_tipi_carpan': {}, # Kullanılmıyor
    'saatlik_profiller': {
        
        # SİZİN İSTEĞİNİZ: 7/24 Vardiya (Gece/Gündüz farkı)
        'elektrik_hici_x':  [0,  7,  8,  17, 18, 24],
        'elektrik_hici_y':  [1.5, 1.8, 2.5, 2.5, 1.8, 1.5], # Gece Vardiyası: 1.5, Gündüz Vardiyası: 2.5
        
        # SİZİN İSTEĞİNİZ: Hafta sonu "düşük" ama "çalışan" vardiya
        'elektrik_hsonu_x': [0, 8, 16, 24],
        'elektrik_hsonu_y': [1.8, 1.6, 1.8, 1.8], # Hafta sonu 1.0 - 1.2 arası dalgalanır
        
        # Su da vardiyayı takip eder
        'su_hici_x':        [0,  7,  8,  17, 18, 24], 
        'su_hici_y':        [0.8, 1.0, 1.2, 1.2, 1.0, 0.8], # Gece: 0.8, Gündüz: 1.2
        
        'su_hsonu_x':       [0,  7,  8,  17, 18, 24],
        'su_hsonu_y':       [0.8, 0.8, 0.9, 0.9, 0.9, 0.8],
        
        # Doğalgaz (Bunu beğenmiştik, dokunmuyoruz)
        'dogalgaz_kis_x':   [0, 24], 'dogalgaz_kis_y':   [1.0, 1.0],
        'dogalgaz_yaz_x':   [0, 24], 'dogalgaz_yaz_y':   [1.0, 1.0],
    }
}


# --- ANA MAHALLE LİSTESİ ---
MAHALLE_PROFILLERI = {
    
    "Çaydaçıra": {
        'base_elektrik': 3000, 'base_su': 150, 'base_dogalgaz': 200,
        **PROFIL_KONUT_STANDART 
    },
    
    "İzzetpaşa": { 
        'base_elektrik': 2200, 'base_su': 110, 'base_dogalgaz': 180,
        **PROFIL_KONUT_STANDART, 
        'saatlik_profiller': {
            **PROFIL_KONUT_STANDART['saatlik_profiller'],
            'elektrik_hici_x':  [0,  6,  8,  9,  11, 16, 18, 20, 22, 24],
            'elektrik_hici_y':  [0.8, 0.3, 1.6, 1.6, 0.8, 0.8, 1.5, 2.0, 1.5, 0.8],
            'su_hici_x':        [0,  5,  9, 10.5, 12, 17, 19, 21, 24],
            'su_hici_y':        [0.4, 0.1, 2.2, 2.2, 0.7, 0.7, 1.5, 1.5, 0.4],
        }
    },
    
    "Sanayi": {
        'base_elektrik': 8000, # Base'i 8000'e geri çekelim, çarpanları artırdık
        'base_su': 100,
        'base_dogalgaz': 50,
        **PROFIL_SANAYI 
    }
}