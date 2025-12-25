import React, { useState, useEffect } from 'react';
import {
    Loader2,
    X,
    MapPin,
    Users,
    Dumbbell,
    Activity,
    Calendar,
    Clock,
    Star,
    CheckCircle,
    Flame,
    Shield,
    FileText
} from 'lucide-react';

/**
 * MOCK DATA - Dùng để fallback khi không gọi được API thật trong môi trường Preview
 */
const MOCK_DATA_FALLBACK = {};

/**
 * Helper lấy URL API
 */
const getApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env.VITE_API_URL_CLIENT || "http://localhost:5000/api/admin";
        }
    } catch (e) { }
    return "http://localhost:5000/api/admin";
};

const API_URL = getApiUrl();

const HomePage = () => {
    // --- States for Rooms ---
    const [rooms, setRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null); // For Modal

    // --- Fetch Rooms Data ---
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Ở đây giả định endpoint public hoặc đã có token client
                const token = localStorage.getItem('tokenClient') || localStorage.getItem('tokenAdmin');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                // Thêm timeout để không đợi quá lâu nếu API die
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

                const response = await fetch(`${API_URL}/all-rooms`, {
                    headers,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const result = await response.json();

                if (result.success) {
                    setRooms(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch rooms (using mock data for preview):", error);
                // Fallback logic: Hiển thị mock data nếu gọi API thất bại
                setRooms(MOCK_DATA_FALLBACK.data);
            } finally {
                setIsLoadingRooms(false);
            }
        };

        fetchRooms();
    }, []);

    // --- Helper UI ---
    // URL ảnh mặc định để fallback nếu ảnh lỗi
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop";

    return (
        <div className="bg-black text-white min-h-screen font-sans">
            {/* HERO SECTION */}
            <div className="relative h-screen min-h-[600px] flex items-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                        alt="Gym Background"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16">
                    <div className="lg:w-2/3">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-red-500 bg-red-500/10 text-red-500 text-sm font-bold mb-6 animate-pulse">
                            <Flame size={16} className="mr-2 fill-current" /> KHUYẾN MÃI HÈ: GIẢM 30% TẤT CẢ CÁC GÓI
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 uppercase tracking-tight text-white">
                            Kiến tạo <span className="text-red-600">vóc dáng</span><br />
                            Chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">giới hạn</span>
                        </h1>

                        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl font-light leading-relaxed">
                            Chào mừng đến với <strong>HD Fitness</strong>. Hệ thống phòng tập chuẩn 5 sao với trang thiết bị hiện đại nhất. Đặt lịch tập ngay hôm nay để bắt đầu hành trình thay đổi bản thân.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#goitap" className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-sm uppercase tracking-wider text-center transition-all duration-300 hover:bg-red-700 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
                                Đăng Ký Gói Tập <span className="text-xl">→</span>
                            </a>
                            <a href="#facilities" className="px-8 py-4 border border-white text-white text-lg font-bold rounded-sm uppercase tracking-wider text-center hover:bg-white hover:text-black transition-all duration-300">
                                Tham quan phòng tập
                            </a>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md border-t border-gray-700 pt-6">
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-white">1000+</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">Hội viên</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-white">24/7</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">Mở cửa</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-white">50+</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">Huấn luyện viên</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FACILITIES SECTION (NEW) */}
            <section id="facilities" className="py-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-white">Cơ sở vật chất</h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Trải nghiệm không gian tập luyện đẳng cấp 5 sao với đầy đủ các khu vực chức năng chuyên biệt.</p>
                    </div>

                    {isLoadingRooms ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rooms.length > 0 ? rooms.map((room) => (
                                <div key={room._id} className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300">
                                    <div className="h-56 relative overflow-hidden">
                                        <img
                                            src={room.image || FALLBACK_IMAGE}
                                            alt={room.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 ${room.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                {room.status === 'available' ? 'Sẵn sàng' : 'Bảo trì'}
                                            </span>
                                            <h3 className="text-xl font-bold text-white leading-tight">{room.name}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Users size={16} />
                                                <span>{room.capacity} người</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Dumbbell size={16} />
                                                <span>Full Equipment</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                                            {room.description || "Không gian thoáng đãng, trang thiết bị nhập khẩu 100%..."}
                                        </p>
                                        <button
                                            onClick={() => setSelectedRoom(room)}
                                            className="w-full py-3 border border-gray-600 text-gray-300 font-bold uppercase rounded-xl hover:bg-white hover:text-black hover:border-white transition-all text-sm tracking-wider"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center text-gray-500 italic">Đang cập nhật danh sách phòng...</div>
                            )}
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <button className="text-white font-bold uppercase border-b-2 border-red-600 pb-1 hover:text-red-500 transition-colors">
                            Xem tất cả các phòng <span className="ml-2">→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Quick Package Preview Section */}
            <section id="goitap" className="py-20 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-white">Gói Tập Phổ Biến</h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:transform hover:-translate-y-2 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gray-700 text-xs text-white px-4 py-2 rounded-bl-xl font-bold uppercase">Cơ bản</div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase">1 Tháng</h3>
                            <div className="text-4xl font-black text-red-500 mb-6">500k<span className="text-sm text-gray-400 font-medium">/tháng</span></div>
                            <ul className="text-gray-300 text-sm space-y-4 mb-8">
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Tập Full thời gian</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Tủ đồ miễn phí</li>
                                <li className="flex items-center text-gray-500"><X size={16} className="mr-3" /> Không bao gồm Yoga</li>
                            </ul>
                            <button className="w-full py-4 border border-red-500 text-red-500 font-bold uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all tracking-wider">Chọn Gói</button>
                        </div>

                        {/* Card 2 (Highlight) */}
                        <div className="bg-gray-800 rounded-2xl p-8 border-2 border-red-600 relative transform md:-translate-y-4 shadow-2xl shadow-red-900/20">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-2 text-xs font-black rounded-full uppercase tracking-wider shadow-lg">Bán chạy nhất</div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase">3 Tháng</h3>
                            <div className="text-4xl font-black text-red-500 mb-6">1.200k<span className="text-sm text-gray-400 font-medium">/khóa</span></div>
                            <ul className="text-gray-300 text-sm space-y-4 mb-8">
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Tiết kiệm 20%</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Full tiện ích 5 sao</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Tặng 1 buổi PT 1:1</li>
                            </ul>
                            <button className="w-full py-4 bg-red-600 text-white font-bold uppercase rounded-xl hover:bg-red-700 transition-all tracking-wider shadow-lg">Chọn Gói</button>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:transform hover:-translate-y-2 group">
                            <div className="absolute top-0 right-0 bg-yellow-600 text-xs text-white px-4 py-2 rounded-bl-xl font-bold uppercase">VIP</div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase">1 Năm</h3>
                            <div className="text-4xl font-black text-red-500 mb-6">4.500k<span className="text-sm text-gray-400 font-medium">/năm</span></div>
                            <ul className="text-gray-300 text-sm space-y-4 mb-8">
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Cam kết hiệu quả</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Khăn tập, Xông hơi</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-green-500 mr-3" /> Đóng băng thẻ tập</li>
                            </ul>
                            <button className="w-full py-4 border border-red-500 text-red-500 font-bold uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all tracking-wider">Chọn Gói</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOG/ARTICLES SECTION */}
            <section id="tintuc" className="py-20 bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-white">Góc Kiến Thức</h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Cập nhật những kiến thức tập luyện, dinh dưỡng và xu hướng mới nhất từ các chuyên gia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Article 1 */}
                        <div className="group bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-red-500 transition-all duration-300">
                            <div className="relative overflow-hidden h-56">
                                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1470&auto=format&fit=crop" alt="Nutrition" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-full">Dinh dưỡng</div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">
                                    <div className="flex items-center"><Calendar size={12} className="mr-2" /> 24/12/2023</div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center"><Clock size={12} className="mr-2" /> 5 phút đọc</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-2">Thực đơn Eat Clean cho người mới bắt đầu</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">Khám phá chế độ ăn uống lành mạnh giúp giảm mỡ tăng cơ hiệu quả mà không cần nhịn ăn khổ sở.</p>
                                <a href="#" className="inline-flex items-center text-red-500 font-bold uppercase text-sm hover:text-red-400 transition-colors tracking-wide">
                                    Đọc tiếp <span className="ml-2 text-lg">→</span>
                                </a>
                            </div>
                        </div>

                        {/* Article 2 */}
                        <div className="group bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-red-500 transition-all duration-300">
                            <div className="relative overflow-hidden h-56">
                                <img src="https://images.unsplash.com/photo-1517963879466-e9b5ce382569?q=80&w=1470&auto=format&fit=crop" alt="Workout" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-full">Tập luyện</div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">
                                    <div className="flex items-center"><Calendar size={12} className="mr-2" /> 22/12/2023</div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center"><Clock size={12} className="mr-2" /> 7 phút đọc</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-2">5 Lỗi sai phổ biến khi tập Squat</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">Squat là vua của các bài tập, nhưng tập sai có thể dẫn đến chấn thương lưng và đầu gối nghiêm trọng.</p>
                                <a href="#" className="inline-flex items-center text-red-500 font-bold uppercase text-sm hover:text-red-400 transition-colors tracking-wide">
                                    Đọc tiếp <span className="ml-2 text-lg">→</span>
                                </a>
                            </div>
                        </div>

                        {/* Article 3 */}
                        <div className="group bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-red-500 transition-all duration-300">
                            <div className="relative overflow-hidden h-56">
                                <img src="https://images.unsplash.com/photo-1552674605-469555942c77?q=80&w=1470&auto=format&fit=crop" alt="Lifestyle" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-full">Lối sống</div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">
                                    <div className="flex items-center"><Calendar size={12} className="mr-2" /> 20/12/2023</div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center"><Clock size={12} className="mr-2" /> 4 phút đọc</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-2">Làm thế nào để duy trì động lực mỗi ngày?</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">Bí quyết giúp bạn không bao giờ bỏ cuộc giữa chừng và biến việc tập luyện trở thành thói quen không thể thiếu.</p>
                                <a href="#" className="inline-flex items-center text-red-500 font-bold uppercase text-sm hover:text-red-400 transition-colors tracking-wide">
                                    Đọc tiếp <span className="ml-2 text-lg">→</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MODAL CHI TIẾT PHÒNG --- */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedRoom(null)}
                    ></div>

                    <div className="relative bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-800 flex flex-col md:flex-row max-h-[90vh]">
                        {/* Left: Image */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                            <img
                                src={selectedRoom.image || FALLBACK_IMAGE}
                                alt={selectedRoom.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent md:hidden"></div>
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors md:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Right: Content */}
                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                            <div className="flex justify-end mb-4 hidden md:flex">
                                <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-3 ${selectedRoom.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {selectedRoom.status === 'available' ? 'Đang hoạt động' : 'Bảo trì'}
                                </span>
                                <h2 className="text-3xl font-black text-white leading-tight uppercase">{selectedRoom.name}</h2>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Sức chứa</p>
                                        <p className="text-lg font-bold text-white flex items-center gap-2">
                                            <Users size={18} className="text-red-500" /> {selectedRoom.capacity}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Loại phòng</p>
                                        <p className="text-lg font-bold text-white flex items-center gap-2">
                                            <Activity size={18} className="text-red-500" /> Tiêu chuẩn
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FileText size={16} className="text-red-500" /> Mô tả chi tiết
                                    </h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {selectedRoom.description || "Phòng tập được trang bị đầy đủ các thiết bị hiện đại nhất, không gian thoáng mát, hệ thống điều hòa lọc khí tiêu chuẩn 5 sao."}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Shield size={16} className="text-red-500" /> Tiện ích đi kèm
                                    </h4>
                                    <ul className="text-gray-400 text-sm space-y-2">
                                        <li className="flex items-center"><CheckCircle size={14} className="text-green-500 mr-2" /> Hệ thống âm thanh vòm</li>
                                        <li className="flex items-center"><CheckCircle size={14} className="text-green-500 mr-2" /> Khăn tập & nước uống miễn phí</li>
                                        <li className="flex items-center"><CheckCircle size={14} className="text-green-500 mr-2" /> Tủ đồ khóa từ thông minh</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-800">
                                <button className="w-full py-4 bg-red-600 text-white font-bold uppercase rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 tracking-wider">
                                    Đăng ký tập thử tại đây
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;