import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
<<<<<<< HEAD
  // withCredentials retiré : on utilise Bearer token, pas les cookies Sanctum
=======
  headers: { Accept: 'application/json' },
>>>>>>> 294c6dc (Initial commit)
});

// Ajouter automatiquement le token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
<<<<<<< HEAD
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

=======
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/*
 * Abonnement expiré / suspendu : avant, CHAQUE requête refusée déclenchait
 * une alert() bloquante puis un rechargement complet vers /entreprise
 * (plusieurs alertes d'affilée sur le tableau de bord admin, et l'écran de
 * blocage réapparaissait après le rechargement).
 * Maintenant on émet un seul événement ; AuthContext recharge l'utilisateur
 * et l'application affiche l'écran de renouvellement.
 */
let subscriptionEventSent = false;
const notifySubscriptionBlocked = (message) => {
  if (subscriptionEventSent) return;
  subscriptionEventSent = true;
  window.dispatchEvent(new CustomEvent('subscription:blocked', { detail: { message } }));
  setTimeout(() => { subscriptionEventSent = false; }, 3000);
};

>>>>>>> 294c6dc (Initial commit)
// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
<<<<<<< HEAD
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
=======
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // Token expiré / invalide → déconnexion (sans boucle si on est déjà sur /login)
    if (status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Abonnement expiré / suspendu / annulé
    if (status === 403 && typeof code === 'string' && code.startsWith('SUBSCRIPTION_')) {
      notifySubscriptionBlocked(error.response.data.message);
    }

>>>>>>> 294c6dc (Initial commit)
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default api;
=======
export default api;
>>>>>>> 294c6dc (Initial commit)
