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
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isUpload = location.pathname === '/';
    const isNotif  = location.pathname === '/notifications';

    return (
        <header className="header">
            {/* Top bar */}
            <div className="header-top">
                <div className="header-top-inner">
                    {/* Left: logo */}
                    <div className="logo-area">
                        <div className="logo-icon-wrap">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        </div>
                        <span className="logo-text">SWS AI Document Hub</span>
                        <span className="live-badge">LIVE DEMO</span>
                    </div>

                    {/* Right: bell */}
                    <div className="notif-bell" ref={dropRef}>
                        <button
                            className="bell-btn"
                            onClick={() => setOpen(!open)}
                            aria-label="Notifications"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </button>

                        {open && (
                            <div className="notif-dropdown">
                                <div className="notif-header">
                                    <span>Notifications</span>
                                    <button onClick={markAllRead}>Mark all read</button>
                                </div>
                                <div className="notif-list">
                                    {notifications.length === 0 && (
                                        <div className="notif-empty">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                            </svg>
                                            <p>No notifications yet</p>
                                        </div>
                                    )}
                                    {notifications.slice(0, 6).map(n => (
                                        <div
                                            key={n._id}
                                            className={`notif-item ${n.isRead ? 'read' : 'unread'} type-${n.type}`}
                                            onClick={() => markAsRead(n._id)}
                                        >
                                            <div className="notif-item-icon">
                                                {n.type === 'success' ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                ) : n.type === 'error' ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                )}
                                            </div>
                                            <div className="notif-item-body">
                                                <span className="notif-msg">{n.message}</span>
                                                <span className="notif-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {!n.isRead && <span className="unread-dot" />}
                                        </div>
                                    ))}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="notif-footer">
                                        <Link to="/notifications" onClick={() => setOpen(false)}>View all notifications</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab nav */}
            <div className="header-tabs">
                <div className="header-tabs-inner">
                    <Link to="/" className={`tab-link ${isUpload ? 'active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16"/>
                            <line x1="12" y1="12" x2="12" y2="21"/>
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                        </svg>
                        Document Upload
                    </Link>
                    <Link to="/notifications" className={`tab-link ${isNotif ? 'active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        Notifications
                        {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
                    </Link>
                </div>
            </div>
        </header>
    );
}