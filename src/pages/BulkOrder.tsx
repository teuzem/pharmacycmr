import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, ShoppingCart, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface CsvRow {
  sku: string;
  quantity: number;
}

interface ParsedProduct extends CsvRow {
  product_id?: string;
  name_fr?: string;
  price?: number;
  stock_quantity?: number;
  status: 'found' | 'not_found' | 'out_of_stock';
}

export function BulkOrder() {
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    setParsedProducts([]);
    const file = acceptedFiles[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as CsvRow[];
        const skus = rows.map(row => row.sku).filter(Boolean);

        if (skus.length === 0) {
          toast.error("Le fichier CSV est vide ou ne contient pas de colonne 'sku'.");
          setLoading(false);
          return;
        }

        try {
          // Rechercher les produits dans la base de données par SKU
          const { data: productsData, error } = await supabase
            .from('products')
            .select('id, sku, name_fr, price, stock_quantity')
            .in('sku', skus);

          if (error) throw error;

          const validatedProducts: ParsedProduct[] = rows.map(row => {
            const productInfo = productsData.find(p => p.sku === row.sku);
            const quantity = Number(row.quantity);

            if (!productInfo) {
              return { ...row, quantity, status: 'not_found' };
            }
            if (productInfo.stock_quantity < quantity) {
              return { ...row, quantity, product_id: productInfo.id, name_fr: productInfo.name_fr, price: productInfo.price, stock_quantity: productInfo.stock_quantity, status: 'out_of_stock' };
            }
            return { ...row, quantity, product_id: productInfo.id, name_fr: productInfo.name_fr, price: productInfo.price, stock_quantity: productInfo.stock_quantity, status: 'found' };
          });

          setParsedProducts(validatedProducts);
        } catch (dbError) {
          console.error("Erreur de base de données:", dbError);
          toast.error("Erreur lors de la vérification des produits.");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        toast.error("Erreur lors de la lecture du fichier CSV.");
        setLoading(false);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: loading,
  });

  const handleAddAllToCart = async () => {
    const validProducts = parsedProducts.filter(p => p.status === 'found');
    if (validProducts.length === 0) {
      toast.error("Aucun produit valide à ajouter au panier.");
      return;
    }

    setLoading(true);
    try {
      for (const product of validProducts) {
        if (product.product_id) {
          await addToCart(product.product_id, product.quantity);
        }
      }
      toast.success(`${validProducts.length} type(s) de produit(s) ajouté(s) au panier !`);
      setParsedProducts([]);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (product: ParsedProduct) => {
    switch (product.status) {
      case 'found':
        return <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Prêt</span>;
      case 'not_found':
        return <span className="flex items-center text-red-600"><AlertCircle className="h-4 w-4 mr-1" /> SKU non trouvé</span>;
      case 'out_of_stock':
        return <span className="flex items-center text-yellow-600"><AlertCircle className="h-4 w-4 mr-1" /> Stock insuffisant ({product.stock_quantity} dispo.)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Groupée par CSV</h1>
        <p className="text-gray-600 mb-8">Téléchargez un fichier CSV pour ajouter rapidement plusieurs produits à votre panier.</p>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Télécharger votre fichier</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-green-600">
                {loading ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div> : <Upload className="h-12 w-12 mx-auto" />}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{loading ? 'Analyse en cours...' : 'Déposez votre fichier CSV ici'}</p>
                <p className="text-gray-600">ou cliquez pour sélectionner</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">Format du fichier CSV :</p>
            <p>Votre fichier doit contenir au moins deux colonnes : <code>sku</code> et <code>quantity</code>.</p>
            <a href="/sample-bulk-order.csv" download className="text-green-600 hover:underline font-medium mt-2 inline-block">Télécharger un exemple de fichier</a>
          </div>
        </div>

        {parsedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">2. Vérifier les produits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Nom du produit</th>
                    <th className="px-4 py-2">Quantité</th>
                    <th className="px-4 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProducts.map((p, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono">{p.sku}</td>
                      <td className="px-4 py-2">{p.name_fr || '-'}</td>
                      <td className="px-4 py-2">{p.quantity}</td>
                      <td className="px-4 py-2">{renderStatus(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setParsedProducts([])}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleAddAllToCart}
                disabled={loading || parsedProducts.every(p => p.status !== 'found')}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Ajouter les produits valides au panier</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
