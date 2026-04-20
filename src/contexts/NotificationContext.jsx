import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const add = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notif = { id, message, type, time: new Date(), read: false };
    setNotifications(prev => [notif, ...prev].slice(0, 30)); // max 30
    if (duration > 0) setTimeout(() => markRead(id), duration);
    return id;
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, add, markRead, markAllRead, remove, clear, unread }}>
      {children}
    </NotificationContext.Provider>
  );
};
