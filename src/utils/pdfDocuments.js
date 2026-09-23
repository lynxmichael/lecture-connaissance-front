/**
 * PDF générés dans le navigateur (jsPDF), en texte vectoriel :
 *  - factures personnalisées et bons de commande (en-tête de la librairie)
 *  - exports PDF des commandes et du catalogue (plan Premium)
 */

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '');

// Les polices standard de jsPDF ne couvrent que le Latin-1 : on remplace le reste
const clean = (v) => String(v ?? '')
  .replace(/[’‘]/g, "'").replace(/[«»“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...')
  .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/[\u202F\u00A0]/g, ' ')
  .replace(/[^\x20-\xFF\n]/g, '');

export const money = (n) =>
  `${String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F CFA`;

const frDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '');

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [30, 58, 95];
};

async function loadImage(url) {
  if (!url) return null;
  try {
    const res  = await fetch(url.startsWith('http') ? url : `${API_ORIGIN}${url}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null; // le document reste valable sans logo
  }
}

/**
 * Facture ou bon de commande.
 * doc = { type: 'invoice'|'purchase_order', number, issued_at, valid_until?, reference?,
 *         shop: {name,address,phone,email,color,logo,legal,footer},
 *         customer: {name,organization?,phone,email,address},
 *         lines: [{label,quantity,unit_price}], subtotal, discount, total, notes? }
 */
export async function downloadBusinessDocument(doc) {
  const { jsPDF } = await import('jspdf');
  const pdf   = new jsPDF({ unit: 'mm', format: 'a4' });
  const W     = 210, M = 15;
  const color = hexToRgb(doc.shop?.color);
  const title = doc.type === 'purchase_order' ? 'BON DE COMMANDE' : 'FACTURE';

  // ── Bandeau aux couleurs de la librairie ────────────────────────────────
  pdf.setFillColor(...color);
  pdf.rect(0, 0, W, 34, 'F');

  let textX = M;
  const logo = doc.shop?.logo_data || await loadImage(doc.shop?.logo);
  if (logo) {
    try {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(M, 6, 36, 22, 2, 2, 'F');
      pdf.addImage(logo, M + 2, 8, 32, 18, undefined, 'FAST');
      textX = M + 42;
    } catch { /* image illisible : on continue sans */ }
  }

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15);
  pdf.text(clean(doc.shop?.name || 'Librairie'), textX, 14);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5);
  const shopLines = [doc.shop?.address, [doc.shop?.phone, doc.shop?.email].filter(Boolean).join('  ·  ')].filter(Boolean);
  shopLines.forEach((l, i) => pdf.text(clean(l), textX, 20 + i * 4.5));

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16);
  pdf.text(title, W - M, 14, { align: 'right' });
  pdf.setFontSize(10);
  pdf.text(clean(doc.number), W - M, 21, { align: 'right' });

  // ── Dates / références ───────────────────────────────────────────────────
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
  let y = 44;
  const meta = [
    `Date : ${frDate(doc.issued_at)}`,
    doc.valid_until ? `Valable jusqu'au : ${frDate(doc.valid_until)}` : null,
    doc.reference ? `Référence : ${doc.reference}` : null,
  ].filter(Boolean);
  meta.forEach((l, i) => pdf.text(clean(l), M, y + i * 5));

  // ── Client ───────────────────────────────────────────────────────────────
  const c = doc.customer || {};
  pdf.setDrawColor(...color); pdf.setLineWidth(0.4);
  pdf.roundedRect(W / 2, 38, W / 2 - M, 30, 2, 2);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...color);
  pdf.text(doc.type === 'purchase_order' ? 'CLIENT' : 'FACTURÉ À', W / 2 + 4, 44);
  pdf.setTextColor(40, 40, 40); pdf.setFontSize(10);
  pdf.text(clean(c.organization || c.name || ''), W / 2 + 4, 50);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5);
  [c.organization ? c.name : null, c.address, [c.phone, c.email].filter(Boolean).join('  ·  ')]
    .filter(Boolean).forEach((l, i) => pdf.text(clean(l).slice(0, 60), W / 2 + 4, 55 + i * 4.5));

  // ── Tableau des lignes ───────────────────────────────────────────────────
  y = 78;
  const cols = { label: M + 2, qty: 128, unit: 158, total: W - M - 2 };
  const header = () => {
    pdf.setFillColor(...color); pdf.rect(M, y - 5, W - 2 * M, 8, 'F');
    pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
    pdf.text('Désignation', cols.label, y);
    pdf.text('Qté', cols.qty, y, { align: 'right' });
    pdf.text('Prix unitaire', cols.unit, y, { align: 'right' });
    pdf.text('Montant', cols.total, y, { align: 'right' });
    pdf.setTextColor(40, 40, 40); pdf.setFont('helvetica', 'normal');
    y += 8;
  };
  header();

  (doc.lines || []).forEach((l, i) => {
    const label = pdf.splitTextToSize(clean(l.label), 100);
    const h = Math.max(7, label.length * 4.5 + 2.5);
    if (y + h > 250) { pdf.addPage(); y = 20; header(); }
    if (i % 2 === 0) { pdf.setFillColor(246, 246, 246); pdf.rect(M, y - 4.5, W - 2 * M, h, 'F'); }
    pdf.text(label, cols.label, y);
    pdf.text(String(l.quantity), cols.qty, y, { align: 'right' });
    pdf.text(money(l.unit_price), cols.unit, y, { align: 'right' });
    pdf.text(money(l.quantity * l.unit_price), cols.total, y, { align: 'right' });
    y += h;
  });

  // ── Totaux ───────────────────────────────────────────────────────────────
  if (y > 235) { pdf.addPage(); y = 20; }
  y += 4;
  const total = (label, value, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(bold ? 11 : 9.5);
    pdf.text(label, cols.unit, y, { align: 'right' });
    pdf.text(value, cols.total, y, { align: 'right' });
    y += bold ? 8 : 6;
  };
  total('Sous-total', money(doc.subtotal));
  if (doc.discount > 0) total('Remise', `- ${money(doc.discount)}`);
  pdf.setDrawColor(...color); pdf.line(118, y - 3.5, W - M, y - 3.5);
  y += 2;
  total(doc.type === 'purchase_order' ? 'TOTAL' : 'TOTAL À PAYER', money(doc.total), true);

  if (doc.notes) {
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(8.5);
    pdf.text(pdf.splitTextToSize(clean(`Notes : ${doc.notes}`), W - 2 * M), M, y + 2);
  }

  // ── Mentions légales et pied de page ─────────────────────────────────────
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(110, 110, 110);
  const foot = [doc.shop?.footer, doc.shop?.legal].filter(Boolean).map(clean);
  let fy = 282 - foot.length * 4;
  foot.forEach((l) => { pdf.text(pdf.splitTextToSize(l, W - 2 * M), W / 2, fy, { align: 'center' }); fy += 4; });

  pdf.save(`${doc.type === 'purchase_order' ? 'bon-de-commande' : 'facture'}-${doc.number}.pdf`);
}

/**
 * Export tabulaire (paysage) : { title, subtitle, columns: [{key,label,width,align,format}], rows, filename }
 */
export async function downloadTablePdf({ title, subtitle, columns, rows, filename }) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const W = 297, M = 12;
  let y = 16;

  const head = () => {
    let x = M;
    pdf.setFillColor(30, 58, 95); pdf.rect(M, y - 5, W - 2 * M, 8, 'F');
    pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5);
    columns.forEach((c) => {
      pdf.text(c.label, c.align === 'right' ? x + c.width - 2 : x + 2, y, { align: c.align === 'right' ? 'right' : 'left' });
      x += c.width;
    });
    pdf.setTextColor(40, 40, 40); pdf.setFont('helvetica', 'normal');
    y += 8;
  };

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(30, 58, 95);
  pdf.text(clean(title), M, y);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(110, 110, 110);
  pdf.text(clean(subtitle || ''), M, y + 6);
  y += 16;
  head();

  pdf.setFontSize(8);
  rows.forEach((r, i) => {
    const cells = columns.map((c) => pdf.splitTextToSize(clean(c.format ? c.format(r[c.key], r) : r[c.key]), c.width - 4));
    const h = Math.max(6, Math.max(...cells.map((t) => t.length)) * 3.8 + 2);
    if (y + h > 198) {
      pdf.text(`Page ${pdf.getNumberOfPages()}`, W - M, 205, { align: 'right' });
      pdf.addPage(); y = 16; head(); pdf.setFontSize(8);
    }
    if (i % 2 === 0) { pdf.setFillColor(246, 246, 246); pdf.rect(M, y - 4, W - 2 * M, h, 'F'); }
    let x = M;
    columns.forEach((c, j) => {
      pdf.text(cells[j], c.align === 'right' ? x + c.width - 2 : x + 2, y, { align: c.align === 'right' ? 'right' : 'left' });
      x += c.width;
    });
    y += h;
  });

  if (!rows.length) pdf.text('Aucune donnée.', M, y);
  pdf.text(`Page ${pdf.getNumberOfPages()}`, W - M, 205, { align: 'right' });
  pdf.save(filename);
}
