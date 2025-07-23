import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_CONFIG } from '@/lib/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

  const ADMIN_USERS = ADMIN_CONFIG.EMAILS;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('autocare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if this is an admin login
    const admin = ADMIN_CONFIG.ADMINS.find(admin => 
      admin.email === email && admin.password === password
    );
    
    if (admin) {
      const userData = {
        id: admin.email,
        email: admin.email,
        name: admin.name,
        username: admin.username,
        isAdmin: true,
        role: admin.role,
        joinDate: new Date().toISOString(),
        vehicleCount: 0,
        lastService: null
      };
      
      setUser(userData);
      localStorage.setItem('autocare_user', JSON.stringify(userData));
      return userData;
    }
    
    // Regular user login (simplified - in production this would validate against a database)
    if (ADMIN_CONFIG.EMAILS.includes(email)) {
      throw new Error('Please use the correct admin password');
    }
    
    const userData = {
      id: Date.now(),
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      isAdmin: false,
      joinDate: new Date().toISOString(),
      vehicleCount: Math.floor(Math.random() * 3) + 1,
      lastService: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setUser(userData);
    localStorage.setItem('autocare_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if trying to register with admin email
    if (ADMIN_CONFIG.EMAILS.includes(userData.email)) {
      throw new Error('Admin accounts cannot be registered. Please contact system administrator.');
    }
    
    const newUser = {
      id: Date.now(),
      ...userData,
      isAdmin: false,
      joinDate: new Date().toISOString(),
      vehicleCount: 1,
      lastService: null
    };
    
    setUser(newUser);
    localStorage.setItem('autocare_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autocare_user');
  };

  const updateUser = (updatedData) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('autocare_user', JSON.stringify(newUserData));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};