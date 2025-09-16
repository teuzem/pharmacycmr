import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGrid, ShoppingBag, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Skeleton } from '../components/ui/Skeleton';

interface DashboardStats {
  pending_orders_count: number;
  new_users_count: number;
  pending_prescriptions_count: number;
  out_of_stock_products_count: number;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
        <p className="text-gray-600 mb-8">
          Bienvenue, {profile?.first_name}! Gérez votre pharmacie en ligne ici.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard icon={ShoppingBag} title="Commandes en attente" value={stats?.pending_orders_count ?? 0} color="blue" />
              <StatCard icon={Users} title="Nouveaux clients (30j)" value={stats?.new_users_count ?? 0} color="green" />
              <StatCard icon={FileText} title="Ordonnances à vérifier" value={stats?.pending_prescriptions_count ?? 0} color="yellow" />
              <StatCard icon={LayoutGrid} title="Produits en rupture" value={stats?.out_of_stock_products_count ?? 0} color="red" />
            </>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Gérer les produits</h3>
              <p className="text-sm text-gray-600">Ajouter, modifier ou supprimer des produits du catalogue.</p>
            </Link>
            <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Gérer les commandes</h3>
              <p className="text-sm text-gray-600">Voir les nouvelles commandes et mettre à jour leur statut.</p>
            </Link>
            <Link to="/admin/prescriptions" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Vérifier les ordonnances</h3>
              <p className="text-sm text-gray-600">Analyser et valider les ordonnances soumises par les clients.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
      <div className={`${colorClasses[color]} p-3 rounded-full`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
  );
}
