import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const schema = yup.object({
  firstName: yup.string().required('Prénom requis'),
  lastName: yup.string().required('Nom requis'),
  email: yup.string().email('Email invalide').required('Email requis'),
  phone: yup.string().required('Téléphone requis'),
  address: yup.string().required('Adresse requise'),
  city: yup.string().required('Ville requise'),
  postalCode: yup.string().required('Code postal requis'),
  paymentMethod: yup.string().required('Méthode de paiement requise'),
});

type FormData = yup.InferType<typeof schema>;

export function Checkout() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Informations, 2: Paiement, 3: Confirmation
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      paymentMethod: 'cinetpay',
    },
  });

  const watchedPaymentMethod = watch('paymentMethod');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const shippingCost = getTotalPrice() >= 50000 ? 0 : 5000;
  const totalWithShipping = getTotalPrice() + shippingCost;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          subtotal: getTotalPrice(),
          shipping_amount: shippingCost,
          total_amount: totalWithShipping,
          currency: 'XAF',
          shipping_address: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
          },
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Ajouter les articles de commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Créer l'enregistrement de paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: data.paymentMethod,
          amount: totalWithShipping,
          currency: 'XAF',
          status: 'pending'
        });

      if (paymentError) throw paymentError;

      // Simuler le processus de paiement
      if (data.paymentMethod === 'cash_on_delivery') {
        // Paiement à la livraison - confirmation immédiate
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        await supabase
          .from('payments')
          .update({ status: 'pending' })
          .eq('order_id', order.id);

        toast.success('Commande confirmée ! Vous paierez à la livraison.');
      } else {
        // Autres méthodes de paiement - redirection vers la passerelle
        toast.success('Redirection vers la passerelle de paiement...');
      }

      // Vider le panier
      await clearCart();
      
      // Rediriger vers la page de confirmation
      navigate(`/orders`);

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.checkout')}</h1>

        {/* Indicateur d'étapes */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span>Informations</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span>Paiement</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Informations de livraison */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Truck className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Informations de livraison</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      {...register('address')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      {...register('postalCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Méthode de paiement</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cinetpay"
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cinetpay</span>
                        <img src="https://cinetpay.com/assets/img/logo.png" alt="Cinetpay" className="h-6" />
                      </div>
                      <p className="text-sm text-gray-600">Paiement mobile money, carte bancaire</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="paystack"
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Paystack</span>
                        <img src="https://paystack.com/assets/img/logo/blue.png" alt="Paystack" className="h-6" />
                      </div>
                      <p className="text-sm text-gray-600">Paiement par carte bancaire</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="mobile_money"
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium">Mobile Money</span>
                      <p className="text-sm text-gray-600">Orange Money, MTN Mobile Money</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cash_on_delivery"
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium">Paiement à la livraison</span>
                      <p className="text-sm text-gray-600">Payez en espèces lors de la réception</p>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Traitement en cours...' : 'Finaliser la commande'}
              </button>
            </form>
          </div>

          {/* Résumé de commande */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Résumé de commande</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                      alt={language === 'fr' ? item.product.name_fr : item.product.name_en}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {language === 'fr' ? item.product.name_fr : item.product.name_en}
                      </h4>
                      <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)} {t('common.currency')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(getTotalPrice())} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratuit</span>
                    ) : (
                      `${formatPrice(shippingCost)} ${t('common.currency')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatPrice(totalWithShipping)} {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Paiement sécurisé</span>
              </div>
              <p className="text-sm text-green-700">
                Vos informations de paiement sont protégées par un cryptage SSL de niveau bancaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
