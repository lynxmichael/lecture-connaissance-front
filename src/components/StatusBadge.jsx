export default function StatusBadge({ statut }) {
  const styles = {
    'En cours': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Validée':  'bg-blue-50 text-blue-700 border border-blue-200',
    'Expédiée': 'bg-green-50 text-[#2d7a4f] border border-green-200',
    'Annulée':  'bg-red-50 text-[#d44040] border border-red-200',
  };
  const dots = {
    'En cours': 'bg-amber-400',
    'Validée':  'bg-blue-500',
    'Expédiée': 'bg-[#2d7a4f]',
    'Annulée':  'bg-[#d44040]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${styles[statut]||'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[statut]||'bg-gray-400'}`}/>
      {statut}
    </span>
  );
}
