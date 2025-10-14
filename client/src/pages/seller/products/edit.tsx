import { useState } from "react";
import { Link, useParams,useLocation  } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function EditProduct() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch product details for editing
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!id,
  });

  const handleProductUpdate = async (data: any) => {
    setIsUpdatingProduct(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const updatedProduct = await response.json();
      console.log("Product updated:", updatedProduct);

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/seller/products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/products", id],
      });

      // Navigate back to products page
      window.location.href = "/dashboard/seller/products";
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The product you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Link href="/dashboard/seller/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            </Link>
            
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/seller/products">
           <Button
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          </Link>
         
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your product information and settings
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <AdvancedAddProductForm
            onSubmit={handleProductUpdate}
            // onCancel={() => window.location.href = "/dashboard/seller/products"}
            onCancel={() => setLocation("/dashboard/seller/products")}
            isLoading={isUpdatingProduct}
            editMode={true}
            editProduct={product}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}