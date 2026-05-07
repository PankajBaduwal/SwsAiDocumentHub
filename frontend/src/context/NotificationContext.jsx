import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationContext = createContext();
const socket = io('http://localhost:5000');

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        const res = await axios.get('http://localhost:5000/api/notifications');
        setNotifications(res.data);
    };

    useEffect(() => {
        fetchNotifications();
        socket.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });
        return () => socket.off('notification');
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    const markAllRead = async () => {
        await axios.patch('http://localhost:5000/api/notifications/mark-all-read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);