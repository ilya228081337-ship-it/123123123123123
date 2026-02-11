import { useState } from 'react';
import { User } from './lib/supabase';
import LoginForm from './components/LoginForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (currentUser.role === 'manager') {
    return <ManagerDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <EmployeeDashboard user={currentUser} onLogout={handleLogout} />;
}

export default App;
