import { useState, useEffect } from "react";
import Papa from "papaparse";

export const useCSVData = () => {
  const [data, setData] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize Turkish characters for search
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "c");
  };

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/tuketim_verisi_tum_mahalleler_detayli.csv");
        
        if (!response.ok) {
          throw new Error("CSV dosyası yüklenemedi");
        }

        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            // Parse numeric values for consumption fields
            if (field === "Elektrik_Tuketim" || field === "Su_Tuketim" || field === "Dogalgaz_Tuketim") {
              return parseFloat(value) || 0;
            }
            return value;
          },
          complete: (results) => {
            try {
              const rows = results.data;
              
              // Extract unique neighborhoods
              const uniqueNeighborhoods = [...new Set(rows.map(row => row.Mahalle?.trim()).filter(Boolean))];
              
              // Calculate averages for each neighborhood
              const avgMap = {};
              
              uniqueNeighborhoods.forEach(neighborhood => {
                const rowsForNeighborhood = rows.filter(row => row.Mahalle?.trim() === neighborhood);
                
                const avgElectricity = rowsForNeighborhood.reduce((sum, row) => sum + (parseFloat(row.Elektrik_Tuketim) || 0), 0) / rowsForNeighborhood.length;
                const avgWater = rowsForNeighborhood.reduce((sum, row) => sum + (parseFloat(row.Su_Tuketim) || 0), 0) / rowsForNeighborhood.length;
                const avgGas = rowsForNeighborhood.reduce((sum, row) => sum + (parseFloat(row.Dogalgaz_Tuketim) || 0), 0) / rowsForNeighborhood.length;
                
                avgMap[neighborhood] = {
                  name: neighborhood,
                  electricity: avgElectricity,
                  water: avgWater,
                  gas: avgGas,
                };
              });
              
              setData(rows);
              setNeighborhoods(uniqueNeighborhoods);
              setAverages(avgMap);
              setLoading(false);
            } catch (err) {
              console.error("Error processing CSV data:", err);
              setError(err.message);
              setLoading(false);
            }
          },
          error: (err) => {
            console.error("CSV parsing error:", err);
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error loading CSV:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Search function with Turkish character normalization
  const searchNeighborhoods = (query) => {
    if (!query.trim()) return [];
    
    const normalizedQuery = normalizeString(query);
    
    return neighborhoods.filter(neighborhood => 
      normalizeString(neighborhood).includes(normalizedQuery)
    );
  };

  // Get neighborhood averages
  const getNeighborhoodAverages = (name) => {
    return averages[name] || null;
  };

  return {
    data,
    neighborhoods,
    averages,
    loading,
    error,
    searchNeighborhoods,
    getNeighborhoodAverages,
    normalizeString,
  };
};

