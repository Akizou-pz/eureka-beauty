'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { db, Order } from '@/lib/db';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  PhoneCall,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

function OrderTracking() {
  const searchParams = useSearchParams();
  const { formatPrice } = useLangCurr();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('num') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearched(true);

    if (!orderNumber || !phone) {
      setErrorMsg('Veuillez renseigner le numéro de commande et votre numéro de téléphone.');
      setOrder(null);
      return;
    }

    const found = db.getOrderByNumberAndPhone(orderNumber.trim(), phone.trim());
    if (found) {
      setOrder(found);
    } else {
      setOrder(null);
      setErrorMsg('Aucune commande correspondante trouvée. Veuillez vérifier les informations saisies.');
    }
  };

  // Status mapping to helper steps
  const statusSteps = [
    { key: 'Confirmed', label: 'Commande Confirmée', desc: 'Votre commande a bien été reçue par notre équipe.', icon: CheckCircle },
    { key: 'Packed', label: 'Préparation et Emballage', desc: 'Vos produits sont soigneusement emballés dans nos coffrets de luxe.', icon: Package },
    { key: 'Shipped', label: 'Expédiée', desc: 'Le colis a été remis à notre transporteur partenaire.', icon: Truck },
    { key: 'Out for Delivery', label: 'En cours de livraison', desc: 'Le livreur est en route vers votre domicile.', icon: Clock },
    { key: 'Delivered', label: 'Livrée avec Succès', desc: 'Le colis vous a été remis en mains propres.', icon: CheckCircle },
  ];

  // Helper to check if step is active based on order status index
  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    
    const statusOrder = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = statusOrder.indexOf(order.order_status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (order.order_status === 'Cancelled') {
      return stepKey === 'Confirmed' ? 'active-error' : 'upcoming';
    }

    if (currentIdx >= stepIdx) {
      return currentIdx === stepIdx ? 'active' : 'completed';
    }
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title */}
      <div className="text-center max-w-md mx-auto space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Logistique & Suivi</span>
        <h1 className="font-serif-display text-3xl font-medium tracking-wider text-dark">Suivi de Commande</h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        <p className="text-xs text-dark-muted font-light leading-relaxed">
          Suivez l\'état de votre livraison Eureka Beauty en temps réel en saisissant vos identifiants ci-dessous.
        </p>
      </div>

      {/* Track Form */}
      <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 luxury-shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Numéro de Commande</label>
              <input
                type="text"
                required
                placeholder="Ex: EB-2026-1024"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Téléphone de livraison</label>
              <input
                type="tel"
                required
                placeholder="Ex: +225 0707..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-dark hover:bg-gold text-white text-xs font-semibold uppercase tracking-widest py-3 rounded-lg transition shadow flex items-center justify-center gap-2"
          >
            <Search size={14} /> Suivre le colis
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-error font-semibold bg-error/10 px-3 py-2.5 rounded-lg mt-4 text-center">
            {errorMsg}
          </p>
        )}
      </div>

      {/* TRACKING TIMELINE RESULTS */}
      {order && (
        <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 luxury-shadow space-y-8 fade-in">
          
          {/* Header summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gold/10 text-xs">
            <div className="space-y-1">
              <span className="text-dark-muted">N° de Commande:</span>
              <p className="font-bold text-dark text-sm">{order.order_number}</p>
            </div>
            <div className="space-y-1">
              <span className="text-dark-muted">Date d'achat:</span>
              <p className="font-bold text-dark text-sm">{new Date(order.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            </div>
            <div className="space-y-1">
              <span className="text-dark-muted">Livraison Estimée:</span>
              <p className="font-bold text-gold text-sm flex items-center gap-1">
                <Calendar size={14} />
                {new Date(order.estimated_delivery).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Cancelled State override */}
          {order.order_status === 'Cancelled' && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-center text-xs text-error font-bold flex items-center justify-center gap-2">
              <AlertCircle size={16} /> Commande Annulée (Veuillez contacter le service client par WhatsApp pour plus de détails).
            </div>
          )}

          {/* Vertical Timeline */}
          {order.order_status !== 'Cancelled' && (
            <div className="relative border-l border-gold/25 ml-4 sm:ml-8 pl-8 py-2 space-y-8">
              {statusSteps.map((step, idx) => {
                const stepStatus = getStepStatus(step.key);
                const IconComponent = step.icon;

                return (
                  <div key={idx} className="relative">
                    {/* Bullet marker on timeline */}
                    <span 
                      className={`absolute -left-[45px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        stepStatus === 'completed' 
                          ? 'bg-gold border-gold text-white shadow' 
                          : stepStatus === 'active'
                          ? 'bg-white border-gold text-gold scale-110 shadow-lg ring-4 ring-gold/10'
                          : 'bg-white border-gold/15 text-dark-muted opacity-50'
                      }`}
                    >
                      <IconComponent size={14} />
                    </span>

                    {/* Step texts */}
                    <div className={stepStatus === 'upcoming' ? 'opacity-40' : ''}>
                      <h4 className={`text-xs sm:text-sm font-semibold ${stepStatus === 'active' ? 'text-gold' : 'text-dark'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-dark-muted font-light mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Details list */}
          <div className="pt-6 border-t border-gold/10 space-y-4">
            <h3 className="font-serif-display font-semibold text-sm text-dark uppercase tracking-wider">Articles Commandés</h3>
            <div className="space-y-3 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-bg-cream/40 p-3 rounded-lg border border-gold/5">
                  <span className="font-semibold text-dark">{item.product_name} <span className="text-dark-muted font-normal">x{item.quantity}</span></span>
                  <span className="font-serif-display text-gold font-bold">{formatPrice(item.total_price_xof)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assistance CTA */}
          <div className="bg-bg-cream/40 p-4 rounded-xl border border-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p className="text-dark-muted text-center sm:text-left">
              Une question concernant l'expédition de votre colis ? Contactez notre logistique.
            </p>
            <a
              href={`https://wa.me/22507070707?text=Bonjour%20Eureka%20Beauty%2C%20je%20souhaite%20des%20informations%20sur%20la%20livraison%20de%20ma%20commande%20%23${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-2 transition flex-shrink-0"
            >
              <MessageSquare size={14} /> WhatsApp Assistance
            </a>
          </div>

        </div>
      )}

      {/* Searched but empty placeholder */}
      {searched && !order && !errorMsg && (
        <div className="text-center py-10 bg-white border border-gold/10 rounded-xl space-y-2">
          <p className="text-xs text-dark-muted">Recherche en cours...</p>
        </div>
      )}

    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <OrderTracking />
    </Suspense>
  );
}
