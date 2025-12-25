import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Edit,
    Trash2,
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Eye,
    Loader2,
    Phone,
    Star,
    Lock,
    Unlock,
    Ban,
    AlertOctagon,
    AlertTriangle,
    X,
    ShieldAlert
} from 'lucide-react';

/**
 * Helper lấy URL API an toàn
 */
const getAdminApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL_ADMIN) {
            return import.meta.env.VITE_API_URL_ADMIN;
        }
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL_ADMIN) {
            return process.env.REACT_APP_API_URL_ADMIN;
        }
    } catch (e) { }
    return "http://localhost:5000/api/admin";
};

const ADMIN_API_URL = getAdminApiUrl();

/**
 * CONSTANTS: Khớp hoàn toàn với Backend (tương tự Member)
 * ACTIVE: 1, INACTIVE: 0, BANNED: -1
 */
const ACCOUNT_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
    BANNED: -1
};

const CoachManagement = () => {
    // --- States ---
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // Loading cho modal confirm
    const [searchTerm, setSearchTerm] = useState('');
    const [specFilter, setSpecFilter] = useState('All');
    const [error, setError] = useState(null);

    // Kiểm tra quyền Super Admin từ localStorage
    const adminData = JSON.parse(localStorage.getItem('dataAdmin') || '{}');
    const isSuperAdmin = adminData.role === 'superadmin' || adminData.isSuperAdmin === true;

    // State cho Modal xác nhận
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        coach: null,
        newStatus: null,
        title: '',
        message: ''
    });

    // --- Fetch Data ---
    const fetchCoaches = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${ADMIN_API_URL}/all-coaches`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setCoaches(result.data);
            } else {
                setError(result.message || "Không thể lấy danh sách HLV");
            }
        } catch (err) {
            console.error("Error fetching coaches:", err);
            setError("Lỗi kết nối đến server: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoaches();
    }, []);

    // --- Logic Xử lý Trạng thái (Lock/Open/Ban) ---
    const handleUpdateStatus = async () => {
        const { coach, newStatus } = confirmModal;
        if (!coach) return;

        setIsProcessing(true);
        try {
            let endpoint = "";
            let body = {};

            // Phân loại API dựa trên hành động
            if (newStatus === ACCOUNT_STATUS.BANNED) {
                // API 1: Cấm vĩnh viễn (Không cần body)
                endpoint = `${ADMIN_API_URL}/ban-coach/${coach._id}`;
            } else {
                // API 2: Khóa hoặc Mở (Cần body chứa status mới)
                endpoint = `${ADMIN_API_URL}/lock-open-coach/${coach._id}`;
                body = { newStatus };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
                },
                // Chỉ gửi body nếu object không rỗng (trường hợp lock/open)
                body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
            });

            const result = await response.json();

            if (result.success) {
                // Cập nhật UI ngay lập tức
                setCoaches(prev => prev.map(c =>
                    c._id === coach._id ? { ...c, status: newStatus } : c
                ));
                setConfirmModal({ ...confirmModal, isOpen: false });
            } else {
                setError(result.message);
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        } catch (err) {
            setError("Lỗi hệ thống: " + err.message);
            setConfirmModal({ ...confirmModal, isOpen: false });
        } finally {
            setIsProcessing(false);
        }
    };

    const openConfirmModal = (coach, status) => {
        let title = '';
        let message = '';

        switch (status) {
            case ACCOUNT_STATUS.ACTIVE:
                title = 'Kích hoạt tài khoản Coach';
                message = `Bạn có chắc chắn muốn mở lại quyền truy cập cho HLV ${coach.fullname}?`;
                break;
            case ACCOUNT_STATUS.INACTIVE:
                title = 'Khóa tài khoản Coach';
                message = `Tạm thời đình chỉ hoạt động của HLV ${coach.fullname}? Họ sẽ không thể đăng nhập vào hệ thống.`;
                break;
            case ACCOUNT_STATUS.BANNED:
                title = 'CẤM VĨNH VIỄN';
                message = `CẢNH BÁO: Hành động này sẽ trục xuất HLV ${coach.fullname} khỏi hệ thống mãi mãi. KHÔNG THỂ HOÀN TÁC!`;
                break;
            default: break;
        }

        setConfirmModal({
            isOpen: true,
            coach,
            newStatus: status,
            title,
            message
        });
    };

    // --- Helpers ---

    const filteredCoaches = coaches.filter(coach => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (coach.fullname?.toLowerCase() || '').includes(searchLower) ||
            (coach.email?.toLowerCase() || '').includes(searchLower) ||
            (coach.phone || '').includes(searchLower);

        const matchesSpec = specFilter === 'All' || coach.specialty === specFilter;

        return matchesSearch && matchesSpec;
    });

    const uniqueSpecialties = [...new Set(coaches.map(c => c.specialty).filter(Boolean))];

    const getStatusBadge = (status) => {
        const s = Number(status);
        switch (s) {
            case ACCOUNT_STATUS.ACTIVE:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle size={12} /> Đang hoạt động
                    </span>
                );
            case ACCOUNT_STATUS.INACTIVE:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100">
                        <Lock size={12} /> Đã khóa
                    </span>
                );
            case ACCOUNT_STATUS.BANNED:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-md">
                        <AlertOctagon size={12} /> Đã cấm
                    </span>
                );
            default:
                return <span className="text-gray-400 text-[10px]">N/A</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                        Quản lý Huấn Luyện Viên
                        {!isSuperAdmin && <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full tracking-widest font-black uppercase">Staff</span>}
                    </h1>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">HD Fitness Management Console</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
                    <Plus size={16} />
                    <span>Thêm Coach mới</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex justify-between items-center animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 font-black uppercase"><ShieldAlert size={18} /><span>{error}</span></div>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full"><X size={18} /></button>
                </div>
            )}

            {/* Filters & Search Bar */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, sđt..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all shrink-0">
                        <Filter size={18} className="text-blue-600" />
                        <select
                            className="bg-transparent text-xs font-black uppercase text-slate-600 outline-none cursor-pointer tracking-wider"
                            value={specFilter}
                            onChange={(e) => setSpecFilter(e.target.value)}
                        >
                            <option value="All">Tất cả chuyên môn</option>
                            {uniqueSpecialties.map((spec, index) => (
                                <option key={index} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative">

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Coaches...</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                <th className="px-8 py-6">Thông tin Coach</th>
                                <th className="px-6 py-6">Chuyên môn</th>
                                <th className="px-6 py-6">Kinh nghiệm</th>
                                <th className="px-6 py-6">Trạng thái</th>
                                <th className="px-8 py-6 text-right">Hành động quản trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCoaches.length > 0 ? (
                                filteredCoaches.map((coach) => (
                                    <tr key={coach._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                                                    {coach.avatar_url && coach.avatar_url !== 'default-avatar.png' ? (
                                                        <img src={coach.avatar_url} alt={coach.fullname} className="w-full h-full object-cover" />
                                                    ) : (
                                                        coach.fullname?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm leading-none mb-1 group-hover:text-blue-600 transition-colors">{coach.fullname}</p>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                            <Mail size={10} /> {coach.email}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                            <Phone size={10} /> {coach.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                    {coach.specialty || 'Chưa cập nhật'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-slate-700">{coach.experience} năm</span>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter italic">Kinh nghiệm</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {getStatusBadge(coach.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 items-center">
                                                {/* --- CỤM NÚT THAO TÁC (Đã hiển thị mặc định) --- */}
                                                {Number(coach.status) !== ACCOUNT_STATUS.BANNED ? (
                                                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner animate-in slide-in-from-right-4 duration-300">
                                                        {/* Nút Khóa / Mở */}
                                                        {Number(coach.status) === ACCOUNT_STATUS.INACTIVE ? (
                                                            <button
                                                                onClick={() => openConfirmModal(coach, ACCOUNT_STATUS.ACTIVE)}
                                                                className="p-2 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm hover:scale-110 active:scale-95"
                                                                title="Mở khóa tài khoản"
                                                            >
                                                                <Unlock size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openConfirmModal(coach, ACCOUNT_STATUS.INACTIVE)}
                                                                className="p-2 bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm hover:scale-110 active:scale-95"
                                                                title="Khóa tài khoản"
                                                            >
                                                                <Lock size={18} />
                                                            </button>
                                                        )}

                                                        {/* Nút Cấm vĩnh viễn */}
                                                        <button
                                                            onClick={() => openConfirmModal(coach, ACCOUNT_STATUS.BANNED)}
                                                            className="p-2 bg-white text-slate-400 hover:text-white hover:bg-red-600 rounded-xl transition-all shadow-sm hover:scale-110 active:scale-95"
                                                            title="Ban vĩnh viễn"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-600 px-4 py-2 bg-red-50 rounded-2xl border border-red-100 shadow-sm opacity-80">
                                                        <ShieldAlert size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter italic">LOCKED FOREVER</span>
                                                    </div>
                                                )}

                                                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-xl transition-all ml-2 border border-transparent hover:border-slate-100">
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCoaches.length > 0 && (
                    <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Hiển thị <span className="font-black text-slate-800">{filteredCoaches.length}</span> kết quả
                        </span>
                        <div className="flex gap-2">
                            <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50" disabled>Trước</button>
                            <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50" disabled>Sau</button>
                        </div>
                    </div>
                )}
            </div>

            {/* CONFIRM MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => !isProcessing && setConfirmModal({ ...confirmModal, isOpen: false })}
                    ></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="p-8">
                            <div className="flex justify-center mb-6">
                                <div className={`p-6 rounded-[2rem] shadow-2xl ${confirmModal.newStatus === ACCOUNT_STATUS.BANNED
                                    ? 'bg-red-600 text-white shadow-red-200'
                                    : confirmModal.newStatus === ACCOUNT_STATUS.ACTIVE
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-slate-900 text-white shadow-slate-200'
                                    }`}>
                                    {confirmModal.newStatus === ACCOUNT_STATUS.BANNED ? <Ban size={40} /> : <ShieldAlert size={40} />}
                                </div>
                            </div>
                            <h3 className="text-center text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight uppercase">
                                {confirmModal.title}
                            </h3>
                            <p className="text-center text-slate-500 text-sm font-bold mb-8 px-2 leading-relaxed italic opacity-80 uppercase tracking-tighter">
                                "{confirmModal.message}"
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleUpdateStatus}
                                    className={`w-full py-4 text-xs font-black text-white rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest ${confirmModal.newStatus === ACCOUNT_STATUS.BANNED ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'
                                        }`}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Xác nhận thực hiện'}
                                </button>
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="w-full py-4 text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest"
                                    disabled={isProcessing}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                        <div className={`h-2.5 w-full ${confirmModal.newStatus === ACCOUNT_STATUS.ACTIVE ? 'bg-emerald-500' :
                            confirmModal.newStatus === ACCOUNT_STATUS.INACTIVE ? 'bg-amber-500' : 'bg-red-600'
                            }`}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachManagement;