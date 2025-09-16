import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';

export function Footer() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('company.name')}</h3>
            <p className="text-gray-300 text-sm">
              {t('company.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <div className="space-y-2">
              <Link to="/products" className="block text-gray-300 hover:text-white text-sm">
                {t('nav.products')}
              </Link>
              <Link to="/prescriptions" className="block text-gray-300 hover:text-white text-sm">
                {t('nav.prescriptions')}
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-white text-sm">
                À propos
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Catégories</h3>
            <div className="space-y-2">
              <Link to="/products?category=prescription" className="block text-gray-300 hover:text-white text-sm">
                Médicaments sur ordonnance
              </Link>
              <Link to="/products?category=over-counter" className="block text-gray-300 hover:text-white text-sm">
                Vente libre
              </Link>
              <Link to="/products?category=vitamins" className="block text-gray-300 hover:text-white text-sm">
                Vitamines & Suppléments
              </Link>
              <Link to="/products?category=medical-equipment" className="block text-gray-300 hover:text-white text-sm">
                Matériel médical
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-gray-300 text-sm">+237 6XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="text-gray-300 text-sm">contact@pharmaconnect.cm</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Douala, Cameroun<br />
                  BP: 1234 Douala
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 {t('company.name')}. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-300 hover:text-white text-sm">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white text-sm">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
