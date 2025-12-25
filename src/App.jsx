import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './routes/index.jsx'; // Import component Router từ file index.jsx ở trên

function App() {
  return (
    // BrowserRouter phải bọc ngoài cùng để useRoutes hoạt động
    <BrowserRouter>
      {/* Nơi chứa các Context Provider khác nếu có (VD: AuthProvider) */}
      <Router />
    </BrowserRouter>
  );
}

export default App;
