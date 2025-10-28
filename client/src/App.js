import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Elektrik from "./pages/Elektrik";
import Su from "./pages/Su";
import Dogalgaz from "./pages/Dogalgaz";
import Yonetici from "./pages/Yonetici";
import SubscriptionBox from "./components/SubscriptionBox";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage selectedNeighborhood={selectedNeighborhood} setSelectedNeighborhood={setSelectedNeighborhood} />;
      case "elektrik":
        return <Elektrik selectedNeighborhood={selectedNeighborhood} />;
      case "su":
        return <Su selectedNeighborhood={selectedNeighborhood} />;
      case "dogalgaz":
        return <Dogalgaz selectedNeighborhood={selectedNeighborhood} />;
      case "yonetici":
        return <Yonetici />;
      default:
        return <HomePage selectedNeighborhood={selectedNeighborhood} setSelectedNeighborhood={setSelectedNeighborhood} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
      <SubscriptionBox />
    </div>
  );
}

export default App;
