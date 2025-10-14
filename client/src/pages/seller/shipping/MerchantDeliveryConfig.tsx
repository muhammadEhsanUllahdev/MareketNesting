import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from "react-i18next";

interface MerchantDeliveryConfigProps {
  shopId: string;
}

export const MerchantDeliveryConfig: React.FC<MerchantDeliveryConfigProps> = ({ shopId }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [config, setConfig] = useState({
    usesOwnDelivery: false,
    basePrice: 0,
    availableAreas: [] as string[],
    deliveryNotes: ''
  });

  const handleSave = () => {
    toast({
      title: t("merchant.delivery.saved"),
      description: t("merchant.delivery.updated"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("merchant.delivery.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="own-delivery"
            checked={config.usesOwnDelivery}
            onCheckedChange={(checked) => 
              setConfig(prev => ({ ...prev, usesOwnDelivery: checked }))
            }
          />
          <Label htmlFor="own-delivery">{t("merchant.delivery.useOwn")}</Label>
        </div>

        {config.usesOwnDelivery && (
          <>
            <div className="space-y-2">
              <Label htmlFor="base-price">{t("merchant.delivery.basePrice")}</Label>
              <Input
                id="base-price"
                type="number"
                value={config.basePrice}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-notes">{t("merchant.delivery.notes")}</Label>
              <Textarea
                id="delivery-notes"
                value={config.deliveryNotes}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, deliveryNotes: e.target.value }))
                }
                placeholder={t("merchant.delivery.placeholder")}
              />
            </div>

            <Button onClick={handleSave}>
              {t("merchant.delivery.saveBtn")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
