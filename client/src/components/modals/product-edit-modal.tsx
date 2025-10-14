// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";
// import { Loader2, X } from "lucide-react";

// interface ProductEditModalProps {
//   product: any;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function ProductEditModal({
//   product,
//   isOpen,
//   onClose,
// }: ProductEditModalProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const updateProductMutation = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await fetch(`/api/products/${product.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to update product");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Product updated successfully!",
//       });

//       // Invalidate relevant queries
//       queryClient.invalidateQueries({
//         queryKey: ["/api/seller/products"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["/api/products"],
//       });

//       onClose();
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description:
//           error.message || "Failed to update product. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleProductUpdate = (data: any) => {
//     updateProductMutation.mutate(data);
//   };

//   const handleCancel = () => {
//     onClose();
//   };

//   if (!product) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader className="flex flex-row items-center justify-between">
//           <div>
//             <DialogTitle>Edit Product</DialogTitle>
//             <DialogDescription>
//               Update product information, specifications, and content
//             </DialogDescription>
//           </div>
//         </DialogHeader>

//         <div>
//           {updateProductMutation.isPending ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
//               <span className="ml-2 text-gray-600">Updating product...</span>
//             </div>
//           ) : (
//             <AdvancedAddProductForm
//               onSubmit={handleProductUpdate}
//               onCancel={handleCancel}
//               isLoading={updateProductMutation.isPending}
//               editMode={true}
//               editProduct={product}
//             />
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductEditModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductEditModal({
  product,
  isOpen,
  onClose,
}: ProductEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("product.update.error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("product.update.success"),
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/products"],
      });

      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("product.update.errorRetry"),
        variant: "destructive",
      });
    },
  });

  const handleProductUpdate = (data: any) => {
    updateProductMutation.mutate(data);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {" "}
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        {" "}
        <DialogHeader className="flex flex-row items-center justify-between">
          {" "}
          <div>
            {" "}
            <DialogTitle>{t("product.update.title")}</DialogTitle>{" "}
            <DialogDescription>
              {t("product.update.description")}{" "}
            </DialogDescription>{" "}
          </div>{" "}
        </DialogHeader>
        <div>
          {updateProductMutation.isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">
                {t("product.update.loading")}
              </span>
            </div>
          ) : (
            <AdvancedAddProductForm
              onSubmit={handleProductUpdate}
              onCancel={handleCancel}
              isLoading={updateProductMutation.isPending}
              editMode={true}
              editProduct={product}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
