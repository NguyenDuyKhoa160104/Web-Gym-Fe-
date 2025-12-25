import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    Loader2,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle
} from 'lucide-react';

// --- Helper lấy URL API ---
const getApiUrl = () => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env.VITE_API_URL_CLIENT || "http://localhost:5000/api/client";
        }
    } catch (e) { }
    return "http://localhost:5000/api/client";
};

const API_URL = getApiUrl();

const RegisterPage = () => {
    const navigate = useNavigate();

    // --- State ---
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- Validator ---
    const validate = () => {
        const newErrors = {};

        // Fullname
        if (!formData.fullname.trim()) {
            newErrors.fullname = 'Họ tên không được để trống';
        } else if (formData.fullname.length < 2) {
            newErrors.fullname = 'Họ tên quá ngắn';
        }

        // Phone
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
        }

        // Password
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Confirm Password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
        }

        // Terms
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));

        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
        if (apiError) setApiError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setApiError('');

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Thành công: Chuyển hướng hoặc thông báo
                // Ở đây mình dùng window.confirm đơn giản hoặc toast nếu có
                // Sau đó chuyển qua login
                navigate('/login', { state: { message: "Đăng ký thành công! Vui lòng đăng nhập." } });
            } else {
                setApiError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error("Register Error:", error);
            setApiError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Custom Style cho Font chữ thương hiệu */}
            <style>{`
                .brand-font { font-family: 'Arial Black', sans-serif; font-style: italic; }
            `}</style>

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md transition-all duration-300 border-b border-white/10" id="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                            <span className="text-3xl font-bold text-red-600 brand-font">HD</span>
                            <span className="text-3xl font-bold text-white brand-font">FITNESS</span>
                        </div>
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

            {/* MAIN REGISTER SECTION */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20 bg-gray-900">

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"
                        alt="Gym Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/50"></div>
                </div>

                {/* Register Container */}
                <div className="relative z-10 w-full max-w-5xl flex flex-col-reverse md:flex-row-reverse rounded-3xl overflow-hidden shadow-2xl m-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800">

                    {/* Right Side: Register Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Tạo tài khoản mới</h2>
                            <p className="text-gray-400 text-sm">Bắt đầu hành trình thay đổi bản thân cùng HD Fitness.</p>
                        </div>

                        {/* API Error Message */}
                        {apiError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                {apiError}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleRegister}>
                            {/* Full Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className={`floating-input block px-4 py-3.5 w-full text-sm text-white bg-gray-800/50 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:bg-gray-800 transition-all peer ${errors.fullname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder=" "
                                />
                                <label htmlFor="fullname" className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none ${errors.fullname ? 'text-red-500' : 'text-gray-400 peer-focus:text-red-500'}`}>Họ và tên</label>
                                {errors.fullname && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.fullname}</p>}
                            </div>

                            {/* Phone Number */}
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`floating-input block px-4 py-3.5 w-full text-sm text-white bg-gray-800/50 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:bg-gray-800 transition-all peer ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder=" "
                                />
                                <label htmlFor="phone" className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none ${errors.phone ? 'text-red-500' : 'text-gray-400 peer-focus:text-red-500'}`}>Số điện thoại</label>
                                {errors.phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.phone}</p>}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`floating-input block px-4 py-3.5 w-full text-sm text-white bg-gray-800/50 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:bg-gray-800 transition-all peer ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder=" "
                                />
                                <label htmlFor="email" className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none ${errors.email ? 'text-red-500' : 'text-gray-400 peer-focus:text-red-500'}`}>Email</label>
                                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`floating-input block px-4 py-3.5 w-full text-sm text-white bg-gray-800/50 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:bg-gray-800 transition-all peer pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder=" "
                                />
                                <label htmlFor="password" className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none ${errors.password ? 'text-red-500' : 'text-gray-400 peer-focus:text-red-500'}`}>Mật khẩu</label>
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`floating-input block px-4 py-3.5 w-full text-sm text-white bg-gray-800/50 rounded-xl border appearance-none focus:outline-none focus:ring-1 focus:bg-gray-800 transition-all peer pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder=" "
                                />
                                <label htmlFor="confirmPassword" className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400 peer-focus:text-red-500'}`}>Nhập lại mật khẩu</label>
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.confirmPassword}</p>}
                            </div>

                            {/* Terms Checkbox */}
                            <div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="agreeTerms"
                                            type="checkbox"
                                            checked={formData.agreeTerms}
                                            onChange={handleChange}
                                            className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-red-500/50 text-red-600 transition-all"
                                        />
                                    </div>
                                    <label htmlFor="agreeTerms" className="ml-2 text-sm font-medium text-gray-400 cursor-pointer select-none">
                                        Tôi đồng ý với <a href="#" className="text-red-500 hover:text-red-400 hover:underline transition-colors">Điều khoản & Chính sách</a> của HD Fitness.
                                    </label>
                                </div>
                                {errors.agreeTerms && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle size={10} /> {errors.agreeTerms}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3.5 px-5 border border-transparent rounded-xl shadow-lg shadow-red-900/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-900 uppercase tracking-widest transition-all transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} /> Đang xử lý...
                                    </>
                                ) : (
                                    'Đăng Ký Ngay'
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-400">
                            Đã có tài khoản?
                            <Link to="/login" className="font-bold text-red-500 hover:text-red-400 ml-1 uppercase hover:underline transition-colors">Đăng nhập</Link>
                        </p>
                    </div>

                    {/* Left Side: Banner / Info (Hidden on mobile) */}
                    <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop')" }}>
                        <div className="absolute inset-0 bg-red-900/30 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center z-10">
                            <div className="bg-black/40 p-8 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
                                <h3 className="text-4xl font-bold mb-4 brand-font italic text-white drop-shadow-lg">BE STRONGER<br />THAN YESTERDAY</h3>
                                <p className="text-lg text-gray-200 mb-8 font-light italic opacity-90">
                                    "Cách duy nhất để đạt được điều không tưởng là tin rằng điều đó là có thể."
                                </p>
                                <div className="border-t border-white/20 w-16 mb-8 mx-auto"></div>
                                <ul className="text-left space-y-4 text-gray-100 text-sm font-medium">
                                    <li className="flex items-center"><CheckCircle className="text-red-500 mr-3 shrink-0" size={20} /> <span>Miễn phí đo chỉ số InBody</span></li>
                                    <li className="flex items-center"><CheckCircle className="text-red-500 mr-3 shrink-0" size={20} /> <span>Tặng 01 buổi tập định hướng cùng PT</span></li>
                                    <li className="flex items-center"><CheckCircle className="text-red-500 mr-3 shrink-0" size={20} /> <span>Ưu đãi 30% khi đăng ký gói năm</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterPage;