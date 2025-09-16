import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'] & {
  products: Product | null;
};
type Wishlist = Database['public']['Tables']['wishlists']['Row'] & {
  wishlist_items: WishlistItem[];
};

interface WishlistContextType {
  wishlists: Wishlist[];
  loading: boolean;
  addToWishlist: (productId: string, wishlistId: string) => Promise<void>;
  removeFromWishlist: (productId: string, wishlistId: string) => Promise<void>;
  createWishlist: (name: string, isPublic?: boolean) => Promise<void>;
  isProductInWishlist: (productId: string) => boolean;
  refreshWishlists: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlists = async () => {
    if (!user) {
      setWishlists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, wishlist_items(*, products(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlists(data as any[] || []);
    } catch (error) {
      console.error('Erreur lors du chargement des listes de souhaits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, [user]);

  const addToWishlist = async (productId: string, wishlistId: string) => {
    if (!user) {
      toast.error('Veuillez vous connecter.');
      return;
    }
    try {
      const { error } = await supabase.from('wishlist_items').insert({
        wishlist_id: wishlistId,
        product_id: productId,
        user_id: user.id,
      });
      if (error) throw error;
      toast.success('Ajouté à la liste de souhaits !');
      await fetchWishlists();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout.");
    }
  };

  const removeFromWishlist = async (productId: string, wishlistId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId)
        .eq('wishlist_id', wishlistId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Retiré de la liste de souhaits.');
      await fetchWishlists();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression.');
    }
  };

  const createWishlist = async (name: string, isPublic: boolean = false) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('wishlists').insert({
        user_id: user.id,
        name,
        is_public: isPublic,
      });
      if (error) throw error;
      toast.success(`Liste "${name}" créée.`);
      await fetchWishlists();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création.');
    }
  };

  const isProductInWishlist = (productId: string): boolean => {
    return wishlists.some(list => list.wishlist_items.some(item => item.product_id === productId));
  };

  const value = {
    wishlists,
    loading,
    addToWishlist,
    removeFromWishlist,
    createWishlist,
    isProductInWishlist,
    refreshWishlists: fetchWishlists,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
