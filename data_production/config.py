# config.py
# BU DOSYA ARTIK SADECE PROFİL ŞABLONLARINI İÇERİR.
# Mahalle listesi 'mahalleler.json' dosyasına taşındı.

PROFIL_KONUT_STANDART = {
    'tip': 'konut', 
    'mevsimsel_carpani': {
        'dogalgaz_kis': 15.0,
        'elektrik_kis': 1.4,
        'yaz_klima': 1.8, 
        'yaz_su': 1.6
    },
    'gun_tipi_carpan': {'hici': 0.95, 'hsonu': 1.1},
    'saatlik_profiller': {
        'elektrik_hici_x':  [0,   5,   7,   8,   10, 16, 18, 20, 22, 24],
        'elektrik_hici_y':  [0.8, 0.3, 1.6, 1.6, 0.8, 0.8, 1.5, 2.0, 1.5, 0.8],
        'elektrik_hsonu_x': [0, 6, 8, 10, 17, 18, 20, 22, 24],
        'elektrik_hsonu_y': [0.8, 0.3, 1.1, 1.1, 1.2, 1.5, 2.0, 1.5, 0.8],
        
        'su_hici_x':        [0,   4,   8,   9.5, 11, 17, 19, 21, 24],
        'su_hici_y':        [0.4, 0.1, 2.2, 2.2, 0.7, 0.7, 1.5, 1.5, 0.4],
        'su_hsonu_x':       [0,   6, 10, 11.5, 13, 17, 19, 21, 24],
        'su_hsonu_y':       [0.4, 0.1, 2.0, 2.0, 0.8, 0.7, 1.5, 1.5, 0.4],
        
        'dogalgaz_kis_x':   [0,   4,   7,   10, 16, 18, 22, 24],
        'dogalgaz_kis_y':   [1.0, 0.95, 1.05, 0.98, 0.98, 1.02, 1.02, 1.0], 
        'dogalgaz_yaz_x':   [0,   5,   7,   9,   11, 17, 19, 21, 24],
        'dogalgaz_yaz_y':   [0.4, 0.1, 2.0, 1.5, 0.5, 0.5, 1.8, 1.0, 0.4],
    }
}

PROFIL_SANAYI = {
    'tip': 'sanayi',
    'mevsimsel_carpani': {
        'dogalgaz_kis': 1.0, 
        'elektrik_kis': 1.0, 
        'yaz_klima': 1.0, 
        'yaz_su': 1.0
    },
    'gun_tipi_carpan': {},
    'saatlik_profiller': {
        'elektrik_hici_x':  [0,   7,   8,   17, 18, 24],
        'elektrik_hici_y':  [1.5, 1.8, 2.5, 2.5, 1.8, 1.5],
        'elektrik_hsonu_x': [0, 8, 16, 24],
        'elektrik_hsonu_y': [1.8, 1.6, 1.8, 1.8], 
        'su_hici_x':        [0,   7,   8,   17, 18, 24], 
        'su_hici_y':        [0.8, 1.0, 1.2, 1.2, 1.0, 0.8],
        'su_hsonu_x':       [0,   7,   8,   17, 18, 24],
        'su_hsonu_y':       [0.8, 0.8, 0.9, 0.9, 0.9, 0.8],
        'dogalgaz_kis_x':   [0, 24], 'dogalgaz_kis_y':   [1.0, 1.0],
        'dogalgaz_yaz_x':   [0, 24], 'dogalgaz_yaz_y':   [1.0, 1.0],
    }
}

PROFIL_PARK = {
    'tip': 'park', 
    'mevsimsel_carpani': {
        'elektrik_kis': 2.2,
        'yaz_klima': 1.5,
        'yaz_su': 12.0,
        'kis_su': 6.0,
        'dogalgaz_kis': 1.0,
    },
    'gun_tipi_carpan': { 'hici': 1.4, 'hsonu': 1.8 },
    'saatlik_profiller': {
        'elektrik_hici_x':   [0,   6,   7,   17,   18,   23,   24],
        'elektrik_hici_y':  [0.8, 1, 1.5, 2, 2.5, 2.5, 2.0], 
        'elektrik_hsonu_x': [0,   6,   8,   17,   18,   24],
        'elektrik_hsonu_y': [0.8, 1.2, 2, 2.75, 3.0, 1],
        'su_yaz_hici_x':    [0,   2,   3,   5,   6,   9,   11,   13,   15,   17,   19, 21, 24],
        'su_yaz_hici_y':    [0.1, 1.5, 2.0, 2.0, 1.5, 0.4, 0.8, 1.2, 0.9, 0.8, 0.6, 0.4, 0.1], 
        'su_yaz_hsonu_x':   [0,   2,   3,   5,   6,   10, 13, 16, 19, 22, 24],
        'su_yaz_hsonu_y':   [0.2, 1.5, 2.0, 2.0, 1.5, 1.0, 1.5, 1.2, 1.0, 0.8, 0.2],
        'su_kis_hici_x':    [0, 7, 9, 11, 13, 15, 17, 19, 21, 24],
        'su_kis_hici_y':    [1, 1.2, 1.2, 1.5, 1.5, 1.5, 1.6, 1.7, 1.5, 1.2],
        'su_kis_hsonu_x':   [0, 7, 10, 13, 16, 19, 22, 24],
        'su_kis_hsonu_y':   [1, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, .15],
        'dogalgaz_kis_x':   [0, 24], 'dogalgaz_kis_y':   [1.5, 1.5],
        'dogalgaz_yaz_x':   [0, 24], 'dogalgaz_yaz_y':   [1.0, 1.0],
    }
}

PROFIL_KAMPUS = {
    'tip': 'kampus',
    'mevsimsel_carpani': {
        'dogalgaz_kis': 8.0, 
        'elektrik_kis': 1.6, 
        'yaz_klima': 1.8, 
        'akademik_carpan_donem': 1.5,
        'akademik_carpan_tatil': 1.0
    },
    'gun_tipi_carpan': { 'hici': 1.0, 'hsonu': 1.0 },
    'saatlik_profiller': {
        'elektrik_donem_hici_x': [0,   7,   8,   17,   18,   24],
        'elektrik_donem_hici_y': [1.5, 1.8, 3.0, 3.0, 1.8, 1.5],
        'elektrik_donem_hsonu_x': [0, 24],
        'elektrik_donem_hsonu_y': [1.6, 1.6],
        'elektrik_tatil_hici_x': [0, 24],
        'elektrik_tatil_hici_y': [1.4, 1.4],
        'elektrik_tatil_hsonu_x': [0, 24],
        'elektrik_tatil_hsonu_y': [1.4, 1.4],
        'dogalgaz_kis_x':   [0, 24],
        'dogalgaz_kis_y':   [1.0, 1.0], 
        'dogalgaz_yaz_hici_x':  [0,   6,   8,   12,   14,   18,   20,   24],
        'dogalgaz_yaz_hici_y':  [0.8, 1.5, 1.7, 1.7, 1.4, 1.7, 1.5, 0.8],
        'dogalgaz_yaz_hsonu_x': [0,   6,   8,   12,   14,   18,   20,   24],
        'dogalgaz_yaz_hsonu_y': [0.8, 1.1, 1.3, 1.1, 1.0, 1.3, 1.1, 0.8],
        'su_donem_hici_x':    [0,   7,   8,   17,   18,   24],
        'su_donem_hici_y':    [0.8, 1.5, 2.5, 2.5, 1.5, 0.8],
        'su_donem_hsonu_x':   [0, 24],
        'su_donem_hsonu_y':   [0.7, 0.7],
        'su_tatil_hici_x':    [0, 24],
        'su_tatil_hici_y':    [0.7, 0.7],
        'su_tatil_hsonu_x':   [0, 24],
        'su_tatil_hsonu_y':   [0.7, 0.7],
    }
}

PROFIL_KONUT_GELENEKSEL = {
    'tip': 'konut', 
    'mevsimsel_carpani': {
        'dogalgaz_kis': 2.0,   # Doğalgaz soba/kombi olmadığı için kışın çok artmaz (Min kullanım).
        'elektrik_kis': 1.1,   
        'yaz_klima': 1.05,     # Klima neredeyse yok.
        'yaz_su': 2.5          # Bahçe/avlu sulama devam eder.
    },
    'gun_tipi_carpan': {'hici': 1.0, 'hsonu': 1.1},
    'saatlik_profiller': {
        # --- ELEKTRİK ---
        # Senaryo: 09:00 artış -> Sabit -> 15:00 hafif artış -> 19:00-23:00 ZİRVE
        'elektrik_hici_x':  [0,   7,   9,   14,  15,  18,  19,  23,  24],
        'elektrik_hici_y':  [0.4, 0.4, 1.0, 1.0, 1.3, 1.3, 2.2, 2.2, 0.5],
        
        # Hafta sonu da benzer olsun ama gündüz biraz daha dolu geçsin
        'elektrik_hsonu_x': [0,   8,   10,  15,  19,  23,  24],
        'elektrik_hsonu_y': [0.5, 0.5, 1.2, 1.5, 2.3, 2.3, 0.6],

        # --- SU ---
        # Senaryo: 09:00 artış -> 14:00 MAX -> Sonra kademeli düşüş
        'su_hici_x':        [0,   8,   9,   14,   18,  21,  24],
        'su_hici_y':        [0.4, 0.6, 1.2, 2.8,  1.5, 0.8, 0.1],
        
        # Hafta sonu temizlik daha yoğun olabilir
        'su_hsonu_x':       [0,   8,   10,  14,   18,  21,  24],
        'su_hsonu_y':       [0.4, 0.6, 1.5, 3.0,  1.8, 1.0, 0.1],

        # --- DOĞALGAZ (Minimum) ---
        # Sadece yemek pişirme saatlerinde (öğlen/akşam) minik tepeler
        'dogalgaz_kis_x':   [0,   7,   12,  14,  18,  20,  24],
        'dogalgaz_kis_y':   [0.2, 0.2, 0.6, 0.4, 0.8, 0.5, 0.2], 
        'dogalgaz_yaz_x':   [0, 24], 
        'dogalgaz_yaz_y':   [0.2, 0.2],
    }
}
