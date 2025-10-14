import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Search,
  FileDown,
  MoreHorizontal,
  CheckCircle,
  Repeat,
  Snowflake,
  CreditCard,
  MessageCircle,
  Phone,
  Eye,
  AlertTriangle,
  X,
  Ban,
  User,
} from "lucide-react";
import OrderAdvancedActions from "../admin/orders/OrderAdvancedActions";
import { get } from "http";
import { Separator } from "@/components/ui/separator";
interface SellerOrder {
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
  shippingOption: {
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

export default function SellerOrdersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery<SellerOrder[]>({
    queryKey: ["sellerOrders"],
    queryFn: async () => {
      const res = await fetch("/api/seller/orders");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order.totalAmount === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Get status badge configuration
  const getStatusBadge = (status: string) => {
    const configs: Record<string, { text: string; className: string }> = {
      on_hold: {
        text: t("status.on_hold"),
        className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      },
      in_processing: {
        text: t("status.in_processing"),
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      shipped: {
        text: t("status.shipped"),
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
      delivered: {
        text: t("status.delivered"),
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      cancelled: {
        text: t("status.cancelled"),
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      refunded: {
        text: t("status.refunded"),
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      confirmed: {
        text: t("status.confirmed"),
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      pending: {
        text: t("status.pending"),
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
    };

    const config = configs[status] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const getPaymentBadge = (payment: string) => {
    const configs: Record<string, { text: string; className: string }> = {
      on_hold: {
        text: t("payment.on_hold"),
        className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      },
      paid: {
        text: t("payment.paid"),
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      failed: {
        text: t("payment.failed"),
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      refunded: {
        text: t("payment.refunded"),
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
    };

    const config = configs[payment] || {
      text: payment,
      className: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.className}>{config.text}</Badge>;
  };

  // Handle order actions
  const handleOrderAction = (action: string, orderId: string) => {
    const actionMessages: Record<string, string> = {
      validate: t("orderActions.validate"),
      repay: t("orderActions.repay"),
      freeze: t("orderActions.freeze"),
      unlock: t("orderActions.unlock"),
      contact: t("orderActions.contact"),
      call: t("orderActions.call"),
      history: t("orderActions.history"),
      report: t("orderActions.report"),
      cancel: t("orderActions.cancel"),
    };

    toast({
      title: t("orderActions.completed"),
      description:
        actionMessages[action] || t("orderActions.default", { action }),
    });
  };

  // Handle export
  const handleExport = () => {
    toast({
      title: t("export.started"),
      description: t("export.description"),
    });
  };

  const handleViewOrder = (order: SellerOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

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
      if (!response.ok) throw new Error(t("orders.update.error"));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: t("orders.update.successTitle"),
        description: t("orders.update.successDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("orders.update.errorTitle"),
        description: t("orders.update.errorDescription"),
        variant: "destructive",
      });
    },
  });

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("orders.page.title")}</h1>
            <p className="text-gray-600 mt-1">{t("orders.page.subtitle")}</p>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>{t("orders.page.export")}</span>
          </Button>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {t("orders.list.title", { count: filteredOrders.length })}
              </span>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("orders.list.searchPlaceholder")}
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("orders.filters.status.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("orders.filters.status.all")}
                    </SelectItem>
                    <SelectItem value="on_hold">
                      {t("orders.filters.status.on_hold")}
                    </SelectItem>
                    <SelectItem value="in_processing">
                      {t("orders.filters.status.in_processing")}
                    </SelectItem>
                    <SelectItem value="shipped">
                      {t("orders.filters.status.shipped")}
                    </SelectItem>
                    <SelectItem value="delivered">
                      {t("orders.filters.status.delivered")}
                    </SelectItem>
                    <SelectItem value="cancelled">
                      {t("orders.filters.status.cancelled")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Payment Filter */}
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue
                      placeholder={t("orders.filters.payment.all")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("orders.filters.payment.all")}
                    </SelectItem>
                    <SelectItem value="paid">
                      {t("orders.filters.payment.paid")}
                    </SelectItem>
                    <SelectItem value="on_hold">
                      {t("orders.filters.payment.on_hold")}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("orders.filters.payment.failed")}
                    </SelectItem>
                    <SelectItem value="refunded">
                      {t("orders.filters.payment.refunded")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("orders.table.order")}</TableHead>
                    <TableHead>{t("orders.table.client")}</TableHead>
                    <TableHead>{t("orders.table.status")}</TableHead>
                    <TableHead>{t("orders.table.payment")}</TableHead>
                    <TableHead>{t("orders.table.paymentStatus")}</TableHead>
                    <TableHead>{t("orders.table.amount")}</TableHead>
                    <TableHead>{t("orders.table.date")}</TableHead>
                    <TableHead>{t("orders.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t("orders.empty.title")}
                        </h3>
                        <p className="text-gray-600">
                          {searchQuery
                            ? t("orders.empty.search")
                            : t("orders.empty.noFilters")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.orderNumber}
                            </div>
                            {/* <div className="text-sm text-gray-500">
                              {order.productTypes}
                            </div> */}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {order.shippingAddress.firstName &&
                                order.shippingAddress.lastName
                                  ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                  : order.shippingAddress.fullName ||
                                    "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.shippingAddress.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {getPaymentBadge(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {getPaymentBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {order.totalAmount.toLocaleString()} €
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <TableCell className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                                        item.product?.name || "Unknown Product",
                                      unit_price: item.unitPrice,
                                      total_price: item.totalPrice,
                                      quantity: item.quantity,
                                      image_url: "",
                                    }))
                                  : [],
                                id: order.id,
                              }}
                              onUpdateStatus={handleStatusUpdate}
                            />
                          </TableCell>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>🧾 Order #{selectedOrder.orderNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Order Summary */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Status: {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment: {getPaymentBadge(selectedOrder.paymentStatus)}
                    </p>
                  </div>
                  <div className="text-right font-semibold">
                    Total: {selectedOrder.totalAmount} €
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Customer Details</h3>
                  <p>
                    <strong>{selectedOrder.shippingAddress.fullName}</strong>
                  </p>
                  <p>{selectedOrder.shippingAddress.email}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p>
                    {selectedOrder.shippingAddress.street},{" "}
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state},{" "}
                    {selectedOrder.shippingAddress.zipCode},{" "}
                    {selectedOrder.shippingAddress.country}
                  </p>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Items Ordered</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product?.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unitPrice} €</TableCell>
                              <TableCell>{item.totalPrice} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
