export interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.products': { fr: 'Produits', en: 'Products' },
  'nav.prescriptions': { fr: 'Ordonnances', en: 'Prescriptions' },
  'nav.cart': { fr: 'Panier', en: 'Cart' },
  'nav.account': { fr: 'Mon Compte', en: 'My Account' },
  'nav.admin': { fr: 'Administration', en: 'Admin' },
  
  // Common
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.success': { fr: 'Succès', en: 'Success' },
  'common.save': { fr: 'Sauvegarder', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.edit': { fr: 'Modifier', en: 'Edit' },
  'common.view': { fr: 'Voir', en: 'View' },
  'common.add': { fr: 'Ajouter', en: 'Add' },
  'common.search': { fr: 'Rechercher', en: 'Search' },
  'common.filter': { fr: 'Filtrer', en: 'Filter' },
  'common.sort': { fr: 'Trier', en: 'Sort' },
  'common.price': { fr: 'Prix', en: 'Price' },
  'common.quantity': { fr: 'Quantité', en: 'Quantity' },
  'common.total': { fr: 'Total', en: 'Total' },
  'common.currency': { fr: 'FCFA', en: 'XAF' },
  
  // Products
  'products.title': { fr: 'Nos Produits', en: 'Our Products' },
  'products.featured': { fr: 'Produits Vedettes', en: 'Featured Products' },
  'products.prescription_required': { fr: 'Ordonnance requise', en: 'Prescription required' },
  'products.over_counter': { fr: 'Vente libre', en: 'Over the counter' },
  'products.add_to_cart': { fr: 'Ajouter au panier', en: 'Add to cart' },
  'products.out_of_stock': { fr: 'Rupture de stock', en: 'Out of stock' },
  'products.dosage': { fr: 'Dosage', en: 'Dosage' },
  'products.manufacturer': { fr: 'Fabricant', en: 'Manufacturer' },
  'products.active_ingredient': { fr: 'Principe actif', en: 'Active ingredient' },
  
  // Cart
  'cart.title': { fr: 'Mon Panier', en: 'My Cart' },
  'cart.empty': { fr: 'Votre panier est vide', en: 'Your cart is empty' },
  'cart.subtotal': { fr: 'Sous-total', en: 'Subtotal' },
  'cart.shipping': { fr: 'Livraison', en: 'Shipping' },
  'cart.tax': { fr: 'Taxes', en: 'Tax' },
  'cart.checkout': { fr: 'Passer commande', en: 'Checkout' },
  'cart.continue_shopping': { fr: 'Continuer les achats', en: 'Continue shopping' },
  'cart.remove_item': { fr: 'Retirer du panier', en: 'Remove from cart' },
  
  // Prescriptions
  'prescriptions.title': { fr: 'Mes Ordonnances', en: 'My Prescriptions' },
  'prescriptions.upload': { fr: 'Télécharger une ordonnance', en: 'Upload prescription' },
  'prescriptions.upload_instructions': { 
    fr: 'Téléchargez une photo ou un PDF de votre ordonnance médicale', 
    en: 'Upload a photo or PDF of your medical prescription' 
  },
  'prescriptions.processing': { fr: 'Traitement en cours...', en: 'Processing...' },
  'prescriptions.verified': { fr: 'Vérifiée', en: 'Verified' },
  'prescriptions.pending': { fr: 'En attente', en: 'Pending' },
  'prescriptions.rejected': { fr: 'Rejetée', en: 'Rejected' },
  
  // Orders
  'orders.title': { fr: 'Mes Commandes', en: 'My Orders' },
  'orders.order_number': { fr: 'Numéro de commande', en: 'Order number' },
  'orders.status': { fr: 'Statut', en: 'Status' },
  'orders.date': { fr: 'Date', en: 'Date' },
  'orders.pending': { fr: 'En attente', en: 'Pending' },
  'orders.confirmed': { fr: 'Confirmée', en: 'Confirmed' },
  'orders.processing': { fr: 'En préparation', en: 'Processing' },
  'orders.shipped': { fr: 'Expédiée', en: 'Shipped' },
  'orders.delivered': { fr: 'Livrée', en: 'Delivered' },
  'orders.cancelled': { fr: 'Annulée', en: 'Cancelled' },
  
  // Auth
  'auth.login': { fr: 'Se connecter', en: 'Login' },
  'auth.register': { fr: 'S\'inscrire', en: 'Register' },
  'auth.logout': { fr: 'Se déconnecter', en: 'Logout' },
  'auth.email': { fr: 'Email', en: 'Email' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.confirm_password': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'auth.first_name': { fr: 'Prénom', en: 'First name' },
  'auth.last_name': { fr: 'Nom', en: 'Last name' },
  'auth.phone': { fr: 'Téléphone', en: 'Phone' },
  'auth.forgot_password': { fr: 'Mot de passe oublié?', en: 'Forgot password?' },
  
  // Company info
  'company.name': { fr: 'PharmaConnect Cameroun', en: 'PharmaConnect Cameroon' },
  'company.tagline': { fr: 'Votre pharmacie en ligne de confiance', en: 'Your trusted online pharmacy' },
  'company.description': { 
    fr: 'PharmaConnect est votre pharmacie en ligne de confiance au Cameroun. Nous offrons une large gamme de médicaments, avec ou sans ordonnance, livrés directement chez vous.',
    en: 'PharmaConnect is your trusted online pharmacy in Cameroon. We offer a wide range of medications, with or without prescription, delivered directly to you.'
  }
};

export function useTranslation(language: string = 'fr') {
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language as keyof typeof translation] || translation.fr;
  };

  return { t };
}
