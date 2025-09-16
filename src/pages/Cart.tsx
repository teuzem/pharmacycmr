import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';

export function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, loading } = useCart();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const shippingCost = getTotalPrice() >= 50000 ? 0 : 5000; // Livraison gratuite à partir de 50 000 FCFA
  const totalWithShipping = getTotalPrice() + shippingCost;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-gray-400 mb-6">
            <ShoppingBag className="h-24 w-24 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-8">Votre panier ne contient aucun produit pour le moment.</p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>{t('cart.continue_shopping')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles du panier */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Articles ({items.length})</h2>
            </div>
            
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-4">
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}
                    alt={language === 'fr' ? item.product.name_fr : item.product.name_en}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {language === 'fr' ? item.product.name_fr : item.product.name_en}
                    </h3>
                    
                    {item.product.requires_prescription && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                        {t('products.prescription_required')}
                      </span>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatPrice(item.product.price * item.quantity)} {t('common.currency')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(item.product.price)} {t('common.currency')} / unité
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title={t('cart.remove_item')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé de commande */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Résumé de commande</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(getTotalPrice())} {t('common.currency')}</span>
              </div>
              
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    `${formatPrice(shippingCost)} ${t('common.currency')}`
                  )}
                </span>
              </div>
              
              {shippingCost > 0 && (
                <div className="text-sm text-gray-600">
                  Livraison gratuite à partir de 50 000 {t('common.currency')}
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('common.total')}</span>
                  <span className="text-green-600">
                    {formatPrice(totalWithShipping)} {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>
            
            <Link
              to="/checkout"
              className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-semibold block"
            >
              {t('cart.checkout')}
            </Link>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Livraison sécurisée</h3>
            <p className="text-sm text-green-700">
              Vos médicaments sont emballés de manière sécurisée et livrés dans les meilleurs délais.
            </p>
          </div>
        </div>
      </div>

      {/* Bouton continuer les achats */}
      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700"
        >
          <span>{t('cart.continue_shopping')}</span>
        </Link>
      </div>
    </div>
  );
}
