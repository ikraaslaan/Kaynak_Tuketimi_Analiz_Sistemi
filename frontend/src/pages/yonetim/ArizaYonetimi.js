import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { CheckCircle, AlertTriangle } from "lucide-react";

const ArizaYonetimi = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      setIncidents(res.data.data);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolveIncident = async (id) => {
    if (!window.confirm("Bu arızayı çözüldü olarak işaretlemek istiyor musunuz?")) return;
    try {
      await api.put(`/incidents/${id}/coz`);
      alert("Arıza başarıyla kapatıldı.");
      fetchIncidents(); // Tabloyu yenile
    } catch (error) {
      alert("İşlem başarısız.");
    }
  };

  if (loading) return <div className="text-center mt-20 text-emerald-800">Arızalar Yükleniyor...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto pt-[100px] px-4 pb-10">
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <AlertTriangle className="text-red-500" /> Aktif Arıza ve Kesintiler
        </h2>
        {incidents.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Şu an aktif bir arıza bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-300">
                  <th className="p-4 font-medium">Durum</th>
                  <th className="p-4 font-medium">Tip</th>
                  <th className="p-4 font-medium">Mahalle</th>
                  <th className="p-4 font-medium">Kaynak</th>
                  <th className="p-4 font-medium">Açıklama</th>
                  <th className="p-4 font-medium">Tarih</th>
                  <th className="p-4 font-medium">İşlem</th>
                </tr>
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

export default ArizaYonetimi;