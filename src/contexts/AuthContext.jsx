import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_CONFIG } from '@/lib/constants';
import { apiService } from '@/services/api';

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
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('autocare_token');
      const savedUser = localStorage.getItem('autocare_user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token and get complete user profile from backend
          apiService.setAuthToken(savedToken);
          const verifyResponse = await apiService.verifyToken();
          
          if (verifyResponse.success) {
            // Get complete profile with messages and requests
            const profileResponse = await apiService.getProfile();
            
            if (profileResponse.success) {
              const userData = {
                ...profileResponse.data.user,
                token: savedToken,
                messages: profileResponse.data.messages || [],
                bookings: profileResponse.data.bookings || [],
                statistics: profileResponse.data.statistics || {}
              };
              setUser(userData);
              localStorage.setItem('autocare_user', JSON.stringify(userData));
            } else {
              // Fallback to basic user data
              const userData = {
                ...verifyResponse.user,
                token: savedToken
              };
              setUser(userData);
              localStorage.setItem('autocare_user', JSON.stringify(userData));
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('autocare_token');
            localStorage.removeItem('autocare_user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('autocare_token');
          localStorage.removeItem('autocare_user');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Use backend API for login
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // Set auth token for future requests
        apiService.setAuthToken(response.token);
        
        // Get complete profile data after login
        try {
          const profileResponse = await apiService.getProfile();
          
          if (profileResponse.success) {
            const userData = {
              ...profileResponse.data.user,
              token: response.token,
              messages: profileResponse.data.messages || [],
              bookings: profileResponse.data.bookings || [],
              statistics: profileResponse.data.statistics || {}
            };
            
            setUser(userData);
            localStorage.setItem('autocare_token', response.token);
            localStorage.setItem('autocare_user', JSON.stringify(userData));
            
            return userData;
          }
        } catch (profileError) {
          console.warn('Could not load profile data:', profileError);
        }
        
        // Fallback to basic user data
        const userData = {
          ...response.user,
          token: response.token
        };
        
        setUser(userData);
        localStorage.setItem('autocare_token', response.token);
        localStorage.setItem('autocare_user', JSON.stringify(userData));
        
        return userData;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Use backend API for registration
      const response = await apiService.register(userData);
      
      if (response.success) {
        const newUserData = {
          ...response.user,
          token: response.token
        };
        
        // Set auth token for future requests
        apiService.setAuthToken(response.token);
        
        // Save to state and localStorage
        setUser(newUserData);
        localStorage.setItem('autocare_token', response.token);
        localStorage.setItem('autocare_user', JSON.stringify(newUserData));
        
        return newUserData;
      } else {
        // Enhanced error handling for duplicate emails
        const error = new Error(response.message || 'Registration failed');
        error.code = response.code;
        error.action = response.action;
        error.userType = response.userType;
        throw error;
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error handling for better user experience
      if (error.message && error.message.includes('already been signed up')) {
        const enhancedError = new Error(error.message);
        enhancedError.code = 'EMAIL_ALREADY_EXISTS';
        enhancedError.action = 'redirect_to_login';
        throw enhancedError;
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await apiService.checkEmailAvailability(email);
      return response;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return { success: false, available: true, message: 'Could not check email availability' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autocare_user');
    localStorage.removeItem('autocare_token');
    apiService.setAuthToken(null);
  };

  const updateUser = async (updatedData) => {
    if (user) {
      try {
        // Update user data on backend
        const response = await apiService.updateProfile(updatedData);
        
        if (response.success) {
          const newUserData = { ...user, ...response.user };
          setUser(newUserData);
          localStorage.setItem('autocare_user', JSON.stringify(newUserData));
          return newUserData;
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } catch (error) {
        console.error('Update user error:', error);
        // Fallback to local update
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);
        localStorage.setItem('autocare_user', JSON.stringify(newUserData));
        return newUserData;
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
    checkEmailAvailability
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};