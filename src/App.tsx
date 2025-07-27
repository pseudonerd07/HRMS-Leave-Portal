import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { getCurrentUser, getTheme } from './utils/storage';
import { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize theme
    const theme = getTheme();
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'employee') {
    return <EmployeeDashboard onLogout={handleLogout} />;
  }

  if (currentUser.role === 'manager') {
    return <ManagerDashboard onLogout={handleLogout} />;
  }

  return null;
}

export default App;