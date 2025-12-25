import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Bell, Menu, LogOut, User,
    Settings, ChevronDown
} from 'lucide-react';

// Cấu hình URL API
const API_URL = import.meta.env?.VITE_API_URL_ADMIN || "http://localhost:5000/api/admin";

/**
 * Component Header: Quản lý thanh tiêu đề, tìm kiếm và menu người dùng
 */
const Header = ({ toggleSidebar, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const dropdownRef = useRef(null);

    // =================================================================
    // 1. LOGIC CHECK LOGIN & REDIRECT
    // =================================================================
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('tokenAdmin');

            // CASE 1: Không có token trong localStorage -> Chưa đăng nhập
            if (!token) {
                console.log("Không tìm thấy token, đang chuyển hướng về trang đăng nhập...");
                window.location.href = '/admin/login';
                return;
            }

            try {
                // CASE 2: Có token, gọi API kiểm tra tính hợp lệ
                const response = await fetch(`${API_URL}/check-login`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // Token hợp lệ -> Lưu dữ liệu và hiển thị
                    setCurrentUser(result.data);
                    localStorage.setItem('dataAdmin', JSON.stringify(result.data));
                    setIsLoading(false);
                } else {
                    // Token hết hạn hoặc không hợp lệ -> Xóa và Redirect
                    console.warn("Token không hợp lệ, đang đăng xuất...");
                    localStorage.removeItem('tokenAdmin');
                    localStorage.removeItem('dataAdmin');
                    window.location.href = '/admin/login';
                }
            } catch (error) {
                // Lỗi kết nối -> Coi như chưa đăng nhập -> Redirect
                console.error("Lỗi xác thực:", error);
                localStorage.removeItem('tokenAdmin');
                window.location.href = '/admin/login';
            }
        };

        checkLoginStatus();
    }, []);

    // Xử lý sự kiện click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        localStorage.removeItem('tokenAdmin');
        localStorage.removeItem('dataAdmin');

        if (onLogout) onLogout();
        else window.location.href = '/admin/login';
    };

    return (
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-20 flex-shrink-0 sticky top-0 border-b border-slate-100">
            {/* KHU VỰC TRÁI */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 mr-4 transition-colors focus:outline-none"
                >
                    <Menu size={24} />
                </button>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm hội viên, gói tập..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
                    />
                </div>
            </div>

            {/* KHU VỰC PHẢI */}
            <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none">
                    <Bell size={22} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* LOGIC HIỂN THỊ UI:
                    - Nếu đang load hoặc chưa có user (đang redirect) -> Hiện skeleton loading
                    - Nếu đã có user -> Hiện Profile Dropdown
                */}

                {isLoading || !currentUser ? (
                    <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse"></div>
                ) : (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-all focus:outline-none group"
                        >
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                                {currentUser.fullname?.charAt(0).toUpperCase() || 'A'}
                            </div>

                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-slate-700 leading-tight">{currentUser.fullname}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                    {currentUser.role_level === 0 ? 'Super Admin' : 'Manager'}
                                </p>
                            </div>

                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                    <p className="text-xs text-slate-400">Email quản trị</p>
                                    <p className="text-sm font-medium text-slate-600 truncate">{currentUser.email}</p>
                                </div>

                                <button className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                    <User size={16} className="mr-3" /> Hồ sơ cá nhân
                                </button>

                                <button className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                    <Settings size={16} className="mr-3" /> Cài đặt hệ thống
                                </button>

                                <div className="border-t border-slate-50 mt-1 pt-1">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold"
                                    >
                                        <LogOut size={16} className="mr-3" /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;