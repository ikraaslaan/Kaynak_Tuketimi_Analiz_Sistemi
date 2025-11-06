import React, { useState } from "react";
import { Menu, X, Home, Zap, Droplets, Flame, Shield } from "lucide-react";
import icon from "../images/icon.jpg"; // Logoyu buradan alıyoruz

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pink-50/60 backdrop-blur-lg border-b border-pink-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo ve Başlık: En sola sıfırlandı, logo ile başlık arasına ve sağa doğru ek boşluk */}
          {/* logo ve başlık arasındaki boşluk için mr-3, sağa doğru ek boşluk için pr-8 */}
          <div className="flex items-center pr-8 flex-shrink-0"> 
            <img
              src={icon}
              alt="Platform Logo"
              className="h-9 w-auto object-contain rounded-lg select-none mr-3" 
            />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-800 sm:text-2xl lg:text-3xl whitespace-nowrap">
              Kentsel <span className="text-emerald-600">Tüketim</span> Analizi Platformu
            </h1>
          </div>

          {/* Desktop Menü: Sağa yaslandı, öğeler arası boşluk daha da açıldı ve soldan boşluk */}
          {/* ml-auto menüyü sağa iter, space-x-8 öğeler arası daha fazla boşluk verir.
              pl-8 ile menü bloğunun soldan içeri itilmesi sağlandı. */}
          <div className="hidden md:flex items-center space-x-8 pl-8"> 
            {menuItems.map((item) => {
              const active = isActive(item.id);
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-md font-medium transition-all duration-300 group ${
                    active
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500 group-hover:text-emerald-600"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobil Menü Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in-down bg-pink-50/95 border-t border-pink-200 shadow-lg">
            <div className="flex flex-col space-y-2 px-2">
              {menuItems.map((item) => {
                const active = isActive(item.id);
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-md font-medium transition-all duration-200 ${
                      active
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${active ? "text-white" : "text-gray-500"}`} />
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