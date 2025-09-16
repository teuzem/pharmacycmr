import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, Calendar, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import toast from 'react-hot-toast';

const schema = yup.object({
  firstName: yup.string().required('Prénom requis'),
  lastName: yup.string().required('Nom requis'),
  phone: yup.string().nullable(),
  dateOfBirth: yup.string().nullable(),
});

type FormData = yup.InferType<typeof schema>;

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation(language);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.date_of_birth || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        date_of_birth: data.dateOfBirth || null,
        preferred_language: language,
      });
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.date_of_birth || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* En-tête */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                  <p className="text-gray-600">Gérez vos informations personnelles</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations de base */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.first_name')}
                    </label>
                    {isEditing ? (
                      <input
                        {...register('firstName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {profile?.first_name || 'Non renseigné'}
                      </div>
                    )}
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.last_name')}
                    </label>
                    {isEditing ? (
                      <input
                        {...register('lastName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {profile?.last_name || 'Non renseigné'}
                      </div>
                    )}
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      {t('auth.email')}
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                      {user?.email}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {t('auth.phone')}
                    </label>
                    {isEditing ? (
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+237 6XX XXX XXX"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {profile?.phone || 'Non renseigné'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date de naissance
                  </label>
                  {isEditing ? (
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg w-full md:w-1/2">
                      {profile?.date_of_birth ? 
                        new Date(profile.date_of_birth).toLocaleDateString('fr-FR') : 
                        'Non renseigné'
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Préférences */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue préférée
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={!isEditing}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg w-full md:w-1/2">
                    <span className="capitalize">
                      {profile?.role === 'customer' && 'Client'}
                      {profile?.role === 'pharmacist' && 'Pharmacien'}
                      {profile?.role === 'admin' && 'Administrateur'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              {isEditing && (
                <div className="flex items-center space-x-4 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
