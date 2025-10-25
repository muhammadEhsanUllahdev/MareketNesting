import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Download,
  Eye,
  CreditCard,
  AlertCircle,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// 🧩 Types
interface ShopRevenue {
  id: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  storeStatus: string;
  totalRevenue: number;
  commission: number;
  monthlyGrowth: number;
  pendingAmount: number;
  paymentStatus: "pending" | "paid";
  orders: number;
}

interface GlobalStats {
  totalRevenue: number;
  totalCommission: number;
  totalPending: number;
  activeShopsCount: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processed";
  bankAccountInfo: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    iban?: string;
  };
  sellerId: string;
  createdAt: string;
  processedAt?: string;
}

const StoreRevenues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<ShopRevenue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: shops = [], isLoading: isLoadingShops } = useQuery<
    ShopRevenue[]
  >({
    queryKey: ["shop-revenues"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shop-revenues", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("storeRevenues.fetchError"));
      return res.json();
    },
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<GlobalStats>({
    queryKey: ["revenue-global-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shop-revenues/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("storeRevenues.fetchStatsError"));
      return res.json();
    },
  });

  const { data: withdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<
    Withdrawal[]
  >({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const res = await fetch("/api/admin/withdrawals", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("withdraw.errorLoading"));
      return res.json();
    },
  });

  const updateWithdrawalMutation = useMutation({
  mutationFn: async ({
    id,
    status,
  }: {
    id: string;
    status: "approved" | "rejected";
  }) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(t("withdraw.updateStatusError"));
    return res.json();
  },
  onSuccess: () => {
    toast({ title: t("withdraw.statusUpdated") });
    queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
  },
  onError: () => {
    toast({
      title: t("common.error"),
      description: t("withdraw.unableToChangeStatus"),
      variant: "destructive",
    });
  },
});


  // 🔹 Handle payment confirmation
  const paymentMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const res = await fetch(`/api/admin/shop-revenues/pay/${shopId}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("storeRevenues.paymentError"));
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("storeRevenues.paymentConfirmed"),
        description: t("storeRevenues.paymentConfirmedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["shop-revenues"] });
      setIsPaymentDialogOpen(false);
      setSelectedShop(null);
    },
    onError: () => {
      toast({
        title: t("storeRevenues.paymentError"),
        description: t("storeRevenues.paymentErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || shop.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("storeRevenues.filterPaid")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {t("storeRevenues.filterPending")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("storeRevenues.unknown")}</Badge>;
    }
  };
  const getWithdrawalStatusBadge = (status: string) => {
    const map = {
      pending: {
        text: "En attente",
        color: "text-yellow-700 border-yellow-500",
      },
      approved: { text: "Approuvé", color: "text-blue-700 border-blue-500" },
      processed: { text: "Traité", color: "text-green-700 border-green-500" },
      rejected: { text: "Rejeté", color: "text-red-700 border-red-500" },
    } as const;
    const s = map[status as keyof typeof map];
    return (
      <Badge variant="outline" className={s?.color}>
        {s?.text}
      </Badge>
    );
  };


  const handleViewShopDetails = (shop: ShopRevenue) => {
    setSelectedShop(shop);
    setIsDetailsOpen(true);
  };

  const handlePaymentRequest = (shop: ShopRevenue) => {
    setSelectedShop(shop);
    setIsPaymentDialogOpen(true);
  };

  const handleExportReport = () => {
    try {
      const csvData = [
        [
          t("storeRevenues.shopList"),
          t("storeRevenues.owner"),
          t("storeRevenues.email"),
          t("storeRevenues.revenue"),
          t("storeRevenues.commission"),
          t("storeRevenues.orders"),
          t("storeRevenues.pendingPayments"),
          t("storeRevenues.status"),
        ],
        ...filteredShops.map((s) => [
          s.storeName,
          s.ownerName,
          s.ownerEmail,
          s.totalRevenue,
          s.commission,
          s.orders,
          s.pendingAmount,
          s.paymentStatus,
        ]),
      ];

      const csvContent = csvData.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-revenues-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: t("storeRevenues.exportSuccess"),
        description: t("storeRevenues.exportSuccessDesc"),
      });
    } catch {
      toast({
        title: t("storeRevenues.exportError"),
        description: t("storeRevenues.exportErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title={t("storeRevenues.pageTitle")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {t("storeRevenues.pageTitle")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("storeRevenues.pageDescription")}
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4" />
            {t("storeRevenues.exportReport")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: t("storeRevenues.totalRevenue"),
              value: stats?.totalRevenue,
              icon: <DollarSign className="text-green-600 h-5 w-5" />,
            },
            {
              label: t("storeRevenues.commissions"),
              value: stats?.totalCommission,
              icon: <Store className="text-blue-600 h-5 w-5" />,
            },
            {
              label: t("storeRevenues.pendingPayments"),
              value: stats?.totalPending,
              icon: <AlertCircle className="text-orange-600 h-5 w-5" />,
            },
            {
              label: t("storeRevenues.activeShops"),
              value: stats?.activeShopsCount,
              icon: <CreditCard className="text-purple-600 h-5 w-5" />,
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold">
                    {item.value?.toLocaleString() ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">
              {t("storeRevenues.overviewTab")}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {t("storeRevenues.paymentsTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("storeRevenues.shopList")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("storeRevenues.performance")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("storeRevenues.searchPlaceholder")}
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">{t("storeRevenues.filterAll")}</option>
                    <option value="pending">
                      {t("storeRevenues.filterPending")}
                    </option>
                    <option value="paid">
                      {t("storeRevenues.filterPaid")}
                    </option>
                  </select>
                </div>
              </CardHeader>

              <CardContent>
                {isLoadingShops ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />{" "}
                    {t("storeRevenues.processing")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("storeRevenues.shopList")}</TableHead>
                          <TableHead>{t("storeRevenues.owner")}</TableHead>
                          <TableHead>{t("storeRevenues.revenue")}</TableHead>
                          <TableHead>{t("storeRevenues.commission")}</TableHead>
                          <TableHead>{t("storeRevenues.orders")}</TableHead>
                          <TableHead>{t("storeRevenues.status")}</TableHead>
                          <TableHead className="text-right">
                            {t("storeRevenues.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredShops.map((shop) => (
                          <TableRow key={shop.id}>
                            <TableCell>{shop.storeName}</TableCell>
                            <TableCell>{shop.ownerName}</TableCell>
                            <TableCell>
                              {shop.totalRevenue.toLocaleString()} DA
                            </TableCell>
                            <TableCell>
                              {shop.commission.toLocaleString()} DA
                            </TableCell>
                            <TableCell>{shop.orders}</TableCell>
                            <TableCell>
                              {getStatusBadge(shop.paymentStatus)}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewShopDetails(shop)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {shop.paymentStatus === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePaymentRequest(shop)}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  {t("storeRevenues.payButton")}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="space-y-6">
            <Card>
  <CardHeader>
    <CardTitle>{t("withdraw.requests")}</CardTitle>
  </CardHeader>
  <CardContent>
    {isLoadingWithdrawals ? (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> {t("common.loading")}
      </div>
    ) : withdrawals.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        {t("withdraw.noneFound")}
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{t("withdraw.amount")}</TableHead>
            <TableHead>{t("withdraw.bank")}</TableHead>
            <TableHead>{t("withdraw.holder")}</TableHead>
            <TableHead>{t("withdraw.status")}</TableHead>
            <TableHead>{t("withdraw.date")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((w) => (
            <TableRow key={w.id}>
              <TableCell>#{w.id.slice(0, 8)}</TableCell>
              <TableCell>{w.amount.toLocaleString()} DA</TableCell>
              <TableCell>{w.bankAccountInfo.bank_name}</TableCell>
              <TableCell>{w.bankAccountInfo.account_holder_name}</TableCell>
              <TableCell>{getWithdrawalStatusBadge(w.status)}</TableCell>
              <TableCell>{new Date(w.createdAt).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell className="text-right space-x-2">
                {w.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateWithdrawalMutation.mutate({
                          id: w.id,
                          status: "approved",
                        })
                      }
                    >
                      <Check className="h-4 w-4 mr-1" /> {t("withdraw.approve")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateWithdrawalMutation.mutate({
                          id: w.id,
                          status: "rejected",
                        })
                      }
                    >
                      <X className="h-4 w-4 mr-1" /> {t("withdraw.reject")}
                    </Button>
                  </>
                )}
                {w.status !== "pending" && (
                  <Badge variant="outline">{t("withdraw.noAction")}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </CardContent>
</Card>

          </TabsContent>
        </Tabs>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t("storeRevenues.details")}: {selectedShop?.storeName}
              </DialogTitle>
            </DialogHeader>
            {selectedShop && (
              <div className="space-y-3">
                <p>
                  <b>{t("storeRevenues.owner")}:</b> {selectedShop.ownerName}
                </p>
                <p>
                  <b>{t("storeRevenues.email")}</b> {selectedShop.ownerEmail}
                </p>
                <p>
                  <b>{t("storeRevenues.revenue")}:</b>{" "}
                  {selectedShop.totalRevenue.toLocaleString()} DA
                </p>
                <p>
                  <b>{t("storeRevenues.orders")}:</b> {selectedShop.orders}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("storeRevenues.confirmPayment")}</DialogTitle>
              <DialogDescription>
                {t("storeRevenues.confirmPaymentDesc")}
              </DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p>
                    {t("storeRevenues.shop")}: <b>{selectedShop.storeName}</b>
                  </p>
                  <p>
                    {t("storeRevenues.amount")}:{" "}
                    <b className="text-green-600">
                      {selectedShop.pendingAmount.toLocaleString()} DA
                    </b>
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentDialogOpen(false)}
                  >
                    <X className="h-4 w-4 mr-1" /> {t("storeRevenues.cancel")}
                  </Button>
                  <Button
                    onClick={() => paymentMutation.mutate(selectedShop.id)}
                    disabled={paymentMutation.isPending}
                  >
                    {paymentMutation.isPending
                      ? t("storeRevenues.processing")
                      : t("storeRevenues.confirm")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StoreRevenues;
