// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import {
//   Package,
//   FileText,
//   DollarSign,
//   CreditCard,
//   Download,
//   Printer,
//   Check,
//   X,
// } from "lucide-react";

// interface OrderItem {
//   id: string;
//   name: string;
//   description: string;
//   quantity: number;
//   price: string;
// }

// interface OrderDetailsProps {
//   isOpen: boolean;
//   onClose: () => void;
//   order: {
//     id: string;
//     date: string;
//     customer: {
//       name: string;
//       avatar: string;
//     };
//     orderItems?: OrderItem[];
//     totalAmount?: string;
//     status: string;
//     paymentStatus: string;
//     notes?: string;
//   };
// }

// export function OrderDetailsModal({
//   isOpen,
//   onClose,
//   order,
// }: OrderDetailsProps) {
//   // const handlePrint = () => {
//   //   const printContent = document.getElementById('order-details-print');
//   //   if (printContent) {
//   //     const printWindow = window.open('', '_blank');
//   //     if (printWindow) {
//   //       printWindow.document.write(`
//   //         <html>
//   //           <head>
//   //             <title>Order ${order.id}</title>
//   //             <style>
//   //               body { font-family: Arial, sans-serif; margin: 20px; }
//   //               .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
//   //               .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
//   //               .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
//   //               .stat-value { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
//   //               .stat-label { font-size: 12px; color: #6b7280; }
//   //               .items-section { margin-bottom: 20px; }
//   //               .item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
//   //               .item:last-child { border-bottom: none; }
//   //               .item-details { flex: 1; }
//   //               .item-name { font-weight: 600; margin-bottom: 4px; }
//   //               .item-desc { font-size: 12px; color: #6b7280; }
//   //               .item-quantity { font-size: 14px; color: #6b7280; margin-top: 4px; }
//   //               .item-price { font-weight: 600; color: #059669; }
//   //               .total-section { border-top: 2px solid #e5e7eb; padding-top: 16px; text-align: right; }
//   //               .total-amount { font-size: 20px; font-weight: bold; }
//   //               @media print {
//   //                 body { margin: 0; }
//   //                 .no-print { display: none; }
//   //               }
//   //             </style>
//   //           </head>
//   //           <body>
//   //             ${printContent.innerHTML}
//   //           </body>
//   //         </html>
//   //       `);
//   //       printWindow.document.close();
//   //       printWindow.focus();
//   //       printWindow.print();
//   //       printWindow.close();
//   //     }
//   //   }
//   // };

//   const handlePrint = () => {
//     const printContent = document.getElementById("order-details-print");
//     if (printContent) {
//       const printWindow = window.open("", "_blank", "width=900,height=700");
//       if (printWindow) {
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Order ${order.id}</title>
//               <!-- Tailwind CSS -->
//               <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
//               <style>
//                 body {
//                   font-family: Arial, sans-serif;
//                   padding: 20px;
//                 }
//                 @media print {
//                   body {
//                     -webkit-print-color-adjust: exact !important;
//                     print-color-adjust: exact !important;
//                   }
//                   .no-print {
//                     display: none !important;
//                   }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="max-w-4xl mx-auto">
//                 ${printContent.innerHTML}
//               </div>
//             </body>
//           </html>
//         `);

//         // wait a bit so Tailwind loads before print
//         printWindow.document.close();
//         printWindow.focus();

//         setTimeout(() => {
//           printWindow.print();
//           printWindow.close();
//         }, 500);
//       }
//     }
//   };

//   const handleDownload = async () => {
//     const printContent = document.getElementById("order-details-print");
//     if (printContent) {
//       const padding = 10; // in mm
//       const canvas = await html2canvas(printContent, {
//         scale: 2,
//         useCORS: true,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * padding;
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       pdf.addImage(imgData, "PNG", padding, padding, pdfWidth, pdfHeight);
//       pdf.save(`order-${order.id}.pdf`);
//     }
//   };

//   // const handleDownload = () => {
//   //   const orderData = {
//   //     orderId: order.id,
//   //     date: order.date,
//   //     customer: order.customer.name,
//   //     items: (order.orderItems || []).map((item) => ({
//   //       name: item.name,
//   //       description: item.description,
//   //       quantity: item.quantity,
//   //       price: item.price,
//   //     })),
//   //     total: order.totalAmount,
//   //     status: order.status,
//   //     paymentStatus: order.paymentStatus,
//   //   };

//   //   const dataStr =
//   //     "data:text/json;charset=utf-8," +
//   //     encodeURIComponent(JSON.stringify(orderData, null, 2));
//   //   const downloadAnchorNode = document.createElement("a");
//   //   downloadAnchorNode.setAttribute("href", dataStr);
//   //   downloadAnchorNode.setAttribute("download", `order-${order.id}.json`);
//   //   document.body.appendChild(downloadAnchorNode);
//   //   downloadAnchorNode.click();
//   //   downloadAnchorNode.remove();
//   // };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div id="order-details-print">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold">Command {order.id}</h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Control in {order.date}
//                 </p>
//               </div>
//             </DialogTitle>
//           </DialogHeader>

//           <div className="mt-6">
//             {/* Stats Cards */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//               <Card className="bg-blue-50 border-blue-200">
//                 <CardContent className="p-4 text-center">
//                   <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-blue-700">
//                     {order.orderItems?.length || 0}
//                   </div>
//                   <div className="text-xs text-blue-600">Products</div>
//                 </CardContent>
//               </Card>

//               <Card className="bg-green-50 border-green-200">
//                 <CardContent className="p-4 text-center">
//                   <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-green-700">-</div>
//                   <div className="text-xs text-green-600">Notes</div>
//                 </CardContent>
//               </Card>

//               <Card className="bg-purple-50 border-purple-200">
//                 <CardContent className="p-4 text-center">
//                   <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-purple-700">
//                     {order.totalAmount}
//                   </div>
//                   <div className="text-xs text-purple-600">Total</div>
//                 </CardContent>
//               </Card>

//               <Card className="bg-orange-50 border-orange-200">
//                 <CardContent className="p-4 text-center">
//                   <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-orange-700">
//                     {order.paymentStatus}
//                   </div>
//                   <div className="text-xs text-orange-600">Payment</div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Products Section */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <Package className="h-5 w-5 mr-2" />
//                 Products ordered
//               </h3>

//               <div className="space-y-4">
//                 {(order.orderItems || []).map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
//                         <Package className="h-6 w-6 text-gray-400" />
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-900">
//                           {item.name}
//                         </h4>
//                         <p className="text-sm text-gray-600">
//                           {item.description}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Quantity: {item.quantity}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-lg font-semibold text-green-600">
//                       {item.price}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <Separator className="my-4" />

//               <div className="flex justify-end">
//                 <div className="text-right">
//                   <p className="text-lg font-semibold">Order total</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     {order.totalAmount}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center justify-between pt-4 border-t no-print">
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               onClick={handleDownload}
//               data-testid="button-download-order"
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Download
//             </Button>
//             <Button
//               variant="outline"
//               onClick={handlePrint}
//               data-testid="button-print-order"
//             >
//               <Printer className="h-4 w-4 mr-2" />
//               Print
//             </Button>
//           </div>
//           <div className="flex space-x-2">
//             <Button
//               className="bg-green-600 hover:bg-green-700"
//               data-testid="button-accept-order"
//             >
//               <Check className="h-4 w-4 mr-2" />
//               Accept
//             </Button>
//             <Button variant="destructive" data-testid="button-decline-order">
//               <X className="h-4 w-4 mr-2" />
//               Decline
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Package,
  FileText,
  DollarSign,
  CreditCard,
  Download,
  Printer,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: string;
}

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    date: string;
    customer: {
      name: string;
      avatar: string;
    };
    orderItems?: OrderItem[];
    totalAmount?: string;
    status: string;
    paymentStatus: string;
    notes?: string;
  };
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsProps) {
  const { t } = useTranslation();

  // const handlePrint = () => {
  //   const printContent = document.getElementById("order-details-print");
  //   if (printContent) {
  //     const printWindow = window.open("", "_blank", "width=900,height=700");
  //     if (printWindow) {
  //       printWindow.document.write(`
  //         <html>
  //           <head>
  //             <title>Order ${order.id}</title>
  //             <!-- Tailwind CSS -->
  //             <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  //             <style>
  //               body {
  //                 font-family: Arial, sans-serif;
  //                 padding: 20px;
  //               }
  //               @media print {
  //                 body {
  //                   -webkit-print-color-adjust: exact !important;
  //                   print-color-adjust: exact !important;
  //                 }
  //                 .no-print {
  //                   display: none !important;
  //                 }
  //               }
  //             </style>
  //           </head>
  //           <body>
  //             <div class="max-w-4xl mx-auto">
  //               ${printContent.innerHTML}
  //             </div>
  //           </body>
  //         </html>
  //       `);

  //       // wait a bit so Tailwind loads before print
  //       printWindow.document.close();
  //       printWindow.focus();

  //       setTimeout(() => {
  //         printWindow.print();
  //         printWindow.close();
  //       }, 500);
  //     }
  //   }
  // };

  const handlePrint = () => {
    const printContent = document.getElementById("order-details-print");
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // To reload any lost event listeners/styles
    }
  };

  const handleDownload = async () => {
    const printContent = document.getElementById("order-details-print");
    if (printContent) {
      const padding = 10;
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * padding;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", padding, padding, pdfWidth, pdfHeight);
      pdf.save(`order-${order.id}.pdf`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div id="order-details-print">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                {/* <h2 className="text-xl font-semibold">Command {order.id}</h2> */}
                <p className="text-sm text-gray-600 mt-1">
                  {t("orderDetails.orderDate", { date: order.date })}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {order.orderItems?.length || 0}
                  </div>
                  <div className="text-xs text-blue-600">
                    {t("orderDetails.products")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">-</div>
                  <div className="text-xs text-green-600">
                    {t("orderDetails.notes")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">
                    {order.totalAmount}
                  </div>
                  <div className="text-xs text-purple-600">
                    {t("orderDetails.total")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">
                    {order.paymentStatus}
                  </div>
                  <div className="text-xs text-orange-600">
                    {t("orderDetails.payment")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t("orderDetails.productsOrdered")}
              </h3>

              <div className="space-y-4">
                {(order.orderItems || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("orderDetails.quantity", { qty: item.quantity })}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {t("orderDetails.orderTotal")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {order.totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t no-print">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              data-testid="button-download-order"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("orderDetails.download")}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              data-testid="button-print-order"
            >
              <Printer className="h-4 w-4 mr-2" />
              {t("orderDetails.print")}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-accept-order"
            >
              <Check className="h-4 w-4 mr-2" />
              {t("orderDetails.accept")}
            </Button>
            <Button variant="destructive" data-testid="button-decline-order">
              <X className="h-4 w-4 mr-2" />
              {t("orderDetails.decline")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
