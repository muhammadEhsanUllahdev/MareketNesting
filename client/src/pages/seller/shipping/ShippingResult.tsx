import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, MapPin, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShippingResultProps {
  cost: number;
  carrier: string;
  estimatedDeliveryDays: string;
  distance: number;
}

export const ShippingResult: React.FC<ShippingResultProps> = ({
  cost,
  carrier,
  estimatedDeliveryDays,
  distance
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Package className="h-5 w-5" />
          {t("shipping.estimate")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t("shipping.cost")}</p>
              <p className="font-semibold">{cost} DA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t("shipping.estimatedTime")}</p>
              <p className="font-semibold">{estimatedDeliveryDays}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t("shipping.carrier")}</p>
              <p className="font-semibold">{carrier}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t("shipping.distance")}</p>
              <p className="font-semibold">{distance} km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
