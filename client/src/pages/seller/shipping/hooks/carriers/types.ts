export interface Carrier {
  id?: string;
  name: string;
  description?: string;
  website?: string;
  supportPhone?: string;
  maxWeight?: number;
  isActive?: boolean;
  apiKey?: string;
  basePrice?: number;
  deliversNationwide?: boolean;
  contactInfo?: string;
  service_areas?: string[];
}

export interface ShippingOption {
  id?: string;
  carrier_id: string;
  name: string;
  delivery_time: string;
  price_adjustment: number;
  is_active?: boolean;
}
