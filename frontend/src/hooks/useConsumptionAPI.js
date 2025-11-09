import { useState, useEffect, useCallback } from "react";

export const useConsumptionAPI = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5002/api"; // ✅ PORT DÜZELTİLDİ

  // Mahalle isimlerini yükle
  useEffect(() => {
    const loadNames = async () => {
      try {
        const res = await fetch(`${API_BASE}/neighborhood-names`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setNeighborhoods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNames();
  }, [API_BASE]);

  // Seçilen mahalle için ortalama tüketim (BOŞLUK & TÜRKÇE karakter fix ✅)
  const getNeighborhoodAverages = useCallback(
    async (neighborhoodName, period) => {
      try {
        const encoded = encodeURIComponent(neighborhoodName); // ✅ En Önemli Kısım
        const res = await fetch(`${API_BASE}/average/${encoded}?period=${period}`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.log("Veri çekilemedi:", err);
        return null;
      }
    },
    [API_BASE]
  );

  return { neighborhoods, loading, error, getNeighborhoodAverages };
};
