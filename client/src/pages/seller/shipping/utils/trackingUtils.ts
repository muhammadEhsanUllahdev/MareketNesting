
export const convertToTrackingItem = (shipment: any) => {
  return {
    id: shipment.id,
    packageId: shipment.tracking_number,
    customerName: shipment.customer_name,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    estimatedDelivery: shipment.estimated_delivery || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    lastUpdate: shipment.updated_at,
    carrier: shipment.carrier?.name || 'Inconnu'
  };
};

export const filterShipments = (shipments: any[], searchTerm: string, statusFilter: string, selectedCarrier: string) => {
  return shipments.filter(shipment => {
    // Search filter
    const matchesSearch = 
      searchTerm === '' || 
      shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      shipment.status?.toLowerCase() === statusFilter;
      
    // Carrier filter
    const matchesCarrier = 
      selectedCarrier === 'all' || 
      shipment.carrier_id === selectedCarrier;
      
    return matchesSearch && matchesStatus && matchesCarrier;
  });
};
