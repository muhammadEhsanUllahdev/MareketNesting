import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WilayaSelector } from './WilayaSelector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from "react-i18next";

interface City {
  id: string;
  name: string;
  rate: number;
  active: boolean;
}

interface CitySelectionProps {
  selectedCities: City[];
  onAddCity: (city: string, rate: number) => void;
  onToggleCity: (id: string) => void;
  onUpdateRate: (id: string, rate: number) => void;
}

export const CitySelection = ({
  selectedCities,
  onAddCity,
  onToggleCity,
  onUpdateRate
}: CitySelectionProps) => {
  const [newCity, setNewCity] = React.useState('');
  const [newRate, setNewRate] = React.useState(300);
  const { t } = useTranslation();

  const handleAddCity = () => {
    if (newCity) {
      onAddCity(newCity, newRate);
      setNewCity('');
      setNewRate(300);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t("citySelection.configureRates")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="city">{t("citySelection.wilaya")}</Label>
              <WilayaSelector 
                value={newCity} 
                onChange={setNewCity}
                placeholder={t("citySelection.selectWilaya")}
              />
            </div>
            <div className="md:w-1/3">
              <Label htmlFor="rate">{t("citySelection.rate")}</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                value={newRate}
                onChange={(e) => setNewRate(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="md:self-end">
              <Button onClick={handleAddCity}>{t("common.add")}</Button>
            </div>
          </div>

          {selectedCities.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t("citySelection.wilaya")}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t("citySelection.rate")}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t("common.active")}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedCities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{city.name}</td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="0"
                          value={city.rate}
                          onChange={(e) => onUpdateRate(city.id, parseInt(e.target.value) || 0)}
                          className="w-24 h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Switch
                          checked={city.active}
                          onCheckedChange={() => onToggleCity(city.id)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Button variant="destructive" size="sm">
                          {t("common.delete")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <p className="text-gray-500">{t("citySelection.noWilayaConfigured")}</p>
              <p className="text-sm text-gray-400">{t("citySelection.addWilayaInfo")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CitySelection;
