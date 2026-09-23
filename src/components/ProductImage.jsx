import { useState } from 'react';

const API_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', '');

/**
 * URL absolue de la photo d'un produit (livre, fourniture, kit).
 * Renvoie null quand aucune photo n'a été envoyée : l'appelant affiche alors
 * l'icône par défaut.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function productImageUrl(item) {
  if (!item) return null;
  const url = item.image_url
    || item.images?.find(i => i.is_main)?.url
    || item.images?.[0]?.url
    || null;
  if (!url) return null;
  return url.startsWith('/storage') ? BASE_URL + url : url;
}

/**
 * Photo du produit, avec repli sur l'icône.
 *
 * Avant, les listes (catalogue, accueil, panier, commandes, favoris…) affichaient
 * toujours l'icône, même quand le produit avait une photo : seules la fiche
 * produit et l'espace admin la montraient.
 *
 * @param item     produit (utilise image_url, sinon la photo principale)
 * @param fallback icône affichée quand il n'y a pas de photo
 * @param className classes du conteneur (taille, arrondi…)
 * @param imgClassName classes supplémentaires pour l'image
 */
export default function ProductImage({
  item,
  fallback = '📦',
  className = '',
  imgClassName = '',
  emojiClassName = '',
  alt = '',
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : productImageUrl(item);

  if (!src) {
    return <span className={emojiClassName || className}>{fallback}</span>;
  }

  return (
    <img
      src={src}
      alt={alt || item?.titre || item?.nom || ''}
      loading="lazy"
      onError={() => setFailed(true)}   // photo introuvable → on retombe sur l'icône
      className={`object-cover ${className} ${imgClassName}`.trim()}
    />
  );
}
