import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Truck, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ZoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: any;
  onSubmit: (zoneData: any) => void;
  onCancel: () => void;
}

export const ZoneForm: React.FC<ZoneFormProps> = ({
  open,
  onOpenChange,
  zone,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    code: zone?.code || '',
    name: zone?.name || '',
    status: zone?.status || 'active',
    carriers: zone?.carriers || [],
  });
  
  const [newCarrier, setNewCarrier] = useState({
    name: '',
    deliveryTime: '48h',
    price: ''
  });

  const availableCarriers = ['Yalidine', 'Express DZ', 'Zoom Delivery', 'Fast Delivery'];

  useEffect(() => {
    if (zone) {
      setFormData({
        code: zone.code || '',
        name: zone.name || '',
        status: zone.status || 'active',
        carriers: zone.carriers || []
      });
    } else {
      setFormData({
        code: '',
        name: '',
        status: 'active',
        carriers: []
      });
    }
  }, [zone, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addCustomCarrier = () => {
    if (newCarrier.name.trim() && newCarrier.price.trim()) {
      const carrierExists = formData.carriers.some((c: any) => c.name === newCarrier.name.trim());
      if (!carrierExists) {
        setFormData(prev => ({
          ...prev,
          carriers: [...prev.carriers, {
            name: newCarrier.name.trim(),
            deliveryTime: newCarrier.deliveryTime,
            price: newCarrier.price.trim()
          }]
        }));
        setNewCarrier({ name: '', deliveryTime: '48h', price: '' });
      }
    }
  };

  const removeCarrier = (carrierName: string) => {
    setFormData(prev => ({
      ...prev,
      carriers: prev.carriers.filter((c: any) => c.name !== carrierName)
    }));
  };

  const addPredefinedCarrier = (carrierName: string) => {
    const carrierExists = formData.carriers.some((c: any) => c.name === carrierName);
    if (!carrierExists) {
      setFormData(prev => ({
        ...prev,
        carriers: [...prev.carriers, {
          name: carrierName,
          deliveryTime: '48h',
          price: ''
        }]
      }));
    }
  };

  const updateCarrier = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      carriers: prev.carriers.map((c: any, i: number) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {zone ? t('zone.editTitle') : t('zone.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {zone ? t('zone.editDescription') : t('zone.addDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t('zone.code')}</Label>
              <Input
                id="code"
                type="text"
                placeholder="01"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('zone.name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Adrar"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('zone.status')}</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('zone.active')}</SelectItem>
                <SelectItem value="inactive">{t('zone.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>{t('zone.carriersLabel')}</Label>
            
            <div className="border rounded-lg p-4 space-y-4">
              <Label className="text-sm font-medium">{t('zone.addCarrier')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder={t('zone.carrierName')}
                  value={newCarrier.name}
                  onChange={(e) => setNewCarrier(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newCarrier.deliveryTime} onValueChange={(value) => setNewCarrier(prev => ({ ...prev, deliveryTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('zone.deliveryTime')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12h</SelectItem>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="48h">48h</SelectItem>
                    <SelectItem value="72h">72h</SelectItem>
                    <SelectItem value="96h">96h</SelectItem>
                    <SelectItem value="120h">120h</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('zone.price')}
                    value={newCarrier.price}
                    onChange={(e) => setNewCarrier(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <Button type="button" size="sm" onClick={addCustomCarrier}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {formData.carriers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('zone.configuredCarriers')}</Label>
                <div className="space-y-2">
                  {formData.carriers.map((carrier: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">{carrier.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Select 
                            value={carrier.deliveryTime} 
                            onValueChange={(value) => updateCarrier(index, 'deliveryTime', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12h">12h</SelectItem>
                              <SelectItem value="24h">24h</SelectItem>
                              <SelectItem value="48h">48h</SelectItem>
                              <SelectItem value="72h">72h</SelectItem>
                              <SelectItem value="96h">96h</SelectItem>
                              <SelectItem value="120h">120h</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            className="w-20"
                            placeholder={t('zone.price')}
                            value={carrier.price}
                            onChange={(e) => updateCarrier(index, 'price', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeCarrier(carrier.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">{t('zone.quickAdd')}</Label>
              <div className="flex flex-wrap gap-2">
                {availableCarriers
                  .filter(carrier => !formData.carriers.some((c: any) => c.name === carrier))
                  .map((carrier) => (
                    <Button
                      key={carrier}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPredefinedCarrier(carrier)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {carrier}
                    </Button>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('zone.cancel')}
            </Button>
            <Button type="submit">
              {zone ? t('zone.edit') : t('zone.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
