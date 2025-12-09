import React, { useState, useEffect, useRef, useMemo } from "react";
import api from "../services/api";
import { Search, MapPin, Zap, Droplets, Flame, BrainCircuit, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Yonetici = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stats/dashboard");
      const data = res.data.data;
      setAllData(data);
      
      if (data.length > 0) {
        // DEĞİŞİKLİK BURADA: Önce Çaydaçıra'yı ara, bulamazsan listenin ilkini getir.
        const initialNeighborhood = data.find(d => d.mahalle === "Çaydaçıra") || data[0]; 
        
        setSelectedNeighborhood(initialNeighborhood);
        setSearchQuery(initialNeighborhood.mahalle);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery) return [];
    return allData.filter(item => 
        item.mahalle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allData]);

  const handleSelect = (item) => {
    setSelectedNeighborhood(item);
    setSearchQuery(item.mahalle);
    setShowDropdown(false);
    setPrediction(null);
  };

  const handleGetPrediction = async () => {
    if (!selectedNeighborhood) return;
    try {
      setPredLoading(true);
      const res = await api.get(`/predictions?mahalle=${selectedNeighborhood.mahalle}`);
      setPrediction(res.data.data);
    } catch (err) {
      alert("Tahmin oluşturulurken hata oluştu.");
    } finally {
      setPredLoading(false);
    }
  };

  const chartData = selectedNeighborhood ? [
    { name: "Elektrik", value: Number(selectedNeighborhood.elektrik.ortalama) },
    { name: "Su", value: Number(selectedNeighborhood.su.ortalama) },
    { name: "Doğalgaz", value: Number(selectedNeighborhood.dogalgaz.ortalama) }
  ] : [];

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-emerald-800">Veriler Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto px-4 pb-10 pt-[100px]">
      
      <div className="flex justify-between items-center mb-8 bg-white/40 p-6 rounded-2xl backdrop-blur-md border border-white/50 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
                <Activity className="text-emerald-600"/> Yönetici Paneli
            </h1>
            <p className="text-emerald-700 mt-1">Mahalle bazlı detaylı analiz ve yönetim.</p>
        </div>
      </div>

      <div className="relative mb-10 z-50" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 w-6 h-6" />
            <input 
                type="text"
                placeholder="İncelemek istediğiniz mahalleyi arayın..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-md shadow-lg text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-500 text-emerald-900"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    if(e.target.value === "") setSelectedNeighborhood(null);
                }}
                onFocus={() => setShowDropdown(true)}
            />
          </div>

          {showDropdown && filteredNeighborhoods.length > 0 && (
              <div className="absolute w-full mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 max-h-64 overflow-y-auto overflow-x-hidden">
                  {filteredNeighborhoods.map((item) => (
                      <button 
                        key={item.mahalle}
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-emerald-100/50 transition border-b border-gray-100/50 last:border-0"
                      >
                          <MapPin className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-900 text-lg">{item.mahalle}</span>
                      </button>
                  ))}
              </div>
          )}
      </div>

      {selectedNeighborhood ? (
          <div className="animate-fade-in-up">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-4 border-b border-emerald-900/10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm"><MapPin className="w-8 h-8" /></div>
                     <div>
                         <h2 className="text-3xl font-bold text-emerald-900">{selectedNeighborhood.mahalle} Mahallesi</h2>
                         <p className="text-emerald-700/80">Güncel tüketim verileri ve analizler</p>
                     </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <DataCard icon={Zap} label="Ortalama Elektrik" value={selectedNeighborhood.elektrik.ortalama} unit="kWh" color="yellow" />
                  <DataCard icon={Droplets} label="Ortalama Su" value={selectedNeighborhood.su.ortalama} unit="m³" color="blue" />
                  <DataCard icon={Flame} label="Ortalama Doğalgaz" value={selectedNeighborhood.dogalgaz.ortalama} unit="m³" color="orange" />
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl mb-8 border border-white/50">
                  <h4 className="text-lg font-bold text-emerald-900 mb-6 border-b pb-2 border-emerald-900/10">Tüketim Dağılımı</h4>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#a7f3d0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontWeight: '600'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#064e3b'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)'}} />
                        <Area type="monotone" dataKey="value" stroke="#059669" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                          <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                              <BrainCircuit className="text-purple-400 w-8 h-8" /> Gelecek Ay Öngörüsü
                          </h4>
                          <p className="text-emerald-100/80 mt-2">Bu mahalle için yapay zeka tabanlı gelecek 30 gün tahmini.</p>
                      </div>
                      <button 
                          onClick={handleGetPrediction} 
                          disabled={predLoading}
                          className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-100 transition shadow-lg disabled:opacity-50 min-w-[160px]"
                      >
                          {predLoading ? "Hesaplanıyor..." : "Tahmini Göster"}
                      </button>
                  </div>

                  {prediction && (
                      <div className="mt-8 bg-white/10 p-6 rounded-2xl border border-white/10 animate-fade-in">
                          <p className="text-xl text-center text-white font-semibold mb-6 border-b border-white/10 pb-4">{prediction.mesaj}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-black/20 rounded-xl hover:bg-black/30 transition">
                                  <p className="text-sm text-yellow-300 font-medium mb-1">Elektrik Tahmini</p>
                                  <p className="text-2xl text-white font-bold">{prediction.elektrik_tahmini} kWh</p>
                              </div>
                              <div className="text-center p-4 bg-black/20 rounded-xl hover:bg-black/30 transition">
                                  <p className="text-sm text-blue-300 font-medium mb-1">Su Tahmini</p>
                                  <p className="text-2xl text-white font-bold">{prediction.su_tahmini} m³</p>
                              </div>
                              <div className="text-center p-4 bg-black/20 rounded-xl hover:bg-black/30 transition">
                                  <p className="text-sm text-orange-300 font-medium mb-1">Doğalgaz Tahmini</p>
                                  <p className="text-2xl text-white font-bold">{prediction.dogalgaz_tahmini} m³</p>
                              </div>
                          </div>
                      </div>
                  )}
              </div>

          </div>
      ) : (
          <div className="text-center py-20 opacity-60">
              <div className="bg-white/30 p-6 rounded-full inline-block mb-4 backdrop-blur-sm">
                 <Search className="w-16 h-16 text-emerald-800" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900">Mahalleler Yükleniyor...</h3>
          </div>
      )}
    </div>
  );
};

const DataCard = ({ icon: Icon, label, value, unit, color }) => {
   const styles = { 
       yellow: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", 
       blue: "bg-blue-500/10 text-blue-700 border-blue-500/20", 
       orange: "bg-orange-500/10 text-orange-700 border-orange-500/20" 
   };
   const iconStyles = {
       yellow: "bg-yellow-100 text-yellow-600",
       blue: "bg-blue-100 text-blue-600",
       orange: "bg-orange-100 text-orange-600"
   };

   return (
       <div className={`backdrop-blur-md bg-white/60 rounded-2xl p-6 flex items-center gap-5 border shadow-sm hover:scale-[1.02] transition-transform ${styles[color]}`}>
           <div className={`p-4 rounded-full ${iconStyles[color]} shadow-sm`}>
               <Icon className="w-8 h-8" />
           </div>
           <div>
               <p className="text-sm font-bold opacity-70 mb-1">{label}</p>
               <p className="text-2xl font-bold text-gray-800">
                   {Math.round(Number(value)).toLocaleString()} 
                   <span className="text-base font-normal opacity-60 ml-1">{unit}</span>
               </p>
           </div>
       </div>
   );
};

export default Yonetici;