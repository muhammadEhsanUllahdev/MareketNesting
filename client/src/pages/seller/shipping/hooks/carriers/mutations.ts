// import { useMutation } from "@tanstack/react-query";
// // import { toast } from "sonner";
// import { useToast } from "@/hooks/use-toast";
// import { Carrier } from "./types";

// // Add Carrier
// export const useAddCarrier = (
//   setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
// ) => {
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (newCarrier: Carrier) => {
//       // Just add locally with a generated ID
//       const mockCarrier = { ...newCarrier, id: Date.now().toString() };
//       setCarriers((prev) => [...prev, mockCarrier]);
//       return mockCarrier;
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Transporteur ajouté avec succès",
//       });
//     },
//     onError: (error) => {
//       console.error("Error adding carrier:", error);
//       toast({
//         title: "Error",
//         description: "Erreur lors de l'ajout du transporteur",
//       });
//     },
//   });
// };

// // Update Carrier
// export const useUpdateCarrier = (
//   setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
// ) => {
//   const { toast } = useToast();
//   return useMutation({
//     mutationFn: async (updatedCarrier: Carrier) => {
//       setCarriers((prev) =>
//         prev.map((carrier) =>
//           carrier.id === updatedCarrier.id ? updatedCarrier : carrier
//         )
//       );
//       return updatedCarrier;
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Transporteur mis à jour avec succès",
//       });
//     },
//     onError: (error) => {
//       console.error("Error updating carrier:", error);
//       toast({
//         title: "Error",
//         description: "Erreur lors de la mise à jour du transporteur",
//       });
//     },
//   });
// };

// // Delete Carrier
// export const useDeleteCarrier = (
//   setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
// ) => {
//   const { toast } = useToast();
//   return useMutation({
//     mutationFn: async (carrierId: string) => {
//       setCarriers((prev) => prev.filter((carrier) => carrier.id !== carrierId));
//       return carrierId;
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Transporteur supprimé avec succès",
//       });
//     },
//     onError: (error) => {
//       console.error("Error deleting carrier:", error);
//       toast({
//         title: "Error",
//         description: "Erreur lors de la suppression du transporteur",
//       });
//     },
//   });
// };

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Carrier } from "./types";
import { useTranslation } from "react-i18next";

// Add Carrier
export const useAddCarrier = (
  setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (newCarrier: Carrier) => {
      const mockCarrier = { ...newCarrier, id: Date.now().toString() };
      setCarriers((prev) => [...prev, mockCarrier]);
      return mockCarrier;
    },
    onSuccess: () => {
      toast({
        title: t("carrier.toast.successTitle"),
        description: t("carrier.toast.addSuccess"),
      });
    },
    onError: (error) => {
      console.error("Error adding carrier:", error);
      toast({
        title: t("carrier.toast.errorTitle"),
        description: t("carrier.toast.addError"),
      });
    },
  });
};

// Update Carrier
export const useUpdateCarrier = (
  setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (updatedCarrier: Carrier) => {
      setCarriers((prev) =>
        prev.map((carrier) =>
          carrier.id === updatedCarrier.id ? updatedCarrier : carrier
        )
      );
      return updatedCarrier;
    },
    onSuccess: () => {
      toast({
        title: t("carrier.toast.successTitle"),
        description: t("carrier.toast.updateSuccess"),
      });
    },
    onError: (error) => {
      console.error("Error updating carrier:", error);
      toast({
        title: t("carrier.toast.errorTitle"),
        description: t("carrier.toast.updateError"),
      });
    },
  });
};

// Delete Carrier
export const useDeleteCarrier = (
  setCarriers: React.Dispatch<React.SetStateAction<Carrier[]>>
) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (carrierId: string) => {
      setCarriers((prev) => prev.filter((carrier) => carrier.id !== carrierId));
      return carrierId;
    },
    onSuccess: () => {
      toast({
        title: t("carrier.toast.successTitle"),
        description: t("carrier.toast.deleteSuccess"),
      });
    },
    onError: (error) => {
      console.error("Error deleting carrier:", error);
      toast({
        title: t("carrier.toast.errorTitle"),
        description: t("carrier.toast.deleteError"),
      });
    },
  });
};
