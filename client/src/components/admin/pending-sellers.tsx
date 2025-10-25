// import { useState } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, CheckCircle, XCircle, Clock, Store } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { queryClient } from "@/lib/queryClient";

// interface PendingSeller {
//   id: number;
//   username: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   sellerStatus: "pending" | "approved" | "rejected";
//   createdAt: string;
// }

// export function PendingSellers() {
//   const { toast } = useToast();
//   const [processingUsers, setProcessingUsers] = useState<Set<number>>(new Set());

//   const { data: pendingSellers, isLoading, error } = useQuery<PendingSeller[]>({
//     queryKey: ["/api/admin/pending-sellers"],
//     queryFn: async () => {
//       const response = await fetch("/api/admin/pending-sellers", {
//         credentials: "include",
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch pending sellers");
//       }
//       return response.json();
//     },
//   });

//   const approveSellerMutation = useMutation({
//     mutationFn: async ({ userId, approved }: { userId: number; approved: boolean }) => {
//       const response = await fetch("/api/admin/approve-seller", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ userId, approved }),
//       });
      
//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Failed to update seller status");
//       }
      
//       return response.json();
//     },
//     onMutate: ({ userId }) => {
//       setProcessingUsers(prev => new Set(prev).add(userId));
//     },
//     onSuccess: (data, { userId, approved }) => {
//       toast({
//         title: "Success",
//         description: `Seller ${approved ? "approved" : "rejected"} successfully`,
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-sellers"] });
//     },
//     onError: (error: Error, { userId }) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//     onSettled: (data, error, { userId }) => {
//       setProcessingUsers(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(userId);
//         return newSet;
//       });
//     },
//   });

//   const handleApprove = (userId: number) => {
//     approveSellerMutation.mutate({ userId, approved: true });
//   };

//   const handleReject = (userId: number) => {
//     approveSellerMutation.mutate({ userId, approved: false });
//   };

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Store className="mr-2 h-5 w-5" />
//             Pending Seller Applications
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Store className="mr-2 h-5 w-5" />
//             Pending Seller Applications
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Alert variant="destructive">
//             <XCircle className="h-4 w-4" />
//             <AlertDescription>
//               Failed to load pending sellers. Please try again.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   const pendingApplications = pendingSellers?.filter(seller => seller.sellerStatus === "pending") || [];

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           <div className="flex items-center">
//             <Store className="mr-2 h-5 w-5" />
//             Pending Seller Applications
//           </div>
//           <Badge variant="secondary" data-testid="badge-pending-count">
//             {pendingApplications.length} Pending
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {pendingApplications.length === 0 ? (
//           <div className="text-center py-8">
//             <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//             <p className="text-gray-600" data-testid="text-no-pending">
//               No pending seller applications
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {pendingApplications.map((seller) => (
//               <div
//                 key={seller.id}
//                 className="border rounded-lg p-4 bg-white shadow-sm"
//                 data-testid={`card-seller-${seller.id}`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <h3 className="font-medium text-gray-900" data-testid={`text-seller-name-${seller.id}`}>
//                         {seller.firstName} {seller.lastName}
//                       </h3>
//                       <Badge variant="outline" data-testid={`badge-status-${seller.id}`}>
//                         {seller.sellerStatus}
//                       </Badge>
//                     </div>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       <p data-testid={`text-username-${seller.id}`}>
//                         <span className="font-medium">Username:</span> {seller.username}
//                       </p>
//                       <p data-testid={`text-email-${seller.id}`}>
//                         <span className="font-medium">Email:</span> {seller.email}
//                       </p>
//                       <p data-testid={`text-applied-${seller.id}`}>
//                         <span className="font-medium">Applied:</span>{" "}
//                         {new Date(seller.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex space-x-2 ml-4">
//                     <Button
//                       onClick={() => handleApprove(seller.id)}
//                       disabled={processingUsers.has(seller.id)}
//                       className="bg-green-600 hover:bg-green-700 text-white"
//                       size="sm"
//                       data-testid={`button-approve-${seller.id}`}
//                     >
//                       {processingUsers.has(seller.id) ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         <>
//                           <CheckCircle className="h-4 w-4 mr-1" />
//                           Approve
//                         </>
//                       )}
//                     </Button>
//                     <Button
//                       onClick={() => handleReject(seller.id)}
//                       disabled={processingUsers.has(seller.id)}
//                       variant="destructive"
//                       size="sm"
//                       data-testid={`button-reject-${seller.id}`}
//                     >
//                       {processingUsers.has(seller.id) ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         <>
//                           <XCircle className="h-4 w-4 mr-1" />
//                           Reject
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Clock, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface PendingSeller {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  sellerStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

export function PendingSellers() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [processingUsers, setProcessingUsers] = useState<Set<number>>(new Set());

  const { data: pendingSellers, isLoading, error } = useQuery<PendingSeller[]>({
    queryKey: ["/api/admin/pending-sellers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending-sellers", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(t("sellers.fetchError"));
      }
      return response.json();
    },
  });

  const approveSellerMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: number; approved: boolean }) => {
      const response = await fetch("/api/admin/approve-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, approved }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("sellers.updateError"));
      }

      return response.json();
    },
    onMutate: ({ userId }) => {
      setProcessingUsers(prev => new Set(prev).add(userId));
    },
    onSuccess: (data, { userId, approved }) => {
      toast({
        title: t("common.success"),
        description: approved ? t("sellers.approved") : t("sellers.rejected"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-sellers"] });
    },
    onError: (error: Error, { userId }) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: (data, error, { userId }) => {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  const handleApprove = (userId: number) => {
    approveSellerMutation.mutate({ userId, approved: true });
  };

  const handleReject = (userId: number) => {
    approveSellerMutation.mutate({ userId, approved: false });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            {t("sellers.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            {t("sellers.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {t("sellers.loadError")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const pendingApplications = pendingSellers?.filter(seller => seller.sellerStatus === "pending") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            {t("sellers.title")}
          </div>
          <Badge variant="secondary" data-testid="badge-pending-count">
            {pendingApplications.length} {t("sellers.pending")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingApplications.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600" data-testid="text-no-pending">
              {t("sellers.noPending")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApplications.map((seller) => (
              <div
                key={seller.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {seller.firstName} {seller.lastName}
                      </h3>
                      <Badge variant="outline">{seller.sellerStatus}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">{t("sellers.username")}:</span> {seller.username}
                      </p>
                      <p>
                        <span className="font-medium">{t("sellers.email")}:</span> {seller.email}
                      </p>
                      <p>
                        <span className="font-medium">{t("sellers.applied")}:</span>{" "}
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleApprove(seller.id)}
                      disabled={processingUsers.has(seller.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {processingUsers.has(seller.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t("sellers.approve")}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(seller.id)}
                      disabled={processingUsers.has(seller.id)}
                      variant="destructive"
                      size="sm"
                    >
                      {processingUsers.has(seller.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          {t("sellers.reject")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
