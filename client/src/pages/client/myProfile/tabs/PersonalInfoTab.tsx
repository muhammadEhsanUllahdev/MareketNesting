// import React, { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";

// interface PersonalInfoTabProps {
//   profile: any;
// }

// const PersonalInfoTab = ({ profile }: PersonalInfoTabProps) => {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     username: "",
//     email: "",
//   });
//   useEffect(() => {
//     if (profile) {
//       setFormData({
//         firstName: profile.firstName || "",
//         lastName: profile.lastName || "",
//         username: profile.username || "",
//         email: profile.email || "",
//       });
//     }
//   }, [profile]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//   };

//   const updateProfileMutation = useMutation({
//     mutationFn: async (data: typeof formData) => {
//       const res = await fetch("/api/user/profile", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to update profile");
//       return res.json();
//     },
//     onSuccess: () => {
//       toast({ title: "Profil mis à jour avec succès" });
//       queryClient.invalidateQueries({ queryKey: ["/api/user"] });
//       queryClient.invalidateQueries({ queryKey: ["profile"] });
//     },
//     onError: () =>
//       toast({
//         title: "Erreur",
//         description: "Impossible de mettre à jour le profil",
//         variant: "destructive",
//       }),
//   });

//   const handleSubmit = () => {
//     updateProfileMutation.mutate(formData);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="firstName">Prénom</Label>
//           <Input
//             id="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="lastName">Nom</Label>
//           <Input
//             id="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="space-y-2 md:col-span-2">
//           <Label htmlFor="username">Nom d'utilisateur</Label>
//           <Input
//             id="username"
//             value={formData.username}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="email">Email</Label>
//           <Input id="email" value={formData.email} onChange={handleChange} />
//         </div>
//       </div>

//       <Button onClick={handleSubmit} disabled={updateProfileMutation.isPending}>
//         {updateProfileMutation.isPending
//           ? "Mise à jour..."
//           : "Enregistrer les modifications"}
//       </Button>
//     </div>
//   );
// };

// export default PersonalInfoTab;

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface PersonalInfoTabProps {
  profile: any;
}

const PersonalInfoTab = ({ profile }: PersonalInfoTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("profile.updateSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () =>
      toast({
        title: t("common.error"),
        description: t("profile.updateError"),
        variant: "destructive",
      }),
  });

  const handleSubmit = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("form.firstName")}</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("form.lastName")}</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="username">{t("form.username")}</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" value={formData.email} onChange={handleChange} />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={updateProfileMutation.isPending}>
        {updateProfileMutation.isPending
          ? t("common.updating")
          : t("common.saveChanges")}
      </Button>
    </div>
  );
};

export default PersonalInfoTab;
