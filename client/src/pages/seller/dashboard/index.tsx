import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderDetailsModal } from "@/components/ui/order-details-modal";
import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";
import { ProductViewModal } from "@/components/modals/product-view-modal";
import { ProductEditModal } from "@/components/modals/product-edit-modal";
import { dummyOrders, dummyProducts } from "@/data/dummy-data";
import {
  exportToExcel,
  formatCurrency,
  formatDate,
  formatBoolean,
} from "@/utils/excel-export";
import {
  Package,
  DollarSign,
  ShoppingBag,
  Megaphone,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Store,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Truck,
  CreditCard,
  Star,
  ChevronDown,
  Info,
  Activity,
  TriangleAlert,
  TrendingDown,
  Users,
  XCircle,
  CheckCircle,
  ChevronRight,
  Phone,
  Mail,
  User,
  MapPin,
  Euro,
} from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";


export default function SellerDashboard() {
  const { t, i18n } = useTranslation();
  const lang = (i18n?.language || "en").split("-")[0].toLowerCase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [orderToDismiss, setOrderToDismiss] = useState<any>(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "out-of-stock"
  >("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const categoriesMap = useMemo(() => {
    // categories is fetched below via useQuery; placeholder to be filled after categories load
    return {} as Record<string, string>;
  }, []);
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/seller"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/seller", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("dashboard.errors.fetchStats"));
      const data = await response.json();
      console.log("client fetched /api/dashboard/seller:", data);
      return data;
    },
  });

  const renderChangeBadge = (value?: number) => {
    const change = Number(value ?? 0);
    const positive = change >= 0; // treat 0 as positive (green)
    const cls = positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${cls}`}>
        <Icon className="h-4 w-4 mr-1" />
        {Math.abs(change)}%
      </div>
    );
  };

  const { data: salesTrend = [], isLoading: trendLoading } = useQuery({
    queryKey: ["/api/dashboard/seller/trend"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/seller/trend", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch sales trend data");
      return response.json();
    },
  });

  const salesTrendData = useMemo(() => {
    if (!salesTrend.length) return null;

    const labels = salesTrend.map((d: any) => d.month);
    const salesData = salesTrend.map((d: any) => d.sales);
    const ordersData = salesTrend.map((d: any) => d.orders);

    return {
      labels,
      datasets: [
        {
          label: `${t("seller.dashboard.sales")} (DA)`,
          data: salesData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          pointBackgroundColor: "#3b82f6",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: t("seller.dashboard.orders"),
          data: ordersData,
          borderColor: "#fb923c",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          pointBackgroundColor: "#fb923c",
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    };
  }, [salesTrend, t]);




  // const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
  //   queryKey: ["/api/orders"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/orders", {
  //       credentials: "include",
  //     });
  //     if (!response.ok) throw new Error("Failed to fetch orders");
  //     const dbOrders = await response.json();

  //     const combinedOrders = [...dbOrders, ...dummyOrders];
  //     return combinedOrders;
  //   },
  // });
  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/seller/orders"],
    queryFn: async () => {
      const response = await fetch("/api/seller/orders", {
        credentials: "include",
      });

      if (!response.ok) throw new Error(t("errors.fetchSellerOrders"));

      const orders = await response.json();
      return orders;
    },
  });

  // Fetch seller products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/seller/products", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/seller/products", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("products.errors.fetch"));
      return response.json();
    },
    enabled: !!user?.id,
  });


  // Popular products (server-driven) - top 5 for this seller
  const { data: popularProducts = [], isLoading: popularLoading } = useQuery({
    queryKey: ["/api/popular-products", user?.id, lang],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "5");
      if (user?.id) params.set("sellerId", user.id);
      params.set("lang", lang);
      const resp = await fetch(`/api/popular-products?${params.toString()}`, {
        credentials: "include",
      });
      if (!resp.ok) throw new Error(t("seller.popular.fetchError") || "Failed to fetch popular products");
      return resp.json();
    },
    enabled: !!user?.id,
  });

  const stats = useMemo(() => {
    // const threshold = Number(user?.store?.lowStockThreshold ?? 5);
    const total = (products || []).length;
    const assets = (products || []).filter((p: any) => Number(p.stock || 0) > 0).length;
    const breakup = (products || []).filter((p: any) => Number(p.stock || 0) === 0).length;
    const lowstock = (products || []).filter((p: any) => Number(p.stock || 0) > 0 && Number(p.stock) < 5).length;
    const featured = (products || []).filter((p: any) => Boolean(p.isFeatured)).length;
    return { total, assets, breakup, lowstock, featured };
  }, [products]);


  // Fetch seller store status
  const { data: storeStatus, isLoading: storeLoading } = useQuery({
    queryKey: ["/api/seller/store/status", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/seller/store/status", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("store.errors.fetchStatus"));
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch categories for product modals
  // const { data: categories = [] } = useQuery({
  //   queryKey: ["/api/categories", "en"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/categories?language=en", {
  //       credentials: "include",
  //     });
  //     if (!response.ok) throw new Error(t("categories.errors.fetch"));
  //     return response.json();
  //   },
  // });
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", lang],
    queryFn: async () => {
      const response = await fetch(`/api/categories?language=${lang}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("categories.errors.fetch"));
      return response.json();
    },
  });

  const categoriesMapMemo = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) {
      // server may return translations or single name field; prefer localized name
      map[c.id] = c.name || (c.translations && c.translations[lang]?.name) || "";
    }
    return map;
  }, [categories, lang]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "packed":
        return "bg-blue-100 text-blue-700";
      case "on-way":
        return "bg-orange-100 text-orange-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
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

  const handleViewOrder = async (order: any) => {
    try {
      let orderDetails;

      // Check if this is a dummy order (has items already) or database order
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
            name: item.productName || "Product",
            description: item.productDescription || "",
            quantity: item.quantity,
            price: `$${item.unitPrice}`,
          })) || [],
        totalAmount: `$${orderDetails.totalAmount}`,
        status: orderDetails.status,
        paymentStatus: "Paid",
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error(t("orders.errors.fetchDetailsLog"), error);
    }
  };

  const handleDismissOrder = (order: any) => {
    setOrderToDismiss(order);
    setIsDismissModalOpen(true);
  };

  const handleAddProduct = async (productData: any) => {
    setIsSubmittingProduct(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(t("products.errors.create"));
      }

      const newProduct = await response.json();
      console.log("Product created successfully:", newProduct);

      // Close the form and refresh the data
      setShowAddProductForm(false);

      // Invalidate queries to refresh the product list
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/products"],
      });
    } catch (error) {
      console.error(t("products.errors.createLog"), error);
      alert(t("products.errors.createAlert"));
    } finally {
      setIsSubmittingProduct(false);
    }
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

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductViewModal(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductEditModal(true);
  };

  const handleCloseProductViewModal = () => {
    setShowProductViewModal(false);
    setSelectedProduct(null);
  };

  const handleCloseProductEditModal = () => {
    setShowProductEditModal(false);
    setSelectedProduct(null);
  };

  const handleExportProducts = () => {
    if (!products.length) {
      alert(t("products.errors.noExport"));
      return;
    }

    // const lang = (i18n?.language || "en").split("-")[0].toUpperCase();

    // const dataForExport = products.map((p: any) => ({
    //         name: p.translations?.[lang.toLowerCase()]?.name || p.name || "",
    //         brand: p.brand || "",
    //         category: p.categoryTranslations?.[lang.toLowerCase()]?.name || p.categoryName || "",
    //         price: p.price || "",
    //         stock: p.stock ?? 0,  
    //         sku: p.sku || "",
    //       }));

    const exportLang = lang.toUpperCase();
    const dataForExport = products.map((p: any) => ({
      sku: p.sku || "",
      name: p.translations?.[lang]?.name || p.name || "",
      brand: p.brand || "",
      // prefer server-provided localized category (via categoriesMap), fallback to product.categoryName
      category: categoriesMapMemo[p.categoryId] || p.categoryTranslations?.[lang]?.name || p.categoryName || "",
      price: p.price || "",
      stock: p.stock ?? 0,
    }));
    const columns = [
      { key: "sku", label: "SKU" },
      { key: "name", label: `${t("products.fields.name")} (${exportLang})` },
      { key: "brand", label: t("products.fields.brand") },
      { key: "category", label: t("products.fields.category") },
      {
        key: "price",
        label: t("products.fields.price"),
        format: formatCurrency,
      },
      { key: "stock", label: t("products.fields.stock") },
    ];

    const success = exportToExcel({
      filename: `products-${new Date().toISOString().split("T")[0]}`,
      sheetName: "Products",
      columns,
      data: dataForExport,
    });


    if (success) {
      console.log(t("products.export.success"));
    } else {
      alert(t("products.export.failure"));
    }
  };

  // const handleExportProducts = () => {
  //   if (!products.length) {
  //     alert(t("products.errors.noExport"));
  //     return;
  //   }

  //   const columns = [
  //     { key: "sku", label: "SKU" },
  //     { key: "translations.en.name", label: t("products.fields.name") },
  //     { key: "brand", label: t("products.fields.brand") },
  //     {
  //       key: "price",
  //       label: t("products.fields.price"),
  //       format: formatCurrency,
  //     },
  //     { key: "stock", label: t("products.fields.stock") },
  //     // {
  //     //   key: "status",
  //     //   label: t("products.fields.status"),
  //     //   format: formatBoolean,
  //     // },
  //     // {
  //     //   key: "createdAt",
  //     //   label: t("products.fields.createdAt"),
  //     //   format: formatDate,
  //     // },
  //     // {
  //     //   key: "updatedAt",
  //     //   label: t("products.fields.updatedAt"),
  //     //   format: formatDate,
  //     // },
  //   ];

  //   const success = exportToExcel({
  //     filename: `products-${new Date().toISOString().split("T")[0]}`,
  //     sheetName: "Products",
  //     columns,
  //     data: products,
  //   });

  //   if (success) {
  //     console.log(t("products.export.success"));
  //   } else {
  //     alert(t("products.export.failure"));
  //   }
  // };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t("products.errors.delete"));
      }

      // Invalidate queries to refresh the product list
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/products"],
      });

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error(t("products.errors.deleteLog"), error);
      alert(t("products.errors.deleteAlert"));
    }
  };

  const handleSearch = () => {
    // Filter will be applied through filteredProducts computed property
    console.log("Searching for:", searchTerm);
  };

  const handleFilterChange = (status: "all" | "active" | "out-of-stock") => {
    setFilterStatus(status);
    setShowFilterDropdown(false);
  };

  // Filter products based on search term and filter status
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && product.stock > 0) ||
      (filterStatus === "out-of-stock" && product.stock === 0);

    return matchesSearch && matchesFilter;
  });
  // category distribution derived from products + categoriesMapMemo
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products || []) {
      const catName =
        categoriesMapMemo[p.categoryId] ||
        p.categoryName ||
        t("seller.dashboard.others") ||
        "Others";
      counts[catName] = (counts[catName] || 0) + 1;
    }
    const labels = Object.keys(counts);
    const dataValues = labels.map((l) => counts[l]);
    const total = dataValues.reduce((s, v) => s + v, 0) || 1;
    const percentages = dataValues.map((v) => Math.round((v / total) * 100));

    // color palette (extend if you have more categories)
    const palette = [
      "#3b82f6",
      "#fb923c",
      "#10b981",
      "#8b5cf6",
      "#f472b6",
      "#f59e0b",
      "#60a5fa",
      "#34d399",
      "#f97316",
    ];

    const chartData = {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    };

    return { labels, dataValues, percentages, chartData, total };
  }, [products, categoriesMapMemo, t]);

  if (!user || user.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{t("auth.errors.sellerAccessDenied")}</p>
      </div>
    );
  }

  return (
    <DashboardLayout title={user?.store?.storeName || t("header.heading")}>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                data-testid="text-dashboard-title"
              >
                {t("seller.dashboard.title")}
              </h1>
              <p
                className="text-gray-600 mt-1"
                data-testid="text-dashboard-subtitle"
              >
                {t("seller.dashboard.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Store Suspension Warning */}
        {storeStatus?.status === "suspended" && (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      {t("store.status.suspended")}
                    </h3>
                    <p className="text-red-700 mb-3">
                      {t("store.messages.suspendedInfo")}
                    </p>
                    {storeStatus.suspensionReason && (
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-1">
                          {t("store.messages.suspensionReason")}
                        </p>
                        <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md">
                          {storeStatus.suspensionReason}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-red-600 mt-3">
                      {t("store.messages.contactAdmin")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Stats Cards */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("seller.dashboard.turnover")}</p>
                      <p className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-turnover">
                        {formatCurrency(dashboardStats?.turnover ?? 0)} DA
                      </p>
                      <div className="flex items-center">
                        {renderChangeBadge(dashboardStats?.turnoverChange)}
                        <span className="text-xs text-gray-400 ml-2">{t("seller.dashboard.vsPreviousPeriod")}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("seller.dashboard.orders")}</p>
                      <p className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-orders">
                        {dashboardStats?.orders ?? 0}
                      </p>
                      <div className="flex items-center">
                        {renderChangeBadge(dashboardStats?.ordersChange)}
                        <span className="text-xs text-gray-400 ml-2">{t("seller.dashboard.vsPreviousPeriod")}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("seller.dashboard.products")}</p>
                      <p className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-products">
                        {dashboardStats?.products ?? 0}
                      </p>
                      <div className="flex items-center">
                        {renderChangeBadge(dashboardStats?.productsChange)}
                        <span className="text-xs text-gray-400 ml-2">{t("seller.dashboard.vsPreviousPeriod")}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("seller.dashboard.promotions")}</p>
                      <p className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-promotions">
                        {dashboardStats?.promotions ?? 0}
                      </p>
                      <div className="flex items-center">
                        {renderChangeBadge(dashboardStats?.promotionsChange)}
                        <span className="text-xs text-gray-400 ml-2">{t("seller.dashboard.vsPreviousPeriod")}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </>
        )}
        {/* Secondary Stats Row */}
        {/* <div className="grid grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.total")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.assets")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.breakup")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                <TriangleAlert className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.lowstock")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.featured")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div> */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.total")}
                  </p>

                  <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.assets")}
                  </p>

                  <p className="text-lg font-semibold text-gray-900">{stats.assets}</p>
                </div>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.breakup")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{stats.breakup}</p>
                </div>
                <TriangleAlert className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.lowstock")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{stats.lowstock}</p>
                </div>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("seller.dashboard.featured")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{stats.featured}</p>
                </div>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Product Management */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t("seller.dashboard.productmanagement")}
              </CardTitle>
              <div className="flex space-x-2 items-center">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder={t("products.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                    data-testid="input-search-products"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSearch}
                    data-testid="button-search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenu
                  open={showFilterDropdown}
                  onOpenChange={setShowFilterDropdown}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-filter"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {filterStatus === "all"
                        ? t("product.filter.all")
                        : filterStatus === "active"
                        ? t("product.filter.active")
                        : t("product.filter.outOfStock")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                      {t("products.filters.all")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("active")}
                    >
                      {t("products.filters.active")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("out-of-stock")}
                    >
                      {t("products.filters.outOfStock")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportProducts}
                  data-testid="button-export-products"
                >
                  {t("seller.dashboard.export")}
                </Button>
                <Button
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={() => setShowAddProductForm(true)}
                  data-testid="button-add-product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("seller.dashboard.addproduct")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("seller.productManagment.table.image")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.productName")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.price")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.stock")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.sku")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.status")}
                      </TableHead>
                      <TableHead>
                        {t("seller.productManagment.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${product.price}</div>
                        </TableCell>
                        <TableCell>
                          <div>{product.stock || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {product.sku}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {product.stock > 0
                              ? t("product.status.active")
                              : t("product.status.outOfStock")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              data-testid={`button-view-${product.id}`}
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              data-testid={`button-edit-${product.id}`}
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${product.id}`}
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : products.length > 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {t("products.messages.noMatch")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("products.messages.adjustFilters")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {t("seller.dashboard.noproducts")}
                    </p>
                    <Button
                      className="bg-primary-600 hover:bg-primary-700"
                      onClick={() => setShowAddProductForm(true)}
                      data-testid="button-add-first-product"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("seller.dashboard.addfirstproduct")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>{t("seller.dashboard.salestrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {t("common.loading")}
                </div>
              ) : salesTrendData ? (
                <div style={{ height: "300px" }}>
                  <Line
                    data={salesTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: "index",
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: "top" as const,
                          labels: { boxWidth: 12 },
                        },
                      },
                      scales: {
                        y: {
                          type: "linear" as const,
                          display: true,
                          position: "left" as const,
                          stacked: false, // ✅ moved here
                          ticks: {
                            callback: (value) => `${value as number / 1000}k DA`,
                          },
                        },
                        y1: {
                          type: "linear" as const,
                          display: true,
                          position: "right" as const,
                          stacked: false, // ✅ moved here
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }}
                  />

                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {t("seller.dashboard.noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>{t("seller.dashboard.salestrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-8 w-8 mr-2" />
                {t("seller.dashboard.salestrend.place")}
              </div>
            </CardContent>
          </Card> */}

          {/* Distribution by Category */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("seller.dashboard.distributioncategory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="h-64 flex items-center justify-center text-gray-500">
                <Package className="h-8 w-8 mr-2" />
                {t("seller.dashboard.distributioncategory.place")}
              </div> */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="flex items-center justify-center">
                  <div style={{ width: 240, height: 240 }}>
                    <Doughnut
                      data={categoryDistribution.chartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx: any) => {
                                const v = ctx.raw ?? 0;
                                const label = ctx.label ?? "";
                                const pct = categoryDistribution.total
                                  ? Math.round((v / categoryDistribution.total) * 100)
                                  : 0;
                                return `${label}: ${v} (${pct}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {categoryDistribution.labels.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      {t("seller.dashboard.noCategories")}
                    </div>
                  ) : (
                    categoryDistribution.labels.map((label, idx) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-3 h-3 rounded-sm"
                            style={{ background: categoryDistribution.chartData.datasets[0].backgroundColor[idx] }}
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {categoryDistribution.dataValues[idx]} • {categoryDistribution.percentages[idx]}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Products */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("seller.popular.products")}</CardTitle>
              <Button variant="ghost" size="sm">
                {t("seller.popular.results")}
              </Button>
            </CardHeader>
            <CardContent>
              {/* <div className="space-y-4">
                {dummyProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(parseFloat(product.rating))
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.rating})
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{product.sales}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${product.price}
                    </p>
                  </div>
                ))}
              </div> */}
              {popularLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex flex-col">
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              ) : popularProducts.length === 0 ? (
                <div className="text-sm text-gray-500">{t("seller.popular.noResults")}</div>
              ) : (
                popularProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(Number(product.rating || 0)) ? "fill-current" : ""}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.rating ?? 0})</span>
                        </div>
                        <p className="text-xs text-gray-500">{product.totalSold} {t("seller.popular.sold")}</p>
                      </div>
                    </div>
                    {/* <p className="font-semibold text-gray-900">{formatCurrency(product.totalRevenue ?? 0)}</p> */}
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.totalRevenue)}
                      <span
                        className={`ml-2 text-sm ${product.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        {product.revenueGrowth >= 0 ? `+${product.revenueGrowth}%` : `${product.revenueGrowth}%`}
                      </span>
                    </p>


                  </div>
                ))
              )}

            </CardContent>
          </Card>
        </div>

        {/* Current Disputes */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("seller.CurrentDisputes")}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  2 {t("seller.CurrentDisputes.cases")}
                </Button>
                <Button variant="ghost" size="sm">
                  {t("seller.CurrentDisputes.history")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("seller.recent.table.order")}</TableHead>
                    <TableHead>{t("seller.recent.table.product")}</TableHead>
                    <TableHead>{t("seller.recent.table.amount")}</TableHead>
                    <TableHead>{t("seller.recent.table.status")}</TableHead>
                    <TableHead>{t("seller.recent.table.date")}</TableHead>
                    <TableHead>{t("seller.recent.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>ORD-001</TableCell>
                    <TableCell>{t("orders.sample.issueCharger")}</TableCell>
                    <TableCell>4700.00</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-700">
                        {t("orders.status.waiting")}
                      </Badge>
                    </TableCell>
                    <TableCell>{t("orders.sample.dateApril112023")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("orders.actions.details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {t("orders.actions.delivery")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>ORD-002</TableCell>
                    <TableCell>{t("orders.sample.twoItems")}</TableCell>
                    <TableCell>4700.00</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-700">
                        {t("orders.status.returned")}
                      </Badge>
                    </TableCell>
                    <TableCell>{t("orders.sample.dateApril112023")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("orders.actions.details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {t("orders.actions.delivery")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("seller.recent.orders")}</CardTitle>
              <Button variant="ghost" size="sm">
                {t("seller.recent.orders.view")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white overflow-auto">
                {ordersLoading ? (
                  <div className="p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full mb-3" />
                    ))}
                  </div>
                ) : ordersData.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">{t("orders.messages.noOrdersFound")}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("orders.table.order")}</TableHead>
                        <TableHead>{t("orders.table.client")}</TableHead>
                        {/* <TableHead>{t("orders.table.store")}</TableHead> */}
                        <TableHead>{t("orders.table.status")}</TableHead>
                        <TableHead>{t("orders.table.payment")}</TableHead>
                        <TableHead className="text-right">{t("orders.table.articles")}</TableHead>
                        <TableHead className="text-right">{t("orders.table.amount")}</TableHead>
                        <TableHead className="text-right">{t("orders.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.map((order: any) => (
                        <React.Fragment key={order.id}>
                          <TableRow className="hover:bg-gray-50">
                            {/* Order ID */}
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleExpandOrder(order.id)}
                                >
                                  {expandedOrders.has(order.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                {order.orderNumber}
                              </div>
                            </TableCell>

                            {/* Customer */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={order.customerAvatar || ""} />
                                  <AvatarFallback>
                                    {order.shippingAddress?.firstName?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {order.shippingAddress?.firstName}{" "}
                                    {order.shippingAddress?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Store */}
                            {/* <TableCell>
                              <span className="text-sm font-medium">
                                {order.storeName || order.vendorName || "-"}
                              </span>
                            </TableCell> */}

                            {/* Status */}
                            <TableCell>
                              <Badge
                                className={
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                }
                              >
                                {order.status === "pending" ? "On Hold" : order.status}
                              </Badge>
                            </TableCell>

                            {/* Payment */}
                            <TableCell>
                              <Badge
                                className={
                                  order.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                              </Badge>
                            </TableCell>

                            {/* Articles */}
                            <TableCell className="text-right">
                              {order.items?.length || 0}{" "}
                              {(order.items?.length || 0) > 1 ? "articles" : "article"}
                            </TableCell>

                            {/* Amount */}
                            <TableCell className="text-right font-medium">
                              {order.totalAmount.toLocaleString("fr-DZ")} DA
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewOrder(order)}
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {order.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApproveOrder(order)}
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDismissOrder(order)}
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* <TableRow className="hover:bg-gray-50" onClick={() => toggleExpandOrder(order.id)}>
                                    <TableCell>
                                      <div className="text-sm font-medium">{order.orderNumber}</div>
                                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={order.customerAvatar || ""} />
                                          <AvatarFallback>{order.shippingAddress?.firstName?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                                          <div className="text-xs text-gray-500">{order.customerEmail}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">{order.storeName || order.vendorName || "-"}</div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(order.status || "")}>
                                        {order.status === "pending" ? t("orders.status.onHold") : order.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className={order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                        {order.paymentStatus === "paid" ? t("orders.payment.paid") : t("orders.payment.pending")}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{order.items?.length || 0}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(order.totalAmount)} DA</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}>
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleApproveOrder(order)}>{t("orders.actions.approve")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDismissOrder(order)}>{t("orders.actions.dismiss")}</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  </TableRow> */}

                          {expandedOrders.has(order.id) && (
                            <TableRow>
                              <TableCell colSpan={8} className="p-0 bg-gray-50">
                                <div className="p-6 bg-gray-50 border-t">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                    {/* Customer Information */}
                                    <div>
                                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t("order.customerInformation")}
                                      </h4>
                                      <Card className="p-4">
                                        <div className="space-y-3">
                                          <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div className="text-sm">
                                              <p className="font-medium">
                                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                              </p>
                                              <p className="text-gray-600">
                                                {t("order.clientId")} #{String(order.id).slice(-8).toUpperCase()}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div className="text-sm">
                                              <p className="text-gray-600">{order.customerEmail}</p>
                                            </div>
                                          </div>
                                          {order.customerPhone && (
                                            <div className="flex items-start gap-2">
                                              <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                                              <div className="text-sm">
                                                <p className="text-gray-600">{order.customerPhone}</p>
                                              </div>
                                            </div>
                                          )}
                                          <div className="flex items-start gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div className="text-sm">
                                              <p className="font-medium">{t("order.orderPlacedOn")}:</p>
                                              <p className="text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </Card>
                                    </div>

                                    {/* Ordered Products */}
                                    <div>
                                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        {t("order.productsOrdered")} ({order.items?.length || 0})
                                      </h4>
                                      <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {order.items?.map((item: any) => (
                                          <Card key={item.id} className="p-3">
                                            <div className="flex items-start gap-3">
                                              <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                {item.image ? (
                                                  <img
                                                    src={item.image}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-cover rounded"
                                                  />
                                                ) : (
                                                  <Package className="h-6 w-6 text-blue-600" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm truncate">
                                                  {item.product?.name}
                                                </h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    {item.product?.categoryName || t("order.noCategory")}
                                                  </Badge>
                                                  <span className="text-xs text-gray-500">
                                                    SKU: {item.product?.sku}
                                                  </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-2">
                                                  <div>
                                                    <span className="font-medium">{t("order.quantity")}:</span>{" "}
                                                    {item.quantity}
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">{t("order.price")}:</span>{" "}
                                                    {item.unitPrice.toLocaleString("fr-DZ")} DA
                                                  </div>
                                                  <div className="font-semibold text-green-600">
                                                    {item.totalPrice.toLocaleString("fr-DZ")} DA
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Delivery & Financial Summary */}
                                    <div className="space-y-4">
                                      {/* Delivery Info */}
                                      <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                          <Truck className="h-4 w-4" />
                                          {t("order.delivery")}
                                        </h4>
                                        <Card className="p-4">
                                          <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                              <div className="text-sm">
                                                <p className="font-medium">{t("order.deliveryAddress")}</p>
                                                <p className="text-gray-600">{order.shippingAddress?.street}</p>
                                                <p className="text-gray-600">
                                                  {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                                                </p>
                                                <p className="text-gray-600">{order.shippingAddress?.country}</p>
                                              </div>
                                            </div>
                                            <div className="pt-2 border-t">
                                              <div className="flex justify-between text-sm">
                                                <span>{t("order.deliveryMethod")}:</span>
                                                <span className="font-medium">
                                                  {order.shippingOption?.price === 0
                                                    ? t("order.freeDelivery")
                                                    : t("order.standardDelivery")}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm mt-1">
                                                <span>{t("orders.estimatedTime")}:</span>
                                                <span className="font-medium">
                                                  {order.shippingOption?.deliveryTime || "2-4 jours"}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm mt-1">
                                                <span>{t("orders.status")}:</span>
                                                <Badge
                                                  className={
                                                    order.status === "delivered"
                                                      ? "bg-green-100 text-green-800"
                                                      : order.status === "shipped"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                  }
                                                >
                                                  {order.status === "delivered"
                                                    ? t("orders.status.delivered")
                                                    : order.status === "shipped"
                                                      ? t("orders.status.shipped")
                                                      : t("orders.status.onHold")}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        </Card>
                                      </div>

                                      {/* Financial Summary */}
                                      <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                          <Euro className="h-4 w-4" />
                                          {t("order.financialSummary")}
                                        </h4>
                                        <Card className="p-4">
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span>
                                                {t("order.subtotal")} ({order.items?.length || 0}{" "}
                                                {t("order.items")}):
                                              </span>
                                              <span>
                                                {(order.totalAmount - (order.shippingOption?.price || 0)).toLocaleString(
                                                  "fr-DZ"
                                                )}{" "}
                                                DA
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>{t("order.deliveryCosts")}:</span>
                                              <span
                                                className={
                                                  order.shippingOption?.price === 0
                                                    ? "text-green-600 font-medium"
                                                    : ""
                                                }
                                              >
                                                {order.shippingOption?.price === 0
                                                  ? t("order.free")
                                                  : `${order.shippingOption?.price.toLocaleString("fr-DZ")} DA`}
                                              </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 font-semibold text-base">
                                              <span>{t("order.total")}:</span>
                                              <span className="text-green-600">
                                                {order.totalAmount.toLocaleString("fr-DZ")} DA
                                              </span>
                                            </div>
                                            <div className="pt-2 border-t mt-3">
                                              <div className="flex items-center gap-2 text-sm">
                                                <CreditCard className="h-4 w-4 text-gray-500" />
                                                <span>{t("order.payment")}:</span>
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    order.paymentStatus === "paid"
                                                      ? "bg-green-50 text-green-700 border-green-200"
                                                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                  }
                                                >
                                                  {order.paymentStatus === "paid"
                                                    ? t("orders.payment.paid")
                                                    : t("orders.payment.pending")}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        </Card>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>


                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>

          </Card>
        </div>
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
        />
      )}

      {/* Dismiss Order Modal */}
      <Dialog open={isDismissModalOpen} onOpenChange={setIsDismissModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("orders.dismiss.title")}</DialogTitle>
            <DialogDescription>
              {t("orders.dismiss.description", { orderId: orderToDismiss?.id })}
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
              {t("common.cancel")}
            </Button>
            <Button
              onClick={confirmDismissOrder}
              disabled={!dismissReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("orders.dismiss.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Form */}
      {showAddProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
            <AdvancedAddProductForm
              onSubmit={handleAddProduct}
              onCancel={() => setShowAddProductForm(false)}
              isLoading={isSubmittingProduct}
            />
          </div>
        </div>
      )}

      {/* Product View Modal */}
      <ProductViewModal
        product={selectedProduct}
        isOpen={showProductViewModal}
        onClose={handleCloseProductViewModal}
        categories={categories}
        showActions={false}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        product={selectedProduct}
        isOpen={showProductEditModal}
        onClose={handleCloseProductEditModal}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("products.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("products.delete.description", {
                productName: productToDelete?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setProductToDelete(null);
              }}
              data-testid="button-cancel-delete"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {t("products.delete.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
