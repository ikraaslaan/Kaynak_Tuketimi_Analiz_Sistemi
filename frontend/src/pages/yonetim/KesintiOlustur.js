import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
// EKSİK İKONLARI BURAYA EKLEDİM:
import { CalendarPlus, AlertTriangle, CheckCircle } from "lucide-react";

const KesintiOlustur = () => {
  // Mahalle listesini tutacak state
  const [neighborhoods, setNeighborhoods] = useState([]);
  
  // EKSİK OLAN STATE: Arızaları listelemek için bunu eklememiz lazımdı
  const [incidents, setIncidents] = useState([]);

  // Form verileri
  const [newOutage, setNewOutage] = useState({
    Mahalle: "",
    Kaynak_Tipi: "Elektrik",
    Aciklama: "",
    Tarih: "",
    Baslangic_Saat: "",
    Bitis_Saat: ""
  });

  // Sayfa açılınca HEM Mahalleleri HEM DE Arızaları çekelim
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Mahalleleri çek
      const resStats = await api.get("/stats/dashboard");
      setNeighborhoods(resStats.data.data);

      // 2. Mevcut Arızaları çek (Tablo dolsun diye)
      const resIncidents = await api.get("/incidents");
      setIncidents(resIncidents.data.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const handleCreateOutage = async (e) => {
    e.preventDefault();
    if (!newOutage.Mahalle) {
        alert("Lütfen bir mahalle seçiniz.");
        return;
    }
    try {
      await api.post("/incidents/planned", newOutage);
      alert("Planlı kesinti başarıyla oluşturuldu ve bildirimler gönderildi!");
      
      // Formu temizle
      setNewOutage({ Mahalle: "", Kaynak_Tipi: "Elektrik", Aciklama: "", Tarih: "", Baslangic_Saat: "", Bitis_Saat: "" });
      
      // Tabloyu güncelle (Yeni eklenen görünsün)
      fetchData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Kesinti eklenemedi.";
      alert("Hata: " + errorMsg);
    }
  };

  // EKSİK OLAN FONKSİYON: Arızayı çözüldü olarak işaretle
  const handleResolveIncident = async (id) => {
    if(!window.confirm("Bu arızayı çözüldü olarak işaretlemek istiyor musunuz?")) return;

    try {
      await api.put(`/incidents/${id}/resolve`);
      alert("Arıza çözüldü.");
      fetchData(); // Listeyi yenile
    } catch (error) {
      console.error("Çözme hatası:", error);
      alert("İşlem başarısız.");
    }
  };

  return (
    // ANA KAPSAYICI (Tüm her şey bunun içinde olmalı)
    <div className="w-full max-w-7xl mx-auto pt-[100px] px-4 pb-10 space-y-8">
      
      {/* --- BÖLÜM 1: FORM --- */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
          <CalendarPlus className="text-emerald-600" /> Planlı Kesinti Oluştur
        </h2>
        
        <form onSubmit={handleCreateOutage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Mahalle</label>
                <select 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={newOutage.Mahalle}
                  onChange={e => setNewOutage({...newOutage, Mahalle: e.target.value})}
                  required
                >
                    <option value="">Mahalle Seçiniz</option>
                    {neighborhoods.map((item) => (
                        <option key={item.mahalle} value={item.mahalle}>{item.mahalle}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Kaynak Tipi</label>
                <select 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={newOutage.Kaynak_Tipi}
                  onChange={e => setNewOutage({...newOutage, Kaynak_Tipi: e.target.value})}
                >
                    <option value="Elektrik">Elektrik</option>
                    <option value="Su">Su</option>
                    <option value="Dogalgaz">Doğalgaz</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Tarih</label>
                <input 
                  type="date" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  value={newOutage.Tarih}
                  onChange={e => setNewOutage({...newOutage, Tarih: e.target.value})}
                  required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Başlangıç Saati</label>
                <input 
                  type="time" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Baslangic_Saat}
                  onChange={e => setNewOutage({...newOutage, Baslangic_Saat: e.target.value})}
                  required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Bitiş Saati</label>
                <input 
                  type="time" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Bitis_Saat}
                  onChange={e => setNewOutage({...newOutage, Bitis_Saat: e.target.value})}
                  required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Açıklama</label>
                <input 
                  type="text" 
                  placeholder="Örn: Bakım çalışması" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Aciklama}
                  onChange={e => setNewOutage({...newOutage, Aciklama: e.target.value})}
                  required
                />
            </div>
            
            <div className="flex items-end lg:col-span-3">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md">
                    Kesinti Ekle
                </button>
            </div>
        </form>
      </div>

      {/* --- BÖLÜM 2: TABLO (AKTİF ARIZALAR) --- */}
      {/* Bu div artık ana div'in içinde olduğu için hata vermeyecek */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-500" /> Aktif Arıza ve Kesintiler ({incidents.length})
        </h2>
        
        {incidents.length === 0 ? (
          <p className="text-center text-gray-500 py-10 bg-white/40 rounded-xl border border-dashed border-gray-300">
            Şu an aktif bir arıza yok.
          </p>
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
                    <th className="p-4 font-medium">Başlangıç</th>
                    <th className="p-4 font-medium">Bitiş</th>
                    <th className="p-4 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident._id} className="border-b border-gray-200/50 hover:bg-white/40 transition">
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${incident.Durum === 'AKTIF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {incident.Durum}
                        </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{incident.Tip}</td>
                    <td className="p-4 font-medium text-gray-800">{incident.Mahalle}</td>
                    <td className="p-4 font-medium text-gray-800">{incident.Kaynak_Tipi}</td>
                    <td className="p-4 text-sm text-gray-600">{incident.Aciklama}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(incident.Baslangic_Tarihi).toLocaleString("tr-TR")}</td>
                    <td className="p-4 text-sm text-gray-500">{incident.Bitis_Tarihi ? new Date(incident.Bitis_Tarihi).toLocaleString("tr-TR") : '-'}</td>
                    <td className="p-4">
                        {incident.Durum === 'AKTIF' && (
                            <button onClick={() => handleResolveIncident(incident._id)} className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                                <CheckCircle size={16} />Çözüldü
                            </button>
                        )}
                    </td>
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

export default KesintiOlustur;