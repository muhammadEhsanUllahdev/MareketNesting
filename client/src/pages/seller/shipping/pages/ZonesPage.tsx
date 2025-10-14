import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useZones } from "../hooks/useZones";
import { useCarriers } from "../hooks/useCarriers";
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
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const ZonesPage = () => {
  const { zones, isLoadingZones, createZone, updateZone, deleteZone } =
    useZones();

  const { carriers, isLoadingCarriers } = useCarriers();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: carrierOptions = {} } = useQuery({
    queryKey: ["carrierOptionsAll"],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      await Promise.all(
        carriers.map(async (carrier) => {
          const res = await fetch(`/api/carriers/${carrier.id}/options`);
          if (res.ok) result[carrier?.id as string] = await res.json();
        })
      );
      return result;
    },
    enabled: carriers.length > 0,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cities: "",
    selectedCarriers: [] as string[],
    isActive: true,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // --- Filtered Zones ---
  const filteredZones = useMemo(() => {
    return (zones || []).filter((zone: any) => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (zone.cities || []).some((c: string) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && zone.isActive) ||
        (statusFilter === "inactive" && !zone.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [zones, searchTerm, statusFilter]);

  // --- Stats ---
  const stats = useMemo(() => {
    const total = zones.length;
    const active = zones.filter((z: any) => z.isActive).length;
    const inactive = zones.filter((z: any) => !z.isActive).length;
    const avgPrice =
      zones.length > 0
        ? Math.round(
            zones.reduce((acc: number, z: any) => {
              const avgZonePrice =
                (z.carriers || []).reduce(
                  (sum: number, c: any) => sum + (c.price || 0),
                  0
                ) / ((z.carriers || []).length || 1);
              return acc + avgZonePrice;
            }, 0) / zones.length
          )
        : 0;
    return { total, active, inactive, avgPrice };
  }, [zones]);

  const openDialog = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        cities: (zone.cities || []).join(", "),
        selectedCarriers: (zone.carriers || []).map((c: any) => c.carrierId),
        isActive: zone.isActive,
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: "",
        cities: "",
        selectedCarriers: [],
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.cities ||
      formData.selectedCarriers.length === 0
    ) {
      toast({
        title: t("form.errorTitle"),
        description: t("form.fillAllRequiredFields"),
        variant: "destructive",
      });

      return;
    }

    const selectedCarriersData = formData.selectedCarriers
      .map((id) => {
        const carrier = carriers.find((c) => c.id === id);
        if (!carrier) return null;
        return {
          carrierId: carrier.id,
          price: carrier.basePrice,
          deliveryTime: "2 - 3 jours",
          isActive: true,
        };
      })
      .filter(Boolean);

    const zonePayload = {
      name: formData.name,
      cities: formData.cities
        .split(/[\s,;]+/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
      isActive: formData.isActive,
      zoneCarriers: selectedCarriersData,
    };

    if (editingZone) {
      await updateZone.mutateAsync({
        id: editingZone.id,
        ...zonePayload,
      });
    } else {
      await createZone.mutateAsync(zonePayload);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setZoneToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (zoneToDelete) deleteZone.mutate(zoneToDelete);
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  if (isLoadingZones || isLoadingCarriers) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("delivery.zonesTitle")}</h1>
          <p className="text-muted-foreground">
            {t("delivery.zonesDescription")}
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => openDialog()}
        >
          <Plus className="h-4 w-4" />
          {t("delivery.newZoneButton")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p>{t("delivery.totalZones")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p>{t("delivery.activeZones")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.inactive}
            </div>
            <p>{t("delivery.inactiveZones")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.avgPrice} DA</div>
            <p>{t("delivery.averagePrice")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("delivery.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded p-2"
          >
            <option value="all">{t("delivery.allZones")}</option>
            <option value="active">{t("delivery.activeZones")}</option>
            <option value="inactive">{t("delivery.inactiveZones")}</option>
          </select>
        </CardContent>
      </Card>

      {/* Zones List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone: any) => (
          <Card key={zone.id} className={!zone.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" /> {zone.name}
                </CardTitle>
                <Badge variant={zone.isActive ? "default" : "secondary"}>
                  {zone.isActive
                    ? t("delivery.active")
                    : t("delivery.inactive")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  {t("delivery.coveredCities")}
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(zone.cities || []).map((c: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {t("delivery.carriers")}
                </Label>
                <div className="space-y-2 mt-2">
                  {(zone.carriers || []).map((c: any) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-lg"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {c.carrierName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.deliveryTime}
                        </span>
                      </div>
                      <Badge variant="secondary">{c.price} DA</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(zone)}
                >
                  <Edit className="h-4 w-4 mr-1" /> {t("delivery.editButton")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(zone.id)}
                >
                  <Trash2 className="h-4 w-4" /> {t("delivery.deleteButton")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingZone
                  ? t("delivery.editZoneTitle")
                  : t("delivery.newZoneTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("delivery.configureZone")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">{t("delivery.nameLabel")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="cities">{t("delivery.citiesLabel")} *</Label>
                <Input
                  id="cities"
                  value={formData.cities}
                  onChange={(e) =>
                    setFormData({ ...formData, cities: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>{t("delivery.carriersLabel")} *</Label>
                <div className="space-y-2">
                  {carriers.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedCarriers.includes(c.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.selectedCarriers, c.id]
                            : formData.selectedCarriers.filter(
                                (id) => id !== c.id
                              );
                          setFormData({
                            ...formData,
                            selectedCarriers: updated,
                          });
                        }}
                      />
                      <Label>
                        {c.name} ({c.basePrice} DA)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <span>
                  {formData.isActive
                    ? t("delivery.active")
                    : t("delivery.inactive")}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {editingZone ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alert.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alert.irreversibleAction")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ZonesPage;
