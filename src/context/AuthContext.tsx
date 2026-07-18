'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '@/lib/db';
import { supabase, HAS_SUPABASE_CREDS } from '@/lib/supabaseClient';

interface AuthContextType {
  user: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  register: (data: Omit<Customer, 'id' | 'loyalty_points' | 'role'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize database customer profile from Supabase Auth details
  const syncUserSession = async (authUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        // User exists in auth but doesn't have a public.customers row yet (first-time social signup)
        const nameParts = (authUser.user_metadata?.full_name || '').split(' ');
        const firstName = authUser.user_metadata?.first_name || nameParts[0] || 'Client';
        const lastName = authUser.user_metadata?.last_name || nameParts.slice(1).join(' ') || 'Eureka';
        
        const newCustomer: Customer = {
          id: authUser.id,
          first_name: firstName,
          last_name: lastName,
          email: authUser.email || '',
          phone: authUser.phone || '',
          whatsapp: '',
          loyalty_points: 50, // 50 loyalty points signup bonus
          role: 'customer',
        };

        // Try inserting the new customer profile
        await supabase.from('customers').insert([newCustomer]);
        
        setUser(newCustomer);
        localStorage.setItem('eb_session', JSON.stringify(newCustomer));
      } else {
        // Exists: sync profile values to the local state
        setUser(profile);
        localStorage.setItem('eb_session', JSON.stringify(profile));
      }
    } catch (e) {
      console.error('Failed to sync auth user to database:', e);
    }
  };

  // Load user from localStorage on mount and register Supabase auth listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eb_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }

      if (HAS_SUPABASE_CREDS) {
        // Get active auth session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            syncUserSession(session.user);
          }
        });

        // Listen for authentication changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await syncUserSession(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('eb_session');
          }
        });

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> => {
    const lowerEmail = email.toLowerCase();
    
    if (HAS_SUPABASE_CREDS) {
      // 1. Supabase Auth Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lowerEmail,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch or create profile
        const { data: profile } = await supabase
          .from('customers')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser(profile);
          localStorage.setItem('eb_session', JSON.stringify(profile));
          return { success: true, isAdmin: profile.role === 'admin' };
        } else {
          // Fallback profile creation
          const newCustomer: Customer = {
            id: data.user.id,
            first_name: data.user.user_metadata?.first_name || 'Client',
            last_name: data.user.user_metadata?.last_name || 'Eureka',
            email: lowerEmail,
            phone: '',
            whatsapp: '',
            loyalty_points: 0,
            role: 'customer',
          };
          await supabase.from('customers').insert([newCustomer]);
          setUser(newCustomer);
          localStorage.setItem('eb_session', JSON.stringify(newCustomer));
          return { success: true, isAdmin: false };
        }
      }
      return { success: false, error: 'Connexion échouée' };
    } else {
      // 2. Local storage mock lookup fallback (Offline mode)
      
      // Static mock login overrides for rapid testing/admin demo
      if (lowerEmail === 'admin@eurekabeauty.com' && password === 'admin123') {
        const adminUser: Customer = {
          id: 'cust-admin-001',
          first_name: 'Directrice',
          last_name: 'Eureka',
          email: lowerEmail,
          phone: '+228 93866752',
          whatsapp: '+228 93866752',
          loyalty_points: 9999,
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('eb_session', JSON.stringify(adminUser));
        return { success: true, isAdmin: true };
      }

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
        return { success: true, isAdmin: false };
      }

      return new Promise((resolve) => {
        setTimeout(() => {
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
              role: registeredUsers[lowerEmail].role || 'customer',
            };
            setUser(matchedUser);
            localStorage.setItem('eb_session', JSON.stringify(matchedUser));
            resolve({ success: true, isAdmin: matchedUser.role === 'admin' });
          } else {
            resolve({ success: false, error: 'Identifiants incorrects (Mot de passe incorrect ou email non inscrit)' });
          }
        }, 500);
      });
    }
  };

  const register = async (data: Omit<Customer, 'id' | 'loyalty_points' | 'role'> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    const lowerEmail = data.email.toLowerCase();
    
    if (lowerEmail === 'admin@eurekabeauty.com' || lowerEmail === 'customer@eurekabeauty.com') {
      return { success: false, error: 'Cet email est déjà réservé par le système.' };
    }

    if (HAS_SUPABASE_CREDS) {
      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: lowerEmail,
        password: data.password || 'password123',
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        const newCustomer: Customer = {
          id: authData.user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: lowerEmail,
          phone: data.phone,
          whatsapp: data.whatsapp,
          loyalty_points: 50, // 50 loyalty points signup bonus
          role: 'customer',
        };

        // Create profile in DB
        const { error: dbError } = await supabase.from('customers').insert([newCustomer]);
        if (dbError) console.error('Database customer profile creation failed:', dbError);

        setUser(newCustomer);
        localStorage.setItem('eb_session', JSON.stringify(newCustomer));
        return { success: true };
      }

      return { success: false, error: 'Inscription échouée' };
    } else {
      // 2. Local storage mock signup fallback
      return new Promise((resolve) => {
        setTimeout(() => {
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
            loyalty_points: 50, // 50 points bonus
            role: 'customer',
          };

          registeredUsers[lowerEmail] = newUserRecord;
          localStorage.setItem('eb_users_db', JSON.stringify(registeredUsers));

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
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('eb_session');
    if (HAS_SUPABASE_CREDS) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (updates: Partial<Customer>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('eb_session', JSON.stringify(updated));

    if (HAS_SUPABASE_CREDS) {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', user.id);
      if (error) console.error('Failed to update customer profile in Supabase:', error);
    } else {
      const lowerEmail = user.email.toLowerCase();
      const registeredUsers = JSON.parse(localStorage.getItem('eb_users_db') || '{}');
      if (registeredUsers[lowerEmail]) {
        registeredUsers[lowerEmail] = { ...registeredUsers[lowerEmail], ...updates };
        localStorage.setItem('eb_users_db', JSON.stringify(registeredUsers));
      }
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (HAS_SUPABASE_CREDS) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Simulate Google authentication locally (Offline mode)
      return new Promise((resolve) => {
        setTimeout(() => {
          const googleUser: Customer = {
            id: 'cust-google-' + Math.random().toString(36).substr(2, 9),
            first_name: 'Utilisateur',
            last_name: 'Google',
            email: 'google.user@example.com',
            phone: '',
            whatsapp: '',
            loyalty_points: 50,
            role: 'customer',
          };
          setUser(googleUser);
          localStorage.setItem('eb_session', JSON.stringify(googleUser));
          resolve({ success: true });
        }, 800);
      });
    }
  };

  const signInWithFacebook = async (): Promise<{ success: boolean; error?: string }> => {
    if (HAS_SUPABASE_CREDS) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Simulate Facebook authentication locally (Offline mode)
      return new Promise((resolve) => {
        setTimeout(() => {
          const facebookUser: Customer = {
            id: 'cust-fb-' + Math.random().toString(36).substr(2, 9),
            first_name: 'Utilisateur',
            last_name: 'Facebook',
            email: 'facebook.user@example.com',
            phone: '',
            whatsapp: '',
            loyalty_points: 50,
            role: 'customer',
          };
          setUser(facebookUser);
          localStorage.setItem('eb_session', JSON.stringify(facebookUser));
          resolve({ success: true });
        }, 800);
      });
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
        signInWithGoogle,
        signInWithFacebook,
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
