// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";

// export function useZones() {
//   const qc = useQueryClient();
//   const { toast } = useToast();

//   const { data: zones = [], isLoading: isLoadingZones } = useQuery({
//     queryKey: ["zones"],
//     queryFn: async () => {
//       const res = await fetch("/api/zones");
//       if (!res.ok) throw new Error("Failed to fetch zones");
//       return res.json();
//     },
//   });

//   const createZone = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await fetch("/api/zones", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Create failed");
//       return res.json();
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["zones"] });
//       toast({ title: "Zone créée", description: "La zone a été ajoutée." });
//     },
//     onError: () =>
//       toast({ title: "Erreur", description: "Impossible de créer la zone." }),
//   });

//   const updateZone = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await fetch(`/api/zones/${payload.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Update failed");
//       return res.json();
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["zones"] });
//       toast({ title: "Zone mise à jour" });
//     },
//     onError: () =>
//       toast({
//         title: "Erreur",
//         description: "Impossible de mettre à jour la zone.",
//       }),
//   });

//   const deleteZone = useMutation({
//     mutationFn: async (id: string) => {
//       const res = await fetch(`/api/zones/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       return res.json();
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["zones"] });
//       toast({ title: "Zone supprimée" });
//     },
//     onError: () =>
//       toast({
//         title: "Erreur",
//         description: "Impossible de supprimer la zone.",
//       }),
//   });

//   return {
//     zones,
//     isLoadingZones,
//     createZone,
//     updateZone,
//     deleteZone,
//   };
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function useZones() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: zones = [], isLoading: isLoadingZones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error(t("zone.error.fetchFailed"));
      return res.json();
    },
  });

  const createZone = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("zone.error.createFailed"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zones"] });
      toast({
        title: t("zone.toast.success"),
        description: t("zone.toast.createSuccess"),
      });
    },
    onError: () =>
      toast({
        title: t("zone.toast.error"),
        description: t("zone.toast.createError"),
      }),
  });

  const updateZone = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/zones/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("zone.error.updateFailed"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zones"] });
      toast({
        title: t("zone.toast.success"),
        description: t("zone.toast.updateSuccess"),
      });
    },
    onError: () =>
      toast({
        title: t("zone.toast.error"),
        description: t("zone.toast.updateError"),
      }),
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/zones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("zone.error.deleteFailed"));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zones"] });
      toast({
        title: t("zone.toast.success"),
        description: t("zone.toast.deleteSuccess"),
      });
    },
    onError: () =>
      toast({
        title: t("zone.toast.error"),
        description: t("zone.toast.deleteError"),
      }),
  });

  return {
    zones,
    isLoadingZones,
    createZone,
    updateZone,
    deleteZone,
  };
}
