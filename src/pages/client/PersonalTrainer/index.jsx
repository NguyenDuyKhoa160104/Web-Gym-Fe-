import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, X, HelpCircle } from 'lucide-react';

/**
 * Helper lấy URL API Client an toàn
 */
const getClientApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL_CLIENT) {
            return import.meta.env.VITE_API_URL_CLIENT;
        }
    } catch (e) { }
    return "http://localhost:5000/api/client";
};

const API_CLIENT = getClientApiUrl();

const PersonalTrainerPage = () => {
    // --- States ---
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho chức năng Booking & Notification
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // State cho Modal xác nhận (Thay thế window.confirm)
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        coachId: null,
        coachName: ''
    });

    // --- Helpers ---
    const showNotice = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchCoaches = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('tokenClient');

                const headers = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_CLIENT}/all-coaches`, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    if (response.status === 404) throw new Error("API Route không tồn tại.");
                    if (response.status === 401) throw new Error("Vui lòng đăng nhập để xem danh sách.");
                    throw new Error(`Lỗi server: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setCoaches(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                console.error("Lỗi fetchCoaches:", err);
                setError(err.message || "Không thể kết nối đến máy chủ.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoaches();
    }, []);

    // --- LOGIC 1: Mở Modal xác nhận ---
    const handleInitiateBooking = (coach) => {
        const token = localStorage.getItem('tokenClient');

        if (!token) {
            showNotice("Bạn cần đăng nhập để đăng ký HLV!", "error");
            return;
        }

        // Mở modal thay vì dùng window.confirm
        setConfirmModal({
            show: true,
            coachId: coach._id,
            coachName: coach.fullname
        });
    };

    // --- LOGIC 2: Xử lý khi bấm "Đồng ý" trong Modal ---
    const confirmBooking = async () => {
        const { coachId } = confirmModal;

        // Đóng modal ngay lập tức
        setConfirmModal({ show: false, coachId: null, coachName: '' });

        // Bắt đầu hiệu ứng loading trên nút
        setProcessingId(coachId);

        try {
            const token = localStorage.getItem('tokenClient');
            const response = await fetch(`${API_CLIENT}/book-coach/${coachId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showNotice(`Đăng ký thành công! Chào mừng bạn gia nhập team.`);
            } else {
                showNotice(data.message || "Đăng ký thất bại.", "error");
            }
        } catch (err) {
            showNotice("Lỗi kết nối. Vui lòng thử lại sau.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    // --- Helper render ảnh ---
    const getAvatarUrl = (url) => {
        if (!url || url === 'default-avatar.png') {
            return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop";
        }
        return url;
    };

    return (
        <>
            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 border ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
                    }`}>
                    {notification.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                    <div>
                        <h4 className="font-bold text-sm uppercase">{notification.type === 'error' ? 'Thông báo lỗi' : 'Thành công'}</h4>
                        <p className="text-sm font-medium opacity-90">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => setNotification({ ...notification, show: false })}
                        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setConfirmModal({ show: false, coachId: null, coachName: '' })}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
                                <HelpCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">Xác nhận đăng ký</h3>
                            <p className="text-gray-500 mb-6 px-4">
                                Bạn có chắc chắn muốn đăng ký tập luyện cùng HLV <span className="font-bold text-gray-900">{confirmModal.coachName}</span> không?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ show: false, coachId: null, coachName: '' })}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={confirmBooking}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 uppercase text-sm"
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PT HERO SECTION */}
            <div className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop"
                        alt="PT Training"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
                    <div className="md:w-2/3">
                        <div className="inline-block px-4 py-1 mb-4 border border-red-500 rounded-full text-red-500 text-sm font-bold uppercase tracking-wider bg-black/50">
                            Personal Trainer 1:1
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase">
                            Người bạn đồng hành <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">chinh phục mục tiêu</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl font-light leading-relaxed">
                            Không còn tập sai kỹ thuật. Không còn chán nản bỏ cuộc. Đội ngũ HLV chuyên nghiệp tại HD Fitness sẽ thiết kế lộ trình riêng biệt dành cho cơ thể bạn.
                        </p>
                        <button onClick={() => document.getElementById('team-section').scrollIntoView({ behavior: 'smooth' })} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-sm text-lg font-bold uppercase transition-transform transform hover:translate-y-[-2px] shadow-lg shadow-red-600/30">
                            Tìm HLV Của Tôi
                        </button>
                    </div>
                </div>
            </div>

            {/* WHY PT? (Benefits) */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-white">Quyền lợi đặc biệt</h2>
                        <div className="w-20 h-1 bg-red-600 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 p-8 rounded-lg border-b-4 border-red-600 hover:bg-gray-750 transition-colors">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl">
                                <i className="fas fa-clipboard-list"></i>
                            </div>
                            <h3 className="text-xl font-bold uppercase mb-3 text-white">Lộ trình cá nhân hóa</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Phác đồ tập luyện và dinh dưỡng được thiết kế riêng dựa trên chỉ số InBody và thói quen sinh hoạt của từng cá nhân.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg border-b-4 border-red-600 hover:bg-gray-750 transition-colors">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3 className="text-xl font-bold uppercase mb-3 text-white">An toàn tuyệt đối</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">HLV theo sát từng chuyển động, chỉnh sửa kỹ thuật ngay lập tức để tối đa hóa hiệu quả và ngăn ngừa chấn thương.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg border-b-4 border-red-600 hover:bg-gray-750 transition-colors">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl">
                                <i className="fas fa-fire"></i>
                            </div>
                            <h3 className="text-xl font-bold uppercase mb-3 text-white">Động lực bất tận</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Không chỉ là người hướng dẫn, PT còn là người bạn đồng hành thúc đẩy tinh thần giúp bạn vượt qua giới hạn bản thân.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MEET THE TEAM (Dynamic Data) */}
            <section id="team-section" className="py-16 bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-2 text-white">Đội ngũ Huấn luyện viên</h2>
                            <p className="text-gray-400">Những chuyên gia hàng đầu sẵn sàng hỗ trợ bạn</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                            <p className="text-gray-400">Đang tải danh sách HLV...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-10 bg-gray-900/50 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                            <p className="text-gray-300 mb-4">{error}</p>
                            <p className="text-sm text-gray-500">Vui lòng kiểm tra lại server hoặc đăng nhập lại.</p>
                        </div>
                    ) : coaches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {coaches.map((coach) => (
                                <div key={coach._id} className="group trainer-card relative rounded-lg overflow-hidden h-96 cursor-pointer bg-gray-900">
                                    <img
                                        src={getAvatarUrl(coach.avatar_url)}
                                        alt={coach.fullname}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <h3 className="text-2xl font-bold uppercase text-white truncate" title={coach.fullname}>
                                            {coach.fullname}
                                        </h3>
                                        <p className="text-red-500 text-sm font-bold uppercase mb-2 truncate">
                                            {coach.specialty || 'Huấn luyện viên'}
                                        </p>

                                        {/* Overlay Content & Booking Button */}
                                        <div className="trainer-overlay h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <p className="text-gray-300 text-xs line-clamp-2 mb-3">
                                                {coach.bio || `${coach.experience || 1} năm kinh nghiệm huấn luyện chuyên nghiệp.`}
                                            </p>
                                            <button
                                                onClick={() => handleInitiateBooking(coach)}
                                                disabled={processingId === coach._id}
                                                className="text-white border border-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors w-full flex items-center justify-center gap-2"
                                            >
                                                {processingId === coach._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Đăng ký ngay"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <p>Chưa có huấn luyện viên nào trong hệ thống.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* TRAINING PROCESS */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-white">Quy trình huấn luyện</h2>
                        <p className="text-gray-400">4 Bước chuẩn khoa học tại HD Fitness</p>
                    </div>

                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { step: 1, title: 'Đo chỉ số InBody', desc: 'Phân tích tỷ lệ mỡ, cơ và tình trạng sức khỏe hiện tại.' },
                                { step: 2, title: 'Thiết kế lộ trình', desc: 'Xây dựng lịch tập và thực đơn dinh dưỡng riêng biệt.' },
                                { step: 3, title: 'Tập luyện 1:1', desc: 'HLV hướng dẫn, chỉnh sửa kỹ thuật từng buổi tập.' },
                                { step: 4, title: 'Đánh giá định kỳ', desc: 'Kiểm tra kết quả mỗi 2 tuần để điều chỉnh phù hợp.' }
                            ].map((item) => (
                                <div key={item.step} className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center relative hover:transform hover:-translate-y-2 transition-transform">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 border-4 border-gray-900 relative z-20">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* BOOKING FORM - GENERIC */}
            <section className="py-20 relative bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold uppercase mb-6 leading-tight text-white">Bạn đã sẵn sàng <br /><span className="text-red-500">thay đổi bản thân?</span></h2>
                            <p className="text-gray-400 mb-8 text-lg">Đăng ký ngay hôm nay để nhận 01 buổi tập thử miễn phí cùng HLV Cá nhân và gói tư vấn dinh dưỡng trị giá 500k.</p>
                            <ul className="space-y-4 mb-8">
                                {['Miễn phí đo chỉ số cơ thể', 'Trải nghiệm phòng tập 5 sao', 'Tư vấn lộ trình 1:1'].map((item, idx) => (
                                    <li key={idx} className="flex items-center text-gray-300">
                                        <i className="fas fa-check-circle text-red-500 mr-3"></i> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
                            <h3 className="text-2xl font-bold uppercase mb-6 text-center text-white">Đăng ký tập thử</h3>
                            <form className="space-y-4">
                                <input type="text" placeholder="Họ và tên của bạn" className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors" />
                                <input type="tel" placeholder="Số điện thoại liên hệ" className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors" />
                                <select className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors">
                                    <option value="" disabled selected>Mục tiêu của bạn là gì?</option>
                                    <option value="giam-can">Giảm cân / Giảm mỡ</option>
                                    <option value="tang-co">Tăng cơ bắp</option>
                                    <option value="suckhoe">Cải thiện sức khỏe chung</option>
                                    <option value="kickboxing">Học Kickboxing / Võ thuật</option>
                                </select>
                                <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-4 rounded shadow-lg transition-all transform hover:scale-[1.02]">
                                    Gửi Đăng Ký
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PersonalTrainerPage;