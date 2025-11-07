import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Elektrik from "./pages/Elektrik";
import Su from "./pages/Su";
import Dogalgaz from "./pages/Dogalgaz";
import Yonetici from "./pages/Yonetici";
import EmailSubscription from "./components/EmailSubscription";
import "./App.css";
import { AnimatePresence } from "framer-motion"; // YENİ: framer-motion import et

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const renderContent = () => {
    // YENİ: Animasyonun çalışması için her bileşene 'key' prop'u ekledik.
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            key="home" // YENİ
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
      case "elektrik":
        return <Elektrik key="elektrik" selectedNeighborhood={selectedNeighborhood} />; // YENİ
      case "su":
        return <Su key="su" selectedNeighborhood={selectedNeighborhood} />; // YENİ
      case "dogalgaz":
        return <Dogalgaz key="dogalgaz" selectedNeighborhood={selectedNeighborhood} />; // YENİ
      case "yonetici":
        return <Yonetici key="yonetici" />; // YENİ
      default:
        return (
          <HomePage
            key="home-default" // YENİ
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#DDEEE3] relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* YENİ: Sayfa içeriğini AnimatePresence ile sarmaladık */}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {/* ✅ reCAPTCHA ile güvenli e-posta kutusu */}
      <div className="fixed bottom-4 right-4 z-50">
        <EmailSubscription />
      </div>
    </div>
  );
}

export default App;