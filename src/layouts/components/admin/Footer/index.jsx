import React from 'react';

const Footer = () => {
    return (
        <footer className="py-6 px-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto bg-slate-50">
            <p>&copy; {new Date().getFullYear()} WebGym Management System. All rights reserved.</p>
            <div className="mt-2 space-x-4">
                <a href="#" className="hover:text-blue-600 transition-colors">Điều khoản</a>
                <span>•</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Bảo mật</a>
                <span>•</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Hỗ trợ</a>
            </div>
        </footer>
    );
};

export default Footer;