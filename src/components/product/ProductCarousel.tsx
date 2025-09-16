import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../lib/i18n';

interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  price: number;
  images: string[];
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/products/${product.slug}`}>
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                    alt={language === 'fr' ? product.name_fr : product.name_en}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-2">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-green-600 line-clamp-2">
                    {language === 'fr' ? product.name_fr : product.name_en}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.price)} {t('common.currency')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
