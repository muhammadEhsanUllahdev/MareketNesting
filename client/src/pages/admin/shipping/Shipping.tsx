// Shipping.tsx
import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Truck,
  Package,
  MapPin,
  Settings,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Phone,
  Globe,
  Edit,
  Trash2,
} from "lucide-react";

import { useCarriers } from "@/pages/seller/shipping/hooks/carriers";
import { useShipments } from "@/pages/seller/shipping/hooks/useShipments";
import CarrierForm from "@/pages/seller/shipping/CarrierForm";

import { useZones } from "@/pages/seller/shipping/hooks/useZones";
import ZonesPage from "@/pages/seller/shipping/pages/ZonesPage";
import ShippingOptions from "@/pages/seller/shipping/ShippingOptions";
import { useTranslation } from "react-i18next";

const ShippingManagement = () => {
  // existing hooks
  const {
    carriers,
    isLoadingCarriers,
    addCarrier,
    updateCarrier,
    deleteCarrier,
  } = useCarriers();

  const { shipments, isLoading: shipmentsLoading } = useShipments();

  // new: zones (per shop). Replace shopId with your actual shop context (here assumed "currentShopId")
  const currentShopId =
    (typeof window !== "undefined" && (window as any).__CURRENT_SHOP_ID) ||
    "default-shop-id";
  const [optionsByCarrier, setOptionsByCarrier] = useState<Record<string, any>>(
    {}
  );

  const [isAddCarrierOpen, setIsAddCarrierOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);

  // Controlled inputs for general config section (preserve UI but wire values)
  const [generalDeliveryTime, setGeneralDeliveryTime] = useState<string>("");
  const [generalMaxWeight, setGeneralMaxWeight] = useState<number | "">("");
  const [generalMinShippingFee, setGeneralMinShippingFee] = useState<
    number | ""
  >("");

  // load shipping options for carriers when carriers list is available
  useEffect(() => {
    if (
      !carriers ||
      carriers.length === 0 ||
      Object.keys(optionsByCarrier).length > 0
    )
      return;
    let cancelled = false;

    // For each carrier, fetch its options
    const fetchAll = async () => {
      const acc: Record<string, any> = {};
      await Promise.all(
        carriers.map(async (c: any) => {
          try {
            const res = await fetch(`/api/carriers/${c.id}/options`);
            if (!res.ok) return;
            const data = await res.json();

            acc[c.id] =
              Array.isArray(data) && data.length > 0
                ? data[0]
                : {
                    id: null,
                    carrierId: c.id,
                    basePrice: c.basePrice ?? 0,
                    pricePerKg: 0,
                    maxWeight: c.maxWeight ?? null,
                    length: null,
                    width: null,
                    height: null,
                    deliveryTime: "",
                    isActive: true,
                    region: "default",
                  };
          } catch (err) {
            // ignore and continue
            acc[c.id] = {
              id: null,
              carrierId: c.id,
              basePrice: c.basePrice ?? 0,
              pricePerKg: 0,
              maxWeight: c.maxWeight ?? null,
              length: null,
              width: null,
              height: null,
              deliveryTime: "",
              isActive: true,
              region: "default",
            };
          }
        })
      );
      if (!cancelled) setOptionsByCarrier(acc);
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [carriers]);
  const { t } = useTranslation();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("status.active")}
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("status.inactive")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("status.unknown")}</Badge>;
    }
  };

  /* Carrier CRUD handlers (already wired to useCarriers) */
  const handleAddCarrier = (carrierData: any) => {
    addCarrier.mutate(carrierData);
    setIsAddCarrierOpen(false);
  };
  const handleEditCarrier = (carrier: any) => {
    setEditingCarrier(carrier);
    setIsAddCarrierOpen(true);
  };
  const handleUpdateCarrier = (carrierData: any) => {
    if (editingCarrier) {
      updateCarrier.mutate({
        ...carrierData,
        id: editingCarrier.id,
      });
    } else {
      addCarrier.mutate(carrierData);
    }
    setIsAddCarrierOpen(false);
    setEditingCarrier(null);
  };
  const handleDeleteCarrier = (carrierId: string) => {
    if (window.confirm(t("carrier.confirmDelete"))) {
      deleteCarrier.mutate(carrierId);
    }
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    setIsAddZoneOpen(true);
  };

  const handleCloseZoneForm = () => {
    setIsAddZoneOpen(false);
    setEditingZone(null);
  };

  /* Settings: per-carrier config save */
  const handleSaveSettings = async () => {
    // For each carrier present in optionsByCarrier, either POST or PUT shipping option
    try {
      for (const carrierId of Object.keys(optionsByCarrier)) {
        const opt = optionsByCarrier[carrierId];
        // Normalize numeric fields
        const payload: any = {
          region: opt.region ?? "default",
          basePrice: opt.basePrice ? Number(opt.basePrice) : 0,
          pricePerKg: opt.pricePerKg ? Number(opt.pricePerKg) : 0,
          maxWeight: opt.maxWeight ? Number(opt.maxWeight) : null,
          length: opt.length ? Number(opt.length) : null,
          width: opt.width ? Number(opt.width) : null,
          height: opt.height ? Number(opt.height) : null,
          deliveryTime: opt.deliveryTime ?? "",
          isActive: opt.isActive ?? true,
        };

        if (opt.id) {
          // Update existing
          await fetch(`/api/shipping-options/${opt.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => {
            if (!r.ok) throw new Error(t("shipping.failedUpdateOption"));
            return r.json();
          });
        } else {
          // Create new
          await fetch(`/api/carriers/${carrierId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => {
            if (!r.ok) throw new Error(t("shipping.failedCreateOption"));
            return r.json();
          });
        }
      }

      // Optionally, show toast if you have one. For now console:
      console.log("Paramètres des transporteurs sauvegardés");
    } catch (err) {
      console.error("Erreur sauvegarde paramètres transporteurs", err);
    }
  };

  /* UI helpers */
  const filteredCarriers =
    carriers?.filter(
      (carrier: any) =>
        carrier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrier.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Controlled handlers for per-carrier inputs in settings
  const handleOptionChange = (carrierId: string, field: string, value: any) => {
    setOptionsByCarrier((prev) => ({
      ...prev,
      [carrierId]: {
        ...prev[carrierId],
        [field]: value,
      },
    }));
  };

  return (
    <DashboardLayout title={t("shipping.managementTitle")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {t("shipping.managementTitle")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("shipping.managementDescription")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                {t("shipping.carriers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {isLoadingCarriers ? "..." : carriers?.length || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("shipping.activePartners")}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                {t("shipping.shipments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {shipmentsLoading ? "..." : shipments?.length || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("shipping.inProgress")}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                {t("shipping.zones")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {/* <p className="text-2xl font-bold">
          {isLoadingZones ? "..." : zonesList.length}
        </p> */}
                  <p className="text-muted-foreground text-sm">
                    {t("shipping.coveredWilayas")}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                {t("shipping.performance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-muted-foreground text-sm">
                    {t("shipping.deliveryRate")}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="carriers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="carriers">
              {t("shipping.tabCarriers")}
            </TabsTrigger>
            <TabsTrigger value="zones">{t("shipping.tabZones")}</TabsTrigger>
            <TabsTrigger value="settings">
              {t("shipping.tabSettings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carriers" className="space-y-6">
            {/* Carriers list (unchanged) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("carrier.listTitle")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("carrier.managePartners")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("carrier.searchPlaceholder")}
                      className="pl-8 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={() => setIsAddCarrierOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("carrier.add")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCarriers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">
                      {t("carrier.loading")}
                    </p>
                  </div>
                ) : filteredCarriers.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? t("carrier.noneFound")
                        : t("carrier.noneAvailable")}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("carrier.name")}</TableHead>
                          <TableHead>{t("carrier.contact")}</TableHead>
                          <TableHead>{t("carrier.website")}</TableHead>
                          <TableHead>{t("carrier.serviceZones")}</TableHead>
                          <TableHead>{t("carrier.basePrice")}</TableHead>
                          <TableHead>{t("carrier.status")}</TableHead>
                          <TableHead className="text-right">
                            {t("carrier.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCarriers.map((carrier: any) => (
                          <TableRow key={carrier.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">
                                    {carrier.name}
                                  </div>
                                  {carrier.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {carrier.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {carrier.supportPhone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {carrier.supportPhone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {carrier.website && (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <a
                                    href={carrier.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    {carrier.website.replace("https://", "")}
                                  </a>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {carrier.deliversNationwide
                                    ? t("carrier.national")
                                    : t("carrier.regional")}
                                </div>
                                {carrier.service_areas &&
                                  carrier.service_areas.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {carrier.service_areas
                                        .slice(0, 3)
                                        .join(", ")}
                                      {carrier.service_areas.length > 3 &&
                                        ` +${carrier.service_areas.length - 3}`}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {carrier.basePrice
                                ? `${carrier.basePrice} DA`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                carrier.isActive ? "active" : "inactive"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCarrier(carrier)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteCarrier(carrier.id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zones" className="space-y-6">
            <ZonesPage />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ShippingOptions />
          </TabsContent>
        </Tabs>

        <CarrierForm
          open={isAddCarrierOpen}
          onOpenChange={setIsAddCarrierOpen}
          carrier={editingCarrier}
          onSubmit={handleUpdateCarrier}
          onCancel={() => {
            setIsAddCarrierOpen(false);
            setEditingCarrier(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
};
export default ShippingManagement;
