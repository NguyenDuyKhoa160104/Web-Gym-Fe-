import { Link } from "react-router-dom";

// Note: The original HTML included a direct link to Google Fonts.
// It's recommended to move this import to the main index.html file or a global CSS file.
// `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');`
// body { font-family: 'Roboto', sans-serif; }
// h1, h2, h3, .brand-font { font-family: 'Oswald', sans-serif; }

const RegisterPage = () => {
    // JS for navbar background on scroll can be implemented with a useEffect hook
    // For simplicity, it's omitted here but can be added.

    return (
        <>
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-transparent transition-all duration-300" id="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0 cursor-pointer">
                            <span className="text-3xl font-bold text-red-500 brand-font italic">HD</span>
                            <span className="text-3xl font-bold text-white brand-font italic">FITNESS</span>
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
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20">
                
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" 
                        alt="Gym Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/85"></div>
                </div>

                {/* Register Container */}
                <div className="relative z-10 w-full max-w-4xl flex flex-row-reverse rounded-2xl overflow-hidden shadow-2xl m-4">
                    
                    {/* Right Side: Register Form */}
                    <div className="w-full md:w-1/2 bg-gray-900 p-8 md:p-12 border-l border-gray-800">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2 brand-font uppercase">Tạo tài khoản mới</h2>
                            <p className="text-gray-400 text-sm">Bắt đầu hành trình thay đổi bản thân cùng HD Fitness.</p>
                        </div>

                        <form className="space-y-5">
                            {/* Full Name */}
                            <div className="relative">
                                <input type="text" id="fullname" className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer" placeholder=" " />
                                <label htmlFor="fullname" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Họ và tên</label>
                            </div>

                            {/* Phone Number */}
                            <div className="relative">
                                <input type="tel" id="phone" className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer" placeholder=" " />
                                <label htmlFor="phone" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Số điện thoại</label>
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input type="email" id="email" className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer" placeholder=" " />
                                <label htmlFor="email" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Email</label>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input type="password" id="password" className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer" placeholder=" " />
                                <label htmlFor="password" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Mật khẩu</label>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input type="password" id="confirm-password" className="floating-input block px-4 py-3 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 peer" placeholder=" " />
                                <label htmlFor="confirm-password" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 cursor-text pointer-events-none">Nhập lại mật khẩu</label>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="terms" type="checkbox" className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-red-300" required />
                                </div>
                                <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-400">Tôi đồng ý với <a href="#" className="text-red-500 hover:underline">Điều khoản & Chính sách</a> của HD Fitness.</label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-lg text-sm px-5 py-3 text-center uppercase tracking-wider transition-transform transform hover:scale-[1.02]">
                                Đăng Ký Ngay
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-400">
                            Đã có tài khoản? 
                            <Link to="/login" className="font-bold text-red-500 hover:text-red-400 ml-1 uppercase">Đăng nhập</Link>
                        </p>
                    </div>

                    {/* Left Side: Banner / Info (Hidden on mobile) */}
                    <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop')"}}>
                        <div className="absolute inset-0 bg-black/60 mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
                            <h3 className="text-4xl font-bold mb-4 brand-font italic">BE STRONGER<br/>THAN YESTERDAY</h3>
                            <p className="text-lg text-gray-200 mb-8 font-light italic">
                                "Cách duy nhất để đạt được điều không tưởng là tin rằng điều đó là có thể."
                            </p>
                            <div className="border-t border-white/30 w-16 mb-8"></div>
                            <ul className="text-left space-y-4 text-gray-200">
                                <li className="flex items-center"><i className="fas fa-check text-red-500 mr-3"></i> Miễn phí đo InBody</li>
                                <li className="flex items-center"><i className="fas fa-check text-red-500 mr-3"></i> Tặng 01 buổi tập PT 1:1</li>
                                <li className="flex items-center"><i className="fas fa-check text-red-500 mr-3"></i> Ưu đãi 30% khi mua gói năm</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterPage;
