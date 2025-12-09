import React, { useState, useEffect } from 'react';
// DÜZELTME BURADA YAPILDI: ../ yerine ../../
import api from '../../services/api'; 
import { MapPin, Zap, Droplets, Flame, AlertTriangle, Activity, X } from 'lucide-react';

/* =========================================================================
   1. YARDIMCI BİLEŞEN: LİSTE SATIRI
   ========================================================================= */
const StatRow = ({ icon: Icon, label, value, unit, color, iconColor, bgColor }) => (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <span className="text-gray-500 font-medium text-sm">{label}</span>
        </div>
        <span className={`text-lg font-bold ${color}`}>
            {Number(value).toLocaleString()} <span className="text-xs text-gray-400 font-normal">{unit}</span>
        </span>
    </div>
);

/* =========================================================================
   2. YARDIMCI BİLEŞEN: MODAL İÇİNDEKİ ARIZA KARTI
   ========================================================================= */
const ArizaKarti = ({ title, icon: Icon, color, onAriza, loading }) => {
    const colors = { 
        yellow: { bg: "bg-yellow-100", text: "text-yellow-500" }, 
        blue: { bg: "bg-blue-100", text: "text-blue-500" }, 
        orange: { bg: "bg-orange-100", text: "text-orange-500" } 
    };

    const activeColor = colors[color] || colors.yellow;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center h-full justify-between">
            <div className="w-full flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800">{title}</h3>
                <div className={`p-3 rounded-full ${activeColor.bg}`}>
                    <Icon className={activeColor.text} size={24} />
                </div>
            </div>
            
            <p className="text-gray-500 text-sm mb-6">Sistem durumu normal görünüyor.</p>
            
            <button 
                onClick={onAriza} 
                disabled={loading} 
                className="w-full py-3 rounded-xl font-bold border-2 border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
                <AlertTriangle size={18}/> ARIZA OLUŞTUR
            </button>
        </div>
    );
};

/* =========================================================================
   3. ANA MODAL BİLEŞENİ (POP-UP PENCERE)
   ========================================================================= */
const ArizaYonetimModal = ({ mahalle, onClose }) => {
    const [loading, setLoading] = useState(false);
  
    const handleAriza = (tur) => {
      if(!window.confirm(`${mahalle} için ${tur} arıza kaydı oluşturulsun mu?`)) return;
      setLoading(true);
      setTimeout(() => {
        alert(`${mahalle} için ${tur} arızası ekiplere iletildi.`);
        setLoading(false);
      }, 1000);
    };
  
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
          
          {/* Header - Koyu Yeşil */}
          <div className="bg-[#0f5132] px-8 py-5 flex justify-between items-center text-white shrink-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-white" /> {mahalle}
              </h2>
              <p className="text-emerald-200 text-sm mt-0.5">Anlık Arıza Yönetim Paneli</p>
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer">
              <X size={24} className="text-white" />
            </button>
          </div>
  
          {/* İçerik Alanı */}
          <div className="p-8 bg-gray-50 overflow-y-auto flex-1">
             {/* 3'lü Kart Yapısı */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ArizaKarti title="Elektrik" icon={Zap} color="yellow" onAriza={() => handleAriza("Elektrik")} loading={loading} />
                <ArizaKarti title="Su" icon={Droplets} color="blue" onAriza={() => handleAriza("Su")} loading={loading} />
                <ArizaKarti title="Doğalgaz" icon={Flame} color="orange" onAriza={() => handleAriza("Doğalgaz")} loading={loading} />
             </div>
  
             {/* Grafik Alanı (Simülasyon) */}
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 text-lg">Son 24 Saatlik Tüketim Grafiği</h3>
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                   {[...Array(24)].map((_, i) => (
                      <div key={i} className="flex-1 bg-emerald-200 hover:bg-emerald-400 rounded-t-md transition-all relative group" style={{height: `${Math.random() * 60 + 20}%`}}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {Math.floor(Math.random() * 100)} birim
                        </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-3 font-medium">
                   <span>00:00</span>
                   <span>06:00</span>
                   <span>12:00</span>
                   <span>18:00</span>
                   <span>23:59</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
};

/* =========================================================================
   4. ANA SAYFA BİLEŞENİ (MAHALLELER)
   ========================================================================= */
const Mahalleler = () => {
    const [mahalleler, setMahalleler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMahalle, setModalMahalle] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/stats/dashboard');
                setMahalleler(response.data.data);
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-emerald-800 font-bold text-xl">Mahalleler Yükleniyor...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-[150px] min-h-screen relative z-0">
            
            {/* BAŞLIK KUTUSU */}
            <div className="bg-emerald-100/50 py-6 px-8 rounded-3xl mb-10 flex items-center gap-4 shadow-sm border border-emerald-100 relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <MapPin className="text-emerald-600" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-900">Mahalle Tüketim İstatistikleri</h1>
                    <p className="text-emerald-700 mt-1">Tüm mahallelerin anlık verilerini görüntüleyin ve arıza yönetimi yapın.</p>
                </div>
            </div>
            
            {/* KARTLAR LİSTESİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                {mahalleler.map((mahalle, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 flex flex-col group">
                        
                        {/* Kart Başlığı */}
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-800">{mahalle.mahalle} Mahallesi</h2>
                            <MapPin size={20} className="text-emerald-500" />
                        </div>
                        
                        {/* İstatistikler */}
                        <div className="space-y-4 mb-8 flex-1">
                            <StatRow icon={Zap} label="Ort. Elektrik" value={mahalle.elektrik.ortalama} unit="kWh" color="text-emerald-700" iconColor="text-yellow-500" bgColor="bg-yellow-50" />
                            <StatRow icon={Droplets} label="Ort. Su" value={mahalle.su.ortalama} unit="m³" color="text-blue-700" iconColor="text-blue-500" bgColor="bg-blue-50" />
                            <StatRow icon={Flame} label="Ort. Doğalgaz" value={mahalle.dogalgaz.ortalama} unit="m³" color="text-orange-700" iconColor="text-orange-500" bgColor="bg-orange-50" />
                        </div>
                        
                        {/* Arıza Butonu */}
                        <button 
                            onClick={() => setModalMahalle(mahalle.mahalle)}
                            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-md group-hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                            <AlertTriangle size={20} /> Arıza Oluştur
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL GÖSTERİMİ */}
            {modalMahalle && (
                <ArizaYonetimModal 
                    mahalle={modalMahalle} 
                    onClose={() => setModalMahalle(null)} 
                />
            )}
        </div>
    );
};

export default Mahalleler;