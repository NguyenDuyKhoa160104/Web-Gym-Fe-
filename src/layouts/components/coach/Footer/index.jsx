import React from 'react';

const Footer = () => (
  <footer className="bg-white border-t border-slate-200 py-6 px-8 mt-auto">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
      <p>© 2024 ProCoach Platform. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="hover:text-blue-600 transition-colors">Điều khoản</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Bảo mật</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Hỗ trợ</a>
      </div>
    </div>
  </footer>
);

export default Footer;
