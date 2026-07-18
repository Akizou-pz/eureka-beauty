'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Percent, 
  ArrowLeft, 
  ShieldAlert,
  UserCheck,
  Menu,
  X,
  ChevronRight,
  Truck,
  BookOpen
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { formatPrice } = useLangCurr();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  // 1. Guard check: Must be authenticated and have role === 'admin'
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4 fade-in">
        <div className="max-w-md w-full bg-white rounded-2xl luxury-shadow border border-gold/20 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto border border-error/15">
            <ShieldAlert size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-serif-display text-2xl font-semibold text-dark">Accès Administrateur Restreint</h1>
            <p className="text-xs text-dark-muted leading-relaxed font-light">
              Cette section est réservée au personnel de direction de Eureka Beauty. Veuillez vous connecter avec un compte administrateur.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/dashboard?auth=login"
              className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-lg transition shadow"
            >
              Se connecter
            </Link>
            <Link
              href="/"
              className="text-xs text-dark hover:text-gold transition font-bold flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Retourner au site client
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Catalogue Produits', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Commandes & Factures', icon: ClipboardList },
    { href: '/admin/marketing', label: 'Coupons & Promos', icon: Percent },
    { href: '/admin/shipping', label: 'Zones & Tarifs', icon: Truck },
    { href: '/admin/blog', label: 'Conseils & Blog', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#1c1c1c] text-white">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-white/5 z-40 sticky top-0">
        <Link href="/" className="flex flex-col">
          <span className="font-serif-display text-base font-bold tracking-wider text-white">
            EUREKA <span className="text-gold font-normal">ADMIN</span>
          </span>
          <span className="text-[6px] tracking-[0.2em] uppercase text-gold/80 font-light">
            Tableau de bord
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-gold p-2 bg-white/5 border border-white/5 rounded-lg transition flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-white/5 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:h-auto lg:z-auto
      `}>
        <div className="p-6 space-y-8">
          
          {/* Admin header logo */}
          <div className="flex justify-between items-center">
            <Link href="/" className="flex flex-col" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-serif-display text-lg font-bold tracking-wider text-white">
                EUREKA <span className="text-gold font-normal">ADMIN</span>
              </span>
              <span className="text-[7px] tracking-[0.25em] uppercase text-gold/80 font-light">
                Tableau de bord de direction
              </span>
            </Link>
            <button 
              className="lg:hidden text-white/60 hover:text-white p-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              AD
            </div>
            <div>
              <p className="font-bold text-white">Directrice Eureka</p>
              <span className="text-[10px] text-gold font-semibold uppercase tracking-wider flex items-center gap-1">
                <UserCheck size={10} /> Super Admin
              </span>
            </div>
          </div>

          {/* Menu links */}
          <nav className="space-y-1.5 flex flex-col text-xs font-semibold uppercase tracking-widest text-white/70">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition ${isActive ? 'bg-gold text-white font-bold shadow-md' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  <IconComp size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to website shortcut */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-lg transition border border-white/5"
          >
            <ArrowLeft size={12} /> Retour au Site
          </Link>
          <p className="text-[9px] text-center text-white/30 uppercase">Eureka Beauty v0.1.0</p>
        </div>

      </aside>

      {/* Main Admin Screen Content */}
      <main className="flex-grow p-4 sm:p-10 lg:max-h-screen lg:overflow-y-auto no-scrollbar space-y-8">
        {children}
      </main>

    </div>
  );
}
