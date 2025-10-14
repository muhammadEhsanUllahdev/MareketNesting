import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useShippingRates } from "../hooks/useShippingRates";
import { useCarriers } from "../hooks/useCarriers";
import { ShippingRateForm } from "../ShippingRateForm";
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
import { t } from "i18next";

const ShippingRates = () => {
  const {
    rates,
    isLoadingRates,
    createRate,
    updateRate,
    deleteRate,
    config,
    isLoadingConfig,
    updateConfig,
  } = useShippingRates();

  const { carriers } = useCarriers();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<any>(null);

  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rateToDelete, setRateToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setFreeShippingThreshold(config[0].freeShippingThreshold || 0);
      setMaxWeight(config[0].maxWeight || 0);
    }
  }, [config]);

  const handleDelete = (id: string) => {
    setRateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (rateToDelete) {
      deleteRate.mutate(rateToDelete);
    }
    setDeleteDialogOpen(false);
    setRateToDelete(null);
  };

  if (isLoadingRates || isLoadingConfig) {
    return <div className="p-6">{t("common.loading")}</div>;
  }

  return (
    <DashboardLayout title={t("shippingRates.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("shippingRates.heading")}</h1>
            <p className="text-muted-foreground">
              {t("shippingRates.subheading")}
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedRate(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("shippingRates.newRate")}
          </Button>
        </div>

        {/* Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("shippingRates.rateGrid")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">{t("shippingRates.zone")}</th>
                    <th className="p-2 text-left">{t("shippingRates.weight")}</th>
                    <th className="p-2 text-left">{t("shippingRates.price")}</th>
                    <th className="p-2 text-left">{t("shippingRates.carrier")}</th>
                    <th className="p-2 text-right"> {t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-t">
                      <td className="p-2">{rate.zone}</td>
                      <td className="p-2">
                        {rate.weightMin} - {rate.weightMax} kg
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="font-mono">
                          {rate.price.toLocaleString()} DA
                        </Badge>
                      </td>
                      <td className="p-2">
                        {carriers.find((c) => c.id === rate.carrierId)?.name ||
                          "—"}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRate(rate);
                              setFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(rate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* General Config */}
        <Card>
          <CardHeader>
            <CardTitle>{t("shippingRates.generalConfig.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold">
                  {t("shippingRates.generalConfig.freeShippingThreshold")}
                </Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                
                  placeholder={t(
                    "shippingRates.generalConfig.freeShippingPlaceholder"
                  )}
                  value={freeShippingThreshold}
                  onChange={(e) =>
                    setFreeShippingThreshold(Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeight">
                  {t("shippingRates.generalConfig.maxWeight")}
                </Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={maxWeight}
                  placeholder={t("shippingRates.generalConfig.maxWeightPlaceholder")}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                />
              </div>
            </div>
            <Button

              onClick={() =>
                updateConfig.mutate({
                  freeShippingThreshold,
                  maxWeight,
                })
              }
            >
              {t("common.saveSettings")}
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("alert.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("alert.irreversibleDeleteRate")}
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

        {/* Modal Form for Add/Edit Rate */}
        <ShippingRateForm
          open={formOpen}
          onOpenChange={setFormOpen}
          rate={selectedRate}
          carriers={carriers}
          onSubmit={(values) => {
            if (selectedRate) {
              updateRate.mutate({ ...values, id: selectedRate.id });
            } else {
              createRate.mutate(values);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ShippingRates;
