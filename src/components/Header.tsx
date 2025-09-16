import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, LogOut, Globe, X, Pill, LayoutDashboard, FileUp, ShoppingBasket, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const isAdminOrPharmacist = profile?.role === 'admin' || profile?.role === 'pharmacist';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center space-x-4">
            <span>📞 +237 6XX XXX XXX</span>
            <span>📧 contact@pharmaconnect.cm</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-1 hover:text-green-600"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'fr' ? 'FR' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('company.name')}</h1>
              <p className="text-xs text-gray-600 hidden sm:block">{t('company.tagline')}</p>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search')}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
                    <User className="h-6 w-6" />
                    <span className="hidden md:block font-medium">{profile.first_name || user.email}</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="bg-white rounded-lg shadow-lg border p-2 mt-2 w-56"
                    sideOffset={5}
                  >
                    <DropdownMenu.Label className="px-2 py-1 text-sm text-gray-500">Mon Compte</DropdownMenu.Label>
                    <DropdownMenu.Item asChild>
                      <Link to="/profile" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-green-600 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/orders" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-green-600 cursor-pointer">
                        <ShoppingBasket className="h-4 w-4" />
                        <span>Mes Commandes</span>
                      </Link>
                    </DropdownMenu.Item>
                     <DropdownMenu.Item asChild>
                      <Link to="/wishlists" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-green-600 cursor-pointer">
                        <Heart className="h-4 w-4" />
                        <span>Mes Favoris</span>
                      </Link>
                    </DropdownMenu.Item>
                    {isAdminOrPharmacist && (
                      <>
                        <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                        <DropdownMenu.Label className="px-2 py-1 text-sm text-gray-500">Administration</DropdownMenu.Label>
                        <DropdownMenu.Item asChild>
                          <Link to="/admin" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-green-600 cursor-pointer">
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Tableau de bord</span>
                          </Link>
                        </DropdownMenu.Item>
                      </>
                    )}
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                    <DropdownMenu.Item onSelect={handleSignOut} className="flex items-center space-x-2 px-2 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span>{t('auth.logout')}</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-green-600 hover:text-green-700 font-medium">
                  {t('auth.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  {t('auth.register')}
                </Link>
              </div>
            )}

            <Link to="/cart" className="relative flex items-center space-x-1 text-gray-700 hover:text-green-600">
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
              <span className="hidden md:block">{t('nav.cart')}</span>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex py-3 border-t items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium">{t('nav.home')}</Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium">{t('nav.products')}</Link>
            <Link to="/prescriptions" className="text-gray-700 hover:text-green-600 font-medium">{t('nav.prescriptions')}</Link>
          </div>
          <Link to="/bulk-order" className="flex items-center space-x-2 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium">
            <FileUp className="h-4 w-4" />
            <span>Commande Groupée</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-0 left-0 w-full h-screen bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-lg">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            <form onSubmit={handleSearch} className="relative w-full mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search')}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search className="h-5 w-5" />
              </button>
            </form>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-green-600">{t('nav.home')}</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-green-600">{t('nav.products')}</Link>
            <Link to="/prescriptions" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-green-600">{t('nav.prescriptions')}</Link>
            <Link to="/bulk-order" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-green-600">Commande Groupée</Link>
            <div className="border-t pt-4 space-y-4">
              {!user && (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-gray-700 hover:text-green-600">{t('auth.login')}</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-gray-700 hover:text-green-600">{t('auth.register')}</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
