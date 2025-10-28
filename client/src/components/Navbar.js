import React, { useState } from "react";
import { Zap, Droplets, Flame, User, Home, Menu, X } from "lucide-react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Ana Sayfa", icon: Home, emoji: "🏠" },
    { id: "elektrik", label: "Elektrik", icon: Zap, emoji: "⚡" },
    { id: "su", label: "Su", icon: Droplets, emoji: "💧" },
    { id: "dogalgaz", label: "Doğalgaz", icon: Flame, emoji: "🔥" },
    { id: "yonetici", label: "Yönetici", icon: User, emoji: "👤" },
  ];

  const isActive = (id) => {
    return activeTab === id;
  };

  const handleNavigation = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b-2 border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⚡</span>
              <span className="hidden sm:inline">Kentsel Tüketim Analizi Platformu</span>
              <span className="sm:hidden">Kentsel Tüketim</span>
            </h1>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-xl">{item.emoji}</span>
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
