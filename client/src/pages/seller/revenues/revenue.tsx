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
// import { useTranslation } from "react-i18next";

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
//   const { t } = useTranslation();
//   const [searchQuery, setSearchQuery] = useState("");
//   const { data, isLoading, isError } = useQuery<RevenueResponse>({
//     queryKey: ["/api/seller/revenue"],
//     queryFn: async () => {
//       const response = await fetch("/api/seller/revenue", {
//         credentials: "include",
//       });
//       if (!response.ok) throw new Error(t("errors.fetchRevenue"));
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

//   if (isLoading)
//     return (
//       <DashboardLayout title={t("revenue.pageTitle")}>
//         <p className="p-4">{t("revenue.loading")}</p>
//       </DashboardLayout>
//     );
//   if (isError)
//     return <p className="p-4 text-red-500">{t("revenue.loadError")}</p>;

//   return (
//     <DashboardLayout title={t("revenue.pageTitle")}>
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <Input
//           placeholder={t("revenue.searchPlaceholder")}
//           className="pl-10 w-80"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>
//       <div className="p-6">
//         <h1 className="text-xl font-semibold mb-4">{t("revenue.pageTitle")}</h1>

//         {/* Revenue Summary */}
//         <div className="mb-6 rounded-lg border p-4 bg-white shadow-sm">
//           <p className="text-lg font-medium">
//             {t("revenue.totalLabel")}{" "}
//             <span className="font-bold text-green-600">
//               {data?.totalRevenue} {data?.currency.toUpperCase()}
//             </span>
//           </p>
//         </div>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>{t("revenue.table.date")}</TableHead>
//               <TableHead>{t("revenue.table.orderNo")}</TableHead>
//               <TableHead>{t("revenue.table.amount")}</TableHead>
//               <TableHead>{t("revenue.table.payment")}</TableHead>
//               <TableHead>{t("revenue.table.customer")}</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredRevenues?.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5}>{t("revenue.noData")}</TableCell>
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



import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
      if (!response.ok) throw new Error(t("errors.fetchRevenue"));
      return response.json();
    },
  });

  const transactions = data?.revenue || [];
  const currency = (data?.currency || "USD").toUpperCase();

  const stats = useMemo(() => {
    const now = new Date();
    let total = 0;
    let monthly = 0;
    let daily = 0;

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      const d = new Date(tx.createdAt);
      total += amt;
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        monthly += amt;
      }
      if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      ) {
        daily += amt;
      }
    }

    const avgOrder = transactions.length > 0 ? total / transactions.length : 0;

    return {
      total,
      monthly,
      daily,
      avgOrder,
      count: transactions.length,
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.orderNumber || "").toLowerCase().includes(q) ||
      (r.customerName || "").toLowerCase().includes(q) ||
      (r.customerEmail || "").toLowerCase().includes(q)
    );
  });

  if (isLoading)
    return (
      <DashboardLayout title={t("revenue.pageTitle")}>
        <p className="p-4">{t("revenue.loading")}</p>
      </DashboardLayout>
    );
  if (isError)
    return <p className="p-4 text-red-500">{t("revenue.loadError")}</p>;

  const format = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <DashboardLayout title={t("revenue.pageTitle")}>
      {/* <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("revenue.searchPlaceholder")}
          className="pl-10 w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div> */}
      <h1 className="text-xl font-semibold mb-4">
        Seller Income
      </h1>

      <div className="flex flex-wrap justify-center items-center gap-6">
        {/* Total Income */}
        <Card className="w-80 sm:w-96">
          <CardHeader>
            <CardTitle className="text-sm">
              {t("revenue.cards.totalIncome") || "Total Income"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400 text-lg">💲</div>
              <p className="text-3xl font-semibold">
                {format(Number(data?.totalRevenue) || 0)} {currency}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-3 text-sm">
              <span
                className={`font-medium ${(data?.monthlyChangePercent ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {(data?.monthlyChangePercent ?? 0) >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(data?.monthlyChangePercent ?? 0).toFixed(1)}%
              </span>
              <span className="text-gray-500">
                {t("revenue.cards.totalSubtitle") ||
                  `${transactions.length} ${t("revenue.transactions") || "transactions"}`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="w-80 sm:w-96">
          <CardHeader>
            <CardTitle className="text-sm">
              {t("revenue.cards.monthlyIncome") || "Monthly Income"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400 text-lg">📅</div>
              <p className="text-2xl font-semibold">
                {format(Number(data?.monthlyRevenue) || 0)} {currency}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-3 text-sm">
              <span className="text-gray-500">
                {t("revenue.cards.monthlySubtitle") || "This month"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Income */}
        <Card className="w-80 sm:w-96">
          <CardHeader>
            <CardTitle className="text-sm">
              {t("revenue.cards.dailyIncome") || "Daily Income"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400 text-lg">🕘</div>
              <p className="text-2xl font-semibold">
                {format(Number(data?.dailyRevenue) || 0)} {currency}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-3 text-sm">
              <span
                className={`font-medium ${(data?.dailyChangePercent ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {(data?.dailyChangePercent ?? 0) >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(data?.dailyChangePercent ?? 0).toFixed(1)}%
              </span>
              <span className="text-gray-500">
                {t("revenue.cards.dailySubtitle") || "Today"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Net Total */}
        <Card className="w-80 sm:w-96">
          <CardHeader>
            <CardTitle className="text-sm">
              {t("revenue.cards.netTotal") || "Net Total"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400 text-lg">💰</div>
              <p className="text-2xl font-semibold">
                {format(Number(data?.netTotal) || 0)} {currency}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-3 text-sm">
              <span className="text-gray-500">
                Fee deducted: {format(Number(data?.fee) || 0)} {currency}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Future: detailed list / table can go here — currently hidden */}
    </DashboardLayout>
  );
}