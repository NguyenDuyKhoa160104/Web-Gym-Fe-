import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, Search, LogOut,
  Loader2, User, Mail, ShieldCheck
} from 'lucide-react';

/**
 * COMPONENT: COACH HEADER
 * Tích hợp sẵn logic checkLogin và logout
 */
export const CoachHeader = ({ onMenuClick, title = "Bảng điều khiển" }) => {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/coach";

  // 1. Logic Kiểm tra đăng nhập (check-login)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('tokenCoach');

      // Nếu không có token, đẩy về trang login ngay lập tức
      if (!token) {
        window.location.href = '/coach/login';
        return;
      }

      try {
        const response = await fetch(`${API_URL}/check-login`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Lưu dữ liệu coach vào state để hiển thị trên Header
          setCoach(result.data);
          localStorage.setItem('dataCoach', JSON.stringify(result.data));
        } else {
          // Nếu token sai/hết hạn thì xóa token và đẩy về login
          handleLogout();
        }
      } catch (error) {
        console.error("Lỗi xác thực Header:", error);
        // Có thể hiển thị thông báo lỗi nhẹ ở đây thay vì crash trang
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. Logic Đăng xuất (Logout)
  const handleLogout = () => {
    localStorage.removeItem('tokenCoach');
    localStorage.removeItem('dataCoach');
    // Đẩy về trang đăng nhập
    window.location.href = '/coach/login';
  };

  // Helper: Lấy chữ cái đầu của tên
  const getInitials = (name) => name ? name.split(' ').pop().charAt(0).toUpperCase() : '?';

  // Hiển thị trạng thái đang kiểm tra quyền truy cập
  if (loading) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs font-medium uppercase tracking-wider">Đang xác thực...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Cụm bên trái: Menu & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black italic text-sm">HD</div>
          <h1 className="text-lg font-bold text-slate-800 hidden sm:block">{title}</h1>
        </div>
      </div>

      {/* Cụm bên phải: Search, Thông báo & Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search Bar (Ẩn trên mobile) */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-48 lg:w-64 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-700"
          />
        </div>

        {/* Notification */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile Area */}
        <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-slate-200 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
              {coach?.fullname || 'Coach'}
            </p>
            <p className="text-[10px] uppercase tracking-tighter text-blue-600 font-bold flex items-center justify-end gap-1">
              <ShieldCheck size={10} /> Certified Coach
            </p>
          </div>

          {/* Avatar Profile */}
          <div className="h-9 w-9 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold border border-slate-200 shadow-sm overflow-hidden group cursor-pointer relative">
            {coach?.avatar_url && coach.avatar_url !== 'default-avatar.png' ? (
              <img src={coach.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(coach?.fullname)
            )}
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
            title="Đăng xuất"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Default export để bạn dễ dàng sử dụng trong App.jsx
export default CoachHeader;