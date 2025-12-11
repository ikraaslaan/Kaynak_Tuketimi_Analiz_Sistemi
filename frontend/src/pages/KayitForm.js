import React, { useState, useMemo } from "react";
import bgVideo from "../assets/background.mp4"; // video ismini kontrol et
import { ArrowLeft } from "lucide-react";
import api from "../services/api"; // API servisimizi çağır
import EmailVerification from "../components/EmailVerification";
import useSubscriberVerification from "../hooks/useSubscriberVerification";

// Mahalle listesini Backend'den çekilene kadar geçici olarak elle giriyoruz.
// (Not: HomePage'de yaptığımız gibi bunu da backend'den çekebilirsin ama şimdilik böyle kalsın)
const neighborhoods = ["Sanayi", "Kültürpark", "Universite", "Çaydaçıra", "İzzetpaşa"]; 

const KayitForm = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [email, setEmail] = useState("");
  const [showList, setShowList] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const { initiateVerification, verifyCode, resendCode, isVerifying, error: verificationError } = useSubscriberVerification();

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

    // Initiate email verification instead of direct subscription
    const result = await initiateVerification({
      name,
      surname,
      email,
      neighborhood
    });

    if (result.success) {
      setShowVerification(true);
    } else {
      alert(result.error || "Doğrulama başlatılamadı. Lütfen tekrar deneyin.");
    }
  };

  // This function is called ONLY after successful email verification
  const handleVerificationSuccess = async (subscriberData) => {
    try {
      // Original subscriber submission logic - only executed after verification
      await api.post("/subscribers", {
        name: subscriberData.name,
        surname: subscriberData.surname,
        email: subscriberData.email,
        neighborhood: subscriberData.neighborhood
      });

      alert(`✅ Başarıyla kayıt oldunuz! ${subscriberData.neighborhood} mahallesindeki kesintiler size mail olarak gelecektir.`);
      
      // Formu temizle
      setName("");
      setSurname("");
      setNeighborhood("");
      setEmail("");
      setShowVerification(false);
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    }
  };

  const handleCancel = () => {
    setShowVerification(false);
  };

  const handleResend = async () => {
    const result = await resendCode(email);
    if (!result.success) {
      alert(result.error || "Kod gönderilemedi.");
    }
  };

  // Show verification component if verification is in progress
  if (showVerification) {
    return (
      <EmailVerification
        email={email}
        onVerificationSuccess={handleVerificationSuccess}
        onCancel={handleCancel}
        onResend={handleResend}
        verifyEndpoint="/verification/subscriber/verify"
        resendEndpoint="/verification/subscriber/resend"
        successMessage="E-posta Doğrulandı!"
      />
    );
  }

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

           {verificationError && (
             <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
               {verificationError}
             </div>
           )}

           <button 
             type="submit" 
             disabled={isVerifying}
             className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
           >
             {isVerifying ? "Doğrulama kodu gönderiliyor..." : "Abone Ol ve E-posta Doğrula"}
           </button>
        </form>
      </div>
    </div>
  );
};

export default KayitForm;