import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AlertTriangle, Search, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
const ProductBlacklist = () => {
  const { toast } = useToast();
    const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("permanent");

  // 🟢 Fetch Blacklist
  const { data: blacklist = [], isLoading } = useQuery({
    queryKey: ["blacklist"],
    queryFn: async () => {
      const res = await fetch("/api/blacklist");
      if (!res.ok) throw new Error(t("error.fetchBlacklist"));
      return res.json();
    },
  });

  // 🟢 Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["blacklist-categories"],
    queryFn: async () => {
      const res = await fetch("/api/blacklist/categories");
      if (!res.ok) throw new Error(t("error.fetchCategories"));
      return res.json();
    },
  });

  // 🟢 Fetch Products by Category
  const { data: productsByCategory = [] } = useQuery({
    queryKey: ["blacklist-products", selectedCategoryId],
    enabled: !!selectedCategoryId,
    queryFn: async () => {
      const res = await fetch(
        `/api/blacklist/products?categoryId=${selectedCategoryId}`
      );
      if (!res.ok) throw new Error(t("error.fetchProducts"));
      return res.json();
    },
  });

  // 🟠 Add Mutation
  const addBlacklistMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("error.addBlacklist"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist"] });
      setIsAddDialogOpen(false);
      toast({
        title: t("toast.addSuccessTitle"),
        description: t("toast.addSuccessDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("toast.errorTitle"),
        description: t("toast.addErrorDesc"),
        variant: "destructive",
      }),
  });

  // 🔴 Delete Mutation
  const deleteBlacklistMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/blacklist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("error.deleteBlacklist"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: t("toast.deleteSuccessTitle"),
        description: t("toast.deleteSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("toast.errorTitle"),
        description: t("toast.deleteErrorDesc"),
        variant: "destructive",
      });
    },
  });

  // 🧩 Helper
  const handleStatusBadge = (status: string) => {
    switch (status) {
      case "permanent":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            {t("status.permanent")}
          </Badge>
        );
      case "temporary":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            {t("status.temporary")}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 🧠 Filter by status + search
  const filteredProducts = blacklist.filter((p: any) => {
    const matchesSearch =
      p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = currentFilter === "all" || p.status === currentFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout title={t("page.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("page.heading")}</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("button.addToBlacklist")}
          </Button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">
              {t("alert.title")}
            </h3>
            <p className="text-sm text-amber-700">
              {t("alert.description")}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border shadow">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-3">
  <Tabs defaultValue="all" onValueChange={setCurrentFilter}>
    <TabsList>
      <TabsTrigger value="all">{t("blacklist.tabs.all")}</TabsTrigger>
      <TabsTrigger value="permanent">{t("blacklist.tabs.permanent")}</TabsTrigger>
      <TabsTrigger value="temporary">{t("blacklist.tabs.temporary")}</TabsTrigger>
    </TabsList>
  </Tabs>

  <div className="relative w-full sm:w-auto">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={t("blacklist.searchPlaceholder")}
      className="pl-8 w-full sm:w-64"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>


          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.product")}</TableHead>
                  <TableHead>{t("table.category")}</TableHead>
                  <TableHead>{t("table.reason")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.addedDate")}</TableHead>
                  <TableHead>{t("table.addedBy")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell>{p.categoryName}</TableCell>
                    <TableCell>{p.reason}</TableCell>
                    <TableCell>{handleStatusBadge(p.status)}</TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{p.addedBy}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {t("table.noProductFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ➕ Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("dialog.addTitle")}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>{t("form.category")}</Label>
              <Select onValueChange={(val) => setSelectedCategoryId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategoryId && (
              <div>
                <Label>{t("form.product")}</Label>
                <Select onValueChange={(val) => setSelectedProductId(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {productsByCategory.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>{t("form.reason")}</Label>
              <Textarea
                placeholder={t("form.reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div>
              <Label>{t("form.status")}</Label>
              <Select onValueChange={setStatus} defaultValue="permanent">
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">{t("status.permanent")}</SelectItem>
                  <SelectItem value="temporary">{t("status.temporary")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("button.cancel")}
            </Button>
            <Button
              onClick={() =>
                addBlacklistMutation.mutate({
                  productId: selectedProductId,
                  categoryId: selectedCategoryId,
                  reason,
                  status,
                })
              }
              disabled={
                !selectedProductId || !reason || addBlacklistMutation.isPending
              }
            >
              {t("button.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 👁️ View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>{t("blacklist.detailsTitle")}</DialogTitle>
    </DialogHeader>
    {selectedProduct && (
      <div className="space-y-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.product")}</p>
          <p className="font-semibold">{selectedProduct.productName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.category")}</p>
          <p>{selectedProduct.categoryName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.reason")}</p>
          <p>{selectedProduct.reason}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.status")}</p>
          {handleStatusBadge(selectedProduct.status)}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.date")}</p>
          <p>{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("blacklist.addedBy")}</p>
          <p>{selectedProduct.addedBy}</p>
        </div>
      </div>
    )}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
        {t("common.close")}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* ❌ Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t("dialog.deleteTitle")}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4 text-center">
              <p className="font-medium">{selectedProduct.productName}</p>
              <p className="text-sm text-muted-foreground">
                {t("dialog.categoryLabel")}: {selectedProduct.categoryName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("button.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteBlacklistMutation.mutate(selectedProduct.id)}
              disabled={deleteBlacklistMutation.isPending}
            >
              {t("button.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};


export default ProductBlacklist;
