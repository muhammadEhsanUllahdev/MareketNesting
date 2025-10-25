import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Store,
} from "lucide-react";
import AddProductModal from "@/components/modals/add-product-modal";
import ViewProductModal from "@/components/modals/view-product-modal";
import EditProductModal from "@/components/modals/edit-product-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdvancedAddProductForm } from "@/components/forms/advanced-add-product-form";

interface Store {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  status: "active" | "suspended" | "pending";
  userId: string;
  user?: {
    username: string;
    email: string;
  };
  products?: Product[];
  _count?: {
    products: number;
  };
}

interface Seller {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  status: "active" | "suspended" | "pending";
  storeName?: string;
  productCount?: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  categoryId?: string;
  categoryName?: string;
  sellerId?: string;
  status: "active" | "inactive";
  isActive: boolean;
  description?: string;
  shortDescription?: string;
  images?: string[];
  specifications?: Array<{ name: string; value: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  translations?: {
    [key: string]: {
      name: string;
      description?: string;
    };
  };
}

export default function AdminProductsManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [sellerProducts, setSellerProducts] = useState<
    Record<string, Product[]>
  >({});
  const [productsLoading, setProductsLoading] = useState<
    Record<string, boolean>
  >({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "product" | "store";
    id: string;
    name: string;
  }>({ open: false, type: "product", id: "", name: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Fetch sellers with their products
  const { data: rawSellers = [], isLoading: sellersLoading } = useQuery<
    Seller[]
  >({
    queryKey: ["/api/admin/sellers-with-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sellers-with-products", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("products.fetchFailed"));
      return response.json();
    },
  });

  const handleOpenAdd = (sellerId: string) => {
    setEditProduct(null);
    setSelectedSellerId(sellerId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditProduct(product);
    setSelectedSellerId(product.vendorId);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditProduct(null);
    setSelectedSellerId(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        vendorId: selectedSellerId || data.vendorId,
      };

      const url = editProduct
        ? `/api/admin/products/${editProduct.id}`
        : "/api/admin/products";
      const method = editProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("products.saveFailed"));
      }

      toast({
        title: t("common.success"),
        description: editProduct
          ? t("products.updateSuccess")
          : t("products.createSuccess"),
      });
      handleClose();
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/sellers-with-products"],
      });
      if (selectedSellerId) {
        await fetchProductsForSeller(selectedSellerId, true);
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("products.saveFailed"),
        variant: "destructive",
      });
    }
  };

  // Deduplicate sellers to avoid duplicate keys
  const sellers = rawSellers.filter(
    (seller, index, array) =>
      array.findIndex((s) => s.id === seller.id) === index
  );

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("products.deleteFailed"));
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/sellers-with-products"],
      });
      if (selectedSellerId) {
        await fetchProductsForSeller(selectedSellerId, true);
      }
      toast({
        title: t("common.success"),
        description: t("products.deleteSuccess"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("products.deleteFailed"),
        variant: "destructive",
      });
    },
  });

  const toggleRow = (sellerId: string) => {
    setExpandedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(sellerId)) {
        updated.delete(sellerId);
      } else {
        updated.add(sellerId);
      }
      return updated;
    });
  };
  // const fetchProductsForSeller = async (sellerId: string) => {
  //   if (productsLoading[sellerId] || sellerProducts[sellerId]) {
  //     return;
  //   }

  //   setProductsLoading((prev) => ({ ...prev, [sellerId]: true }));

  //   try {
  //     const response = await fetch(`/api/admin/sellers/${sellerId}/products`, {
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       throw new Error(t("products.fetchFailed"));
  //     }

  //     const products = await response.json();
  //     setSellerProducts((prev) => ({ ...prev, [sellerId]: products || [] }));
  //   } catch (error) {
  //     console.error(`${t("products.fetchError")} ${sellerId}:`, error);
  //     setSellerProducts((prev) => ({ ...prev, [sellerId]: [] }));
  //   } finally {
  //     setProductsLoading((prev) => ({ ...prev, [sellerId]: false }));
  //   }
  // };
  const fetchProductsForSeller = async (sellerId: string, force = false) => {
    if (productsLoading[sellerId]) return;

    // Only skip if data exists and not forcing refresh
    if (!force && sellerProducts[sellerId]) return;

    setProductsLoading((prev) => ({ ...prev, [sellerId]: true }));

    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/products`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(t("products.fetchFailed"));

      const products = await response.json();
      setSellerProducts((prev) => ({ ...prev, [sellerId]: products || [] }));
    } catch (error) {
      console.error(`${t("products.fetchError")} ${sellerId}:`, error);
      setSellerProducts((prev) => ({ ...prev, [sellerId]: [] }));
    } finally {
      setProductsLoading((prev) => ({ ...prev, [sellerId]: false }));
    }
  };

  // Fetch products for expanded sellers
  useEffect(() => {
    expandedRows.forEach((sellerId) => {
      fetchProductsForSeller(sellerId);
    });
  }, [expandedRows, sellerProducts, productsLoading]);

  // Handle search within seller products
  const handleSellerSearch = (sellerId: string, term: string) => {
    setSearchTerms((prev) => ({ ...prev, [sellerId]: term }));
  };

  // Filter products based on search term
  const filterProducts = (products: Product[], searchTerm: string) => {
    if (!searchTerm) return products;

    return products.filter((product) => {
      const name =
        product.translations?.[i18n.language]?.name ||
        product.translations?.en?.name ||
        product.name ||
        "";
      const sku = product.sku || "";
      const category = product.categoryName || "";

      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteDialog.type === "product") {
      deleteProductMutation.mutate(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: "product", id: "", name: "" });
  };

  // Download CSV template with all required fields
  const downloadCSVTemplate = () => {
    const csvHeaders = [
      "name",
      "description",
      "shortDescription",
      "sku",
      "price",
      "originalPrice",
      "stock",
      "categoryId",
      "vendorId",
      "brand",
      "images",
      "isFeatured",
      "isActive",
      "specifications_name",
      "specifications_value",
      "faqs_question",
      "faqs_answer",
      "translations_en_name",
      "translations_en_description",
      "translations_en_shortDescription",
      "translations_fr_name",
      "translations_fr_description",
      "translations_fr_shortDescription",
      "translations_ar_name",
      "translations_ar_description",
      "translations_ar_shortDescription",
    ];

    const csvExample = [
      "Gaming Laptop",
      "High-performance gaming laptop with RTX graphics card",
      "Gaming laptop for professionals and gamers",
      "GAMING-001",
      "120000.00",
      "150000.00",
      "10",
      "category-id-here",
      "seller-id-here",
      "ASUS",
      "https://example.com/image1.jpg;https://example.com/image2.jpg",
      "true",
      "true",
      "Processor;RAM;Storage",
      "Intel i7-12700H;16GB DDR5;1TB SSD",
      "What is the warranty?;Does it support gaming?",
      "2 years international warranty;Yes, with RTX graphics",
      "Gaming Laptop",
      "High-performance gaming laptop with RTX graphics card",
      "Gaming laptop for professionals and gamers",
      "Ordinateur Portable Gaming",
      "Ordinateur portable haute performance avec carte graphique RTX",
      "Ordinateur portable gaming pour professionnels et joueurs",
      "حاسوب محمول للألعاب",
      "حاسوب محمول عالي الأداء مع كرت رسومات RTX",
      "حاسوب محمول للألعاب للمحترفين واللاعبين",
    ];

    const csvContent = [csvHeaders.join(","), csvExample.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "products-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t("products.csvTemplateDownloaded"),
      description: t("products.csvTemplateDescription"),
    });
  };

  // Handle CSV file upload
  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast({
        title: t("common.error"),
        description: t("products.invalidFileType"),
        variant: "destructive",
      });
      return;
    }

    setCsvUploading(true);

    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const response = await fetch("/api/admin/products/bulk-upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("products.uploadFailed"));
      }

      const result = await response.json();

      toast({
        title: t("common.success"),
        description: `${result.created} ${t("products.createdSuccessfully")}${
          result.errors?.length
            ? `. ${result.errors.length} ${t("products.uploadErrors")}`
            : ""
        }`,
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/admin/sellers-with-products"],
      });

      if (result.errors?.length) {
        console.warn(t("products.uploadErrorsLog"), result.errors);
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("products.uploadFailed"),
        variant: "destructive",
      });
    } finally {
      setCsvUploading(false);
      event.target.value = "";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("status.active")}
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">{t("status.inactive")}</Badge>;
      case "suspended":
        return <Badge variant="destructive">{t("status.suspended")}</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {t("status.pending")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (sellersLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {t("products.managementTitle")}
            </h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                {t("products.loadingStoresProducts")}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              {t("products.managementTitle")}
            </h1>
            <p className="text-gray-600">{t("products.managementSubtitle")}</p>
          </div>

          <div className="flex gap-3">

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("products.totalStores")}
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("products.totalProducts")}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sellers.reduce(
                  (total, seller) => total + (seller.productCount || 0),
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("products.activeStores")}
              </CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sellers.filter((seller) => seller.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("products.activeProducts")}
              </CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sellers.reduce(
                  (total: number, seller: Seller) =>
                    total + (seller.productCount || 0),
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stores and Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sellers.productsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>{t("sellers.storeName")}</TableHead>
                    <TableHead>{t("sellers.owner")}</TableHead>
                    <TableHead>{t("sellers.status")}</TableHead>
                    <TableHead>{t("sellers.products")}</TableHead>
                    <TableHead>{t("sellers.activeProducts")}</TableHead>
                    <TableHead>{t("sellers.contact")}</TableHead>
                    {/* <TableHead>{t("sellers.actions")}</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller: Seller) => {
                    const isExpanded = expandedRows.has(seller.id);
                    const products = sellerProducts[seller.id] || [];
                    const isLoadingProducts =
                      productsLoading[seller.id] || false;

                    const filteredProducts = filterProducts(
                      products,
                      searchTerms[seller.id] || ""
                    );
                    const activeProductsCount = products.filter(
                      (p) => p.isActive
                    ).length;

                    return (
                      <React.Fragment key={seller.id}>
                        {/* Seller Row */}
                        <TableRow
                          className="hover:bg-gray-50"
                          data-testid={`row-seller-${seller.id}`}
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(seller.id)}
                              className="p-1"
                              data-testid={`button-expand-${seller.id}`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{seller.name}</div>
                              <div className="text-sm text-gray-600">
                                {seller.storeName
                                  ? `${t("sellers.store")}: ${seller.storeName}`
                                  : t("sellers.personalAccount")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {seller.username}
                              </div>
                              <div className="text-sm text-gray-600">
                                {seller.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(seller.status)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700"
                            >
                              {seller.productCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              {activeProductsCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{seller.email}</div>
                              {seller.firstName && seller.lastName && (
                                <div>
                                  {seller.firstName} {seller.lastName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Products Section */}
                        {isExpanded && (
                          <TableRow key={`products-${seller.id}`}>
                            <TableCell colSpan={8} className="p-0">
                              <div className="bg-gray-50 p-4 border-t">
                                <div className="space-y-4">
                                  {/* Search Bar for Products */}
                                  <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-md">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                      <Input
                                        placeholder={t(
                                          "sellers.searchProducts",
                                          {
                                            name: seller.name,
                                          }
                                        )}
                                        value={searchTerms[seller.id] || ""}
                                        onChange={(e) =>
                                          handleSellerSearch(
                                            seller.id,
                                            e.target.value
                                          )
                                        }
                                        className="pl-10"
                                        data-testid={`input-search-products-${seller.id}`}
                                      />
                                    </div>
                                    <Badge variant="outline">
                                      {filteredProducts.length}{" "}
                                      {t("sellers.of")} {products.length}{" "}
                                      {t("sellers.products")}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-end p-4">
                                    <Button
                                      onClick={() => handleOpenAdd(seller.id)}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      {t("products.addNewProduct")}
                                    </Button>
                                  </div>
                                  {/* Products List */}
                                  {isLoadingProducts ? (
                                    <div className="text-center py-8 text-gray-500">
                                      {t("sellers.loadingProducts")}
                                    </div>
                                  ) : filteredProducts.length > 0 ? (
                                    <div className="bg-white rounded-lg border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>
                                              {t("products.name")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.sku")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.category")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.price")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.stock")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.status")}
                                            </TableHead>
                                            <TableHead>
                                              {t("products.actions")}
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {filteredProducts.map((product) => {
                                            const productName =
                                              product.translations?.[
                                                i18n.language
                                              ]?.name ||
                                              product.translations?.en?.name ||
                                              product.name;

                                            return (
                                              <TableRow
                                                key={product.id}
                                                data-testid={`row-product-${product.id}`}
                                              >
                                                <TableCell className="font-medium">
                                                  {productName}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                  {product.sku}
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                  >
                                                    {product.categoryName}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                  {new Intl.NumberFormat(
                                                    "en-US",
                                                    {
                                                      style: "currency",
                                                      currency: "DZD",
                                                      minimumFractionDigits: 0,
                                                    }
                                                  ).format(
                                                    parseFloat(product.price)
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={
                                                      product.stock > 0
                                                        ? "outline"
                                                        : "destructive"
                                                    }
                                                    className={
                                                      product.stock > 0
                                                        ? "text-green-700 bg-green-50"
                                                        : ""
                                                    }
                                                  >
                                                    {product.stock > 0
                                                      ? t("products.inStocks", {
                                                          count: product.stock,
                                                        })
                                                      : t(
                                                          "products.outOfStock"
                                                        )}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  {getStatusBadge(
                                                    product.isActive
                                                      ? "active"
                                                      : "inactive"
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                      asChild
                                                    >
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-testid={`button-product-actions-${product.id}`}
                                                      >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          setViewProduct(
                                                            product
                                                          )
                                                        }
                                                      >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {t("products.view")}
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          handleOpenEdit(
                                                            product
                                                          )
                                                        }
                                                      >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        {t("products.edit")}
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                          setDeleteDialog({
                                                            open: true,
                                                            type: "product",
                                                            id: product.id,
                                                            name:
                                                              productName ||
                                                              product.sku,
                                                          })
                                                        }
                                                      >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t("products.delete")}
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500">
                                      {searchTerms[seller.id]
                                        ? t("sellers.noProductsFound")
                                        : t("sellers.noProductsYet")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {sellers.length === 0 && (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("sellers.noSellers")}
                </h3>
                <p className="text-gray-600">
                  {t("sellers.noSellersDescription")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dialog.confirmDeletion")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialog.deleteConfirmation", { name: deleteDialog.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("dialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("dialog.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Product Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-5xl bg-white overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">
                {editProduct
                  ? t("products.editProduct")
                  : t("products.addNewProduct")}
              </DialogTitle>
            </DialogHeader>

            <AdvancedAddProductForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isLoading={false}
              editMode={!!editProduct}
              editProduct={editProduct || undefined}
            />
          </DialogContent>
        </Dialog>


        {/* View Product Modal */}
        <ViewProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />

        {/* Edit Product Modal */}
        {/* <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
        /> */}
      </div>
    </DashboardLayout>
  );
}
