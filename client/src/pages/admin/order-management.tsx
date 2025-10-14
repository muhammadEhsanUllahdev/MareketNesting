import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import { OrderDetailsModal } from "@/components/ui/order-details-modal";
import OrderAdvancedActions from "./orders/OrderAdvancedActions";

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status:
    | "pending"
    | "in_preparation"
    | "in_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  totalAmount: string;
  vendorName: string;
  itemCount: number;
  trackingNumber: string;
  deliveryDate: string | null;
  shippingAddress: {
    fullName: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingOption?: {
    carrierName: string;
    deliveryTime: string;
  };
  createdAt: string;
  updatedAt: string;
  // user?: {
  //   username: string;
  //   email: string;
  //   firstName?: string;
  //   lastName?: string;
  // };
  items?: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product?: {
      name: string;
      sku: string;
    };
  }[];
}

export default function AdminOrderManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    orderId: "",
    orderNumber: "",
  });

  // Fetch all orders (admin can see all orders)
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.totalAmount.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            <Truck className="w-3 h-3 mr-1" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Package className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "pending" | "delivered" | "cancelled" | "processing" | "shipped"
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      updateStatusMutation.mutate(
        { orderId, status: newStatus },
        {
          onSuccess: () => resolve(),
          onError: () => reject(),
        }
      );
    });
  };

  // Handle toggle row expansion
  const toggleRow = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    // Transform order data to match OrderDetailsModal interface
    const transformedOrder = {
      id: order.id,
      date: order.createdAt,
      customer: {
        name: order.shippingAddress?.fullName
          ? order.shippingAddress.fullName
          : order.shippingAddress.fullName || "Unknown User",
        avatar: "", // Default empty avatar
      },
      orderItems:
        order.items?.map((item) => ({
          id: item.id,
          name: item.product?.name || "Unknown Product",
          description: item.product?.sku || "",
          quantity: item.quantity,
          price: item.unitPrice,
        })) || [],
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus:
        order.status === "delivered"
          ? "Paid"
          : order.status === "cancelled"
          ? "Refunded"
          : "Pending",
      notes: `Shipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`,
    };

    setSelectedOrder(transformedOrder as any);
    setShowOrderDetails(true);
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    const csvHeaders = [
      "Order ID",
      "Customer",
      "Email",
      "Status",
      "Total Amount",
      "Order Date",
      "Shipping Address",
    ];

    const csvRows = filteredOrders.map((order: Order) => [
      order.id.slice(-8),
      order.shippingAddress?.fullName || "",
      order.shippingAddress?.email || "",
      order.status,
      `$${order.totalAmount}`,
      new Date(order.createdAt).toLocaleDateString(),
      `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.country}`,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Orders data has been exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t("orders.pageTitle")}</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">Loading orders...</div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              {t("orders.heading")}
            </h1>
            <p className="text-gray-600">{t("orders.subHeading")}</p>
          </div>

          <Button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-export-orders"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {t("orders.export")}
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t("orders.filters")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("orders.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-orders"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-full lg:w-48"
                  data-testid="select-status-filter"
                >
                  <SelectValue placeholder={t("orders.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("orders.pending")}</SelectItem>
                  <SelectItem value="in_preparation">
                    {t("orders.confirmed")}
                  </SelectItem>
                  <SelectItem value="in_delivery">
                    {t("orders.shipped")}
                  </SelectItem>
                  <SelectItem value="delivered">
                    {t("orders.delivered")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("orders.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("orders.list")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>{t("orders.table.orderNo")}</TableHead>
                    <TableHead>{t("orders.table.customer")}</TableHead>
                    <TableHead>{t("orders.table.status")}</TableHead>
                    <TableHead>{t("orders.table.payment")}</TableHead>
                    <TableHead>{t("orders.table.amount")}</TableHead>
                    <TableHead>{t("orders.table.date")}</TableHead>
                    <TableHead>{t("orders.table.shippingMethod")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{t("orders.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t("orders.noOrders")}
                        </h3>
                        <p className="text-gray-600">
                          {statusFilter !== "all"
                            ? t("orders.noOrdersFiltered", {
                                status: statusFilter,
                              })
                            : t("orders.noOrdersSystem")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order: Order) => {
                      const isExpanded = expandedRows.has(order.id);

                      return (
                        <React.Fragment key={order.id}>
                          {/* Main Order Row */}
                          <TableRow
                            className="hover:bg-gray-50"
                            data-testid={`row-order-${order.id}`}
                          >
                            <TableCell>
                              <input type="checkbox" className="rounded" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRow(order.id)}
                                  className="p-1 h-6 w-6"
                                  data-testid={`button-expand-${order.id}`}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <div className="font-mono text-sm font-medium">
                                    WORD-{order.id.slice(-5)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.items?.length || 0} articles
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {order.shippingAddress.firstName &&
                                  order.shippingAddress.lastName
                                    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                    : order.shippingAddress.fullName ||
                                      "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.shippingAddress?.email || "No email"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                    : order.status === "in_preparation"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : order.status === "in_delivery"
                                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                    : order.status === "delivered"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {order.status === "pending"
                                  ? "On hold"
                                  : order.status === "in_preparation"
                                  ? "In processing"
                                  : order.status === "in_delivery"
                                  ? "Shipped"
                                  : order.status === "delivered"
                                  ? "Book"
                                  : order.status === "cancelled"
                                  ? "Cancelled"
                                  : order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : order.status === "cancelled"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                }
                              >
                                {order.status === "delivered"
                                  ? "Paid"
                                  : order.status === "cancelled"
                                  ? "Refunded"
                                  : order.status === "pending"
                                  ? "On hold"
                                  : "Paid"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {order.totalAmount} DZ
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {order.status === "in_delivery" ||
                                  order.status === "delivered"
                                    ? "Express"
                                    : "Standard"}
                                </Badge>
                                <ChevronDown className="h-3 w-3" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(order.id)}
                                className="text-gray-400"
                              >
                                ›
                              </Button>
                            </TableCell>
                            <TableCell>
                              <OrderAdvancedActions
                                order={{
                                  order_number: order.orderNumber,
                                  customer_id: order.userId,
                                  customer_name:
                                    order.shippingAddress.firstName &&
                                    order.shippingAddress.lastName
                                      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                      : order.shippingAddress.fullName ||
                                        "Unknown User",
                                  customer_email:
                                    order.shippingAddress.email || "",
                                  status: order.status as any,
                                  payment_status: order.paymentStatus as any,
                                  payment_method: order.paymentMethod,
                                  total_amount: Number(order.totalAmount),
                                  vendor_name: order.vendorName,
                                  item_count: order.itemCount,
                                  tracking_number: order.trackingNumber,
                                  delivery_date: order.deliveryDate,
                                  shipping_address: {
                                    street: order.shippingAddress.street,
                                    city: order.shippingAddress.city,
                                    zip: order.shippingAddress.zipCode,
                                    country: order.shippingAddress.country,
                                  },
                                  shippingOption: {
                                    carrierName:
                                      order.shippingOption?.carrierName || "",
                                    deliveryTime:
                                      order.shippingOption?.deliveryTime || "",
                                  },
                                  created_at: order.createdAt,
                                  updated_at: order.updatedAt,
                                  items: order.items
                                    ? order.items.map((item) => ({
                                        id: item.id,
                                        product_id: item.productId,
                                        product_name:
                                          item.product?.name ||
                                          "Unknown Product",
                                        unit_price: item.unitPrice,
                                        total_price: item.totalPrice,
                                        quantity: item.quantity,
                                        image_url: "", // Provide actual image URL if available
                                      }))
                                    : [],
                                  id: order.id,
                                }}
                                onUpdateStatus={handleStatusUpdate}
                              />
                              {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-order-actions-${order.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewOrder(order)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {order.status === "pending" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          "in_preparation"
                                        )
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm Order
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "in_preparation" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          "in_delivery"
                                        )
                                      }
                                    >
                                      <Truck className="h-4 w-4 mr-2" />
                                      Mark as Shipped
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "in_delivery" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          "delivered"
                                        )
                                      }
                                    >
                                      <Package className="h-4 w-4 mr-2" />
                                      Mark as Delivered
                                    </DropdownMenuItem>
                                  )}
                                  {["pending", "in_preparation"].includes(
                                    order.status
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          "cancelled"
                                        )
                                      }
                                      className="text-red-600"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu> */}
                            </TableCell>
                          </TableRow>

                          {/* Expanded Details Row */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={10}>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Customer Information */}
                                    <div className="space-y-4">
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <h3 className="font-semibold">
                                          {t("orders.customerInfo")}
                                        </h3>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <User className="h-3 w-3 text-gray-400" />
                                          <span className="text-sm">
                                            {order.shippingAddress.firstName &&
                                            order.shippingAddress.lastName
                                              ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                              : order.shippingAddress
                                                  .fullName ||
                                                t("orders.unknownUser")}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {t("orders.clientId", {
                                            id: order.id.slice(-6),
                                          })}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Mail className="h-3 w-3 text-gray-400" />
                                          <span className="text-sm">
                                            {order.shippingAddress.email ||
                                              t("orders.noEmail")}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-3 w-3 text-gray-400" />
                                          <span className="text-sm">
                                            {order.shippingAddress.phone ||
                                              t("orders.noPhone")}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          {t("orders.placedOn")}:{" "}
                                          {new Date(
                                            order.createdAt
                                          ).toLocaleDateString("en-GB")}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Products Ordered */}
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
                                        {order.items
                                          ?.slice(0, 2)
                                          .map((item) => (
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
                                                    sku:
                                                      item.product?.sku ||
                                                      "N/A",
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

                                    {/* Delivery */}
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
                                                  {
                                                    order.shippingAddress.city
                                                  },{" "}
                                                  {
                                                    order.shippingAddress
                                                      .zipCode
                                                  }
                                                  <br />
                                                  {
                                                    order.shippingAddress
                                                      .country
                                                  }
                                                </>
                                              ) : (
                                                t("orders.addressNotAvailable")
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-3">
                                          <div className="text-xs font-medium">
                                            {t("orders.method")}
                                          </div>
                                          <div className="text-xs text-right">
                                            {t("orders.freeDelivery")}
                                          </div>
                                          <div className="text-xs font-medium">
                                            {t("orders.estimatedTime")}
                                          </div>
                                          <div className="text-xs text-right">
                                            {t("orders.workingDays")}
                                          </div>
                                          <div className="text-xs font-medium">
                                            {t("orders.status")}
                                          </div>
                                          <div className="text-xs text-right">
                                            <Badge
                                              className={
                                                order.status === "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : order.status ===
                                                    "in_delivery"
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
                                                  count:
                                                    order.items?.length || 0,
                                                })}
                                              </span>
                                              <span>
                                                {(
                                                  parseFloat(
                                                    order.totalAmount
                                                  ) * 0.85
                                                ).toFixed(2)}{" "}
                                                €
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>
                                                {t("orders.deliveryCosts")}
                                              </span>
                                              <span className="text-green-600">
                                                {t("orders.free")}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>{t("orders.vat")}</span>
                                              <span>
                                                {(
                                                  parseFloat(
                                                    order.totalAmount
                                                  ) * 0.15
                                                ).toFixed(2)}{" "}
                                                €
                                              </span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="flex justify-between font-semibold text-lg">
                                              <span>{t("orders.total")}</span>
                                              <span className="text-green-600">
                                                {parseFloat(
                                                  order.totalAmount
                                                ).toFixed(2)}{" "}
                                                €
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                              <span>{t("orders.payment")}</span>
                                              <Badge
                                                className={
                                                  order.status === "delivered"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status ===
                                                      "cancelled"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }
                                              >
                                                {order.status === "delivered"
                                                  ? t("orders.payment.paid")
                                                  : order.status === "cancelled"
                                                  ? t("orders.payment.refunded")
                                                  : t("orders.payment.onHold")}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            isOpen={showOrderDetails}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("orders.confirmDeletion")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("orders.deleteDescription", {
                  orderNumber: deleteDialog.orderNumber,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("orders.cancel")}</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                {t("orders.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
