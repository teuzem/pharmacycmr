import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, CreditCard, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  shipping_address: any;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product: {
      name_fr: string;
      name_en: string;
      images: string[];
    };
  }[];
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            product:products(
              name_fr,
              name_en,
              images
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmée' },
      processing: { color: 'bg-purple-100 text-purple-800', text: 'En préparation' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', text: 'Expédiée' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Livrée' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Annulée' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('orders.title')}</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Package className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aucune commande pour le moment
            </h2>
            <p className="text-gray-600 mb-8">
              Vous n'avez pas encore passé de commandes. Découvrez nos produits !
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Découvrir nos produits</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête de commande */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Commande #{order.order_number}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 md:mt-0">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatPrice(order.total_amount)} {order.currency}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.order_items.length} article{order.order_items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Articles de la commande */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.product.images[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                          alt={language === 'fr' ? item.product.name_fr : item.product.name_en}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {language === 'fr' ? item.product.name_fr : item.product.name_en}
                          </h4>
                          <div className="text-sm text-gray-600">
                            Quantité: {item.quantity} × {formatPrice(item.unit_price)} {order.currency}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatPrice(item.quantity * item.unit_price)} {order.currency}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adresse de livraison */}
                  {order.shipping_address && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Adresse de livraison</h4>
                          <div className="text-sm text-gray-600">
                            <div>{order.shipping_address.firstName} {order.shipping_address.lastName}</div>
                            <div>{order.shipping_address.address}</div>
                            <div>{order.shipping_address.city}, {order.shipping_address.postalCode}</div>
                            {order.shipping_address.phone && <div>{order.shipping_address.phone}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {order.status === 'delivered' && (
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Laisser un avis
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Annuler la commande
                        </button>
                      )}
                    </div>
                    <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      <span>Voir les détails</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
