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

// const StoreRevenues = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedShop, setSelectedShop] = useState<ShopRevenue | null>(null);
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
//   const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // 🔹 Fetch all shop revenues
//   const { data: shops = [], isLoading: isLoadingShops } = useQuery<
//     ShopRevenue[]
//   >({
//     queryKey: ["shop-revenues"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shop-revenues", {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Erreur lors du chargement des revenus");
//       return res.json();
//     },
//   });

//   // 🔹 Fetch global stats
//   const { data: stats, isLoading: isLoadingStats } = useQuery<GlobalStats>({
//     queryKey: ["revenue-global-stats"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shop-revenues/stats", {
//         credentials: "include",
//       });
//       if (!res.ok)
//         throw new Error("Erreur lors du chargement des statistiques");
//       return res.json();
//     },
//   });

//   // 🔹 Handle payment confirmation
//   const paymentMutation = useMutation({
//     mutationFn: async (shopId: string) => {
//       const res = await fetch(`/api/admin/shop-revenues/pay/${shopId}`, {
//         method: "PATCH",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Échec du traitement du paiement");
//       return res.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Paiement confirmé",
//         description: "Le paiement a été marqué comme complété.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["shop-revenues"] });
//       setIsPaymentDialogOpen(false);
//       setSelectedShop(null);
//     },
//     onError: () => {
//       toast({
//         title: "Erreur",
//         description: "Une erreur est survenue lors du traitement du paiement.",
//         variant: "destructive",
//       });
//     },
//   });

//   const filteredShops = shops.filter((shop) => {
//     const matchesSearch =
//       shop.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       shop.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || shop.paymentStatus === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "paid":
//         return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
//       case "pending":
//         return (
//           <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
//         );
//       default:
//         return <Badge variant="outline">Inconnu</Badge>;
//     }
//   };

//   const getGrowthIcon = (growth: number) => {
//     if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
//     if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
//     return null;
//   };

//   const handleViewShopDetails = (shop: ShopRevenue) => {
//     setSelectedShop(shop);
//     setIsDetailsOpen(true);
//   };

//   const handlePaymentRequest = (shop: ShopRevenue) => {
//     setSelectedShop(shop);
//     setIsPaymentDialogOpen(true);
//   };

//   const handleExportReport = () => {
//     try {
//       const csvData = [
//         [
//           "Boutique",
//           "Propriétaire",
//           "Email",
//           "Revenus",
//           "Commission",
//           "Commandes",
//           "Montant En Attente",
//           "Statut Paiement",
//         ],
//         ...filteredShops.map((s) => [
//           s.storeName,
//           s.ownerName,
//           s.ownerEmail,
//           s.totalRevenue,
//           s.commission,
//           s.orders,
//           s.pendingAmount,
//           s.paymentStatus,
//         ]),
//       ];

//       const csvContent = csvData.map((r) => r.join(",")).join("\n");
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `revenus-boutiques-${new Date()
//         .toISOString()
//         .slice(0, 10)}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);

//       toast({
//         title: "Export réussi",
//         description: "Rapport exporté avec succès.",
//       });
//     } catch {
//       toast({
//         title: "Erreur d'export",
//         description: "Une erreur est survenue lors de l'export.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <DashboardLayout title="Revenus des boutiques">
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold">Revenus des boutiques</h1>
//             <p className="text-muted-foreground mt-1">
//               Suivez les revenus et gérez les paiements
//             </p>
//           </div>
//           <Button
//             className="flex items-center gap-2"
//             onClick={handleExportReport}
//           >
//             <Download className="h-4 w-4" />
//             Exporter rapport
//           </Button>
//         </div>

//         {/* Statistiques globales */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {[
//             {
//               label: "Revenus Totaux",
//               value: stats?.totalRevenue,
//               icon: <DollarSign className="text-green-600 h-5 w-5" />,
//             },
//             {
//               label: "Commissions",
//               value: stats?.totalCommission,
//               icon: <Store className="text-blue-600 h-5 w-5" />,
//             },
//             {
//               label: "Paiements en attente",
//               value: stats?.totalPending,
//               icon: <AlertCircle className="text-orange-600 h-5 w-5" />,
//             },
//             {
//               label: "Boutiques actives",
//               value: stats?.activeShopsCount,
//               icon: <CreditCard className="text-purple-600 h-5 w-5" />,
//             },
//           ].map((item) => (
//             <Card key={item.label}>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   {item.icon}
//                   {item.label}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {isLoadingStats ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <div className="text-2xl font-bold">
//                     {item.value?.toLocaleString() ?? 0}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <Tabs defaultValue="overview">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
//             <TabsTrigger value="payments">Paiements</TabsTrigger>
//           </TabsList>

//           <TabsContent value="overview" className="space-y-6">
//             <Card>
//               <CardHeader className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Liste des boutiques</CardTitle>
//                   <p className="text-sm text-muted-foreground">
//                     Revenus et performances
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="relative">
//                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       placeholder="Rechercher..."
//                       className="pl-8 w-[250px]"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </div>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-3 py-2 border rounded-md bg-background"
//                   >
//                     <option value="all">Tous</option>
//                     <option value="pending">En attente</option>
//                     <option value="paid">Payé</option>
//                   </select>
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 {isLoadingShops ? (
//                   <div className="flex items-center justify-center p-8">
//                     <Loader2 className="h-6 w-6 animate-spin mr-2" />{" "}
//                     Chargement...
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Boutique</TableHead>
//                           <TableHead>Propriétaire</TableHead>
//                           <TableHead>Revenus</TableHead>
//                           <TableHead>Commission</TableHead>
//                           <TableHead>Commandes</TableHead>
//                           <TableHead>Statut</TableHead>
//                           <TableHead className="text-right">Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredShops.map((shop) => (
//                           <TableRow key={shop.id}>
//                             <TableCell>{shop.storeName}</TableCell>
//                             <TableCell>{shop.ownerName}</TableCell>
//                             <TableCell>
//                               {shop.totalRevenue.toLocaleString()} DA
//                             </TableCell>
//                             <TableCell>
//                               {shop.commission.toLocaleString()} DA
//                             </TableCell>
//                             <TableCell>{shop.orders}</TableCell>
//                             <TableCell>
//                               {getStatusBadge(shop.paymentStatus)}
//                             </TableCell>
//                             <TableCell className="text-right flex justify-end gap-2">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => handleViewShopDetails(shop)}
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </Button>
//                               {shop.paymentStatus === "pending" && (
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => handlePaymentRequest(shop)}
//                                 >
//                                   <CreditCard className="h-4 w-4 mr-1" />
//                                   Payer
//                                 </Button>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* 🧾 Dialogs */}
//         <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Détails: {selectedShop?.storeName}</DialogTitle>
//             </DialogHeader>
//             {selectedShop && (
//               <div className="space-y-3">
//                 <p>
//                   <b>Propriétaire:</b> {selectedShop.ownerName}
//                 </p>
//                 <p>
//                   <b>Email:</b> {selectedShop.ownerEmail}
//                 </p>
//                 <p>
//                   <b>Revenus totaux:</b>{" "}
//                   {selectedShop.totalRevenue.toLocaleString()} DA
//                 </p>
//                 <p>
//                   <b>Commandes:</b> {selectedShop.orders}
//                 </p>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>

//         <Dialog
//           open={isPaymentDialogOpen}
//           onOpenChange={setIsPaymentDialogOpen}
//         >
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Confirmer le paiement</DialogTitle>
//               <DialogDescription>
//                 Voulez-vous vraiment marquer le paiement comme effectué ?
//               </DialogDescription>
//             </DialogHeader>
//             {selectedShop && (
//               <div className="flex flex-col gap-4">
//                 <div className="p-3 bg-muted rounded-lg">
//                   <p>
//                     Boutique: <b>{selectedShop.storeName}</b>
//                   </p>
//                   <p>
//                     Montant:{" "}
//                     <b className="text-green-600">
//                       {selectedShop.pendingAmount.toLocaleString()} DA
//                     </b>
//                   </p>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsPaymentDialogOpen(false)}
//                   >
//                     <X className="h-4 w-4 mr-1" /> Annuler
//                   </Button>
//                   <Button
//                     onClick={() => paymentMutation.mutate(selectedShop.id)}
//                     disabled={paymentMutation.isPending}
//                   >
//                     {paymentMutation.isPending ? "Traitement..." : "Confirmer"}
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// };
const StoreRevenues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<ShopRevenue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: shops = [], isLoading: isLoadingShops } = useQuery<ShopRevenue[]>({
    queryKey: ["shop-revenues"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shop-revenues", { credentials: "include" });
      if (!res.ok) throw new Error(t("storeRevenues.fetchError"));
      return res.json();
    },
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<GlobalStats>({
    queryKey: ["revenue-global-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shop-revenues/stats", { credentials: "include" });
      if (!res.ok) throw new Error(t("storeRevenues.fetchStatsError"));
      return res.json();
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const res = await fetch(`/api/admin/shop-revenues/pay/${shopId}`, { method: "PATCH", credentials: "include" });
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

  const filteredShops = shops.filter(shop => {
    const matchesSearch =
      shop.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || shop.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">{t("storeRevenues.filterPaid")}</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">{t("storeRevenues.filterPending")}</Badge>;
      default:
        return <Badge variant="outline">{t("storeRevenues.unknown")}</Badge>;
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
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
          "Email",
          t("storeRevenues.revenue"),
          t("storeRevenues.commission"),
          t("storeRevenues.orders"),
          t("storeRevenues.pendingPayments"),
          t("storeRevenues.status"),
        ],
        ...filteredShops.map(s => [
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

      const csvContent = csvData.map(r => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-revenues-${new Date().toISOString().slice(0, 10)}.csv`;
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
            <h1 className="text-3xl font-bold">{t("storeRevenues.pageTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("storeRevenues.pageDescription")}</p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            {t("storeRevenues.exportReport")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: t("storeRevenues.totalRevenue"), value: stats?.totalRevenue, icon: <DollarSign className="text-green-600 h-5 w-5" /> },
            { label: t("storeRevenues.commissions"), value: stats?.totalCommission, icon: <Store className="text-blue-600 h-5 w-5" /> },
            { label: t("storeRevenues.pendingPayments"), value: stats?.totalPending, icon: <AlertCircle className="text-orange-600 h-5 w-5" /> },
            { label: t("storeRevenues.activeShops"), value: stats?.activeShopsCount, icon: <CreditCard className="text-purple-600 h-5 w-5" /> },
          ].map(item => (
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
                  <div className="text-2xl font-bold">{item.value?.toLocaleString() ?? 0}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">{t("storeRevenues.overviewTab")}</TabsTrigger>
            <TabsTrigger value="payments">{t("storeRevenues.paymentsTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("storeRevenues.shopList")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("storeRevenues.performance")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("storeRevenues.searchPlaceholder")}
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">{t("storeRevenues.filterAll")}</option>
                    <option value="pending">{t("storeRevenues.filterPending")}</option>
                    <option value="paid">{t("storeRevenues.filterPaid")}</option>
                  </select>
                </div>
              </CardHeader>

              <CardContent>
                {isLoadingShops ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> {t("storeRevenues.processing")}
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
                          <TableHead className="text-right">{t("storeRevenues.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredShops.map(shop => (
                          <TableRow key={shop.id}>
                            <TableCell>{shop.storeName}</TableCell>
                            <TableCell>{shop.ownerName}</TableCell>
                            <TableCell>{shop.totalRevenue.toLocaleString()} DA</TableCell>
                            <TableCell>{shop.commission.toLocaleString()} DA</TableCell>
                            <TableCell>{shop.orders}</TableCell>
                            <TableCell>{getStatusBadge(shop.paymentStatus)}</TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewShopDetails(shop)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {shop.paymentStatus === "pending" && (
                                <Button variant="outline" size="sm" onClick={() => handlePaymentRequest(shop)}>
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
                <p><b>{t("storeRevenues.owner")}:</b> {selectedShop.ownerName}</p>
                <p><b>Email:</b> {selectedShop.ownerEmail}</p>
                <p><b>{t("storeRevenues.revenue")}:</b> {selectedShop.totalRevenue.toLocaleString()} DA</p>
                <p><b>{t("storeRevenues.orders")}:</b> {selectedShop.orders}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("storeRevenues.confirmPayment")}</DialogTitle>
              <DialogDescription>{t("storeRevenues.confirmPaymentDesc")}</DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p>{t("storeRevenues.shop")}: <b>{selectedShop.storeName}</b></p>
                  <p>
                    {t("storeRevenues.amount")}: <b className="text-green-600">{selectedShop.pendingAmount.toLocaleString()} DA</b>
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    <X className="h-4 w-4 mr-1" /> {t("storeRevenues.cancel")}
                  </Button>
                  <Button onClick={() => paymentMutation.mutate(selectedShop.id)} disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? t("storeRevenues.processing") : t("storeRevenues.confirm")}
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
