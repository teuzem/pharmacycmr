import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Truck, Info, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { ImageGallery } from '../components/product/ImageGallery';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { StarRating } from '../components/ui/StarRating';
import { PrescriptionUploadModal } from '../components/product/PrescriptionUploadModal';
import { Skeleton } from '../components/ui/Skeleton';
import { AddToWishlistButton } from '../components/product/AddToWishlistButton';
import { AddToCompareButton } from '../components/product/AddToCompareButton';

type Product = Database['public']['Tables']['products']['Row'];
type SimilarProduct = Pick<Product, 'id' | 'slug' | 'name_fr' | 'name_en' | 'price' | 'images'>;

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [attachedPrescriptionId, setAttachedPrescriptionId] = useState<string | null>(null);

  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      loadProductData();
    }
  }, [slug]);

  const loadProductData = async () => {
    setLoading(true);
    setProduct(null);
    try {
      // Fetch main product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (productError) throw productError;
      setProduct(productData);

      // Fetch similar products
      if (productData.category_id) {
        const { data: similarData } = await supabase
          .from('products')
          .select('id, slug, name_fr, name_en, price, images')
          .eq('category_id', productData.category_id)
          .neq('id', productData.id)
          .limit(10);
        setSimilarProducts(similarData || []);
      }

      // Fetch frequently bought together
      const { data: boughtTogetherData } = await supabase.rpc('get_frequently_bought_together', { p_id: productData.id });
      if (boughtTogetherData && boughtTogetherData.length > 0) {
        const productIds = boughtTogetherData.map(p => p.product_id);
        const { data: freqProducts } = await supabase
          .from('products')
          .select('id, slug, name_fr, name_en, price, images')
          .in('id', productIds);
        setFrequentlyBought(freqProducts || []);
      }

    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      toast.error('Produit non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.requires_prescription && !attachedPrescriptionId) {
      toast.error("Une ordonnance est requise pour ce produit.");
      setIsPrescriptionModalOpen(true);
      return;
    }
    
    try {
      await addToCart(product.id, quantity, attachedPrescriptionId || undefined);
      toast.success(`${quantity} ${language === 'fr' ? product.name_fr : product.name_en} ajouté(s) au panier`);
      setAttachedPrescriptionId(null); // Reset after adding to cart
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  const handlePrescriptionUploadSuccess = (prescriptionId: string) => {
    setAttachedPrescriptionId(prescriptionId);
    toast.success("Ordonnance associée. Vous pouvez maintenant ajouter au panier.");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
        <Link to="/products" className="text-green-600 hover:text-green-700">Retourner aux produits</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/products" className="inline-flex items-center gap-2 hover:text-green-600">
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ImageGallery images={product.images} productName={language === 'fr' ? product.name_fr : product.name_en} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{language === 'fr' ? product.name_fr : product.name_en}</h1>

            <div className="flex items-center space-x-4">
              <StarRating value={4.5} />
              <a href="#reviews" className="text-sm text-gray-600 hover:underline">23 avis</a>
            </div>

            <div className="space-y-2">
              {product.compare_price && <span className="text-lg text-gray-500 line-through">{formatPrice(product.compare_price)} {t('common.currency')}</span>}
              <div className="text-4xl font-bold text-green-600">{formatPrice(product.price)} {t('common.currency')}</div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{language === 'fr' ? product.description_fr : product.description_en}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <AddToWishlistButton productId={product.id} />
              <AddToCompareButton product={product} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('products.manufacturer')}:</span><span className="font-medium">{product.manufacturer}</span></div>
              {product.dosage && <div className="flex justify-between"><span className="text-gray-600">{t('products.dosage')}:</span><span className="font-medium">{product.dosage}</span></div>}
              {product.active_ingredient && <div className="flex justify-between"><span className="text-gray-600">{t('products.active_ingredient')}:</span><span className="font-medium">{product.active_ingredient}</span></div>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-900">{t('common.quantity')}:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2" disabled={quantity <= 1}>-</button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="px-3 py-2" disabled={quantity >= product.stock_quantity}>+</button>
                </div>
              </div>

              {product.requires_prescription && (
                <div className={`p-3 rounded-lg flex items-center gap-3 ${attachedPrescriptionId ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{attachedPrescriptionId ? "Ordonnance associée" : "Ordonnance requise"}</p>
                    <p className="text-sm">{attachedPrescriptionId ? "Prêt à être ajouté au panier." : "Veuillez télécharger votre ordonnance."}</p>
                  </div>
                </div>
              )}
              
              {product.requires_prescription ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setIsPrescriptionModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                    <Upload className="h-5 w-5" />
                    {attachedPrescriptionId ? "Changer" : "Ordonnance"}
                  </button>
                  <button onClick={handleAddToCart} disabled={product.stock_quantity === 0} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
                    {product.stock_quantity === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
                  </button>
                </div>
              ) : (
                <button onClick={handleAddToCart} disabled={product.stock_quantity === 0} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
                  {product.stock_quantity === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
                </button>
              )}
            </div>

            <div className="border-t pt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600"><Truck className="h-5 w-5 text-green-600" /><span>Livraison rapide à Douala et Yaoundé</span></div>
              <div className="flex items-center gap-3 text-gray-600"><Shield className="h-5 w-5 text-green-600" /><span>Médicaments 100% authentiques</span></div>
            </div>
          </div>
        </div>

        <div id="reviews">
          <ProductReviews productId={product.id} />
        </div>

        <ProductCarousel title="Fréquemment achetés ensemble" products={frequentlyBought} />
        <ProductCarousel title="Produits similaires" products={similarProducts} />
      </div>

      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onUploadSuccess={handlePrescriptionUploadSuccess}
      />
    </div>
  );
}

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-6 w-48 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="aspect-square w-full" />
        <div className="grid grid-cols-5 gap-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// Helper type from Database definition
type Database = import('../lib/supabase').Database;
