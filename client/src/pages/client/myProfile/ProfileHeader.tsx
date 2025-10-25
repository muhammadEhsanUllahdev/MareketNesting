import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, CreditCard, MapPin } from "lucide-react";
import { Address } from "./Profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  avatarUrl?: string;
  userName: string;
  memberSince: string;
  addressCount: number;
  paymentCount: number;
  addresses: Address[];
}

const ProfileHeader = ({
  avatarUrl,
  userName,
  memberSince,
  addressCount,
  paymentCount,
  addresses,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/profile/avatar", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("profile.avatarUploadError"));
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("profile.avatarUpdatedTitle"),
        description: t("profile.avatarUpdatedDescription"),
      });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("profile.avatarUpdateFailed"),
        variant: "destructive",
      });
    },
  });
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={t("profile.avatarAlt")}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-primary-600" />
            )}
          </div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-muted-foreground">
            {t("profile.memberSince", { date: memberSince })}
          </p>

          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadAvatarMutation.mutate(file);
              }
            }}
          />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("avatar-upload")?.click()}
            disabled={uploadAvatarMutation.isPending}
          >
            {uploadAvatarMutation.isPending
              ? t("profile.uploading")
              : t("profile.changeAvatar")}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">{t("profile.verifiedAccount")}</p>
              <p className="text-muted-foreground">
                {t("profile.emailPhoneConfirmed")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">
                {t("profile.paymentMethods", { count: paymentCount })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium">
                {t("profile.savedAddresses", { count: addressCount })}
              </p>
              <p className="text-muted-foreground">
                {addresses.filter((a) => a.type === "personal").length > 0 &&
                  `${t("profile.addressType.personal")}, `}
                {addresses.filter(
                  (a) => a.type === "delivery1" || a.type === "delivery2"
                ).length > 0 && `${t("profile.addressType.delivery")}, `}
                {addresses.filter((a) => a.type === "billing").length > 0 &&
                  t("profile.addressType.billing")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
