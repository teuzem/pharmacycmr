import React from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ComparisonBar() {
  const { productsToCompare, removeProductFromCompare, clearComparison } = useComparison();

  if (productsToCompare.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-40"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-lg hidden md:block">Comparer les produits</h3>
              <div className="flex items-center space-x-2">
                {productsToCompare.map(product => (
                  <div key={product.id} className="relative group">
                    <img
                      src={product.images[0]}
                      alt={product.name_fr}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeProductFromCompare(product.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={clearComparison} className="text-sm text-gray-300 hover:underline">
                Vider
              </button>
              <Link
                to="/compare"
                className="flex items-center space-x-2 bg-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                <GitCompare className="h-5 w-5" />
                <span>Comparer ({productsToCompare.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
