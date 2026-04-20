import { useEffect, useState } from 'react';
import api from '../api/client';
import { formatCFA } from '../utils/currency';

export default function DeliveryZoneSelector({ orderTotal, onSelect, selectedId }) {
  const [zones,   setZones]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/delivery-zones').then(r => setZones(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-12 rounded-xl"/>;

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        Zone de livraison *
      </label>
      <div className="space-y-2">
        {zones.map(zone => {
          const fraisEffectifs = zone.gratuit_a_partir !== null && orderTotal >= zone.gratuit_a_partir ? 0 : zone.frais;
          const isSelected = selectedId === zone.id;
          return (
            <label key={zone.id}
              className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                isSelected ? 'border-[#c9933a] bg-amber-50/50' : 'border-[#e8e0d4] hover:border-[#c9933a]/50 bg-white'
              }`}>
              <input type="radio" name="delivery_zone" value={zone.id} checked={isSelected}
                onChange={() => onSelect(zone)}
                className="accent-[#c9933a] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0f1923] text-sm">{zone.nom}</p>
                {zone.description && <p className="text-xs text-gray-400">{zone.description}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                {fraisEffectifs === 0 ? (
                  <span className="text-[#2d7a4f] font-bold text-sm">Gratuit</span>
                ) : (
                  <span className="font-bold text-sm text-[#0f1923]">{formatCFA(fraisEffectifs)}</span>
                )}
                {zone.delai_jours === 0 ? (
                  <p className="text-[10px] text-gray-400">Disponible sous 2h</p>
                ) : (
                  <p className="text-[10px] text-gray-400">{zone.delai_jours} jour{zone.delai_jours>1?'s':''}</p>
                )}
                {zone.gratuit_a_partir !== null && zone.frais > 0 && orderTotal < zone.gratuit_a_partir && (
                  <p className="text-[10px] text-[#2d7a4f]">Gratuit dès {formatCFA(zone.gratuit_a_partir)}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
