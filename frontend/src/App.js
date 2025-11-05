import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Elektrik from "./pages/Elektrik";
import Su from "./pages/Su";
import Dogalgaz from "./pages/Dogalgaz";
import Yonetici from "./pages/Yonetici";
import EmailSubscription from "./components/EmailSubscription"; // ✅ reCAPTCHA'lı yeni bileşen
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
      case "elektrik":
        return <Elektrik selectedNeighborhood={selectedNeighborhood} />;
      case "su":
        return <Su selectedNeighborhood={selectedNeighborhood} />;
      case "dogalgaz":
        return <Dogalgaz selectedNeighborhood={selectedNeighborhood} />;
      case "yonetici":
        return <Yonetici />;
      default:
        return (
          <HomePage
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#DDEEE3] relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}

      {/* ✅ reCAPTCHA ile güvenli e-posta kutusu */}
      <div className="fixed bottom-4 right-4 z-50">
        <EmailSubscription />
      </div>
    </div>
  );
}

export default App;
