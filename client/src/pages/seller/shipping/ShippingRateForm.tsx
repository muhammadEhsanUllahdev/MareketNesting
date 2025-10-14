import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Carrier } from "./types/shipping";

interface ShippingRateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  rate?: any; // if editing
  carriers: Carrier[];
}

export const ShippingRateForm: React.FC<ShippingRateFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  rate,
  carriers,
}) => {
  const [form, setForm] = React.useState({
    zone: "",
    weightMin: "",
    weightMax: "",
    price: "",
    carrierId: "",
    isActive: true,
  });

  useEffect(() => {
    if (rate) {
      setForm({
        zone: rate.zone,
        weightMin: rate.weightMin,
        weightMax: rate.weightMax,
        price: rate.price,
        carrierId: rate.carrierId,
        isActive: rate.isActive,
      });
    } else {
      setForm({
        zone: "",
        weightMin: "",
        weightMax: "",
        price: "",
        carrierId: carriers[0]?.id || "",
        isActive: true,
      });
    }
  }, [rate, carriers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      weightMin: Number(form.weightMin),
      weightMax: Number(form.weightMax),
      price: Number(form.price),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rate ? "Modifier le tarif" : "Nouveau tarif"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Zone</Label>
            <Input
              name="zone"
              value={form.zone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Poids min (kg)</Label>
              <Input
                type="number"
                name="weightMin"
                value={form.weightMin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Poids max (kg)</Label>
              <Input
                type="number"
                name="weightMax"
                value={form.weightMax}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prix (DA)</Label>
            <Input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Transporteur</Label>
            <select
              name="carrierId"
              value={form.carrierId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full">
            {rate ? "Mettre à jour" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
