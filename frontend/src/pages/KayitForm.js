import React, { useState, useMemo } from "react";
import bgVideo from "../assets/background.mp4"; // video ismini kontrol et
import { ArrowLeft } from "lucide-react";
import api from "../services/api"; // API servisimizi çağır

// Mahalle listesini Backend'den çekilene kadar geçici olarak elle giriyoruz.
// (Not: HomePage'de yaptığımız gibi bunu da backend'den çekebilirsin ama şimdilik böyle kalsın)
const neighborhoods = ["Sanayi", "Kültürpark", "Universite", "Çaydaçıra", "İzzetpaşa"]; 

const KayitForm = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [email, setEmail] = useState("");
  const [showList, setShowList] = useState(false);

  const filteredNeighborhoods = useMemo(() => {
    if (!neighborhood.trim()) return [];
    return neighborhoods.filter((m) =>
      m.toLowerCase().includes(neighborhood.toLowerCase())
    );
  }, [neighborhood]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !surname || !neighborhood || !email) {
      alert("Lütfen tüm alanları doldurunuz.");
      return;
    }

    try {
      // BACKEND İSTEĞİ
      await api.post("/subscribers", {
        name,
        surname,
        email,
        neighborhood
      });

      alert(`✅ Başarıyla kayıt oldunuz! ${neighborhood} mahallesindeki kesintiler size mail olarak gelecektir.`);
      
      // Formu temizle
      setName("");
      setSurname("");
      setNeighborhood("");
      setEmail("");
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    }
  };

  return (
    // ... (HTML tasarım kodların aynı kalsın) ...
    // Sadece <form onSubmit={handleSubmit}> olduğundan emin ol
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-10 overflow-hidden">
      {/* ... Video ve Geri Dön butonu kodları aynı ... */}
      
      {/* Form Kodları aynı kalacak, sadece logic değişti */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/35 z-10"></div>

       <button
        onClick={() => (window.location.href = "/")}
        className="flex items-center gap-2 text-white drop-shadow-md hover:text-gray-200 self-start mb-8 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Geri Dön
      </button>

      <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-2xl p-8 w-full max-w-lg mt-20 z-20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Kayıt Formu</h2>
        <p className="text-center text-white/90 mb-8">Mahallenizdeki kesintilerden mail yoluyla haberdar olun.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
           {/* Inputlar aynı... */}
           <div>
            <label className="text-sm font-medium text-white">Adınız</label>
            <input className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/40" placeholder="Adınız" value={name} onChange={(e) => setName(e.target.value)} />
           </div>
           <div>
            <label className="text-sm font-medium text-white">Soyadınız</label>
            <input className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/40" placeholder="Soyadınız" value={surname} onChange={(e) => setSurname(e.target.value)} />
           </div>
           
           <div className="relative">
            <label className="text-sm font-medium text-white">Mahalleniz</label>
            <input type="text" className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/40" placeholder="Mahalle seçin" value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setShowList(true); }} onBlur={() => setTimeout(() => setShowList(false), 200)} />
            {showList && filteredNeighborhoods.length > 0 && (
              <ul className="absolute left-0 right-0 bg-gray-900 text-white border border-white/30 rounded-xl mt-1 max-h-40 overflow-y-auto z-30">
                {filteredNeighborhoods.map((m, i) => (
                  <li key={i} onClick={() => { setNeighborhood(m); setShowList(false); }} className="px-4 py-2 cursor-pointer hover:bg-white/20">{m}</li>
                ))}
              </ul>
            )}
           </div>

           <div>
            <label className="text-sm font-medium text-white">E-postanız</label>
            <input type="email" className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/40" placeholder="ornek@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
           </div>

           <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all">Abone Ol</button>
        </form>
      </div>
    </div>
  );
};

export default KayitForm;