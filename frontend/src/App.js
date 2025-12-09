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
import Mahalleler from "./pages/yonetim/Mahalleler";
import ArizaYonetimi from "./pages/yonetim/ArizaYonetimi";
import KesintiOlustur from "./pages/yonetim/KesintiOlustur";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import AuthContext from "./context/AuthContext"; 

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const { user, logout } = useContext(AuthContext);
  const isAdminAuthed = !!user; 

  const handleAdminLogout = () => {
    logout(); 
    setActiveTab("home"); 
  };

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

      // --- YÖNETİCİ PANELİ SAYFALARI ---
      case "mahalleler":
        return isAdminAuthed ? <Mahalleler key="mahalleler" /> : <AdminLogin />;

      case "arizalar":
        return isAdminAuthed ? <ArizaYonetimi key="arizalar" /> : <AdminLogin />;

      case "planli_kesinti":
        return isAdminAuthed ? <KesintiOlustur key="planli_kesinti" /> : <AdminLogin />;

      case "yonetici":
        if (!isAdminAuthed) {
          return <AdminLogin key="adminlogin" />;
        }
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
      
      {/* --- DEĞİŞİKLİK BURADA --- */}
      {/* Eğer yönetici giriş yapmışsa (isAdminAuthed) VEYA şu an yönetici sekmesindeysek gizle */}
      {!isAdminAuthed && activeTab !== "yonetici" && (
        <div className="fixed bottom-4 right-4 z-50">
          <SubscriptionBox /> 
        </div>
      )}
      
    </div>
  );
}

export default App;