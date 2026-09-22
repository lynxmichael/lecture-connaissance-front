import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/fournitures';

export default function Footer() {
  const topCats = Object.entries(CATEGORIES).slice(0, 6);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a1219] text-gray-400 mt-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-10 h-10 bg-[#c9933a] rounded-xl flex items-center justify-center text-xl">📚</span>
              <div>
                <p className="text-white font-bold text-sm" style={{fontFamily:'Playfair Display,serif'}}>Lecture & Connaissance</p>
                <p className="text-[#c9933a] text-[10px] tracking-widest uppercase">Librairie · Papeterie</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              Votre librairie-papeterie de référence à Abidjan. Livres, fournitures scolaires et matériel de bureau livrés rapidement.
            </p>
            <div className="space-y-1 text-xs">
              <p>📍 Avenue de la République, Cocody, Abidjan</p>
              <p>📞 <a href="tel:+22507000000000" className="hover:text-[#c9933a] transition">+225 07 00 00 00 00</a></p>
              <p>✉️ <a href="mailto:contact@lecture-connaissance.ci" className="hover:text-[#c9933a] transition">contact@lecture-connaissance.ci</a></p>
            </div>
          </div>

          {/* Catalogue */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Catalogue</p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/catalog" className="hover:text-[#c9933a] transition">📚 Tous les livres</Link></li>
              <li><Link to="/catalog?rayon=Informatique"   className="hover:text-[#c9933a] transition">💻 Informatique</Link></li>
              <li><Link to="/catalog?rayon=Littérature"   className="hover:text-[#c9933a] transition">📖 Littérature</Link></li>
              <li><Link to="/catalog?rayon=Sciences"      className="hover:text-[#c9933a] transition">🔬 Sciences</Link></li>
              <li><Link to="/catalog?rayon=Histoire"      className="hover:text-[#c9933a] transition">🏛️ Histoire</Link></li>
              <li><Link to="/catalog?promo_only=1"        className="hover:text-[#c9933a] transition">🔥 Promotions</Link></li>
              <li><Link to="/kits"                          className="hover:text-[#c9933a] transition">🎒 Kits scolaires</Link></li>
            </ul>
          </div>

          {/* Fournitures */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Fournitures</p>
            <ul className="space-y-2 text-xs">
              {topCats.map(([cat, info]) => (
                <li key={cat}>
                  <Link to={`/fournitures?categorie=${encodeURIComponent(cat)}`}
                    className="hover:text-[#c9933a] transition">
                    {info.emoji} {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Mon compte</p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register"  className="hover:text-[#c9933a] transition">👤 S'inscrire</Link></li>
              <li><Link to="/login"     className="hover:text-[#c9933a] transition">🔑 Se connecter</Link></li>
              <li><Link to="/orders"    className="hover:text-[#c9933a] transition">📦 Mes commandes</Link></li>
              <li><Link to="/wishlist"  className="hover:text-[#c9933a] transition">❤️ Mes favoris</Link></li>
              <li><Link to="/profile"   className="hover:text-[#c9933a] transition">⚙️ Mon profil</Link></li>
              <li><Link to="/fidelite"  className="hover:text-[#c9933a] transition">⭐ Programme fidélité</Link></li>
            </ul>
            <div className="mt-5">
              <p className="text-white font-bold text-xs mb-2 uppercase tracking-wide">Paiement accepté</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {label:'Orange', bg:'bg-orange-500'},
                  {label:'MTN',    bg:'bg-yellow-400'},
                  {label:'Moov',   bg:'bg-blue-600'},
                  {label:'Wave',   bg:'bg-cyan-500'},
                ].map(p => (
                  <span key={p.label} className={`${p.bg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{p.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {year} Lecture & Connaissance · Abidjan, Côte d'Ivoire · RCCM CI-ABJ-2024-B-00123</p>
          <div className="flex gap-4">
            <span className="hover:text-[#c9933a] cursor-pointer transition">Conditions générales</span>
            <span className="hover:text-[#c9933a] cursor-pointer transition">Politique de confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
