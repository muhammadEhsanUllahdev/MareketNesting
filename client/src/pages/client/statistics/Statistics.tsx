import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  ShoppingBag,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  Package,
  CreditCard,
  LucideIcon,
} from "lucide-react";

interface MonthlyData {
  month: string;
  orders: number;
  amount: number;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteItems: number;
  averageRating: string;
  monthlyData: MonthlyData[];
  categoriesData: CategoryData[];
}

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
}

const ClientStatistics = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<UserStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch(`/api/client/statistics`);
      if (!res.ok) throw new Error("Failed to fetch stats data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Statistiques">
        <p>Chargement des statistiques...</p>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Statistiques">
        <p>Erreur lors du chargement des données.</p>
      </DashboardLayout>
    );
  }

  const statCards: StatCard[] = [
    {
      title: "Total des commandes",
      value: stats.totalOrders,
      change: "+12%",
      icon: ShoppingBag,
    },
    {
      title: "Montant dépensé",
      value: `${stats.totalSpent.toLocaleString()} DA`,
      change: "+8%",
      icon: CreditCard,
    },
    {
      title: "Articles favoris",
      value: stats.favoriteItems,
      change: "+3",
      icon: Heart,
    },
    {
      title: "Note moyenne donnée",
      value: `${stats.averageRating}/5`,
      change: "↗",
      icon: Star,
    },
  ];

  return (
    <DashboardLayout title="Statistiques">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Mes Statistiques</h1>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-600">{stat.change}</p>
                    )}
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Activity & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activité mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyData.map((data, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{data.orders} commandes</p>
                        <p className="text-sm text-muted-foreground">
                          {data.amount.toLocaleString()} DA
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Répartition par catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoriesData.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.amount.toLocaleString()} DA
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {category.percentage}% du total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Overview */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Aperçu rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">7.8</p>
                <p className="text-sm text-blue-600">
                  Commandes/mois en moyenne
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">20,900 DA</p>
                <p className="text-sm text-green-600">Panier moyen</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">98%</p>
                <p className="text-sm text-purple-600">Satisfaction client</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </DashboardLayout>
  );
};

export default ClientStatistics;
