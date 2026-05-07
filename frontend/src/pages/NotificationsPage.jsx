import { useNotifications } from '../context/NotificationContext';
import './NotificationsPage.css';

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllRead } = useNotifications();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-sub">{notifications.filter(n => !n.isRead).length} unread</p>
                </div>
                <button className="btn-outline" onClick={markAllRead}>Mark all as read</button>
            </div>

            {notifications.length === 0 && (
                <div className="empty-state"><div style={{ fontSize: '3rem' }}>🔔</div><p>No notifications yet</p></div>
            )}

            <div className="notif-full-list">
                {notifications.map(n => (
                    <div key={n._id} className={`notif-card ${n.type} ${n.isRead ? 'read' : 'unread'}`} onClick={() => markAsRead(n._id)}>
                        <div className="notif-card-icon">
                            {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}
                        </div>
                        <div className="notif-card-body">
                            <p className="notif-card-msg">{n.message}</p>
                            <p className="notif-card-time">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <span className="unread-dot" />}
                    </div>
                ))}
            </div>
        </div>
    );
}