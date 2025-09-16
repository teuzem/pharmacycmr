import React from 'react';
import { Shield, Truck, Clock, Users } from 'lucide-react';

export function About() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À Propos de PharmaConnect Cameroun</h1>
          <p className="text-xl text-gray-600">
            Votre santé, notre priorité. La pharmacie en ligne qui vous rapproche de vos médicaments.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Notre équipe" 
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Notre Mission</h2>
            <p className="text-gray-700">
              Chez PharmaConnect, notre mission est de rendre l'accès aux médicaments et aux produits de santé plus simple, plus rapide et plus sûr pour tous les Camerounais. Nous combinons la technologie et l'expertise pharmaceutique pour offrir un service de confiance, directement accessible depuis chez vous.
            </p>
            <p className="text-gray-700">
              Nous nous engageons à fournir uniquement des produits authentiques provenant de fournisseurs agréés, tout en garantissant une confidentialité totale et une expérience client exceptionnelle.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Engagements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Authenticité Garantie</h3>
              <p className="text-gray-600">Produits 100% authentiques et certifiés.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Livraison Rapide</h3>
              <p className="text-gray-600">Livraison à domicile sur tout le territoire national.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Conseils de Pharmaciens</h3>
              <p className="text-gray-600">Nos experts sont à votre écoute pour vous conseiller.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Disponibilité 24/7</h3>
              <p className="text-gray-600">Commandez à tout moment, où que vous soyez.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
