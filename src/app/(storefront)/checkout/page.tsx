'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db, DeliveryZone, Order, ShippingCountry } from '@/lib/db';
import { trackMetaEvent } from '@/lib/metaPixel';
import { notifyNewOrder, sendOrderEmailAlert } from '@/lib/notifications';
import { generateOrderSlipPDF } from '@/lib/pdfGenerator';
import {
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  Phone,
  MessageSquare,
  Sparkles,
  Ticket,
  FileText
} from 'lucide-react';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, t } = useLangCurr();
  const {
    cart,
    appliedCoupon,
    shippingZone,
    setShippingZone,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
    clearCart
  } = useCart();
  const { user, updateProfile } = useAuth();

  // Order placement status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const hasAutoDownloaded = useRef(false);
  useEffect(() => {
    if (placedOrder && !hasAutoDownloaded.current) {
      hasAutoDownloaded.current = true;
      try {
        generateOrderSlipPDF(placedOrder, formatPrice);
      } catch (err) {
        console.error('Auto-download PDF error:', err);
      }
    }
  }, [placedOrder, formatPrice]);

  // Form Fields
  const [fullName, setFullName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || user?.phone || '');
  const [phone, setPhone] = useState(user?.whatsapp || user?.phone || '');
  const [country, setCountry] = useState('Togo');
  const [city, setCity] = useState('Lomé');
  const [addressLine, setAddressLine] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MobileMoney' | 'Card' | 'WhatsApp'>('COD');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromWhatsApp = searchParams.get('from') === 'whatsapp';
      if (fromWhatsApp) {
        setPaymentMethod('WhatsApp');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (placedOrder && placedOrder.payment_method === 'WhatsApp') {
      const productsList = placedOrder.items
         .map((item) => `* ${item.product_name} x${item.quantity} — ${formatPrice(item.unit_price_xof * item.quantity)}`)
        .join('\n');

      const rawMessage = `Nouvelle commande ✨ Eureka Beauty Africa
👤 Client : ${placedOrder.first_name.toUpperCase()} ${placedOrder.last_name.toUpperCase()}
📱 Téléphone : ${placedOrder.phone}
📍 Adresse : ${placedOrder.address_line.toUpperCase()}, ${placedOrder.city.toUpperCase()} — ${placedOrder.country}
🚚 Livraison : ${placedOrder.country} — ${placedOrder.city} (${placedOrder.shipping_cost_xof === 0 ? 'gratuite' : formatPrice(placedOrder.shipping_cost_xof)})
Produits :
${productsList}
Sous-total : ${formatPrice(placedOrder.subtotal_xof)}
${placedOrder.discount_xof > 0 ? `Réduction : -${formatPrice(placedOrder.discount_xof)}\n` : ''}Livraison : ${placedOrder.shipping_cost_xof === 0 ? 'Gratuite' : formatPrice(placedOrder.shipping_cost_xof)}
Total : ${formatPrice(placedOrder.total_xof)}`;

      const whatsappMessage = encodeURIComponent(rawMessage);
      const url = `https://wa.me/22893866752?text=${whatsappMessage}`;
      
      // Auto redirect to WhatsApp
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  }, [placedOrder]);

  // Loyalty rewards state
  const [useLoyalty, setUseLoyalty] = useState(false);
  const loyaltyPointsBalance = user?.loyalty_points || 0;
  const loyaltyDiscountValue = loyaltyPointsBalance * 10; // 1 point = 10 FCFA discount

  const [customCity, setCustomCity] = useState('');
  const [countriesList, setCountriesList] = useState<ShippingCountry[]>([]);

  // Load countries dynamically from database
  useEffect(() => {
    const loaded = db.getShippingCountries();
    setCountriesList(loaded);
    if (loaded.length > 0) {
      setCountry(loaded[0].country_name);
    }
  }, []);

  // Synchronize Auth user details if logged in
  useEffect(() => {
    if (user) {
      setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
    }
  }, [user]);

  // Reset city selection when country changes
  useEffect(() => {
    const currentCountryObj = countriesList.find(c => c.country_name === country);
    if (currentCountryObj && currentCountryObj.free_shipping_cities.length > 0) {
      setCity(currentCountryObj.free_shipping_cities[0]);
    } else {
      setCity('Autre');
    }
    setCustomCity("");
  }, [country, countriesList]);

  // Synchronize shipping cost to the CartContext dynamically
  useEffect(() => {
    if (city === 'Autre') {
      const cost = db.getCustomShippingCost(country);
      setShippingZone({
        id: 'custom-paid-zone',
        country,
        city: customCity || 'Autre',
        zone_name: `Tarif standard (${country})`,
        cost_xof: cost,
        shipping_type: 'Standard',
        min_days: 2,
        max_days: 5,
      });
    } else {
      setShippingZone({
        id: 'custom-free-zone',
        country,
        city,
        zone_name: `Livraison gratuite (${city})`,
        cost_xof: 0,
        shipping_type: 'Standard',
        min_days: 1,
        max_days: 3,
      });
    }
  }, [country, city, customCity]);

  // Perform calculations
  const subtotal = getCartSubtotal();
  const couponDiscount = getCartDiscount();
  const loyaltyDiscount = useLoyalty ? Math.min(loyaltyDiscountValue, subtotal - couponDiscount) : 0;
  const shippingCost = shippingZone ? shippingZone.cost_xof : 0;

  const finalDiscount = couponDiscount + loyaltyDiscount;
  const finalTotal = Math.max(0, subtotal - finalDiscount + shippingCost);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!fullName || !phone || !addressLine) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    // Simulate Payment Gateway if Card/Mobile Money is chosen
    if (paymentMethod !== 'COD') {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate gateway handshakes
    }

    // Prepare items array
    const orderItems = cart.map((item) => ({
      id: 'ord-itm-' + Math.random().toString(36).substr(2, 9),
      product_id: item.product_id,
      product_name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price_xof: item.price_xof * (1 - item.discount_percent / 100),
      total_price_xof: item.price_xof * (1 - item.discount_percent / 100) * item.quantity,
    }));

    const nameParts = fullName.trim().split(' ');
    const resolvedFirstName = nameParts[0] || 'Client';
    const resolvedLastName = nameParts.slice(1).join(' ') || 'Eureka';

    const orderData = {
      customer_id: user?.id || null,
      coupon_id: appliedCoupon?.id || null,
      first_name: resolvedFirstName,
      last_name: resolvedLastName,
      email: email || '',
      phone,
      whatsapp,
      country,
      city: city === 'Autre' ? customCity : city,
      address_line: addressLine,
      delivery_instructions: deliveryInstructions,
      shipping_cost_xof: shippingCost,
      subtotal_xof: subtotal,
      discount_xof: finalDiscount,
      total_xof: finalTotal,
      currency: countriesList.find(c => c.country_name === country)?.currency || 'XOF',
      payment_method: paymentMethod,
      items: orderItems,
    };

    try {
      const order = db.createOrder(orderData);
      setPlacedOrder(order);

      // Trigger App Push Notification & Sound
      notifyNewOrder(order.order_number, `${order.first_name} ${order.last_name}`, finalTotal);
      
      // Trigger Admin & Delivery Driver Email Alert
      sendOrderEmailAlert({
        order_number: order.order_number,
        first_name: order.first_name,
        last_name: order.last_name,
        total_xof: finalTotal,
        phone: order.phone,
        city: order.city,
      });

      trackMetaEvent('Purchase', {
        value: finalTotal,
        currency: 'XOF',
        num_items: orderItems.length
      });

      // Reward loyalty points (5% of subtotal, rounded)
      if (user) {
        const earnedPoints = Math.round(subtotal * 0.005);
        // deduct applied points, add earned points
        const updatedPoints = Math.max(0, loyaltyPointsBalance - (useLoyalty ? loyaltyPointsBalance : 0)) + earnedPoints;
        updateProfile({ loyalty_points: updatedPoints });
      }

      clearCart();
    } catch (err) {
      alert('Une erreur est survenue lors de la création de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (placedOrder) {
    const productsList = placedOrder.items
      .map((item) => `* ${item.product_name} x${item.quantity} — ${formatPrice(item.unit_price_xof * item.quantity)}`)
      .join('\n');

    const rawMessage = `Nouvelle commande \u2728 Eureka Beauty Africa
\uD83D\uDC64 Client : ${placedOrder.first_name.toUpperCase()} ${placedOrder.last_name.toUpperCase()}
\uD83D\uDCF1 Téléphone : ${placedOrder.phone}
\uD83D\uDCCD Adresse : ${placedOrder.address_line.toUpperCase()}, ${placedOrder.city.toUpperCase()} — ${placedOrder.country}
\uD83D\uDE9A Livraison : ${placedOrder.country} — ${placedOrder.city} (${placedOrder.shipping_cost_xof === 0 ? 'gratuite' : formatPrice(placedOrder.shipping_cost_xof)})
Produits :
${productsList}
Sous-total : ${formatPrice(placedOrder.subtotal_xof)}
${placedOrder.discount_xof > 0 ? `Réduction : -${formatPrice(placedOrder.discount_xof)}\n` : ''}Livraison : ${placedOrder.shipping_cost_xof === 0 ? 'Gratuite' : formatPrice(placedOrder.shipping_cost_xof)}
Total : ${formatPrice(placedOrder.total_xof)}`;

    const whatsappMessage = encodeURIComponent(rawMessage);

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 fade-in">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto">
          <CheckCircle size={40} />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Commande Validée</span>
          <h1 className="font-serif-display text-3xl font-medium text-dark">
            Merci Pour Votre Achat !
          </h1>
          <p className="text-xs text-dark-muted leading-relaxed max-w-sm mx-auto font-light">
            Votre commande a été enregistrée avec succès sous le numéro <strong>{placedOrder.order_number}</strong>. Un e-mail de confirmation vous a été envoyé.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-gold/10 rounded-2xl p-6 text-left space-y-4 luxury-shadow-sm">
          <h3 className="font-serif-display text-sm font-semibold border-b border-gold/5 pb-2 text-dark uppercase tracking-wider">Récapitulatif de Livraison</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-dark-muted">Destinataire :</p>
              <p className="font-semibold text-dark mt-0.5">{placedOrder.first_name} {placedOrder.last_name}</p>
            </div>
            <div>
              <p className="text-dark-muted">Téléphone :</p>
              <p className="font-semibold text-dark mt-0.5">{placedOrder.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-dark-muted">Adresse de livraison :</p>
              <p className="font-semibold text-dark mt-0.5">{placedOrder.address_line}, {placedOrder.city}, {placedOrder.country}</p>
            </div>
            <div>
              <p className="text-dark-muted">Méthode de Paiement :</p>
              <p className="font-semibold text-gold mt-0.5 uppercase">
                {placedOrder.payment_method === 'COD' 
                  ? 'Espèces à la Livraison (COD)' 
                  : placedOrder.payment_method === 'WhatsApp' 
                  ? 'Validation & Achat par WhatsApp' 
                  : placedOrder.payment_method}
              </p>
            </div>
            <div>
              <p className="text-dark-muted">Total Payé :</p>
              <p className="font-semibold text-dark mt-0.5">{formatPrice(placedOrder.total_xof)}</p>
            </div>
          </div>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => generateOrderSlipPDF(placedOrder, formatPrice)}
            className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            <span>Télécharger le Bordereau PDF</span>
          </button>

          <a
            href={`https://wa.me/22893866752?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Valider sur WhatsApp</span>
          </a>

          <Link
            href="/track"
            className="bg-dark hover:bg-gold text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>Suivre ma commande</span>
          </Link>
        </div>

        <Link href="/shop" className="text-xs text-gold underline font-bold uppercase tracking-wider block hover:text-gold-hover transition">
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  // EMPTY CHECKOUT REDIRECT
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 bg-bg-cream rounded-full flex items-center justify-center text-gold mx-auto border border-gold/10">
          <ShoppingBag size={20} />
        </div>
        <h3 className="font-serif-display text-lg font-semibold text-dark">Votre panier est vide</h3>
        <p className="text-xs text-dark-muted leading-relaxed font-light">
          Vous devez ajouter au moins un produit cosmétique ou soin au panier avant de passer à l\'étape de paiement.
        </p>
        <Link
          href="/shop"
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-lg transition inline-block"
        >
          Parcourir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif-display text-3xl font-medium tracking-wide text-dark border-b border-gold/10 pb-6 mb-8">
        Finaliser la Commande
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left 7 Columns: Delivery & Payment Forms */}
        <div className="lg:col-span-7 space-y-8">

          {/* Section 1: Customer details */}
          <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-4 luxury-shadow-sm">
            <h2 className="font-serif-display text-lg font-semibold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-gold/5 pb-2">
              <span className="text-gold">1.</span> {t('billingDetails')}
            </h2>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                Nom <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nom et Prénom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                Numéro WhatsApp <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: +228 93 86 67 52"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  setPhone(e.target.value);
                }}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                {t('email')} <span className="text-dark-muted font-normal">(Optionnel)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>
          </div>

          {/* Section 2: Address details */}
          <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-4 luxury-shadow-sm">
            <h2 className="font-serif-display text-lg font-semibold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-gold/5 pb-2">
              <span className="text-gold">2.</span> Destination de Livraison
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                  {t('country')} <span className="text-error">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-2.5 py-2.5 border border-gold/15 text-dark font-medium"
                >
                  {countriesList.map((c) => (
                    <option key={c.id} value={c.country_name}>
                      {c.country_name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                  {t('city')} <span className="text-error">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (e.target.value !== 'Autre') {
                      setCustomCity('');
                    }
                  }}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-2.5 py-2.5 border border-gold/15 text-dark font-medium"
                >
                  {countriesList.find(c => c.country_name === country)?.free_shipping_cities.map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                  <option value="Autre">Autre (Saisir manuellement)</option>
                </select>
              </div>
            </div>

            {city === 'Autre' && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                  Nom de votre ville <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Saisissez le nom de votre ville"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                />
              </div>
            )}

            {/* Display Shipping Alert */}
            {city === 'Autre' ? (
              <div className="bg-gold/5 border border-gold/20 p-3.5 rounded-xl text-xs text-dark font-light leading-relaxed">
                🚚 <strong>Tarif livraison hors capitale ({country}) :</strong> {formatPrice(db.getCustomShippingCost(country))}. Ce montant sera ajouté à votre total.
              </div>
            ) : (
              <div className="bg-success/5 border border-success/20 p-3.5 rounded-xl text-xs text-success font-medium">
                ✓ <strong>Livraison Gratuite</strong> pour la capitale/ville sélectionnée ({city}) !
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                {t('address')} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cocody Mermoz, Rue C20, Villa 45"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
                {t('deliveryNotes')}
              </label>
              <textarea
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2 border border-gold/15 text-dark resize-none"
              />
            </div>
          </div>

          {/* Section 3: Payment details */}
          <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-4 luxury-shadow-sm">
            <h2 className="font-serif-display text-lg font-semibold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-gold/5 pb-2">
              <span className="text-gold">3.</span> {t('paymentMethod')}
            </h2>

            <div className="space-y-3">
              {/* COD: Default Cash on Delivery */}
              <label className="flex items-start gap-4 p-4 rounded-xl border border-gold cursor-pointer bg-gold/5 transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <span className="font-bold text-dark flex items-center gap-2">
                    <Truck size={16} className="text-gold" />
                    Paiement à la livraison (COD) - Recommandé
                  </span>
                  <p className="text-dark-muted font-light mt-1">Payez en espèces ou via Mobile Money directement auprès du livreur lors de la réception de votre colis.</p>
                </div>
              </label>

              {/* Mobile Money simulation */}
              <label className="flex items-start gap-4 p-4 rounded-xl border border-gold/10 cursor-pointer bg-white hover:bg-bg-cream/20 transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'MobileMoney'}
                  onChange={() => setPaymentMethod('MobileMoney')}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <span className="font-bold text-dark flex items-center gap-2">
                    <Phone size={16} className="text-gold" />
                    Mobile Money Express (Wave, Orange, MTN, Moov)
                  </span>
                  <p className="text-dark-muted font-light mt-1">Payez instantanément avec votre portefeuille Wave ou Mobile Money. Simulation de passerelle Paystack.</p>
                </div>
              </label>

              {/* Card payment */}
              <label className="flex items-start gap-4 p-4 rounded-xl border border-gold/10 cursor-pointer bg-white hover:bg-bg-cream/20 transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <span className="font-bold text-dark flex items-center gap-2">
                    <CreditCard size={16} className="text-gold" />
                    Carte Bancaire Internationale (Visa, Mastercard)
                  </span>
                  <p className="text-dark-muted font-light mt-1">Paiement sécurisé via Stripe. Convient pour les paiements locaux et internationaux.</p>
                </div>
              </label>
              {/* WhatsApp confirmation option */}
              <label className="flex items-start gap-4 p-4 rounded-xl border border-gold/10 cursor-pointer bg-white hover:bg-bg-cream/20 transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'WhatsApp'}
                  onChange={() => setPaymentMethod('WhatsApp')}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <span className="font-bold text-dark flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#25D366]" />
                    Confirmation et Achat par WhatsApp - Recommandé
                  </span>
                  <p className="text-dark-muted font-light mt-1">Remplissez vos coordonnées de livraison puis validez et confirmez instantanément vos articles via WhatsApp avec notre conseiller.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow-sm sticky top-24">
            <h3 className="font-serif-display font-semibold text-lg text-dark border-b border-gold/10 pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" /> Votre Panier
            </h3>

            {/* List products in cart */}
            <div className="space-y-4 max-h-48 overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-3 justify-between items-center text-xs">
                  <div className="flex gap-2 items-center truncate">
                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded bg-bg-cream" />
                    <span className="truncate max-w-[150px] font-medium text-dark">{item.name} (x{item.quantity})</span>
                  </div>
                  <span className="font-semibold text-gold font-serif-display">
                    {formatPrice(item.price_xof * (1 - item.discount_percent / 100) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Loyalty points toggle */}
            {user && loyaltyPointsBalance > 0 && (
              <div className="bg-bg-cream p-4 rounded-xl border border-gold/15 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-dark flex items-center gap-1">
                    <Sparkles size={12} className="text-gold" /> Points de fidélité
                  </span>
                  <span className="bg-gold/15 text-gold px-2 py-0.5 rounded font-bold">{loyaltyPointsBalance} pts</span>
                </div>
                <p className="text-[10px] text-dark-muted leading-relaxed">
                  Vous disposez d\'une remise de {formatPrice(loyaltyDiscountValue)}. Voulez-vous l\'appliquer ?
                </p>
                <button
                  type="button"
                  onClick={() => setUseLoyalty(!useLoyalty)}
                  className={`w-full py-2 rounded text-[10px] uppercase tracking-widest font-bold transition border ${useLoyalty ? 'bg-gold text-white border-transparent' : 'bg-white text-dark border-gold/25'}`}
                >
                  {useLoyalty ? '✓ Points Appliqués' : 'Appliquer la remise'}
                </button>
              </div>
            )}

            {/* Coupon display */}
            {appliedCoupon && (
              <div className="flex justify-between items-center bg-gold/5 border border-dashed border-gold px-3 py-2 rounded-lg text-xs text-gold">
                <span className="flex items-center gap-1.5"><Ticket size={14} /> Coupon: <strong>{appliedCoupon.code}</strong></span>
                <span className="font-bold">-{appliedCoupon.discount_percent}%</span>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-3 text-xs text-dark-muted border-t border-gold/10 pt-4">
              <div className="flex justify-between">
                <span>Sous-total articles</span>
                <span className="font-semibold text-dark">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-gold font-bold">
                  <span>Remise Coupon ({appliedCoupon.discount_percent}%)</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              {useLoyalty && (
                <div className="flex justify-between text-gold font-bold">
                  <span>Remise Fidélité</span>
                  <span>-{formatPrice(loyaltyDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span className="font-semibold text-dark">{shippingCost > 0 ? formatPrice(shippingCost) : 'Calculé'}</span>
              </div>

              {shippingZone && (
                <div className="text-[10px] text-dark-muted leading-relaxed font-light">
                  Option: <span className="font-bold">{shippingZone.zone_name}</span> ({shippingZone.min_days}-{shippingZone.max_days} jours).
                </div>
              )}

              <div className="flex justify-between border-t border-gold/10 pt-4 text-sm text-dark font-bold">
                <span>Total de la commande</span>
                <span className="text-gold font-serif-display font-semibold text-lg">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-hover disabled:bg-gold/40 text-white text-xs font-semibold uppercase tracking-widest py-4 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <span>{t('placeOrder')}</span>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px] bg-bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
