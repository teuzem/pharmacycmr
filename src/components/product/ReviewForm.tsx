import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { StarRating } from '../ui/StarRating';
import { Camera, Send } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const schema = yup.object({
  rating: yup.number().min(1, 'La note est requise').required(),
  title: yup.string().max(100, 'Le titre ne doit pas dépasser 100 caractères').optional(),
  comment: yup.string().max(1000, 'Le commentaire ne doit pas dépasser 1000 caractères').optional(),
});

type FormData = yup.InferType<typeof schema>;

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { rating: 0 }
  });

  const rating = watch('rating');

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Vous devez être connecté pour laisser un avis.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });

      if (error) throw error;

      toast.success("Avis soumis avec succès !");
      onReviewSubmitted();
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis:", error);
      toast.error("Erreur lors de la soumission de l'avis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mt-8">
      <h3 className="text-xl font-semibold mb-4">Laisser un avis</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Votre note *</label>
          <StarRating
            value={rating}
            onChange={(newRating) => setValue('rating', newRating, { shouldValidate: true })}
            isEditable
            size={28}
          />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre de l'avis</label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Ex: Excellent produit !"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Votre commentaire</label>
          <textarea
            {...register('comment')}
            id="comment"
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Parlez-nous de votre expérience avec ce produit..."
          ></textarea>
          {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
        </div>
        
        {/*
        <div className="flex items-center space-x-4">
          <button type="button" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600">
            <Camera className="h-5 w-5" />
            <span>Ajouter photo/vidéo</span>
          </button>
        </div>
        */}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>{loading ? "Envoi en cours..." : "Envoyer l'avis"}</span>
        </button>
      </form>
    </div>
  );
}
