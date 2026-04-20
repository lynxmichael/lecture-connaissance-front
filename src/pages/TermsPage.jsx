import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="text-[#c9933a] text-sm hover:underline mb-6 inline-block">← Retour à l'accueil</Link>
      <h1 className="text-4xl font-black text-[#0f1923] mb-2" style={{fontFamily:'Playfair Display,serif'}}>
        Conditions générales de vente
      </h1>
      <p className="text-gray-400 text-sm mb-10">Lecture & Connaissance · Mis à jour le 18 avril 2026</p>

      {[
        { title:'1. Objet', content:'Les présentes conditions générales de vente s\'appliquent à toutes les commandes passées sur la plateforme Lecture & Connaissance. En passant commande, le client accepte sans réserve ces conditions.' },
        { title:'2. Produits', content:'Lecture & Connaissance propose des livres, fournitures scolaires et matériel de bureau. Les descriptions et prix des produits sont donnés à titre indicatif et peuvent être modifiés sans préavis. Les promotions sont valables dans la limite des stocks disponibles.' },
        { title:'3. Commandes et paiement', content:'Les commandes sont passées en ligne via notre plateforme sécurisée. Le paiement s\'effectue par Mobile Money (Orange Money, MTN MoMo, Moov Money, Wave). La commande est confirmée après validation du paiement.' },
        { title:'4. Livraison', content:'Les livraisons sont effectuées à Abidjan et en Côte d\'Ivoire. Les délais varient de 24h à 72h selon votre localisation. Le client sera contacté par téléphone au numéro fourni lors de la commande.' },
        { title:'5. Retours et remboursements', content:'Tout article défectueux peut être retourné dans les 7 jours suivant la réception. Le remboursement sera effectué dans les 5 jours ouvrables après réception et vérification du retour.' },
        { title:'6. Données personnelles', content:'Les données collectées (nom, prénom, téléphone, adresse) sont utilisées uniquement pour le traitement des commandes et ne sont pas transmises à des tiers. Conformément à la loi ivoirienne sur la protection des données personnelles, vous disposez d\'un droit d\'accès et de rectification.' },
        { title:'7. Contact', content:'Pour toute réclamation ou question : contact@lecture-connaissance.ci · +225 07 00 00 00 00 · Avenue de la République, Cocody, Abidjan.' },
      ].map(s => (
        <section key={s.title} className="mb-8">
          <h2 className="text-xl font-black text-[#0f1923] mb-3" style={{fontFamily:'Playfair Display,serif'}}>{s.title}</h2>
          <p className="text-gray-600 leading-relaxed">{s.content}</p>
        </section>
      ))}
    </div>
  );
}
