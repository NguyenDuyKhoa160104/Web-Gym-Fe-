import React, { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle,
    AlertOctagon,
    User,
    Eye,
    Loader2,
    Lock,
    Unlock,
    Ban,
    AlertTriangle,
    X,
    ShieldAlert
} from 'lucide-react';

/**
 * Xử lý an toàn để lấy URL API nhằm tránh lỗi "import.meta" 
 * trong các môi trường không hỗ trợ ESNext/Vite.
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
 * CONSTANTS: Khớp hoàn toàn với Backend
 * ACTIVE: 1, INACTIVE: 0, BANNED: -1
 */
const ACCOUNT_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
    BANNED: -1
};

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        member: null,
        newStatus: null,
        title: '',
        message: ''
    });

    const fetchMembers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${ADMIN_API_URL}/all-clients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
                }
            });

            const result = await response.json();
            if (result.success) {
                setMembers(result.data);
            } else {
                setError(result.message || "Không thể lấy danh sách hội viên");
            }
        } catch (err) {
            setError("Lỗi kết nối đến server: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    /**
     * LOGIC XỬ LÝ API (Đã tách endpoint)
     */
    const handleUpdateStatus = async () => {
        const { member, newStatus } = confirmModal;
        if (!member) return;

        setIsProcessing(true);
        try {
            let endpoint = "";
            let body = {};

            // Phân loại API dựa trên hành động
            if (newStatus === ACCOUNT_STATUS.BANNED) {
                // API 1: Cấm vĩnh viễn (Không cần body)
                endpoint = `${ADMIN_API_URL}/ban-customer/${member._id}`;
            } else {
                // API 2: Khóa hoặc Mở (Cần body chứa status mới)
                endpoint = `${ADMIN_API_URL}/lock-open-customer/${member._id}`;
                body = { newStatus };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`
                },
                // Chỉ gửi body nếu object không rỗng
                body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
            });

            const result = await response.json();

            if (result.success) {
                // Cập nhật UI ngay lập tức
                setMembers(prev => prev.map(m =>
                    m._id === member._id ? { ...m, status: newStatus } : m
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

    const openConfirmModal = (member, status) => {
        let title = '';
        let message = '';

        switch (status) {
            case ACCOUNT_STATUS.ACTIVE:
                title = 'Kích hoạt hội viên';
                message = `Bạn có chắc chắn muốn mở lại quyền truy cập cho ${member.fullname}?`;
                break;
            case ACCOUNT_STATUS.INACTIVE:
                title = 'Khóa hội viên';
                message = `Tạm thời đình chỉ hoạt động của ${member.fullname}? Họ sẽ không thể đăng nhập.`;
                break;
            case ACCOUNT_STATUS.BANNED:
                title = 'CẤM VĨNH VIỄN';
                message = `CẢNH BÁO: Hành động này sẽ chặn đứng mọi truy cập của ${member.fullname} mãi mãi. KHÔNG THỂ HOÀN TÁC!`;
                break;
            default: break;
        }

        setConfirmModal({
            isOpen: true,
            member,
            newStatus: status,
            title,
            message
        });
    };

    const getStatusBadge = (status) => {
        const s = Number(status);
        switch (s) {
            case ACCOUNT_STATUS.ACTIVE:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle size={12} /> Đang tập
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
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/30 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                        Quản lý hội viên
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">HD Fitness Security Console</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
                    <Plus size={16} /> Thêm hội viên
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex justify-between items-center animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 font-black uppercase"><ShieldAlert size={18} /><span>{error}</span></div>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full"><X size={18} /></button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-red-600 mb-2" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Members...</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                <th className="px-10 py-6">Hội viên</th>
                                <th className="px-6 py-6">Chỉ số hình thể</th>
                                <th className="px-6 py-6">Trạng thái</th>
                                <th className="px-10 py-6 text-right">Hành động quản trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {members.length > 0 ? (
                                members.map((member) => (
                                    <tr key={member._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 text-slate-800 font-black text-sm shadow-inner group-hover:scale-105 transition-transform">
                                                    {member.fullname?.charAt(0) || 'M'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm leading-none mb-1 group-hover:text-red-600 transition-colors">{member.fullname}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{member.health_info?.height}cm / {member.health_info?.weight}kg</span>
                                                <span className="text-[9px] text-slate-400 font-black uppercase italic">{member.health_info?.target || 'No Target'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {getStatusBadge(member.status)}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-3 items-center">
                                                {/* --- CỤM NÚT THAO TÁC (Đã xóa kiểm tra isSuperAdmin) --- */}
                                                {Number(member.status) !== ACCOUNT_STATUS.BANNED ? (
                                                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                                                        {/* Logic hiển thị nút Khóa/Mở */}
                                                        {Number(member.status) === ACCOUNT_STATUS.INACTIVE ? (
                                                            <button
                                                                onClick={() => openConfirmModal(member, ACCOUNT_STATUS.ACTIVE)}
                                                                className="p-2 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm hover:scale-110 active:scale-95"
                                                                title="Mở khóa tài khoản"
                                                            >
                                                                <Unlock size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openConfirmModal(member, ACCOUNT_STATUS.INACTIVE)}
                                                                className="p-2 bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm hover:scale-110 active:scale-95"
                                                                title="Khóa tài khoản"
                                                            >
                                                                <Lock size={18} />
                                                            </button>
                                                        )}

                                                        {/* Nút Cấm vĩnh viễn */}
                                                        <button
                                                            onClick={() => openConfirmModal(member, ACCOUNT_STATUS.BANNED)}
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

                                                {/* Nút xem chi tiết (Luôn hiện) */}
                                                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-slate-100">
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">
                                        No Database Records
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                                    Hủy bỏ
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

export default MemberManagement;