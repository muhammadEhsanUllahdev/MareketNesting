
export const calculateShippingCost = (
  weight: number, 
  destination: string, 
  basePrice: number
): number => {
  let baseCost = basePrice || 300;
  
  // Add weight-based pricing
  if (weight > 1) {
    baseCost += (weight - 1) * 50;
  }
  
  // Add distance-based pricing (simplified)
  const distanceMultiplier = destination === 'Alger' ? 1 : 1.2;
  
  return Math.round(baseCost * distanceMultiplier);
};
