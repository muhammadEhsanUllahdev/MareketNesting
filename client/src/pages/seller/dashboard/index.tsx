import { useState } from "react";
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
} from "lucide-react";

export default function SellerDashboard() {
  const { t } = useTranslation();
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

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/seller"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/seller", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("dashboard.errors.fetchStats"));
      return response.json();
    },
  });

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

      if (!response.ok) throw new Error("Failed to fetch seller orders");

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
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", "en"],
    queryFn: async () => {
      const response = await fetch("/api/categories?language=en", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("categories.errors.fetch"));
      return response.json();
    },
  });

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

    const columns = [
      { key: "sku", label: "SKU" },
      { key: "translations.en.name", label: t("products.fields.name") },
      { key: "brand", label: t("products.fields.brand") },
      {
        key: "price",
        label: t("products.fields.price"),
        format: formatCurrency,
      },
      { key: "stock", label: t("products.fields.stock") },
      {
        key: "status",
        label: t("products.fields.status"),
        format: formatBoolean,
      },
      {
        key: "createdAt",
        label: t("products.fields.createdAt"),
        format: formatDate,
      },
      {
        key: "updatedAt",
        label: t("products.fields.updatedAt"),
        format: formatDate,
      },
    ];

    const success = exportToExcel({
      filename: `products-${new Date().toISOString().split("T")[0]}`,
      sheetName: "Products",
      columns,
      data: products,
    });

    if (success) {
      console.log(t("products.export.success"));
    } else {
      alert(t("products.export.failure"));
    }
  };

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

  if (!user || user.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{t("auth.errors.sellerAccessDenied")}</p>
      </div>
    );
  }

  return (
    <DashboardLayout title={t("header.heading")}>
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
            {/* <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                data-testid="button-admin-dashboard"
              >
                Admin Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-customer-dashboard"
              >
                Customer Dashboard
              </Button>
              <Button
                size="sm"
                className="bg-primary-600 hover:bg-primary-700"
                data-testid="button-shop-products"
              >
                Shop Products
              </Button>
            </div> */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                    data-testid="text-turnover-label"
                  >
                    {t("seller.dashboard.turnover")}
                  </p>
                  <p
                    className="text-xl font-semibold text-gray-900 mb-2"
                    data-testid="text-turnover"
                  >
                    458,000.00 DA
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+10.5%</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {t("seller.dashboard.vsPreviousPeriod")}
                    </span>
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
                  <p
                    className="text-sm text-gray-500 mb-1"
                    data-testid="text-orders-label"
                  >
                    {t("seller.dashboard.orders")}
                  </p>
                  <p
                    className="text-xl font-semibold text-gray-900 mb-2"
                    data-testid="text-orders"
                  >
                    85
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+7.2%</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {t("seller.dashboard.vsPreviousPeriod")}
                    </span>
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
                  <p
                    className="text-sm text-gray-500 mb-1"
                    data-testid="text-products-label"
                  >
                    {t("seller.dashboard.products")}
                  </p>
                  <p
                    className="text-xl font-semibold text-gray-900 mb-2"
                    data-testid="text-products"
                  >
                    124
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+3.8%</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {t("seller.dashboard.vsPreviousPeriod")}
                    </span>
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
                  <p
                    className="text-sm text-gray-500 mb-1"
                    data-testid="text-promotions-label"
                  >
                    {t("seller.dashboard.promotions")}
                  </p>
                  <p
                    className="text-xl font-semibold text-gray-900 mb-2"
                    data-testid="text-promotions"
                  >
                    8
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+25%</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {t("seller.dashboard.vsPreviousPeriod")}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
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
                        ? "All"
                        : filterStatus === "active"
                          ? "Active"
                          : "Out of Stock"}
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
                            {product.stock > 0 ? "Active" : "Out of Stock"}
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
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-8 w-8 mr-2" />
                {t("seller.dashboard.salestrend.place")}
              </div>
            </CardContent>
          </Card>

          {/* Distribution by Category */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("seller.dashboard.distributioncategory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <Package className="h-8 w-8 mr-2" />
                {t("seller.dashboard.distributioncategory.place")}
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
              <div className="space-y-4">
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
                                className={`h-3 w-3 ${i < Math.floor(parseFloat(product.rating))
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
              </div>
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
                    {t("orders.messages.noOrdersFound")}
                  </div>
                ) : (
                  ordersData.map((order) => (
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
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedOrders.has(order.id) ? "rotate-180" : ""
                                }`}
                            />
                          </Button>

                          {/* Order ID */}
                          <div className="min-w-[100px]">
                            <span className="font-medium">{order.orderNumber}</span>
                          </div>

                          {/* Customer */}
                          <div className="flex items-center space-x-3 min-w-[200px]">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  order.customerAvatar ||
                                  "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=40&h=40"
                                }
                                alt={order.shippingAddress.firstName}
                              />
                              <AvatarFallback>
                                {order.shippingAddress.firstName
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedOrders.has(order.id) && (
                        <div className="border-t bg-gray-50 p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Customer Info */}
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
                                    <AvatarImage src={order.customerAvatar || ""} />
                                    <AvatarFallback>
                                      {order.shippingAddress.firstName
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("") || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {order.shippingAddress.firstName}{" "}
                                    {order.shippingAddress.lastName}
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  {t("order.clientId")} MD-{order.id.slice(-5)}
                                </p>
                                <p className="text-gray-600">{order.customerEmail}</p>
                                {order.customerPhone && (
                                  <p className="text-gray-600">📞 {order.customerPhone}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {t("order.orderPlacedOn")}{" "}
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Products Ordered */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <h3 className="font-medium">
                                  {t("order.productsOrdered")} (
                                  {order.items?.length || 0})
                                </h3>
                              </div>
                              <div className="space-y-3">
                                {order.items?.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center space-x-3 bg-white p-3 rounded border"
                                  >
                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center overflow-hidden">
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.productName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {item.product.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.category}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        SKU: {item.product.sku}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">Qty: {item.quantity}</p>
                                      <p className="text-sm font-medium">
                                        {t("orders.price", {
                                          price: item.unitPrice,
                                        })}{" "}
                                        DA
                                      </p>
                                      <p className="text-sm font-semibold text-green-600">
                                        {item.totalPrice} DA
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery & Financial Summary */}
                            <div className="space-y-6">
                              {/* Delivery Information */}
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Truck className="h-4 w-4 text-gray-500" />
                                  <h3 className="font-medium">{t("order.delivery")}</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <p className="font-medium">
                                      {t("order.deliveryAddress")}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.shippingAddress.street}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.shippingAddress.city},{" "}
                                      {order.shippingAddress.zipCode}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.shippingAddress.country}
                                    </p>
                                  </div>
                                  <div className="mt-3">
                                    <div className="text-xs font-medium">
                                      {t("orders.estimatedTime")}
                                    </div>
                                    <div className="text-xs text-right">
                                      {order.shippingOption.deliveryTime}
                                    </div>
                                    <div className="text-xs font-medium">
                                      {t("orders.status")}
                                    </div>
                                    <div className="text-xs text-right">
                                      <Badge
                                        className={
                                          order.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : order.status === "in_delivery"
                                              ? "bg-blue-100 text-blue-800"
                                              : order.status === "delivered"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }
                                      >
                                        {order.status === "pending"
                                          ? t("orders.status.onHold")
                                          : order.status === "in_delivery"
                                            ? t("orders.status.shipped")
                                            : order.status === "delivered"
                                              ? t("orders.status.delivered")
                                              : order.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Financial Summary */}
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-gray-500" />
                                  <h3 className="font-medium">
                                    {t("order.financialSummary")}
                                  </h3>
                                </div>
                                <div className="space-y-2 text-sm bg-white p-4 rounded border">
                                  <div className="flex justify-between">
                                    <span>
                                      {t("order.subtotal")} ({order.items?.length || 0}{" "}
                                      {t("order.items")}):
                                    </span>
                                    <span>
                                      {order.totalAmount - order.shippingOption.price} DA
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t("order.deliveryCosts")}</span>
                                    <span className="text-green-600">
                                      {order.shippingOption.price} DA
                                    </span>
                                  </div>
                                  <hr className="my-2" />
                                  <div className="flex justify-between font-semibold text-base">
                                    <span>{t("order.total")}</span>
                                    <span className="text-green-600">
                                      {order.totalAmount} DA
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge
                                      className={
                                        order.paymentStatus === "paid"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }
                                    >
                                      {t("order.payment")}{" "}
                                      {t(`order.${order.paymentStatus}`)}
                                    </Badge>
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
