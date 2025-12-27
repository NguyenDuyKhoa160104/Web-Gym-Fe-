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
    AlertTriangle,
    Package,
    Star,
    MessageSquare
} from 'lucide-react';

// --- HELPER: API CONFIG ---
const getApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env.VITE_API_URL_CLIENT || "http://localhost:5000/api/client";
        }
    } catch (e) { }
    return "http://localhost:5000/api/client";
};

const API_URL = getApiUrl();

// --- CONSTANTS ---
const ORDER_STATUS = {
    PENDING: 0,
    COMPLETED: 1,
    CANCELLED: 2
};

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
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 border ${type === 'success'
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

    // History State
    const [bookingHistory, setBookingHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // UI State for Modals/Toasts
    const [notification, setNotification] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState('');

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ packageId: '', packageName: '', rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    const notify = (message, type = 'success') => {
        setNotification({ message, type });
    };

    // --- HELPER FUNCTIONS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const calculateExpiry = (orderDate, durationDays) => {
        if (!orderDate || !durationDays) return null;
        const date = new Date(orderDate);
        date.setDate(date.getDate() + durationDays);
        return date;
    };

    // --- 1. FETCH PROFILE DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const token = localStorage.getItem('tokenClient');
                // Gọi API không cần ID params (dựa trên cấu hình trước đó)
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
                console.warn("Fetch profile error:", err);
                setError("Không thể kết nối Server. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // --- 1.1 FETCH HISTORY DATA ---
    useEffect(() => {
        if (activeTab === 'history' && userData?._id) {
            const fetchHistory = async () => {
                setIsLoadingHistory(true);
                try {
                    const token = localStorage.getItem('tokenClient');
                    // API yêu cầu method POST và id trên URL theo đề bài
                    const response = await fetch(`${API_URL}/my-orders/${userData._id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Sắp xếp đơn mới nhất lên đầu
                        const sortedData = (result.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setBookingHistory(sortedData);
                    }
                } catch (err) {
                    console.error("Fetch history error:", err);
                    notify("Không thể tải lịch sử đơn hàng", "error");
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [activeTab, userData]);

    // --- 2. UPDATE PROFILE HANDLER ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('tokenClient');
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
                setUserData(prev => ({ ...prev, ...result.data }));
            } else {
                notify(result.message || "Cập nhật thất bại.", "error");
            }
        } catch (err) {
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
            notify("Lỗi khi cập nhật ảnh đại diện", "error");
        }
    };

    // --- 4. REVIEW HANDLER ---
    const openReviewModal = (packageId, packageName) => {
        setReviewData({ packageId, packageName, rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!userData?._id) return;
        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem('tokenClient');
            const response = await fetch(`${API_URL}/review-package/${userData._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    packageId: reviewData.packageId,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                notify("Gửi đánh giá thành công! Cảm ơn bạn.", "success");
                setShowReviewModal(false);
            } else {
                notify(result.message || "Không thể gửi đánh giá.", "error");
            }
        } catch (err) {
            console.error(err);
            notify("Lỗi kết nối khi gửi đánh giá.", "error");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // --- 5. LOGOUT HANDLER ---
    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('tokenClient');
        localStorage.removeItem('clientId');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
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

            {/* Review Modal */}
            <Modal isOpen={showReviewModal} title="Đánh giá gói tập" onClose={() => setShowReviewModal(false)}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-300">
                        Bạn cảm thấy thế nào về gói tập <strong className="text-red-500">{reviewData.packageName}</strong>?
                    </p>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    size={32}
                                    className={`${star <= reviewData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="text-center text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                        {reviewData.rating === 5 ? 'Tuyệt vời!' : reviewData.rating === 4 ? 'Rất tốt' : reviewData.rating === 3 ? 'Bình thường' : reviewData.rating === 2 ? 'Tệ' : 'Rất tệ'}
                    </div>

                    <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Chia sẻ trải nghiệm của bạn (tùy chọn)..."
                        rows="4"
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 resize-none text-sm"
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-bold uppercase"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={submitReview}
                            disabled={isSubmittingReview}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-bold uppercase shadow-lg shadow-red-900/20 flex items-center gap-2"
                        >
                            {isSubmittingReview && <Loader2 className="animate-spin" size={14} />}
                            Gửi đánh giá
                        </button>
                    </div>
                </div>
            </Modal>

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

                            {/* 2. HISTORY TAB - REVISED */}
                            {activeTab === 'history' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                                        <History className="text-red-600" /> Lịch sử giao dịch
                                    </h3>

                                    {isLoadingHistory ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="animate-spin text-red-600" size={32} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookingHistory.length > 0 ? (
                                                bookingHistory.map((order) => {
                                                    // Determine Status Label and Class
                                                    let statusLabel = 'Không xác định';
                                                    let statusClass = 'bg-gray-700/50 text-gray-500 border-gray-700';

                                                    if (order.status === ORDER_STATUS.PENDING) {
                                                        statusLabel = 'Chờ duyệt';
                                                        statusClass = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                                                    } else if (order.status === ORDER_STATUS.CANCELLED) {
                                                        statusLabel = 'Đã hủy';
                                                        statusClass = 'bg-red-500/10 text-red-500 border border-red-500/20';
                                                    } else if (order.status === ORDER_STATUS.COMPLETED) {
                                                        statusLabel = 'Hoàn thành';
                                                        statusClass = 'bg-green-500/10 text-green-500 border border-green-500/20';
                                                    }

                                                    return (
                                                        <div key={order._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-4">
                                                            {/* Order Header */}
                                                            <div className="p-4 bg-gray-800/50 flex flex-wrap justify-between items-center gap-4 border-b border-gray-800">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClass}`}>
                                                                        {statusLabel}
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">#{order._id.substring(0, 8)}</span>
                                                                    <span className="text-xs text-gray-500">• {formatDate(order.orderDate)}</span>
                                                                </div>
                                                                <div className="font-black text-white">{formatCurrency(order.totalAmount)}</div>
                                                            </div>

                                                            {/* Package List */}
                                                            <div className="p-4 space-y-3">
                                                                {order.details && order.details.length > 0 ? (
                                                                    order.details.map((detail, index) => {
                                                                        const packageName = detail.package?.name || `Gói tập ${detail.durationAtPurchase} ngày`;
                                                                        const packageId = detail.package?._id;
                                                                        const expiryDate = calculateExpiry(order.orderDate, detail.durationAtPurchase);

                                                                        return (
                                                                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-gray-800/50">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="p-2 bg-gray-800 rounded-lg text-red-500 shrink-0">
                                                                                        <Dumbbell size={20} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4 className="font-bold text-white text-sm">{packageName}</h4>
                                                                                        <p className="text-xs text-gray-400 mt-0.5">Thời hạn: {detail.durationAtPurchase} ngày</p>
                                                                                        {expiryDate && (
                                                                                            <p className="text-xs text-gray-500">Hết hạn: {formatDate(expiryDate)}</p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Action Buttons */}
                                                                                {order.status === ORDER_STATUS.COMPLETED && packageId && (
                                                                                    <button
                                                                                        onClick={() => openReviewModal(packageId, packageName)}
                                                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all text-xs font-bold uppercase tracking-wide shrink-0 border border-yellow-500/20 hover:border-transparent"
                                                                                    >
                                                                                        <Star size={14} />
                                                                                        Đánh giá
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })
                                                                ) : (
                                                                    <div className="text-center text-xs text-gray-500 italic py-2">
                                                                        Chi tiết gói tập đang cập nhật...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-10 text-gray-500">
                                                    <History size={48} className="mx-auto mb-4 opacity-50" />
                                                    <p>Bạn chưa có lịch sử giao dịch nào.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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