'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Percent, 
  Calendar, 
  ArrowUpRight, 
  ClipboardList 
} from 'lucide-react';

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  visitors: number;
  conversionRate: number;
  salesOverTime: Array<{ date: string; revenue: number; orders: number }>;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { formatPrice } = useLangCurr();
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const loadData = () => {
    const data = db.getAnalytics();
    setStats(data);
    
    const orders = db.getOrders();
    const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentOrders(sorted.slice(0, 5));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  // Calculate highest revenue day for chart normalization
  const maxRevenue = Math.max(...stats.salesOverTime.map(d => d.revenue), 10000);

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Page Title */}
      <div>
        <h1 className="font-serif-display text-3xl font-medium tracking-wide">Vue d'ensemble</h1>
        <p className="text-xs text-white/50 mt-1 font-light">Analytiques de vente et rapports opérationnels.</p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Revenue */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center text-white/50">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white">{formatPrice(stats.totalSales)}</h3>
            <p className="text-[9px] text-success font-semibold mt-1 flex items-center gap-0.5">
              +14.5% <TrendingUp size={10} /> <span className="text-white/30 font-light">vs mois dernier</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center text-white/50">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Commandes Totales</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white">{stats.totalOrders}</h3>
            <p className="text-[9px] text-success font-semibold mt-1 flex items-center gap-0.5">
              +{stats.pendingOrders} en attente <span className="text-white/30 font-light">de livraison</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Visitors */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center text-white/50">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Visites Boutique</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white">{stats.visitors}</h3>
            <p className="text-[9px] text-white/30 font-light mt-1">Trafic cumulé sur la session</p>
          </div>
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center text-white/50">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Taux de Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white">{stats.conversionRate}%</h3>
            <p className="text-[9px] text-success font-semibold mt-1 flex items-center gap-0.5">
              Optimal <TrendingUp size={10} /> <span className="text-white/30 font-light">pour le secteur</span>
            </p>
          </div>
        </div>

      </div>


      {/* Main Charts & Recent Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">Chiffre d'Affaires sur 7 jours</h3>
            <span className="text-[9px] uppercase tracking-widest text-gold font-bold flex items-center gap-1"><Calendar size={12} /> Live</span>
          </div>

          {/* Bar Chart container */}
          <div className="h-64 flex items-end justify-between gap-4 pt-6">
            {stats.salesOverTime.map((day, idx) => {
              const heightPercent = (day.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition duration-200 bg-white text-dark rounded-md px-2 py-1 text-[8px] font-bold shadow-xl mb-1 -translate-y-2 absolute">
                    {formatPrice(day.revenue)}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-gold/50 to-gold rounded-t-lg transition-all duration-500 ease-out group-hover:scale-x-105"
                    style={{ height: `${Math.max(5, heightPercent)}%` }} // minimum 5% height for visual
                  />
                  
                  {/* Label */}
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white">Dernières Commandes</h3>
            <button 
              onClick={() => router.push('/admin/orders')}
              className="text-[9px] uppercase tracking-widest text-gold font-bold hover:underline flex items-center gap-1"
            >
              Toutes <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-white/40 italic py-10 text-center">Aucune commande enregistrée pour le moment.</p>
            ) : (
              recentOrders.map((ord) => (
                <div 
                  key={ord.id} 
                  onClick={() => router.push('/admin/orders')}
                  className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{ord.first_name} {ord.last_name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{ord.order_number} • {ord.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif-display font-semibold text-gold">{formatPrice(ord.total_xof)}</p>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block ${ord.order_status === 'Delivered' ? 'bg-success/15 text-success' : ord.order_status === 'Cancelled' ? 'bg-error/15 text-error' : 'bg-gold/15 text-gold'}`}>
                      {ord.order_status === 'Delivered' ? 'Livrée' : ord.order_status === 'Cancelled' ? 'Annulée' : ord.order_status === 'Confirmed' ? 'Confirmée' : ord.order_status === 'Packed' ? 'Préparation' : ord.order_status === 'Shipped' ? 'Expédiée' : 'En livraison'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
