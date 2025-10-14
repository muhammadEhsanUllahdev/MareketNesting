export interface Carrier {
  id?: string;
  name: string;
  description?: string;
  website?: string;
  support_phone?: string;
  max_weight?: number;
  is_active?: boolean;
  api_key?: string;
  base_price?: number;
  delivers_nationwide?: boolean;
  contact_info?: string;
  service_areas?: string[];
}

export interface ShippingRate {
  id?: string;
  carrier_id: string;
  city: string;
  price: number;
  is_active?: boolean;
}

export interface ShippingOption {
  id?: string;
  carrier_id: string;
  name: string;
  delivery_time: string;
  price_adjustment: number;
  is_active?: boolean;
}

export interface ShippingSettings {
  id?: string;
  shop_id: string;
  default_carrier_id?: string;
  free_shipping_threshold?: number;
  is_free_shipping_active?: boolean;
  max_weight?: number;
  default_dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  webhook_url?: string;
}

export interface Shipment {
  id?: string;
  tracking_number: string; // Format: 1Z999AA10123456784 - numéro de suivi transporteur
  carrier_id: string;
  order_id?: string;
  order_number?: string;
  shop_id?: string;
  customer_name: string;
  customer_address: string;
  customer_phone?: string;
  origin: string;
  destination: string;
  status?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  estimated_delivery?: string;
  actual_delivery_date?: string;
  created_at?: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  carrier?: {
    name: string;
  };
  service_type?: "standard" | "express" | "overnight" | "international";
  shipping_cost?: number;
  signature_required?: boolean;
  delivery_instructions?: string;
}

export interface ShipmentEvent {
  id?: string;
  shipment_id: string;
  status: string;
  location?: string;
  description?: string;
  timestamp?: string;
}

export interface ShippingCalculatorInputs {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  origin: string;
  destination: string;
  carrier_id?: string;
}

export interface TrackingCode {
  code: string;
  carrier: string;
  shipment_id: string;
  generated_at: string;
  status: string;
}
