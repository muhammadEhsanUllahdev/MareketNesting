import React, { useState } from "react";
// import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import { useIsMobile } from "@/hooks/use-mobile";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { Product } from "./interface/product";
// export interface Product {
//   id: number;
//   name: string;
//   shopName: string;
//   rating: number;
//   reviews: number;
//   category: string;
//   image: string;
//   images?: { url: string }[]; // Added optional images array
//   price: string;
//   currency: string;
//   description: string;
//   badges: string[];
//   delivery: string;
// }

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isMobile = useIsMobile();
  // const { t } = useLanguage();
  const { t } = useTranslation();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  // Prepare products with proper image arrays
  // const productsWithImages = products.map((product) => ({
  //   ...product,
  //   images: product.images || [
  //     product.image ||
  //       `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //     `https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
  //   ],
  // }));

  const productsWithImages = products.map((product) => ({
    ...product,
    images: product.images
      ? product.images
      : [
          {
            url:
              product.image ||
              `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
          {
            url: `https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&q=80&auto=format&fit=crop&random=${product.id}`,
          },
        ],
  }));

  return (
    // <>
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
    //     {productsWithImages.map((product) => (
    //       <div
    //         key={product.id}
    //         className="animate-fade-in transform hover:-translate-y-1 transition-transform duration-300"
    //       >
    //         <ProductCard
    //           product={product}
    //           onSelect={handleProductSelect}
    //           compact={isMobile}
    //         />
    //       </div>
    //     ))}
    //   </div>

    //   <ProductDetails
    //     product={selectedProduct}
    //     open={!!selectedProduct}
    //     onClose={handleCloseDetails}
    //   />
    // </>
    <>
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg font-medium">
          {t("No products existing the selected criteria.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
          {productsWithImages.map((product) => (
            <div
              key={product.id}
              className="animate-fade-in transform hover:-translate-y-1 transition-transform duration-300"
            >
              <ProductCard
                product={product}
                onSelect={handleProductSelect}
                compact={isMobile}
              />
            </div>
          ))}
        </div>
      )}

      <ProductDetails
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={handleCloseDetails}
      />
    </>
  );
};
