import React from 'react';
import { User, LogOut, Bell, Moon, Sun } from 'lucide-react';
import { getCurrentUser, setCurrentUser, getNotifications, markNotificationAsRead, getTheme, setTheme } from '../../utils/storage';
import { NotificationDropdown } from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, onLogout }) => {
  const currentUser = getCurrentUser();
  const [notifications, setNotifications] = React.useState(() => 
    getNotifications().filter(n => n.userId === currentUser?.id && !n.read)
  );
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [theme, setThemeState] = React.useState(getTheme);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleNotificationRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">HRMS Portal</h1>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600 dark:text-gray-400">|</span>
                <span className="ml-4 text-gray-700 dark:text-gray-300 font-medium">{title}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
                </button>
                {showNotifications && (
                  <NotificationDropdown 
                    notifications={getNotifications().filter(n => n.userId === currentUser?.id)}
                    onClose={() => setShowNotifications(false)}
                    onMarkAsRead={handleNotificationRead}
                  />
                )}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role}</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {currentUser?.name?.charAt(0)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};