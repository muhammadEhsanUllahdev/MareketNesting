// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";

// const ShipmentsHeader = () => {
//   // 🔹 Fetch analytics via React Query
//   const {
//     data: analytics,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["shipments-analytics"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shipments/analytics");
//       if (!res.ok) throw new Error("Erreur de récupération des statistiques");
//       return res.json();
//     },
//   });

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Gestion des expéditions</CardTitle>
//         </CardHeader>
//         <CardContent>Chargement...</CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Gestion des expéditions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-red-600">Erreur de chargement des données</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const stats = analytics?.statusCounts || [];

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "en_preparation":
//         return <Package className="h-4 w-4 text-blue-600" />;
//       case "en_transit":
//         return <Truck className="h-4 w-4 text-orange-600" />;
//       case "livre":
//         return <CheckCircle className="h-4 w-4 text-green-600" />;
//       case "retarde":
//         return <AlertTriangle className="h-4 w-4 text-red-600" />;
//       default:
//         return <Package className="h-4 w-4 text-gray-500" />;
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
//         <CardTitle>Gestion des expéditions</CardTitle>
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
//                 className="flex flex-col items-center justify-center border rounded-lg py-3 shadow-sm bg-muted/30"
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

// export default ShipmentsHeader;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ShipmentsHeader = () => {
  const { t } = useTranslation();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shipments-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shipments/analytics");
      if (!res.ok) throw new Error(t("shipments.analyticsError"));
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.managementTitle")}</CardTitle>
        </CardHeader>
        <CardContent>{t("shipments.loading")}</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.managementTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{t("shipments.dataLoadError")}</div>
        </CardContent>
      </Card>
    );
  }

  const stats = analytics?.statusCounts || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_preparation":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "en_transit":
        return <Truck className="h-4 w-4 text-orange-600" />;
      case "livre":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "retarde":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "en_preparation":
        return t("shipments.status.preparation");
      case "en_transit":
        return t("shipments.status.transit");
      case "livre":
        return t("shipments.status.delivered");
      case "retarde":
        return t("shipments.status.delayed");
      default:
        return t("shipments.status.other");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shipments.managementTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            {t("shipments.noData")}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s: any) => (
              <div
                key={s.status}
                className="flex flex-col items-center justify-center border rounded-lg py-3 shadow-sm bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(s.status)}
                  <span className="font-medium text-sm">
                    {getStatusLabel(s.status)}
                  </span>
                </div>
                <Badge variant="secondary" className="mt-2 text-sm">
                  {s.count} {t("shipments.shipmentsCount")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentsHeader;
