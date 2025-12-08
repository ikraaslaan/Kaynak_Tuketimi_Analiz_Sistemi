import React, { useState, useEffect } from "react";
import api from "../services/api";
import { LogOut, CheckCircle, AlertTriangle, Activity, CalendarPlus } from "lucide-react";

const Yonetici = ({ onLogout }) => {
  const [stats, setStats] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newOutage, setNewOutage] = useState({
    Mahalle: "",
    Kaynak_Tipi: "Elektrik",
    Aciklama: "",
    Baslangic_Tarihi: "",
    Bitis_Tarihi: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get("/stats/dashboard");
      const incidentsRes = await api.get("/incidents");
      setStats(statsRes.data.data);
      setIncidents(incidentsRes.data.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      alert("Veriler yüklenirken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIncident = async (id) => {
    if (!window.confirm("Bu arızayı çözüldü olarak işaretlemek istiyor musunuz?")) return;
    try {
      await api.put(`/incidents/${id}/coz`);
      alert("Arıza başarıyla kapatıldı.");
      fetchData();
    } catch (error) {
      alert("İşlem başarısız.");
    }
  };

  // YENİ KESİNTİ EKLEME
  const handleCreateOutage = async (e) => {
    e.preventDefault();
    try {
      await api.post("/incidents", newOutage);
      alert("Planlı kesinti oluşturuldu!");
      setNewOutage({ Mahalle: "", Kaynak_Tipi: "Elektrik", Aciklama: "", Baslangic_Tarihi: "", Bitis_Tarihi: "" });
      fetchData();
    } catch (error) {
      alert("Kesinti eklenemedi. Lütfen alanları kontrol edin.");
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-emerald-800">Yönetici Paneli Yükleniyor...</div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white/40 p-6 rounded-2xl backdrop-blur-md border border-white/50 shadow-sm">
        <div><h1 className="text-3xl font-bold text-emerald-900">Yönetici Paneli</h1><p className="text-emerald-700">Sistem durumu ve arıza yönetimi</p></div>
        <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition shadow-md"><LogOut size={20} />Çıkış Yap</button>
      </div>

      {/* DASHBOARD KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((mahalleData) => (
          <div key={mahalleData.mahalle} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:scale-[1.02] transition-transform">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-emerald-200">{mahalleData.mahalle} Mahallesi</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Ort. Elektrik:</span><span className="font-bold text-emerald-700">{mahalleData.elektrik.ortalama} kWh</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Ort. Su:</span><span className="font-bold text-blue-600">{mahalleData.su.ortalama} m³</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Ort. Doğalgaz:</span><span className="font-bold text-orange-600">{mahalleData.dogalgaz.ortalama} m³</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* --- YENİ PLANLI KESİNTİ FORMU --- */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-12">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
          <CalendarPlus className="text-emerald-600" /> Planlı Kesinti Oluştur
        </h2>
        <form onSubmit={handleCreateOutage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Mahalle Adı (Örn: Sanayi)" 
              className="p-3 rounded-xl border border-gray-300"
              value={newOutage.Mahalle}
              onChange={e => setNewOutage({...newOutage, Mahalle: e.target.value})}
              required
            />
            <select 
              className="p-3 rounded-xl border border-gray-300"
              value={newOutage.Kaynak_Tipi}
              onChange={e => setNewOutage({...newOutage, Kaynak_Tipi: e.target.value})}
            >
                <option value="Elektrik">Elektrik</option>
                <option value="Su">Su</option>
                <option value="Dogalgaz">Doğalgaz</option>
            </select>
            <input 
              type="text" 
              placeholder="Açıklama (Örn: Bakım çalışması)" 
              className="p-3 rounded-xl border border-gray-300"
              value={newOutage.Aciklama}
              onChange={e => setNewOutage({...newOutage, Aciklama: e.target.value})}
              required
            />
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 ml-1">Başlangıç</label>
                <input 
                  type="datetime-local" 
                  className="p-3 rounded-xl border border-gray-300"
                  value={newOutage.Baslangic_Tarihi}
                  onChange={e => setNewOutage({...newOutage, Baslangic_Tarihi: e.target.value})}
                  required
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 ml-1">Bitiş (Tahmini)</label>
                <input 
                  type="datetime-local" 
                  className="p-3 rounded-xl border border-gray-300"
                  value={newOutage.Bitis_Tarihi}
                  onChange={e => setNewOutage({...newOutage, Bitis_Tarihi: e.target.value})}
                  required
                />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md h-full mt-auto">
                Kesinti Ekle
            </button>
        </form>
      </div>

      {/* ARIZA LİSTESİ */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><AlertTriangle className="text-red-500" /> Aktif Arıza ve Kesintiler</h2>
        {incidents.length === 0 ? (
          <p className="text-center text-gray-500 py-10 bg-white/40 rounded-xl border border-dashed border-gray-300">Şu an aktif bir arıza bulunmuyor. Sistem stabil.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-300"><th className="p-4 font-medium">Durum</th><th className="p-4 font-medium">Tip</th><th className="p-4 font-medium">Mahalle</th><th className="p-4 font-medium">Kaynak</th><th className="p-4 font-medium">Açıklama</th><th className="p-4 font-medium">Tarih</th><th className="p-4 font-medium">İşlem</th></tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident._id} className="border-b border-gray-200/50 hover:bg-white/40 transition">
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${incident.Durum === 'AKTIF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{incident.Durum}</span></td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{incident.Tip || "ARIZA"}</td>
                    <td className="p-4 font-medium text-gray-800">{incident.Mahalle}</td>
                    <td className="p-4 font-medium text-gray-800">{incident.Kaynak_Tipi}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{incident.Aciklama || "Belirtilmemiş"}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(incident.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="p-4">{incident.Durum === 'AKTIF' && (<button onClick={() => handleResolveIncident(incident._id)} className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition"><CheckCircle size={16} />Çözüldü</button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Yonetici;