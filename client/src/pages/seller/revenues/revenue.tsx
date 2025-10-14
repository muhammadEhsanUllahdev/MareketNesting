// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useQuery } from "@tanstack/react-query";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Input } from "@/components/ui/input";
// import { Search } from "lucide-react";

// type RevenueEntry = {
//   transactionId: string;
//   orderId: string;
//   orderNumber: string;
//   amount: string;
//   currency: string;
//   status: string;
//   paymentMethod: string;
//   customerName: string;
//   customerEmail: string;
//   createdAt: string;
// };

// type RevenueResponse = {
//   totalRevenue: string;
//   currency: string;
//   revenue: RevenueEntry[];
// };

// export default function SellerRevenue() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { data, isLoading, isError } = useQuery<RevenueResponse>({
//     queryKey: ["/api/seller/revenue"],
//     queryFn: async () => {
//       const response = await fetch("/api/seller/revenue", {
//         credentials: "include",
//       });
//       if (!response.ok) throw new Error("Failed to fetch revenue");
//       return response.json();
//     },
//   });

//   const filteredRevenues = data?.revenue.filter((revenue) => {
//     const matchesSearch =
//       !searchQuery ||
//       revenue.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       revenue.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       revenue.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchesSearch;
//   });

//   if (isLoading) return <p className="p-4">Loading revenue...</p>;
//   if (isError)
//     return <p className="p-4 text-red-500">Failed to load revenue.</p>;

//   return (
//     <DashboardLayout title="Seller Revenue">
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <Input
//           placeholder="Search by number, customer or email..."
//           className="pl-10 w-80"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>
//       <div className="p-6">
//         <h1 className="text-xl font-semibold mb-4">Seller Revenue</h1>

//         {/* Revenue Summary */}
//         <div className="mb-6 rounded-lg border p-4 bg-white shadow-sm">
//           <p className="text-lg font-medium">
//             Total Revenue:{" "}
//             <span className="font-bold text-green-600">
//               {data?.totalRevenue} {data?.currency.toUpperCase()}
//             </span>
//           </p>
//         </div>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Date</TableHead>
//               <TableHead>Order #</TableHead>
//               <TableHead>Amount</TableHead>
//               <TableHead>Payment</TableHead>
//               <TableHead>Customer</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredRevenues?.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5}>No revenue entries found</TableCell>
//               </TableRow>
//             ) : (
//               filteredRevenues?.map((r) => (
//                 <TableRow key={r.transactionId}>
//                   <TableCell>
//                     {new Date(r.createdAt).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>{r.orderNumber}</TableCell>
//                   <TableCell>
//                     {r.amount} {r.currency.toUpperCase()}
//                   </TableCell>
//                   <TableCell>{r.paymentMethod}</TableCell>
//                   <TableCell>
//                     {r.customerName} <br />
//                     <span className="text-xs text-gray-500">
//                       {r.customerEmail}
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </DashboardLayout>
//   );
// }

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type RevenueEntry = {
  transactionId: string;
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
};

type RevenueResponse = {
  totalRevenue: string;
  currency: string;
  revenue: RevenueEntry[];
};

export default function SellerRevenue() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError } = useQuery<RevenueResponse>({
    queryKey: ["/api/seller/revenue"],
    queryFn: async () => {
      const response = await fetch("/api/seller/revenue", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch revenue");
      return response.json();
    },
  });

  const filteredRevenues = data?.revenue.filter((revenue) => {
    const matchesSearch =
      !searchQuery ||
      revenue.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (isLoading)
    return (
      <DashboardLayout title={t("revenue.pageTitle")}>
        <p className="p-4">{t("revenue.loading")}</p>
      </DashboardLayout>
    );
  if (isError)
    return <p className="p-4 text-red-500">{t("revenue.loadError")}</p>;

  return (
    <DashboardLayout title={t("revenue.pageTitle")}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("revenue.searchPlaceholder")}
          className="pl-10 w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">{t("revenue.pageTitle")}</h1>

        {/* Revenue Summary */}
        <div className="mb-6 rounded-lg border p-4 bg-white shadow-sm">
          <p className="text-lg font-medium">
            {t("revenue.totalLabel")}{" "}
            <span className="font-bold text-green-600">
              {data?.totalRevenue} {data?.currency.toUpperCase()}
            </span>
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("revenue.table.date")}</TableHead>
              <TableHead>{t("revenue.table.orderNo")}</TableHead>
              <TableHead>{t("revenue.table.amount")}</TableHead>
              <TableHead>{t("revenue.table.payment")}</TableHead>
              <TableHead>{t("revenue.table.customer")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRevenues?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>{t("revenue.noData")}</TableCell>
              </TableRow>
            ) : (
              filteredRevenues?.map((r) => (
                <TableRow key={r.transactionId}>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{r.orderNumber}</TableCell>
                  <TableCell>
                    {r.amount} {r.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>{r.paymentMethod}</TableCell>
                  <TableCell>
                    {r.customerName} <br />
                    <span className="text-xs text-gray-500">
                      {r.customerEmail}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
