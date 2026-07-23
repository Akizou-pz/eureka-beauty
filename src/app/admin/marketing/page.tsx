'use client';

import React, { useState, useEffect } from 'react';
import { db, Coupon } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { Ticket, Mail, Plus, X, Pencil } from 'lucide-react';

export default function AdminMarketingPage() {
  const { formatPrice } = useLangCurr();

  // Baseline states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [minValue, setMinValue] = useState(10000);

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setCoupons(db.getCoupons());
    setSubscribers(db.getSubscribers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const openModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountPercent(15);
    setMinValue(10000);
    setIsOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountPercent(coupon.discount_percent);
    setMinValue(coupon.min_order_value_xof);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    if (editingCoupon) {
      db.updateCoupon({
        ...editingCoupon,
        code: code.toUpperCase().trim(),
        discount_percent: Number(discountPercent),
        min_order_value_xof: Number(minValue),
      });
      setSuccessMsg(`Coupon ${code.toUpperCase()} modifié avec succès !`);
    } else {
      db.createCoupon({
        code: code.toUpperCase().trim(),
        discount_percent: Number(discountPercent),
        min_order_value_xof: Number(minValue),
        is_active: true,
      });
      setSuccessMsg(`Coupon ${code.toUpperCase()} créé avec succès !`);
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    loadData();
    setIsOpen(false);
    setEditingCoupon(null);
  };

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Marketing & Promotions</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Gérer les codes de réduction, suivre l'acquisition d'abonnés.</p>
        </div>

        <button
          onClick={openModal}
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Nouveau Code
        </button>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      {/* Split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Coupons Panel */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Ticket size={16} className="text-gold" /> Codes Promotionnels
            </h3>
            <span className="text-[10px] text-white/40 font-bold">{coupons.length} Actifs</span>
          </div>

          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div 
                key={coupon.id} 
                className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-light"
              >
                <div className="space-y-1">
                  <span className="bg-gold/15 text-gold font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    {coupon.code}
                  </span>
                  <p className="text-[10px] text-white/50 mt-1">Minimum d'achat : {formatPrice(coupon.min_order_value_xof)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">-{coupon.discount_percent}%</span>
                    <span className="text-[8px] bg-success/15 text-success font-semibold px-2 py-0.5 rounded-full mt-1 block uppercase">ACTIF</span>
                  </div>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-gold hover:text-white p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition"
                    title="Modifier le coupon"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscribers Panel */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-serif-display font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Mail size={16} className="text-gold" /> Abonnés Newsletter
            </h3>
            <span className="text-[10px] text-white/40 font-bold">{subscribers.length} Emails</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {subscribers.length === 0 ? (
              <p className="text-xs text-white/40 italic py-10 text-center">Aucun inscrit à la newsletter pour le moment.</p>
            ) : (
              subscribers.map((email, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-light text-white/70"
                >
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    {idx + 1}
                  </div>
                  <span>{email}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ==========================================
          ADD/EDIT COUPON MODAL FORM
         ========================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="my-4 sm:my-auto bg-[#141414] border border-white/10 w-full max-w-md rounded-2xl p-4 sm:p-8 space-y-6 luxury-shadow">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display font-semibold text-sm text-white uppercase tracking-wider">
                {editingCoupon ? 'Modifier le Code Promo' : 'Nouveau Code Promo'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition p-1 bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Code Promo (Lettres & Chiffres)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GLOW25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Pourcentage Remise (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Achat Min. (XOF)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minValue}
                    onChange={(e) => setMinValue(Number(e.target.value))}
                    className="w-full text-xs bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold uppercase tracking-widest py-3 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-white font-bold uppercase tracking-widest py-3 rounded-lg shadow transition"
                >
                  {editingCoupon ? 'Enregistrer' : 'Créer le code'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
