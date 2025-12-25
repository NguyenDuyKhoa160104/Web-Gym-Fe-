import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Package,
    CreditCard,
    ShoppingCart,
    Check,
    Trash2,
    X,
    Printer,
    RotateCcw,
    Loader2,
    AlertCircle,
    DatabaseZap,
    Phone,
    Info,
    ChevronLeft,
    ChevronRight,
    Mail,
    Calendar,
    User
} from 'lucide-react';

// Sử dụng biến môi trường: http://localhost:5000/api/admin
const API_ADMIN = import.meta.env.VITE_API_URL_ADMIN || 'http://localhost:5000/api/admin';

// Cấu hình Trạng thái đơn hàng (Mapping từ JSON status)
const STATUS_MAP = {
    0: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> },
    1: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <CheckCircle2 size={14} /> },
    2: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <Package size={14} /> },
    3: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={14} /> }
};

// Cấu hình Trạng thái thanh toán (Mapping từ JSON paymentStatus)
const PAYMENT_MAP = {
    0: { label: 'Chưa thu', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    1: { label: 'Đã thu tiền', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' },
    2: { label: 'Đã hoàn tiền', color: 'bg-rose-50 text-rose-600 border-rose-100' }
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Toast notification
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotice = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    /**
     * FETCH DATA TỪ API THẬT
     */
    const fetchOrders = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('tokenAdmin');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(`${API_ADMIN}/orders`, { headers });
            const result = await response.json();

            if (result.success) {
                // Dựa vào JSON bạn gửi: data là mảng các đơn hàng
                setOrders(result.data || []);
            } else {
                showNotice(result.message || "Lỗi tải danh sách đơn hàng", "error");
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            showNotice("Không thể kết nối tới máy chủ", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /**
     * Logic lọc dữ liệu phía Client (Search & Filter)
     */
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const customerName = o.client?.fullname?.toLowerCase() || '';
            const orderId = o._id?.toLowerCase() || '';
            const matchSearch = customerName.includes(searchTerm.toLowerCase()) || orderId.includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'all' || o.status?.toString() === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleOpenDetail = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 text-center">
                <div className="relative">
                    <Loader2 className="animate-spin text-blue-600" size={56} />
                    <ShoppingCart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 opacity-20" size={24} />
                </div>
                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">Đang đồng bộ dữ liệu giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700 text-left font-sans text-slate-900">

            {/* Toast Notification */}
            {notification.show && (
                <div className={`fixed top-8 right-8 z-[110] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 border backdrop-blur-md ${notification.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-700' : 'bg-emerald-50/90 border-emerald-200 text-emerald-700'
                    }`}>
                    {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <p className="font-bold text-sm tracking-tight">{notification.message}</p>
                    <button onClick={() => setNotification({ ...notification, show: false })} className="ml-2 hover:opacity-50"><X size={16} /></button>
                </div>
            )}

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                        Quản lý <span className="text-blue-600">Đơn hàng</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1 italic uppercase tracking-widest text-[10px]">Hệ thống giao dịch & thanh toán Admin</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng đơn</p>
                            <p className="text-xl font-black leading-none mt-1">{orders.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
                            <Clock size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chờ duyệt</p>
                            <p className="text-xl font-black leading-none mt-1 text-amber-600">{orders.filter(o => o.status === 0).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-6 items-center transition-all">
                <div className="relative flex-1 w-full text-left group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng hoặc mã ID đơn hàng..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                        <Filter className="text-blue-600" size={18} />
                        <select
                            className="bg-transparent text-xs font-black uppercase text-slate-600 outline-none cursor-pointer tracking-wider"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Mọi trạng thái</option>
                            <option value="0">Chờ duyệt</option>
                            <option value="1">Đã xác nhận</option>
                            <option value="2">Hoàn thành</option>
                            <option value="3">Đã hủy</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className="p-4 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl hover:bg-slate-200 transition-all shadow-sm active:scale-90"
                        title="Đặt lại bộ lọc"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                <th className="px-8 py-6">Mã Giao dịch</th>
                                <th className="px-8 py-6">Khách hàng</th>
                                <th className="px-8 py-6 text-center">Doanh thu</th>
                                <th className="px-8 py-6 text-center">Ngày đặt</th>
                                <th className="px-8 py-6 text-center">Trạng thái</th>
                                <th className="px-8 py-6 text-center">Thanh toán</th>
                                <th className="px-8 py-6 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-blue-50/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="font-mono font-black text-slate-800 text-[11px] uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <div>
                                                <div className="font-black text-slate-800 text-sm mb-0.5 tracking-tight uppercase italic">{order.client?.fullname}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Phone size={10} className="text-blue-500" /> {order.client?.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-black text-blue-600 text-base tabular-nums tracking-tighter">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-slate-700">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${STATUS_MAP[order.status]?.color || 'bg-slate-100'}`}>
                                                {STATUS_MAP[order.status]?.icon}
                                                {STATUS_MAP[order.status]?.label || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${PAYMENT_MAP[order.paymentStatus]?.color || 'bg-slate-100'}`}>
                                                {PAYMENT_MAP[order.paymentStatus]?.label || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleOpenDetail(order)}
                                                    className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-md border border-slate-100 hover:border-blue-200 transition-all active:scale-90"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-md border border-slate-100 hover:border-rose-200 transition-all active:scale-90" title="Xóa">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                            <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                                                <DatabaseZap size={40} className="text-slate-400" />
                                            </div>
                                            <p className="font-black uppercase tracking-[0.2em] text-xs text-slate-500 italic">Không có dữ liệu đơn hàng nào khớp với tìm kiếm</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer (Dựa vào kết quả lọc tạm thời) */}
                <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Hiển thị <span className="text-slate-800 font-black">{filteredOrders.length}</span> trên tổng số <span className="text-slate-800 font-black">{orders.length}</span> giao dịch
                    </span>
                    <div className="flex gap-2">
                        <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50 cursor-not-allowed" disabled>Trước</button>
                        <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-600 transition-all shadow-sm">Tiếp theo</button>
                    </div>
                </div>
            </div>

            {/* --- DETAIL MODAL --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 border border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 text-left">
                            <div>
                                <h3 className="font-black text-2xl text-slate-800 uppercase italic tracking-tight leading-none">
                                    Chi tiết đơn hàng
                                </h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 italic font-mono">
                                    ID: {selectedOrder._id}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Thông tin khách hàng */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><User size={12} className="text-blue-500" /> Khách hàng</p>
                                        <p className="font-black text-slate-800 text-lg leading-tight uppercase italic">{selectedOrder.client?.fullname}</p>
                                        <div className="space-y-1 mt-3">
                                            <p className="text-sm text-slate-600 font-bold flex items-center gap-2">
                                                <Phone size={14} className="text-blue-500 shrink-0" /> {selectedOrder.client?.phone}
                                            </p>
                                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                <Mail size={14} className="text-blue-500 shrink-0" /> {selectedOrder.client?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> Thời gian đặt</p>
                                        <p className="font-bold text-slate-700 leading-tight">
                                            {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                {/* Thông tin thanh toán */}
                                <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12"><CreditCard size={120} /></div>
                                    <div className="relative z-10 text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Phương thức thanh toán</p>
                                        <p className="font-black text-slate-700 uppercase tracking-tighter text-lg italic flex items-center gap-2">
                                            <CreditCard size={18} className="text-emerald-500" /> {selectedOrder.paymentMethod}
                                        </p>
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Tổng giá trị hóa đơn</p>
                                        <p className="text-3xl font-black text-blue-600 tabular-nums tracking-tighter leading-none mt-1">
                                            {formatCurrency(selectedOrder.totalAmount)}
                                        </p>
                                    </div>
                                    <div className="relative z-10 pt-4 border-t border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Trạng thái thanh toán</p>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${PAYMENT_MAP[selectedOrder.paymentStatus]?.color}`}>
                                            {PAYMENT_MAP[selectedOrder.paymentStatus]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={14} className="text-blue-500" /> Ghi chú vận hành hệ thống
                                </p>
                                <div className="text-xs text-slate-500 italic bg-slate-50/50 p-5 rounded-2xl border border-slate-100 min-h-[80px]">
                                    {selectedOrder.notes || "Giao dịch được khởi tạo tự động từ hệ thống. Chưa có lưu ý bổ sung từ Admin."}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200"
                            >
                                Đóng
                            </button>
                            <button className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
                                <Printer size={18} /> In hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;