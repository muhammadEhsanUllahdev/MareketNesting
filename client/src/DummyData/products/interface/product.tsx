export interface Product {
  id: number;
  name: string;
  brand: string;
  rating: number;
  reviews: number;
  category: string;
  categoryName: string;
  image: string;
  images?: { url: string }[];
  price: string;
  currency: string;
  description: string;
  badges: string[];
  delivery: string;
  translations: {
    [key: string]: {
      name: string;
      description: string;
      category: string;
    };
  };
}
