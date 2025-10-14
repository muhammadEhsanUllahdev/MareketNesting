// // pages/SellerTransactions.tsx
// import React from "react";
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
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import { Search } from "lucide-react";
// import { Input } from "@/components/ui/input";

// type Transaction = {
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

// export default function SellerTransactions() {
//   const [searchQuery, setSearchQuery] = React.useState("");
//   const {
//     data: transactions = [],
//     isLoading,
//     isError,
//   } = useQuery<Transaction[]>({
//     queryKey: ["/api/seller/transactions"],
//     queryFn: async () => {
//       const response = await fetch("/api/seller/transactions", {
//         credentials: "include",
//       });
//       if (!response.ok) throw new Error("Failed to fetch transactions");
//       return response.json();
//     },
//   });

//   const filteredTransactions = transactions.filter((t) => {
//     const matchesSearch =
//       !searchQuery ||
//       t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchesSearch;
//   });

//   if (isLoading) return <p className="p-4">Loading transactions...</p>;
//   if (isError)
//     return <p className="p-4 text-red-500">Failed to load transactions.</p>;

//   return (
//     <DashboardLayout title="Seller Transactions">
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
//         <h1 className="text-xl font-semibold mb-4">Seller Transactions</h1>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg font-medium">
//               Transaction History
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Order #</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Payment</TableHead>
//                   <TableHead>Customer</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredTransactions?.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6}>No transactions found</TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredTransactions?.map((t) => (
//                     <TableRow key={t.transactionId}>
//                       <TableCell>
//                         {new Date(t.createdAt).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>{t.orderNumber}</TableCell>
//                       <TableCell>
//                         {t.amount} {t.currency.toUpperCase()}
//                       </TableCell>
//                       <TableCell className="capitalize">{t.status}</TableCell>
//                       <TableCell>{t.paymentMethod}</TableCell>
//                       <TableCell>
//                         {t.customerName} <br />
//                         <span className="text-xs text-gray-500">
//                           {t.customerEmail}
//                         </span>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }

// pages/SellerTransactions.tsx
import React from "react";
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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

type Transaction = {
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

export default function SellerTransactions() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ["/api/seller/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/seller/transactions", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (isLoading)
    return (
      <DashboardLayout title={t("transactions.pageTitle")}>
        <p className="p-4">{t("transactions.loading")}</p>
      </DashboardLayout>
    );
  if (isError)
    return <p className="p-4 text-red-500">{t("transactions.loadError")}</p>;

  return (
    <DashboardLayout title={t("transactions.pageTitle")}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("transactions.searchPlaceholder")}
          className="pl-10 w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">
          {t("transactions.pageTitle")}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {t("transactions.history")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("transactions.table.date")}</TableHead>
                  <TableHead>{t("transactions.table.orderNo")}</TableHead>
                  <TableHead>{t("transactions.table.amount")}</TableHead>
                  <TableHead>{t("transactions.table.status")}</TableHead>
                  <TableHead>{t("transactions.table.payment")}</TableHead>
                  <TableHead>{t("transactions.table.customer")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      {t("transactions.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions?.map((t) => (
                    <TableRow key={t.transactionId}>
                      <TableCell>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{t.orderNumber}</TableCell>
                      <TableCell>
                        {t.amount} {t.currency.toUpperCase()}
                      </TableCell>
                      <TableCell className="capitalize">{t.status}</TableCell>
                      <TableCell>{t.paymentMethod}</TableCell>
                      <TableCell>
                        {t.customerName} <br />
                        <span className="text-xs text-gray-500">
                          {t.customerEmail}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
