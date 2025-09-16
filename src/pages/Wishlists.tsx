import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { CreateWishlistModal } from '../components/wishlist/CreateWishlistModal';

export function Wishlists() {
  const { wishlists, loading, removeFromWishlist } = useWishlist();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mes Listes de Souhaits</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Créer une liste</span>
        </button>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold">Aucune liste de souhaits</h2>
          <p className="text-gray-600">Créez votre première liste pour sauvegarder vos produits favoris.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {wishlists.map(list => (
            <div key={list.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4">{list.name}</h2>
              {list.wishlist_items.length === 0 ? (
                <p>Cette liste est vide.</p>
              ) : (
                <div className="space-y-4">
                  {list.wishlist_items.map(item => {
                    const product = item.products;
                    if (!product) {
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border-b">
                          <p className="text-gray-500">Ce produit n'est plus disponible.</p>
                          <button onClick={() => removeFromWishlist(item.product_id, list.id)} className="text-red-500 p-2 rounded-full hover:bg-red-50">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-4">
                          <img src={product.images?.[0]} alt={product.name_fr} className="h-16 w-16 object-cover rounded-md" />
                          <div>
                            <Link to={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:text-green-600">{product.name_fr}</Link>
                            <p className="text-sm text-gray-600">{formatPrice(product.price)} FCFA</p>
                          </div>
                        </div>
                        <button onClick={() => removeFromWishlist(item.product_id, list.id)} className="text-red-500 p-2 rounded-full hover:bg-red-50">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <CreateWishlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
