import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Heart,
  Star,
  Package,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  Bell,
  Eye,
  List,
  User,
  TrendingUp,
  Settings,
  ShoppingBasket,
} from "lucide-react";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: orders = [], error } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  
const { data: dashboardStats, isLoading } = useQuery({
  queryKey: ["/api/dashboard/client"],
  queryFn: async () => {
    const response = await fetch("/api/dashboard/client", {
      credentials: "include",
    });
    if (!response.ok) throw new Error(t("dashboard.errorFetchStats"));
    return response.json();
  },
});

if (!user || user.role !== "client") {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-600">{t("dashboard.accessDenied")}</p>
    </div>
  );
}

  return (
    <DashboardLayout title={t("client.dashboard.title")}>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex">
                <User className="w-7 h-7 mr-3" />
                <h1
                  className="text-2xl font-bold text-gray-900"
                  data-testid="text-dashboard-title"
                >
                  {t("client.dashboard.title")}
                </h1>
              </div>
              <p
                className="text-gray-600 mt-1"
                data-testid="text-dashboard-subtitle"
              >
                {t("client.dashboard.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex mb-3">
                        <Package className="text-primary-600 w-4 h-4 mr-2" />
                        <p
                          className="text-sm font-medium text-black-600"
                          data-testid="text-total-orders-label"
                        >
                          {t("client.dashboard.orders")}
                        </p>
                      </div>
                      <p
                        className="text-2xl font-bold text-black-700"
                        data-testid="text-total-orders"
                      >
                        {dashboardStats?.totalOrders || 12}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex mb-3">
                        <Heart className="text-red-600 w-5 h-5 mr-2" />
                        <p
                          className="text-sm font-medium text-black-600"
                          data-testid="text-wishlist-items-label"
                        >
                          {t("client.dashboard.wishlist")}
                        </p>
                      </div>
                      <p
                        className="text-2xl font-bold text-black-700"
                        data-testid="text-wishlist-items"
                      >
                        {dashboardStats?.wishlistItems || 24}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex mb-3">
                        <Star className="text-yellow-600 w-5 h-5 mr-2" />
                        <p
                          className="text-sm font-medium text-black-600"
                          data-testid="text-reviews-written-label"
                        >
                          {t("client.dashboard.reviews")}
                        </p>
                      </div>
                      <p
                        className="text-2xl font-bold text-black-700"
                        data-testid="text-reviews-written"
                      >
                        {dashboardStats?.reviewsWritten || 8}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex mb-3">
                        <TrendingUp className="text-yellow-600 w-4 h-4 mr-2" />
                        <p
                          className="text-sm font-medium text-black-600"
                          data-testid="text-loyalty-points-label"
                        >
                          {t("client.dashboard.Loyaltypoints")}
                        </p>
                      </div>

                      <p
                        className="text-2xl font-bold text-black-700"
                        data-testid="text-total-spent"
                      >
                        {dashboardStats?.totalSpent || "1,234"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t("client.dashboard.recentorders")}
              </CardTitle>
              <Link href="/dashboard/client/orders">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-view-all-orders"
                >
                  {t("client.dashboard.viewall")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock recent orders */}
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      data-testid={`order-item-${order.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Package className="h-10 w-10 text-gray-400" />
                        <div>
                          <p
                            className="font-medium text-gray-900"
                            data-testid={`order-name-${order.id}`}
                          >
                            {order.orderNumber}
                          </p>
                          <p
                            className="text-sm text-gray-500"
                            data-testid={`order-date-${order.id}`}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold text-gray-900"
                          data-testid={`order-price-${order.id}`}
                        >
                          {order.totalAmount}
                        </p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "shipped"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                          data-testid={`order-status-${order.id}`}
                        >
                          {order.status === "delivered" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {order.status === "shipped" && (
                            <Truck className="h-3 w-3 mr-1" />
                          )}
                          {order.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/client/shoppingcart">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-12 flex items-center justify-start gap-2 bg-gray-50"
                    data-testid="button-track-order"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-sm">{t("dashboard.viewMyCart")}</span>
                  </Button>
                </Link>
                <Link href="/dashboard/client/tracking">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 h-12 flex items-center justify-start gap-2 bg-gray-50"
                  >
                    <Truck className="h-5 w-5" />
                    <span className="text-sm">
                      {t("dashboard.trackMyPackages")}
                    </span>
                  </Button>
                </Link>
                <Link href="/dashboard/client/wishlist">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 h-12 flex items-center justify-start gap-2 bg-gray-50"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{t("dashboard.myWishlist")}</span>
                  </Button>
                </Link>
                <Link href="/dashboard/client/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 h-12 flex items-center justify-start gap-2 bg-gray-50"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{t("dashboard.myProfile")}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid - Notifications and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {t("client.dashboard.notifications")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-view-all-notifications"
              >
                3 {t("client.dashboard.notifications.item")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {notification.type === "shipped" && (
                        <Package className="h-5 w-5 text-blue-500" />
                      )}
                      {notification.type === "sale" && (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      {notification.type === "review" && (
                        <Star className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-medium text-gray-900"
                        data-testid={`notification-title-${notification.id}`}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-sm text-gray-600"
                        data-testid={`notification-message-${notification.id}`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs text-gray-500 mt-1"
                        data-testid={`notification-time-${notification.id}`}
                      >
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/dashboard/client/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="button-all-notifications"
                  >
                    {t("client.dashboard.notifications.view")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                {t("client.dashboard.recommendations")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-view-all-recommendations"
              >
                {t("client.dashboard.recommendations.view")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    name: "Smartphone Galaxy A54",
                    price: "429.99 DA",
                    rating: 4.5,
                    image:
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&w=60&h=60",
                  },
                  {
                    id: "2",
                    name: "Galaxy Sony WH-1000XM4",
                    price: "3000 monthly",
                    rating: 4.8,
                    image:
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&w=60&h=60",
                  },
                ].map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                    data-testid={`recommendation-${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover mr-3"
                      data-testid={`recommendation-image-${product.id}`}
                    />
                    <div className="flex-1">
                      <p
                        className="font-medium text-gray-900"
                        data-testid={`recommendation-name-${product.id}`}
                      >
                        {product.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.rating})
                        </span>
                      </div>
                      <p
                        className="text-sm font-semibold text-primary-600 mt-1"
                        data-testid={`recommendation-price-${product.id}`}
                      >
                        {product.price}
                      </p>
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
}
