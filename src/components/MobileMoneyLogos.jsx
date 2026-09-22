/**
 * Logos SVG fidèles des opérateurs Mobile Money en Côte d'Ivoire
 * Orange Money · MTN MoMo · Wave · Moov Money
 */

export const OPERATORS = [
  {
    id:          'orange_money',
    name:        'Orange Money',
    shortName:   'Orange',
    color:       '#FF6600',
    bgColor:     '#FFF3ED',
    borderColor: '#FFD4B8',
    textColor:   '#CC4400',
    prefix:      '+225 07',
    placeholder: '+225 07 XX XX XX XX',
  },
  {
    id:          'mtn_money',
    name:        'MTN MoMo',
    shortName:   'MTN',
    color:       '#FFCC00',
    bgColor:     '#FFFBE6',
    borderColor: '#FFE680',
    textColor:   '#997700',
    prefix:      '+225 05',
    placeholder: '+225 05 XX XX XX XX',
  },
  {
    id:          'wave',
    name:        'Wave',
    shortName:   'Wave',
    color:       '#1AC8ED',
    bgColor:     '#E8FAFF',
    borderColor: '#A3E8F7',
    textColor:   '#0A7A96',
    prefix:      '+225 01',
    placeholder: '+225 01 XX XX XX XX',
  },
  {
    id:          'moov_money',
    name:        'Moov Money',
    shortName:   'Moov',
    color:       '#0057B8',
    bgColor:     '#E8F0FF',
    borderColor: '#A3BFEF',
    textColor:   '#003D8A',
    prefix:      '+225 06',
    placeholder: '+225 06 XX XX XX XX',
  },
];

/* ── SVG Logo Orange Money ──────────────────────────────────────────────── */
function OrangeLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#FF6600"/>
      <circle cx="50" cy="42" r="22" fill="none" stroke="white" strokeWidth="8"/>
      <rect x="38" y="64" width="24" height="8" rx="4" fill="white"/>
      <rect x="44" y="70" width="12" height="14" rx="3" fill="white"/>
    </svg>
  );
}

/* ── SVG Logo MTN MoMo ──────────────────────────────────────────────────── */
function MtnLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#FFCC00"/>
      <text x="50" y="44" textAnchor="middle" fontSize="22" fontWeight="900"
        fontFamily="Arial,sans-serif" fill="#003087">MTN</text>
      <text x="50" y="68" textAnchor="middle" fontSize="13" fontWeight="700"
        fontFamily="Arial,sans-serif" fill="#003087">MoMo</text>
    </svg>
  );
}

/* ── SVG Logo Wave ──────────────────────────────────────────────────────── */
function WaveLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#1AC8ED"/>
      {/* Vague stylisée */}
      <path d="M15 55 Q27 38 40 55 Q53 72 65 55 Q78 38 90 55"
        fill="none" stroke="white" strokeWidth="7" strokeLinecap="round"/>
      <path d="M15 68 Q27 51 40 68 Q53 85 65 68 Q78 51 90 68"
        fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.5"/>
      <text x="50" y="34" textAnchor="middle" fontSize="17" fontWeight="900"
        fontFamily="Arial,sans-serif" fill="white">Wave</text>
    </svg>
  );
}

/* ── SVG Logo Moov Money ────────────────────────────────────────────────── */
function MoovLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0057B8"/>
      {/* M stylisé */}
      <path d="M18 72 L18 36 L36 58 L54 36 L54 72" fill="none"
        stroke="white" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
      <text x="70" y="72" textAnchor="middle" fontSize="11" fontWeight="700"
        fontFamily="Arial,sans-serif" fill="#FFCC00">OOV</text>
    </svg>
  );
}

const LOGOS = {
  orange_money: OrangeLogo,
  mtn_money:    MtnLogo,
  wave:         WaveLogo,
  moov_money:   MoovLogo,
};

/* ── Composant logo générique ───────────────────────────────────────────── */
export function OperatorLogo({ operatorId, size = 40 }) {
  const Logo = LOGOS[operatorId];
  if (!Logo) return null;
  return <Logo size={size} />;
}

/* ── Carte opérateur (sélection) ────────────────────────────────────────── */
export function OperatorCard({ op, number, onChange, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border-2 p-4 transition-all cursor-pointer
        ${selected
          ? 'border-opacity-100 shadow-md scale-[1.01]'
          : 'border-gray-200 hover:border-gray-300'}`}
      style={selected ? {
        borderColor: op.color,
        backgroundColor: op.bgColor,
        boxShadow: `0 4px 14px ${op.color}25`,
      } : {}}
    >
      {/* Badge actif */}
      {number && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: op.color }}>
          ✓ Configuré
        </span>
      )}

      {/* Logo + nom */}
      <div className="flex items-center gap-3 mb-3">
        <OperatorLogo operatorId={op.id} size={44} />
        <div>
          <p className="font-bold text-sm text-gray-800">{op.name}</p>
          <p className="text-xs text-gray-400">Préfixe : {op.prefix}</p>
        </div>
      </div>

      {/* Champ numéro */}
      <input
        type="tel"
        value={number || ''}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder={op.placeholder}
        className="w-full px-3 py-2 text-sm rounded-xl border font-mono transition focus:outline-none focus:ring-2"
        style={selected ? {
          borderColor: op.borderColor,
          backgroundColor: 'white',
          color: op.textColor,
        } : { borderColor: '#e8e0d4' }}
      />
    </div>
  );
}

/* ── Affichage lecture seule (résumé des numéros) ───────────────────────── */
export function MobileMoneyDisplay({ numbers = {} }) {
  const configured = OPERATORS.filter(op => numbers[op.id]);
  if (configured.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {configured.map(op => (
        <div key={op.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
          style={{ backgroundColor: op.bgColor, borderColor: op.borderColor }}>
          <OperatorLogo operatorId={op.id} size={20} />
          <span className="text-xs font-mono font-semibold" style={{ color: op.textColor }}>
            {numbers[op.id]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default OperatorLogo;
