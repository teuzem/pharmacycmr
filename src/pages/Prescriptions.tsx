import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Check, X, Clock, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import toast from 'react-hot-toast';

interface Prescription {
  id: string;
  doctor_name: string;
  doctor_phone: string;
  prescription_date: string;
  file_url: string;
  file_type: string;
  extracted_text: string | null;
  status: string;
  pharmacist_notes: string | null;
  created_at: string;
}

export function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState('');
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  useEffect(() => {
    if (user) {
      loadPrescriptions();
    }
  }, [user]);

  const loadPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ordonnances:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    if (!doctorName || !prescriptionDate) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setUploading(true);

    try {
      // Upload du fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      // Déterminer le type de fichier
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      // Insérer l'ordonnance dans la base
      const { error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          doctor_name: doctorName,
          doctor_phone: doctorPhone,
          prescription_date: prescriptionDate,
          file_url: urlData.publicUrl,
          file_type: fileType,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Ordonnance téléchargée avec succès !');
      setShowUploadForm(false);
      setDoctorName('');
      setDoctorPhone('');
      setPrescriptionDate('');
      loadPrescriptions();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de l\'ordonnance');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Vérifiée';
      case 'rejected':
        return 'Rejetée';
      case 'processing':
        return 'En cours de traitement';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('prescriptions.title')}</h1>
            <p className="text-gray-600 mt-2">
              Téléchargez et gérez vos ordonnances médicales
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>{t('prescriptions.upload')}</span>
          </button>
        </div>

        {/* Formulaire de téléchargement */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Télécharger une nouvelle ordonnance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du médecin *
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dr. Jean Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone du médecin
                </label>
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'ordonnance *
                </label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Zone de drop */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="text-green-600">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  ) : (
                    <Upload className="h-12 w-12 mx-auto" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {uploading ? 'Téléchargement en cours...' : 'Déposez votre ordonnance ici'}
                  </p>
                  <p className="text-gray-600">
                    {uploading ? 'Veuillez patienter...' : 'ou cliquez pour sélectionner un fichier'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Formats acceptés: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des ordonnances */}
        {prescriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <FileText className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aucune ordonnance pour le moment
            </h2>
            <p className="text-gray-600">
              Téléchargez votre première ordonnance pour commencer à commander vos médicaments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {prescription.file_type === 'image' ? (
                        <Image className="h-8 w-8 text-blue-500" />
                      ) : (
                        <FileText className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {prescription.doctor_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                          {getStatusText(prescription.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Date de l'ordonnance: {formatDate(prescription.prescription_date)}</div>
                        {prescription.doctor_phone && (
                          <div>Téléphone: {prescription.doctor_phone}</div>
                        )}
                        <div>Téléchargé le: {formatDate(prescription.created_at)}</div>
                      </div>
                      
                      {prescription.pharmacist_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">Notes du pharmacien:</p>
                          <p className="text-sm text-gray-700">{prescription.pharmacist_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(prescription.status)}
                    <button
                      onClick={() => window.open(prescription.file_url, '_blank')}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
