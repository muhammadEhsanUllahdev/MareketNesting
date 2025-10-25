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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<UserStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch(`/api/client/statistics`);
      if (!res.ok) throw new Error(t("clientStats.fetchError"));
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title={t("clientStats.title")}>
        <p>{t("clientStats.loading")}</p>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title={t("clientStats.title")}>
        <p>{t("clientStats.error")}</p>
      </DashboardLayout>
    );
  }

  const statCards: StatCard[] = [
    {
      title: t("clientStats.totalOrders"),
      value: stats.totalOrders,
      change: "+12%",
      icon: ShoppingBag,
    },
    {
      title: t("clientStats.totalSpent"),
      value: `${stats.totalSpent.toLocaleString()} DA`,
      change: "+8%",
      icon: CreditCard,
    },
    {
      title: t("clientStats.favoriteItems"),
      value: stats.favoriteItems,
      change: "+3",
      icon: Heart,
    },
    {
      title: t("clientStats.averageRating"),
      value: `${stats.averageRating}/5`,
      change: "↗",
      icon: Star,
    },
  ];

  return (
    <DashboardLayout title={t("clientStats.title")}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("clientStats.myStats")}</h1>
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
                {t("clientStats.monthlyActivity")}
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
                        <p className="font-medium">{data.orders} {t("clientStats.orders")}</p>
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
                {t("clientStats.categoryBreakdown")}
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
                      {category.percentage}% {t("clientStats.total")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientStatistics;
