import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Check,
    X,
    Loader2,
    AlertCircle,
    CreditCard,
    Banknote,
    ChevronRight,
    ShieldCheck,
    Info,
    Zap,
    Trophy,
    Crown
} from 'lucide-react';

/**
 * Cấu hình URL API linh hoạt
 */
const getApiUrl = () => {
    try {
        return import.meta.env.VITE_API_URL_CLIENT || 'http://localhost:5000/api/client';
    } catch (e) {
        return 'http://localhost:5000/api/client';
    }
};

const API_CLIENT = getApiUrl();

const PackagesPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // States cho Modal và Hành động
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hệ thống thông báo (Notice)
    const [notice, setNotice] = useState({ show: false, message: '', type: 'success' });

    const showNotice = (message, type = 'success') => {
        setNotice({ show: true, message, type });
        setTimeout(() => setNotice({ show: false, message: '', type: 'success' }), 4000);
    };

    /**
     * TẢI DỮ LIỆU BAN ĐẦU (GET /packages & /package-categories)
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('tokenClient');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                // Gọi đồng thời 2 API
                const [pkgRes, catRes] = await Promise.all([
                    axios.get(`${API_CLIENT}/packages`, config),
                    axios.get(`${API_CLIENT}/package-categories`, config)
                ]);

                // Xử lý dữ liệu linh hoạt (Dựa trên cấu trúc mảng đã cung cấp)
                const rawPackages = pkgRes.data?.data || pkgRes.data || [];
                const rawCategories = catRes.data?.data || catRes.data || [];

                setPackages(rawPackages.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
                setCategories(rawCategories.filter(cat => cat.status === 1).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));

            } catch (error) {
                console.error("❌ [FETCH DATA ERROR]:", error);
                showNotice("Không thể tải danh sách gói tập. Hãy kiểm tra kết nối API.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /**
     * XỬ LÝ ĐẶT GÓI TẬP (POST /order)
     */
    const handleConfirmPurchase = async () => {
        if (!selectedPackage || !paymentMethod) return;

        const token = localStorage.getItem('tokenClient');
        if (!token) {
            showNotice("Vui lòng đăng nhập để thực hiện đặt gói.", "error");
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setIsSubmitting(true);
        try {
            // URL thực tế sẽ là: http://localhost:5000/api/client/order
            const response = await axios.post(
                `${API_CLIENT}/order`,
                {
                    packageId: selectedPackage._id,
                    quantity: 1,
                    paymentMethod: paymentMethod
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                showNotice("Đặt hàng thành công! Đang chuyển hướng...", "success");
                setTimeout(() => {
                    handleCloseModal();
                    // Có thể chuyển hướng về trang lịch sử đơn hàng của Client nếu có
                }, 1500);
            } else {
                showNotice(response.data.message || "Có lỗi xảy ra khi đặt hàng.", "error");
            }
        } catch (error) {
            console.error("❌ [ORDER ERROR]:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || "Lỗi hệ thống khi đặt hàng.";
            showNotice(errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Logic lọc gói tập theo danh mục
     */
    const filteredPackages = useMemo(() => {
        if (selectedCategory === 'all') return packages;
        return packages.filter(pkg => pkg.category === selectedCategory);
    }, [packages, selectedCategory]);

    const handleRegisterClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setSelectedPackage(null);
        setPaymentMethod('');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    return (
        <div className="bg-gray-950 text-white min-h-screen font-sans selection:bg-red-600/30">

            {/* HỆ THỐNG TOAST NOTIFICATION */}
            {notice.show && (
                <div className="fixed top-24 right-4 md:right-8 z-[110] animate-in slide-in-from-right duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border-l-4 ${notice.type === 'error' ? 'bg-gray-900 border-red-500 text-red-500' : 'bg-gray-900 border-green-500 text-green-500'
                        }`}>
                        {notice.type === 'error' ? <AlertCircle size={24} /> : <Check size={24} />}
                        <div className="text-left">
                            <p className="font-black uppercase tracking-tight text-sm">{notice.type === 'error' ? 'Thất bại' : 'Thành công'}</p>
                            <p className="text-xs text-gray-400 font-medium">{notice.message}</p>
                        </div>
                        <button onClick={() => setNotice({ ...notice, show: false })} className="text-gray-600 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER HERO SECTION */}
            <header className="relative pt-40 pb-24 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-gray-950"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/5 via-transparent to-transparent blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        Elite Performance Plans
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                        Nâng tầm <span className="text-red-600">Sức mạnh</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Lựa chọn lộ trình tập luyện phù hợp nhất với mục tiêu cá nhân. <br />
                        Hệ thống ưu đãi đặc quyền dành riêng cho hội viên mới.
                    </p>
                </div>
            </header>

            {/* DANH MỤC LỌC (STICKY) */}
            <section className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 py-4">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === 'all' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                            }`}
                    >
                        Tất cả gói
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat._id ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* LƯỚI GÓI TẬP */}
            <main className="max-w-7xl mx-auto px-4 py-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                        <Loader2 className="animate-spin text-red-600" size={48} />
                        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Đang đồng bộ dữ liệu...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map((pkg) => {
                            // Style đặc biệt cho các gói Premium/VIP/Gold
                            const isPremium = pkg.packageName.toLowerCase().match(/(gold|vip|platinum)/);
                            return (
                                <div
                                    key={pkg._id}
                                    className={`relative group flex flex-col bg-gray-900 rounded-[2.5rem] p-8 border transition-all duration-500 hover:-translate-y-2 text-left ${isPremium ? 'border-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.15)] ring-1 ring-red-600/50' : 'border-gray-800 hover:border-gray-600 shadow-xl'
                                        }`}
                                >
                                    {isPremium && (
                                        <div className="absolute top-6 right-8 text-red-500">
                                            <Crown size={24} />
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-3 group-hover:text-red-500 transition-colors leading-none">
                                            {pkg.packageName}
                                        </h3>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed h-12 line-clamp-3">
                                            {pkg.description || "Nâng cao sức khỏe và sự dẻo dai cùng đội ngũ huấn luyện viên hàng đầu."}
                                        </p>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black tracking-tighter text-white tabular-nums">
                                                {formatCurrency(pkg.price)}
                                            </span>
                                            <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">đ</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                            <Zap size={12} fill="currentColor" /> {pkg.durationInDays || 30} ngày sử dụng
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-10 flex-1">
                                        {(pkg.features || ["Truy cập full thiết bị", "Tủ đồ cá nhân", "Phòng tắm & Xông hơi"]).map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-400 group/item">
                                                <div className="mt-1 bg-red-600/20 p-0.5 rounded flex-none">
                                                    <Check size={12} className="text-red-500" />
                                                </div>
                                                <span className="font-medium group-hover/item:text-gray-200 transition-colors leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleRegisterClick(pkg)}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isPremium
                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20'
                                            : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        Đăng Ký Gói
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODAL CHECKOUT */}
            {isModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-gray-900 w-full max-w-lg rounded-[3rem] border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 text-left">
                        <div className="px-8 py-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2 block italic">Transaction Center</span>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Xác nhận thanh toán</h2>
                                </div>
                                <button onClick={handleCloseModal} className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-full transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-black/50 p-6 rounded-[2rem] border border-gray-800 mb-10 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Dịch vụ</p>
                                    <p className="text-white font-black uppercase text-sm italic">{selectedPackage.packageName}</p>
                                </div>
                                <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-800/50">
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Thời hạn</p>
                                    <p className="text-white font-black text-sm">{selectedPackage.durationInDays || 30} ngày</p>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-gray-800/50">
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Tổng cộng</p>
                                    <p className="text-4xl font-black text-red-500 tabular-nums tracking-tighter">
                                        {formatCurrency(selectedPackage.price)}
                                        <span className="text-sm font-bold ml-1 uppercase opacity-50">đ</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Chọn phương thức thanh toán</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('Transfer')}
                                        className={`flex flex-col items-center gap-2 p-5 rounded-3xl border transition-all active:scale-95 ${paymentMethod === 'Transfer' ? 'bg-red-600/10 border-red-600 text-white shadow-lg' : 'bg-gray-800 border-transparent text-gray-500 hover:border-gray-700'}`}
                                    >
                                        <CreditCard size={24} className={paymentMethod === 'Transfer' ? 'text-red-500' : ''} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Chuyển khoản</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Cash')}
                                        className={`flex flex-col items-center gap-2 p-5 rounded-3xl border transition-all active:scale-95 ${paymentMethod === 'Cash' ? 'bg-red-600/10 border-red-600 text-white shadow-lg' : 'bg-gray-800 border-transparent text-gray-500 hover:border-gray-700'}`}
                                    >
                                        <Banknote size={24} className={paymentMethod === 'Cash' ? 'text-red-500' : ''} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Tiền mặt</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    disabled={!paymentMethod || isSubmitting}
                                    onClick={handleConfirmPurchase}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${!paymentMethod ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/30'
                                        }`}
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>Xác nhận thanh toán <ChevronRight size={18} /></>}
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={handleCloseModal}
                                    className="w-full py-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-6 flex items-center justify-center gap-6 opacity-40">
                            <ShieldCheck size={24} />
                            <Info size={24} />
                            <Trophy size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* ADVISORY SECTION */}
            <section className="py-24 bg-gray-900 relative overflow-hidden border-t border-gray-800">
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">Cần hỗ trợ trực tiếp?</h2>
                    <p className="text-gray-500 font-medium mb-12">Đội ngũ chuyên viên của chúng tôi sẽ liên hệ tư vấn lộ trình tập luyện trong vòng 30 phút.</p>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Họ và tên khách hàng" className="bg-gray-800 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-red-600 font-bold placeholder:text-gray-600 transition-all text-left" />
                        <input type="tel" placeholder="Số điện thoại liên hệ" className="bg-gray-800 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-red-600 font-bold placeholder:text-gray-600 transition-all text-left" />
                        <div className="md:col-span-2">
                            <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 hover:text-white transition-all active:scale-[0.98]">
                                Nhận tư vấn miễn phí ngay
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default PackagesPage;