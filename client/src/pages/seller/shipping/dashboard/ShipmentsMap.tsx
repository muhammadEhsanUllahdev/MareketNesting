import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Map, Truck, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SAMPLE_DELIVERY_ZONES = [
  { name: 'Alger', count: 12, color: 'bg-blue-100 text-blue-800' },
  { name: 'Oran', count: 8, color: 'bg-green-100 text-green-800' },
  { name: 'Constantine', count: 5, color: 'bg-amber-100 text-amber-800' },
  { name: 'Annaba', count: 4, color: 'bg-purple-100 text-purple-800' },
  { name: 'Sétif', count: 3, color: 'bg-pink-100 text-pink-800' },
];

export const ShipmentsMap: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shipments.map.title")}</CardTitle>
        <CardDescription>
          {t("shipments.map.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] flex flex-col bg-gray-50 border rounded-md relative overflow-hidden">
          <div className="absolute top-4 right-4 p-3 bg-white shadow rounded-md z-10">
            <h4 className="font-medium text-sm mb-2">{t("shipments.map.activeZones")}</h4>
            <div className="space-y-1">
              {SAMPLE_DELIVERY_ZONES.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3" fill="currentColor" strokeWidth={0} color={zone.color.split(' ')[1]} />
                    <span>{zone.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${zone.color}`}>{zone.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center p-6 mt-16">
            <Map className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">{t("shipments.map.cardTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {t("shipments.map.description")}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Truck className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">{t("shipments.map.carriers.maystro")}</h4>
                <p className="text-xs text-gray-500">{t("shipments.map.inTransit", { count: 15 })}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Truck className="h-6 w-6 text-amber-600 mb-2" />
                <h4 className="font-medium">{t("shipments.map.carriers.yalidine")}</h4>
                <p className="text-xs text-gray-500">{t("shipments.map.inTransit", { count: 23 })}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Truck className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">{t("shipments.map.carriers.noest")}</h4>
                <p className="text-xs text-gray-500">{t("shipments.map.inTransit", { count: 8 })}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentsMap;
