import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Upload } from 'lucide-react';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (prescriptionId: string) => void;
}

const schema = yup.object({
  doctor_name: yup.string().required("Le nom du médecin est requis"),
  prescription_date: yup.string().required("La date de l'ordonnance est requise"),
  doctor_phone: yup.string().optional(),
  file: yup.mixed<File>().required("Un fichier est requis"),
});

type FormData = yup.InferType<typeof schema>;

export function PrescriptionUploadModal({ isOpen, onClose, onUploadSuccess }: PrescriptionUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const file = watch('file');

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setValue('file', acceptedFiles[0], { shouldValidate: true });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }
    setUploading(true);
    try {
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${user.id}/prescriptions/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, data.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('prescriptions').getPublicUrl(fileName);

      const { data: prescriptionData, error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          doctor_name: data.doctor_name,
          prescription_date: data.prescription_date,
          doctor_phone: data.doctor_phone,
          file_url: urlData.publicUrl,
          file_type: data.file.type.startsWith('image/') ? 'image' : 'pdf',
          status: 'pending',
        })
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      
      toast.success("Ordonnance téléchargée avec succès !");
      onUploadSuccess(prescriptionData.id);
      onClose();

    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement de l'ordonnance.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Télécharger une ordonnance">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du médecin *</label>
            <input {...register('doctor_name')} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            {errors.doctor_name && <p className="text-sm text-red-600 mt-1">{errors.doctor_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'ordonnance *</label>
            <input {...register('prescription_date')} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            {errors.prescription_date && <p className="text-sm text-red-600 mt-1">{errors.prescription_date.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fichier de l'ordonnance *</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            {file ? (
              <p className="text-sm text-gray-700">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-600">Glissez-déposez un fichier ici, ou cliquez pour sélectionner</p>
            )}
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (max. 10MB)</p>
          </div>
          {errors.file && <p className="text-sm text-red-600 mt-1">{errors.file.message}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Annuler</button>
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
            {uploading ? 'Téléchargement...' : 'Télécharger et Valider'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
