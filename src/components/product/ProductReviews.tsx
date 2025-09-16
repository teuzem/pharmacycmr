import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, UserCircle, CheckCircle } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  is_verified_purchase: boolean;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: string]: number };
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_product_reviews_summary', { p_id: productId });
      if (summaryError) throw summaryError;
      if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }

      // Fetch reviews with profile information
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          is_verified_purchase,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as any[] || []);

    } catch (error) {
      console.error("Erreur lors du chargement des avis:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return <div className="py-8">Chargement des avis...</div>;
  }

  return (
    <div className="py-12 border-t">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Avis des clients</h2>
      
      {summary && summary.total_reviews > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Summary */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-5xl font-bold">{summary.average_rating.toFixed(1)}</p>
            <StarRating value={Math.round(summary.average_rating)} size={24} />
            <p className="text-gray-600">Basé sur {summary.total_reviews} avis</p>
          </div>

          {/* Distribution */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = summary.rating_distribution[star] || 0;
              const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">{star} étoiles</span>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          <p>Aucun avis pour ce produit pour le moment.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-8">
        {reviews.map(review => (
          <div key={review.id} className="flex space-x-4 border-b pb-6">
            <UserCircle className="h-10 w-10 text-gray-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{review.profiles?.first_name || 'Anonyme'}</p>
                  {review.is_verified_purchase && (
                    <span className="flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> Achat vérifié
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2 my-2">
                <StarRating value={review.rating} size={16} />
                <h4 className="font-semibold">{review.title}</h4>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {user && <ReviewForm productId={productId} onReviewSubmitted={loadReviews} />}
    </div>
  );
}
