import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type Prescription = import('../../lib/supabase').Database['public']['Tables']['prescriptions']['Row'] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

interface PrescriptionDetailModalProps {
  prescription: Prescription;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function PrescriptionDetailModal({ prescription, isOpen, onClose, onUpdate }: PrescriptionDetailModalProps) {
  const [notes, setNotes] = useState(prescription.pharmacist_notes || '');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: 'verified' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({
          status: newStatus,
          pharmacist_notes: notes,
        })
        .eq('id', prescription.id);

      if (error) throw error;
      
      toast.success(`Ordonnance ${newStatus === 'verified' ? 'approuvée' : 'rejetée'}.`);
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du statut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ordonnance de ${prescription.profiles?.first_name}`} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prescription Viewer */}
        <div className="h-[60vh] bg-gray-100 rounded-lg overflow-hidden">
          {prescription.file_type === 'pdf' ? (
            <iframe src={prescription.file_url} className="w-full h-full" title="Ordonnance PDF" />
          ) : (
            <img src={prescription.file_url} alt="Ordonnance" className="w-full h-full object-contain" />
          )}
        </div>

        {/* Details and Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Détails</h3>
            <div className="text-sm space-y-1 mt-2">
              <p><strong>Client:</strong> {prescription.profiles?.first_name} {prescription.profiles?.last_name}</p>
              <p><strong>Email:</strong> {prescription.profiles?.email}</p>
              <p><strong>Médecin:</strong> {prescription.doctor_name}</p>
              <p><strong>Date Ordonnance:</strong> {new Date(prescription.prescription_date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="pharmacist_notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes du pharmacien (visible par le client)
            </label>
            <textarea
              id="pharmacist_notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ajouter des notes sur la validité, les produits, etc."
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-lg">Actions</h3>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleStatusUpdate('verified')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Approuver
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
