// import React, { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Package, Truck, Map, TrendingUp, AlertTriangle } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // Importing our refactored components
// import EnhancedShipmentManager from "./EnhancedShipmentManager";
// import DeliveryStats from "./DeliveryStats";
// import CarrierPerformance from "./CarrierPerformance";
// import ShipmentsAnalytics from "./ShipmentsAnalytics";
// import ShipmentsMap from "./ShipmentsMap";
// import ShipmentsHeader from "./ShipmentsHeader";

// const ShipmentsPage = () => {
//   const [activeTab, setActiveTab] = useState("tracking");

//   // Demo shipments data
//   const shipments = [
//     { id: "1", orderId: "CMD-1001", status: "en_transit" },
//     { id: "2", orderId: "CMD-1002", status: "livre" },
//   ];

//   // Calculate alerts count (delayed or problematic shipments)
//   useEffect(() => {
//     // Alerts count logic removed for demo
//   }, [shipments]);

//   const handleDownloadReport = () => {
//     // Download report logic removed for demo
//   };

//   const handleShareReport = () => {
//     // Share report logic removed for demo
//   };

//   return (
//     <DashboardLayout title="Gestion des expéditions">
//       <div className="space-y-6">
//         <ShipmentsHeader />
//         <DeliveryStats />
//         <Tabs
//           defaultValue="tracking"
//           value={activeTab}
//           onValueChange={setActiveTab}
//           className="w-full"
//         >
//           <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
//             <TabsTrigger value="tracking" className="flex items-center gap-1">
//               <Package className="h-4 w-4" />
//               <span className="hidden sm:inline mr-1">Suivi</span>
//               des colis
//             </TabsTrigger>
//             <TabsTrigger
//               value="performance"
//               className="flex items-center gap-1"
//             >
//               <TrendingUp className="h-4 w-4" />
//               <span className="hidden sm:inline mr-1">Analyse</span>
//               performance
//             </TabsTrigger>
//             <TabsTrigger value="maps" className="flex items-center gap-1">
//               <Map className="h-4 w-4" />
//               <span className="hidden sm:inline">Cartographie</span>
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="tracking" className="space-y-6">
//             <EnhancedShipmentManager />
//           </TabsContent>

//           <TabsContent value="performance" className="space-y-6">
//             <CarrierPerformance />
//             <ShipmentsAnalytics />
//           </TabsContent>

//           <TabsContent value="maps" className="space-y-6">
//             <ShipmentsMap />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default ShipmentsPage;

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Package, Truck, Map, TrendingUp, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

// Importing our refactored components
import EnhancedShipmentManager from "./EnhancedShipmentManager";
import DeliveryStats from "./DeliveryStats";
import CarrierPerformance from "./CarrierPerformance";
import ShipmentsAnalytics from "./ShipmentsAnalytics";
import ShipmentsMap from "./ShipmentsMap";
import ShipmentsHeader from "./ShipmentsHeader";

const ShipmentsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("tracking");

  const shipments = [
    { id: "1", orderId: "CMD-1001", status: "en_transit" },
    { id: "2", orderId: "CMD-1002", status: "livre" },
  ];

  useEffect(() => {}, [shipments]);

  const handleDownloadReport = () => {};
  const handleShareReport = () => {};

  return (
    <DashboardLayout title={t("shipments.title")}>
      <div className="space-y-6">
        <ShipmentsHeader />
        <DeliveryStats />
        <Tabs
          defaultValue="tracking"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
            <TabsTrigger value="tracking" className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline mr-1">
                {t("shipments.tabs.tracking.label")}
              </span>
              {t("shipments.tabs.tracking.suffix")}
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline mr-1">
                {t("shipments.tabs.performance.label")}
              </span>
              {t("shipments.tabs.performance.suffix")}
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("shipments.tabs.maps.label")}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-6">
            <EnhancedShipmentManager />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <CarrierPerformance />
            <ShipmentsAnalytics />
          </TabsContent>

          <TabsContent value="maps" className="space-y-6">
            <ShipmentsMap />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ShipmentsPage;
