// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import {
//   User,
//   Package,
//   Star,
//   MessageSquare,
//   TrendingUp,
//   Calendar,
// } from "lucide-react";
// // import { supabase } from '@/integrations/supabase/client';
// import { useToast } from "@/hooks/use-toast";

// interface CustomerHistoryDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   customerId: string;
//   customerName: string;
//   customerEmail: string;
// }

// interface CustomerStats {
//   totalOrders: number;
//   totalSpent: number;
//   averageOrderValue: number;
//   lastOrderDate: string;
//   joinDate: string;
// }

// interface OrderHistory {
//   id: string;
//   orderNumber: string;
//   status: string;
//   totalAmount: number;
//   createdAt: string;
//   itemCount: number;
// }

// const CustomerHistoryDialog = ({
//   open,
//   onOpenChange,
//   customerId,
//   customerName,
//   customerEmail,
// }: CustomerHistoryDialogProps) => {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState<CustomerStats | null>(null);
//   const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);

//   useEffect(() => {
//     if (open && customerId) {
//       fetchCustomerData();
//     }
//   }, [open, customerId]);

//   const fetchCustomerData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/customers/${customerId}`);
//       if (!res.ok) throw new Error("Failed to fetch customer data");

//       const data = await res.json();

//       // data contains: user info, stats, orderHistory
//       setStats(data.stats);
//       setOrderHistory(data.orderHistory || []);
//     } catch (error) {
//       console.error("Erreur lors du chargement de l'historique:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de charger l'historique du client",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const fetchCustomerData = async () => {
//   //   setLoading(true);
//   //   // try {
//   //   //   // Récupérer les statistiques du client
//   //   //   const { data: orders, error: ordersError } = await supabase
//   //   //     .from('orders')
//   //   //     .select('*')
//   //   //     .eq('customer_id', customerId)
//   //   //     .order('created_at', { ascending: false });

//   //   //   if (ordersError) throw ordersError;

//   //   //   // Calculer les statistiques
//   //   //   const totalOrders = orders?.length || 0;
//   //   //   const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
//   //   //   const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
//   //   //   const lastOrderDate = orders?.[0]?.created_at || '';
//   //   //   const joinDate = orders?.[orders.length - 1]?.created_at || '';

//   //   //   setStats({
//   //   //     totalOrders,
//   //   //     totalSpent,
//   //   //     averageOrderValue,
//   //   //     lastOrderDate,
//   //   //     joinDate
//   //   //   });

//   //   //   setOrderHistory(orders || []);
//   //   // } catch (error) {
//   //   //   console.error('Erreur lors du chargement de l\'historique:', error);
//   //   //   toast({
//   //   //     title: "Erreur",
//   //   //     description: "Impossible de charger l'historique du client",
//   //   //     variant: "destructive",
//   //   //   });
//   //   // } finally {
//   //   //   setLoading(false);
//   //   // }
//   // };

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       pending: {
//         variant: "outline",
//         label: "En attente",
//         color: "text-yellow-600",
//       },
//       processing: {
//         variant: "outline",
//         label: "En cours",
//         color: "text-blue-600",
//       },
//       shipped: {
//         variant: "outline",
//         label: "Expédiée",
//         color: "text-purple-600",
//       },
//       delivered: {
//         variant: "outline",
//         label: "Livrée",
//         color: "text-green-600",
//       },
//       cancelled: {
//         variant: "outline",
//         label: "Annulée",
//         color: "text-red-600",
//       },
//       refunded: {
//         variant: "outline",
//         label: "Remboursée",
//         color: "text-gray-600",
//       },
//     };

//     const config = statusConfig[status as keyof typeof statusConfig] || {
//       variant: "outline",
//       label: status,
//       color: "text-gray-600",
//     };

//     return (
//       <Badge variant={config.variant as any} className={config.color}>
//         {config.label}
//       </Badge>
//     );
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("fr-FR", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // const formatCurrency = (amount: number) => {
//   //   return `${(amount ?? 0).toLocaleString("fr-FR")} DA`;
//   // };
//   const formatCurrency = (amount?: number | null) => {
//     return `${Math.round(amount ?? 0).toLocaleString("fr-FR")} DA`;
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <User className="h-5 w-5" />
//             Historique du client
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Informations client */}
//           <div className="bg-muted/50 p-4 rounded-lg">
//             <h3 className="font-semibold mb-2">Informations client</h3>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="text-muted-foreground">Nom: </span>
//                 <span className="font-medium">{customerName}</span>
//               </div>
//               <div>
//                 <span className="text-muted-foreground">Email: </span>
//                 <span className="font-medium">{customerEmail}</span>
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//             </div>
//           ) : (
//             <>
//               {/* Statistiques */}
//               {stats && (
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-blue-50 p-4 rounded-lg text-center">
//                     <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-blue-600">
//                       {stats.totalOrders}
//                     </div>
//                     <div className="text-sm text-blue-600">Commandes</div>
//                   </div>

//                   <div className="bg-green-50 p-4 rounded-lg text-center">
//                     <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-green-600">
//                       {formatCurrency(stats.totalSpent)}
//                     </div>
//                     <div className="text-sm text-green-600">Total dépensé</div>
//                   </div>

//                   <div className="bg-purple-50 p-4 rounded-lg text-center">
//                     <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-purple-600">
//                       {formatCurrency(stats.averageOrderValue)}
//                     </div>
//                     <div className="text-sm text-purple-600">Panier moyen</div>
//                   </div>

//                   <div className="bg-orange-50 p-4 rounded-lg text-center">
//                     <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
//                     <div className="text-lg font-bold text-orange-600">
//                       {stats.lastOrderDate
//                         ? formatDate(stats.lastOrderDate)
//                         : "N/A"}
//                     </div>
//                     <div className="text-sm text-orange-600">
//                       Dernière commande
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Historique des commandes */}
//               <div>
//                 <h3 className="font-semibold mb-4 flex items-center gap-2">
//                   <Package className="h-4 w-4" />
//                   Historique des commandes ({orderHistory.length})
//                 </h3>

//                 <ScrollArea className="h-96 border rounded-lg">
//                   <div className="p-4 space-y-3">
//                     {orderHistory.length === 0 ? (
//                       <div className="text-center py-8 text-muted-foreground">
//                         Aucune commande trouvée pour ce client
//                       </div>
//                     ) : (
//                       orderHistory.map((order, index) => (
//                         <div key={order.id}>
//                           <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
//                             <div className="flex-1">
//                               <div className="flex items-center gap-3 mb-2">
//                                 <span className="font-medium">
//                                   #{order.orderNumber}
//                                 </span>
//                                 {getStatusBadge(order.status)}
//                               </div>
//                               <div className="text-sm text-muted-foreground">
//                                 {formatDate(order.createdAt)} •{" "}
//                                 {order.itemCount} article(s)
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="font-semibold">
//                                 {formatCurrency(order.totalAmount)}
//                               </div>
//                             </div>
//                           </div>
//                           {index < orderHistory.length - 1 && <Separator />}
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </ScrollArea>
//               </div>
//             </>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CustomerHistoryDialog;



import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  Star,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CustomerHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  customerEmail: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  joinDate: string;
}

interface OrderHistory {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

const CustomerHistoryDialog = ({
  open,
  onOpenChange,
  customerId,
  customerName,
  customerEmail,
}: CustomerHistoryDialogProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerData();
    }
  }, [open, customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (!res.ok) throw new Error("Failed to fetch customer data");

      const data = await res.json();
      setStats(data.stats);
      setOrderHistory(data.orderHistory || []);
    } catch (error) {
      console.error("Error loading history:", error);
      toast({
        title: t("customerHistory.error.title"),
        description: t("customerHistory.error.message"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: t("customerHistory.status.pending"), color: "text-yellow-600" },
      processing: { label: t("customerHistory.status.processing"), color: "text-blue-600" },
      shipped: { label: t("customerHistory.status.shipped"), color: "text-purple-600" },
      delivered: { label: t("customerHistory.status.delivered"), color: "text-green-600" },
      cancelled: { label: t("customerHistory.status.cancelled"), color: "text-red-600" },
      refunded: { label: t("customerHistory.status.refunded"), color: "text-gray-600" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "text-gray-600",
    };

    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number | null) => {
    return `${Math.round(amount ?? 0).toLocaleString("fr-FR")} DA`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("customerHistory.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{t("customerHistory.info")}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("customerHistory.name")}: </span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("customerHistory.email")}: </span>
                <span className="font-medium">{customerEmail}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                    <div className="text-sm text-blue-600">{t("customerHistory.stats.totalOrders")}</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</div>
                    <div className="text-sm text-green-600">{t("customerHistory.stats.totalSpent")}</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageOrderValue)}</div>
                    <div className="text-sm text-purple-600">{t("customerHistory.stats.averageOrder")}</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-orange-600">
                      {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : t("customerHistory.na")}
                    </div>
                    <div className="text-sm text-orange-600">{t("customerHistory.stats.lastOrder")}</div>
                  </div>
                </div>
              )}

              {/* Order history */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("customerHistory.orders.title", { count: orderHistory.length })}
                </h3>

                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {orderHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t("customerHistory.orders.none")}
                      </div>
                    ) : (
                      orderHistory.map((order, index) => (
                        <div key={order.id}>
                          <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">#{order.orderNumber}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)} •{" "}
                                {t("customerHistory.orders.items", { count: order.itemCount })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
                            </div>
                          </div>
                          {index < orderHistory.length - 1 && <Separator />}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerHistoryDialog;
