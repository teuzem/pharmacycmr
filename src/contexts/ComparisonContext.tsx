import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface ComparisonContextType {
  productsToCompare: Product[];
  addProductToCompare: (product: Product) => void;
  removeProductFromCompare: (productId: string) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARE_PRODUCTS = 4;

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [productsToCompare, setProductsToCompare] = useState<Product[]>(() => {
    const saved = localStorage.getItem('comparison_products');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparison_products', JSON.stringify(productsToCompare));
  }, [productsToCompare]);

  const addProductToCompare = (product: Product) => {
    setProductsToCompare(prev => {
      if (prev.find(p => p.id === product.id)) {
        toast.error('Ce produit est déjà dans le comparateur.');
        return prev;
      }
      if (prev.length >= MAX_COMPARE_PRODUCTS) {
        toast.error(`Vous ne pouvez comparer que ${MAX_COMPARE_PRODUCTS} produits à la fois.`);
        return prev;
      }
      toast.success(`${product.name_fr} ajouté au comparateur.`);
      return [...prev, product];
    });
  };

  const removeProductFromCompare = (productId: string) => {
    setProductsToCompare(prev => prev.filter(p => p.id !== productId));
    toast.success('Produit retiré du comparateur.');
  };

  const clearComparison = () => {
    setProductsToCompare([]);
  };

  const value = {
    productsToCompare,
    addProductToCompare,
    removeProductFromCompare,
    clearComparison,
  };

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
