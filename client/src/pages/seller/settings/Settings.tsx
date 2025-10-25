import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, CreditCard, Bell, Shield, Store } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const SellerSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    storeDescription: "",
  });
  const queryClient = useQueryClient();

  const { data: sellerProfile } = useQuery({
    queryKey: ["sellerProfile"],
    queryFn: async () => {
      const res = await fetch("/api/seller/profile", {
        credentials: "include",
      });
      return res.json();
    },
  });
  useEffect(() => {
    if (sellerProfile) {
      setFormData({
        storeName: sellerProfile.storeName || "",
        email: sellerProfile.email || "",
        storeDescription: sellerProfile.storeDescription || "",
      });
    }
  }, [sellerProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("sellerSettings.passwordUpdateFailed"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("sellerSettings.passwordUpdateSuccess") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) =>
      toast({
        title: t("sellerSettings.passwordUpdateError"),
        description: error.message,
        variant: "destructive",
      }),
  });

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: t("common.missingFields"),
        description: t("sellerSettings.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("sellerSettings.passwordsDoNotMatch"),
        description: t("sellerSettings.confirmPasswordMismatch"),
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const updateSellerProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("common.error"));
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("sellerSettings.profileUpdateSuccess") });
      queryClient.invalidateQueries({ queryKey: ["sellerProfile"] });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("sellerSettings.profileUpdateFailed"),
        variant: "destructive",
      }),
  });

  return (
    <DashboardLayout title={t("sellerSettings.pageTitle")}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("sellerSettings.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("sellerSettings.pageDescription")}</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {t("sellerSettings.tabs.general")}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("sellerSettings.tabs.payments")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t("sellerSettings.tabs.notifications")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("sellerSettings.tabs.security")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t("sellerSettings.generalInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">{t("sellerSettings.storeName")}</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("sellerSettings.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">{t("sellerSettings.storeDescription")}</Label>
                  <Textarea
                    id="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                  />
                </div>
                <Button onClick={() => updateSellerProfileMutation.mutate(formData)}>
                  {updateSellerProfileMutation.isPending
                    ? t("common.updating")
                    : t("common.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>{t("sellerSettings.paymentsConfig")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("sellerSettings.cashOnDelivery")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("sellerSettings.cashOnDeliveryDescription")}
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("sellerSettings.cardPayments")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("sellerSettings.cardPaymentsDescription")}
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-delay">{t("sellerSettings.paymentDelay")}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t("sellerSettings.selectDelay")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t("common.day")}</SelectItem>
                        <SelectItem value="3">3 {t("common.days")}</SelectItem>
                        <SelectItem value="7">7 {t("common.days")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>{t("common.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("sellerSettings.notifications")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("sellerSettings.newOrders")}</Label>
                      <p className="text-sm text-muted-foreground">{t("sellerSettings.newOrdersDescription")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("sellerSettings.customerMessages")}</Label>
                      <p className="text-sm text-muted-foreground">{t("sellerSettings.customerMessagesDescription")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("sellerSettings.stockAlerts")}</Label>
                      <p className="text-sm text-muted-foreground">{t("sellerSettings.stockAlertsDescription")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <Button>{t("common.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t("sellerSettings.securitySettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t("sellerSettings.currentPassword")}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("sellerSettings.newPassword")}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("sellerSettings.confirmPassword")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending
                    ? t("common.updating")
                    : t("common.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SellerSettings;
