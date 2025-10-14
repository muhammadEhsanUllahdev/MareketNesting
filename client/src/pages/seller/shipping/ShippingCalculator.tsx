import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShippingResult } from "./ShippingResult";
import { useCarriers } from "./hooks/useCarriers";
import { WilayaSelector } from "./WilayaSelector";
import { ShippingDimensions } from "./ShippingDimensions";
import { useTranslation } from "react-i18next";

export const ShippingCalculator = () => {
  const { carriers, calculateShippingCost } = useCarriers();
  const { t } = useTranslation();

  const [weight, setWeight] = useState<number>(1);
  const [dimensions, setDimensions] = useState({
    length: 30,
    width: 20,
    height: 15,
  });
  const [originWilaya, setOriginWilaya] = useState<string>("Alger");
  const [destinationWilaya, setDestinationWilaya] = useState<string>("");
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);

  const [result, setResult] = useState<{
    cost: number;
    estimatedDeliveryDays: string;
    carrier: string;
  } | null>(null);

  const handleUpdateDimensions = (
    key: keyof typeof dimensions,
    value: number
  ) => {
    setDimensions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const calculateDistance = (origin: string, destination: string): number => {
    if (origin === destination) return 5;

    const majorCities = ["Alger", "Oran", "Constantine", "Annaba", "Sétif"];
    const isMajorOrigin = majorCities.includes(origin);
    const isMajorDest = majorCities.includes(destination);

    if (isMajorOrigin && isMajorDest) {
      if (
        (origin === "Alger" && destination === "Oran") ||
        (origin === "Oran" && destination === "Alger")
      ) {
        return 400;
      } else if (
        (origin === "Alger" && destination === "Constantine") ||
        (origin === "Constantine" && destination === "Alger")
      ) {
        return 430;
      } else if (
        (origin === "Alger" && destination === "Annaba") ||
        (origin === "Annaba" && destination === "Alger")
      ) {
        return 560;
      }
      return 300;
    }

    if (isMajorOrigin || isMajorDest) {
      return 350;
    }

    return 400;
  };

  const handleCalculate = () => {
    if (!selectedCarrier || !originWilaya || !destinationWilaya) {
      return;
    }

    const calculatedDistance = calculateDistance(
      originWilaya,
      destinationWilaya
    );
    setDistance(calculatedDistance);

    const cost = calculateShippingCost(
      weight,
      destinationWilaya,
      selectedCarrier
    );

    let deliveryDays = "";
    if (calculatedDistance < 100) {
      deliveryDays = t("shipment.estimate.days1to2");
    } else if (calculatedDistance < 300) {
      deliveryDays = t("shipment.estimate.days2to3");
    } else {
      deliveryDays = t("shipment.estimate.days3to5");
    }

    const carrier = carriers.find((c) => c.id === selectedCarrier)?.name || "";

    setResult({
      cost,
      estimatedDeliveryDays: deliveryDays,
      carrier,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("shipment.calculator.title")}</CardTitle>
          <CardDescription>
            {t("shipment.calculator.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">{t("shipment.calculator.origin")}</Label>
                <WilayaSelector
                  value={originWilaya}
                  onChange={setOriginWilaya}
                  placeholder={t("shipment.calculator.selectOrigin")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">{t("shipment.calculator.destination")}</Label>
                <WilayaSelector
                  value={destinationWilaya}
                  onChange={setDestinationWilaya}
                  placeholder={t("shipment.calculator.selectDestination")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">{t("shipment.calculator.weight")}</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="carrier">{t("shipment.calculator.carrier")}</Label>
                <Select
                  value={selectedCarrier}
                  onValueChange={setSelectedCarrier}
                >
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder={t("shipment.calculator.selectCarrier")} />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id || ""}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ShippingDimensions
              dimensions={dimensions}
              onChange={handleUpdateDimensions}
            />

            <Button onClick={handleCalculate} className="w-full">
              {t("shipment.calculator.calculateButton")}
            </Button>

            {result && (
              <ShippingResult
                cost={result.cost}
                carrier={result.carrier}
                estimatedDeliveryDays={result.estimatedDeliveryDays}
                distance={distance}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingCalculator;
