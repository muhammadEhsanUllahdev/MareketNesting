import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { ShopDeliveryForm } from "../ShopDeliveryForm";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const ShopShipping = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const [shippingMethods, setShippingMethods] = useState([
    {
      id: 1,
      name: t("shipping.standard"),
      price: "250 DA",
      delay: "3-5 " + t("shipping.days"),
      status: "active",
      type: "carrier",
    },
    {
      id: 2,
      name: t("shipping.express"),
      price: "500 DA",
      delay: "1-2 " + t("shipping.days"),
      status: "active",
      type: "carrier",
    },
    {
      id: 3,
      name: t("shipping.pickup"),
      price: t("shipping.free"),
      delay: t("shipping.immediate"),
      status: "active",
      type: "pickup",
    },
    {
      id: 4,
      name: t("shipping.international"),
      price: "1500 DA",
      delay: "7-12 " + t("shipping.days"),
      status: "inactive",
      type: "carrier",
    },
  ]);

  const handleAddShopDelivery = (deliveryMethod: any) => {
    if (editingMethod) {
      setShippingMethods((methods) =>
        methods.map((method) =>
          method.id === editingMethod.id
            ? { ...deliveryMethod, id: editingMethod.id }
            : method
        )
      );
      toast({
        title: t("shipping.methodUpdated"),
        description: t("shipping.methodUpdatedDesc"),
      });
      setEditingMethod(null);
    } else {
      setShippingMethods([...shippingMethods, deliveryMethod]);
      toast({
        title: t("shipping.methodAdded"),
        description: t("shipping.methodAddedDesc"),
      });
    }
  };

  const handleEditMethod = (method: any) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMethod(null);
  };

  const toggleMethodStatus = (methodId: number) => {
    setShippingMethods((methods) =>
      methods.map((method) =>
        method.id === methodId
          ? {
              ...method,
              status: method.status === "active" ? "inactive" : "active",
            }
          : method
      )
    );

    const method = shippingMethods.find((m) => m.id === methodId);
    toast({
      title: t("shipping.statusChanged"),
      description: `${t("shipping.method")} "${method?.name}" ${
        method?.status === "active"
          ? t("shipping.disabled")
          : t("shipping.enabled")
      }`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("shipping.active")}
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {t("shipping.inactive")}
          </Badge>
        );
      default:
        return <Badge>{t("shipping.unknown")}</Badge>;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "shop_delivery":
        return "🏪";
      case "pickup":
        return "📦";
      default:
        return <Truck size={14} className="text-gray-500" />;
    }
  };

  return (
    <DashboardLayout title={t("shipping.title")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("shipping.manage")}</h1>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <PlusCircle size={16} />
            {t("shipping.newMethod")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("shipping.methods")}</CardTitle>
            <CardDescription>{t("shipping.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("shipping.method")}</TableHead>
                  <TableHead>{t("shipping.price")}</TableHead>
                  <TableHead>{t("shipping.delay")}</TableHead>
                  <TableHead>{t("shipping.status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium flex items-center">
                      <span className="mr-2">{getMethodIcon(method.type)}</span>
                      {method.name}
                      {method.type === "shop_delivery" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {t("shipping.shop")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{method.price}</TableCell>
                    <TableCell>{method.delay}</TableCell>
                    <TableCell>{getStatusBadge(method.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMethod(method)}
                        >
                          <Edit size={14} className="mr-1" />
                          {t("edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMethodStatus(method.id)}
                          className={
                            method.status === "active"
                              ? "text-orange-500 border-orange-200 hover:bg-orange-50"
                              : "text-green-500 border-green-200 hover:bg-green-50"
                          }
                        >
                          {method.status === "active" ? (
                            <>
                              <ToggleLeft size={14} className="mr-1" />
                              {t("disable")}
                            </>
                          ) : (
                            <>
                              <ToggleRight size={14} className="mr-1" />
                              {t("enable")}
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ShopDeliveryForm
          open={isFormOpen}
          onOpenChange={handleCloseForm}
          onSubmit={handleAddShopDelivery}
          editingMethod={editingMethod}
        />
      </div>
    </DashboardLayout>
  );
};

export default ShopShipping;
