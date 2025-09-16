import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, Check, X, Eye } from 'lucide-react';
import { PrescriptionDetailModal } from '../../components/admin/PrescriptionDetailModal';

type Prescription = import('../../lib/supabase').Database['public']['Tables']['prescriptions']['Row'] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, [filter]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          profiles (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des ordonnances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    loadPrescriptions();
    setSelectedPrescription(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestion des Ordonnances</h1>
      
      <div className="flex items-center space-x-2 mb-6 border-b">
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm font-medium ${filter === 'pending' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>En attente</button>
        <button onClick={() => setFilter('verified')} className={`px-4 py-2 text-sm font-medium ${filter === 'verified' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Vérifiées</button>
        <button onClick={() => setFilter('rejected')} className={`px-4 py-2 text-sm font-medium ${filter === 'rejected' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Rejetées</button>
        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Toutes</button>
      </div>

      {loading ? (
        <div className="text-center py-16">Chargement...</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 text-gray-600">Aucune ordonnance dans cette catégorie.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Médecin</th>
                  <th className="p-4 font-medium">Date Ordonnance</th>
                  <th className="p-4 font-medium">Date Soumission</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>{p.profiles?.first_name} {p.profiles?.last_name}</div>
                      <div className="text-xs text-gray-500">{p.profiles?.email}</div>
                    </td>
                    <td className="p-4">{p.doctor_name}</td>
                    <td className="p-4">{formatDate(p.prescription_date)}</td>
                    <td className="p-4">{formatDate(p.created_at)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedPrescription(p)} className="flex items-center space-x-1 text-green-600 hover:text-green-800">
                        <Eye className="h-4 w-4" />
                        <span>Vérifier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
