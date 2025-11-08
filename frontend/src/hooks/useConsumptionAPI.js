import { useState, useEffect, useCallback } from "react";

export const useConsumptionAPI = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mahalle listesini backend'den çek
  useEffect(() => {
    const loadNames = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/neighborhood-names");
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
  }, []);

  // Seçilen mahalle için ortalama tüketim verileri
  const getNeighborhoodAverages = useCallback(async (name, period) => {
    try {
      const res = await fetch(`http://localhost:5000/api/average/${name}?period=${period}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  return { neighborhoods, loading, error, getNeighborhoodAverages };
};
