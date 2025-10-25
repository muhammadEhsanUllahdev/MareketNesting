// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Filter,
//   Laptop,
//   Smartphone,
//   Home,
//   ShoppingBag,
//   Shirt,
//   ShoppingCart,
//   ChevronRight,
// } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import { ProductGrid } from "./ProductGrid";
// import ProductFilter from "./ProductFilter";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import * as Icons from "lucide-react";
// import { LucideProps } from "lucide-react";

// const ProductShowcase = () => {
//   const { data: categories = [] } = useQuery<any[]>({
//     queryKey: ["/api/categories"],
//     queryFn: async () => {
//       const res = await fetch("/api/categories");
//       if (!res.ok) throw new Error("Failed to fetch categories");
//       return res.json();
//     },
//     enabled: true,
//   });
//   const { t } = useTranslation();
//   const isMobile = useIsMobile();
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [filters, setFilters] = useState({
//     minPrice: null,
//     maxPrice: null,
//     rating: null,
//     freeShipping: false,
//     deliveryDay: null,
//     availability: null,
//     sort: null,
//   });

//   type ProductPage = { items: any[]; total: number };

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
//     useInfiniteQuery<ProductPage>({
//       queryKey: ["products", selectedCategory],
//       queryFn: async ({ pageParam = 0 }) => {
//         const categoryParam = selectedCategory
//           ? `&category=${selectedCategory}`
//           : "";
//         const res = await fetch(
//           `/api/products?limit=15&offset=${pageParam}${categoryParam}`
//         );
//         if (!res.ok) throw new Error("Failed to fetch products");
//         return res.json();
//       },
//       initialPageParam: 0,
//       getNextPageParam: (lastPage: ProductPage, allPages: ProductPage[]) => {
//         const loaded = allPages.flatMap((p) => p.items).length;
//         return loaded < lastPage.total ? loaded : undefined;
//       },
//     });

//   const allProducts = data?.pages.flatMap((page) => page.items) || [];
//   function capitalizeFirst(str: any) {
//     str = String(str || "");
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   }
//   const categoriesWithIcons = categories.map((cat) => {
//     const iconName = capitalizeFirst(cat.icon) as keyof typeof Icons;
//     const IconComponent = Icons[iconName] as React.FC<LucideProps>;
//     return { ...cat, IconComponent };
//   });

//   // Example categories (same as yours)
//   // const additionalCategories = [
//   //   { name: t("categories.electronics"), icon: <Laptop className="w-5 h-5" /> },
//   //   {
//   //     name: t("categories.smartphones"),
//   //     icon: <Smartphone className="w-5 h-5" />,
//   //   },
//   //   { name: t("categories.homeGarden"), icon: <Home className="w-5 h-5" /> },
//   //   { name: t("categories.fashion"), icon: <Shirt className="w-5 h-5" /> },
//   //   {
//   //     name: t("categories.groceries"),
//   //     icon: <ShoppingBag className="w-5 h-5" />,
//   //   },
//   //   {
//   //     name: t("categories.allProducts"),
//   //     icon: <ShoppingCart className="w-5 h-5" />,
//   //   },
//   // ];

//   return (
//     <div className="bg-gradient-to-b from-white to-cebleu-purple-50/40 py-10 w-full">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h2 className="text-3xl font-bold text-cebleu-purple-900 mb-3">
//             {t("products.filters.all")}
//           </h2>
//           <p className="text-cebleu-purple-800">
//             {t("products.discoverUnique")}
//           </p>
//         </div>

//         {/* Categories */}
//         <ScrollArea className="mb-8 overflow-x-auto pb-4">
//           <div className="flex gap-4">
//             {/* All Products Tab */}
//             <div
//               onClick={() => setSelectedCategory(null)}
//               className={`flex flex-col items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
//                 selectedCategory === null
//                   ? "bg-cebleu-purple-200 text-cebleu-purple-900"
//                   : "bg-white hover:bg-cebleu-purple-50"
//               }`}
//             >
//               <ShoppingCart className="w-5 h-5" />
//               <span>{t("categories.allProducts")}</span>
//             </div>
//             {categoriesWithIcons.map((cat, i) => (
//               <div
//                 key={i}
//                 onClick={() => setSelectedCategory(cat.name)}
//                 className={`flex flex-col items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
//                   selectedCategory === cat.name
//                     ? "bg-cebleu-purple-200 text-cebleu-purple-900"
//                     : "bg-white hover:bg-cebleu-purple-50"
//                 }`}
//               >
//                 {cat.IconComponent && <cat.IconComponent className="w-5 h-5" />}
//                 <span>{cat.name}</span>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>

//         {/* Grid & Filters */}
//         <div className="flex flex-col lg:flex-row gap-5 w-full">
//           <div className="w-full lg:w-64">
//             <div className="bg-white p-5 rounded-lg border border-cebleu-purple-100 shadow-sm">
//               <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
//                 <div className="flex items-center">
//                   <Filter className="w-5 h-5 text-cebleu-purple-800 mr-2" />
//                   <h3 className="text-lg font-semibold text-cebleu-purple-900">
//                     {t("products.filters")}
//                   </h3>
//                 </div>
//               </div>
//               {/* <ProductFilter /> */}
//               <ProductFilter />
//             </div>
//           </div>

//           {/* Products */}
//           <div className="flex-grow product-grid-container">
//             <ProductGrid products={allProducts} />

//             {/* Load More */}
//             {hasNextPage && (
//               <div className="mt-8 text-center">
//                 <Button
//                   className="bg-purple-900 text-white px-6 py-2"
//                   onClick={() => fetchNextPage()}
//                   disabled={isFetchingNextPage}
//                 >
//                   {isFetchingNextPage
//                     ? t("loading") || "Chargement..."
//                     : t("loadMore") || "Load More"}
//                   <ChevronRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductShowcase;
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ShoppingCart, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductGrid } from "./ProductGrid";
import ProductFilter from "./ProductFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

const ProductShowcase = () => {
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: true,
  });

  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 👇 Filters shared with ProductFilter
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    rating: null,
    freeShipping: false,
    deliveryDay: null,
    availability: null,
    sort: null,
  });

  type ProductPage = { items: any[]; total: number };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ProductPage>({
      queryKey: ["products", selectedCategory, filters],
      queryFn: async ({ pageParam = 0 }) => {
        const params = new URLSearchParams();
        params.append("limit", "15");
        params.append("offset", String(pageParam));

        // Add category
        if (selectedCategory) params.append("category", selectedCategory);

        // Add filters
        if (filters.minPrice)
          params.append("minPrice", String(filters.minPrice));
        if (filters.maxPrice)
          params.append("maxPrice", String(filters.maxPrice));
        if (filters.rating) params.append("rating", String(filters.rating));
        if (filters.freeShipping) params.append("freeShipping", "true");
        if (filters.deliveryDay)
          params.append("deliveryDay", String(filters.deliveryDay));
        if (filters.availability)
          params.append("availability", String(filters.availability));
        if (filters.sort) params.append("sort", String(filters.sort));

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: ProductPage, allPages: ProductPage[]) => {
        const loaded = allPages.flatMap((p) => p.items).length;
        return loaded < lastPage.total ? loaded : undefined;
      },
    });

  const allProducts = data?.pages.flatMap((page) => page.items) || [];

  const handleCategorySelect = (catName: string | null) => {
    if (selectedCategory === catName) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSelectedCategory(catName);
    }, 300);
  };

  function capitalizeFirst(str: any) {
    str = String(str || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const categoriesWithIcons = categories.map((cat) => {
    const iconName = capitalizeFirst(cat.icon) as keyof typeof Icons;
    const IconComponent = Icons[iconName] as React.FC<LucideProps>;
    return { ...cat, IconComponent };
  });

  return (
    <div className="bg-gradient-to-b from-white to-cebleu-purple-50/40 py-10 w-full">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-cebleu-purple-900 mb-3">
            {t("products.filters.all")}
          </h2>
          <p className="text-cebleu-purple-800">
            {t("products.discoverUnique")}
          </p>
        </div>

        {/* Categories */}
        <ScrollArea className="mb-8 overflow-x-auto pb-4">
          <div className="flex gap-4">
            {/* All Products Tab */}
            <div
              onClick={() => handleCategorySelect(null)}
              className={`flex flex-col items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
                selectedCategory === null
                  ? "bg-cebleu-purple-200 text-cebleu-purple-900"
                  : "bg-white hover:bg-cebleu-purple-50"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t("categories.allProducts")}</span>
            </div>

            {categoriesWithIcons.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex flex-col items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  selectedCategory === cat.name
                    ? "bg-cebleu-purple-200 text-cebleu-purple-900"
                    : "bg-white hover:bg-cebleu-purple-50"
                }`}
              >
                {cat.IconComponent && <cat.IconComponent className="w-5 h-5" />}
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Grid & Filters */}
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          <div className="w-full lg:w-64">
            <div className="bg-white p-5 rounded-lg border border-cebleu-purple-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-cebleu-purple-800 mr-2" />
                  <h3 className="text-lg font-semibold text-cebleu-purple-900">
                    {t("products.filters")}
                  </h3>
                </div>
              </div>

              {/* 🧠 Pass filters to ProductFilter */}
              <ProductFilter filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Products */}
          <div className="flex-grow product-grid-container">
            {isLoading ? (
              <div className="text-center text-cebleu-purple-600 py-10">
                Loading products...
              </div>
            ) : (
              <ProductGrid products={allProducts} />
            )}

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-8 text-center">
                <Button
                  className="bg-purple-900 text-white px-6 py-2"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? t("loading") || "Loading..."
                    : t("loadMore") || "Load More"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
