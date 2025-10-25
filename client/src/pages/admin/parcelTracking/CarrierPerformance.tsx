// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Truck } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useCarriers } from "@/pages/seller/shipping/hooks/carriers";
// import { is } from "drizzle-orm";

// const CarrierPerformance = () => {
//   const { carriers, isLoadingCarriers } = useCarriers();

//   // 🟢 Fetch shipment analytics per carrier
//   const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
//     queryKey: ["carrier-analytics"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shipments/analytics");
//       if (!res.ok) throw new Error("Failed to fetch analytics");
//       return res.json();
//     },
//   });

//   if (isLoadingCarriers || analyticsLoading) return <div>Chargement...</div>;

//   if (!carriers?.length)
//     return (
//       <div className="text-center text-muted-foreground">
//         Aucun transporteur trouvé.
//       </div>
//     );

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Truck className="h-5 w-5 text-cebleu-purple-800" />
//           Performance des transporteurs
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {carriers.map((carrier: any) => {
//           const stats = analytics?.carrierStats?.[carrier.id] || {
//             total: 0,
//             delivered: 0,
//             delayed: 0,
//           };

//           const deliveryRate =
//             stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;

//           return (
//             <div
//               key={carrier.id}
//               className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="flex justify-between items-center mb-2">
//                 <div>
//                   <h4 className="font-semibold">{carrier.name}</h4>
//                   <p className="text-sm text-muted-foreground">
//                     {stats.total} expéditions
//                   </p>
//                 </div>
//                 <Badge
//                   variant="outline"
//                   className={
//                     deliveryRate > 90
//                       ? "border-green-500 text-green-700"
//                       : deliveryRate > 70
//                       ? "border-amber-500 text-amber-700"
//                       : "border-red-500 text-red-700"
//                   }
//                 >
//                   {deliveryRate.toFixed(0)}% livrées
//                 </Badge>
//               </div>

//               <Progress value={deliveryRate} className="h-2" />
//               <div className="mt-1 flex justify-between text-xs text-muted-foreground">
//                 <span>{stats.delivered} livrées</span>
//                 <span>{stats.delayed} retardées</span>
//               </div>
//             </div>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// };

// export default CarrierPerformance;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCarriers } from "@/pages/seller/shipping/hooks/carriers";
import { useTranslation } from "react-i18next";

const CarrierPerformance = () => {
  const { t } = useTranslation();
  const { carriers, isLoadingCarriers } = useCarriers();
  
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["carrier-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shipments/analytics");
      if (!res.ok) throw new Error(t("carrierPerformance.fetchError"));
      return res.json();
    },
  });

  if (isLoadingCarriers || analyticsLoading) return <div>{t("carrierPerformance.loading")}</div>;

  if (!carriers?.length)
    return (
      <div className="text-center text-muted-foreground">
        {t("carrierPerformance.noCarriers")}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-cebleu-purple-800" />
          {t("carrierPerformance.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {carriers.map((carrier: any) => {
          const stats = analytics?.carrierStats?.[carrier.id] || {
            total: 0,
            delivered: 0,
            delayed: 0,
          };

          const deliveryRate =
            stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;

          return (
            <div
              key={carrier.id}
              className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold">{carrier.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} {t("carrierPerformance.shipments")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    deliveryRate > 90
                      ? "border-green-500 text-green-700"
                      : deliveryRate > 70
                      ? "border-amber-500 text-amber-700"
                      : "border-red-500 text-red-700"
                  }
                >
                  {deliveryRate.toFixed(0)}% {t("carrierPerformance.delivered")}
                </Badge>
              </div>

              <Progress value={deliveryRate} className="h-2" />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{stats.delivered} {t("carrierPerformance.delivered")}</span>
                <span>{stats.delayed} {t("carrierPerformance.delayed")}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CarrierPerformance;
