import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MapPin,
  ShoppingBag,
  DollarSign,
  Settings,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("orders.status.pending");
      case "in_preparation":
        return t("orders.status.inPreparation");
      case "in_delivery":
        return t("orders.status.inDelivery");
      case "delivered":
        return t("orders.status.delivered");
      case "cancelled":
        return t("orders.status.cancelled");
      default:
        return status;
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
  throw new Error(t("error.failedToCancelOrder"));
}
      return res.json();
    },
    onSuccess: (data, orderId) => {
      // Refresh orders after cancellation
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

      toast({
        title: t("orders.filters.status.cancelled"),
        description: t("orderActions.messages.cancel", { id: orderId }),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("orders.error.cancelFailedTitle"),
        description: error.message || t("orders.error.cancelFailedMessage"),
        variant: "destructive",
      });
    },
  });

  const getOrdersByStatus = (status: string) =>
    status === "all" ? orders : orders.filter((o) => o.status === status);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {t("orders.loginRequired")}
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {t("orders.errorTitle")}
        </h2>
        <p className="text-gray-600">{t("orders.errorMessage")}</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {t("status.pending")}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("status.confirmed")}
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            <Truck className="w-3 h-3 mr-1" />
            {t("status.shipped")}
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Package className="w-3 h-3 mr-1" />
            {t("status.delivered")}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t("status.cancelled")}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-gray-400 text-white hover:bg-gray-200">
            <Settings className="w-3 h-3 mr-1" />
            {t("status.processing")}
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-green-600 text-white hover:bg-green-200">
            <DollarSign className="w-3 h-3 mr-1" />
            {t("status.refunded")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title={t("orders.title")} subtitle={t("orders.subtitle")}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
            {/* <Button className="gap-2" data-testid="button-order-again">
              <Package className="w-4 h-4" />
              {t("orders.orderAgain")}
            </Button> */}
          </div>
        </div>

        <Card>
          <CardHeader className="text-lg font-medium p-4 border-b">
            {t("tracking.orderTracking")}
          </CardHeader>
          <CardContent>
            <Tabs
              className="mt-4"
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <div className="grid grid-cols-12 items-center gap-4 mb-6">
                <div className="col-span-8">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="all">
                      {t("orders.tabs.all", { count: orders.length })}
                    </TabsTrigger>
                    <TabsTrigger value="in_preparation">
                      {t("orders.tabs.inPreparation", {
                        count: getOrdersByStatus("in_preparation").length,
                      })}
                    </TabsTrigger>
                    <TabsTrigger value="in_delivery">
                      {t("orders.tabs.inDelivery", {
                        count: getOrdersByStatus("in_delivery").length,
                      })}
                    </TabsTrigger>
                    <TabsTrigger value="delivered">
                      {t("orders.tabs.delivered", {
                        count: getOrdersByStatus("delivered").length,
                      })}
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                      {t("orders.tabs.cancelled", {
                        count: getOrdersByStatus("cancelled").length,
                      })}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="col-span-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={t("orders.searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {t("orders.filter")}
                  </Button>
                </div>
              </div>

              <TabsContent value={selectedStatus} className="mt-6">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-2"
                >
                  {filteredOrders.map((order) => (
                    <AccordionItem
                      className="bg-gray-100 shadow-md rounded-lg px-4"
                      key={order.id}
                      value={order.id}
                    >
                      <AccordionTrigger className="flex items-center justify-between">
                        <div className="flex justify-between w-full items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white">
                              <ShoppingBag className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 font-semibold text-gray-800">
                                {order.orderNumber}
                                <div className="rounded-full px-2 py-0.5 text-xs font-medium">
                                  {getStatusBadge(order.status)}
                                </div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {formatDate(order.createdAt)} •{"  "}
                                {order.items[0]?.vendorName || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {formatPrice(order.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {t("orders.itemCount", {
                                count: order.itemCount,
                              })}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              {t("orders.details.title")}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                {t("orders.details.shop")}:{" "}
                                {order.items[0]?.vendorName || "N/A"}
                              </div>
                              <div>
                                {t("orders.details.date")}:{" "}
                                {formatDate(order.createdAt)}
                              </div>
                              <div>
                                {t("orders.details.items")}: {order.itemCount}
                              </div>
                              <div>
                                {t("orders.details.total")}:{" "}
                                {formatPrice(order.totalAmount)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">
                              {t("orders.delivery.title")}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                {t("orders.delivery.status")}:{" "}
                                {getStatusLabel(order.status)}
                              </div>
                              <div>
                                {t("orders.delivery.payment")}:{" "}
                                {order.paymentMethod}
                              </div>
                              {order.trackingNumber && (
                                <div>
                                  {t("orders.delivery.trackingNumber")}:{" "}
                                  {order.trackingNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap mt-6 gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                {t("orders.actions.fullDetails")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {t("orders.actions.fullDetails")} -{" "}
                                  {order.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p>
                                  <b>{t("orders.details.shop")}:</b>{" "}
                                  {order.vendorName}
                                </p>
                                <p>
                                  <b>{t("orders.details.date")}:</b>{" "}
                                  {formatDate(order.createdAt)}
                                </p>
                                <p>
                                  <b>{t("orders.details.items")}:</b>{" "}
                                  {order.itemCount}
                                </p>
                                <p>
                                  <b>{t("orders.details.total")}:</b>{" "}
                                  {formatPrice(order.totalAmount)}
                                </p>
                                <p>
                                  <b>{t("orders.delivery.payment")}:</b>{" "}
                                  {order.paymentMethod}
                                </p>
                                {order.trackingNumber && (
                                  <p>
                                    <b>
                                      {t("orders.delivery.trackingNumber")}:
                                    </b>{" "}
                                    {order.trackingNumber}
                                  </p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {order.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              {t("orders.actions.trackDelivery")}
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Package className="w-4 h-4" />
                              {t("orders.orderAgain")}
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  {t("orders.cancelOrder")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {t("orders.confirmCancelOrder")}
                                  </DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-gray-600">
                                  {t("order.confirmCancelMessage", {
                                    orderNumber: order.orderNumber,
                                  })}
                                </p>
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button variant="outline" size="sm">
                                    {t("common.no")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      cancelOrderMutation.mutate(order.id);
                                    }}
                                  >
                                    {cancelOrderMutation.isPending
                                      ? t("common.loading") + "..."
                                      : t("common.yes")}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {order.status === "pending" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  {t("orders.actions.cancelOrder")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {t("orders.confirmCancelOrder")}
                                  </DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-gray-600">
                                  {t("order.confirmCancelMessage", {
                                    orderNumber: order.orderNumber,
                                  })}
                                </p>
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button variant="outline" size="sm">
                                    {t("common.no")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      cancelOrderMutation.mutate(order.id);
                                    }}
                                  >
                                    {cancelOrderMutation.isPending
                                      ? t("common.loading") + "..."
                                      : t("common.yes")}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
