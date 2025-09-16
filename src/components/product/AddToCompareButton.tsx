import React from 'react';
import { GitCompare } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { Database } from '../../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface AddToCompareButtonProps {
  product: Product;
}

export function AddToCompareButton({ product }: AddToCompareButtonProps) {
  const { addProductToCompare } = useComparison();

  return (
    <button
      onClick={() => addProductToCompare(product)}
      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600"
    >
      <GitCompare className="h-4 w-4" />
      <span>Comparer</span>
    </button>
  );
}
