import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Upload, Trash2 } from 'lucide-react';

type Product = import('../../lib/supabase').Database['public']['Tables']['products']['Row'];
type Category = import('../../lib/supabase').Database['public']['Tables']['categories']['Row'];

interface ProductFormProps {
  initialData?: Product | null;
  onFormSubmit: () => void;
}

const schema = yup.object({
  name_fr: yup.string().required("Nom (FR) est requis"),
  name_en: yup.string().required("Nom (EN) est requis"),
  slug: yup.string().required("Slug est requis").matches(/^[a-z0-9-]+$/, "Slug ne doit contenir que des minuscules, chiffres et tirets"),
  sku: yup.string().required("SKU est requis"),
  description_fr: yup.string().nullable(),
  description_en: yup.string().nullable(),
  price: yup.number().typeError("Le prix doit être un nombre").positive("Le prix doit être positif").required("Prix requis"),
  compare_price: yup.number().typeError("Le prix doit être un nombre").positive("Le prix doit être positif").nullable(),
  stock_quantity: yup.number().integer("Le stock doit être un entier").min(0).required("Stock requis"),
  category_id: yup.string().nullable(),
  is_active: yup.boolean().required(),
  requires_prescription: yup.boolean().required(),
  images: yup.array().of(yup.string().required()).min(1, "Au moins une image est requise"),
  manufacturer: yup.string().nullable(),
  dosage: yup.string().nullable(),
  active_ingredient: yup.string().nullable(),
  type: yup.string().oneOf(["prescription", "over_counter", "medical_device", "supplement"]).required("Type requis"),
});

type FormData = yup.InferType<typeof schema>;

export function ProductForm({ initialData, onFormSubmit }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_active: true,
      requires_prescription: false,
      images: [],
      ...initialData,
    }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
    reset({ ...initialData, is_active: initialData?.is_active ?? true, requires_prescription: initialData?.requires_prescription ?? false, images: initialData?.images ?? [] });
  }, [initialData, reset]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const fileName = `products/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('prescriptions').upload(fileName, file); // Assuming 'prescriptions' bucket is public
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('prescriptions').getPublicUrl(fileName);
        append(urlData.publicUrl);
      }
    } catch (error) {
      toast.error("Erreur lors du téléversement de l'image.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const productData = { ...data };
      
      let response;
      if (initialData) {
        // Update
        response = await supabase.from('products').update(productData).eq('id', initialData.id);
      } else {
        // Insert
        response = await supabase.from('products').insert(productData);
      }

      if (response.error) throw response.error;
      
      toast.success(`Produit ${initialData ? 'mis à jour' : 'créé'} avec succès !`);
      onFormSubmit();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Nom (FR)" name="name_fr" register={register} error={errors.name_fr} />
        <InputField label="Nom (EN)" name="name_en" register={register} error={errors.name_en} />
        <InputField label="Slug" name="slug" register={register} error={errors.slug} />
        <InputField label="SKU" name="sku" register={register} error={errors.sku} />
      </div>

      <TextAreaField label="Description (FR)" name="description_fr" register={register} />
      <TextAreaField label="Description (EN)" name="description_en" register={register} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Prix" name="price" type="number" register={register} error={errors.price} />
        <InputField label="Prix Comparé" name="compare_price" type="number" register={register} />
        <InputField label="Stock" name="stock_quantity" type="number" register={register} error={errors.stock_quantity} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Catégorie" name="category_id" register={register} options={categories.map(c => ({ value: c.id, label: c.name_fr }))} />
        <SelectField label="Type" name="type" register={register} error={errors.type} options={[
            {value: "over_counter", label: "Vente Libre"},
            {value: "prescription", label: "Sur Ordonnance"},
            {value: "supplement", label: "Complément"},
            {value: "medical_device", label: "Matériel Médical"},
        ]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Fabricant" name="manufacturer" register={register} />
        <InputField label="Dosage" name="dosage" register={register} />
        <InputField label="Principe Actif" name="active_ingredient" register={register} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {fields.map((field, index) => (
            <div key={field.id} className="relative group">
              <img src={field.value} alt={`Product image ${index+1}`} className="h-24 w-full object-cover rounded"/>
              <button type="button" onClick={() => remove(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>Téléverser des images</span>
          <input type="file" multiple onChange={(e) => handleImageUpload(e.target.files)} className="hidden" />
        </label>
        {errors.images && <p className="text-sm text-red-600 mt-1">{errors.images.message}</p>}
      </div>

      <div className="flex items-center space-x-8">
        <CheckboxField label="Actif" name="is_active" register={register} />
        <CheckboxField label="Ordonnance Requise" name="requires_prescription" register={register} />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onFormSubmit} className="px-4 py-2 border rounded-lg">Annuler</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  );
}

// Helper components for form fields
const InputField = ({ label, name, register, error, type = 'text' }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...register(name)} type={type} className={`mt-1 w-full px-3 py-2 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`} />
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const TextAreaField = ({ label, name, register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...register(name)} rows={3} className={`mt-1 w-full px-3 py-2 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`} />
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const SelectField = ({ label, name, register, options, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select {...register(name)} className={`mt-1 w-full px-3 py-2 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}>
      <option value="">Sélectionner...</option>
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const CheckboxField = ({ label, name, register }: any) => (
  <div className="flex items-center">
    <input {...register(name)} type="checkbox" className="h-4 w-4 text-green-600 border-gray-300 rounded" />
    <label className="ml-2 block text-sm text-gray-900">{label}</label>
  </div>
);
