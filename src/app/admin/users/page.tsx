'use client';

import React, { useState, useEffect } from 'react';
import { db, Customer } from '@/lib/db';
import { 
  Search, 
  UserCheck, 
  Shield, 
  Truck, 
  User, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Mail, 
  Phone, 
  Key 
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'delivery' | 'customer'>('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Customer | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    loyalty_points: 0,
    role: 'customer' as 'admin' | 'delivery' | 'customer',
  });

  const loadData = async () => {
    const loadedUsers = await db.fetchUsersFromSupabase();
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      password: '',
      loyalty_points: 0,
      role: 'customer',
    });
    setEditingUser(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (u: Customer) => {
    setEditingUser(u);
    setFormData({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      whatsapp: u.whatsapp || '',
      password: '',
      loyalty_points: u.loyalty_points || 0,
      role: u.role || 'customer',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.email.trim()) {
      alert('Veuillez renseigner le prénom et l\'adresse email.');
      return;
    }

    if (editingUser) {
      db.updateUser(editingUser.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        loyalty_points: formData.loyalty_points,
        role: formData.role,
      });
      setSuccessMsg(`Le compte de ${formData.first_name} a été mis à jour.`);
    } else {
      db.addUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        password: formData.password || 'password123',
        loyalty_points: formData.loyalty_points,
        role: formData.role,
      });
      setSuccessMsg(`Nouveau compte (${formData.role.toUpperCase()}) créé avec succès !`);
    }

    setIsCreateModalOpen(false);
    resetForm();
    loadData();

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteUser = (u: Customer) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${u.first_name} ${u.last_name} (${u.email}) ?`
    );

    if (confirmDelete) {
      db.deleteUser(u.id);
      setSuccessMsg(`Le compte de ${u.first_name} ${u.last_name} a été supprimé.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleRoleChangeQuick = (userId: string, newRole: Customer['role']) => {
    db.updateUserRole(userId, newRole);
    setSuccessMsg(`Rôle mis à jour avec succès !`);
    setTimeout(() => setSuccessMsg(''), 3000);
    loadData();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Gestion des Comptes & Livreurs</h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Gérer, créer, modifier ou supprimer directement les comptes administrateurs, livreurs et clients.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gold hover:bg-gold-hover text-dark font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 uppercase tracking-wider shadow-lg shrink-0"
        >
          <Plus size={16} /> Nouveau Compte
        </button>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="bg-[#141414] border border-white/5 p-3 rounded-xl flex items-center gap-2 w-full md:max-w-md">
          <Search size={16} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-transparent text-xs text-white outline-none"
          />
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-1.5 bg-[#141414] border border-white/5 p-1 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${roleFilter === 'all' ? 'bg-gold text-dark font-bold' : 'text-white/60 hover:text-white'}`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 whitespace-nowrap ${roleFilter === 'admin' ? 'bg-gold text-dark font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <Shield size={13} /> Admins ({users.filter(u => u.role === 'admin').length})
          </button>
          <button
            onClick={() => setRoleFilter('delivery')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 whitespace-nowrap ${roleFilter === 'delivery' ? 'bg-gold text-dark font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <Truck size={13} /> Livreurs ({users.filter(u => u.role === 'delivery').length})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 whitespace-nowrap ${roleFilter === 'customer' ? 'bg-gold text-dark font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <User size={13} /> Clients ({users.filter(u => !u.role || u.role === 'customer').length})
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div 
            key={u.id} 
            className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-gold/30 transition duration-300 flex flex-col justify-between relative group"
          >
            <div className="space-y-3">
              
              {/* Header card with name & action buttons */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold border border-gold/10 font-bold font-serif-display uppercase text-sm shrink-0">
                    {u.first_name[0]}{u.last_name ? u.last_name[0] : ''}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">{u.first_name} {u.last_name}</h3>
                    <p className="text-[10px] text-white/40 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    title="Modifier"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-white/60 hover:text-gold transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u)}
                    title="Supprimer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-error/20 text-white/60 hover:text-error transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Account details box */}
              <div className="text-[10px] text-white/60 space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed font-light">
                <p className="flex items-center gap-1.5">
                  <Phone size={12} className="text-gold/70 shrink-0" />
                  <span>Téléphone : <strong>{u.phone || 'Non renseigné'}</strong></span>
                </p>
                {u.whatsapp && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} className="text-success shrink-0" />
                    <span>WhatsApp : <strong>{u.whatsapp}</strong></span>
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <UserCheck size={12} className="text-gold/70 shrink-0" />
                  <span>Points de fidélité : <strong className="text-gold">{u.loyalty_points || 0} pts</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="pt-4 border-t border-white/5 mt-2 flex flex-col gap-1.5">
              <label className="block text-[8px] uppercase tracking-widest text-gold font-bold">Rôle Utilisateur</label>
              <div className="flex items-center gap-2">
                <div className="text-gold shrink-0">
                  {u.role === 'admin' ? (
                    <Shield size={16} />
                  ) : u.role === 'delivery' ? (
                    <Truck size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <select
                  value={u.role || 'customer'}
                  onChange={(e) => handleRoleChangeQuick(u.id, e.target.value as any)}
                  className="flex-grow bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold"
                >
                  <option value="customer" className="bg-[#141414] text-white">Client standard</option>
                  <option value="delivery" className="bg-[#141414] text-white">Livreur (delivery)</option>
                  <option value="admin" className="bg-[#141414] text-white">Administrateur</option>
                </select>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <User size={32} className="mx-auto text-white/20" />
          <p className="text-xs text-white/40 italic">Aucun compte trouvé correspondant aux critères.</p>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-serif-display text-xl font-bold text-white flex items-center gap-2">
                {editingUser ? <Pencil size={18} className="text-gold" /> : <Plus size={18} className="text-gold" />}
                {editingUser ? 'Modifier le Compte' : 'Créer un Nouveau Compte'}
              </h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="text-white/40 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Ex: Jean"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Ex: Dupont"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemple@eurekabeauty.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">Téléphone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+225 07 00 00 00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+225 07 00 00 00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">Mot de Passe par Défaut</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Laissez vide pour 'password123'"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  >
                    <option value="customer" className="bg-[#141414] text-white">Client Standard</option>
                    <option value="delivery" className="bg-[#141414] text-white">Livreur (Delivery)</option>
                    <option value="admin" className="bg-[#141414] text-white">Administrateur</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-white/60 font-medium">Points Fidélité</label>
                  <input
                    type="number"
                    value={formData.loyalty_points}
                    onChange={(e) => setFormData({ ...formData, loyalty_points: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-dark font-bold transition shadow-lg flex items-center gap-1.5"
                >
                  <Check size={16} /> {editingUser ? 'Sauvegarder' : 'Créer le Compte'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
