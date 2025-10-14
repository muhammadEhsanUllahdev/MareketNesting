import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface ShippingDimensionsProps {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  onChange: (key: keyof ShippingDimensionsProps['dimensions'], value: number) => void;
}

export const ShippingDimensions: React.FC<ShippingDimensionsProps> = ({ dimensions, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Label>{t("shipping.dimensions.title")}</Label>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="length" className="text-sm">{t("shipping.dimensions.length")}</Label>
          <Input
            id="length"
            type="number"
            min="1"
            value={dimensions.length}
            onChange={(e) => onChange('length', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width" className="text-sm">{t("shipping.dimensions.width")}</Label>
          <Input
            id="width"
            type="number"
            min="1"
            value={dimensions.width}
            onChange={(e) => onChange('width', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height" className="text-sm">{t("shipping.dimensions.height")}</Label>
          <Input
            id="height"
            type="number"
            min="1"
            value={dimensions.height}
            onChange={(e) => onChange('height', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};
