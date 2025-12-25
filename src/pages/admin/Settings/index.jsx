import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Save, 
  Camera, 
  Building, 
  Mail, 
  Phone,
  Moon,
  Sun,
  Shield
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Mock Data: General Settings
  const [generalInfo, setGeneralInfo] = useState({
    gymName: "FitSys Gym Center",
    email: "admin@fitsys.com",
    phone: "0909 123 456",
    address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
    description: "Hệ thống phòng tập hiện đại nhất khu vực."
  });

  // Mock Data: Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlert: true,
    newMemberAlert: true,
    paymentAlert: true,
    maintenanceAlert: false,
    marketingEmails: false
  });

  // Handle Input Change (General)
  const handleGeneralChange = (e) => {
    setGeneralInfo({ ...generalInfo, [e.target.name]: e.target.value });
  };

  // Handle Toggle Change (Notifications)
  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Gym Profile Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Thông tin Phòng tập</h3>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center relative overflow-hidden group cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    <Building size={40} className="text-gray-400 group-hover:hidden" />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-medium">
                      <Camera size={24} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Logo thương hiệu</span>
                </div>
                
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên Phòng tập</label>
                      <input 
                        type="text" 
                        name="gymName"
                        value={generalInfo.gymName}
                        onChange={handleGeneralChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email" 
                          name="email"
                          value={generalInfo.email}
                          onChange={handleGeneralChange}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          name="phone"
                          value={generalInfo.phone}
                          onChange={handleGeneralChange}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <input 
                        type="text" 
                        name="address"
                        value={generalInfo.address}
                        onChange={handleGeneralChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả giới thiệu</label>
                      <textarea 
                        rows="3"
                        name="description"
                        value={generalInfo.description}
                        onChange={handleGeneralChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                      <Save size={18} />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preferences */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Tùy chỉnh giao diện</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-gray-700"><Globe size={20}/></div>
                      <div>
                        <p className="font-medium text-gray-900">Ngôn ngữ</p>
                        <p className="text-xs text-gray-500">Ngôn ngữ hiển thị của hệ thống</p>
                      </div>
                   </div>
                   <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Tiếng Việt</option>
                      <option>English</option>
                   </select>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-gray-700"><Moon size={20}/></div>
                      <div>
                        <p className="font-medium text-gray-900">Giao diện tối</p>
                        <p className="text-xs text-gray-500">Chuyển sang chế độ ban đêm</p>
                      </div>
                   </div>
                   {/* Toggle Switch Mock */}
                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 cursor-pointer relative">
                      <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 left-0.5 shadow-sm transition-all"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
             <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Cấu hình thông báo</h3>
             <div className="space-y-6">
                {[
                  { id: 'emailAlert', label: 'Thông báo qua Email', desc: 'Nhận email tổng hợp hàng ngày và cảnh báo quan trọng.', icon: Mail },
                  { id: 'newMemberAlert', label: 'Đăng ký hội viên mới', desc: 'Thông báo khi có khách hàng đăng ký hoặc gia hạn gói.', icon: User },
                  { id: 'paymentAlert', label: 'Xác nhận thanh toán', desc: 'Thông báo khi giao dịch thanh toán thành công.', icon: Bell },
                  { id: 'maintenanceAlert', label: 'Cảnh báo thiết bị', desc: 'Thông báo khi có thiết bị được báo hỏng.', icon: Building },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg bg-blue-50 text-blue-600`}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => handleToggle(item.id)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${notifications[item.id] ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div 
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
             </div>
             <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
                <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium mr-3 transition-colors">Hủy bỏ</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Lưu cấu hình</button>
             </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Đổi mật khẩu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                      <input type="password" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••"/>
                   </div>
                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                          <input type="password" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                          <input type="password" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••"/>
                      </div>
                   </div>
                </div>
                <div className="mt-6">
                   <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Cập nhật mật khẩu
                   </button>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                   <div className="flex gap-4">
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl h-fit">
                         <Shield size={24} />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-gray-900">Xác thực 2 lớp (2FA)</h3>
                         <p className="text-sm text-gray-500 mt-1 max-w-xl">Tăng cường bảo mật cho tài khoản quản trị viên bằng cách yêu cầu mã xác thực từ điện thoại khi đăng nhập.</p>
                      </div>
                   </div>
                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Kích hoạt ngay
                   </button>
                </div>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài Đặt</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hệ thống và tùy chọn cá nhân.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'general', label: 'Thông tin chung', icon: Building },
          { id: 'notifications', label: 'Thông báo', icon: Bell },
          { id: 'security', label: 'Bảo mật & Quyền', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
