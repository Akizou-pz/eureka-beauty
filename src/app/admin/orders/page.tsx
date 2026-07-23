'use client';

import React, { useState, useEffect } from 'react';
import { db, Order } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { notifyNewOrder } from '@/lib/notifications';
import { generateOrderSlipPDF, generateInvoicePDF } from '@/lib/pdfGenerator';
import { ClipboardList, Search, Eye, Edit, Printer, Download, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useLangCurr();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection/detail state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [prevOrdersCount, setPrevOrdersCount] = useState<number | null>(null);

  // Print Mode State
  const [isPrinting, setIsPrinting] = useState(false);

  const loadOrders = () => {
    const allOrders = db.getOrders();
    
    setOrders((prevOrders) => {
      if (prevOrders.length > 0 && allOrders.length > prevOrders.length) {
        const latest = allOrders[0];
        if (latest) {
          notifyNewOrder(latest.order_number, `${latest.first_name} ${latest.last_name}`, latest.total_xof);
        }
      }
      return allOrders;
    });

    setSelectedOrder((prev) => {
      if (!prev) return null;
      return allOrders.find((o) => o.id === prev.id) || null;
    });
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('supabase_sync_complete', loadOrders);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'eb_orders') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('supabase_sync_complete', loadOrders);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleStatusChange = (id: string, status: Order['order_status']) => {
    let cancelReason = undefined;
    if (status === 'Cancelled') {
      const reason = window.prompt("Veuillez indiquer le motif d'annulation de cette commande :");
      if (reason === null) return; // user cancelled prompt
      cancelReason = reason.trim() || "Aucun motif spécifié";
    }

    // If order becomes delivered, auto mark payment paid
    const payStatus = status === 'Delivered' ? 'Paid' : undefined;
    const updated = db.updateOrderStatus(id, status, payStatus, cancelReason);
    loadOrders();
    // Update selected details display
    if (selectedOrder?.id === id) {
      setSelectedOrder(updated);
    }
  };

  const handleDownloadPDF = (order: Order) => {
    generateOrderSlipPDF(order, formatPrice);
  };

  const handlePrint = (order: Order) => {
    setSelectedOrder(order);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
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
      <div className="bg-white text-black p-4 sm:p-8 font-sans space-y-6 sm:space-y-8 w-full max-w-4xl mx-auto min-h-screen print:p-0 print:max-w-none">
        <style>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-size: 11px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
        `}</style>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#c5a880] pb-6 gap-4 sm:gap-0">
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold tracking-wider text-black">
              EUREKA <span className="text-[#c5a880] font-normal">BEAUTY</span>
            </span>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">Révélez votre beauté naturelle</p>
            <p className="text-xs text-gray-600 mt-2">Lomé, Togo</p>
            <p className="text-xs text-gray-600">eurekasupplytg@gmail.com | +228 93 86 67 52</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <h2 className="font-serif text-2xl font-bold tracking-wider uppercase text-black">Facture</h2>
            <p className="text-xs text-gray-600">N° Facture : <span className="font-bold text-black">{selectedOrder.order_number}</span></p>
            <p className="text-xs text-gray-600">Date : {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            <p className="text-xs text-gray-600">Statut : <span className="font-bold text-[#c5a880]">{selectedOrder.payment_status === 'Paid' ? 'PAYÉ' : 'À PAYER À LA LIVRAISON (COD)'}</span></p>
          </div>
        </div>

        {/* Customer & Shipping Details split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-xs pt-2">
          <div className="p-4 border border-[#c5a880]/30 rounded-xl bg-gray-50/70 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-black border-b border-[#c5a880]/20 pb-1.5 text-[10px]">Facturé à :</h4>
            <div className="space-y-1 text-gray-800">
              <p className="font-bold text-black text-sm">{selectedOrder.first_name} {selectedOrder.last_name}</p>
              <p className="break-all">{selectedOrder.email}</p>
              <p>Tél : {selectedOrder.phone}</p>
              {selectedOrder.whatsapp && <p>WhatsApp : {selectedOrder.whatsapp}</p>}
            </div>
          </div>
          <div className="p-4 border border-[#c5a880]/30 rounded-xl bg-gray-50/70 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-black border-b border-[#c5a880]/20 pb-1.5 text-[10px]">Adresse d'expédition :</h4>
            <div className="space-y-1 text-gray-800">
              <p className="font-semibold text-black">{selectedOrder.address_line}</p>
              <p>{selectedOrder.city}, {selectedOrder.country}</p>
              {selectedOrder.delivery_instructions && <p className="text-[11px] italic">Note : "{selectedOrder.delivery_instructions}"</p>}
              <p className="pt-1 text-[10px] uppercase font-bold text-[#c5a880]">Paiement : <span className="text-black">{selectedOrder.payment_method}</span></p>
            </div>
          </div>
        </div>

        {/* Ordered items Table (Mobile-responsive) */}
        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[320px] sm:min-w-full">
            <thead>
              <tr className="border-b-2 border-black text-black font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-3 w-6/12">Description du Produit</th>
                <th className="py-2.5 px-2 text-center w-2/12">Quantité</th>
                <th className="py-2.5 px-2 text-right w-2/12">Prix Unitaire</th>
                <th className="py-2.5 pl-3 text-right w-2/12">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {((selectedOrder.items && selectedOrder.items.length > 0) ? selectedOrder.items : [
                {
                  id: 'fallback-item',
                  product_id: '',
                  product_name: 'Produits commandés Eureka Beauty',
                  sku: 'EB-PROD',
                  quantity: 1,
                  unit_price_xof: selectedOrder.subtotal_xof || selectedOrder.total_xof,
                  total_price_xof: selectedOrder.subtotal_xof || selectedOrder.total_xof
                }
              ]).map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/30">
                  <td className="py-3 pr-3 font-bold text-black break-words">
                    {item.product_name || 'Article Eureka Beauty'}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-black">{item.quantity || 1}</td>
                  <td className="py-3 px-2 text-right text-gray-800 whitespace-nowrap">{formatPrice(item.unit_price_xof || selectedOrder.total_xof)}</td>
                  <td className="py-3 pl-3 text-right font-bold text-black whitespace-nowrap">{formatPrice(item.total_price_xof || selectedOrder.total_xof)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Totals */}
        <div className="flex justify-end pt-6">
          <div className="w-full sm:w-80 text-xs space-y-2 border-t-2 border-black pt-4 text-gray-800">
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
            <div className="flex justify-between border-t border-black pt-2.5 text-sm font-bold text-black">
              <span>Montant Net à Payer :</span>
              <span className="text-[#c5a880] text-base font-bold">{formatPrice(selectedOrder.total_xof)}</span>
            </div>
          </div>
        </div>

        {/* Terms info */}
        <div className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-gray-200 pt-12 text-center space-y-1">
          <p>Nous vous remercions de votre confiance. Pour tout renseignement, écrivez-nous à eurekasupplytg@gmail.com.</p>
          <p className="mt-1 font-bold text-black uppercase tracking-widest text-[9px]">EUREKA BEAUTY - REVEAL YOUR NATURAL BEAUTY</p>
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
                            {ord.order_status === 'Delivered' ? 'Livrée' : ord.order_status === 'Cancelled' ? 'Annulée' : ord.order_status === 'Confirmed' ? 'Confirmée' : ord.order_status === 'Packed' ? 'Préparation' : ord.order_status === 'Shipped' ? 'Expédiée' : 'En livraison'}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => generateOrderSlipPDF(ord, formatPrice)}
                              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-white/60"
                              title="Télécharger le Bordereau PDF"
                            >
                              <Download size={11} />
                            </button>
                            {ord.order_status === 'Delivered' && (
                              <button
                                onClick={() => generateInvoicePDF(ord, formatPrice)}
                                className="w-8 h-8 rounded bg-gold/10 hover:bg-gold hover:text-white transition flex items-center justify-center text-gold border border-gold/20"
                                title="Télécharger la Facture PDF"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                              </button>
                            )}
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => generateOrderSlipPDF(selectedOrder, formatPrice)}
                    className="bg-[#1c1c1c] hover:bg-white/5 text-white font-bold border border-white/10 rounded-lg px-2 py-1.5 transition flex items-center gap-1 text-[9px] uppercase tracking-wider shadow"
                    title="Télécharger le Bordereau de Commande"
                  >
                    <Download size={10} /> Bordereau
                  </button>
                  {selectedOrder.order_status === 'Delivered' && (
                    <button
                      onClick={() => generateInvoicePDF(selectedOrder, formatPrice)}
                      className="bg-gold hover:bg-gold-hover text-dark font-bold border border-gold rounded-lg px-2 py-1.5 transition flex items-center gap-1 text-[9px] uppercase tracking-wider shadow"
                      title="Télécharger la Facture Officielle"
                    >
                      <Download size={10} /> Facture
                    </button>
                  )}
                  <button
                    onClick={() => handlePrint(selectedOrder)}
                    className="bg-white/5 hover:bg-gold hover:text-white border border-white/10 rounded-lg p-2 transition flex items-center justify-center text-white/60"
                    title="Imprimer"
                  >
                    <Printer size={12} />
                  </button>
                </div>
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

              {selectedOrder.order_status === 'Cancelled' && (
                <div className="bg-error/15 border border-error/20 p-3.5 rounded-xl text-xs space-y-1 text-error animate-in fade-in duration-300">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                    <AlertTriangle size={12} /> Commande Annulée
                  </div>
                  <p className="font-light text-[11px] leading-relaxed">
                    <strong>Motif :</strong> {selectedOrder.cancel_reason || "Aucun motif spécifié."}
                  </p>
                </div>
              )}

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
                  {((selectedOrder.items && selectedOrder.items.length > 0) ? selectedOrder.items : [
                    {
                      id: 'fallback-item',
                      product_id: '',
                      product_name: 'Produits commandés Eureka Beauty',
                      sku: 'EB-PROD',
                      quantity: 1,
                      unit_price_xof: selectedOrder.subtotal_xof || selectedOrder.total_xof,
                      total_price_xof: selectedOrder.subtotal_xof || selectedOrder.total_xof
                    }
                  ]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <div>
                        <p className="font-bold text-white">{item.product_name || 'Article Eureka Beauty'}</p>
                        <span className="text-[9px] text-white/40 uppercase">x{item.quantity || 1} • {item.sku ? `SKU: ${item.sku}` : formatPrice(item.unit_price_xof || selectedOrder.total_xof)}</span>
                      </div>
                      <span className="font-serif-display font-semibold text-gold">{formatPrice(item.total_price_xof || selectedOrder.total_xof)}</span>
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
        <div className="hidden print:block bg-white text-black p-4 font-sans space-y-6 w-full max-w-none">

          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <span className="font-serif-display text-xl font-bold tracking-wider text-black">
                EUREKA <span className="text-[#c5a880] font-normal">BEAUTY</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">Révélez votre beauté naturelle</p>
              <p className="text-[11px] text-gray-600 mt-1">Lomé, Togo • eurekasupplytg@gmail.com | +228 93 86 67 52</p>
            </div>
            <div className="text-right space-y-0.5 text-xs">
              <h2 className="font-serif-display text-xl font-bold text-black uppercase tracking-wider">Facture</h2>
              <p className="text-gray-600">N° Facture : <span className="font-bold text-black">{selectedOrder.order_number}</span></p>
              <p className="text-gray-600">Date : {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}</p>
              <p className="text-gray-600">Statut : <strong>{selectedOrder.payment_status === 'Paid' ? 'PAYÉ' : 'À PAYER À LA LIVRAISON (COD)'}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Details split */}
          <div className="grid grid-cols-2 gap-6 text-xs pt-1">
            <div className="space-y-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-1 text-[10px]">Facturé à :</h4>
              <p className="font-bold">{selectedOrder.first_name} {selectedOrder.last_name}</p>
              <p>{selectedOrder.email}</p>
              <p>Tél : {selectedOrder.phone}</p>
              {selectedOrder.whatsapp && <p>WhatsApp : {selectedOrder.whatsapp}</p>}
            </div>
            <div className="space-y-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-1 text-[10px]">Adresse d'expédition :</h4>
              <p className="font-semibold">{selectedOrder.address_line}</p>
              <p>{selectedOrder.city}, {selectedOrder.country}</p>
              {selectedOrder.delivery_instructions && <p className="italic text-[10px]">Note : "{selectedOrder.delivery_instructions}"</p>}
              <p className="pt-0.5 text-[10px] uppercase font-bold text-[#c5a880]">Paiement : <span className="text-black">{selectedOrder.payment_method}</span></p>
            </div>
          </div>

          {/* Ordered items Table */}
          <table className="w-full text-left text-xs border-collapse mt-4">
            <thead>
              <tr className="border-b-2 border-black text-black font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 pr-3 w-6/12">Description du Produit</th>
                <th className="py-2 px-2 text-center w-2/12">Quantité</th>
                <th className="py-2 px-2 text-right w-2/12">Prix Unitaire</th>
                <th className="py-2 pl-3 text-right w-2/12">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedOrder.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 pr-3 font-bold text-black">{item.product_name}</td>
                  <td className="py-2.5 px-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right whitespace-nowrap">{formatPrice(item.unit_price_xof)}</td>
                  <td className="py-2.5 pl-3 text-right font-bold whitespace-nowrap">{formatPrice(item.total_price_xof)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-72 text-xs space-y-1.5 border-t-2 border-black pt-3">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-semibold">{formatPrice(selectedOrder.subtotal_xof)}</span>
              </div>
              {selectedOrder.discount_xof > 0 && (
                <div className="flex justify-between font-bold text-[#c5a880]">
                  <span>Remises appliquées :</span>
                  <span>-{formatPrice(selectedOrder.discount_xof)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais d'expédition :</span>
                <span className="font-semibold">{formatPrice(selectedOrder.shipping_cost_xof)}</span>
              </div>
              <div className="flex justify-between border-t border-black pt-2 text-sm font-bold text-black">
                <span>Montant Net à Payer :</span>
                <span className="font-serif-display text-base font-bold text-[#c5a880]">{formatPrice(selectedOrder.total_xof)}</span>
              </div>
            </div>
          </div>

          {/* Terms info */}
          <div className="text-[9px] text-gray-500 font-light leading-relaxed border-t border-gray-200 pt-8 text-center">
            <p>Nous vous remercions de votre confiance. Pour tout renseignement, écrivez-nous à eurekasupplytg@gmail.com.</p>
            <p className="mt-1 font-bold text-black uppercase tracking-widest">EUREKA BEAUTY - REVEAL YOUR NATURAL BEAUTY</p>
          </div>

        </div>
      )}

    </div>
  );
}
