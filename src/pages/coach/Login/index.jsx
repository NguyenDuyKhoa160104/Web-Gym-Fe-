import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Component đăng nhập dành cho Huấn Luyện Viên
 * Tích hợp logic tự động kiểm tra đăng nhập (Auth Guard)
 */
export const CoachLoginPage = () => {
  const navigate = useNavigate();

  // --- States ---
  const [formData, setFormData] = useState({
    coach_id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Trạng thái kiểm tra token khi vào trang
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_URL = 'http://localhost:5000/api/coach';

  // --- Effect: Tự động kiểm tra đăng nhập khi vừa vào trang ---
  useEffect(() => {
    const checkIsLoggedIn = async () => {
      const token = localStorage.getItem('tokenCoach');

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/check-login`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Nếu đã đăng nhập thành công, đẩy thẳng vào dashboard
          navigate('/coach/dashboard');
        } else {
          // Token không hợp lệ thì xóa đi và cho phép ở lại trang login
          localStorage.removeItem('tokenCoach');
          localStorage.removeItem('dataCoach');
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra đăng nhập:", err);
        setIsCheckingAuth(false);
      }
    };

    checkIsLoggedIn();
  }, [navigate]);

  // --- Handlers ---

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.coach_id || !formData.password) {
      setErrorMessage('Vui lòng nhập đầy đủ mã HLV và mật khẩu');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.coach_id,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
      }

      setSuccessMessage('Đăng nhập thành công!');

      if (data.token) {
        localStorage.setItem('tokenCoach', data.token);
        localStorage.setItem('dataCoach', JSON.stringify(data.coach));
      }

      // Chuyển hướng ngay lập tức, không cần đợi
      navigate('/coach/dashboard');

    } catch (err) {
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  // Màn hình chờ khi đang check token
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Đang xác thực phiên làm việc...</p>
      </div>
    );
  }

  return (
    <div className="coach-bg min-h-screen w-full flex items-center justify-center antialiased text-gray-200 bg-gray-950">
      <style>{`
        .coach-bg {
          background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1600');
          background-size: cover;
          background-position: center;
        }
        .glass-panel {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .brand-font { font-family: 'Arial Black', sans-serif; }
      `}</style>

      <div className="w-full max-w-md p-6">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-gray-900/50 border border-gray-700 mb-4 shadow-xl">
            <i className="fas fa-dumbbell text-4xl text-red-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            <span className="text-red-600 brand-font italic">HD</span> <span className="brand-font italic">FITNESS</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Cổng thông tin Huấn Luyện Viên</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white uppercase">Đăng nhập hệ thống</h2>
            <p className="text-sm text-gray-400">Quản lý lịch dạy và thông tin hội viên</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 text-green-500 text-sm flex items-center gap-2 animate-bounce">
              <i className="fas fa-check-circle"></i>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>

            {/* Coach ID / Email */}
            <div className="space-y-2">
              <label htmlFor="coach_id" className="text-sm font-medium text-gray-300 block">Mã HLV / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-id-card text-gray-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type="text"
                  id="coach_id"
                  value={formData.coach_id}
                  onChange={handleChange}
                  required
                  disabled={isLoading || successMessage}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-900 transition-all sm:text-sm disabled:opacity-50"
                  placeholder="Ex: PT001 hoặc coach@hdfitness.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300 block">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-key text-gray-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading || successMessage}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-900 transition-all sm:text-sm disabled:opacity-50"
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

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Ghi nhớ tôi</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-red-500 hover:text-red-400 transition-colors">Quên mật khẩu?</a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || successMessage}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 uppercase tracking-wider transition-all transform ${(isLoading || successMessage) ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {(isLoading || successMessage) ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {successMessage ? 'Đang chuyển hướng...' : 'Đang kiểm tra...'}
                </div>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2 mt-0.5"></i> Vào Workspace
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center space-y-3">
            <Link to="/" className="block text-sm text-gray-500 hover:text-white transition-colors">
              <i className="fas fa-arrow-left mr-1"></i> Trang chủ
            </Link>
            <div className="text-xs text-gray-600">
              Cần hỗ trợ kỹ thuật? Liên hệ IT: <span className="text-gray-400">support@hdfitness.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachLoginPage;