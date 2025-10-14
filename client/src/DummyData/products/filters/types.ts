
export interface FilterSectionProps {
  title: string;
  section: string;
  isExpanded: boolean;
  toggleSection: (section: string) => void;
  children: React.ReactNode;
}

export type ExpandedSectionsType = {
  price: boolean;
  shipping: boolean;
  delivery: boolean;
  rating: boolean;
  refreshRate: boolean;
  screenSize: boolean;
  resolution: boolean;
  promotions: boolean;
  availability: boolean;
  brand: boolean;
  sort: boolean;
};
