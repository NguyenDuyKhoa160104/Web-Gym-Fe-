import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';

const API_URL = "http://localhost:5000/api/client";

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [navBg, setNavBg] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [isLoginned, setIsLoginned] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // =================================================================
    // 1. LOGIC CHECK LOGIN (Xác thực hội viên khi tải component)
    // =================================================================
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('tokenClient');

            if (!token) {
                setIsLoginned(false);
                setClientData(null);
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

                if (result.success) {
                    setIsLoginned(true);
                    setClientData(result.data);
                    // Cập nhật lại dữ liệu cache
                    localStorage.setItem('dataClient', JSON.stringify(result.data));
                } else {
                    // Token hết hạn
                    handleLogout();
                }
            } catch (error) {
                console.error("Lỗi xác thực Header:", error);
                setIsLoginned(false);
            }
        };

        checkAuth();
    }, [location.pathname]); // Kiểm tra lại mỗi khi đổi trang

    // Hiệu ứng cuộn trang cho Navbar
    useEffect(() => {
        const isHomePage = location.pathname === '/';
        const handleScroll = () => {
            if (isHomePage) {
                setNavBg(window.scrollY > 50);
            }
        };

        if (isHomePage) {
            setNavBg(window.scrollY > 50);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        } else {
            setNavBg(true);
        }
    }, [location.pathname]);

    // Xử lý click ra ngoài để đóng dropdown profile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('tokenClient');
        localStorage.removeItem('dataClient');
        setIsLoginned(false);
        setClientData(null);
        setMobileMenuOpen(false);
        setIsProfileOpen(false);
        navigate('/login');
    };

    const navLinks = [
        { to: '/', text: 'Trang chủ' },
        { to: '/packages', text: 'Gói tập' },
        { to: '/pt', text: 'HLV Cá nhân' },
        { to: '#', text: 'Lịch tập' },
    ];

    const getLinkClass = (path) => {
        return location.pathname === path
            ? 'text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider'
            : 'text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider';
    };

    const getMobileLinkClass = (path) => {
        return location.pathname === path
            ? 'text-white bg-red-600 block px-3 py-2 rounded-md text-base font-medium'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium';
    }

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg ? 'bg-gray-900 shadow-lg bg-opacity-95 border-b border-gray-800' : 'bg-transparent'}`} id="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex-shrink-0 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                        <span className="text-3xl font-bold text-red-500 brand-font italic">HD</span>
                        <span className="text-3xl font-bold text-white brand-font italic">FITNESS</span>
                    </Link>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            {navLinks.map(link => (
                                <Link key={link.to} to={link.to} className={getLinkClass(link.to)}>{link.text}</Link>
                            ))}

                            {/* HIỂN THỊ DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP */}
                            {isLoginned ? (
                                <div className="relative ml-4" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-3 text-white bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-full transition-all border border-gray-700"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                                            {clientData?.fullname?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-medium max-w-[120px] truncate">{clientData?.fullname}</span>
                                        <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                                            <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                                                <User size={16} className="mr-3 text-red-500" /> Hồ sơ cá nhân
                                            </Link>
                                            <div className="border-t border-gray-800 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-bold"
                                            >
                                                <LogOut size={16} className="mr-3" /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link to="/login" className="text-gray-300 hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">Đăng nhập</Link>
                                    <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-md text-sm font-bold uppercase transition-all transform hover:scale-105">Đăng Ký</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900 border-t border-gray-800 animate-in slide-in-from-top duration-300`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} className={getMobileLinkClass(link.to)} onClick={() => setMobileMenuOpen(false)}>{link.text}</Link>
                    ))}

                    <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
                        {isLoginned ? (
                            <>
                                <div className="px-3 py-2 flex items-center space-x-3 text-white mb-2">
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                                        {clientData?.fullname?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{clientData?.fullname}</span>
                                        <span className="text-xs text-gray-400 truncate">{clientData?.email}</span>
                                    </div>
                                </div>
                                <Link to="/profile" className="block text-center w-full bg-gray-800 text-white px-5 py-3 rounded-md text-base font-medium uppercase" onClick={() => setMobileMenuOpen(false)}>Hồ sơ cá nhân</Link>
                                <button
                                    onClick={handleLogout}
                                    className="block text-center w-full bg-red-600/10 text-red-500 border border-red-500/20 px-5 py-3 rounded-md text-base font-bold uppercase transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-center w-full bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-md text-base font-medium uppercase transition-colors" onClick={() => setMobileMenuOpen(false)}>Đăng Nhập</Link>
                                <Link to="/register" className="block text-center w-full bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md text-base font-medium uppercase transition-colors" onClick={() => setMobileMenuOpen(false)}>Đăng Ký</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;