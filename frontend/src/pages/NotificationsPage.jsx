import { useNotifications } from '../context/NotificationContext';
import './NotificationsPage.css';

const typeIcon = (type) => {
    if (type === 'success') return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    );
    if (type === 'error') return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    );
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    );
};

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllRead } = useNotifications();
    const unread = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notif-page">
            <div className="notif-page-header">
                <div>
                    <h1 className="notif-page-title">Notifications</h1>
                    <p className="notif-page-sub">
                        {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unread > 0 && (
                    <button className="mark-all-btn" onClick={markAllRead}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="notif-page-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <p>No notifications yet</p>
                    <span>System events will appear here once actions are performed</span>
                </div>
            ) : (
                <div className="notif-page-list">
                    {notifications.map(n => (
                        <div
                            key={n._id}
                            className={`notif-card type-${n.type} ${n.isRead ? 'read' : 'unread'}`}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                        >
                            <div className={`nc-icon type-${n.type}`}>
                                {typeIcon(n.type)}
                            </div>
                            <div className="nc-body">
                                <p className="nc-msg">{n.message}</p>
                                <p className="nc-time">
                                    {new Date(n.createdAt).toLocaleString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div className="nc-right">
                                {!n.isRead && <span className="unread-pill">Unread</span>}
                                {n.isRead && <span className="read-pill">Read</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}