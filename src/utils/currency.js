/**
 * Formate un montant en Franc CFA (XOF).
 * Ex: 15000 → "15 000 FCFA"
 * Ex: 2500.5 → "2 501 FCFA"
 */
export function formatCFA(amount) {
  if (amount == null || isNaN(amount)) return '—';
  const n = Math.round(parseFloat(amount));
  return n.toLocaleString('fr-FR') + ' FCFA';
}

/**
 * Formate sans l'unité (pour les affichages condensés).
 * Ex: 15000 → "15 000"
 */
export function formatCFARaw(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return Math.round(parseFloat(amount)).toLocaleString('fr-FR');
}

/** Retourne le taux de remise entre deux prix */
export function discountPercent(original, final) {
  if (!original || original <= 0) return 0;
  return Math.round((1 - final / original) * 100);
}
