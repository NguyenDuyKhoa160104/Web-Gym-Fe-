import React from 'react';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Send,
    ChevronRight
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black pt-16 pb-8 border-t border-gray-800 text-gray-400 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Section: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Col 1: Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1">
                            <span className="text-3xl font-black text-red-600 italic tracking-tighter">HD</span>
                            <span className="text-3xl font-black text-white italic tracking-tighter">FITNESS</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-500">
                            Hệ thống phòng tập đẳng cấp 5 sao với trang thiết bị hiện đại, mang lại trải nghiệm tập luyện tuyệt vời nhất cho hội viên.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="#" icon={<Facebook size={20} />} />
                            <SocialLink href="#" icon={<Instagram size={20} />} />
                            <SocialLink href="#" icon={<Youtube size={20} />} />
                            <SocialLink href="#" icon={<Twitter size={20} />} />
                        </div>
                    </div>

                    {/* Col 2: Quick Links */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6 border-l-4 border-red-600 pl-3">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-3">
                            <FooterLink text="Về chúng tôi" />
                            <FooterLink text="Dịch vụ & Gói tập" />
                            <FooterLink text="Đội ngũ HLV" />
                            <FooterLink text="Lịch tập Group X" />
                            <FooterLink text="Tin tức & Sự kiện" />
                        </ul>
                    </div>

                    {/* Col 3: Contact Info */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6 border-l-4 border-red-600 pl-3">
                            Liên hệ
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-red-600 shrink-0 mt-1" size={18} />
                                <span>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-red-600 shrink-0" size={18} />
                                <span className="hover:text-white cursor-pointer transition-colors">1900 123 456</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-red-600 shrink-0" size={18} />
                                <span className="hover:text-white cursor-pointer transition-colors">contact@hdfitness.vn</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="text-red-600 shrink-0 mt-1" size={18} />
                                <div>
                                    <p>Thứ 2 - Thứ 7: 05:30 - 22:00</p>
                                    <p>Chủ nhật: 06:00 - 20:00</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Newsletter */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6 border-l-4 border-red-600 pl-3">
                            Đăng ký nhận tin
                        </h3>
                        <p className="text-sm mb-4">
                            Đăng ký để nhận thông báo về các ưu đãi đặc biệt và mẹo tập luyện mới nhất.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email của bạn..."
                                className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                            />
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-wider">
                                <Send size={16} /> Đăng ký ngay
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Legal */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© 2024 HD Fitness. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-red-500 transition-colors">Chính sách bảo mật</a>
                        <a href="#" className="hover:text-red-500 transition-colors">Điều khoản sử dụng</a>
                        <a href="#" className="hover:text-red-500 transition-colors">Câu hỏi thường gặp</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// --- Helper Components ---

const FooterLink = ({ text, href = "#" }) => (
    <li>
        <a
            href={href}
            className="group flex items-center gap-2 hover:text-red-500 transition-colors duration-300"
        >
            <ChevronRight size={14} className="text-gray-600 group-hover:text-red-500 transition-colors" />
            {text}
        </a>
    </li>
);

const SocialLink = ({ href, icon }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 border border-gray-800 hover:border-red-600"
    >
        {icon}
    </a>
);

export default Footer;