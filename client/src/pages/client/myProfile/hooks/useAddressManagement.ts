// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Address } from "../Profile";
// export const useAddressManagement = (initialAddresses: Address[] = []) => {
//   const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

//   const handleAddAddress = (newAddress: Omit<Address, "id">) => {
//     const addressWithId: Address = {
//       ...newAddress,
//       id: uuidv4(),
//     };
//     setAddresses([...addresses, addressWithId]);
//   };

//   const handleUpdateAddress = (id: string, updatedAddress: Address) => {
//     setAddresses(
//       addresses.map((address) => (address.id === id ? updatedAddress : address))
//     );
//   };

//   const handleDeleteAddress = (id: string) => {
//     setAddresses(addresses.filter((address) => address.id !== id));
//   };

//   const handleSetDefault = (id: string) => {
//     setAddresses(
//       addresses.map((address) => ({
//         ...address,
//         is_default: address.id === id,
//       }))
//     );
//   };

//   const handleSetDelivery = (id: string) => {
//     setAddresses(
//       addresses.map((address) => ({
//         ...address,
//         is_delivery: address.id === id,
//       }))
//     );
//   };

//   return {
//     addresses,
//     handleAddAddress,
//     handleUpdateAddress,
//     handleDeleteAddress,
//     handleSetDefault,
//     handleSetDelivery,
//   };
// };
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddressManagement() {
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await fetch("/api/user/addresses", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      return res.json();
    },
  });

  const addAddress = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  return { addresses, isLoading, addAddress, updateAddress, deleteAddress };
}
