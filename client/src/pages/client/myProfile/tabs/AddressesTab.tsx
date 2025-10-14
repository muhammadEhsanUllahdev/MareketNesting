// // import React, { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { PlusCircle } from "lucide-react";
// // import { Address } from "../Profile";
// // import AddressesList from "../AddressesList";
// // import { AddressForm } from "../address/AddressForm";

// // interface AddressesTabProps {
// //   addresses: Address[];
// //   onAddAddress: (address: Omit<Address, "id">) => void;
// //   onUpdateAddress: (id: string, address: Address) => void;
// //   onDeleteAddress: (id: string) => void;
// //   onSetDefault: (id: string) => void;
// //   onSetDelivery: (id: string) => void;
// // }

// // const AddressesTab = ({
// //   addresses,
// //   onAddAddress,
// //   onUpdateAddress,
// //   onDeleteAddress,
// //   onSetDefault,
// //   onSetDelivery,
// // }: AddressesTabProps) => {
// //   const [isAddingAddress, setIsAddingAddress] = useState(false);

// //   return (
// //     <div className="space-y-6">
// //       {isAddingAddress ? (
// //         <div className="border rounded-lg p-4">
// //           <h3 className="text-lg font-medium mb-4">
// //             Ajouter une nouvelle adresse
// //           </h3>
// //           <AddressForm
// //             onSubmit={(address) => {
// //               onAddAddress(address);
// //               setIsAddingAddress(false);
// //             }}
// //             onCancel={() => setIsAddingAddress(false)}
// //           />
// //         </div>
// //       ) : (
// //         <Button
// //           variant="outline"
// //           className="w-full flex items-center justify-center gap-2"
// //           onClick={() => setIsAddingAddress(true)}
// //         >
// //           <PlusCircle className="h-4 w-4" />
// //           Ajouter une nouvelle adresse
// //         </Button>
// //       )}

// //       <AddressesList
// //         addresses={addresses}
// //         onAddAddress={onAddAddress}
// //         onUpdateAddress={onUpdateAddress}
// //         onDeleteAddress={onDeleteAddress}
// //         onSetDefault={onSetDefault}
// //         onSetDelivery={onSetDelivery}
// //       />
// //     </div>
// //   );
// // };

// // export default AddressesTab;
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { PlusCircle } from "lucide-react";
// import AddressesList from "../AddressesList";
// import { AddressForm } from "../address/AddressForm";
// import { useAddressManagement } from "../hooks/useAddressManagement";
// import { useToast } from "@/hooks/use-toast";

// const AddressesTab = () => {
//   const [isAddingAddress, setIsAddingAddress] = useState(false);
//   const { toast } = useToast();

//   const { addresses, isLoading, addAddress, updateAddress, deleteAddress } =
//     useAddressManagement();

//   if (isLoading) return <p>Chargement des adresses...</p>;

//   return (
//     <div className="space-y-6">
//       {/* {isAddingAddress ? (
//         <div className="border rounded-lg p-4">
//           <h3 className="text-lg font-medium mb-4">
//             Ajouter une nouvelle adresse
//           </h3>
//           <AddressForm
//             onSubmit={(address) => {
//               addAddress.mutate(address, {
//                 onSuccess: () => {
//                   toast({ title: "Adresse ajoutée avec succès" });
//                   setIsAddingAddress(false);
//                 },
//                 onError: () =>
//                   toast({
//                     title: "Erreur",
//                     description: "Échec de l’ajout de l’adresse",
//                     variant: "destructive",
//                   }),
//               });
//             }}
//             onCancel={() => setIsAddingAddress(false)}
//           />
//         </div>
//       ) : (
//         <Button
//           variant="outline"
//           className="w-full flex items-center justify-center gap-2"
//           onClick={() => setIsAddingAddress(true)}
//         >
//           <PlusCircle className="h-4 w-4" />
//           Ajouter une nouvelle adresse
//         </Button>
//       )} */}

//       <AddressesList
//         addresses={addresses}
//         onUpdateAddress={(id, address) =>
//           updateAddress.mutate(
//             { id, ...address },
//             {
//               onSuccess: () => toast({ title: "Adresse mise à jour" }),
//               onError: () =>
//                 toast({
//                   title: "Erreur",
//                   description: "Impossible de mettre à jour l’adresse",
//                   variant: "destructive",
//                 }),
//             }
//           )
//         }
//         // onDeleteAddress={(id) =>
//         //   deleteAddress.mutate(id, {
//         //     onSuccess: () => toast({ title: "Adresse supprimée" }),
//         //     onError: () =>
//         //       toast({
//         //         title: "Erreur",
//         //         description: "Échec de la suppression de l’adresse",
//         //         variant: "destructive",
//         //       }),
//         //   })
//         // }
//         onSetDefault={(id) => {
//           // Optional future feature — mark default
//           toast({ title: "Définir par défaut (à implémenter)" });
//         }}
//         onSetDelivery={(id) => {
//           // Optional — choose delivery address
//           toast({ title: "Adresse de livraison sélectionnée" });
//         }}
//       />
//     </div>
//   );
// };

// export default AddressesTab;
