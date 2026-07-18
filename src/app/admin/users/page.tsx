'use client';

import React, { useState, useEffect } from 'react';
import { db, Customer } from '@/lib/db';
import { Search, UserCheck, Shield, Truck, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('supabase_sync_complete', loadData);
    return () => window.removeEventListener('supabase_sync_complete', loadData);
  }, []);

  const handleRoleChange = (userId: string, newRole: Customer['role']) => {
    db.updateUserRole(userId, newRole);
    setSuccessMsg(`Rôle mis à jour avec succès !`);
    setTimeout(() => setSuccessMsg(''), 3000);
    loadData();
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.first_name + ' ' + u.last_name).toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  return (
    <div className="space-y-8 fade-in text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Comptes & Livrants</h1>
          <p className="text-xs text-white/50 mt-1 font-light">Gérer les rôles et permissions des utilisateurs de la plateforme (Clients, Livants, Admins).</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      <div className="space-y-6">
        
        {/* Search filter */}
        <div className="bg-[#141414] border border-white/5 p-4 rounded-xl flex items-center gap-2 max-w-md">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            placeholder="Rechercher par nom, e-mail ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-transparent text-xs text-white outline-none"
          />
        </div>

        {/* Users list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div key={u.id} className="bg-[#141414] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-gold/30 transition duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                
                {/* User avatar/name card */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold border border-gold/10 font-bold font-serif-display uppercase text-sm">
                    {u.first_name[0]}{u.last_name[0]}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">{u.first_name} {u.last_name}</h3>
                    <p className="text-[10px] text-white/40 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="text-[10px] text-white/60 space-y-1 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed font-light">
                  <p>• <strong>Téléphone :</strong> {u.phone || 'Non renseigné'}</p>
                  {u.whatsapp && <p>• <strong>WhatsApp :</strong> {u.whatsapp}</p>}
                  <p>• <strong>Points Fidélité :</strong> <span className="text-gold font-bold">{u.loyalty_points || 0}</span></p>
                </div>
              </div>

              {/* Role Select input */}
              <div className="pt-4 border-t border-white/5 mt-2 flex flex-col gap-2">
                <label className="block text-[8px] uppercase tracking-widest text-gold font-bold">Rôle Utilisateur</label>
                <div className="flex items-center gap-2">
                  <div className="text-gold">
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
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    className="flex-grow bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
          <p className="text-xs text-white/40 italic text-center py-10">Aucun utilisateur trouvé.</p>
        )}

      </div>

    </div>
  );
}
