import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/client';
import { OPERATORS, OperatorCard, MobileMoneyDisplay } from '../components/MobileMoneyLogos';
import { formatCFA } from '../utils/currency';
import { showToast } from '../components/Toast';

// ── Icônes inline ─────────────────────────────────────────────────────────
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    building: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    money: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    ban: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    filter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    arrow_up: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />,
    arrow_down: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name]}
    </svg>
  );
};

// ── Constantes ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: 'Actif',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  trial:     { label: 'Essai',     color: 'bg-blue-100 text-blue-700 border-blue-200' },
  suspended: { label: 'Suspendu',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700 border-red-200' },
};
const PAYMENT_METHODS = [
  { value: 'orange_money', label: 'Orange Money', color: '#FF6600', emoji: '🟠' },
  { value: 'wave',         label: 'Wave',         color: '#1B9CF2', emoji: '🔵' },
  { value: 'mtn_money',   label: 'MTN Money',     color: '#FFCC00', emoji: '🟡' },
  { value: 'moov_money',  label: 'Moov Money',    color: '#0066CC', emoji: '💙' },
  { value: 'bank',        label: 'Banque',         color: '#6B7280', emoji: '🏦' },
  { value: 'cash',        label: 'Espèces',        color: '#10B981', emoji: '💵' },
];
const SECTORS = ['Éducation', 'Finance', 'Santé', 'Commerce', 'TIC', 'Agriculture', 'Transport', 'Autre'];
const EMPTY_COMPANY = {
  owner_email:'', company_name:'', company_email:'', company_phone:'', company_address:'',
  company_sector:'', rccm_number:'', nif_number:'', plan_slug:'', billing_cycle:'monthly',
  status:'trial', orange_money_number:'', wave_number:'', mtn_money_number:'', moov_money_number:'',
  bank_account_number:'', bank_name:'', bank_iban:'', notes_admin:'',
};

// ── Composants utilitaires ────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>{cfg.label}</span>;
}

function StatCard({ icon, label, value, sub, color = 'indigo', trend }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600', emerald: 'from-emerald-500 to-emerald-600',
    amber:  'from-amber-500 to-amber-600',   rose: 'from-rose-500 to-rose-600',
    blue:   'from-blue-500 to-blue-600',     violet: 'from-violet-500 to-violet-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${colors[color] || colors.indigo}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[color] || colors.indigo} text-white`}>
            <Icon name={icon} className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <Icon name={trend >= 0 ? 'arrow_up' : 'arrow_down'} className="w-3 h-3" />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Mini bar chart SVG ────────────────────────────────────────────────────
function BarChart({ data = [], height = 120, color = '#6366f1' }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée</p>;
  const max = Math.max(...data.map(d => d.total), 1);
  const W = 600, H = height, pad = 8, barW = Math.max(8, (W - pad * 2) / data.length - 4);
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ height: H + 24 }}>
      {data.map((d, i) => {
        const bh = Math.max(4, (d.total / max) * H);
        const x = pad + i * ((W - pad * 2) / data.length) + 2;
        const y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={3} fill={color} fillOpacity={0.85} />
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="#9ca3af">{d.label}</text>
            <title>{d.label} — {formatCFA(d.total)}</title>
          </g>
        );
      })}
    </svg>
  );
}

// ── Formulaire entreprise ─────────────────────────────────────────────────
/**
 * Champ de formulaire.
 *
 * Important : ce composant reste défini AU NIVEAU DU FICHIER. Quand il était
 * déclaré à l'intérieur de CompanyForm, React le voyait comme un composant
 * différent à chaque frappe : il démontait puis remontait l'input, ce qui
 * faisait perdre le focus (il fallait recliquer dans le champ à chaque lettre).
 */
function Field({ label, name, type = 'text', req, children, col = 1, form, set }) {
  return (
    <div className={col === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
      )}
    </div>
  );
}

function CompanyForm({ initial = EMPTY_COMPANY, plans = [], onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));


  return (
    <div className="space-y-6">
      {/* Propriétaire */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="users" className="w-4 h-4 text-indigo-500" /> Propriétaire du compte
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field form={form} set={set} label="Email du propriétaire" name="owner_email" type="email" req col={2} />
          <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
            💡 Si cet email existe déjà, le compte sera mis à jour avec ce mot de passe.
          </div>
          <Field form={form} set={set} label="Prénom" name="owner_prenom" />
          <Field form={form} set={set} label="Nom" name="owner_name" />
          <Field form={form} set={set} label="Téléphone" name="owner_telephone" />
          {/* Mot de passe — OBLIGATOIRE */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Mot de passe <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal normal-case ml-2">(min. 6 caractères)</span>
            </label>
            <div className="relative">
              <input
                type={form._showPwd ? 'text' : 'password'}
                value={form.owner_password || ''}
                onChange={e => set('owner_password', e.target.value)}
                placeholder="Ex: Admin@2024!"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono transition-all"
              />
              <button type="button"
                onClick={() => set('_showPwd', !form._showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition">
                {form._showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {form.owner_password && form.owner_password.length < 6 && (
              <p className="text-red-500 text-xs mt-1">⚠ Minimum 6 caractères</p>
            )}
            {form.owner_password && form.owner_password.length >= 6 && (
              <p className="text-green-600 text-xs mt-1">✓ Mot de passe valide</p>
            )}
          </div>
        </div>
      </div>

      {/* Informations entreprise */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="building" className="w-4 h-4 text-indigo-500" /> Informations de l'entreprise
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field form={form} set={set} label="Nom de l'entreprise" name="company_name" req col={2} />
          <Field form={form} set={set} label="Email" name="company_email" type="email" />
          <Field form={form} set={set} label="Téléphone" name="company_phone" />
          <Field form={form} set={set} label="Secteur">
            <select value={form.company_sector || ''} onChange={e => set('company_sector', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Sélectionner…</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field form={form} set={set} label="Adresse" name="company_address" col={2} />
          <Field form={form} set={set} label="N° RCCM" name="rccm_number" />
          <Field form={form} set={set} label="NIF" name="nif_number" />
        </div>
      </div>

      {/* Abonnement */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="chart" className="w-4 h-4 text-indigo-500" /> Abonnement
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Field form={form} set={set} label="Plan" req>
            <select value={form.plan_slug || ''} onChange={e => set('plan_slug', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Choisir un plan…</option>
              {plans.map(p => <option key={p.slug} value={p.slug}>{p.name} — {formatCFA(p.price_monthly)}/mois</option>)}
            </select>
          </Field>
          <Field form={form} set={set} label="Cycle de facturation" req>
            <select value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </Field>
          <Field form={form} set={set} label="Statut" req>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Comptes de paiement */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="money" className="w-4 h-4 text-indigo-500" /> Comptes de paiement Mobile Money
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.filter(m => ['orange_money','wave','mtn_money','moov_money'].includes(m.value)).map(m => (
            <div key={m.value}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {m.emoji} {m.label}
              </label>
              <input type="tel" placeholder="Ex: 07 XX XX XX XX"
                value={form[`${m.value}_number`] || ''}
                onChange={e => set(`${m.value}_number`, e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field form={form} set={set} label="🏦 Banque" name="bank_name" />
          <Field form={form} set={set} label="N° Compte" name="bank_account_number" />
          <Field form={form} set={set} label="IBAN" name="bank_iban" />
        </div>
      </div>

      {/* Notes admin */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Notes administrateur
        </label>
        <textarea rows={3} value={form.notes_admin || ''}
          onChange={e => set('notes_admin', e.target.value)}
          placeholder="Notes internes visibles uniquement par les super admins…"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button disabled={loading} onClick={() => onSave(form)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
          {loading ? <span className="animate-spin">⟳</span> : <Icon name="check" className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="x" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function SuperAdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [dash, setDash] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filtres
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [revPeriod, setRevPeriod] = useState('month');
  const [evolution, setEvolution] = useState([]);
  const [ranking, setRanking] = useState([]);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  // Paramètres
  const [profile,      setProfile]      = useState(null);
  const [profileForm,  setProfileForm]  = useState({});
  const [savingProfile,setSavingProfile]= useState(false);
  const [showPwdForm,  setShowPwdForm]  = useState(false);
  const [allPlans,     setAllPlans]     = useState([]);
  const [planForm,     setPlanForm]     = useState(null); // null = fermé, {} = nouveau, {id,...} = édition
  const [savingPlan,   setSavingPlan]   = useState(false);
  // Reset mot de passe
  const [resetModal,   setResetModal]   = useState(null); // { user_id, name, email }
  const [resetPwd,     setResetPwd]     = useState('');
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [savingReset,  setSavingReset]  = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', payment_method: 'orange_money', reference: '', notes: '', billing_period: '' });

  // Onglet utilisateurs
  const [usersData,       setUsersData]       = useState([]);
  const [usersLoading,    setUsersLoading]    = useState(false);
  const [userSearch,      setUserSearch]      = useState('');
  const [userRoleFilter,  setUserRoleFilter]  = useState('');
  const [usersPagination, setUsersPagination] = useState({});

  const loadDash = useCallback(() => {
    return api.get('/super-admin/dashboard')
      .then(r => setDash(r.data))
      .catch(() => { showToast('Impossible de charger le tableau de bord', 'error'); });
  }, []);

  const loadCompanies = useCallback((page = 1) => {
    const params = new URLSearchParams({ page, per_page: 15 });
    if (search)       params.append('search', search);
    if (filterStatus) params.append('status', filterStatus);
    api.get(`/super-admin/companies?${params}`)
      .then(r => { setCompanies(r.data.data || []); setPagination(r.data); })
      .catch(() => { showToast('Impossible de charger les entreprises', 'error'); });
  }, [search, filterStatus]);

  const loadEvolution = useCallback(() => {
    api.get(`/super-admin/revenue/evolution?period=${chartPeriod}`).then(r => setEvolution(r.data.data || [])).catch(() => {});
  }, [chartPeriod]);

  const loadRanking = useCallback(() => {
    api.get(`/super-admin/revenue/ranking?period=${revPeriod}`).then(r => setRanking(r.data.ranking || [])).catch(() => {});
  }, [revPeriod]);

  const loadPlans = useCallback(() => {
    return api.get('/subscription-plans').then(r => setPlans(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDash(), loadPlans()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (tab === 'companies') loadCompanies(); }, [tab, loadCompanies]);
  useEffect(() => { if (tab === 'stats') { loadEvolution(); loadRanking(); } }, [tab, loadEvolution, loadRanking]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [userSearch, userRoleFilter]);
  useEffect(() => { if (tab === 'stats') loadEvolution(); }, [chartPeriod, loadEvolution]);
  useEffect(() => {
    if (tab === 'parametres') {
      api.get('/super-admin/profile').then(r => { setProfile(r.data); setProfileForm(r.data); }).catch(() => {});
      api.get('/super-admin/plans').then(r => setAllPlans(r.data)).catch(() => {});
    }
  }, [tab]);
  useEffect(() => { if (tab === 'stats') loadRanking(); }, [revPeriod, loadRanking]);

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (userSearch)     params.append('search', userSearch);
      if (userRoleFilter) params.append('role', userRoleFilter);
      const r = await api.get(`/super-admin/users?${params}`);
      setUsersData(r.data.data || []);
      setUsersPagination(r.data);
    } catch { showToast('Impossible de charger les utilisateurs', 'error'); }
    finally { setUsersLoading(false); }
  };

  const viewCompany = async (id) => {
    setViewingCompany(id);
    try {
      const r = await api.get(`/super-admin/companies/${id}`);
      setCompanyDetail(r.data);
    } catch {}
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post('/super-admin/companies', form);
      showToast('Compte entreprise créé !', 'success');
      setShowCreate(false);
      loadCompanies();
      loadDash();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await api.put(`/super-admin/companies/${editingCompany.id}`, form);
      showToast('Compte mis à jour !', 'success');
      setEditingCompany(null);
      loadCompanies();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer le compte "${name}" ?`)) return;
    try {
      await api.delete(`/super-admin/companies/${id}`);
      showToast('Supprimé.', 'success');
      loadCompanies();
      loadDash();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleToggleSuspend = async (sub) => {
    try {
      const r = await api.patch(`/super-admin/companies/${sub.id}/toggle-suspend`);
      showToast(r.data.message, 'success');
      loadCompanies();
      loadDash();
    } catch (e) {
      // Ex. : période terminée → il faut utiliser « Renouveler »
      showToast(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleRenew = async (sub) => {
    if (!confirm(`Renouveler l'abonnement de "${sub.company_name}" ?`)) return;
    try {
      const r = await api.post(`/super-admin/companies/${sub.id}/renew`);
      showToast(r.data.message, 'success');
      loadCompanies();
      loadDash();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handlePayment = async () => {
    setSaving(true);
    try {
      await api.post(`/super-admin/companies/${paymentModal}/payments`, payForm);
      showToast('Paiement enregistré !', 'success');
      setPaymentModal(null);
      setPayForm({ amount: '', payment_method: 'orange_money', reference: '', notes: '', billing_period: '' });
      loadDash();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  // ── TABS ─────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'dashboard',  label: 'Tableau de bord', icon: 'dashboard' },
    { id: 'companies',  label: 'Entreprises',      icon: 'building'  },
    { id: 'stats',      label: 'Statistiques CA',  icon: 'chart'     },
    { id: 'users',      label: 'Utilisateurs',     icon: 'users'     },
    { id: 'parametres', label: 'Paramètres',       icon: 'settings'  },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement Super Admin…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">LectureConnaissance</p>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="bg-white/10 rounded-xl p-2"><Icon name="dashboard" className="w-6 h-6" /></span>
                Super Administration
              </h1>
            </div>
            <div className="text-right text-sm text-indigo-300">
              <p className="font-semibold text-white">{dash?.companies?.total ?? 0} entreprises</p>
              <p>{(dash?.companies?.active ?? 0) + (dash?.companies?.trial ?? 0)} actives / essai</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${tab === t.id ? 'bg-white text-indigo-700 shadow-md' : 'text-indigo-200 hover:bg-white/10'}`}>
                <Icon name={t.icon} className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {tab === 'dashboard' && (
          <div className="space-y-8">
            {!dash ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="text-5xl">⚠️</div>
                <p className="text-gray-500 font-medium">Impossible de charger le tableau de bord.</p>
                <button onClick={() => { setLoading(true); loadDash().finally(() => setLoading(false)); }}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                  Réessayer
                </button>
              </div>
            ) : (<>
            {/* KPI Entreprises */}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="building" className="w-4 h-4 text-indigo-500" /> Comptes Entreprise
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon="building" label="Total" value={dash.companies.total} color="indigo" />
                <StatCard icon="check" label="Actifs" value={dash.companies.active} color="emerald" />
                <StatCard icon="users" label="En essai" value={dash.companies.trial} color="blue" />
                <StatCard icon="ban" label="Suspendus" value={dash.companies.suspended} color="amber" />
                <StatCard icon="x" label="Annulés" value={dash.companies.cancelled} color="rose" />
                <StatCard icon="plus" label="Nouveaux ce mois" value={dash.companies.new_month} color="violet" />
              </div>
            </div>

            {/* KPI CA */}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="money" className="w-4 h-4 text-indigo-500" /> Chiffre d'affaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { period: 'week', label: 'Cette semaine' },
                  { period: 'month', label: 'Ce mois' },
                  { period: 'year', label: 'Cette année' },
                ].map(({ period, label }) => (
                  <div key={period} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{label}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Abonnements</span>
                        <span className="font-bold text-indigo-700">{formatCFA(dash.revenue.subscriptions[period])}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Commandes boutique</span>
                        <span className="font-bold text-emerald-600">{formatCFA(dash.revenue.orders[period])}</span>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Total</span>
                        <span className="text-lg font-black text-gray-900">{formatCFA(dash.revenue.total[period])}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4">Répartition par plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(dash.plan_stats || []).map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                      <span className="text-2xl font-black text-indigo-600">{p.active_count}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Abonnés actifs</span>
                        <span className="font-semibold text-emerald-600">{p.active_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total historique</span>
                        <span className="font-semibold">{p.total_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prix/mois</span>
                        <span className="font-semibold">{formatCFA(p.price_monthly)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphe évolution mensuelle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Évolution CA abonnements (12 derniers mois)</h2>
              <BarChart data={(dash.monthly_evolution || []).map(d => ({
                label: d.month?.slice(5),
                total: d.total,
              }))} color="#6366f1" />
            </div>
            </>)}
          </div>
        )}

        {/* ═══════════════ ENTREPRISES ═══════════════ */}
        {tab === 'companies' && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadCompanies()}
                    placeholder="Rechercher…"
                    className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56" />
                </div>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); }}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Tous statuts</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button onClick={() => loadCompanies()}
                  className="px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Icon name="search" className="w-4 h-4" /> Filtrer
                </button>
              </div>
              <button onClick={() => setShowCreate(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                <Icon name="plus" className="w-4 h-4" /> Nouveau compte entreprise
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Entreprise', 'Propriétaire', 'Plan', 'Statut', 'Mobile Money', 'CA Total', 'Fin période', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {companies.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400">Aucun compte entreprise trouvé</td></tr>
                    ) : companies.map(c => (
                      <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{c.company_name}</p>
                            <p className="text-xs text-gray-400">{c.company_sector || '—'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{c.owner?.prenom} {c.owner?.name}</p>
                          <p className="text-xs text-gray-400">{c.owner?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-semibold">
                            {c.plan?.name || '—'}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{c.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {c.orange_money_number && <span title="Orange Money" className="text-base">🟠</span>}
                            {c.wave_number         && <span title="Wave" className="text-base">🔵</span>}
                            {c.mtn_money_number    && <span title="MTN Money" className="text-base">🟡</span>}
                            {c.moov_money_number   && <span title="Moov Money" className="text-base">💙</span>}
                            {c.bank_account_number && <span title="Banque" className="text-base">🏦</span>}
                            {!c.orange_money_number && !c.wave_number && !c.mtn_money_number && !c.moov_money_number && !c.bank_account_number
                              && <span className="text-xs text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-700">
                          {formatCFA(c.total_paid || 0)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {c.current_period_end ? new Date(c.current_period_end).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => viewCompany(c.id)} title="Voir détail"
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                              <Icon name="eye" className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingCompany(c)} title="Modifier"
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors">
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPaymentModal(c.id)} title="Enregistrer paiement"
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors">
                              <Icon name="money" className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggleSuspend(c)}
                              title={c.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                              className={`p-1.5 rounded-lg transition-colors ${c.status === 'suspended' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}>
                              <Icon name={c.status === 'suspended' ? 'check' : 'ban'} className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRenew(c)} title="Renouveler"
                              className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 transition-colors">
                              <Icon name="refresh" className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id, c.company_name)} title="Supprimer"
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {pagination.current_page} / {pagination.last_page} — {pagination.total} comptes
                  </p>
                  <div className="flex gap-2">
                    {pagination.current_page > 1 && (
                      <button onClick={() => loadCompanies(pagination.current_page - 1)}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">← Préc.</button>
                    )}
                    {pagination.current_page < pagination.last_page && (
                      <button onClick={() => loadCompanies(pagination.current_page + 1)}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Suiv. →</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ STATISTIQUES CA ═══════════════ */}
        {tab === 'stats' && (
          <div className="space-y-8">
            {/* Évolution CA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-gray-800">Évolution du CA — Abonnements</h2>
                <div className="flex gap-2">
                  <button onClick={() => setChartPeriod('weekly')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${chartPeriod === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Hebdomadaire
                  </button>
                  <button onClick={() => setChartPeriod('monthly')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${chartPeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Mensuel
                  </button>
                </div>
              </div>
              <BarChart data={evolution} height={160} color="#6366f1" />
              {evolution.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total période</p>
                    <p className="font-bold text-indigo-700">{formatCFA(evolution.reduce((a, d) => a + d.total, 0))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Moyenne</p>
                    <p className="font-bold text-gray-800">{formatCFA(evolution.reduce((a, d) => a + d.total, 0) / evolution.length)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Meilleure période</p>
                    <p className="font-bold text-emerald-600">{formatCFA(Math.max(...evolution.map(d => d.total)))}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Classement entreprises */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-800">Classement CA par entreprise</h2>
                <div className="flex gap-2">
                  {[['week','Semaine'],['month','Mois'],['year','Année'],['all','Tout']].map(([v, l]) => (
                    <button key={v} onClick={() => setRevPeriod(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${revPeriod === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {ranking.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune donnée pour cette période</p>
              ) : (
                <div className="space-y-2">
                  {ranking.map((r, i) => {
                    const maxCA = ranking[0]?.total_ca || 1;
                    const pct = (r.total_ca / maxCA) * 100;
                    return (
                      <div key={r.id} className="flex items-center gap-4">
                        <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-black
                          ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-800">{r.company_name}</span>
                            <span className="text-sm font-bold text-indigo-700">{formatCFA(r.total_ca)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <StatusBadge status={r.status} />
                            <span className="text-xs text-gray-400">{r.payment_count} paiement{r.payment_count > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ UTILISATEURS ═══════════════ */}
        {tab === 'users' && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadUsers()}
                    placeholder="Nom, email..."
                    className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56" />
                </div>
                <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl">
                  <option value="">Tous les rôles</option>
                  <option value="client">Client</option>
                  <option value="libraire">Libraire</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button onClick={() => loadUsers()}
                  className="px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center gap-2">
                  <Icon name="search" className="w-4 h-4" /> Filtrer
                </button>
              </div>
              <p className="text-sm text-gray-400">{usersPagination.total ?? 0} utilisateur{(usersPagination.total ?? 0) !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {usersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50">
                      {['Utilisateur','Email','Téléphone','Rôle','Compte','Inscription','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {usersData.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</td></tr>
                      ) : usersData.map(u => (
                        <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-4 py-3"><div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{(u.prenom?.[0]||u.name?.[0]||'?').toUpperCase()}</div>
                            <span className="font-medium text-gray-800 whitespace-nowrap">{u.prenom} {u.name}</span>
                          </div></td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{u.telephone||'—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${u.role==='super_admin'?'bg-purple-100 text-purple-700 border-purple-200':u.role==='libraire'?'bg-indigo-100 text-indigo-700 border-indigo-200':'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {u.role==='super_admin'?'👑 Super Admin':u.role==='libraire'?'📚 Libraire':'👤 Client'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.account_type==='company'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-500'}`}>{u.account_type==='company'?'🏢 Entreprise':'👤 Individuel'}</span></td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1.5">
                            {!u.is_super_admin ? (
                              <>
                                <select defaultValue={u.role} onChange={async e => { const nr=e.target.value; try { await api.patch(`/super-admin/users/${u.id}/role`,{role:nr}); setUsersData(p=>p.map(x=>x.id===u.id?{...x,role:nr}:x)); showToast('Rôle mis à jour','success'); } catch { showToast('Erreur','error'); } }} className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                                  <option value="client">client</option>
                                  <option value="libraire">libraire</option>
                                </select>
                                <button onClick={()=>setResetModal({user_id:u.id,name:`${u.prenom} ${u.name}`,email:u.email})} title="Réinitialiser MDP" className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"><Icon name="edit" className="w-4 h-4" /></button>
                              </>
                            ) : <span className="text-xs text-purple-500 font-semibold px-2">Protégé</span>}
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {(usersPagination.last_page??1)>1&&(<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100"><p className="text-sm text-gray-500">Page {usersPagination.current_page}/{usersPagination.last_page}</p><div className="flex gap-2">{usersPagination.current_page>1&&(<button onClick={()=>loadUsers(usersPagination.current_page-1)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">← Préc.</button>)}{usersPagination.current_page<usersPagination.last_page&&(<button onClick={()=>loadUsers(usersPagination.current_page+1)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Suiv. →</button>)}</div></div>)}
            </div>
          </div>
        )}

        {/* ═══════════════ PARAMÈTRES ═══════════════ */}
        {tab === 'parametres' && (
          <div className="space-y-8">

            {/* ── Profil Super Admin ────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                👤 Mon profil &amp; numéros de réception
              </h2>

              {profile ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key:'prenom',    label:'Prénom'    },
                      { key:'name',      label:'Nom'       },
                      { key:'telephone', label:'Téléphone principal' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                        <input type="text" value={profileForm[f.key] || ''}
                          onChange={e => setProfileForm(p => ({...p, [f.key]: e.target.value}))}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input type="email" value={profileForm.email || ''} disabled
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Numéros Mobile Money */}
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-sm font-bold text-gray-700 mb-1">💳 Numéros de réception des virements</p>
                    <p className="text-xs text-gray-400 mb-4">Configurez un numéro pour chaque opérateur Mobile Money.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {OPERATORS.map(op => (
                        <OperatorCard
                          key={op.id} op={op}
                          number={profileForm.mobile_money_numbers?.[op.id] || ''}
                          selected={!!(profileForm.mobile_money_numbers?.[op.id])}
                          onSelect={() => {}}
                          onChange={val => setProfileForm(p => ({
                            ...p,
                            mobile_money_numbers: { ...(p.mobile_money_numbers || {}), [op.id]: val },
                          }))}
                        />
                      ))}
                    </div>
                    {Object.values(profileForm.mobile_money_numbers || {}).some(Boolean) && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-800 mb-2">✅ Numéros configurés</p>
                        <MobileMoneyDisplay numbers={profileForm.mobile_money_numbers} />
                      </div>
                    )}
                  </div>

                  {/* Changer mot de passe */}
                  <div className="border-t border-gray-100 pt-5">
                    <button onClick={() => setShowPwdForm(s => !s)}
                      className="text-sm text-indigo-600 hover:underline font-medium">
                      {showPwdForm ? '✕ Annuler' : '🔑 Changer le mot de passe'}
                    </button>
                    {showPwdForm && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nouveau mot de passe</label>
                          <input type="password" value={profileForm.password || ''}
                            onChange={e => setProfileForm(p => ({...p, password: e.target.value}))}
                            placeholder="Min. 6 caractères"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirmer</label>
                          <input type="password" value={profileForm.password_confirmation || ''}
                            onChange={e => setProfileForm(p => ({...p, password_confirmation: e.target.value}))}
                            placeholder="Répéter le mot de passe"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </div>
                      </div>
                    )}
                  </div>

                  <button disabled={savingProfile}
                    onClick={async () => {
                      setSavingProfile(true);
                      try {
                        const payload = {...profileForm};
                        if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
                        if (payload.mobile_money_numbers) {
                          payload.mobile_money_numbers = Object.fromEntries(
                            Object.entries(payload.mobile_money_numbers).filter(([,v]) => v?.trim())
                          );
                        }
                        await api.put('/super-admin/profile', payload);
                        showToast('Profil mis à jour ✅', 'success');
                        setShowPwdForm(false);
                      } catch(e) {
                        const errs = e.response?.data?.errors;
                        showToast(errs ? Object.values(errs).flat().join(' · ') : 'Erreur', 'error');
                      } finally { setSavingProfile(false); }
                    }}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition">
                    {savingProfile ? '⏳ Enregistrement…' : '💾 Enregistrer le profil'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* ── Gestion des Plans ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  📦 Plans d'abonnement
                </h2>
                <button onClick={() => setPlanForm({ name:'', slug:'', description:'', price_monthly:'', price_yearly:'', max_users:5, max_products:-1, commission_rate:5, discount_percent:0, priority_support:false, dedicated_account:false, custom_invoicing:false, features:[''], is_active:true })}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition">
                  + Nouveau plan
                </button>
              </div>

              {/* Formulaire création/édition plan */}
              {planForm !== null && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
                  <h3 className="font-bold text-sm text-gray-700 mb-4">
                    {planForm.id ? `✏️ Modifier : ${planForm.name}` : '➕ Nouveau plan'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key:'name',            label:'Nom du plan *',             type:'text',   placeholder:'Ex: Professionnel' },
                      { key:'slug',            label:'Slug (identifiant) *',      type:'text',   placeholder:'ex: professionnel', disabled: !!planForm.id },
                      { key:'price_monthly',   label:'Prix mensuel (FCFA) *',     type:'number', min:0 },
                      { key:'price_yearly',    label:'Prix annuel (FCFA) *',      type:'number', min:0 },
                      { key:'max_products',    label:'Produits max (-1=illimité)',type:'number', min:-1, placeholder:'-1 pour illimité' },
                      { key:'commission_rate', label:'Commission plateforme (%)', type:'number', min:0, max:100, placeholder:'Ex: 3.5' },
                      { key:'max_users',       label:'Admins max (-1=illimité)',  type:'number', min:-1, placeholder:'-1 pour illimité' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{f.label}</label>
                        <input type={f.type} min={f.min} max={f.max}
                          value={planForm[f.key] ?? ''} disabled={f.disabled}
                          onChange={e => setPlanForm(p => ({...p, [f.key]: e.target.value}))}
                          placeholder={f.placeholder || ''}
                          className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${f.disabled ? 'bg-gray-100 cursor-not-allowed border-gray-100' : 'border-gray-200'}`} />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                      <textarea rows={2} value={planForm.description || ''}
                        onChange={e => setPlanForm(p => ({...p, description: e.target.value}))}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition" />
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fonctionnalités incluses</label>
                    <div className="space-y-2">
                      {(planForm.features || ['']).map((feat, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={feat}
                            onChange={e => {
                              const f = [...(planForm.features || [''])];
                              f[i] = e.target.value;
                              setPlanForm(p => ({...p, features: f}));
                            }}
                            placeholder={`Fonctionnalité ${i+1}`}
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                          <button type="button"
                            onClick={() => setPlanForm(p => ({...p, features: (p.features||['']).filter((_,j) => j !== i)}))}
                            className="text-red-400 hover:text-red-600 px-2 font-bold text-lg">✕</button>
                        </div>
                      ))}
                      <button type="button"
                        onClick={() => setPlanForm(p => ({...p, features: [...(p.features||['']), '']}))}
                        className="text-xs text-indigo-600 hover:underline font-medium">
                        + Ajouter une fonctionnalité
                      </button>
                    </div>
                  </div>

                  {/* Options booléennes */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {[
                      { key:'priority_support',  label:'Support prioritaire' },
                      { key:'dedicated_account', label:'Compte dédié'        },
                      { key:'custom_invoicing',  label:'Facturation custom'  },
                      { key:'is_active',         label:'Plan actif'          },
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input type="checkbox" checked={!!planForm[opt.key]}
                          onChange={e => setPlanForm(p => ({...p, [opt.key]: e.target.checked}))}
                          className="w-4 h-4 rounded accent-indigo-600" />
                        {opt.label}
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button disabled={savingPlan}
                      onClick={async () => {
                        setSavingPlan(true);
                        try {
                          const payload = {
                            name:              planForm.name              || '',
                            slug:              planForm.slug              || '',
                            description:       planForm.description       || '',
                            price_monthly:     parseInt(planForm.price_monthly)   || 0,
                            price_yearly:      parseInt(planForm.price_yearly)    || 0,
                            max_users:         parseInt(planForm.max_users)       ?? 5,
                            max_products:      parseInt(planForm.max_products)    ?? -1,
                            commission_rate:   parseFloat(planForm.commission_rate) || 5,
                            discount_percent:  parseInt(planForm.discount_percent)  || 0,
                            priority_support:  !!planForm.priority_support,
                            dedicated_account: !!planForm.dedicated_account,
                            custom_invoicing:  !!planForm.custom_invoicing,
                            is_active:         planForm.is_active !== false,
                            features:          (planForm.features || []).filter(f => f && f.trim()),
                          };
                          if (planForm.id) {
                            delete payload.slug;
                            const r = await api.put(`/super-admin/plans/${planForm.id}`, payload);
                            setAllPlans(ps => ps.map(p => p.id === planForm.id ? r.data.plan : p));
                            showToast('Plan mis à jour ✅', 'success');
                          } else {
                            if (!payload.slug) { showToast("L'identifiant (slug) est obligatoire.", 'error'); setSavingPlan(false); return; }
                            const r = await api.post('/super-admin/plans', payload);
                            setAllPlans(ps => [...ps, r.data.plan]);
                            showToast('Plan créé ✅', 'success');
                          }
                          setPlanForm(null);
                        } catch(e) {
                          const errs = e.response?.data?.errors;
                          showToast(errs ? Object.values(errs).flat().join(' · ') : e.response?.data?.message || 'Erreur', 'error');
                        } finally { setSavingPlan(false); }
                      }}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition">
                      {savingPlan ? '⏳…' : planForm.id ? '✏️ Modifier' : '✅ Créer le plan'}
                    </button>
                    <button onClick={() => setPlanForm(null)}
                      className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des plans */}
              <div className="space-y-3">
                {allPlans.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucun plan. Créez-en un ci-dessus.</p>
                ) : allPlans.map(plan => (
                  <div key={plan.id}
                    className={`border rounded-2xl p-4 transition-all ${plan.is_active ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-800">{plan.name}</span>
                          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{plan.slug}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {plan.is_active ? '● Actif' : '○ Inactif'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{plan.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="font-bold text-indigo-700">{new Intl.NumberFormat('fr-FR').format(plan.price_monthly)} FCFA/mois</span>
                          <span className="text-gray-400">·</span>
                          <span className="font-bold text-purple-700">{new Intl.NumberFormat('fr-FR').format(plan.price_yearly)} FCFA/an</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-orange-600 font-semibold">📦 {plan.max_products == null || plan.max_products === -1 || plan.max_products >= 999 ? 'Illimité' : `${plan.max_products} produits`}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-blue-600 font-semibold">💳 {plan.commission_rate ?? 5}% commission</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">👤 {plan.max_users == null || plan.max_users === -1 || plan.max_users >= 999 ? 'Admins illimités' : `${plan.max_users} admin${plan.max_users > 1 ? 's' : ''}`}</span>
                        </div>
                        {plan.features?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {plan.features.slice(0,4).map((f,i) => (
                              <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                            {plan.features.length > 4 && <span className="text-[10px] text-gray-400">+{plan.features.length-4}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={async () => {
                            try {
                              const r = await api.patch(`/super-admin/plans/${plan.id}/toggle`);
                              setAllPlans(ps => ps.map(p => p.id === plan.id ? {...p, is_active: r.data.is_active} : p));
                              showToast(r.data.message, 'success');
                            } catch { showToast('Erreur', 'error'); }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition border ${plan.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                          {plan.is_active ? '⏸ Désactiver' : '▶ Activer'}
                        </button>
                        <button
                          onClick={() => setPlanForm({...plan, features: plan.features?.length ? plan.features : ['']})}
                          className="text-xs px-3 py-1.5 rounded-xl font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition">
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Supprimer le plan "${plan.name}" ?`)) return;
                            try {
                              await api.delete(`/super-admin/plans/${plan.id}`);
                              setAllPlans(ps => ps.filter(p => p.id !== plan.id));
                              showToast('Plan supprimé', 'info');
                            } catch(e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
                          }}
                          className="text-xs px-3 py-1.5 rounded-xl font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition">
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Créer compte */}
      {showCreate && (
        <Modal title="Créer un compte entreprise" onClose={() => setShowCreate(false)} wide>
          <CompanyForm plans={plans} onSave={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
        </Modal>
      )}

      {/* Modifier compte */}
      {editingCompany && (
        <Modal title={`Modifier — ${editingCompany.company_name}`} onClose={() => setEditingCompany(null)} wide>
          <CompanyForm
            initial={{
              ...EMPTY_COMPANY,
              company_name: editingCompany.company_name,
              company_email: editingCompany.company_email || '',
              company_phone: editingCompany.company_phone || '',
              company_address: editingCompany.company_address || '',
              company_sector: editingCompany.company_sector || '',
              rccm_number: editingCompany.rccm_number || '',
              nif_number: editingCompany.nif_number || '',
              plan_slug: editingCompany.plan?.slug || '',
              billing_cycle: editingCompany.billing_cycle || 'monthly',
              status: editingCompany.status,
              orange_money_number: editingCompany.orange_money_number || '',
              wave_number: editingCompany.wave_number || '',
              mtn_money_number: editingCompany.mtn_money_number || '',
              moov_money_number: editingCompany.moov_money_number || '',
              bank_account_number: editingCompany.bank_account_number || '',
              bank_name: editingCompany.bank_name || '',
              bank_iban: editingCompany.bank_iban || '',
              notes_admin: editingCompany.notes_admin || '',
              owner_email: editingCompany.owner?.email || '',
            }}
            plans={plans} onSave={handleUpdate} onCancel={() => setEditingCompany(null)} loading={saving} />
        </Modal>
      )}

      {/* Détail compte */}
      {viewingCompany && companyDetail && (
        <Modal title={`Détail — ${companyDetail.subscription?.company_name}`} onClose={() => { setViewingCompany(null); setCompanyDetail(null); }} wide>
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-indigo-500 font-semibold mb-1">Total payé</p>
                <p className="text-xl font-black text-indigo-700">{formatCFA(companyDetail.stats?.total_paid || 0)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-500 font-semibold mb-1">Ce mois</p>
                <p className="text-xl font-black text-emerald-700">{formatCFA(companyDetail.stats?.month_paid || 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 font-semibold mb-1">Membres</p>
                <p className="text-xl font-black text-gray-700">{companyDetail.subscription?.members?.length || 0}</p>
              </div>
            </div>

            {/* Comptes paiement */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Comptes de paiement</h3>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.filter(m => !['bank','cash'].includes(m.value)).map(m => {
                  const num = companyDetail.subscription?.[`${m.value}_number`];
                  return (
                    <div key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border ${num ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-200 opacity-50'}`}>
                      <span className="text-xl">{m.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">{m.label}</p>
                        <p className="text-sm font-mono text-gray-800">{num || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {companyDetail.subscription?.bank_account_number && (
                <div className="mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">🏦 {companyDetail.subscription.bank_name || 'Banque'}</p>
                  <p className="text-sm font-mono">{companyDetail.subscription.bank_account_number}</p>
                  {companyDetail.subscription.bank_iban && <p className="text-xs text-gray-400">{companyDetail.subscription.bank_iban}</p>}
                </div>
              )}
            </div>

            {/* CA mensuel */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">CA mensuel (12 mois)</h3>
              <BarChart data={(companyDetail.monthly_ca || []).map(d => ({ label: d.month?.slice(5), total: d.total }))} height={100} color="#10b981" />
            </div>

            {/* Derniers paiements */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Derniers paiements</h3>
              {companyDetail.payments?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucun paiement enregistré</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(companyDetail.payments || []).map(p => {
                    const m = PAYMENT_METHODS.find(x => x.value === p.payment_method);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                        <div className="flex items-center gap-2">
                          <span>{m?.emoji || '💰'}</span>
                          <div>
                            <span className="font-medium">{m?.label || p.payment_method}</span>
                            {p.reference && <span className="text-xs text-gray-400 ml-2">#{p.reference}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${p.status === 'completed' ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {formatCFA(p.amount)}
                          </span>
                          <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes admin */}
            {companyDetail.subscription?.notes_admin && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">📝 Notes administrateur</p>
                <p className="text-sm text-amber-800">{companyDetail.subscription.notes_admin}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

        {/* ── Modal reset mot de passe ─────────────────────── */}
        {resetModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-1">🔑 Réinitialiser le mot de passe</h2>
              <p className="text-sm text-gray-500 mb-5">
                <strong>{resetModal.name}</strong><br/>
                <span className="font-mono text-xs">{resetModal.email}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPwd ? 'text' : 'password'}
                      value={resetPwd}
                      onChange={e => setResetPwd(e.target.value)}
                      placeholder="Min. 6 caractères — Ex: Admin@2024!"
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono transition"
                    />
                    <button type="button"
                      onClick={() => setShowResetPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition">
                      {showResetPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {resetPwd.length > 0 && resetPwd.length < 6 && (
                    <p className="text-red-500 text-xs mt-1">⚠ Minimum 6 caractères</p>
                  )}
                  {resetPwd.length >= 6 && (
                    <p className="text-green-600 text-xs mt-1">✓ Mot de passe valide</p>
                  )}
                </div>

                {/* Suggestions de mots de passe forts */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Suggestions rapides :</p>
                  <div className="flex flex-wrap gap-2">
                    {['Admin@2024!', 'Libraire2025!', 'Lecture@CI!'].map(s => (
                      <button key={s} type="button"
                        onClick={() => setResetPwd(s)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-mono transition">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  disabled={savingReset || resetPwd.length < 6}
                  onClick={async () => {
                    setSavingReset(true);
                    try {
                      await api.post(`/super-admin/users/${resetModal.user_id}/reset-password`, {
                        password: resetPwd,
                      });
                      showToast(`✅ Mot de passe réinitialisé`, 'success');
                      alert(
                        '✅ Mot de passe mis à jour !\n\n' +
                        `Email        : ${resetModal.email}\n` +
                        `Nouveau MDP  : ${resetPwd}\n\n` +
                        '⚠️  Communiquez ces identifiants au libraire.'
                      );
                      setResetModal(null);
                    } catch (e) {
                      showToast(e.response?.data?.message || 'Erreur', 'error');
                    } finally { setSavingReset(false); }
                  }}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold
                             hover:bg-orange-600 disabled:opacity-60 transition">
                  {savingReset ? '⏳ Enregistrement…' : '🔑 Réinitialiser'}
                </button>
                <button onClick={() => setResetModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600
                             font-medium hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

      {paymentModal && (
        <Modal title="Enregistrer un paiement" onClose={() => setPaymentModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Montant (FCFA) *</label>
              <input type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="Ex: 15000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mode de paiement *</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} onClick={() => setPayForm(f => ({ ...f, payment_method: m.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${payForm.payment_method === m.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-xl block mb-1">{m.emoji}</span>
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Référence / Transaction ID</label>
              <input type="text" value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                placeholder="Ex: TXN-20260517-001"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Période de facturation</label>
              <input type="text" value={payForm.billing_period} onChange={e => setPayForm(f => ({ ...f, billing_period: e.target.value }))}
                placeholder="Ex: 2026-05 ou 2026-W20"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea rows={2} value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPaymentModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button disabled={saving || !payForm.amount} onClick={handlePayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <span className="animate-spin">⟳</span> : <Icon name="check" className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}