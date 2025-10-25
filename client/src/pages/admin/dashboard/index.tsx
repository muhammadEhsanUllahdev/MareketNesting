import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OrderDetailsModal } from "@/components/ui/order-details-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Plus,
  Package,
  ShoppingCart,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  MoreHorizontal,
  Filter,
  ChevronDown,
  Truck,
  CreditCard,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Trash,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PendingSellers } from "@/components/admin/pending-sellers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [orderToDismiss, setOrderToDismiss] = useState<any>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/admin"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/admin", {
        credentials: "include",
      });
      if (!response.ok) {
        // if unauthorized, throw so React Query marks it as error and your route guard can react
        const errText = await response.text().catch(() => "Fetch error");
        throw new Error(errText || `HTTP ${response.status}`);
      }
      return response.json();
    },
  });
  const revenueTotal = dashboardStats?.totalRevenue ?? 0;
  const ordersTotal = dashboardStats?.totalOrders ?? 0;
  const sellersTotal = dashboardStats?.totalSellers ?? 0;
  const clientsTotal = dashboardStats?.totalClients ?? 0;

  const revenueChange = dashboardStats?.revenueChange ?? 0;
  const ordersChange = dashboardStats?.ordersChange ?? 0;
  const shopsChange = dashboardStats?.shopsChange ?? 0;
  const clientsChange = dashboardStats?.clientsChange ?? 0;

  const renderChangeBadge = (change: number) => {
    const positive = change >= 0; // treat 0 as positive (shows up green arrow)
    const cls = positive
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${cls}`}
      >
        {positive ? (
          <ArrowUp className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDown className="h-4 w-4 mr-1" />
        )}
        {Math.abs(change)}
      </div>
    );
  };
  // Fetch s/sellers
  const { data: activeStores = [], isLoading: storesLoading } = useQuery({
    queryKey: ["/api/admin/users", "sellers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("users.errors.fetch"));
      const users = await response.json();
      return users
        .filter(
          (user: any) =>
            user.role === "seller" &&
            user.isActive &&
            user.sellerStatus === "approved"
        )
        .slice(0, 3);
    },
  });

  // Fetch recent users
  const { data: recentUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("users.errors.fetch"));
      const users = await response.json();
      return users
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
    },
  });

  // Helper function to get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return t("time.justNow");
    if (diffInHours < 24) return t("time.hoursAgo", { count: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t("time.yesterday");
    if (diffInDays < 7) return t("time.daysAgo", { count: diffInDays });
    return createdDate.toLocaleDateString();
  };

  // Mock data for charts and tables
  const salesTrendData = [
    { month: t("months.jan"), sales: 12000, orders: 145 },
    { month: t("months.feb"), sales: 19000, orders: 223 },
    { month: t("months.mar"), sales: 15000, orders: 176 },
    { month: t("months.apr"), sales: 22000, orders: 267 },
    { month: t("months.may"), sales: 28000, orders: 334 },
    { month: t("months.jun"), sales: 35000, orders: 412 },
  ];

  const popularProducts = [
    {
      id: 1,
      name: "Premium Headphones",
      category: "Electronics",
      sales: 1247,
      revenue: 249400,
      rating: 4.8,
      image: "https://ui-avatars.com/api/?name=PH&background=6366f1&color=fff",
    },
    {
      id: 2,
      name: "Smart Smartphone",
      category: "Electronics",
      sales: 943,
      revenue: 1226590,
      rating: 4.6,
      image: "https://ui-avatars.com/api/?name=SS&background=10b981&color=fff",
    },
    {
      id: 3,
      name: "Wireless Headphones",
      category: "Electronics",
      sales: 567,
      revenue: 113400,
      rating: 4.5,
      image: "https://ui-avatars.com/api/?name=WH&background=f59e0b&color=fff",
    },
    {
      id: 4,
      name: "Computer Tool",
      category: "Electronics",
      sales: 445,
      revenue: 133500,
      rating: 4.3,
      image: "https://ui-avatars.com/api/?name=CT&background=ef4444&color=fff",
    },
    {
      id: 5,
      name: "Sports Shoes",
      category: "Fashion",
      sales: 389,
      revenue: 77800,
      rating: 4.7,
      image: "https://ui-avatars.com/api/?name=SS&background=8b5cf6&color=fff",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Ahmed Benali",
      email: "ahmed@example.com",
      product: "Premium Headphones",
      amount: 199.99,
      status: "Processing",
      date: "2024-01-20",
      avatar:
        "https://ui-avatars.com/api/?name=Ahmed+Benali&background=6366f1&color=fff",
    },
    {
      id: "ORD-002",
      customer: "Sara Djouad",
      email: "sara@example.com",
      product: "Smart Smartphone",
      amount: 1299.99,
      status: "Shipped",
      date: "2024-01-19",
      avatar:
        "https://ui-avatars.com/api/?name=Sara+Djouad&background=10b981&color=fff",
    },
    {
      id: "ORD-003",
      customer: "Mohamed Kaddour",
      email: "mohamed@example.com",
      product: "Wireless Headphones",
      amount: 149.99,
      status: "Delivered",
      date: "2024-01-18",
      avatar:
        "https://ui-avatars.com/api/?name=Mohamed+Kaddour&background=f59e0b&color=fff",
    },
    {
      id: "ORD-004",
      customer: "Fatima Boutaiba",
      email: "fatima@example.com",
      product: "Computer Tool",
      amount: 299.99,
      status: "Processing",
      date: "2024-01-17",
      avatar:
        "https://ui-avatars.com/api/?name=Fatima+Boutaiba&background=ef4444&color=fff",
    },
    {
      id: "ORD-005",
      customer: "Yacine Mesbah",
      email: "yacine@example.com",
      product: "Sports Shoes",
      amount: 89.99,
      status: "Cancelled",
      date: "2024-01-16",
      avatar:
        "https://ui-avatars.com/api/?name=Yacine+Mesbah&background=8b5cf6&color=fff",
    },
  ];

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", { credentials: "include" });
      if (!response.ok) throw new Error(t("orders.errors.fetch"));
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case t("orders.status.packed").toLowerCase():
        return "bg-blue-100 text-blue-700";
      case t("orders.status.onWay").toLowerCase():
        return "bg-orange-100 text-orange-700";
      case t("orders.status.delivered").toLowerCase():
        return "bg-green-100 text-green-700";
      case t("orders.status.cancelled").toLowerCase():
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpandOrder = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (expandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {" "}
        <p className="text-red-600">{t("access.denied.adminRequired")}</p>{" "}
      </div>
    );
  }
  let value = 0;
  const isPositive = value >= 0;

  const handleDismissOrder = (order: any) => {
    setOrderToDismiss(order);
    setIsDismissModalOpen(true);
  };

  const confirmDismissOrder = () => {
    if (orderToDismiss && dismissReason.trim()) {
      console.log(
        `Dismissing order ${orderToDismiss.id} with reason: ${dismissReason}`
      );
      // Here you would typically make an API call to dismiss the order
      setIsDismissModalOpen(false);
      setDismissReason("");
      setOrderToDismiss(null);
    }
  };

  const handleApproveOrder = (order: any) => {
    console.log(`Approving order ${order.id}`);
    // Here you would typically make an API call to approve the order
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {" "}
        <p className="text-red-600">{t("access.denied.sellerRequired")}</p>{" "}
      </div>
    );
  }

  const handleViewOrder = async (order: any) => {
    try {
      let orderDetails; // Check if this is a dummy order (has items already) or database order
      if (order.items) {
        // It's a dummy order with items already included
        orderDetails = order;
      } else {
        // It's a database order, fetch details from API
        const response = await fetch(`/api/orders/${order.id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(t("orders.errors.fetchDetails"));
        orderDetails = await response.json();
      }
      setSelectedOrder({
        id: orderDetails.id,
        date: formatDate(orderDetails.createdAt),
        customer: {
          name: orderDetails.customerName,
          avatar:
            orderDetails.customerAvatar ||
            "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=40&h=40",
        },
        orderItems:
          orderDetails.items?.map((item: any) => ({
            id: item.id,
            name: item.productName || t("orders.product"),
            description: item.productDescription || "",
            quantity: item.quantity,
            price: `$${item.unitPrice}`,
          })) || [],
        totalAmount: `$${orderDetails.totalAmount}`,
        status: orderDetails.status,
        paymentStatus: t("orders.payment.paid"),
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error(t("orders.errors.fetchDetails"), error);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex">
          <Shield className="text-primary w-8 h-8 mr-2" />
          <h1 className="text-3xl font-bold mb-3">{t("admin.heading")}</h1>
        </div>
        <p className="text-lg mb-6">{t("admin.subheading")}</p>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Card className="bg-gradient-to-r from-white-500 to-white-600 text-black">
                <CardContent className="p-6">
                  <div className="flex items-center  justify-between">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>

                    {renderChangeBadge(revenueChange)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-medium text-black-100"
                        data-testid="text-revenue-label"
                      >
                        {t("admin.card.Revenue")}
                      </p>
                      <p
                        className="text-2xl font-bold"
                        data-testid="text-revenue"
                      >
                        {Number(revenueTotal).toLocaleString()} DA
                      </p>
                      <p className="text-xs text-black-100 mt-1">
                        {t("admin.card.dic", {
                          value: `${revenueChange >= 0 ? "+" : "-"}${Math.abs(
                            revenueChange
                          )}%`,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-white-500 to-white-600 text-black">
                <CardContent className="p-6">
                  <div className="flex items-center  justify-between">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <ShoppingCart className="h-8 w-8 text-orange-600" />
                    </div>
                    {renderChangeBadge(ordersChange)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-medium text-black-100"
                        data-testid="text-orders-label"
                      >
                        {t("admin.card.Orders")}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        data-testid="text-orders"
                      >
                        {Number(ordersTotal).toLocaleString()}
                      </p>
                      <p className="text-xs text-black-100 mt-1">
                        {t("admin.card.dic", {
                          value: `${ordersChange >= 0 ? "+" : "-"}${Math.abs(
                            ordersChange
                          )}%`,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-white-500 to-white-600 text-black">
                <CardContent className="p-6">
                  <div className="flex items-center  justify-between">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>

                    {renderChangeBadge(shopsChange)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-medium text-black-100"
                        data-testid="text-products-label"
                      >
                        {t("admin.card.Shops")}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        data-testid="text-products"
                      >
                        {Number(sellersTotal).toLocaleString()}
                      </p>
                      <p className="text-xs text-black-100 mt-1">
                        {t("admin.card.dic", {
                          value: `${shopsChange >= 0 ? "+" : "-"}${Math.abs(
                            shopsChange
                          )}%`,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-white-500 to-white-600 text-black">
                <CardContent className="p-6">
                  <div className="flex items-center  justify-between">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Eye className="h-8 w-8 text-green-600" />
                    </div>

                    {renderChangeBadge(clientsChange)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-medium text-black-100"
                        data-testid="text-customers-label"
                      >
                        {t("admin.card.Customers")}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        data-testid="text-customers"
                      >
                        {Number(clientsTotal).toLocaleString()}
                      </p>
                      <p className="text-xs text-black-100 mt-1">
                        {t("admin.card.dic", {
                          value: `${clientsChange >= 0 ? "+" : "-"}${Math.abs(
                            clientsChange
                          )}%`,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t("admin.sales.heading")}
                </CardTitle>
              </CardHeader>
              <Card className="m-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {t("admin.sales.subheading")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </Card>

            {/* Popular Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t("admin.papul.heading")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={product.image} />
                          <AvatarFallback>
                            {product.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
  {product.sales} {t("product.salesLabel")}
</p>

                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500">
                            {product.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column - s and Recent Users */}
          <div className="space-y-6">
            {/* Stores */}
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              // onClick={handleStoreManagementClick}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  {t("admin.active.heading")}
                </CardTitle>
                <span className="text-xs text-gray-500">
                  {activeStores.length}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                {storesLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))
                ) : activeStores.length > 0 ? (
                  activeStores.map((store: any) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {store.storeName ||
                            store.firstName + " " + store.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {store.businessType || t("stores.defaultType")} •{" "}
                          {t("stores.joined")}{" "}
                          {getRelativeTime(store.createdAt)}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {t("stores.status.active")}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">{t("stores.none")}</p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <Link href="/dashboard/admin/stores">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 text-xs w-full justify-start p-0"
                    >
                      {t("admin.active.link")}
                      <ChevronDown className="h-3 w-3 ml-auto rotate-[-90deg]" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              // onClick={handleUserManagementClick}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {t("admin.recent.heading")}
                </CardTitle>
                <span className="text-xs text-gray-500">
                  {
                    recentUsers.filter((user: any) => {
                      const today = new Date();
                      const userDate = new Date(user.createdAt);
                      return today.toDateString() === userDate.toDateString();
                    }).length
                  }{" "}
                  {t("admin.recent.today")}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                {usersLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : recentUsers.length > 0 ? (
                  recentUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {user.storeName ||
                            user.firstName + " " + user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("users.registered")}{" "}
                          {getRelativeTime(user.createdAt)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${
                          user.role === "seller"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "seller"
                          ? t("users.roles.seller")
                          : user.role === "admin"
                          ? t("users.roles.admin")
                          : t("users.roles.customer")}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      {t("users.noRecent")}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <Link href="/dashboard/admin/users">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 text-xs w-full justify-start p-0"
                    >
                      {t("admin.recent.link")}
                      <ChevronDown className="h-3 w-3 ml-auto rotate-[-90deg]" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders - Same as Seller Dashboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("admin.recent.orders")}</CardTitle>
            <Button variant="ghost" size="sm">
              {t("admin.recent.orders.link")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 overflow-x-auto">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 min-w-max">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))
              ) : ordersData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("orders.noOrdersFound")}
                </div>
              ) : (
                ordersData.map((order: any) => (
                  <div
                    key={order.id}
                    className="border rounded-lg bg-white shadow-sm min-w-max"
                  >
                    {/* Order Row */}
                    <div
                      className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpandOrder(order.id)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Expand/Collapse Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedOrders.has(order.id) ? "rotate-180" : ""
                            }`}
                          />
                        </Button>

                        <div className="min-w-[100px]">
                          <span className="font-medium">
                            {/* ORD-{order.id.slice(-4)} */}
                            {order.orderNumber}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="flex items-center space-x-3 min-w-[200px]">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                order.customerAvatar ||
                                "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=40&h=40"
                              }
                              alt={order.customerName}
                            />
                            <AvatarFallback>
                              {order?.shippingAddress?.firstName
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {order?.shippingAddress?.firstName}{" "}
                            {order?.shippingAddress?.lastName || "Unknown"}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="min-w-[100px]">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>

                        {/* Payment */}
<div className="min-w-[80px]">
  <Badge className="bg-green-100 text-green-700">
    {order.paymentStatus || t("order.paymentStatus.paid")}
  </Badge>
</div>

{/* Items */}
<div className="min-w-[100px]">
  <span className="text-gray-600">
    {order.itemCount || 1} {t("order.itemCountLabel")}
  </span>
</div>


                        {/* Amount */}
                        <div className="min-w-[100px]">
                          <span className="font-semibold">
                            {order.totalAmount} DA
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="ml-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveOrder(order)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDismissOrder(order)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedOrders.has(order.id) && (
                      <div className="border-t bg-gray-50 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Customer Information */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <h3 className="font-medium">
                                {t("order.customerInformation")}
                              </h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={order.avatar} />
                                  <AvatarFallback>
                                    {order.shippingAddress.firstName
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {order.shippingAddress.firstName}{" "}
                                  {order.shippingAddress.lastName || "Unknown"}
                                </span>
                              </div>
                              <p className="text-gray-600">
                                {t("order.clientId")} MD-{order.id.slice(-5)}
                              </p>
                              <p className="text-gray-600">
                                {order.shippingAddress.email ||
                                  "customer@example.com"}
                              </p>
                              <p className="text-gray-600">
                                📞 {order.shippingAddress.phone}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {t("order.orderPlacedOn")}{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">
                                {t("orders.productsOrdered", {
                                  count: order.items?.length || 0,
                                })}
                              </h3>
                            </div>
                            <div className="space-y-3">
                              {order.items?.slice(0, 2).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-3 p-3 bg-white rounded border"
                                >
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {item.product?.name ||
                                        t("orders.unknownProduct")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {t("orders.skuLabel", {
                                        sku: item.product?.sku || "N/A",
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {t("orders.qty", {
                                        count: item.quantity,
                                      })}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">
                                      {t("orders.price", {
                                        price: item.unitPrice,
                                      })}
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      {parseFloat(
                                        item.totalPrice
                                      ).toLocaleString()}{" "}
                                      €
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">
                                {t("orders.delivery")}
                              </h3>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-3 w-3 text-gray-400 mt-1" />
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {t("orders.deliveryAddress")}
                                  </div>
                                  <div className="text-gray-600">
                                    {order.shippingAddress ? (
                                      <>
                                        {order.shippingAddress.street}
                                        <br />
                                        {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.zipCode}
                                        <br />
                                        {order.shippingAddress.country}
                                      </>
                                    ) : (
                                      t("orders.addressNotAvailable")
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                {/* <div className="text-xs font-medium">
                                  {t("orders.method")}
                                </div>
                                <div className="text-xs text-right">
                                  {t("orders.freeDelivery")}
                                </div> */}
                                <div className="text-xs font-medium">
                                  {t("orders.estimatedTime")}
                                </div>
                                <div className="text-xs text-right">
                                  {order.shippingOption?.deliveryTime}{" "}
                                </div>
                                <div className="text-xs font-medium">
                                  {t("orders.status")}
                                </div>
                                <div className="text-xs text-right">
                                  {" "}
                                  <Badge
                                    className={
                                      order.status ===
                                      t("orders.status.pending").toLowerCase()
                                        ? "bg-yellow-100 text-yellow-800"
                                        : order.status ===
                                          t(
                                            "orders.status.inDelivery"
                                          ).toLowerCase()
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status ===
                                          t(
                                            "orders.status.delivered"
                                          ).toLowerCase()
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {" "}
                                    {order.status ===
                                    t("orders.status.pending").toLowerCase()
                                      ? t("orders.status.onHold")
                                      : order.status ===
                                        t(
                                          "orders.status.inDelivery"
                                        ).toLowerCase()
                                      ? t("orders.status.shipped")
                                      : order.status ===
                                        t(
                                          "orders.status.delivered"
                                        ).toLowerCase()
                                      ? t("orders.status.delivered")
                                      : order.status}{" "}
                                  </Badge>{" "}
                                </div>
                              </div>

                              {/* Financial Summary */}
                              <div className="mt-4 p-3 bg-white rounded border">
                                <div className="flex items-center space-x-2 mb-3">
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-sm">
                                    {t("orders.financialSummary")}
                                  </h4>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>
                                      {t("orders.subtotal", {
                                        count: order.items?.length || 0,
                                      })}
                                    </span>
                                    <span>
                                      {(
                                        parseFloat(order.totalAmount) * 0.85
                                      ).toFixed(2)}{" "}
                                      €
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t("orders.deliveryCosts")}</span>
                                    <span className="text-green-600">
                                      {t("orders.free")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t("orders.vat")}</span>
                                    <span>
                                      {(
                                        parseFloat(order.totalAmount) * 0.15
                                      ).toFixed(2)}{" "}
                                      €
                                    </span>
                                  </div>
                                  <hr className="my-2" />
                                  <div className="flex justify-between font-semibold text-lg">
                                    <span>{t("orders.total")}</span>
                                    <span className="text-green-600">
                                      {parseFloat(order.totalAmount).toFixed(2)}{" "}
                                      €
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    {" "}
                                    <span>{t("orders.payment")}</span>{" "}
                                    <Badge
                                      className={
                                        order.status ===
                                        t(
                                          "orders.status.delivered"
                                        ).toLowerCase()
                                          ? "bg-green-100 text-green-800"
                                          : order.status ===
                                            t(
                                              "orders.status.cancelled"
                                            ).toLowerCase()
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {" "}
                                      {order.status ===
                                      t("orders.status.delivered").toLowerCase()
                                        ? t("orders.payment.paid")
                                        : order.status ===
                                          t(
                                            "orders.status.cancelled"
                                          ).toLowerCase()
                                        ? t("orders.payment.refunded")
                                        : t("orders.payment.onHold")}{" "}
                                    </Badge>{" "}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOrder && (
          <OrderDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={selectedOrder}
          />
        )}
        <Dialog open={isDismissModalOpen} onOpenChange={setIsDismissModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("orders.dismiss.title")}</DialogTitle>
              <DialogDescription>
                {t("orders.dismiss.description", { id: orderToDismiss?.id })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dismiss-reason">
                  {t("orders.dismiss.reasonLabel")}
                </Label>
                <Textarea
                  id="dismiss-reason"
                  placeholder={t("orders.dismiss.reasonPlaceholder")}
                  value={dismissReason}
                  onChange={(e) => setDismissReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDismissModalOpen(false);
                  setDismissReason("");
                  setOrderToDismiss(null);
                }}
              >
                {t("orders.dismiss.cancel")}
              </Button>
              <Button
                onClick={confirmDismissOrder}
                disabled={!dismissReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("orders.dismiss.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pending Sellers Management */}
        {/* <div className="mb-8">
          <PendingSellers />
        </div> */}
      </div>
    </DashboardLayout>
  );
}
