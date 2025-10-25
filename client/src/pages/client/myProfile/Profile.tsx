import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProfileHeader from "./ProfileHeader";
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import PaymentTab from "./tabs/PaymentTab";
import SecurityTab from "./tabs/SecurityTab";

import { useAddressManagement } from "./hooks/useAddressManagement";
import { useQuery } from "@tanstack/react-query";
import AddressesList from "./AddressesList";
import { usePaymentManagement } from "./hooks/usePaymentManagement";
import { useTranslation } from "react-i18next";

export interface Address {
  id?: string;
  type: "personal" | "billing" | "delivery1" | "delivery2";
  street: string;
  city: string;
  postal_code: string;
  state?: string;
  country: string;
  is_default: boolean;
  is_delivery: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  addresses?: Address[];
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
}

const ClientProfile = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });
      return res.json();
    },
  });
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })
    : "N/A";
  const { addresses } = useAddressManagement();
  const { payments } = usePaymentManagement();
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t("profile.pageTitle")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("profile.pageTitle")}</h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <ProfileHeader
              userName={profile?.username || t("profile.defaultUserName")}
              memberSince={memberSince}
              addressCount={addresses.length}
              paymentCount={payments.length || 0}
              addresses={addresses}
              avatarUrl={profile?.avatar}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.personalInfoTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal">
                  <TabsList className="mb-4">
                    <TabsTrigger value="personal">
                      {t("profile.tabs.personal")}
                    </TabsTrigger>
                    <TabsTrigger value="addresses">
                      {t("profile.tabs.addresses")}
                    </TabsTrigger>
                    <TabsTrigger value="payment">
                      {t("profile.tabs.payment")}
                    </TabsTrigger>
                    <TabsTrigger value="security">
                      {t("profile.tabs.security")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal">
                    <PersonalInfoTab profile={profile} />
                  </TabsContent>

                  <TabsContent value="addresses">
                    <AddressesList />
                  </TabsContent>

                  <TabsContent value="payment">
                    <PaymentTab />
                  </TabsContent>

                  <TabsContent value="security">
                    <SecurityTab />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
