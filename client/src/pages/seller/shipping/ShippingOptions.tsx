import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, PlusCircle, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

// If you already have a ShippingOption type import, keep it. Fallback to local interface.
type ShippingOption = {
  id: string;
  carrier_id?: string; // snake
  carrierId?: string; // camel
  region: string;
  length?: number;
  width?: number;
  height?: number;
  max_weight?: number;
  maxWeight?: number;
  base_price?: number;
  basePrice?: number;
  price_per_kg?: number;
  pricePerKg?: number;
  delivery_time?: string;
  deliveryTime?: string;
  is_active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Carrier = {
  id: string;
  name: string;
  basePrice?: number;
  deliveryTime?: string;
};

type StoreDelivery = {
  id: string;
  zone: string;
  price: number;
  deliveryTime: string;
  maxWeight?: number;
  instructions?: string;
  isActive: boolean;
};

export const ShippingOptions: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { t } = useTranslation();
  // --- Fetch carriers ---
  const {
    data: carriers = [],
    isLoading: isLoadingCarriers,
    isError: carriersError,
  } = useQuery<Carrier[]>({
    queryKey: ["carriers"],
    queryFn: async () => {
      const res = await fetch("/api/carriers");
      if (!res.ok) throw new Error(t("error.failedToFetchCarriers"));
      return res.json();
    },
  });

  // --- Fetch shipping options for all carriers (map carrierId => options[]) ---
  const {
    data: optionsByCarrier = {},
    isLoading: isLoadingOptions,
    isError: optionsError,
  } = useQuery<Record<string, ShippingOption[]>>({
    queryKey: ["shippingOptions", "all"],
    enabled: !isLoadingCarriers && carriers.length > 0,
    queryFn: async () => {
      const map: Record<string, ShippingOption[]> = {};
      await Promise.all(
        carriers.map(async (c) => {
          const res = await fetch(`/api/carriers/${c.id}/options`);
          if (!res.ok) throw new Error(t("error.failedToFetchOptions", { id: c.id }));
          const opts: ShippingOption[] = await res.json();
          map[c.id] = opts || [];
        })
      );
      return map;
    },
  });

  const { data: storeDelivery } = useQuery<StoreDelivery | null>({
    queryKey: ["storeDelivery"],
    queryFn: async () => {
      const res = await fetch(`/api/store-delivery/myshopid`); // replace with shopId
      if (!res.ok) return null;
      return res.json();
    },
  });

  // --- Mutations: create / update / delete ---
  const createOption = useMutation({
    mutationFn: async (payload: { carrierId: string; data: any }) => {
      const res = await fetch(`/api/carriers/${payload.carrierId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) throw new Error(t("error.failedToCreateShippingOption"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingOptions"] });
     toast({ title: t("toast.optionAdded"), description: t("toast.optionSaved") });
    },
    onError: () => {
      toast({
    title: t("toast.error"),
    description: t("toast.failedToAddOption"),
    variant: "destructive",
  });
    },
  });

  const updateOption = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await fetch(`/api/shipping-options/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) throw new Error(t("error.failedToUpdate"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingOptions"] });
      toast({ title: t("toast.optionUpdated") });
    },
    onError: () => {
     toast({
  title: t("toast.error"),
  description: t("toast.failedToUpdate"),
  variant: "destructive",
});
    },
  });

  const deleteOption = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shipping-options/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t("error.failedToDelete"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingOptions"] });
      toast({ title: t("toast.optionDeleted") });
    },
    onError: () => {
      toast({
  title: t("toast.error"),
  description: t("toast.failedToDelete"),
  variant: "destructive",
});
    },
  });

  const saveStoreDelivery = useMutation({
    mutationFn: async (payload: Partial<StoreDelivery>) => {
      if (storeDelivery?.id) {
        return await fetch(`/api/store-delivery/${storeDelivery.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        return await fetch(`/api/store-delivery/myshopid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storeDelivery"] });
      toast({ title: t("toast.storeDeliverySaved") });
    },
  });

  // --- Local UI state ---
  const [showFreeShipping, setShowFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] =
    useState<number>(1000);
  const [selectedCarrier, setSelectedCarrier] = useState<string>(""); // carrier id for the form
  const [deliveryType, setDeliveryType] = useState<"carrier" | "shop">(
    "carrier"
  );

  // Modal for add/edit shipping option
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(
    null
  );
  const blankForm = {
    region: "",
    length: "",
    width: "",
    height: "",
    maxWeight: "",
    basePrice: "",
    pricePerKg: "",
    deliveryTime: "",
    isActive: true,
  };
  const [optionForm, setOptionForm] = useState<{ [k: string]: any }>(blankForm);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCarrier && carriers && carriers.length > 0) {
      setSelectedCarrier(carriers[0].id);
    }
  }, [carriers, selectedCarrier]);

  const groupedOptions = useMemo(
    () => optionsByCarrier || {},
    [optionsByCarrier]
  );

  const readNum = (opt: any, keys: string[]) => {
    for (const k of keys) {
      if (opt[k] !== undefined && opt[k] !== null) return Number(opt[k]);
    }
    return undefined;
  };
  const readStr = (opt: any, keys: string[]) => {
    for (const k of keys)
      if (opt[k] !== undefined && opt[k] !== null) return String(opt[k]);
    return "";
  };
  const readBool = (opt: any, keys: string[]) => {
    for (const k of keys)
      if (opt[k] !== undefined && opt[k] !== null) return Boolean(opt[k]);
    return false;
  };

  // --- Modal open/close / prefill ---
  function openCreateModal(carrierId?: string) {
    setEditingOption(null);
    setOptionForm(blankForm);
    if (carrierId) setSelectedCarrier(carrierId);
    setIsModalOpen(true);
  }

  function openEditModal(option: ShippingOption) {
    setEditingOption(option);
    setOptionForm({
      region: readStr(option, ["region"]),
      length: readNum(option, ["length"]),
      width: readNum(option, ["width"]),
      height: readNum(option, ["height"]),
      maxWeight: readNum(option, ["max_weight", "maxWeight"]),
      basePrice: readNum(option, ["base_price", "basePrice"]) ?? 0,
      pricePerKg: readNum(option, ["price_per_kg", "pricePerKg"]) ?? 0,
      deliveryTime: readStr(option, ["delivery_time", "deliveryTime"]) ?? "",
      isActive: readBool(option, ["is_active", "isActive"]),
    });
    // make sure we select the option's carrier
    const cId = option.carrier_id || (option as any).carrierId;
    if (cId) setSelectedCarrier(cId);
    setIsModalOpen(true);
  }

  // --- Submit create / update ---
  async function onSubmitOption(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedCarrier) {
      toast({
        title: t("shipping.settings.errorTitle"),
        description: t("shipping.settings.errorSelectCarrier"),
        variant: "destructive",
      });
      return;
    }

    // basic validation
    if (!optionForm.region) {
      toast({
        title: t("shipping.settings.addedTitle"),
        description: t("shipping.settings.addedDescription", {
          carrier: carriers?.find((c) => c.id === selectedCarrier)?.name,
        }),
      });
      return;
    }

    const payload = {
      region: optionForm.region,
      length: optionForm.length ? Number(optionForm.length) : null,
      width: optionForm.width ? Number(optionForm.width) : null,
      height: optionForm.height ? Number(optionForm.height) : null,
      maxWeight: optionForm.maxWeight ? Number(optionForm.maxWeight) : null,
      basePrice: optionForm.basePrice ? Number(optionForm.basePrice) : 0,
      pricePerKg: optionForm.pricePerKg ? Number(optionForm.pricePerKg) : 0,
      deliveryTime: optionForm.deliveryTime || "",
      isActive: optionForm.isActive ?? true,
    };

    try {
      if (editingOption) {
        // update
        await updateOption.mutateAsync({ id: editingOption.id, data: payload });
      } else {
        // create (POST /api/carriers/:carrierId/options)
        await createOption.mutateAsync({
          carrierId: selectedCarrier,
          data: payload,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      // mutations handle toasts already; this is just a safety
      console.error(err);
    }
  }

  function onDeleteClick(optionId: string) {
    setOptionToDelete(optionId);
    setDeleteDialogOpen(true);
  }
  async function confirmDelete() {
    if (!optionToDelete) return;
    await deleteOption.mutateAsync(optionToDelete);
    setDeleteDialogOpen(false);
    setOptionToDelete(null);
  }

  if (isLoadingCarriers || isLoadingOptions) {
    return (
      <div className="py-10 text-center">{t("shipment.loadingOptions")}</div>
    );
  }
  if (carriersError || optionsError) {
    return (
      <div className="py-10 text-center text-red-600">
  {t("error.failedToLoadData")}
</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            {t("shipment.deliveryOptionsTitle")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("shipment.deliveryOptionsDescription")}
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Button size="sm" onClick={() => openCreateModal()}>
            <PlusCircle size={16} /> Ajouter une option
          </Button>
        </div> */}
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h4 className="font-medium">{t("shipment.freeShippingTitle")}</h4>
            <p className="text-sm text-gray-500">
              {t("shipment.freeShippingDescription")}
            </p>
          </div>
          <Switch
            checked={showFreeShipping}
            onCheckedChange={setShowFreeShipping}
          />
        </div>

        {showFreeShipping && (
          <div className="pt-2 space-y-4">
            <div className="flex items-center">
              <Label htmlFor="threshold" className="mr-4">
                {t("shipment.minimumThreshold")}:
              </Label>
              <input
                id="threshold"
                type="number"
                className="border rounded px-3 py-1.5 w-32"
                value={freeShippingThreshold}
                onChange={(e) =>
                  setFreeShippingThreshold(Number(e.target.value))
                }
              />
              <span className="ml-2">{t("common.currency.da")}</span>
            </div>
          </div>
        )}

        <div className="pt-4">
          <h4 className="font-medium mb-3">
            {t("shipment.deliveryConfiguration")}
          </h4>

          {/* Choose to show carrier config (form on top) or shop delivery (kept as your UI) */}
          <div className="mb-6 p-4 border rounded-lg">
            <h5 className="font-medium mb-3">{t("shipment.deliveryType")}</h5>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryType"
                  value="carrier"
                  checked={deliveryType === "carrier"}
                  onChange={() => setDeliveryType("carrier")}
                  className="mr-2"
                />
                {t("shipment.externalCarrier")}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryType"
                  value="shop"
                  checked={deliveryType === "shop"}
                  onChange={() => setDeliveryType("shop")}
                  className="mr-2"
                />
                {t("shipment.shopDelivery")}
              </label>
            </div>
          </div>

          {deliveryType === "carrier" ? (
            <>
              {/* Carrier selection + small form preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h5 className="font-medium">
                    {t("shipment.carrierAndRegion")}
                  </h5>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("shipment.carrier")}
                      </label>
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={selectedCarrier}
                        onChange={(e) => setSelectedCarrier(e.target.value)}
                      >
                        <option value="">{t("shipment.selectCarrier")}</option>
                        {carriers?.map((carrier) => (
                          <option key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("shipment.regionCity")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("shipment.regionPlaceholder")}
                        className="w-full border rounded-md px-3 py-2"
                        value={optionForm.region || ""}
                        onChange={(e) =>
                          setOptionForm({
                            ...optionForm,
                            region: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h5 className="font-medium">
                    {t("shipment.dimensionsAndWeight")}
                  </h5>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("shipment.lengthCm")}
                        </label>
                        <input
                          type="number"
                          placeholder="30"
                          className="w-full border rounded-md px-3 py-1.5"
                          value={optionForm.length || ""}
                          onChange={(e) =>
                            setOptionForm({
                              ...optionForm,
                              length: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("shipment.widthCm")}
                        </label>
                        <input
                          type="number"
                          placeholder="20"
                          className="w-full border rounded-md px-3 py-1.5"
                          value={optionForm.width || ""}
                          onChange={(e) =>
                            setOptionForm({
                              ...optionForm,
                              width: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("shipment.heightCm")}
                        </label>
                        <input
                          type="number"
                          placeholder="10"
                          className="w-full border rounded-md px-3 py-1.5"
                          value={optionForm.height || ""}
                          onChange={(e) =>
                            setOptionForm({
                              ...optionForm,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("shipment.maxWeightKg")}
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full border rounded-md px-3 py-2"
                        value={optionForm.maxWeight || ""}
                        onChange={(e) =>
                          setOptionForm({
                            ...optionForm,
                            maxWeight: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price config */}
              <div className="p-4 border rounded-lg mb-6">
                <h5 className="font-medium mb-3">
                  {t("shipment.priceConfiguration")}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("shipment.basePrice")} (DA)
                    </label>
                    <input
                      type="number"
                      placeholder="400"
                      className="w-full border rounded-md px-3 py-2"
                      value={optionForm.basePrice || ""}
                      onChange={(e) =>
                        setOptionForm({
                          ...optionForm,
                          basePrice: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("shipment.pricePerKg")} (DA)
                    </label>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full border rounded-md px-3 py-2"
                      value={optionForm.pricePerKg || ""}
                      onChange={(e) =>
                        setOptionForm({
                          ...optionForm,
                          pricePerKg: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("shipment.deliveryTime")}
                    </label>
                    <input
                      type="text"
                      placeholder="24-48h"
                      className="w-full border rounded-md px-3 py-2"
                      value={optionForm.deliveryTime || ""}
                      onChange={(e) =>
                        setOptionForm({
                          ...optionForm,
                          deliveryTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* preview logic if needed */
                    }}
                  >
                    {t("common.preview")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      openCreateModal();
                    }}
                  >
                    {t("shipment.addConfiguration")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 border rounded-lg mb-6">
              <h5 className="font-medium mb-3">
                {t("shipment.shopDeliveryConfiguration")}
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("shipment.deliveryZone")}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dans un rayon de 10km"
                    className="w-full border rounded-md px-3 py-2"
                    defaultValue={storeDelivery?.zone}
                    onChange={(e) =>
                      setOptionForm({ ...optionForm, zone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("shipment.deliveryPrice")} (DA)
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    className="w-full border rounded-md px-3 py-2"
                    defaultValue={storeDelivery?.price}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("shipment.deliveryTime")}
                  </label>
                  <input
                    type="text"
                    placeholder="2-4h"
                    className="w-full border rounded-md px-3 py-2"
                    defaultValue={storeDelivery?.deliveryTime}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        deliveryTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("shipment.maxWeight")} (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full border rounded-md px-3 py-2"
                    defaultValue={storeDelivery?.maxWeight}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        maxWeight: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  {t("shipment.specialInstructions")}
                </label>
                <textarea
                  placeholder={t("placeholder.storeDeliveryInstructions")}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  defaultValue={storeDelivery?.instructions}
                  onChange={(e) =>
                    setOptionForm({
                      ...optionForm,
                      instructions: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  {t("common.preview")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveStoreDelivery.mutate(optionForm)}
                >
                  {t("common.saveConfiguration")}
                </Button>
              </div>
            </div>
          )}

          {/* Transporteurs configurés (dynamic) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">
                {t("shipment.configuredCarriers")}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreateModal()}
              >
                <PlusCircle size={16} />
                {t("shipment.addCarrier")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {carriers.map((carrier) => {
                const opts = groupedOptions[carrier.id] || [];
                // show top 3 summary or message if none
                return (
                  <div key={carrier.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Truck className="h-4 w-4 text-gray-600" />
                        </div>
                        <h5 className="font-medium">{carrier.name}</h5>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateModal(carrier.id)}
                        >
                          {t("button.add")}
                        </Button>
                      </div>
                    </div>

                    {opts.length === 0 ? (
                      <p className="text-sm text-gray-500"> {t("text.noOptionConfigured")} </p>
                    ) : (
                      <div className="space-y-3 text-sm">
                        {opts.map((option) => {
                          const delivery = readStr(option, [
                            "delivery_time",
                            "deliveryTime",
                          ]);
                          const price =
                            readNum(option, ["base_price", "basePrice"]) ?? 0;
                          const isActive = readBool(option, [
                            "is_active",
                            "isActive",
                          ]);
                          const id = option.id;
                          return (
                            <div
                              key={id}
                              className="flex items-center justify-between p-3 bg-muted rounded"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">
                                    {option.region}
                                  </div>
                                  <Badge
                                    className={
                                      isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {isActive ? t("status.active") : t("status.inactive")}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {delivery}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="font-mono">{price} DA</div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(option)}
                                  >
                                   {t("button.edit")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => onDeleteClick(id)}
                                  >
                                    {t("button.delete")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Boutique delivery card (kept) */}
            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <h5 className="font-medium">{t("shipment.shopDelivery")}</h5>
                  <Badge variant="secondary">{t("common.recommended")}</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  {t("common.configure")}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("shipment.zone")}:</span>
                  <span>{t("shipment.around10km")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("shipment.price")}:</span>
                  <span>200 DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("shipment.deliveryTime")}:
                  </span>
                  <span>2-4h</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t("shipment.shopDeliveryDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() =>
            toast({
               title: t("toast.settingsSaved"),
  description: t("toast.settingsUpdated"),
            })
          }
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" /> {t("shipping.saveSettings")}
        </Button>
      </div>

      {/* Create / Edit Option Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
           <DialogTitle>
  {editingOption
    ? t("dialog.editOption")
    : t("dialog.newShippingOption")}
</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitOption();
            }}
          >
            <div className="space-y-4 py-4">
              <div>
                <Label>{t("label.carrier")}</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                  <option value="">{t("select.chooseCarrier")}</option>
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>{t("label.regionZone")}</Label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={optionForm.region}
                  onChange={(e) =>
                    setOptionForm({ ...optionForm, region: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>{t("label.widthCm")}</Label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1"
                    value={optionForm.length || ""}
                    onChange={(e) =>
                      setOptionForm({ ...optionForm, length: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>{t("label.widthCm")}</Label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1"
                    value={optionForm.width || ""}
                    onChange={(e) =>
                      setOptionForm({ ...optionForm, width: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>{t("label.heightCm")}</Label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1"
                    value={optionForm.height || ""}
                    onChange={(e) =>
                      setOptionForm({ ...optionForm, height: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>{t("label.maxWeightKg")}</Label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={optionForm.maxWeight || ""}
                  onChange={(e) =>
                    setOptionForm({ ...optionForm, maxWeight: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t("label.basePriceDA")}</Label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={optionForm.basePrice || ""}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        basePrice: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>{t("label.pricePerKgDA")}</Label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={optionForm.pricePerKg || ""}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        pricePerKg: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>{t("label.deliveryTime")}</Label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={optionForm.deliveryTime || ""}
                    onChange={(e) =>
                      setOptionForm({
                        ...optionForm,
                        deliveryTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={!!optionForm.isActive}
                  onCheckedChange={(v) =>
                    setOptionForm({ ...optionForm, isActive: v })
                  }
                />
                <span>{optionForm.isActive ? t("status.active") : t("status.inactive")}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                {t("button.cancel")}
              </Button>
              <Button type="submit">
                {editingOption ? t("button.update") : t("button.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alert.confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("button.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              {t("button.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShippingOptions;
