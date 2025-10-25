import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import AddressItem from "./address/AddressItem";
import EditAddressForm from "./address/EditAddressForm";
import AddAddressForm from "./address/AddAddressForm";
import { useAddressManagement } from "./hooks/useAddressManagement";
import { useToast } from "@/hooks/use-toast";
import { Address } from "./Profile";
import { useTranslation } from "react-i18next";

export default function AddressesList() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addresses, isLoading, addAddress, updateAddress, deleteAddress } =
    useAddressManagement();

  const [isAdding, setIsAdding] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    type: "personal",
    street: "",
    city: "",
    postal_code: "",
    country: "Algérie",
    state: "",
    is_default: false,
    is_delivery: false,
  });

  if (isLoading)
    return (
      <p className="text-center text-muted-foreground">
        {t("common.loading")}
      </p>
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAdd = () => {
    addAddress.mutate(newAddress, {
      onSuccess: () => {
        toast({ title: t("address.addSuccess") });
        setNewAddress({
          type: "personal",
          street: "",
          city: "",
          postal_code: "",
          country: "Algérie",
          state: "",
          is_default: false,
          is_delivery: false,
        });
        setIsAdding(false);
      },
      onError: () =>
        toast({
          title: t("common.error"),
          description: t("address.addFailed"),
          variant: "destructive",
        }),
    });
  };

  const handleUpdate = (id: string, data: any) => {
    updateAddress.mutate(
      { id, ...data },
      {
        onSuccess: () => {
          toast({ title: t("address.updateSuccess") });
          setEditingAddressId(null);
        },
        onError: () =>
          toast({
            title: t("common.error"),
            description: t("address.updateFailed"),
            variant: "destructive",
          }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteAddress.mutate(id, {
      onSuccess: () => toast({ title: t("address.deleteSuccess") }),
      onError: () =>
        toast({
          title: t("common.error"),
          description: t("address.deleteFailed"),
          variant: "destructive",
        }),
    });
  };

  const startEditing = (id: string) => setEditingAddressId(id);
  const cancelEditing = () => setEditingAddressId(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("address.title")}</CardTitle>
        <CardDescription>{t("address.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border rounded-lg p-4">
            {editingAddressId === address.id ? (
              <EditAddressForm
                newAddress={address}
                onUpdate={handleUpdate}
                onCancel={cancelEditing}
              />
            ) : (
              <AddressItem
                newAddress={address}
                onEdit={startEditing}
                onDelete={handleDelete}
                onSetDefault={(id) =>
                  updateAddress.mutate(
                    { id, is_default: true },
                    {
                      onSuccess: () =>
                        toast({ title: t("address.setDefault") }),
                    }
                  )
                }
                onSetDelivery={(id) =>
                  updateAddress.mutate(
                    { id, is_delivery: true },
                    {
                      onSuccess: () =>
                        toast({ title: t("address.setDelivery") }),
                    }
                  )
                }
              />
            )}
          </div>
        ))}

        {isAdding ? (
          <AddAddressForm
            newAddress={newAddress}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            onAdd={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsAdding(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("address.addButton")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
