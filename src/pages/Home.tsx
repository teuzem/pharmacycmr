import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Clock, Star, Upload, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price: number;
  images: string[];
  requires_prescription: boolean;
  stock_quantity: number;
}

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  slug: string;
  image_url: string;
}

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { addToCart } = useCart();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Charger les produits vedettes
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(8);

      // Charger les catégories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .limit(6);

      setFeaturedProducts(products || []);
      setCategories(cats || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {t('company.name')}
              </h1>
              <p className="text-xl lg:text-2xl text-green-100">
                {t('company.tagline')}
              </p>
              <p className="text-lg text-green-100">
                {t('company.description')}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Commander maintenant</span>
                </Link>
                <Link
                  to="/prescriptions"
                  className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Télécharger ordonnance</span>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Pharmacie"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Médicaments authentiques</h3>
              <p className="text-gray-600">
                Tous nos médicaments sont authentiques et certifiés par les autorités sanitaires camerounaises.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Livraison rapide</h3>
              <p className="text-gray-600">
                Livraison gratuite dans Douala et Yaoundé en 24h. Autres villes en 48-72h.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Service 24/7</h3>
              <p className="text-gray-600">
                Notre équipe est disponible 24h/24 pour répondre à vos questions et urgences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Catégories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre large gamme de produits pharmaceutiques organisés par catégories pour faciliter votre recherche.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={language === 'fr' ? category.name_fr : category.name_en}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                    {language === 'fr' ? category.name_fr : category.name_en}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('products.featured')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos produits les plus populaires et les plus recommandés par nos pharmaciens.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                    alt={language === 'fr' ? product.name_fr : product.name_en}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  {product.requires_prescription && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {t('products.prescription_required')}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {language === 'fr' ? product.name_fr : product.name_en}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {language === 'fr' ? product.description_fr : product.description_en}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(product.price)} {t('common.currency')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock_quantity === 0}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {product.stock_quantity === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Voir tous les produits</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'aide pour votre commande ?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Nos pharmaciens sont disponibles pour vous conseiller et répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="tel:+2376XXXXXXX"
              className="inline-flex items-center space-x-2 bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Appeler maintenant</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              <span>Nous contacter</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
