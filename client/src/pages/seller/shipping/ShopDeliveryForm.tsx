import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ShopDeliveryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editingMethod?: any;
}

export const ShopDeliveryForm = ({ open, onOpenChange, onSubmit, editingMethod }: ShopDeliveryFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    delay: '',
    description: '',
    isActive: true,
    deliveryAreas: '',
    specialInstructions: ''
  });

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        name: editingMethod.name || '',
        price: editingMethod.price?.replace(' DA', '') || '',
        delay: editingMethod.delay || '',
        description: editingMethod.description || '',
        isActive: editingMethod.status === 'active',
        deliveryAreas: editingMethod.deliveryAreas?.join(', ') || '',
        specialInstructions: editingMethod.specialInstructions || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        delay: '',
        description: '',
        isActive: true,
        deliveryAreas: '',
        specialInstructions: ''
      });
    }
  }, [editingMethod, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.delay) {
      toast({
        title: t('shopDeliveryForm.errorTitle'),
        description: t('shopDeliveryForm.errorDescription'),
        variant: "destructive"
      });
      return;
    }

    const deliveryMethod = {
      id: editingMethod?.id || Date.now(),
      name: formData.name,
      price: `${formData.price} DA`,
      delay: formData.delay,
      status: formData.isActive ? 'active' : 'inactive',
      type: 'shop_delivery',
      description: formData.description,
      deliveryAreas: formData.deliveryAreas.split(',').map(area => area.trim()),
      specialInstructions: formData.specialInstructions
    };

    onSubmit(deliveryMethod);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? t('shopDeliveryForm.editTitle') : t('shopDeliveryForm.newTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingMethod ? t('shopDeliveryForm.editDescription') : t('shopDeliveryForm.newDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('shopDeliveryForm.name')} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                placeholder={t('shopDeliveryForm.namePlaceholder')}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                {t('shopDeliveryForm.price')} *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="col-span-3"
                placeholder="300"
                min="0"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delay" className="text-right">
                {t('shopDeliveryForm.delay')} *
              </Label>
              <Input
                id="delay"
                value={formData.delay}
                onChange={(e) => setFormData({...formData, delay: e.target.value})}
                className="col-span-3"
                placeholder="2-3 jours"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryAreas" className="text-right">
                {t('shopDeliveryForm.deliveryAreas')}
              </Label>
              <Input
                id="deliveryAreas"
                value={formData.deliveryAreas}
                onChange={(e) => setFormData({...formData, deliveryAreas: e.target.value})}
                className="col-span-3"
                placeholder={t("zone.placeholder.exampleCities")}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('shopDeliveryForm.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3"
                placeholder={t('shopDeliveryForm.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialInstructions" className="text-right">
                {t('shopDeliveryForm.specialInstructions')}
              </Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                className="col-span-3"
                placeholder={t('shopDeliveryForm.specialInstructionsPlaceholder')}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                {t('shopDeliveryForm.active')}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive" className="cursor-pointer text-sm">
                  {formData.isActive ? t('shopDeliveryForm.activeText') : t('shopDeliveryForm.inactiveText')}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('shopDeliveryForm.cancel')}
            </Button>
            <Button type="submit">
              {editingMethod ? t('shopDeliveryForm.editButton') : t('shopDeliveryForm.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
