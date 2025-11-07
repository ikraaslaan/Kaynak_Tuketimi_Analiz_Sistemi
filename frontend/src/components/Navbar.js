import React, { useState } from "react";
import { Menu, X, Home, Zap, Droplets, Flame, Shield } from "lucide-react";
import icon from "../images/icon.jpg";

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Anasayfa", Icon: Home },
    { id: "elektrik", label: "Elektrik", Icon: Zap },
    { id: "su", label: "Su", Icon: Droplets },
    { id: "dogalgaz", label: "Doğalgaz", Icon: Flame },
    { id: "yonetici", label: "Yönetici", Icon: Shield },
  ];

  const isActive = (id) => activeTab === id;

  const handleNavigation = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
      
      {/* ✅ Burada değiştirdik */}
      <div className="w-full px-6 sm:px-8 lg:px-12">
        
        <div className="flex items-center h-20">

          {/* Sol Logo + Başlık */}
          <div className="flex items-center gap-3 select-none">
            <img src={icon} alt="Logo" className="h-11 w-11 rounded-lg object-cover shadow-md" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-[0_0_12px_rgba(0,0,0,0.65)] whitespace-nowrap">
              Kentsel <span className="text-emerald-400">Tüketim</span> Analizi Platformu
            </h1>
          </div>

          {/* Orta boşluk → Menu sağa kayar */}
          <div className="flex-1"></div>

          {/* Sağ Menü */}
          <div className="hidden md:flex items-center space-x-10 pr-1">
            {menuItems.map(({ id, label, Icon }) => {
              const active = isActive(id);
              return (
                <button
                  key={id}
                  onClick={() => handleNavigation(id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 
                  ${active ? "bg-emerald-500/85 text-white shadow-lg scale-[1.05]" : "text-white/90 hover:bg-white/15 hover:text-emerald-300"}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-white hover:text-emerald-300 transition duration-200 ml-3"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
