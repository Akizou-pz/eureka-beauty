'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Customer } from '@/lib/db';

interface AuthContextType {
  user: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  register: (data: Omit<Customer, 'id' | 'loyalty_points' | 'role'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static mock password mappings for local validation
const ACCOUNT_PASSWORDS: Record<string, string> = {
  'admin@eurekabeauty.com': 'admin123',
  'customer@eurekabeauty.com': 'customer123',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eb_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerEmail = email.toLowerCase();
        
        // 1. Admin login override
        if (lowerEmail === 'admin@eurekabeauty.com' && password === 'admin123') {
          const adminUser: Customer = {
            id: 'cust-admin-001',
            first_name: 'Directrice',
            last_name: 'Eureka',
            email: lowerEmail,
            phone: '+225 07070707',
            whatsapp: '+225 07070707',
            loyalty_points: 9999,
            role: 'admin',
          };
          setUser(adminUser);
          localStorage.setItem('eb_session', JSON.stringify(adminUser));
          resolve({ success: true, isAdmin: true });
          return;
        }

        // 2. Customer login check
        if (lowerEmail === 'customer@eurekabeauty.com' && password === 'customer123') {
          const customerUser: Customer = {
            id: 'cust-customer-001',
            first_name: 'Fatou',
            last_name: 'Diallo',
            email: lowerEmail,
            phone: '+221 77 123 45 67',
            whatsapp: '+221 77 123 45 67',
            loyalty_points: 150,
            role: 'customer',
          };
          setUser(customerUser);
          localStorage.setItem('eb_session', JSON.stringify(customerUser));
          resolve({ success: true, isAdmin: false });
          return;
        }

        // 3. Dynamic Registered users lookup
        const registeredUsers = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
        if (registeredUsers[lowerEmail] && registeredUsers[lowerEmail].password === password) {
          const matchedUser: Customer = {
            id: registeredUsers[lowerEmail].id,
            first_name: registeredUsers[lowerEmail].first_name,
            last_name: registeredUsers[lowerEmail].last_name,
            email: lowerEmail,
            phone: registeredUsers[lowerEmail].phone,
            whatsapp: registeredUsers[lowerEmail].whatsapp,
            loyalty_points: registeredUsers[lowerEmail].loyalty_points || 0,
            role: 'customer',
          };
          setUser(matchedUser);
          localStorage.setItem('eb_session', JSON.stringify(matchedUser));
          resolve({ success: true, isAdmin: false });
        } else {
          resolve({ success: false, error: 'Identifiants incorrects (Mot de passe incorrect ou email non inscrit)' });
        }
      }, 500);
    });
  };

  const register = async (data: Omit<Customer, 'id' | 'loyalty_points' | 'role'> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerEmail = data.email.toLowerCase();
        
        // Block registering default seeds
        if (lowerEmail === 'admin@eurekabeauty.com' || lowerEmail === 'customer@eurekabeauty.com') {
          resolve({ success: false, error: 'Cet email est déjà réservé par le système.' });
          return;
        }

        const registeredUsers = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
        if (registeredUsers[lowerEmail]) {
          resolve({ success: false, error: 'Un compte avec cet e-mail existe déjà.' });
          return;
        }

        const newId = 'cust-' + Math.random().toString(36).substr(2, 9);
        const newUserRecord = {
          ...data,
          id: newId,
          password: data.password || 'password123',
          loyalty_points: 50, // 50 points sign up bonus!
          role: 'customer',
        };

        registeredUsers[lowerEmail] = newUserRecord;
        localStorage.setItem('eb_users_db', JSON.stringify(registeredUsers));

        // Auto-login after registration
        const sessionUser: Customer = {
          id: newId,
          first_name: data.first_name,
          last_name: data.last_name,
          email: lowerEmail,
          phone: data.phone,
          whatsapp: data.whatsapp,
          loyalty_points: 50,
          role: 'customer',
        };

        setUser(sessionUser);
        localStorage.setItem('eb_session', JSON.stringify(sessionUser));

        resolve({ success: true });
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eb_session');
  };

  const updateProfile = (updates: Partial<Customer>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('eb_session', JSON.stringify(updated));

    // Update in users database also
    const lowerEmail = user.email.toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
    if (registeredUsers[lowerEmail]) {
      registeredUsers[lowerEmail] = { ...registeredUsers[lowerEmail], ...updates };
      localStorage.setItem('eb_users_db', JSON.stringify(registeredUsers));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
