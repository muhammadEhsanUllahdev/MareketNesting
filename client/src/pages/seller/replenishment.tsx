import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  AlertTriangle,
  Info,
  TrendingUp,
  CheckCircle,
  FileText,
  Eye,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ReplenishmentProduct {
  id: string;
  name: string;
  supplier: string;
  currentStock: number;
  minThreshold: number;
  suggestedQty: number;
  unitCost: number;
  totalCost: number;
  status: "on_hold" | "order";
}

export default function ReplenishmentPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ReplenishmentProduct | null>(null);

  const [selectAll, setSelectAll] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["replenishmentProducts"],
    queryFn: async () => {
      const res = await fetch("/api/replenishment");
      if (!res.ok) throw new Error(t("error.fetchReplenishment"));
      const raw = await res.json();

      return raw.map((p: any) => ({
        id: p.id,
        name: p.productName,
        supplier: p.storeName,
        currentStock: p.stock,
        minThreshold: p.minThreshold,
        suggestedQty: p.suggestedQuantity,
        unitCost: Number(p.price),
        totalCost: Number(p.suggestedQuantity) * Number(p.price),
        status: p.replenishmentStatus,
      }));
    },
  });

  // Mutation for creating replenishment order
  const createOrderMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const res = await fetch("/api/replenishment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      if (!res.ok) throw new Error(t("error.createOrder"));
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("success.orderCreated") });
      setSelectedProducts(new Set());
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ["replenishmentProducts"] });
    },
    onError: (err: any) => {
      toast({
        title: t("error.orderCreation"),
        description: String(err),
        variant: "destructive",
      });
    },
  });

  const confirmReStockmutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/replenishment/${productId}/reStock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(t("error.reStockOrder"));
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("success.orderRestocked") });
      queryClient.invalidateQueries({ queryKey: ["replenishmentProducts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (err: any) => {
      toast({
        title: t("error.reStockingOrder"),
        description: String(err),
        variant: "destructive",
      });
    },
  });

  // Filter products that need restocking
  const productsToRestock = products.filter(
    (p) => p.currentStock <= p.minThreshold
  );

  // Calculate metrics
  const totalSelected = selectedProducts.size;
  const totalSelectedCost = products
    .filter((p) => selectedProducts.has(p.id))
    .reduce((sum, p) => sum + p.totalCost, 0);

  const currentOrders = products.filter((p) => p.status === "order").length;

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(productsToRestock.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
    setSelectAll(checked);
  };

  // Handle individual product selection
  const handleProductSelect = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) newSelected.add(productId);
    else newSelected.delete(productId);
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === productsToRestock.length);
  };

  // Handle create order
  const handleCreateOrder = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: t("error.noProductsSelected"),
        description: t("error.selectProductsForOrder"),
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate([...selectedProducts]);
  };

  const handleConfirmReStock = (id: string) => {
    confirmReStockmutation.mutate(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6" />
              <h1 className="text-2xl font-bold">
                {t("replenishment.heading")}
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              {t("replenishment.subheading")}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{t("replenishment.historical")}</span>
            </Button>
            <Button
              className="flex items-center space-x-2"
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
            >
              <span>{t("replenishment.createOrderPrefix")}</span>
              <span>{totalSelected}</span>
              <span>{t("replenishment.createOrderSuffix")}</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("replenishment.productsToRestock")}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {productsToRestock.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("replenishment.selected")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalSelected}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("replenishment.estimatedCost")}
                  </p>
                  <p className="text-2xl font-bold">
                    {totalSelectedCost.toLocaleString()} JPY
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("replenishment.currentOrders")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Requiring Replenishment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("replenishment.productsRequiring")}</span>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  {t("replenishment.selectAll")}
                </label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {productsToRestock.replenishmentStatus === "on_hold" && (
                      <TableHead className="w-12"></TableHead>
                    )}
                    <TableHead>{t("replenishment.product")}</TableHead>
                    <TableHead>{t("replenishment.currentStock")}</TableHead>
                    <TableHead>{t("replenishment.minThreshold")}</TableHead>
                    <TableHead>{t("replenishment.suggestedQty")}</TableHead>
                    <TableHead>{t("replenishment.unitCost")}</TableHead>
                    <TableHead>{t("replenishment.totalCost")}</TableHead>
                    <TableHead>{t("replenishment.status")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsToRestock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                          <AlertTriangle className="h-8 w-8 text-gray-400" />
                          <p className="font-medium">
                            {t("replenishment.noProductsFound")}
                          </p>
                          <p className="text-sm">
                            {t("replenishment.allProductsStocked")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productsToRestock.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        {product.replenishmentStatus === "on_hold" && (
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={(checked) =>
                                handleProductSelect(
                                  product.id,
                                  checked as boolean
                                )
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {t("replenishment.supplier")}: {product.supplier}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${
                              product.currentStock <= product.minThreshold
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {product.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.minThreshold}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-blue-600">
                          {product.suggestedQty}
                        </TableCell>
                        <TableCell>
                          {product.unitCost.toLocaleString()} JPY
                        </TableCell>
                        <TableCell className="font-semibold">
                          {product.totalCost.toLocaleString()} JPY
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.replenishmentStatus === "on_hold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {product.replenishmentStatus === "on_hold"
                              ? t("replenishment.status.onHold")
                              : t("replenishment.status.order")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfirmReStock(product.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 🔍 View Replenishment Details Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails du réapprovisionnement</DialogTitle>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Produit</p>
                  <p className="font-semibold">{selectedProduct.name}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fournisseur</p>
                    <p className="font-semibold">{selectedProduct.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge
                      className={
                        selectedProduct.status === "on_hold"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {selectedProduct.status === "on_hold"
                        ? "En attente"
                        : "Commandé"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stock actuel
                    </p>
                    <p
                      className={`font-semibold ${
                        selectedProduct.currentStock <=
                        selectedProduct.minThreshold
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedProduct.currentStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Seuil minimal
                    </p>
                    <p className="font-semibold">
                      {selectedProduct.minThreshold}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Quantité suggérée
                    </p>
                    <p className="font-semibold text-blue-600">
                      {selectedProduct.suggestedQty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Coût unitaire
                    </p>
                    <p>{selectedProduct.unitCost.toLocaleString()} JPY</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Coût total</p>
                  <p className="text-lg font-bold text-purple-700">
                    {selectedProduct.totalCost.toLocaleString()} JPY
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
