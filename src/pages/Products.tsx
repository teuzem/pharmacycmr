import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, ShoppingCart } from 'lucide-react';
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
  slug: string;
  price: number;
  compare_price: number | null;
  images: string[];
  requires_prescription: boolean;
  stock_quantity: number;
  manufacturer: string;
  type: string;
}

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  slug: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadData();
    
    // Gérer les paramètres d'URL
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedType, sortBy]);

  const loadData = async () => {
    try {
      // Charger les catégories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      // Charger tous les produits actifs
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      setCategories(cats || []);
      setProducts(prods || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Filtrer par recherche
      if (searchTerm) {
        query = query.or(`name_fr.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,description_fr.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%`);
      }

      // Filtrer par catégorie
      if (selectedCategory) {
        const category = categories.find(cat => cat.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Filtrer par type
      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      // Trier
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name_fr', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('products.title')}</h1>
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {language === 'fr' ? category.name_fr : category.name_en}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les types</option>
              <option value="prescription">Sur ordonnance</option>
              <option value="over_counter">Vente libre</option>
              <option value="supplement">Complément</option>
              <option value="medical_device">Matériel médical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Nom A-Z</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="newest">Plus récents</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
                setSortBy('name');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille de produits */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/products/${product.slug}`}>
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                    alt={language === 'fr' ? product.name_fr : product.name_en}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4 space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  {product.requires_prescription && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {t('products.prescription_required')}
                    </span>
                  )}
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Stock faible
                    </span>
                  )}
                </div>

                <Link to={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-green-600 line-clamp-2">
                    {language === 'fr' ? product.name_fr : product.name_en}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {language === 'fr' ? product.description_fr : product.description_en}
                </p>

                {product.manufacturer && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">{t('products.manufacturer')}:</span> {product.manufacturer}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {product.compare_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_price)} {t('common.currency')}
                      </span>
                    )}
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(product.price)} {t('common.currency')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock_quantity === 0}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {product.stock_quantity === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
