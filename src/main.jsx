import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import file CSS toàn cục (Tailwind directives thường nằm ở đây)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);