import { useState, useMemo } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  exportToExcel,
  formatCurrency,
  formatDate,
  formatBoolean,
} from "@/utils/excel-export";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  Repeat,
  BarChart3,
  Download,
  Settings,
  Plus,
  Minus,
} from "lucide-react";

interface Product {
  id: string;
  sku: string;
  price: string;
  stock: number;
  status: "active" | "inactive";
  brand: string;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
      highlights?: string;
    };
  };
}

interface StockAdjustment {
  productId: string;
  adjustmentType: "increase" | "decrease";
  quantity: number;
  reason: string;
  notes?: string;
  alsoPriceAdjust?: boolean;
  newPrice?: number;
}

export default function InventoryOverview() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase"
  );
  const [adjustmentQuantity, setAdjustmentQuantity] = useState();
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [alsoPriceAdjust, setAlsoPriceAdjust] = useState(false);

  // Fetch seller's products
  const { data: products = [], isLoading } = useQuery({
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


  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter((p: Product) => p.stock === 0).length;
    const lowStock = products.filter(
      (p: Product) => p.stock > 0 && p.stock <= 5
    ).length;
    const toBeRestocked = products.filter((p: Product) => p.stock <= 10).length;
    const totalValue = products.reduce((sum: number, p: Product) => {
      return sum + parseFloat(p.price) * p.stock;
    }, 0);

    return {
      totalProducts,
      outOfStock,
      lowStock,
      toBeRestocked,
      totalValue: totalValue.toFixed(2),
    };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const productName =
        product.translations?.[i18n.language]?.name ||
        product.translations?.en?.name ||
        "";
      const matchesSearch =
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (filterStatus === "breakup") {
        matchesFilter = product.stock === 0;
      } else if (filterStatus === "low-stock") {
        matchesFilter = product.stock > 0 && product.stock <= 5;
      } else if (filterStatus === "restock") {
        matchesFilter = product.stock <= 10;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterStatus, i18n.language]);

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
  mutationFn: async (adjustment: StockAdjustment) => {
    return apiRequest(
      "PATCH",
      `/api/seller/products/${adjustment.productId}/adjust-stock`,
      adjustment
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
    toast({
      title: t("stock.adjustSuccessTitle"),
      description: t("stock.adjustSuccessDesc"),
    });
    setShowAdjustModal(false);
    resetAdjustmentForm();
  },
  onError: (error: any) => {
    toast({
      title: t("stock.adjustErrorTitle"),
      description: error.message || t("stock.adjustErrorDesc"),
      variant: "destructive",
    });
  },
});


  const resetAdjustmentForm = () => {
    setSelectedProduct(null);
    setAdjustmentType("increase");
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
    setAdjustmentNotes("");
    setAlsoPriceAdjust(false);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const handleConfirmAdjustment = () => {
    if (!selectedProduct || adjustmentQuantity <= 0 || !adjustmentReason) {
      toast({
  title: t("form.validationError"),
  description: t("form.fillAllRequiredFields"),
  variant: "destructive",
});

      return;
    }

    adjustStockMutation.mutate({
      productId: selectedProduct.id,
      adjustmentType,
      quantity: adjustmentQuantity,
      reason: adjustmentReason,
      notes: adjustmentNotes,
      alsoPriceAdjust,
      newPrice: alsoPriceAdjust ? parseFloat(selectedProduct.price) : undefined,
    });
  };

  const getStatusBadge = (stock: number) => {
  if (stock === 0) {
    return (
      <Badge variant="destructive" data-testid="status-out-of-stock">
        {t("product.status.outOfStock")}
      </Badge>
    );
  } else if (stock <= 5) {
    return (
      <Badge variant="secondary" data-testid="status-restock">
        {t("product.status.restock")}
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800"
        data-testid="status-in-stock"
      >
        {t("product.status.inStock")}
      </Badge>
    );
  }
};


  const calculateNewStock = () => {
    if (!selectedProduct) return 0;

    if (adjustmentType === "increase") {
      return selectedProduct.stock + adjustmentQuantity;
    } else {
      return Math.max(0, selectedProduct.stock - adjustmentQuantity);
    }
  };

  const handleExportInventory = () => {
  if (!filteredProducts.length) {
    alert(t("inventory.noDataToExport"));
    return;
  }

  const columns = [
    { key: "sku", label: t("inventory.sku") },
    { key: "translations.en.name", label: t("inventory.productName") },
    { key: "brand", label: t("inventory.brand") },
    { key: "price", label: t("inventory.price"), format: formatCurrency },
    { key: "stock", label: t("inventory.currentStock") },
    { key: "status", label: t("inventory.status") },
    { key: "createdAt", label: t("inventory.createdDate"), format: formatDate },
    { key: "updatedAt", label: t("inventory.lastUpdated"), format: formatDate },
  ];

  const success = exportToExcel({
    filename: `inventory-${new Date().toISOString().split("T")[0]}`,
    sheetName: t("inventory.sheetName"),
    columns,
    data: filteredProducts,
  });

  if (success) {
    console.log(t("inventory.exportSuccess"));
  } else {
    alert(t("inventory.exportFailed"));
  }
};


  return (
    <DashboardLayout title={t("header.heading")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                {t("inventory.title")}
              </h1>
            </div>
            <p className="text-gray-600 mt-1">{t("inventory.subtitle")}</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportInventory}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            {t("inventory.export")}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("inventory.totalProducts")}
              </CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="stat-total-products"
              >
                {inventoryStats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("inventory.outOfStock")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-red-600"
                data-testid="stat-out-of-stock"
              >
                {inventoryStats.outOfStock}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("inventory.lowStock")}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-orange-600"
                data-testid="stat-low-stock"
              >
                {inventoryStats.lowStock}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("inventory.toBeRestocked")}
              </CardTitle>
              <Repeat className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-yellow-600"
                data-testid="stat-to-be-restocked"
              >
                {inventoryStats.toBeRestocked}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("inventory.stockValue")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-blue-600"
                data-testid="stat-stock-value"
              >
                {inventoryStats.totalValue} DA
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("inventory.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              data-testid="filter-all"
            >
              {t("inventory.filter.all")}
            </Button>
            <Button
              variant={filterStatus === "breakup" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("breakup")}
              data-testid="filter-breakup"
            >
              {t("inventory.filter.breakup")}
            </Button>
            <Button
              variant={filterStatus === "low-stock" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("low-stock")}
              data-testid="filter-low-stock"
            >
              {t("inventory.filter.lowStock")}
            </Button>
            <Button
              variant={filterStatus === "restock" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("restock")}
              data-testid="filter-restock"
            >
              {t("inventory.filter.restock")}
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">
                    {t("inventory.table.product")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.sku")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.totalStock")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.available")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.status")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.price")}
                  </TableHead>
                  <TableHead className="font-medium">
                    {t("inventory.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("inventory.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      {t("inventory.table.noProducts")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: Product) => (
                    <TableRow
                      key={product.id}
                      data-testid={`row-product-${product.id}`}
                    >
                      <TableCell>
                        <div>
                          <div
                            className="font-medium"
                            data-testid={`text-product-name-${product.id}`}
                          >
                            {product.translations?.[i18n.language]?.name ||
                              product.translations?.en?.name ||
                              t("inventory.unnamedProduct")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="font-mono text-sm"
                        data-testid={`text-sku-${product.id}`}
                      >
                        {product.sku}
                      </TableCell>
                      <TableCell data-testid={`text-total-stock-${product.id}`}>
                        {product.stock}
                      </TableCell>
                      <TableCell
                        data-testid={`text-available-stock-${product.id}`}
                      >
                        {product.stock}
                      </TableCell>
                      <TableCell>{getStatusBadge(product.stock)}</TableCell>
                      <TableCell data-testid={`text-price-${product.id}`}>
                        {product.price} DA
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                          data-testid={`button-adjust-${product.id}`}
                        >
                          {t("inventory.table.adjustment")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stock Adjustment Modal */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogContent className="max-w-lg" data-testid="modal-adjust-stock">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <DialogTitle>{t("adjustment.title")}</DialogTitle>
              </div>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="font-medium"
                      data-testid="text-selected-product-name"
                    >
                      {selectedProduct.translations?.[i18n.language]?.name ||
                        selectedProduct.translations?.en?.name ||
                        t("inventory.unnamedProduct")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      SKU: {selectedProduct.sku}
                    </p>
                  </div>
                  {getStatusBadge(selectedProduct.stock)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      {t("adjustment.available")}{" "}
                    </span>
                    <span data-testid="text-current-stock">
                      {selectedProduct.stock}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("adjustment.currentStock")}{" "}
                    </span>
                    <span data-testid="text-current-stock-value">
                      {selectedProduct.stock}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("adjustment.threshold")}{" "}
                    </span>
                    <span>10</span>
                  </div>
                </div>

                {/* Adjustment Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("adjustment.type")}
                  </label>
                  <Select
                    value={adjustmentType}
                    onValueChange={(value: "increase" | "decrease") =>
                      setAdjustmentType(value)
                    }
                  >
                    <SelectTrigger data-testid="select-adjustment-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          {t("adjustment.increase")}
                        </div>
                      </SelectItem>
                      <SelectItem value="decrease">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-600" />
                          {t("adjustment.decrease")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("adjustment.quantity")}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={adjustmentQuantity}
                    onChange={(e) =>
                      setAdjustmentQuantity(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    data-testid="input-adjustment-quantity"
                  />
                </div>

                {/* New Stock Preview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("adjustment.newStock")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-medium text-lg"
                        data-testid="text-new-stock"
                      >
                        {calculateNewStock()}
                      </span>
                      {getStatusBadge(calculateNewStock())}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("adjustment.reason")}
                  </label>
                  <Select
                    value={adjustmentReason}
                    onValueChange={setAdjustmentReason}
                  >
                    <SelectTrigger data-testid="select-adjustment-reason">
                      <SelectValue placeholder={t("adjustment.selectReason")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">
                        {t("adjustment.purchase")}
                      </SelectItem>
                      <SelectItem value="sale">
                        {t("adjustment.sale")}
                      </SelectItem>
                      <SelectItem value="return">
                        {t("adjustment.return")}
                      </SelectItem>
                      <SelectItem value="damage">
                        {t("adjustment.damage")}
                      </SelectItem>
                      <SelectItem value="loss">
                        {t("adjustment.loss")}
                      </SelectItem>
                      <SelectItem value="correction">
                        {t("adjustment.correction")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("adjustment.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t("adjustment.notes")}
                  </label>
                  <Textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder={t("adjustment.notesPlaceholder")}
                    data-testid="textarea-adjustment-notes"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdjustModal(false)}
                    className="flex-1"
                    data-testid="button-cancel-adjustment"
                  >
                    {t("adjustment.cancel")}
                  </Button>
                  <Button
                    onClick={handleConfirmAdjustment}
                    disabled={adjustStockMutation.isPending}
                    className="flex-1"
                    data-testid="button-confirm-adjustment"
                  >
                    {adjustStockMutation.isPending
                      ? t("adjustment.adjusting")
                      : t("adjustment.confirm")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
