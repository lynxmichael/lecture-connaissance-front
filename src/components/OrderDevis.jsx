import { useRef, useEffect, useState, useCallback } from 'react';
import { formatCFA, discountPercent } from '../utils/currency';

const LIBRAIRE_NOM   = 'Lecture & Connaissance';
const LIBRAIRE_ADR   = "Avenue de la République, Abidjan, Côte d'Ivoire";
const LIBRAIRE_TEL   = '+225 07 00 00 00 00';
const LIBRAIRE_EMAIL = 'contact@lecture-connaissance.ci';
const LIBRAIRE_RCCM  = 'CI-ABJ-2024-B-00123';

/* ── QR code ─────────────────────────────────────────────────────────────── */
function qrUrl(data, size = 130) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1e3a5f&qzone=1`;
}

/* ── Canvas signature ────────────────────────────────────────────────────── */
function SignaturePad({ onSave, savedSignature }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const [empty,  setEmpty]  = useState(!savedSignature);
  const [saved,  setSaved]  = useState(!!savedSignature);

  const getPos = (e, cv) => {
    const r   = cv.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const start = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const cv = canvasRef.current;
    const { x, y } = getPos(e, cv);
    cv.getContext('2d').beginPath();
    cv.getContext('2d').moveTo(x, y);
  }, []);

  const move = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const cv  = canvasRef.current;
    const ctx = cv.getContext('2d');
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const { x, y } = getPos(e, cv);
    ctx.lineTo(x, y); ctx.stroke();
    setEmpty(false);
  }, []);

  const end = useCallback(() => { drawing.current = false; }, []);

  const clear = () => {
    canvasRef.current.getContext('2d').clearRect(0, 0, 320, 100);
    setEmpty(true); setSaved(false);
  };

  const save = () => {
    onSave(canvasRef.current.toDataURL('image/png'));
    setSaved(true);
  };

  useEffect(() => {
    if (savedSignature && canvasRef.current) {
      const img = new Image();
      img.onload = () => canvasRef.current.getContext('2d').drawImage(img, 0, 0);
      img.src = savedSignature;
    }
  }, [savedSignature]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50" style={{touchAction:'none'}}>
        <canvas ref={canvasRef} width={320} height={100} className="block w-full cursor-crosshair"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        {empty && !savedSignature && (
          <p className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">✍️ Signez ici</p>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={clear}
          className="flex-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">Effacer</button>
        <button type="button" onClick={save} disabled={empty}
          className={`flex-1 text-xs px-3 py-1.5 rounded-lg transition font-semibold ${saved ? 'bg-green-100 text-green-700' : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a] disabled:opacity-40'}`}>
          {saved ? '✅ Enregistrée' : 'Valider'}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════════════════════════ */
export default function OrderDevis({ order, isAdmin = false, autoExport = false }) {
  const devisRef       = useRef(null);
  const autoFired      = useRef(false);   // ← empêche les exports multiples
  const [clientSig,    setClientSig]    = useState(null);
  const [libSig,       setLibSig]       = useState(null);
  const [exporting,    setExporting]    = useState(false);
  const [exported,     setExported]     = useState(false);
  const [showSigs,     setShowSigs]     = useState(false);

  if (!order) return null;

  const numero = order.numero_commande || `CMD-${order.id}`;
  const date   = order.date_commande
    ? new Date(order.date_commande).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

  const clientTel   = order.client_telephone ?? order.telephone ?? null;
  const clientEmail = order.client_email ?? null;
  const items       = order.items ?? [];
  const total       = parseFloat(order.total ?? 0);
  const paymentMethod = order.payment_method ?? null;

  const originalTotal = items.reduce((s, item) =>
    s + parseFloat(item.book?.prix ?? item.prix_unitaire ?? 0) * item.quantite, 0);
  const savings = Math.max(0, originalTotal - total);

  const qrData = [
    `N°: ${numero}`,
    `Client: ${order.client_nom}`,
    `Total: ${formatCFA(total)}`,
    `Date: ${date}`,
    clientTel ? `Tél: ${clientTel}` : '',
    paymentMethod ? `Paiement: ${paymentMethod}` : '',
  ].filter(Boolean).join(' | ');

  /* ── Export PDF — une seule fois ────────────────────────────────────────── */
  const exportPDF = useCallback(async () => {
    if (!devisRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas  = await html2canvas(devisRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w       = pdf.internal.pageSize.getWidth();
      const ratio   = canvas.width / canvas.height;
      const h       = w / ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h > 297 ? 297 : h);
      pdf.save(`bon-commande-${numero}.pdf`);
      setExported(true);
    } catch (err) {
      console.error('PDF:', err);
      window.print();
    } finally {
      setExporting(false);
    }
  }, []); // ← dépendances vides = stable, pas de re-render infini

  /* ── Auto-export UNE seule fois ─────────────────────────────────────────── */
  useEffect(() => {
    if (!autoExport || autoFired.current) return;
    autoFired.current = true; // verrou — ne s'exécute qu'une fois
    const t = setTimeout(exportPDF, 1200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ════════════════════════ RENDU ═════════════════════════════════════════ */
  return (
    <div className="space-y-4">

      {/* Barre d'actions */}
      <div className="flex flex-wrap gap-3 items-center no-print">
        <button onClick={exportPDF} disabled={exporting}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
            exported ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a]'
          } disabled:opacity-60`}>
          {exporting ? <><span className="animate-spin">⏳</span> Génération…</>
           : exported ? <>✅ PDF téléchargé</>
           : <>📥 Télécharger PDF</>}
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-300 transition">
          🖨️ Imprimer
        </button>
        <button onClick={() => setShowSigs(s => !s)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition ${
            showSigs ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          }`}>
          ✍️ {showSigs ? 'Masquer signatures' : 'Signer le devis'}
        </button>
      </div>

      {/* ══ DEVIS (capturé pour PDF) ══════════════════════════════════════════ */}
      <div ref={devisRef} className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 max-w-2xl mx-auto" style={{fontFamily:'Georgia, serif'}}>

        {/* Entête bleu marine */}
        <div className="bg-[#1e3a5f] text-white px-8 py-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-3xl mb-1">📚</p>
              <h1 className="text-xl font-bold tracking-tight">{LIBRAIRE_NOM}</h1>
              <p className="text-blue-300 text-xs mt-1">{LIBRAIRE_ADR}</p>
              <p className="text-blue-300 text-xs">{LIBRAIRE_EMAIL}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="bg-white/15 rounded-xl px-4 py-2.5 inline-block mb-2">
                <p className="text-blue-300 text-[10px] uppercase tracking-widest">Bon de commande</p>
                <p className="text-2xl font-bold font-mono tracking-wider">{numero}</p>
              </div>
              <p className="text-blue-300 text-xs">Émis le {date}</p>
              <p className="text-blue-300 text-xs">RCCM : {LIBRAIRE_RCCM}</p>
            </div>
          </div>
        </div>

        {/* Bande décorative */}
        <div className="h-1 bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6]" />

        {/* Coordonnées */}
        <div className="grid grid-cols-2 border-b">
          <div className="px-7 py-5 border-r bg-slate-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Client</p>
            <p className="font-bold text-gray-900 text-base">{order.client_nom}</p>
            <p className="text-gray-600 text-sm mt-1 leading-snug">📍 {order.adresse}</p>
            <div className="mt-2 space-y-1">
              {clientTel
                ? <p className="text-sm text-[#1e3a5f] font-semibold">📞 {clientTel}</p>
                : <p className="text-xs text-gray-400 italic">Tél. non renseigné</p>}
              {clientEmail && <p className="text-xs text-gray-500">✉️ {clientEmail}</p>}
            </div>
          </div>
          <div className="px-7 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Librairie</p>
            <p className="font-bold text-gray-900 text-base">{LIBRAIRE_NOM}</p>
            <p className="text-gray-600 text-sm mt-1 leading-snug">📍 {LIBRAIRE_ADR}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-700 font-semibold">📞 {LIBRAIRE_TEL}</p>
              <p className="text-xs text-gray-500">✉️ {LIBRAIRE_EMAIL}</p>
            </div>
          </div>
        </div>

        {/* Statut + mode de paiement */}
        <div className="px-7 py-2.5 border-b bg-emerald-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-sm font-semibold text-emerald-800">Statut : {order.statut ?? 'Validée'}</span>
          </div>
          {paymentMethod && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">
                💳 Paiement : <span className="text-[#1e3a5f]">{paymentMethod}</span>
              </span>
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="px-7 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#1e3a5f]/20 text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="text-left pb-2 font-bold">Article</th>
                <th className="text-center pb-2 font-bold w-10">Qté</th>
                <th className="text-right pb-2 font-bold w-28">P.U.</th>
                <th className="text-right pb-2 font-bold w-28">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0
                ? <tr><td colSpan={4} className="py-4 text-center text-gray-400 italic">Aucun article</td></tr>
                : items.map(item => {
                  const puFinal = parseFloat(item.prix_unitaire ?? item.book?.prix ?? 0);
                  const puOrig  = parseFloat(item.book?.prix ?? puFinal);
                  const hasPromo = puFinal < puOrig - 1;
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{item.book?.image || '📖'}</span>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{item.book?.titre ?? '—'}</p>
                            <p className="text-gray-400 text-xs">{item.book?.auteur}</p>
                            {hasPromo && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 rounded">PROMO -{discountPercent(puOrig,puFinal)}%</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-gray-700">{item.quantite}</td>
                      <td className="py-3 text-right">
                        {hasPromo
                          ? <div><p className="text-xs text-gray-400 line-through">{formatCFA(puOrig)}</p><p className="font-bold text-red-600 text-xs">{formatCFA(puFinal)}</p></div>
                          : <p className="font-semibold text-gray-800 text-xs">{formatCFA(puFinal)}</p>}
                      </td>
                      <td className="py-3 text-right font-bold text-[#1e3a5f]">{formatCFA(puFinal * item.quantite)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="mt-4 border-t-2 border-[#1e3a5f]/20 pt-4 ml-auto max-w-xs space-y-1.5">
            {savings > 10 && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Sous-total</span><span className="line-through">{formatCFA(originalTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-700 font-semibold">
                  <span>🎉 Remises</span><span>-{formatCFA(savings)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-extrabold text-lg border-t-2 border-[#1e3a5f]/30 pt-2 text-[#1e3a5f]">
              <span>TOTAL TTC</span><span>{formatCFA(total)}</span>
            </div>
          </div>
        </div>

        {/* QR + Signatures */}
        <div className="border-t mx-7 pt-5 pb-5 flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <img src={qrUrl(qrData)} alt="QR Code" width={110} height={110}
              className="rounded-xl border border-gray-200 shadow-sm" crossOrigin="anonymous" />
            <p className="text-[10px] text-gray-400 text-center leading-tight max-w-[110px]">
              Scannez pour vérifier
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {['client', 'lib'].map(who => {
              const sig = who === 'client' ? clientSig : libSig;
              const label = who === 'client' ? 'Signature client' : 'Cachet librairie';
              const name  = who === 'client' ? order.client_nom : LIBRAIRE_NOM;
              return (
                <div key={who}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                  {sig
                    ? <div className="border-2 border-green-200 rounded-xl p-1 bg-green-50">
                        <img src={sig} alt={label} className="w-full h-[80px] object-contain" />
                      </div>
                    : <div className="h-[80px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-gray-300 text-xs italic">Non signé</span>
                      </div>}
                  <div className="mt-1 border-b border-gray-300" />
                  <p className="text-[10px] text-gray-400 mt-0.5">{name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-[#1e3a5f]/5 border-t px-7 py-3 text-[10px] text-gray-400 text-center">
          {LIBRAIRE_NOM} · {LIBRAIRE_ADR} · RCCM : {LIBRAIRE_RCCM}
          <br />Ce bon de commande est généré automatiquement et fait foi de la transaction.
        </div>
      </div>

      {/* Panneaux de signature (hors PDF) */}
      {showSigs && (
        <div className="grid sm:grid-cols-2 gap-4 no-print">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-700 mb-3">✍️ Signature du client</p>
            <SignaturePad onSave={setClientSig} savedSignature={clientSig} />
          </div>
          {isAdmin && (
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-sm text-gray-700 mb-3">🏪 Cachet de la librairie</p>
              <SignaturePad onSave={setLibSig} savedSignature={libSig} />
            </div>
          )}
        </div>
      )}

      {/* Appel admin */}
      {isAdmin && clientTel && (
        <div className="no-print bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#1e3a5f]">Contacter le client</p>
            <p className="text-gray-600 text-sm">{order.client_nom} — {clientTel}</p>
          </div>
          <a href={`tel:${clientTel}`}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 flex-shrink-0">
            📞 Appeler
          </a>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display:none !important; }
          body > *:not(#root) { display:none !important; }
        }
      `}</style>
    </div>
  );
}
