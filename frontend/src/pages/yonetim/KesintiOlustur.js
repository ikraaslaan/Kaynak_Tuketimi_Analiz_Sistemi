import React, { useState } from "react";
import api from "../../services/api";
import { CalendarPlus } from "lucide-react";

const KesintiOlustur = () => {
  const [newOutage, setNewOutage] = useState({
    Mahalle: "",
    Kaynak_Tipi: "Elektrik",
    Aciklama: "",
    Baslangic_Tarihi: "",
    Bitis_Tarihi: ""
  });

  const handleCreateOutage = async (e) => {
    e.preventDefault();
    try {
      await api.post("/incidents", newOutage);
      alert("Planlı kesinti başarıyla oluşturuldu!");
      setNewOutage({ Mahalle: "", Kaynak_Tipi: "Elektrik", Aciklama: "", Baslangic_Tarihi: "", Bitis_Tarihi: "" });
    } catch (error) {
      alert("Kesinti eklenemedi. Bilgileri kontrol ediniz.");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-[100px] px-4 pb-10">
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
          <CalendarPlus className="text-emerald-600" /> Planlı Kesinti Oluştur
        </h2>
        <form onSubmit={handleCreateOutage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Mahalle</label>
                <input 
                  type="text" 
                  placeholder="Örn: Sanayi" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Mahalle}
                  onChange={e => setNewOutage({...newOutage, Mahalle: e.target.value})}
                  required
                />
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Kaynak Tipi</label>
                <select 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Kaynak_Tipi}
                  onChange={e => setNewOutage({...newOutage, Kaynak_Tipi: e.target.value})}
                >
                    <option value="Elektrik">Elektrik</option>
                    <option value="Su">Su</option>
                    <option value="Dogalgaz">Doğalgaz</option>
                </select>
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

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                <input 
                  type="datetime-local" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Baslangic_Tarihi}
                  onChange={e => setNewOutage({...newOutage, Baslangic_Tarihi: e.target.value})}
                  required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Tahmini Bitiş</label>
                <input 
                  type="datetime-local" 
                  className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newOutage.Bitis_Tarihi}
                  onChange={e => setNewOutage({...newOutage, Bitis_Tarihi: e.target.value})}
                  required
                />
            </div>
            
            <div className="flex items-end">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md">
                    Kesinti Ekle
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default KesintiOlustur;