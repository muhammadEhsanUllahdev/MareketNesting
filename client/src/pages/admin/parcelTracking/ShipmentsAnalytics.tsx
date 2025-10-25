// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Truck,
//   Package,
//   CheckCircle,
//   AlertTriangle,
//   Globe2,
// } from "lucide-react";

// const ShipmentsAnalytics = () => {
//   // 🟢 Fetch analytics via React Query
//   const {
//     data: analytics,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["shipments-analytics"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shipments/analytics");
//       if (!res.ok) throw new Error("Failed to fetch analytics");
//       return res.json();
//     },
//   });

//   if (isLoading) return <div>Chargement...</div>;
//   if (error) return <div className="text-red-600">Erreur de chargement</div>;
//   if (!analytics) return <div>Aucune donnée disponible</div>;

//   const statusStats = analytics?.statusCounts || [];
//   const carrierStats = analytics?.carrierCounts || [];
//   const zoneStats = analytics?.zoneCounts || [];

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

//   return (
//     <div className="space-y-6">
//       {/* Overall status cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//         {statusStats.map((s: any) => (
//           <Card key={s.status}>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-sm font-semibold">
//                 {getStatusIcon(s.status)}
//                 {getStatusLabel(s.status)}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{s.count}</div>
//               <p className="text-sm text-muted-foreground">expéditions</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Carriers breakdown */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Truck className="h-5 w-5 text-cebleu-purple-800" />
//             Par transporteur
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {carrierStats.length === 0 ? (
//             <p className="text-muted-foreground text-sm">
//               Aucune donnée sur les transporteurs.
//             </p>
//           ) : (
//             <ul className="space-y-2">
//               {carrierStats.map((c: any) => (
//                 <li
//                   key={c.carrierId}
//                   className="flex justify-between items-center border-b py-1"
//                 >
//                   <span className="font-medium">
//                     {c.carrierName || `Transporteur ${c.carrierId}`}
//                   </span>
//                   <Badge variant="outline" className="text-sm">
//                     {c.count} expéditions
//                   </Badge>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>

//       {/* Zones breakdown */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Globe2 className="h-5 w-5 text-cebleu-purple-800" />
//             Par zone géographique
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {zoneStats.length === 0 ? (
//             <p className="text-muted-foreground text-sm">
//               Aucune donnée de zone disponible.
//             </p>
//           ) : (
//             <ul className="space-y-2">
//               {zoneStats.map((z: any) => (
//                 <li
//                   key={z.zone}
//                   className="flex justify-between items-center border-b py-1"
//                 >
//                   <span className="font-medium capitalize">{z.zone}</span>
//                   <Badge variant="outline" className="text-sm">
//                     {z.count} expéditions
//                   </Badge>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ShipmentsAnalytics;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
  Globe2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ShipmentsAnalytics = () => {
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

  if (isLoading) return <div>{t("shipments.loading")}</div>;
  if (error) return <div className="text-red-600">{t("shipments.loadError")}</div>;
  if (!analytics) return <div>{t("shipments.noData")}</div>;

  const statusStats = analytics?.statusCounts || [];
  const carrierStats = analytics?.carrierCounts || [];
  const zoneStats = analytics?.zoneCounts || [];

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

  return (
    <div className="space-y-6">
      {/* Overall status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statusStats.map((s: any) => (
          <Card key={s.status}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                {getStatusIcon(s.status)}
                {getStatusLabel(s.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.count}</div>
              <p className="text-sm text-muted-foreground">
                {t("shipments.shipmentsCount")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carriers breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-cebleu-purple-800" />
            {t("shipments.byCarrier")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carrierStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("shipments.noCarrierData")}
            </p>
          ) : (
            <ul className="space-y-2">
              {carrierStats.map((c: any) => (
                <li
                  key={c.carrierId}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span className="font-medium">
                    {c.carrierName || `${t("shipments.carrier")} ${c.carrierId}`}
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {c.count} {t("shipments.shipmentsCount")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Zones breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-cebleu-purple-800" />
            {t("shipments.byZone")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {zoneStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("shipments.noZoneData")}
            </p>
          ) : (
            <ul className="space-y-2">
              {zoneStats.map((z: any) => (
                <li
                  key={z.zone}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span className="font-medium capitalize">{z.zone}</span>
                  <Badge variant="outline" className="text-sm">
                    {z.count} {t("shipments.shipmentsCount")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentsAnalytics;
