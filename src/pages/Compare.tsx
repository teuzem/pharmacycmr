import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';
import { Star, X, GitCompare } from 'lucide-react';

export function Compare() {
  const { productsToCompare, removeProductFromCompare, clearComparison } = useComparison();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(price);
  };

  const features = [
    { key: 'price', label: 'Prix' },
    { key: 'manufacturer', label: 'Fabricant' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'active_ingredient', label: 'Principe Actif' },
    { key: 'requires_prescription', label: 'Ordonnance Requise' },
  ];

  if (productsToCompare.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GitCompare className="h-24 w-24 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Aucun produit à comparer</h1>
        <p className="text-gray-600 mb-6">Ajoutez des produits à la liste de comparaison pour les voir ici.</p>
        <Link to="/products" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
          Parcourir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Comparer les produits</h1>
        <button onClick={clearComparison} className="text-sm text-red-600 hover:underline">
          Vider la comparaison
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-4 w-1/5">Caractéristiques</th>
              {productsToCompare.map(product => (
                <th key={product.id} className="border p-4 relative">
                  <button
                    onClick={() => removeProductFromCompare(product.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <Link to={`/products/${product.slug}`}>
                    <img src={product.images[0]} alt={product.name_fr} className="h-32 w-32 object-cover mx-auto mb-2 rounded" />
                    <p className="font-semibold text-green-600">{product.name_fr}</p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr key={feature.key}>
                <td className="border p-4 font-semibold bg-gray-50">{feature.label}</td>
                {productsToCompare.map(product => (
                  <td key={product.id} className="border p-4 text-center">
                    {feature.key === 'price'
                      ? `${formatPrice(product[feature.key])} FCFA`
                      : typeof product[feature.key as keyof typeof product] === 'boolean'
                      ? (product[feature.key as keyof typeof product] ? 'Oui' : 'Non')
                      : String(product[feature.key as keyof typeof product] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
