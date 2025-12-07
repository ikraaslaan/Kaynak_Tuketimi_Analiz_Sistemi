import React, { useState, useEffect, useContext } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Elektrik from "./pages/Elektrik";
import Su from "./pages/Su";
import Dogalgaz from "./pages/Dogalgaz";
import Yonetici from "./pages/Yonetici";
import SubscriptionBox from "./components/SubscriptionBox";
import KayitForm from "./pages/KayitForm";
import AdminLogin from "./pages/AdminLogin";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import AuthContext from "./context/AuthContext"; // <-- BİZİM CONTEXT'İ EKLEDİK

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  // Context'ten kullanıcı bilgisini ve çıkış fonksiyonunu çekiyoruz
  // Artık state veya localStorage ile uğraşmak yok!
  const { user, logout } = useContext(AuthContext);

  // Kullanıcı var mı? Varsa admindir.
  const isAdminAuthed = !!user; 

  const handleAdminLogout = () => {
    logout(); // Context'teki çıkış fonksiyonunu çalıştır
    setActiveTab("home"); // Anasayfaya at
  };

  // Kayıt formunun açılması için event dinleyicisi
  useEffect(() => {
    const handleOpenForm = () => setActiveTab("kayit");
    window.addEventListener("openKayitForm", handleOpenForm);

    return () => {
      window.removeEventListener("openKayitForm", handleOpenForm);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            key="home"
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
      case "kayit":
        return <KayitForm key="kayit" />;
      case "elektrik":
        return (
          <Elektrik
            key="elektrik"
            selectedNeighborhood={selectedNeighborhood}
          />
        );
      case "su":
        return <Su key="su" selectedNeighborhood={selectedNeighborhood} />;
      case "dogalgaz":
        return (
          <Dogalgaz
            key="dogalgaz"
            selectedNeighborhood={selectedNeighborhood}
          />
        );
      case "yonetici":
        // Eğer kullanıcı (token) yoksa Giriş Ekranını göster
        if (!isAdminAuthed) {
          return (
            <AdminLogin
              key="adminlogin"
              // Giriş başarılı olduğunda Context otomatik güncellenir
              // ve React bu bileşeni yeniden render edip alttaki (Yonetici) satıra geçer.
              // O yüzden buraya ekstra bir success fonksiyonu yazmamıza gerek kalmadı.
            />
          );
        }
        // Kullanıcı varsa Yönetici Panelini göster
        return <Yonetici key="yonetici" onLogout={handleAdminLogout} />;
      default:
        return (
          <HomePage
            key="home-default"
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#DDEEE3] relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleAdminLogout}
        isAdminAuthed={isAdminAuthed}
      />
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <div className="fixed bottom-4 right-4 z-50">
        <SubscriptionBox /> 
      </div>
    </div>
  );
}

export default App;