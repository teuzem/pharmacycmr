import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from '../../components/admin/ProductForm';
import toast from 'react-hot-toast';

type Product = import('../../lib/supabase').Database['public']['Tables']['products']['Row'];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*').order('name_fr', { ascending: true });
      if (searchTerm) {
        query = query.or(`name_fr.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchProducts();
  }

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh list after modal closes
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
        toast.success("Produit supprimé avec succès.");
        fetchProducts();
      } catch (error) {
        toast.error("Erreur lors de la suppression du produit.");
        console.error("Delete error:", error);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un produit</span>
        </button>
      </div>
      
      <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-md">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou SKU..."
                className="w-full px-4 py-2 pr-10 border rounded-lg"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search className="h-5 w-5"/>
              </button>
          </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-4 font-medium">Produit</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8">Chargement...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8">Aucun produit trouvé.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={product.images?.[0]} alt={product.name_fr} className="h-10 w-10 object-cover rounded"/>
                      <span>{product.name_fr}</span>
                    </td>
                    <td className="p-4 font-mono">{product.sku}</td>
                    <td className="p-4">{formatPrice(product.price)} FCFA</td>
                    <td className="p-4">{product.stock_quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        size="xl"
      >
        <ProductForm initialData={editingProduct} onFormSubmit={handleCloseModal} />
      </Modal>
    </div>
  );
}
