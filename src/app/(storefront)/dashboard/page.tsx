'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { db, Order, Product } from '@/lib/db';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  Sparkles, 
  MapPin, 
  KeyRound, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Tag,
  CheckCircle,
  Truck,
  Globe
} from 'lucide-react';

function CustomerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, logout, updateProfile, loading } = useAuth();
  const { addToCart } = useCart();
  const { formatPrice } = useLangCurr();

  // URL parameters for defaults
  const initialTab = searchParams.get('auth') === 'login' ? 'login' : 'login';

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialTab as any);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active dashboard tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');

  // Customer states
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Profile Form states
  const [profileFirst, setProfileFirst] = useState('');
  const [profileLast, setProfileLast] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync profile details on mount/change
  useEffect(() => {
    if (user) {
      setProfileFirst(user.first_name || '');
      setProfileLast(user.last_name || '');
      setProfilePhone(user.phone || '');
      setProfileWhatsapp(user.whatsapp || '');

      // Load orders
      const orders = db.getOrders().filter(o => o.customer_id === user.id);
      setMyOrders(orders);

      // Load wishlist
      const wishProductIds = db.getWishlist(user.id);
      const allProds = db.getProducts();
      const wishlistProds = allProds.filter(p => wishProductIds.includes(p.id));
      setWishlistItems(wishlistProds);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (res.success) {
      if (res.isAdmin) {
        router.push('/admin');
      } else {
        setActiveTab('orders');
      }
    } else {
      setErrorMsg(res.error || 'Erreur lors de la connexion');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!firstName || !lastName || !email || !phone) {
      setErrorMsg('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    const res = await register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      whatsapp: whatsapp || phone, // fallback to phone
    });

    if (res.success) {
      setActiveTab('orders');
    } else {
      setErrorMsg(res.error || 'Erreur lors de l\'inscription');
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    updateProfile({
      first_name: profileFirst,
      last_name: profileLast,
      phone: profilePhone,
      whatsapp: profileWhatsapp,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleRemoveWishlist = (prodId: string) => {
    if (!user) return;
    db.toggleWishlist(user.id, prodId);
    // Reload wishlist
    const wishProductIds = db.getWishlist(user.id);
    const wishlistProds = db.getProducts().filter(p => wishProductIds.includes(p.id));
    setWishlistItems(wishlistProds);
  };

  // Render Loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  // ==========================================
  // RENDER GUEST VIEW (LOGIN/REGISTER)
  // ==========================================
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8 fade-in">
        
        {/* Banner Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">Mon Espace Eureka</span>
          <h1 className="font-serif-display text-3xl font-medium tracking-wider text-dark">Connexion & Compte</h1>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-2" />
        </div>

        {/* Auth form Card */}
        <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 luxury-shadow-sm space-y-6">
          
          {/* Tabs header */}
          <div className="grid grid-cols-2 border-b border-gold/10 pb-4 text-center text-xs uppercase tracking-widest font-semibold">
            <button 
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`pb-2 transition ${authMode === 'login' ? 'text-gold border-b-2 border-gold font-bold' : 'text-dark-muted'}`}
            >
              Se Connecter
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`pb-2 transition ${authMode === 'register' ? 'text-gold border-b-2 border-gold font-bold' : 'text-dark-muted'}`}
            >
              Créer Compte
            </button>
          </div>

          {errorMsg && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-xs text-error font-semibold flex items-center gap-1.5">
              <ShieldAlert size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: customer@eurekabeauty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-dark hover:bg-gold text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-lg transition shadow"
              >
                Se connecter
              </button>

              <div className="text-[10px] text-dark-muted font-light bg-bg-cream p-3 rounded-lg border border-gold/10 space-y-1 mt-4">
                <p className="font-bold text-gold uppercase tracking-wider">Comptes de test pré-installés :</p>
                <p>• <strong>Compte Admin:</strong> admin@eurekabeauty.com (Mot de passe: admin123)</p>
                <p>• <strong>Compte Client:</strong> customer@eurekabeauty.com (Mot de passe: customer123)</p>
              </div>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: fatou@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Téléphone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+221..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="WhatsApp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded-lg transition shadow"
              >
                S'inscrire
              </button>
            </form>
          )}

          {/* Social Logins */}
          <div className="space-y-3 pt-4 border-t border-gold/10 text-center">
            <span className="text-[9px] uppercase tracking-widest text-dark-muted font-semibold">Ou continuer avec</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button onClick={() => alert('Simulation de connexion Google...')} className="flex items-center justify-center gap-2 border border-gold/15 rounded-lg py-2.5 hover:bg-bg-cream transition">
                <Globe size={14} className="text-[#DB4437]" /> Google
              </button>
              <button onClick={() => alert('Simulation de connexion Facebook...')} className="flex items-center justify-center gap-2 border border-gold/15 rounded-lg py-2.5 hover:bg-bg-cream transition">
                <svg className="w-3.5 h-3.5 text-[#4267B2] fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER CUSTOMER PORTAL VIEW
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Navigation */}
        <aside className="lg:col-span-3 bg-white border border-gold/10 rounded-2xl p-6 space-y-6 luxury-shadow-sm">
          
          {/* User card info */}
          <div className="flex items-center gap-3 pb-6 border-b border-gold/10">
            <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold border border-gold/10 flex-shrink-0 font-serif-display font-semibold text-lg uppercase">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="text-xs truncate">
              <p className="font-bold text-dark text-sm truncate">{user.first_name} {user.last_name}</p>
              <p className="text-gold mt-0.5 uppercase tracking-wider font-semibold">{user.role === 'admin' ? 'Administrateur' : 'Client Privé'}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-widest">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center gap-2 ${activeTab === 'orders' ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
            >
              <ShoppingBag size={14} /> Mes Commandes ({myOrders.length})
            </button>
            
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
            >
              <Heart size={14} /> Liste d'envies ({wishlistItems.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center gap-2 ${activeTab === 'settings' ? 'bg-gold/10 text-gold font-bold' : 'text-dark hover:bg-bg-cream'}`}
            >
              <Settings size={14} /> Profil & Coordonnées
            </button>

            <button
              onClick={logout}
              className="w-full text-left py-2.5 px-3 rounded-lg transition flex items-center gap-2 text-error hover:bg-error/5"
            >
              <LogOut size={14} /> Se déconnecter
            </button>
          </nav>
        </aside>

        {/* Right Column content panel */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Welcome Points banner */}
          <div className="bg-gradient-to-r from-dark to-[#1a1a1a] text-white rounded-2xl p-6 sm:p-8 luxury-shadow flex flex-col sm:flex-row justify-between items-center gap-6 border border-gold/10">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[9px] bg-gold/20 border border-gold/40 text-gold font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles size={10} /> Club Privé Eureka
              </span>
              <h2 className="font-serif-display text-2xl font-semibold">
                Ravi de vous revoir, {user.first_name} !
              </h2>
              <p className="text-[11px] text-white/60 leading-relaxed font-light">
                Chaque achat vous rapporte 0.5% en points de fidélité réutilisables lors de vos checkouts.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[140px] text-center flex-shrink-0">
              <span className="text-[9px] uppercase tracking-widest text-white/40 block">Points Accumulés</span>
              <span className="font-serif-display text-3xl font-bold text-gold mt-1 block">{user.loyalty_points}</span>
              <span className="text-[9px] text-gold/75 mt-1 block">Valeur: {formatPrice(user.loyalty_points * 10)}</span>
            </div>
          </div>

          {/* TAB CONTENT: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow-sm">
              <h3 className="font-serif-display text-lg font-semibold text-dark border-b border-gold/5 pb-3 uppercase tracking-wider">Historique de mes commandes</h3>
              
              {myOrders.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-xs text-dark-muted font-light">Vous n'avez pas encore passé de commande sur notre boutique.</p>
                  <button onClick={() => router.push('/shop')} className="bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition hover:bg-gold-hover">
                    Parcourir les produits
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((ord) => (
                    <div key={ord.id} className="border border-gold/10 rounded-xl p-4 sm:p-6 hover:bg-bg-cream/10 transition space-y-4">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div>
                          <p className="font-bold text-dark text-sm">Commande {ord.order_number}</p>
                          <p className="text-dark-muted font-light mt-0.5">Placée le {new Date(ord.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[9px] uppercase ${ord.order_status === 'Delivered' ? 'bg-success/15 text-success' : 'bg-gold/15 text-gold'}`}>
                            {ord.order_status}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[9px] uppercase ${ord.payment_status === 'Paid' ? 'bg-success/15 text-success' : 'bg-accent/15 text-accent'}`}>
                            {ord.payment_status === 'Paid' ? 'PAYÉ' : 'COD PENDANT'}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2 text-xs border-t border-gold/5 pt-4">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-dark font-medium">
                            <span>{item.product_name} <span className="text-dark-muted">x{item.quantity}</span></span>
                            <span>{formatPrice(item.total_price_xof)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary pricing & follow */}
                      <div className="flex justify-between items-center pt-4 border-t border-gold/5 text-xs">
                        <div>
                          <span className="text-dark-muted">Total: </span>
                          <span className="font-bold text-gold text-sm">{formatPrice(ord.total_xof)}</span>
                        </div>
                        <button
                          onClick={() => router.push(`/track?num=${ord.order_number}&phone=${ord.phone}`)}
                          className="text-[10px] font-bold uppercase tracking-widest text-dark hover:text-gold transition flex items-center gap-0.5"
                        >
                          Suivre le colis <ChevronRight size={12} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow-sm">
              <h3 className="font-serif-display text-lg font-semibold text-dark border-b border-gold/5 pb-3 uppercase tracking-wider">Ma Liste d'envies</h3>
              
              {wishlistItems.length === 0 ? (
                <p className="text-xs text-dark-muted font-light text-center py-10">Votre liste d'envies est vide.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((prod) => (
                    <div key={prod.id} className="flex gap-4 p-4 border border-gold/5 rounded-xl hover:bg-bg-cream/10 transition items-center">
                      <img src={prod.images[0]} alt={prod.name} className="w-16 h-16 object-cover rounded-lg bg-bg-cream flex-shrink-0" />
                      <div className="flex-1 text-xs truncate space-y-1">
                        <h4 className="font-serif-display font-semibold text-dark truncate">{prod.name}</h4>
                        <p className="text-gold font-bold">{formatPrice(prod.price_xof)}</p>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => {
                              addToCart(prod, 1);
                              alert(`${prod.name} ajouté au panier !`);
                            }}
                            className="bg-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition"
                          >
                            Prendre
                          </button>
                          <button
                            onClick={() => handleRemoveWishlist(prod.id)}
                            className="text-[9px] font-bold text-error uppercase hover:underline"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-gold/10 rounded-2xl p-6 sm:p-8 space-y-6 luxury-shadow-sm">
              <h3 className="font-serif-display text-lg font-semibold text-dark border-b border-gold/5 pb-3 uppercase tracking-wider">Modifier mon profil</h3>
              
              {profileSuccess && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-xs text-success font-semibold">
                  ✓ Votre profil a été mis à jour avec succès !
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      value={profileFirst}
                      onChange={(e) => setProfileFirst(e.target.value)}
                      className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={profileLast}
                      onChange={(e) => setProfileLast(e.target.value)}
                      className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Téléphone de contact</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Ligne WhatsApp</label>
                    <input
                      type="tel"
                      value={profileWhatsapp}
                      onChange={(e) => setProfileWhatsapp(e.target.value)}
                      className="w-full text-xs bg-bg-cream/40 rounded-lg px-3 py-2.5 border border-gold/15 text-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Adresse E-mail (Non modifiable)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs bg-bg-cream rounded-lg px-3 py-2.5 border border-gold/10 text-dark-muted cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-dark hover:bg-gold text-white text-xs font-semibold uppercase tracking-widest px-8 py-3 rounded-lg transition shadow"
                >
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <CustomerDashboard />
    </Suspense>
  );
}
