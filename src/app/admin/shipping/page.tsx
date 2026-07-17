'use client';

import React, { useState, useEffect } from 'react';
import { db, ShippingCountry } from '@/lib/db';
import { useLangCurr } from '@/context/LanguageCurrencyContext';
import { Globe, Plus, X, Edit2, Trash2, Truck } from 'lucide-react';

export default function AdminShippingPage() {
  const { formatPrice } = useLangCurr();

  // Baseline states
  const [countries, setCountries] = useState<ShippingCountry[]>([]);

  // Form states (Modal)
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [countryName, setCountryName] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [customCost, setCustomCost] = useState<number>(3000);
  const [freeCitiesInput, setFreeCitiesInput] = useState('');

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setCountries(db.getShippingCountries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCountryName('');
    setCurrency('XOF');
    setCustomCost(3000);
    setFreeCitiesInput('');
    setIsOpen(true);
  };

  const openEditModal = (c: ShippingCountry) => {
    setEditingId(c.id);
    setCountryName(c.country_name);
    setCurrency(c.currency);
    setCustomCost(c.custom_shipping_cost);
    setFreeCitiesInput(c.free_shipping_cities.join(', '));
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryName.trim()) return;

    // Convert comma-separated cities to array, trimming spaces
    const freeCities = freeCitiesInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (editingId) {
      db.updateShippingCountry(editingId, {
        country_name: countryName.trim(),
        currency: currency.trim(),
        custom_shipping_cost: Number(customCost),
        free_shipping_cities: freeCities,
      });
      setSuccessMsg(`Pays ${countryName} mis à jour avec succès !`);
    } else {
      db.createShippingCountry({
        country_name: countryName.trim(),
        currency: currency.trim(),
        custom_shipping_cost: Number(customCost),
        free_shipping_cities: freeCities,
      });
      setSuccessMsg(`Pays ${countryName} ajouté avec succès !`);
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    loadData();
    setIsOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la livraison pour le pays : ${name} ?`)) {
      db.deleteShippingCountry(id);
      setSuccessMsg(`Pays ${name} supprimé.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadData();
    }
  };

  return (
    <div className="space-y-8 fade-in text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-medium tracking-wide">Tarifs & Zones de Livraison</h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Définir les pays desservis, le coût de livraison pour les autres villes, et les villes bénéficiant de la livraison gratuite.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-3 rounded-lg transition flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Ajouter un Pays
        </button>
      </div>

      {successMsg && (
        <div className="bg-success/15 border border-success/20 p-4 rounded-xl text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      {/* Countries list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((c) => (
          <div key={c.id} className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4 luxury-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-gold/10 p-2 rounded-lg text-gold">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-semibold text-base text-white">{c.country_name}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Devise : {c.currency}</p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded bg-white/5 hover:bg-gold/10 text-white/60 hover:text-gold transition"
                    title="Modifier"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.country_name)}
                    className="p-1.5 rounded bg-white/5 hover:bg-error/15 text-white/60 hover:text-error transition"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Autres villes :</span>
                  <span className="font-semibold text-gold">
                    {c.custom_shipping_cost.toLocaleString()} {c.currency}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block">
                    Villes avec livraison gratuite :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {c.free_shipping_cities.length > 0 ? (
                      c.free_shipping_cities.map((city) => (
                        <span key={city} className="bg-success/10 border border-success/15 text-[10px] px-2 py-0.5 rounded text-success font-medium">
                          {city}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30 italic">Aucune (toutes payantes)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif-display text-lg font-semibold text-gold">
                {editingId ? 'Modifier le Pays' : 'Ajouter un Pays de Livraison'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-white">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">
                  Nom du Pays
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Niger"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-gold/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">
                    Devise (Currency)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Ex: XOF, XAF"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-gold/30 focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">
                    Tarif autres villes
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Ex: 3000"
                    value={customCost}
                    onChange={(e) => setCustomCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-gold/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-gold font-bold">
                  Villes gratuites (séparées par virgule)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Niamey, Maradi"
                  value={freeCitiesInput}
                  onChange={(e) => setFreeCitiesInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-gold/30 focus:outline-none"
                />
                <p className="text-[10px] text-white/40 leading-relaxed font-light mt-1">
                  Les clients de ces villes auront la livraison gratuite. Les autres paieront le tarif défini ci-dessus.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gold hover:bg-gold-hover text-white rounded-lg transition font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
