import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Filter,
  ShoppingBag,
  Laptop,
  Smartphone,
  Home,
  ShoppingCart,
  Shirt,
} from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
// import { products } from "@/DummyData/data/products";
import { ProductGrid } from "./ProductGrid";
// import ShopCategories from "../shops/ShopCategories";
import ProductFilter from "./ProductFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
// Define additional categories
// const { t } = useTranslation();
// const additionalCategories = [
//   { name: t("categories.electronics"), icon: <Laptop className="w-5 h-5" />, count: 4200 },
//   {
//     name: t("categories.smartphones"),
//     icon: <Smartphone className="w-5 h-5" />,
//     count: 3150,
//   },
//   { name: t("categories.homeGarden"), icon: <Home className="w-5 h-5" />, count: 5800 },
//   { name: t("categories.fashion"), icon: <Shirt className="w-5 h-5" />, count: 7200 },
//   { name:  t("categories.groceries"), icon: <ShoppingBag className="w-5 h-5" />, count: 2300 },
//   {
//     name: t("categories.allProducts"),
//     icon: <ShoppingCart className="w-5 h-5" />,
//     count: 24500,
//   },
// ];

const ProductShowcase = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const additionalCategories = [
    {
      name: t("categories.electronics"),
      icon: <Laptop className="w-5 h-5" />,
      count: 4200,
    },
    {
      name: t("categories.smartphones"),
      icon: <Smartphone className="w-5 h-5" />,
      count: 3150,
    },
    {
      name: t("categories.homeGarden"),
      icon: <Home className="w-5 h-5" />,
      count: 5800,
    },
    {
      name: t("categories.fashion"),
      icon: <Shirt className="w-5 h-5" />,
      count: 7200,
    },
    {
      name: t("categories.groceries"),
      icon: <ShoppingBag className="w-5 h-5" />,
      count: 2300,
    },
    {
      name: t("categories.allProducts"),
      icon: <ShoppingCart className="w-5 h-5" />,
      count: 24500,
    },
  ];

  // const { t, language } = useLanguage();

  const [filterHeight, setFilterHeight] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: true,
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  // Adjust filter height to match grid height
  useEffect(() => {
    const updateFilterHeight = () => {
      const gridElement = document.querySelector(".product-grid-container");
      if (gridElement) {
        const gridHeight = gridElement.clientHeight;
        setFilterHeight(gridHeight);
      }
    };

    // Initial calculation after a slight delay to ensure products are rendered
    const timer = setTimeout(() => {
      updateFilterHeight();
    }, 500);

    // Update on window resize
    window.addEventListener("resize", updateFilterHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateFilterHeight);
    };
  }, [products, isMobile]);

  return (
    <div className="bg-gradient-to-b from-white to-cebleu-purple-50/40 py-8 sm:py-10 md:py-12 overflow-hidden w-full">
      <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
        <div className="mb-8 md:mb-10 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-cebleu-purple-900 mb-3 relative group">
            <span className="relative inline-block">
              {t("products.featuredProducts")}
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cebleu-gold to-cebleu-gold-light transform scale-x-100 group-hover:scale-x-110 transition-transform duration-300 ease-out"></span>
            </span>
          </h2>
          <p className="text-cebleu-purple-800 text-sm md:text-base max-w-2xl mx-auto text-center">
            {t("products.discoverUnique")}
          </p>
        </div>

        {/* Additional categories */}
        <ScrollArea className="mb-8 overflow-x-auto pb-4">
          <div
            className="flex gap-4 mx-auto"
            style={{
              minWidth: "max-content",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
          >
            {additionalCategories.map((cat, index) => (
              <div
                key={index}
                onClick={() =>
                  setSelectedCategory(
                    cat.name === selectedCategory ? null : cat.name
                  )
                }
                className={`flex flex-col items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 min-w-[100px] 
                  ${
                    selectedCategory === cat.name
                      ? "bg-cebleu-purple-100 text-cebleu-purple-900 shadow-md"
                      : "bg-white hover:bg-cebleu-purple-50 text-cebleu-purple-800 shadow-sm"
                  }`}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    selectedCategory === cat.name
                      ? "bg-cebleu-purple-200"
                      : "bg-cebleu-purple-50"
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-cebleu-purple-700">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex flex-col lg:flex-row gap-5 md:gap-6 w-full">
          {/* Filter sidebar */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div
              className="lg:sticky lg:top-24"
              style={{
                height:
                  !isMobile && filterHeight ? `${filterHeight}px` : "auto",
              }}
            >
              <div className="bg-white p-5 rounded-lg border border-cebleu-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 text-cebleu-purple-800 mr-2" />
                    <h3 className="text-lg font-semibold text-cebleu-purple-900">
                      {t("products.filters")}
                    </h3>
                  </div>
                  {activeFilters > 0 && (
                    <div className="bg-cebleu-purple-100 text-cebleu-purple-900 text-xs font-medium px-2 py-1 rounded-full">
                      {activeFilters} {t("products.filtersApplied")}
                    </div>
                  )}
                </div>
                <div className="h-auto max-h-[calc(100vh-180px)]">
                  <ProductFilter />
                </div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-grow min-w-0 product-grid-container w-full">
            <ProductGrid
              products={
                isMobile ? featuredProducts.slice(0, 6) : featuredProducts
              }
            />

            <div className="mt-8 md:mt-10 text-center">
              <Button className="bg-cebleu-purple-900 hover:bg-cebleu-purple-900 text-white font-medium group px-6 py-2.5 h-11 rounded-lg shadow-sm hover:shadow-md transition-all">
                {t("products.exploreMore")}
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
