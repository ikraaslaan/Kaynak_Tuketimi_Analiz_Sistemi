import React, { useState, useEffect } from "react";
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

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);

  // Admin giriş bilgisini okuma
  useEffect(() => {
    setIsAdminAuthed(localStorage.getItem("isAdminAuthed") === "true");
  }, []);

  const handleAdminSuccess = () => {
    localStorage.setItem("isAdminAuthed", "true");
    setIsAdminAuthed(true);
    setActiveTab("yonetici");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdminAuthed");
    setIsAdminAuthed(false);
    setActiveTab("home");
  };

  // Kayıt formunun açılması için event dinleyicisini ekliyoruz
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
        return <Elektrik key="elektrik" selectedNeighborhood={selectedNeighborhood} />;
      case "su":
        return <Su key="su" selectedNeighborhood={selectedNeighborhood} />;
      case "dogalgaz":
        return <Dogalgaz key="dogalgaz" selectedNeighborhood={selectedNeighborhood} />;
      case "yonetici":
        if (!isAdminAuthed) {
          return (
            <AdminLogin
              key="adminlogin"
              onSuccess={handleAdminSuccess}
              onCancel={() => setActiveTab("home")}
            />
          );
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
      <div className="fixed bottom-4 right-4 z-50">
        <SubscriptionBox /> {/* Kayıt Ol kutusu */}
      </div>
    </div>
  );
}

export default App;
