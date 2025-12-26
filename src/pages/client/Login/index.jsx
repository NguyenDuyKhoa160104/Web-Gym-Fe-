import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Cấu hình URL API cho Client
const API_URL = import.meta.env?.VITE_API_URL_CLIENT || "http://localhost:5000/api/client";

const LoginPage = () => {
    const navigate = useNavigate();

    // State quản lý form và giao diện
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

    // =================================================================
    // 1. LOGIC CHECK LOGIN (Tự động chuyển hướng nếu đã đăng nhập)
    // =================================================================
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('tokenClient');

            if (token) {
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
                        // Nếu token hợp lệ -> Về trang chủ
                        console.log("Hội viên đã đăng nhập, đang chuyển về trang chủ...");
                        localStorage.setItem('dataClient', JSON.stringify(result.data));
                        navigate('/');
                    } else {
                        // Token hết hạn -> Xóa để đăng nhập lại
                        localStorage.removeItem('tokenClient');
                        localStorage.removeItem('dataClient');
                    }
                } catch (error) {
                    console.error("Lỗi kiểm tra session:", error);
                }
            }
        };

        checkLoginStatus();
    }, [navigate]);

    // Tự động ẩn thông báo sau 5 giây
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', isError: false }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // =================================================================
    // 2. XỬ LÝ ĐĂNG NHẬP (handleLogin)
    // =================================================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', isError: false });

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.success) {
                // Lưu trữ vào localStorage theo prefix Client
                localStorage.setItem('tokenClient', result.token);
                localStorage.setItem('dataClient', JSON.stringify(result.data));

                setMessage({ text: 'Đăng nhập thành công! Đang vào hệ thống...', isError: false });

                // Chuyển hướng sau 1.2 giây
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMessage({ text: result.message || 'Email hoặc mật khẩu không đúng', isError: true });
                setLoading(false);
            }
        } catch (error) {
            setMessage({ text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', isError: true });
            setLoading(false);
        }
    };

    return (
        <>
            <nav className="fixed w-full z-50 bg-transparent transition-all duration-300" id="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex-shrink-0 cursor-pointer">
                            <span className="text-3xl font-bold text-red-500 brand-font italic">HD</span>
                            <span className="text-3xl font-bold text-white brand-font italic">FITNESS</span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">Trang chủ</Link>
                                <Link to="/packages" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">Gói tập</Link>
                                <Link to="/pt" className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wider">HLV Cá nhân</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                        alt="Gym Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/80"></div>
                </div>

                <div className="relative z-10 w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl m-4 animate-fade-in-up">
                    <div className="w-full md:w-1/2 bg-gray-900 p-8 md:p-12 border-r border-gray-800">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 brand-font uppercase">Chào mừng trở lại</h2>
                            <p className="text-gray-400 text-sm">Đăng nhập để quản lý lịch tập và gói hội viên của bạn.</p>
                        </div>

                        {/* Message UI */}
                        {message.text && (
                            <div className={`mb-6 p-3 rounded-lg text-xs font-bold text-center border animate-pulse ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer"
                                    placeholder=" "
                                />
                                <label htmlFor="email" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Email hoặc Số điện thoại</label>
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer"
                                    placeholder=" "
                                />
                                <label htmlFor="password" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Mật khẩu</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700" />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-400">Ghi nhớ đăng nhập</label>
                                </div>
                                <a href="#" className="text-red-500 hover:text-red-400 font-medium">Quên mật khẩu?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-lg text-sm px-5 py-3 text-center uppercase tracking-wider transition-transform transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                                ) : null}
                                {loading ? "Đang xác thực..." : "Đăng Nhập"}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-500">Hoặc tiếp tục với</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <a href="#" className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
                                    <i className="fab fa-google text-red-500 mr-2"></i> Google
                                </a>
                                <a href="#" className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
                                    <i className="fab fa-facebook-f text-blue-600 mr-2"></i> Facebook
                                </a>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-400">
                            Chưa là hội viên?
                            <Link to="/register" className="font-bold text-red-500 hover:text-red-400 ml-1 uppercase">Đăng ký ngay</Link>
                        </p>
                    </div>

                    <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=987&auto=format&fit=crop')" }}>
                        <div className="absolute inset-0 bg-red-600/80 mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
                            <h3 className="text-4xl font-bold mb-4 brand-font italic">NO PAIN NO GAIN</h3>
                            <p className="text-lg text-gray-100 mb-8 font-light">
                                "Sức mạnh không đến từ những việc bạn có thể làm. Nó đến từ việc bạn vượt qua những điều bạn từng cho là không thể."
                            </p>
                            <div className="border-t border-white/30 w-16 mb-8"></div>
                            <div className="grid grid-cols-2 gap-8 text-left w-full max-w-xs">
                                <div>
                                    <div className="text-2xl font-bold">30+</div>
                                    <div className="text-xs uppercase opacity-80">Lớp học mỗi ngày</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">05</div>
                                    <div className="text-xs uppercase opacity-80">Chi nhánh TP.HCM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;