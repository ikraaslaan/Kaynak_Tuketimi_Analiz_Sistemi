def aktif_bakimlari_getir(db, simulasyon_zamani):
    """
    Verilen simülasyon zamanında (saatinde) aktif olan bakım/arıza kayıtlarını çeker.
    Dönüş formatı (Dictionary):
    {
       "Kültürpark": ["Elektrik", "Su"],
       "Sanayi": ["Dogalgaz"]
    }
    Böylece ana kodda kontrol etmek çok hızlı olur.
    """
    col_incidents = db["incidents"]
    
    # --- MONGODB SORGUSU ---
    # Kural: 
    # 1. Durum "AKTIF" olmalı
    # 2. Başlangıç Tarihi <= Simülasyon Zamanı
    # 3. Bitis Tarihi >= Simülasyon Zamanı
    
    sorgu = {
        "Durum": "AKTIF",
    }
    
    # Veritabanından kayıtları çek
    aktif_olaylar = list(col_incidents.find(sorgu))
    
    # --- SONUCU HIZLI OKUNABİLİR HALE GETİRME ---
    # Listeyi, mahalle adına göre gruplanmış bir sözlüğe çeviriyoruz.
    # Örnek çıktı: bakım_listesi["Kültürpark"] -> ["Elektrik"]
    
    bakim_plani = {}
    
    for olay in aktif_olaylar:
        mahalle = olay.get("Mahalle")
        kaynak = olay.get("Kaynak_Tipi") # Örn: "Elektrik", "Su" veya "Dogalgaz"
        
        if mahalle and kaynak:
            if mahalle not in bakim_plani:
                bakim_plani[mahalle] = []
            
            # Aynı kaynak iki kere eklenmesin diye kontrol
            if kaynak not in bakim_plani[mahalle]:
                bakim_plani[mahalle].append(kaynak)
                
    return bakim_plani