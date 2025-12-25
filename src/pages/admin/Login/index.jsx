import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Cấu hình URL API
const API_URL = import.meta.env?.VITE_API_URL_ADMIN || "http://localhost:5000/api/admin";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  // State quản lý form và giao diện
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // =================================================================
  // LOGIC CHECK LOGIN (Tự động chuyển hướng nếu đã đăng nhập)
  // =================================================================
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('tokenAdmin');

      // Chỉ gọi API khi có token
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
            // Token hợp lệ -> Chuyển hướng ngay lập tức đến Dashboard
            console.log("Phiên đăng nhập hợp lệ, đang chuyển hướng...");
            // Cập nhật lại data mới nhất (optional)
            localStorage.setItem('dataAdmin', JSON.stringify(result.data));
            navigate('/admin/dashboard');
          } else {
            // Token hết hạn hoặc không hợp lệ -> Xóa sạch để đăng nhập lại
            localStorage.removeItem('tokenAdmin');
            localStorage.removeItem('dataAdmin');
          }
        } catch (error) {
          console.error("Lỗi kiểm tra trạng thái đăng nhập:", error);
          // Nếu lỗi mạng, giữ người dùng ở trang login
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
        // Lưu trữ Token vào đúng khóa "tokenAdmin" theo yêu cầu
        localStorage.setItem('tokenAdmin', result.token);
        localStorage.setItem('dataAdmin', JSON.stringify(result.data));

        setMessage({ text: 'Đăng nhập thành công! Đang chuyển hướng...', isError: false });

        // Điều hướng đến dashboard sau 1.5 giây để người dùng kịp thấy thông báo
        setTimeout(() => {
          navigate('/admin/dashboard');
        });
      } else {
        setMessage({ text: result.message || 'Thông tin quản trị không chính xác', isError: true });
        setLoading(false);
      }
    } catch (error) {
      setMessage({ text: 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra server.', isError: true });
      setLoading(false);
    }
  };

  return (
    <div className="admin-bg h-screen w-full flex items-center justify-center antialiased text-gray-200 bg-gray-950 relative overflow-hidden">
      {/* Background Overlay để đảm bảo text rõ ràng */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Logo Area */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-block p-4 rounded-full bg-gray-900/50 border border-gray-700 mb-4 shadow-xl">
            <i className="fas fa-shield-alt text-4xl text-red-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            <span className="text-red-600 brand-font italic">HD</span> <span className="brand-font italic">FITNESS</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Hệ thống quản trị</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 animate-fade-in-up bg-gray-900/40 backdrop-blur-md border border-white/10">

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-3 rounded-lg text-xs font-bold text-center border animate-pulse ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email/Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300 block">Tài khoản quản trị</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user-shield text-gray-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type="email"
                  id="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-900 transition-colors sm:text-sm"
                  placeholder="admin@hdfitness.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300 block">Mật khẩu bảo mật</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-900 transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Duy trì đăng nhập</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-red-500 hover:text-red-400 transition-colors">Quên mật khẩu?</a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 uppercase tracking-wider transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-sign-in-alt mr-2 mt-0.5"></i>
              )}
              {loading ? "Đang xác thực..." : "Truy cập hệ thống"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-white flex items-center justify-center transition-colors group">
              <i className="fas fa-arrow-left mr-2 transform group-hover:-translate-x-1 transition-transform"></i> Quay lại trang chủ
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 HD Fitness Management System. Version 2.0
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;