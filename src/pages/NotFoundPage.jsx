import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <p className="text-[10rem] font-black text-[#e8e0d4] leading-none select-none"
          style={{fontFamily:'Playfair Display,serif'}}>
          404
        </p>
        <p className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">📚</p>
      </div>
      <h1 className="text-3xl font-black text-[#0f1923] mb-3" style={{fontFamily:'Playfair Display,serif'}}>
        Page introuvable
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Ce livre semble avoir été rangé dans un rayon inconnu… Retournez à l'accueil pour continuer votre recherche.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="bg-[#0f1923] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c9933a] transition shadow-sm">
          🏠 Accueil
        </Link>
        <Link to="/catalog" className="bg-white border-2 border-[#e8e0d4] text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-[#c9933a] transition">
          📚 Catalogue
        </Link>
      </div>
    </div>
  );
}
