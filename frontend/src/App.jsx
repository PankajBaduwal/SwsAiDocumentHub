import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </NotificationProvider>
  );
}