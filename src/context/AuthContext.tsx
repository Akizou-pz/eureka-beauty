'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '@/lib/db';
import { supabase, HAS_SUPABASE_CREDS } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

interface AuthContextType {
  user: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  register: (data: Omit<Customer, 'id' | 'loyalty_points' | 'role'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; role?: string; redirectUrl?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string; role?: string; redirectUrl?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize database customer profile from Supabase Auth details
  const syncUserSession = async (authUser: any): Promise<Customer> => {
    const nameParts = (authUser.user_metadata?.full_name || authUser.email || '').split(' ');
    const firstName = authUser.user_metadata?.first_name || nameParts[0] || 'Client';
    const lastName = authUser.user_metadata?.last_name || nameParts.slice(1).join(' ') || 'Eureka';
    
    let fallbackProfile: Customer = {
      id: authUser.id,
      first_name: firstName,
      last_name: lastName,
      email: authUser.email || '',
      phone: authUser.phone || '',
      whatsapp: '',
      loyalty_points: 50,
      role: authUser.email?.toLowerCase().includes('admin') ? 'admin' : 'customer',
    };

    try {
      let { data: profile } = await supabase
        .from('customers')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!profile && authUser.email) {
        const { data: profileByEmail } = await supabase
          .from('customers')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();

        if (profileByEmail) {
          profile = profileByEmail;
          try { await supabase.from('customers').update({ id: authUser.id }).eq('email', authUser.email); } catch (e) {}
        }
      }

      if (!profile) {
        try { await supabase.from('customers').insert([fallbackProfile]); } catch (e) {}
        profile = fallbackProfile;
      }

      setUser(profile);
      localStorage.setItem('eb_session', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.warn('Database sync warning (using fallback session):', e);
      setUser(fallbackProfile);
      localStorage.setItem('eb_session', JSON.stringify(fallbackProfile));
      return fallbackProfile;
    }
  };

  const redirectByRole = (role?: string) => {
    if (typeof window === 'undefined') return;
    const target = role === 'admin' ? '/admin/' : role === 'delivery' ? '/admin/orders/' : '/dashboard/';
    
    // Notify UI components of login
    window.dispatchEvent(new CustomEvent('eb_user_login', { detail: { role } }));

    if (window.location.pathname !== target && window.location.pathname !== target.slice(0, -1)) {
      window.location.href = target;
    }
  };

  // Load user from localStorage on mount and register Supabase auth listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eb_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }

      // Handle native Android / iOS deep link return from Google/Facebook login
      if (Capacitor.isNativePlatform()) {
        App.addListener('appUrlOpen', async (event) => {
          console.log('🔗 Native App opened via deep link:', event.url);
          try {
            await Browser.close();
          } catch (e) {
            // Browser might already be closed
          }
          if (event.url.includes('access_token') || event.url.includes('code=') || event.url.includes('auth/callback')) {
            try {
              let cleanUrlStr = event.url;
              if (cleanUrlStr.startsWith('com.eurekabeauty.app://')) {
                cleanUrlStr = cleanUrlStr.replace('com.eurekabeauty.app://', 'https://eureka-beauty.com/');
              }
              const url = new URL(cleanUrlStr);

              // 1. Check PKCE code in searchParams (?code=...)
              if (url.searchParams.has('code')) {
                const code = url.searchParams.get('code');
                if (code && HAS_SUPABASE_CREDS) {
                  const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
                  if (sessionData?.user) {
                    const profile = await syncUserSession(sessionData.user);
                    redirectByRole(profile?.role);
                  }
                }
              } 
              // 2. Check Implicit Flow tokens in hash (#access_token=...)
              else if (cleanUrlStr.includes('#')) {
                const hashContent = cleanUrlStr.split('#')[1];
                const params = new URLSearchParams(hashContent);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                if (accessToken && HAS_SUPABASE_CREDS) {
                  const { data: sessionData } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || '',
                  });
                  if (sessionData?.user) {
                    const profile = await syncUserSession(sessionData.user);
                    redirectByRole(profile?.role);
                  }
                }
              }
            } catch (err) {
              console.error('Error handling deep link OAuth callback:', err);
            }
          }
        });
      }

      if (HAS_SUPABASE_CREDS) {
        // Get active auth session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user) {
            const profile = await syncUserSession(session.user);
            if (profile && window.location.pathname === '/') {
              redirectByRole(profile.role);
            }
          }
        });

        // Listen for authentication changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await syncUserSession(session.user);
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && profile) {
              redirectByRole(profile.role);
            }
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
        let { data: profile } = await supabase
          .from('customers')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile && data.user.email) {
          const { data: profileByEmail } = await supabase
            .from('customers')
            .select('*')
            .eq('email', data.user.email.toLowerCase())
            .maybeSingle();

          if (profileByEmail) {
            profile = profileByEmail;
            await supabase.from('customers').update({ id: data.user.id }).eq('email', data.user.email.toLowerCase());
            profile.id = data.user.id;
          }
        }

        if (profile) {
          setUser(profile);
          localStorage.setItem('eb_session', JSON.stringify(profile));
          return { success: true, isAdmin: profile.role === 'admin' };
        } else {
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

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '';
    if (Capacitor.isNativePlatform()) {
      return 'com.eurekabeauty.app://auth/callback';
    }
    return `${window.location.origin}/dashboard`;
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string; role?: string; redirectUrl?: string }> => {
    if (HAS_SUPABASE_CREDS) {
      if (Capacitor.isNativePlatform()) {
        try {
          // Native Android / iOS Google Sign-In prompt directly inside the app
          const googleUser = await GoogleAuth.signIn();
          const idToken = googleUser.authentication?.idToken;

          if (!idToken) {
            return { success: false, error: 'Jeton de connexion Google introuvable.' };
          }

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });

          if (error) return { success: false, error: error.message };

          if (data.user) {
            const profile = await syncUserSession(data.user);
            const role = profile?.role || 'customer';
            const redirectUrl = role === 'admin' ? '/admin' : role === 'delivery' ? '/admin/orders' : '/dashboard';
            return { success: true, role, redirectUrl };
          }

          return { success: true };
        } catch (err: any) {
          console.error('Native Google Sign-In note:', err);
          // Fallback to In-App Browser tab
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'com.eurekabeauty.app://auth/callback',
              skipBrowserRedirect: true,
            }
          });
          if (error) return { success: false, error: error.message };
          if (data?.url) {
            await Browser.open({ url: data.url });
          }
          return { success: true };
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
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
          resolve({ success: true, role: 'customer', redirectUrl: '/dashboard' });
        }, 800);
      });
    }
  };

  const signInWithFacebook = async (): Promise<{ success: boolean; error?: string }> => {
    if (HAS_SUPABASE_CREDS) {
      if (Capacitor.isNativePlatform()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: 'com.eurekabeauty.app://auth/callback',
            skipBrowserRedirect: true,
          }
        });
        if (error) return { success: false, error: error.message };
        if (data?.url) {
          await Browser.open({ url: data.url });
        }
        return { success: true };
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
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
