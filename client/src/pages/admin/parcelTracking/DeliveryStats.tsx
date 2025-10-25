// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";

// const DeliveryStats = () => {
//   // 🔹 Fetch analytics from backend
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["shipments-analytics"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shipments/analytics");
//       if (!res.ok)
//         throw new Error("Erreur lors du chargement des statistiques");
//       return res.json();
//     },
//   });

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Statistiques de livraison</CardTitle>
//         </CardHeader>
//         <CardContent>Chargement...</CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Statistiques de livraison</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-red-600">
//             Impossible de charger les statistiques
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const stats = data?.statusCounts || [];

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "en_preparation":
//         return <Package className="h-5 w-5 text-blue-600" />;
//       case "en_transit":
//         return <Truck className="h-5 w-5 text-orange-600" />;
//       case "livre":
//         return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case "retarde":
//         return <AlertTriangle className="h-5 w-5 text-red-600" />;
//       default:
//         return <Package className="h-5 w-5 text-gray-500" />;
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case "en_preparation":
//         return "En préparation";
//       case "en_transit":
//         return "En transit";
//       case "livre":
//         return "Livré";
//       case "retarde":
//         return "Retardé";
//       default:
//         return "Autre";
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Statistiques de livraison</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {stats.length === 0 ? (
//           <div className="text-muted-foreground text-sm">
//             Aucune donnée disponible
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             {stats.map((s: any) => (
//               <div
//                 key={s.status}
//                 className="flex flex-col items-center justify-center border rounded-lg py-4 shadow-sm bg-muted/30"
//               >
//                 <div className="flex items-center gap-2">
//                   {getStatusIcon(s.status)}
//                   <span className="font-medium text-sm">
//                     {getStatusLabel(s.status)}
//                   </span>
//                 </div>
//                 <Badge variant="secondary" className="mt-2 text-sm">
//                   {s.count} expéditions
//                 </Badge>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default DeliveryStats;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const DeliveryStats = () => {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["shipments-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shipments/analytics");
      if (!res.ok)
        throw new Error(t("deliveryStats.fetchError"));
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("deliveryStats.title")}</CardTitle>
        </CardHeader>
        <CardContent>{t("deliveryStats.loading")}</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("deliveryStats.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            {t("deliveryStats.loadError")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.statusCounts || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_preparation":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "en_transit":
        return <Truck className="h-5 w-5 text-orange-600" />;
      case "livre":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "retarde":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "en_preparation":
        return t("deliveryStats.status.preparation");
      case "en_transit":
        return t("deliveryStats.status.transit");
      case "livre":
        return t("deliveryStats.status.delivered");
      case "retarde":
        return t("deliveryStats.status.delayed");
      default:
        return t("deliveryStats.status.other");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("deliveryStats.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            {t("deliveryStats.noData")}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s: any) => (
              <div
                key={s.status}
                className="flex flex-col items-center justify-center border rounded-lg py-4 shadow-sm bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(s.status)}
                  <span className="font-medium text-sm">
                    {getStatusLabel(s.status)}
                  </span>
                </div>
                <Badge variant="secondary" className="mt-2 text-sm">
                  {s.count} {t("deliveryStats.shipments")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryStats;
