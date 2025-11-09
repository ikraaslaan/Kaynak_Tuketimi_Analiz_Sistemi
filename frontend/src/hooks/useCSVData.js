import { useState, useEffect, useCallback } from "react";

export const useCSVData = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5001"; // ✅ Backend port burada

  // 1) Backend’den mahalle isimlerini çekiyoruz
  useEffect(() => {
    const fetchNeighborhoodNames = async () => {
      try {
        const response = await fetch(`${API_URL}/api/neighborhood-names`);
        if (!response.ok) throw new Error("Mahalle isimleri alınamadı.");

        const names = await response.json();
        setNeighborhoods(names);
        setLoading(false);
      } catch (err) {
        console.log("❌ API Erişim Hatası", err);
        setError("Sunucuya bağlanılamadı.");
        setLoading(false);
      }
    };

    fetchNeighborhoodNames();
  }, []);

  // Türkçe karakter uyumlu arama
  const normalizeString = (str) =>
    str
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");

  // 2) Arama fonksiyonu
  const searchNeighborhoods = useCallback(
    (query) => {
      if (!query.trim()) return [];
      const normalizedQuery = normalizeString(query);
      return neighborhoods.filter((n) => normalizeString(n).includes(normalizedQuery));
    },
    [neighborhoods]
  );

  // 3) Ortalama veriyi backend’den çekme
  const getNeighborhoodAverages = useCallback(async (name, filterPeriod = "all") => {
    try {
      const response = await fetch(
        `${API_URL}/api/average/${encodeURIComponent(name)}?period=${filterPeriod}`
      );

      if (!response.ok) {
        console.log("⚠️ Veri bulunamadı veya API cevap vermedi");
        return null;
      }

      const data = await response.json();
      return data;
      
    } catch (err) {
      console.error("❌ Ortalama veri çekme hatası:", err);
      return null;
    }
  }, []);

  return {
    neighborhoods,
    loading,
    error,
    searchNeighborhoods,
    getNeighborhoodAverages,
  };
};
