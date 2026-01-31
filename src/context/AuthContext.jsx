import { useState } from 'react';
import { authAPI } from '../Apis/api';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContextDef';

// Re-export for convenience
export { AuthContext };

// Helper function to get initial auth state
const getInitialAuthState = () => {
  const storedUser = localStorage.getItem('adminUser');
  const storedToken = localStorage.getItem('adminToken');
  
  if (storedUser && storedToken) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'admin') {
        return { user: parsedUser, isAuthenticated: true };
      }
      // Clear non-admin user data
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    } catch {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    }
  }
  return { user: null, isAuthenticated: false };
};

export const AuthProvider = ({ children }) => {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState(initialState.user);
  const [loading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data.data;
      
      if (userData.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        return { success: false, message: 'Not authorized' };
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
