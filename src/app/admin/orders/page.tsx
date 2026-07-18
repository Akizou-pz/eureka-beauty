'use client';

import React, { useState, useEffect } from 'react';
import { db, Order } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { ClipboardList, Search, Eye, Edit, Printer, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useLangCurr();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection/detail state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Print Mode State
  const [isPrinting, setIsPrinting] = useState(false);

  const loadOrders = () => {
    setOrders(db.getOrders());
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('supabase_sync_complete', loadOrders);
    return () => window.removeEventListener('supabase_sync_complete', loadOrders);
  }, []);

  const handleStatusChange = (id: string, status: Order['order_status']) => {
    // If order becomes delivered, auto mark payment paid
    const payStatus = status === 'Delivered' ? 'Paid' : undefined;
    const updated = db.updateOrderStatus(id, status, payStatus);
    loadOrders();
    // Update selected details display
    if (selectedOrder?.id === id) {
      setSelectedOrder(updated);
    }
  };

  const handlePrint = (ord: Order) => {
    setSelectedOrder(ord);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  // Filter orders by search input
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.first_name.toLowerCase().includes(q) ||
      o.last_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q)
    );
  });

  if (isPrinting && selectedOrder) {
    return (
      <div className="bg-white text-black p-8 font-sans space-y-8 w-full min-h-screen print:p-0">
        <style>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        `}</style>
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-[#c5a880] pb-6">
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold tracking-wider text-black">
              EUREKA <span className="text-[#c5a880] font-normal">BEAUTY</span>
            </span>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">Reveal Your Natural Beauty</p>
            <p className="text-xs text-gray-500 mt-2">Lomé, Togo</p>
            <p className="text-xs text-gray-500">eurekasupplytg@gmail.com | +228 93 86 67 52</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="font-serif text-2xl font-bold tracking-wider uppercase text-black">Facture</h2>
            <p className="text-xs text-gray-500">Numéro : <span className="font-semibold text-black">{selectedOrder.order_number}</span></p>
            <p className="text-xs text-gray-500">Date : {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            <p className="text-xs text-gray-500">Statut : <span className="font-bold text-[#c5a880]">{selectedOrder.payment_status === 'Paid' ? 'PAYÉ' : 'À PAYER (COD)'}</span></p>
          </div>
        </div>

        {/* Customer & Shipping Details split */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-4">
          <div className="p-4 border border-[#c5a880]/20 rounded-xl bg-gray-50/50 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-black border-b border-[#c5a880]/10 pb-1.5 text-[10px]">Facturé à :</h4>
            <div className="space-y-1 text-gray-700">
              <p className="font-bold text-black text-sm">{selectedOrder.first_name} {selectedOrder.last_name}</p>
              <p>{selectedOrder.email}</p>
              <p>{selectedOrder.phone}</p>
              {selectedOrder.whatsapp && <p>WhatsApp : {selectedOrder.whatsapp}</p>}
            </div>
          </div>
          <div className="p-4 border border-[#c5a880]/20 rounded-xl bg-gray-50/50 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-black border-b border-[#c5a880]/10 pb-1.5 text-[10px]">Adresse d'expédition :</h4>
            <div className="space-y-1 text-gray-700">
              <p className="font-semibold text-black">{selectedOrder.address_line}</p>
              <p>{selectedOrder.city}, {selectedOrder.country}</p>
              <p className="pt-1.5 text-[10px] uppercase font-bold text-[#c5a880]">Méthode : <span className="text-black">{selectedOrder.payment_method}</span></p>
            </div>
          </div>
        </div>

        {/* Ordered items Table */}
        <div className="pt-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black/80 text-black font-bold uppercase tracking-wider">
                <th className="py-3 pr-4">Description de l'article</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Quantité</th>
                <th className="py-3 px-4 text-right">Prix Unitaire</th>
                <th className="py-3 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedOrder.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/20">
                  <td className="py-4 pr-4 font-semibold text-black">{item.product_name}</td>
                  <td className="py-4 px-4 uppercase text-gray-500 font-mono">{item.sku}</td>
                  <td className="py-4 px-4 text-center font-semibold text-black">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-700">{formatPrice(item.unit_price_xof)}</td>
                  <td className="py-4 pl-4 text-right font-bold text-black">{formatPrice(item.total_price_xof)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Totals */}
        <div className="flex justify-end pt-8">
          <div className="w-80 text-xs space-y-2.5 border-t border-gray-200 pt-4 text-gray-700">
            <div className="flex justify-between">
              <span>Sous-total articles :</span>
              <span className="font-semibold text-black">{formatPrice(selectedOrder.subtotal_xof)}</span>
            </div>
            {selectedOrder.discount_xof > 0 && (
              <div className="flex justify-between font-bold text-[#c5a880]">
                <span>Remises appliquées :</span>
                <span>-{formatPrice(selectedOrder.discount_xof)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Frais d'expédition :</span>
              <span className="font-semibold text-black">{formatPrice(selectedOrder.shipping_cost_xof)}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-3 text-sm font-bold text-black">
              <span>Montant Net à Payer :</span>
              <span className="text-[#c5a880] text-base font-bold">{formatPrice(selectedOrder.total_xof)}</span>
            </div>
          </div>
        </div>

        {/* Terms info */}
        <div className="text-[10px] text-gray-400 font-light leading-relaxed border-t border-gray-100 pt-16 text-center space-y-1">
          <p>Nous vous remercions de votre confiance. Pour tout renseignement, écrivez-nous à eurekasupplytg@gmail.com.</p>
          <p className="mt-2 font-bold text-black uppercase tracking-widest text-[9px]">EUREKA BEAUTY - REVEAL YOUR NATURAL BEAUTY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in text-white print:text-dark print:bg-white print:p-0">
      
      {/* 1. Page Header (hidden during print) */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6 print:hidden">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Commandes & Factures</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Suivre les statuts d'expédition, encaisser les paiements et imprimer les reçus.</p>
        </div>
      </div>

      {/* 2. Search & List Layout (hidden during print) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:hidden">
        
        {/* Orders Table Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search box */}
          <div className="bg-[#141414] border border-white/5 p-4 rounded-xl flex items-center gap-2">
            <Search size={16} className="text-white/40" />
            <input
              type="text"
              placeholder="Rechercher par N° commande, nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white outline-none"
            />
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden luxury-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase tracking-widest text-[9px] bg-white/5">
                    <th className="p-4">N° Commande</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40 italic">Aucune commande enregistrée.</td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr 
                        key={ord.id} 
                        onClick={() => setSelectedOrder(ord)}
                        className={`hover:bg-white/[0.02] transition cursor-pointer ${selectedOrder?.id === ord.id ? 'bg-white/5' : ''}`}
                      >
                        <td className="p-4 font-bold text-white font-serif-display">{ord.order_number}</td>
                        <td className="p-4">
                          <p className="font-bold text-white">{ord.first_name} {ord.last_name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{ord.phone}</p>
                        </td>
                        <td className="p-4 font-serif-display font-semibold text-gold">{formatPrice(ord.total_xof)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase ${ord.order_status === 'Delivered' ? 'bg-success/15 text-success' : ord.order_status === 'Cancelled' ? 'bg-error/15 text-error' : 'bg-gold/15 text-gold'}`}>
                            {ord.order_status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-white/60"
                              title="Voir Détails"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() => handlePrint(ord)}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-gold hover:text-white transition flex items-center justify-center text-white/60"
                              title="Imprimer Facture"
                            >
                              <Printer size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Order Details Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-6 luxury-shadow sticky top-24">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-serif-display font-semibold text-sm text-white">Détails Commande</h3>
                  <p className="text-[10px] text-gold mt-0.5">{selectedOrder.order_number}</p>
                </div>
                <button 
                  onClick={() => handlePrint(selectedOrder)}
                  className="bg-white/5 hover:bg-gold hover:text-white border border-white/10 rounded-lg p-2 transition flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-white"
                >
                  <Printer size={12} /> Imprimer
                </button>
              </div>

              {/* Status selectors */}
              <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-white/5 pb-6">
                <div className="space-y-1">
                  <label className="block uppercase tracking-widest text-gold font-bold mb-1">Fulfillment</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white"
                  >
                    <option value="Confirmed" className="bg-[#141414] text-white">Confirmée</option>
                    <option value="Packed" className="bg-[#141414] text-white">Préparation</option>
                    <option value="Shipped" className="bg-[#141414] text-white">Expédiée</option>
                    <option value="Out for Delivery" className="bg-[#141414] text-white">En livraison</option>
                    <option value="Delivered" className="bg-[#141414] text-white">Livrée</option>
                    <option value="Cancelled" className="bg-[#141414] text-white">Annulée</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block uppercase tracking-widest text-gold font-bold mb-1">Statut Paiement</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => {
                      db.updateOrderStatus(selectedOrder.id, selectedOrder.order_status, e.target.value as any);
                      loadOrders();
                      setSelectedOrder({ ...selectedOrder, payment_status: e.target.value as any });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white"
                  >
                    <option value="Pending" className="bg-[#141414] text-white">En attente (Pending)</option>
                    <option value="Paid" className="bg-[#141414] text-white">Payé (Paid)</option>
                    <option value="Cancelled" className="bg-[#141414] text-white">Annulé (Cancelled)</option>
                    <option value="Refunded" className="bg-[#141414] text-white">Remboursé (Refunded)</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-2 text-xs">
                <h4 className="font-serif-display font-semibold text-gold uppercase tracking-wider text-[10px]">Client & Contacts</h4>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 leading-relaxed font-light">
                  <p>• <strong>Nom complet :</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p>• <strong>Téléphone :</strong> {selectedOrder.phone}</p>
                  {selectedOrder.whatsapp && <p>• <strong>WhatsApp :</strong> {selectedOrder.whatsapp}</p>}
                  <p>• <strong>E-mail :</strong> {selectedOrder.email}</p>
                  <p>• <strong>Méthode de paiement :</strong> <span className="text-gold font-bold">{selectedOrder.payment_method}</span></p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2 text-xs">
                <h4 className="font-serif-display font-semibold text-gold uppercase tracking-wider text-[10px]">Adresse de livraison</h4>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 leading-relaxed font-light">
                  <p>• <strong>Pays / Ville :</strong> {selectedOrder.country} / {selectedOrder.city}</p>
                  <p>• <strong>Rue / Quartier :</strong> {selectedOrder.address_line}</p>
                  {selectedOrder.delivery_instructions && <p>• <strong>Notes de livraison :</strong> "{selectedOrder.delivery_instructions}"</p>}
                </div>
              </div>

              {/* Items loop */}
              <div className="space-y-2 text-xs">
                <h4 className="font-serif-display font-semibold text-gold uppercase tracking-wider text-[10px]">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <div>
                        <p className="font-bold text-white">{item.product_name}</p>
                        <span className="text-[9px] text-white/40 uppercase">x{item.quantity} • SKU: {item.sku}</span>
                      </div>
                      <span className="font-serif-display font-semibold text-gold">{formatPrice(item.total_price_xof)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Totals summary */}
              <div className="border-t border-white/5 pt-4 text-xs space-y-2 text-white/60">
                <div className="flex justify-between">
                  <span>Sous-total articles</span>
                  <span>{formatPrice(selectedOrder.subtotal_xof)}</span>
                </div>
                {selectedOrder.discount_xof > 0 && (
                  <div className="flex justify-between text-gold font-bold">
                    <span>Remises appliquées</span>
                    <span>-{formatPrice(selectedOrder.discount_xof)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frais d'expédition</span>
                  <span>{formatPrice(selectedOrder.shipping_cost_xof)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 text-sm text-white font-bold">
                  <span>Montant Total</span>
                  <span className="text-gold font-serif-display text-base font-semibold">{formatPrice(selectedOrder.total_xof)}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-10 text-center text-white/40 italic">
              Sélectionnez une commande dans la liste pour afficher ses détails opérationnels.
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          PRINT LAYOUT INVOICE (ONLY VISIBLE ON PRINT)
         ========================================== */}
      {selectedOrder && (
        <div className="hidden print:block bg-white text-black p-8 font-sans space-y-8 w-[21cm]">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-dark pb-6">
            <div>
              <span className="font-serif-display text-2xl font-semibold tracking-wider text-dark">
                EUREKA <span className="text-gold font-normal">BEAUTY</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-dark-muted mt-1">Reveal Your Natural Beauty</p>
              <p className="text-xs text-dark-muted mt-2">Lomé, Togo</p>
              <p className="text-xs text-dark-muted">eurekasupplytg@gmail.com | +228 93 86 67 52</p>
            </div>
            <div className="text-right">
              <h2 className="font-serif-display text-2xl font-semibold text-dark uppercase tracking-wider">Facture</h2>
              <p className="text-xs text-dark-muted mt-1">Numéro : {selectedOrder.order_number}</p>
              <p className="text-xs text-dark-muted">Date : {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}</p>
              <p className="text-xs text-dark-muted">Statut : <strong>{selectedOrder.payment_status === 'Paid' ? 'PAYÉ' : 'À PAYER (COD)'}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Details split */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <h4 className="font-semibold text-dark uppercase tracking-wider border-b border-dark/10 pb-1">Facturé à :</h4>
              <p className="font-bold">{selectedOrder.first_name} {selectedOrder.last_name}</p>
              <p>{selectedOrder.email}</p>
              <p>{selectedOrder.phone}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-dark uppercase tracking-wider border-b border-dark/10 pb-1">Adresse d'expédition :</h4>
              <p className="font-semibold">{selectedOrder.address_line}</p>
              <p>{selectedOrder.city}, {selectedOrder.country}</p>
              <p>Méthode : <span className="font-bold uppercase text-gold">{selectedOrder.payment_method}</span></p>
            </div>
          </div>

          {/* Ordered items Table */}
          <table className="w-full text-left text-xs border-collapse mt-8">
            <thead>
              <tr className="border-b-2 border-dark text-dark font-bold uppercase tracking-wider">
                <th className="py-2">Description de l'article</th>
                <th className="py-2">SKU</th>
                <th className="py-2 text-center">Quantité</th>
                <th className="py-2 text-right">Prix Unitaire</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark/10">
              {selectedOrder.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-3 font-semibold text-dark">{item.product_name}</td>
                  <td className="py-3 uppercase text-dark-muted">{item.sku}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(item.unit_price_xof)}</td>
                  <td className="py-3 text-right font-bold">{formatPrice(item.total_price_xof)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-64 text-xs space-y-2 border-t-2 border-dark pt-4">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span>{formatPrice(selectedOrder.subtotal_xof)}</span>
              </div>
              {selectedOrder.discount_xof > 0 && (
                <div className="flex justify-between font-bold text-dark">
                  <span>Remises appliquées :</span>
                  <span>-{formatPrice(selectedOrder.discount_xof)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais d'expédition :</span>
                <span>{formatPrice(selectedOrder.shipping_cost_xof)}</span>
              </div>
              <div className="flex justify-between border-t border-dark pt-2 text-sm font-bold text-dark">
                <span>Montant Net à Payer :</span>
                <span className="font-serif-display text-base font-semibold">{formatPrice(selectedOrder.total_xof)}</span>
              </div>
            </div>
          </div>

          {/* Terms info */}
          <div className="text-[10px] text-dark-muted font-light leading-relaxed border-t border-dark/10 pt-16 text-center">
            <p>Nous vous remercions de votre confiance. Pour tout renseignement, écrivez-nous à eurekasupplytg@gmail.com.</p>
            <p className="mt-1 font-bold text-dark uppercase tracking-widest">EUREKA BEAUTY - REVEAL YOUR NATURAL BEAUTY</p>
          </div>

        </div>
      )}

    </div>
  );
}
