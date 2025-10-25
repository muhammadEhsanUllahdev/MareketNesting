import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Filter,
  Star,
  Package,
  AlertTriangle,
  X,
  ShoppingCart,
  Heart,
  Trash2,
} from "lucide-react";
import { seedSellerProducts } from "@/data/seed-products";

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  stock: number;
  images: string[];
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  vendorName: string;
  categoryId: string;
  sku: string;
  brand: string;
  status: "active" | "inactive";
  translations?: {
    [key: string]: {
      name: string;
      description: string;
      highlights?: string;
    };
  };
}

export default function SellerProducts() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  //  useEffect(() => {
  //   const KEY = "sellerProductsSeeded";
  //   if (!localStorage.getItem(KEY)) {
  //     seedSellerProducts(); // uses /api/products endpoint your page already uses:contentReference[oaicite:3]{index=3}
  //     localStorage.setItem(KEY, "true");
  //   }
  // }, []);
  // Fetch seller's products
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/seller/products", user?.id, i18n.language],
    queryFn: async () => {
      const response = await fetch(
        `/api/seller/products?language=${i18n.language}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error(t("error.fetchProductsFailed"));
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/categories?language=${i18n.language}`);

      if (!response.ok) throw new Error(t("error.fetchCategoriesFailed"));
      return response.json();
    },
  });

  // Type assertion for categories
  const typedCategories = categories as any[];

  // Seed dummy products mutation
  const seedProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/seller/seed-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("error.seedProductsFailed"));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("error.deleteProductFailed"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({
        title: t("toast.success"),
        description: t("toast.productDeletedSuccessfully"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("toast.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setShowDeleteConfirmDialog(true);
    }
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
      setShowDeleteConfirmDialog(false);
      setProductToDelete(null);
    }
  };

  const cancelDeleteProduct = () => {
    setShowDeleteConfirmDialog(false);
    setProductToDelete(null);
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/seller/products/${product.id}/edit`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t("error.fetchProductDetailsFailed"));
      }

      const productWithTranslations = await response.json();
      setEditProduct(productWithTranslations);
      setShowEditProductDialog(true);
    } catch (error) {
      console.error("Error fetching product for edit:", error);

      toast({
        title: t("toast.error"),
        description: t("toast.failedToLoadProductDetails"),
        variant: "destructive",
      });
    }
  };

  // Filter products based on search and filters
  const filteredProducts = (products as Product[]).filter(
    (product: Product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && product.stock > 0) ||
        (selectedStatus === "inactive" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    }
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort(
    (a: Product, b: Product) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        default:
          return 0;
      }
    }
  );

  const handleAddProduct = () => {
    setShowAddProductDialog(true);
  };

  return (
    <DashboardLayout title={user ? `${user?.store?.storeName}` : t("header.heading")}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("product.heading")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("product.subheading")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddProduct}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="button-add-product"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("product.actions.add")}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.total")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedProducts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.instock")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedProducts.filter((p) => p.stock > 10).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.rupture")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedProducts.filter((p) => p.stock === 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.lowstock")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      sortedProducts.filter((p) => p.stock > 0 && p.stock <= 10)
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.variants")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedProducts.filter((p) => p.isFeatured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t("product.stats.promotions")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedProducts.filter((p) => p.originalPrice).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {t("product.resume")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {t("product.resume.rating")}
                </p>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-lg font-semibold">4.5</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {t("product.resume.value")}
                </p>
                <p className="text-lg font-semibold text-green-600">975 AND</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {t("product.resume.rate")}
                </p>
                <p className="text-lg font-semibold">100%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {t("product.resume.featured")}
                </p>
                <p className="text-lg font-semibold text-purple-600">50%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("product.filter.heading")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("product.search.placeholder")}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-40" data-testid="select-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("product.filters.category")}
                    </SelectItem>
                    {(categories as any[]).map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32" data-testid="select-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("product.filters.status")}
                    </SelectItem>
                    <SelectItem value="active">
                      {t("product.status.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("product.status.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32" data-testid="select-sort">
                    <SelectValue placeholder="Most recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      {t("product.filters.sort")}
                    </SelectItem>
                    <SelectItem value="name">
                      {t("product.sort.name")}
                    </SelectItem>
                    <SelectItem value="price-high">
                      {t("product.sort.price.asc")}
                    </SelectItem>
                    <SelectItem value="price-low">
                      {t("product.sort.price.desc")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Results count */}
                <div className="text-sm text-gray-600">
                  {sortedProducts.length} {t("product.filters.foundproduct")}
                </div>

                {/* View Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none border-r"
                    data-testid="button-grid-view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                    data-testid="button-list-view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        <div className="space-y-4">
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-black-600 dark:text-black-400">
                    {t("product.noProductAvailable")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : sortedProducts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {(products as Product[]).length === 0
                      ? t("product.noProductsFoundStartAdding")
                      : t("product.noProductsMatchFilters")}
                  </p>
                  {(products as Product[]).length === 0 && (
                    <Button
                      onClick={handleAddProduct}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      data-testid="button-add-first-product"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("product.addYourFirstProduct")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.image")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.name")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.price")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.stock")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.sku")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.brand")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.Status")}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {t("product.filters.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map((product: Product) => (
                        <ProductTableRow
                          key={product.id}
                          product={product}
                          setPreviewProduct={setPreviewProduct}
                          setShowPreviewDialog={setShowPreviewDialog}
                          setEditProduct={setEditProduct}
                          setShowEditProductDialog={setShowEditProductDialog}
                          onDelete={handleDeleteProduct}
                          isDeleting={deleteProductMutation.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={typedCategories}
                  setPreviewProduct={setPreviewProduct}
                  setShowPreviewDialog={setShowPreviewDialog}
                  setEditProduct={setEditProduct}
                  setShowEditProductDialog={setShowEditProductDialog}
                  handleEditProduct={handleEditProduct}
                  t={t}
                  onDelete={handleDeleteProduct}
                  isDeleting={deleteProductMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
      >
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
          <AdvancedAddProductForm
            onSubmit={async (data) => {
              setIsCreatingProduct(true);
              try {
                const response = await fetch("/api/products", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify(data),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(
                    errorData.error || t("error.createProductFailed")
                  );
                }

                const newProduct = await response.json();
                console.log("Product created:", newProduct);

                toast({
                  title: t("toast.success"),
                  description: t("toast.productCreatedSuccessfully"),
                });

                setShowAddProductDialog(false);
                queryClient.invalidateQueries({
                  queryKey: ["/api/seller/products"],
                });
              } catch (error) {
                console.error("Error creating product:", error);
                toast({
                  title: t("toast.error"),
                  description:
                    error.message || t("toast.failedToCreateProduct"),
                  variant: "destructive",
                });
              } finally {
                setIsCreatingProduct(false);
              }
            }}
            onCancel={() => setShowAddProductDialog(false)}
            isLoading={isCreatingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Product Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("product.previewTitleCustomerView")}</DialogTitle>
            <DialogDescription>
              {t("product.previewDescriptionCustomerView")}
            </DialogDescription>
          </DialogHeader>
          {previewProduct && (
            <ProductPreview
              product={previewProduct}
              categories={typedCategories}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={showEditProductDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditProductDialog(false);
            setEditProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
          <AdvancedAddProductForm
            onSubmit={async (data) => {
              try {
                const response = await fetch(
                  `/api/products/${editProduct?.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                  }
                );

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(t("error.updateProductFailed"));
                }

                const updatedProduct = await response.json();
                console.log("Product updated:", updatedProduct);

                setShowEditProductDialog(false);
                setEditProduct(null);
                queryClient.invalidateQueries({
                  queryKey: ["/api/seller/products"],
                });

                toast({
                  title: t("toast.success"),
                  description: t("toast.productUpdatedSuccessfully"),
                });
              } catch (error) {
                console.error("Error updating product:", error);
                toast({
                  title: t("toast.error"),
                  description: t("toast.failedToUpdateProduct"),
                  variant: "destructive",
                });
              }
            }}
            onCancel={() => {
              setShowEditProductDialog(false);
              setEditProduct(null);
            }}
            isLoading={false}
            editMode={true}
            editProduct={editProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("product.deleteProductTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("product.deleteProductDescription", {
                name: productToDelete?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteProduct}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              disabled={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteProductMutation.isPending
                ? t("product.deleting")
                : t("product.deleteProductButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

// Product Card Component for Grid View
function ProductCard({
  product,
  categories,
  setPreviewProduct,
  setShowPreviewDialog,
  setEditProduct,
  setShowEditProductDialog,
  handleEditProduct,
  t,
  onDelete,
  isDeleting,
}: {
  product: Product;
  categories: any[];
  setPreviewProduct: (product: Product) => void;
  setShowPreviewDialog: (show: boolean) => void;
  setEditProduct: (product: Product) => void;
  setShowEditProductDialog: (show: boolean) => void;
  handleEditProduct: (product: Product) => void;
  t: (key: string) => string;
  onDelete: (productId: string) => void;
  isDeleting: boolean;
}) {
  const category = categories.find((c) => c.id === product.categoryId);
  const isOnSale =
    product.originalPrice &&
    parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = isOnSale
    ? Math.round(
        ((parseFloat(product.originalPrice!) - parseFloat(product.price)) /
          parseFloat(product.originalPrice!)) *
          100
      )
    : 0;

  return (
    <Card className="relative group hover:shadow-lg transition-shadow overflow-hidden">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <Badge className="bg-purple-600 text-white px-2 py-1 text-xs font-medium">
            ⭐ {t("product.star")}
          </Badge>
        )}
        {isOnSale && (
          <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* New Badge */}
      {Math.random() > 0.5 && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-blue-500 text-white px-2 py-1 text-xs font-medium">
            {t("product.newBadge")}
          </Badge>
        </div>
      )}

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={
                typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0]?.url || ""
              }
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500">
              {category?.name || "Footwear"}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>⭐ SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {product.price} AND
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice} AND
              </span>
            )}
          </div>

          {/* Stock and Brand */}
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-600">{t("product.stock.label")}</span>
              <span
                className={`ml-1 px-2 py-1 rounded text-xs ${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 10
                  ? "A stock"
                  : product.stock > 0
                  ? "Low stock"
                  : "Rupture"}{" "}
                {product.stock} units
              </span>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-gray-600">{t("product.brand")}:</span>
            <span className="ml-1 font-medium">{product.brand}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating) ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>

          {/* Sample text */}
          <p className="text-xs text-gray-500 line-clamp-2">
            Sample dummy {product?.name?.toLowerCase() || "product"} for layout
            test
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              data-testid={`button-details-${product.id}`}
              onClick={() => {
                setPreviewProduct(product);
                setShowPreviewDialog(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid={`button-edit-${product.id}`}
              onClick={() => handleEditProduct(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              data-testid={`button-delete-${product.id}`}
              onClick={() => onDelete(product.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Table Row Component for List View
function ProductTableRow({
  product,
  setPreviewProduct,
  setShowPreviewDialog,
  setEditProduct,
  setShowEditProductDialog,
  onDelete,
  isDeleting,
}: {
  product: Product;
  setPreviewProduct: (product: Product) => void;
  setShowPreviewDialog: (show: boolean) => void;
  setEditProduct: (product: Product) => void;
  setShowEditProductDialog: (show: boolean) => void;
  onDelete: (productId: string) => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={
                typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0]?.url || ""
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{product.name}</div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium">${product.price}</div>
      </td>
      <td className="py-3 px-4">
        <div>{product.stock}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-600">{product.sku}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-600">{product.brand}</div>
      </td>
      <td className="py-3 px-4">
        <Badge
          className={`px-2 py-1 text-xs rounded-full ${
            product.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.status === "active" ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            data-testid={`button-view-${product.id}`}
            onClick={() => {
              setPreviewProduct(product);
              setShowPreviewDialog(true);
            }}
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            data-testid={`button-edit-${product.id}`}
            onClick={() => handleEditProduct(product)}
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            data-testid={`button-delete-${product.id}`}
            onClick={() => onDelete(product.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
function ProductPreview({
  product,
  categories,
}: {
  product: Product;
  categories: any[];
}) {
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "fr" | "ar">(
    "en"
  );

  // 🖼️ Selected image index for main preview
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = (product.images as (string | { url: string })[]) || [];

  const category = categories.find((c) => c.id === product.categoryId);
  const SUPPORTED_LANGS = ["en", "fr", "ar"] as const;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      {/* ===================== Product Images ===================== */}
      <div className="space-y-4">
        {/* 🖼️ Big Main Image */}
        <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border">
          {images.length > 0 ? (
            <img
              src={
                typeof images[selectedImageIndex] === "string"
                  ? images[selectedImageIndex]
                  : images[selectedImageIndex]?.url || ""
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />

                <p className="text-gray-500">{t("product.noImageAvailable")}</p>
              </div>
            </div>
          )}
        </div>

        {/* 🧩 Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, index) => {
              const imageSrc = typeof img === "string" ? img : img?.url || "";
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 
                    ${
                      selectedImageIndex === index
                        ? "border-blue-500 scale-105"
                        : "border-transparent hover:border-gray-300"
                    }`}
                >
                  <img
                    src={imageSrc}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== Product Info ===================== */}
      <div className="space-y-6">
        {/* Language Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm font-medium">
              {t("common.language")}
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {SUPPORTED_LANGS.map((lang) => {
                const langLabels = {
                  en: "English",
                  fr: "Français",
                  ar: "العربية",
                };
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setCurrentLanguage(lang)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      currentLanguage === lang
                        ? "bg-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {langLabels[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Name & Basic Info */}
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            dir={currentLanguage === "ar" ? "rtl" : "ltr"}
          >
            {product.translations?.[currentLanguage]?.name ||
              product.name ||
              t("product.noNameAvailable")}
          </h1>

          <p className="text-gray-600">
            • {category?.name || t("product.uncategorized")}
            <br /> • SKU: {product.sku} <br />• {t("product.brand")}:{" "}
            {product.brand}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {renderStars(product.rating || 0)}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating || 0} ({product.reviewCount || 0}{" "}
            {t("product.reviews")})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-600">
            {product.price} AND
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {product.originalPrice} AND
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2">
          <Badge
            className={`${
              product.stock > 10
                ? "bg-green-100 text-green-800"
                : product.stock > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.stock > 10
              ? t("product.inStock")
              : product.stock > 0
              ? t("product.lowStock")
              : t("product.outOfStock")}
          </Badge>
          <span className="text-sm text-gray-600">
            {product.stock} {t("product.unitsAvailable")}
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("product.description")}
          </h3>
          <div
            className="text-gray-700 space-y-4"
            dir={currentLanguage === "ar" ? "rtl" : "ltr"}
          >
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    product.translations?.[currentLanguage]?.description ||
                    t("product.noDescriptionAvailable"),
                }}
              />
            </div>
          </div>
        </div>

        {/* Highlights */}
        {product.translations?.[currentLanguage]?.highlights && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("product.keyFeatures")}
            </h3>
            <div
              className="text-gray-700"
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
            >
              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.translations[currentLanguage].highlights,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button size="lg" className="flex-1" disabled={product.stock === 0}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            {t("product.addToCart")}
          </Button>
          <Button size="lg" variant="outline">
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Vendor Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {t("product.soldBy")}
          </h3>
          <p className="text-gray-700">
            {product.vendorName || t("product.yourStore")}
          </p>
        </Card>
      </div>
    </div>
  );
}
