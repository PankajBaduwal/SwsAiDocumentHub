import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './Header.css';

export default function Header() {
    const location = useLocation();
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropRef = useRef();

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo">
                    <span className="logo-icon">📄</span>
                    <span>DocManager</span>
                </div>
                <nav className="nav">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Upload</Link>
                    <Link to="/documents" className={location.pathname === '/documents' ? 'active' : ''}>Documents</Link>
                    <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>Notifications</Link>
                </nav>
                <div className="notif-bell" ref={dropRef}>
                    <button className="bell-btn" onClick={() => setOpen(!open)}>
                        🔔
                        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                    </button>
                    {open && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <span>Notifications</span>
                                <button onClick={markAllRead}>Mark all read</button>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 && <p className="empty">No notifications yet</p>}
                                {notifications.slice(0, 5).map(n => (
                                    <div key={n._id} className={`notif-item ${n.isRead ? 'read' : 'unread'} ${n.type}`} onClick={() => markAsRead(n._id)}>
                                        <span className="notif-msg">{n.message}</span>
                                        <span className="notif-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}