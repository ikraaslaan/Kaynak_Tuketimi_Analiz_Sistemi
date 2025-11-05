import React, { useState } from "react";
import { Menu, X, Home, Zap, Droplets, Flame, Shield } from "lucide-react";
import icon from "../images/icon.jpg"; // ✅ LOGO BURADA

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-pink-50/60 to-pink-100/60 backdrop-blur-md border-b border-pink-200/60 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + Başlık */}
          <div className="flex items-center">
            <img
              src={icon}
              alt="Logo"
              className="h-9 w-auto mr-3 object-contain rounded-md select-none"
            />
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              <span className="hidden sm:inline">
                Kentsel Tüketim Analizi Platformu
              </span>
              <span className="sm:hidden">Kentsel Tüketim</span>
            </h1>
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item) => {
              const active = isActive(item.id);
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-2xl text-sm font-normal transition-all duration-200 ${
                    active
                      ? "text-green-600 bg-white/50"
                      : "text-green-600 hover:bg-white/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobil Menü Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 animate-fade-in bg-gradient-to-br from-pink-50 to-pink-100 backdrop-blur-md border-t border-pink-200">
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.id);
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-normal transition-all duration-200 ${
                      active
                        ? "text-green-600 bg-white/50"
                        : "text-green-600 hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
