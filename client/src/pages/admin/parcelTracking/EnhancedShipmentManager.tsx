import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Plus,
  Search,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCarriers } from "@/pages/seller/shipping/hooks/carriers";
import { useTranslation } from "react-i18next";
type Shipment = {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  origin: string;
  destination: string;
  carrierId?: string;
  carrierName?: string;
  status: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  actualDelivery?: string | null;
  weight?: string;
  value?: string;
  shippingCost?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

const defaultForm = (): Partial<Shipment> => ({
  orderId: "",
  customerName: "",
  customerPhone: "",
  origin: "",
  destination: "",
  carrierId: undefined,
  status: "en_preparation",
  trackingNumber: "",
  estimatedDelivery: "",
  actualDelivery: null,
  weight: "",
  value: "",
  shippingCost: "",
  notes: "",
});

const EnhancedShipmentManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  // modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // form state for create / edit (keeps stable)
  const [form, setForm] = useState<Partial<Shipment>>(defaultForm());
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(
    null
  );

  // selected for details view
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const { carriers } = useCarriers();
  const { t } = useTranslation();

  // --- Fetch Shipments
  const {
    data: shipments = [],
    isLoading: isLoadingShipments,
    isFetching,
  } = useQuery<Shipment[]>({
    queryKey: ["admin:shipments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/shipments", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("shipments.loadError"));
      return (await res.json()) as Shipment[];
    },
    staleTime: 10_000,
  });

  // --- create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Shipment>) => {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || t("common.createError"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin:shipments"] });
      setIsCreateOpen(false);
      setForm(defaultForm());
      toast({
        title: t("shipments.createdTitle"),
        description: t("shipments.createdDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("shipments.createFailed"),
        variant: "destructive",
      });
    },
  });

  // --- update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Shipment>;
    }) => {
      const res = await fetch(`/api/admin/shipments/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || t("common.updateError"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin:shipments"] });
      setIsCreateOpen(false);
      setIsDetailsOpen(false);
      setSelectedShipment(null);
      toast({
        title: t("common.updatedTitle"),
        description: t("shipments.statusUpdated"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("shipments.updateFailed"),
        variant: "destructive",
      }),
  });

  // --- delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/shipments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || t("common.deleteError"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin:shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments-analytics"] });
      setIsDeleteOpen(false);
      setSelectedShipment(null);
      toast({
        title: t("common.deletedTitle"),
        description: t("shipments.deletedDesc"),
      });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("shipments.deleteFailed"),
        variant: "destructive",
      }),
  });

  // handlers stable with useCallback
  const openCreateModal = useCallback(() => {
    setForm(defaultForm());
    setEditingShipmentId(null);
    setIsCreateOpen(true);
  }, []);

  const openEditModal = useCallback((s: Shipment) => {
    setEditingShipmentId(s.id);
    setForm({
      orderId: s.orderId,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      origin: s.origin,
      destination: s.destination,
      carrierId: s.carrierId,
      status: s.status,
      trackingNumber: s.trackingNumber,
      estimatedDelivery: s.estimatedDelivery,
      weight: s.weight,
      value: s.value,
      shippingCost: s.shippingCost,
      notes: s.notes,
    });
    setIsCreateOpen(true);
  }, []);

  const openDetails = useCallback((s: Shipment) => {
    setSelectedShipment(s);
    setIsDetailsOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(async () => {
    // basic validation
    if (
      !form.orderId ||
      !form.customerName ||
      !form.origin ||
      !form.destination
    )
      return toast({
        title: t("form.missingFieldsTitle"),
        description: t("form.missingFieldsDesc"),
        variant: "destructive",
      });

    createMutation.mutate({
      ...form,
      createdAt: new Date().toISOString(),
    } as Partial<Shipment>);
  }, [form, createMutation, toast]);

  const handleEditSubmit = useCallback(async () => {
    if (!editingShipmentId) return;
    updateMutation.mutate({ id: editingShipmentId, data: form });
  }, [editingShipmentId, form, updateMutation]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm(t("shipments.confirmDelete"))) return;
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  // filtered view
  const filteredShipments = shipments.filter((shipment: Shipment) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (shipment.customerName || "").toLowerCase().includes(q) ||
      (shipment.trackingNumber || "").toLowerCase().includes(q) ||
      (shipment.orderId || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // status helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_preparation":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t("shipments.status.preparation")}
          </Badge>
        );
      case "en_transit":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {t("shipments.status.transit")}
          </Badge>
        );
      case "livre":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("shipments.status.delivered")}
          </Badge>
        );
      case "retarde":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("shipments.status.delayed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("shipments.status.unknown")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_preparation":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "en_transit":
        return <Truck className="h-4 w-4 text-orange-600" />;
      case "livre":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "retarde":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // cycle next status helper
  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = {
      en_preparation: "en_transit",
      en_transit: "livre",
      livre: "livre",
      retarde: "en_transit",
    };
    return flow[current] || current;
  };

  // update status inline (mutation)
  const handleQuickStatusUpdate = useCallback(
    (s: Shipment) => {
      const next = getNextStatus(s.status);
      updateMutation.mutate({ id: s.id, data: { status: next } });
    },
    [updateMutation]
  );

  // render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("shipments.heading")}</h2>
          <p className="text-muted-foreground">{t("shipments.subheading")}</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("shipments.newShipment")}
        </Button>
      </div>

      {/* Stats small */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />{" "}
              {t("shipments.stats.total")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-sm text-muted-foreground">
              {t("shipments.stats.shipments")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />{" "}
              {t("shipments.stats.inTransit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => s.status === "en_transit").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipments.stats.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />{" "}
              {t("shipments.stats.delivered")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => s.status === "livre").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipments.stats.completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />{" "}
              {t("shipments.stats.delayed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => s.status === "retarde").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipments.stats.issues")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {t("shipments.listTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLoadingShipments
                ? t("common.loading")
                : `${filteredShipments.length} ${t("shipments.found")}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.searchPlaceholder")}
                className="pl-8 w-[260px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue
                  placeholder={t("shipments.filters.statusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("shipments.filters.all")}
                </SelectItem>
                <SelectItem value="en_preparation">
                  {t("shipments.status.preparation")}
                </SelectItem>
                <SelectItem value="en_transit">
                  {t("shipments.status.transit")}
                </SelectItem>
                <SelectItem value="livre">
                  {t("shipments.status.delivered")}
                </SelectItem>
                <SelectItem value="retarde">
                  {t("shipments.status.delayed")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("shipments.table.shipment")}</TableHead>
                  <TableHead>{t("shipments.table.client")}</TableHead>
                  <TableHead>{t("shipments.table.route")}</TableHead>
                  <TableHead>{t("shipments.table.carrier")}</TableHead>
                  <TableHead>{t("shipments.table.status")}</TableHead>
                  <TableHead>
                    {t("shipments.table.estimatedDelivery")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredShipments.map((sh) => (
                  <TableRow key={sh.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sh.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {sh.orderId}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">{sh.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {sh.customerPhone}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {sh.origin} → {sh.destination}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span>{sh.carrierName || "-"}</span>
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(sh.status)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {sh.estimatedDelivery
                            ? new Date(sh.estimatedDelivery).toLocaleDateString(
                                "fr-FR"
                              )
                            : "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(sh)}
                          title={t("common.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(sh)}
                          title={t("common.edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickStatusUpdate(sh)}
                          disabled={sh.status === "livre"}
                          title={
                            sh.status === "livre"
                              ? t("shipments.status.alreadyDelivered")
                              : t("shipments.status.updateStatus")
                          }
                        >
                          {getStatusIcon(sh.status)}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedShipment(sh);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 transition-colors"
                          title={t("shipments.deleteShipment")}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredShipments.length === 0 && !isLoadingShipments && (
              <div className="p-6 text-center text-muted-foreground">
                {t("shipments.noResults")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Create / Edit Modal ---------- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingShipmentId
                ? t("shipments.editTitle")
                : t("shipments.createTitle")}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingShipmentId) handleEditSubmit();
              else handleCreateSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.orderNumber")}
                </label>
                <Input
                  placeholder={t("shipments.form.orderNumberPlaceholder")}
                  value={form.orderId || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orderId: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.client")}
                </label>
                <Input
                  placeholder={t("shipments.form.clientPlaceholder")}
                  value={form.customerName || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.phone")}
                </label>
                <Input
                  placeholder={t("shipments.form.phonePlaceholder")}
                  value={form.customerPhone || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerPhone: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.carrier")}
                </label>

                {carriers && carriers.length > 0 ? (
                  <Select
                    value={form.carrierId ? String(form.carrierId) : "null"}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        carrierId: v === "null" ? undefined : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("shipments.form.chooseCarrier")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {t("shipments.form.noCarrier")}
                      </SelectItem>
                      {carriers.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t("shipments.loadingCarriers")}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.origin")}
                </label>
                <Input
                  placeholder={t("shipments.form.originPlaceholder")}
                  value={form.origin || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, origin: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.destination")}
                </label>
                <Input
                  placeholder={t("shipments.form.destinationPlaceholder")}
                  value={form.destination || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destination: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.weight")}
                </label>
                <Input
                  placeholder={t("shipments.form.weightPlaceholder")}
                  value={form.weight || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, weight: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.value")}
                </label>
                <Input
                  placeholder={t("shipments.form.valuePlaceholder")}
                  value={form.value || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.shippingCost")}
                </label>
                <Input
                  placeholder={t("shipments.form.shippingCostPlaceholder")}
                  value={form.shippingCost || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shippingCost: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("shipments.form.estimatedDelivery")}
                </label>
                <Input
                  type="date"
                  value={
                    form.estimatedDelivery
                      ? form.estimatedDelivery.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimatedDelivery: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    }))
                  }
                />
              </div>

              {editingShipmentId && (
                <div>
                  <label className="text-sm font-medium">
                    {t("shipments.form.actualDelivery")}
                  </label>
                  <Input
                    type="date"
                    value={
                      form.actualDelivery
                        ? form.actualDelivery.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        actualDelivery: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                {t("shipments.form.trackingNumber")}
              </label>
              <Input
                placeholder={t("shipments.form.trackingNumberPlaceholder")}
                value={form.trackingNumber || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trackingNumber: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                {t("shipments.form.notes")}
              </label>
              <Textarea
                placeholder={t("shipments.form.notesPlaceholder")}
                value={form.notes || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setForm(defaultForm());
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingShipmentId
                  ? updateMutation.isPending
                    ? t("common.updating")
                    : t("common.save")
                  : createMutation.isPending
                  ? t("common.creating")
                  : t("common.create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Details Modal ---------- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("shipment.details.title")}</DialogTitle>
          </DialogHeader>
          {selectedShipment ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedShipment.status)}
                {getStatusBadge(selectedShipment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("shipment.details.order")}
                  </label>
                  <div className="font-medium">{selectedShipment.orderId}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("shipment.details.tracking")}
                  </label>
                  <div className="font-medium">
                    {selectedShipment.trackingNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("shipment.details.customer")}
                  </label>
                  <div className="font-medium">
                    {selectedShipment.customerName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedShipment.customerPhone}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("shipment.details.carrier")}
                  </label>
                  <div className="font-medium">
                    {selectedShipment.carrierName}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setSelectedShipment(null);
                  }}
                >
                  {t("common.close")}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedShipment) openEditModal(selectedShipment);
                  }}
                >
                  {t("common.edit")}
                </Button>
              </div>
            </div>
          ) : (
            <div>{t("shipment.details.noData")}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* 🗑️ Delete Shipment Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("shipment.delete.title")}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="py-4">
              <p className="text-center text-lg font-medium">
                {t("shipment.delete.confirmText")}{" "}
                <strong>{selectedShipment.orderId}</strong> ?
              </p>
              <p className="text-center text-muted-foreground mt-1">
                {t("shipment.delete.irreversible")}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedShipment(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (selectedShipment?.id) {
                  deleteMutation.mutate(selectedShipment.id);
                }
              }}
            >
              {deleteMutation.isPending
                ? t("shipment.delete.deleting")
                : t("shipment.delete.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedShipmentManager;
