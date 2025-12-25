import React, { useState, useEffect } from 'react';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    History,
    Settings,
    LogOut,
    Camera,
    Activity,
    TrendingUp,
    Clock,
    ChevronRight,
    QrCode,
    Dumbbell,
    Shield,
    Edit2,
    Loader2,
    Save,
    AlertCircle,
    X,
    Check,
    AlertTriangle
} from 'lucide-react';

// --- HELPER: API CONFIG ---
const getApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // Biến môi trường đã bao gồm /api/client
            return import.meta.env.VITE_API_URL_CLIENT || "http://localhost:5000/api/client";
        }
    } catch (e) { }
    // Fallback mặc định cũng trỏ thẳng vào endpoint client
    return "http://localhost:5000/api/client";
};

const API_URL = getApiUrl();

// --- MOCK DATA (Giữ lại cho các phần chưa có API Backend) ---
const BOOKING_HISTORY = [
    { id: 1, name: "Gói 12 Tháng (VIP)", date: "20/11/2025", price: "4.500.000đ", status: "Active", expire: "20/11/2026" },
    { id: 2, name: "Gói 3 Tháng (Cơ bản)", date: "15/08/2025", price: "1.200.000đ", status: "Expired", expire: "15/11/2025" },
];

const UPCOMING_CLASSES = [
    { id: 1, name: "Yoga Cơ Bản", time: "07:00 - 08:00", date: "Hôm nay", instructor: "Cô Lan", room: "Studio 1" },
    { id: 2, name: "Body Pump", time: "18:00 - 19:00", date: "Ngày mai", instructor: "HLV Tuấn", room: "Studio 2" },
];

const BODY_METRICS = [
    { month: "T9", weight: 78 },
    { month: "T10", weight: 77 },
    { month: "T11", weight: 76 },
    { month: "T12", weight: 75 },
];

// --- UI COMPONENTS FOR NOTIFICATIONS/MODALS ---

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 border ${type === 'success'
                ? 'bg-green-900/90 text-green-100 border-green-700'
                : 'bg-red-900/90 text-red-100 border-red-700'
            }`}>
            {type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-75"><X size={16} /></button>
        </div>
    );
};

const Modal = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const CustomerProfile = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // UI State for Modals/Toasts
    const [notification, setNotification] = useState(null); // { message, type }
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: 'Nam',
        height: 0,
        weight: 0,
        target: ''
    });

    // Helper to show notification
    const notify = (message, type = 'success') => {
        setNotification({ message, type });
    };

    // --- 1. FETCH PROFILE DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const token = localStorage.getItem('tokenClient');
                if (!token) {
                    // Silent fail or redirect handled by parent usually
                }

                const response = await fetch(`${API_URL}/my-profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const result = await response.json();

                if (response.ok && result.success) {
                    setUserData(result.data);

                    setFormData({
                        fullname: result.data.fullname || '',
                        phone: result.data.phone || '',
                        address: result.data.address || '',
                        date_of_birth: result.data.date_of_birth ? result.data.date_of_birth.split('T')[0] : '',
                        gender: result.data.gender || 'Nam',
                        height: result.data.health_info?.height || 0,
                        weight: result.data.health_info?.weight || 0,
                        target: result.data.health_info?.target || ''
                    });
                } else {
                    throw new Error(result.message || "Lỗi API");
                }
            } catch (err) {
                console.warn("Đang sử dụng dữ liệu mẫu do lỗi kết nối:", err);
                setError("Không thể kết nối Server. Đang hiển thị chế độ xem trước.");

                // --- FALLBACK MOCK DATA ---
                const mockData = {
                    _id: "694d4addcea94596301f14c1",
                    fullname: "Nguyễn Văn A (Demo)",
                    email: "client1@gmail.com",
                    phone: "0901234567",
                    address: "TP. Hồ Chí Minh",
                    date_of_birth: "1995-01-01",
                    gender: "Nam",
                    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
                    status: 1,
                    health_info: {
                        height: 175,
                        weight: 70,
                        target: "Tăng cơ"
                    }
                };
                setUserData(mockData);
                setFormData({
                    fullname: mockData.fullname,
                    phone: mockData.phone,
                    address: mockData.address,
                    date_of_birth: mockData.date_of_birth,
                    gender: mockData.gender,
                    height: mockData.health_info.height,
                    weight: mockData.health_info.weight,
                    target: mockData.health_info.target
                });

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // --- 2. UPDATE PROFILE HANDLER ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('tokenClient');

            // Mock Update
            if (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                notify("Đã cập nhật thông tin (Chế độ xem trước)", "success");
                setUserData(prev => ({
                    ...prev,
                    ...formData,
                    health_info: {
                        height: Number(formData.height),
                        weight: Number(formData.weight),
                        target: formData.target
                    }
                }));
                setIsSaving(false);
                return;
            }

            const payload = {
                fullname: formData.fullname,
                phone: formData.phone,
                address: formData.address,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                health_info: {
                    height: Number(formData.height),
                    weight: Number(formData.weight),
                    target: formData.target
                }
            };

            const response = await fetch(`${API_URL}/update-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                notify("Cập nhật thông tin thành công!", "success");
                setUserData(prev => ({
                    ...prev,
                    ...result.data
                }));
            } else {
                notify(result.message || "Cập nhật thất bại.", "error");
            }
        } catch (err) {
            console.error("Update error:", err);
            notify("Lỗi kết nối đến máy chủ.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 3. UPDATE AVATAR HANDLER ---
    const handleAvatarClick = () => {
        setTempAvatarUrl(userData?.avatar_url || '');
        setShowAvatarModal(true);
    };

    const handleAvatarSubmit = async () => {
        // Mock update
        if (error) {
            setUserData(prev => ({ ...prev, avatar_url: tempAvatarUrl }));
            notify("Đã đổi ảnh đại diện (Chế độ xem trước)", "success");
            setShowAvatarModal(false);
            return;
        }

        try {
            const token = localStorage.getItem('tokenClient');

            const response = await fetch(`${API_URL}/update-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ avatar_url: tempAvatarUrl })
            });
            const result = await response.json();
            if (result.success) {
                setUserData(prev => ({ ...prev, avatar_url: tempAvatarUrl }));
                notify("Cập nhật ảnh đại diện thành công!", "success");
                setShowAvatarModal(false);
            } else {
                notify(result.message, "error");
            }
        } catch (err) {
            console.error(err);
            notify("Lỗi khi cập nhật ảnh đại diện", "error");
        }
    };

    // --- 4. LOGOUT HANDLER ---
    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Xóa token và thông tin liên quan
        localStorage.removeItem('tokenClient');
        localStorage.removeItem('clientId');
        localStorage.removeItem('user');

        // Đóng modal
        setShowLogoutModal(false);

        // Chuyển hướng thẳng về trang đăng nhập
        window.location.href = '/login';
    };

    // --- SUB-COMPONENTS ---
    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-300 ${activeTab === id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
            {activeTab === id && <ChevronRight size={16} className="ml-auto" />}
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-red-600" size={48} />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-black text-gray-100 p-8 flex flex-col items-center justify-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Không thể tải thông tin hồ sơ</h2>
                <p className="text-gray-400 mb-6 text-center">{error || "Vui lòng kiểm tra kết nối hoặc đăng nhập lại."}</p>
                <button onClick={onBack} className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-gray-100 font-sans relative">
            {/* Notifications & Modals */}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Avatar Modal */}
            <Modal isOpen={showAvatarModal} title="Đổi ảnh đại diện" onClose={() => setShowAvatarModal(false)}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Nhập đường dẫn URL hình ảnh mới của bạn:</p>
                    <input
                        type="text"
                        value={tempAvatarUrl}
                        onChange={(e) => setTempAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-bold uppercase"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAvatarSubmit}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-bold uppercase shadow-lg shadow-red-900/20"
                        >
                            Lưu ảnh
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Logout Modal */}
            <Modal isOpen={showLogoutModal} title="Xác nhận đăng xuất" onClose={() => setShowLogoutModal(false)}>
                <div className="space-y-4">
                    <p className="text-gray-300">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-bold uppercase"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-bold uppercase shadow-lg shadow-red-900/20"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb / Back */}
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-white mb-8 transition-colors group">
                    <ChevronRight size={20} className="rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Quay lại trang chủ
                </button>

                {error && (
                    <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-3 text-sm animate-pulse">
                        <AlertCircle size={16} />
                        <span>{error} - Đang hiển thị dữ liệu mẫu để demo.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT SIDEBAR: USER INFO & NAV --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* User Card */}
                        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-900 to-red-600 opacity-20"></div>

                            <div className="relative flex flex-col items-center">
                                <div
                                    className="w-28 h-28 rounded-full border-4 border-gray-900 shadow-2xl overflow-hidden mb-4 relative z-10 cursor-pointer group-hover:border-red-600 transition-colors"
                                    onClick={handleAvatarClick}
                                    title="Nhấn để đổi ảnh đại diện"
                                >
                                    <img src={userData.avatar_url || "https://placehold.co/200x200?text=No+Avatar"} alt="User" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-white mb-1 text-center">{userData.fullname || "Chưa cập nhật tên"}</h2>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
                                        {userData.status === 1 ? 'Active Member' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate max-w-[150px]">ID: {userData._id ? userData._id.substring(0, 8) : '...'}...</span>
                                </div>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className="mt-2 mb-6 px-6 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/50 rounded-full text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={14} /> Chỉnh sửa hồ sơ
                                </button>

                                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-6 border-t border-gray-800">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-white">{userData.health_info?.height || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Cm</div>
                                    </div>
                                    <div className="text-center border-l border-gray-800">
                                        <div className="text-xl font-bold text-white">{userData.health_info?.weight || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Kg</div>
                                    </div>
                                    <div className="text-center border-l border-gray-800">
                                        <div className="text-xl font-bold text-white truncate px-1">{userData.health_info?.target || "-"}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Mục tiêu</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="bg-gray-900 rounded-3xl p-4 border border-gray-800 shadow-xl space-y-2">
                            <TabButton id="overview" icon={Activity} label="Tổng quan" />
                            <TabButton id="schedule" icon={Calendar} label="Lịch tập của tôi" />
                            <TabButton id="history" icon={History} label="Lịch sử gói tập" />
                            <TabButton id="settings" icon={Settings} label="Cài đặt tài khoản" />
                            <div className="pt-4 mt-4 border-t border-gray-800">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span className="font-bold text-sm uppercase tracking-wide">Đăng xuất</span>
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* --- RIGHT CONTENT AREA --- */}
                    <div className="lg:col-span-8">
                        <div className="bg-gray-900 rounded-3xl min-h-[600px] border border-gray-800 p-6 md:p-8 shadow-2xl">

                            {/* 1. OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                                        <Activity className="text-red-600" /> Tổng quan
                                    </h3>

                                    {/* QR Code Card */}
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-2">Thẻ thành viên điện tử</h4>
                                            <p className="text-sm text-gray-400 mb-4">Sử dụng mã QR này để check-in tại quầy lễ tân.</p>
                                            <div className="text-xs text-gray-500 font-mono">Mã số: {userData._id}</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl">
                                            <QrCode size={120} className="text-black" />
                                        </div>
                                    </div>

                                    {/* Personal Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                            <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2 mb-2">
                                                <Mail size={14} className="text-red-500" /> Email
                                            </span>
                                            <div className="text-base font-bold text-white truncate" title={userData.email}>{userData.email}</div>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                            <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2 mb-2">
                                                <Phone size={14} className="text-red-500" /> Số điện thoại
                                            </span>
                                            <div className="text-base font-bold text-white">{userData.phone}</div>
                                        </div>
                                    </div>

                                    {/* Body Metrics Chart (Mock) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-white">Theo dõi cân nặng</h4>
                                            <button onClick={() => setActiveTab('settings')} className="text-xs text-red-500 font-bold uppercase hover:underline">Cập nhật</button>
                                        </div>
                                        <div className="h-48 bg-gray-950 rounded-xl border border-gray-800 p-4 flex items-end justify-around gap-2">
                                            {BODY_METRICS.map((item, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                                                    <div
                                                        className="w-full max-w-[40px] bg-red-600/20 border border-red-600 rounded-t-lg relative group-hover:bg-red-600 transition-all duration-300"
                                                        style={{ height: `${(item.weight / 100) * 200}px` }}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {item.weight}kg
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-bold">{item.month}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. HISTORY TAB */}
                            {activeTab === 'history' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                                        <History className="text-red-600" /> Lịch sử giao dịch
                                    </h3>
                                    <div className="space-y-4">
                                        {BOOKING_HISTORY.map((item) => (
                                            <div key={item.id} className="bg-black/40 p-5 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-600/50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-gray-800 rounded-xl text-red-500">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                                        <p className="text-sm text-gray-400 mt-1">Ngày đăng ký: {item.date}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Hết hạn: {item.expire}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                                                    <div className="font-black text-xl text-white">{item.price}</div>
                                                    <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-700/50 text-gray-500'
                                                        }`}>
                                                        {item.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. SCHEDULE TAB */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                                        <Calendar className="text-red-600" /> Lịch tập sắp tới
                                    </h3>
                                    {UPCOMING_CLASSES.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {UPCOMING_CLASSES.map((cls) => (
                                                <div key={cls.id} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-3">
                                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{cls.date}</span>
                                                    </div>
                                                    <h4 className="font-bold text-white text-lg mb-1">{cls.name}</h4>
                                                    <div className="text-red-500 text-sm font-bold mb-4">{cls.time}</div>

                                                    <div className="space-y-2 text-sm text-gray-400">
                                                        <div className="flex items-center gap-2"><User size={14} /> {cls.instructor}</div>
                                                        <div className="flex items-center gap-2"><MapPin size={14} /> {cls.room}</div>
                                                    </div>

                                                    <button className="w-full mt-4 py-2 border border-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors">
                                                        Hủy lịch
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer min-h-[200px]">
                                                <Calendar size={32} className="mb-2" />
                                                <span className="font-bold uppercase text-sm">Đăng ký lớp mới</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>Bạn chưa đăng ký lớp học nào.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 4. SETTINGS TAB - FULLY INTEGRATED */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                                        <Settings className="text-red-600" /> Cài đặt tài khoản
                                    </h3>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Họ và tên</label>
                                                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-colors">
                                                    <User size={18} className="text-gray-500 mr-3" />
                                                    <input
                                                        type="text"
                                                        value={formData.fullname}
                                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                                        className="bg-transparent border-none text-white w-full focus:outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
                                                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-colors">
                                                    <Phone size={18} className="text-gray-500 mr-3" />
                                                    <input
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="bg-transparent border-none text-white w-full focus:outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Email (Không thể thay đổi)</label>
                                                <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 cursor-not-allowed">
                                                    <Mail size={18} className="text-gray-500 mr-3" />
                                                    <input
                                                        type="email"
                                                        value={userData.email || ''}
                                                        disabled
                                                        className="bg-transparent border-none text-gray-500 w-full focus:outline-none cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            {/* New Field: Gender */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Giới tính</label>
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 appearance-none"
                                                >
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>

                                            {/* New Field: DOB */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Ngày sinh</label>
                                                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-colors">
                                                    <Calendar size={18} className="text-gray-500 mr-3" />
                                                    <input
                                                        type="date"
                                                        value={formData.date_of_birth}
                                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                                        className="bg-transparent border-none text-white w-full focus:outline-none [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ</label>
                                                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-colors">
                                                    <MapPin size={18} className="text-gray-500 mr-3" />
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        placeholder="Nhập địa chỉ của bạn"
                                                        className="bg-transparent border-none text-white w-full focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-800">
                                            <h4 className="font-bold text-white mb-4">Thông tin sức khỏe</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Chiều cao (cm)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.height}
                                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                        className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 w-full"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Cân nặng (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.weight}
                                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                        className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 w-full"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Mục tiêu</label>
                                                    <input
                                                        type="text"
                                                        value={formData.target}
                                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                                        className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('overview')}
                                                className="px-6 py-3 rounded-xl border border-gray-700 text-white font-bold uppercase text-xs hover:bg-gray-800 transition-colors"
                                            >
                                                Hủy bỏ
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold uppercase text-xs hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;