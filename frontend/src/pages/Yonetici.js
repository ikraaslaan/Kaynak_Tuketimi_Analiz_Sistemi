import React from "react";
import { User, Settings, Shield, Bell, BarChart3, Users, Database, Clock } from "lucide-react";

const Yonetici = () => {
  const managementCards = [
    { title: "Kullanıcı Yönetimi", description: "Kullanıcı hesaplarını yönet", icon: Users, color: "blue" },
    { title: "Sistem Ayarları", description: "Yapılandırma ve ayarlar", icon: Settings, color: "gray" },
    { title: "Güvenlik", description: "Güvenlik ayarları", icon: Shield, color: "green" },
    { title: "Bildirimler", description: "Sistem bildirimleri", icon: Bell, color: "yellow" },
    { title: "Raporlar", description: "Analitik raporlar", icon: BarChart3, color: "purple" },
    { title: "Kullanıcı Profili", description: "Profil bilgileriniz", icon: User, color: "indigo" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      gray: "bg-gray-50 text-gray-600 border-gray-200",
      green: "bg-green-50 text-green-600 border-green-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <User className="w-6 h-6 text-gray-700" />
            Yönetici Paneli
          </h2>
          <p className="text-gray-600">Sistem yönetimi ve yapılandırma ayarları</p>
        </div>

        {/* Yönetim Kartları */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Yönetim Seçenekleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-100 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border-2 ${getColorClasses(card.color)} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sistem İstatistikleri */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Sistem Özeti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Toplam Kayıt</span>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">156K</p>
              <p className="text-sm text-blue-700 mt-1">Veritabanında</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Aktif Uptime</span>
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">100%</p>
              <p className="text-sm text-green-700 mt-1">Sistem durumu</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Son Güncelleme</span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">5dk</p>
              <p className="text-sm text-purple-700 mt-1">Önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yonetici;

