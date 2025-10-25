// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { MapPin, Truck, AlertTriangle, Package } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// const ShipmentsMap = () => {
//   // 🟢 Fetch all shipments from your real API
//   const {
//     data: shipments = [],
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["shipments-list"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/shipments");
//       if (!res.ok) throw new Error("Erreur de chargement des expéditions");
//       return res.json();
//     },
//   });

//   // 🟡 Loading / Error states
//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Carte des expéditions</CardTitle>
//         </CardHeader>
//         <CardContent>Chargement des expéditions...</CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Carte des expéditions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-red-600">
//             Impossible de charger les expéditions
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!shipments.length) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Carte des expéditions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-muted-foreground text-sm">
//             Aucune expédition disponible
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   // 🟣 Status visual helpers
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "en_preparation":
//         return (
//           <Badge className="bg-blue-100 text-blue-800">En préparation</Badge>
//         );
//       case "en_transit":
//         return (
//           <Badge className="bg-orange-100 text-orange-800">En transit</Badge>
//         );
//       case "livre":
//         return <Badge className="bg-green-100 text-green-800">Livré</Badge>;
//       case "retarde":
//         return <Badge className="bg-red-100 text-red-800">Retardé</Badge>;
//       default:
//         return <Badge variant="outline">Inconnu</Badge>;
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "en_preparation":
//         return <Package className="h-4 w-4 text-blue-600" />;
//       case "en_transit":
//         return <Truck className="h-4 w-4 text-orange-600" />;
//       case "livre":
//         return <Truck className="h-4 w-4 text-green-600" />;
//       case "retarde":
//         return <AlertTriangle className="h-4 w-4 text-red-600" />;
//       default:
//         return <Package className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Carte des expéditions</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {shipments.map((s: any) => (
//             <div
//               key={s.id}
//               className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-primary" />
//                 <div>
//                   <p className="font-medium">
//                     {s.origin} → {s.destination}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {s.carrier || "—"} • {s.customerName}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 {getStatusIcon(s.status)}
//                 {getStatusBadge(s.status)}
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default ShipmentsMap;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const ShipmentsMap = () => {
  const { t } = useTranslation();

  const {
    data: shipments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shipments-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shipments");
      if (!res.ok) throw new Error(t("shipments.loadError"));
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.mapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>{t("shipments.loading")}</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.mapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{t("shipments.loadFailed")}</div>
        </CardContent>
      </Card>
    );
  }

  if (!shipments.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.mapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            {t("shipments.noneAvailable")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_preparation":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t("shipments.status.preparation")}
          </Badge>
        );
      case "en_transit":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {t("shipments.status.transit")}
          </Badge>
        );
      case "livre":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("shipments.status.delivered")}
          </Badge>
        );
      case "retarde":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("shipments.status.delayed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("shipments.status.unknown")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_preparation":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "en_transit":
        return <Truck className="h-4 w-4 text-orange-600" />;
      case "livre":
        return <Truck className="h-4 w-4 text-green-600" />;
      case "retarde":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shipments.mapTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shipments.map((s: any) => (
            <div
              key={s.id}
              className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {s.origin} → {s.destination}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {s.carrier || "—"} • {s.customerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(s.status)}
                {getStatusBadge(s.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentsMap;
