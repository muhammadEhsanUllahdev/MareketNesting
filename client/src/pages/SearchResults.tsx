import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ShoppingCart, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductGrid } from "@/DummyData/products/ProductGrid";
import ProductFilter from "@/DummyData/products/ProductFilter";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
import { useLocation } from "wouter";
import HeaderC from "@/components/layout/headerC";

const SearchResults = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const query = params.get("query") || "";

  // Filters shared with ProductFilter
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    rating: null,
    freeShipping: false,
    deliveryDay: null,
    availability: null,
    sort: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: true,
  });

  // Infinite query for search results
  type ProductPage = { items: any[]; total: number };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery<ProductPage>({
    queryKey: ["search-products", query, selectedCategory, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append("query", query);
      params.append("limit", "15");
      params.append("offset", String(pageParam));

      // Add category
      if (selectedCategory) params.append("category", selectedCategory);

      // Add filters
      if (filters.minPrice) params.append("minPrice", String(filters.minPrice));
      if (filters.maxPrice) params.append("maxPrice", String(filters.maxPrice));
      if (filters.rating) params.append("rating", String(filters.rating));
      if (filters.freeShipping) params.append("freeShipping", "true");
      if (filters.availability)
        params.append("availability", String(filters.availability));
      if (filters.sort) params.append("sort", String(filters.sort));

      const res = await fetch(`/api/search-products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!query,
    initialPageParam: 0,
    getNextPageParam: (lastPage: ProductPage, allPages: ProductPage[]) => {
      const loaded = allPages.flatMap((p) => p.items).length;
      return loaded < lastPage.total ? loaded : undefined;
    },
  });

  useEffect(() => {
    refetch();
  }, [query]);

  const allProducts = data?.pages.flatMap((page) => page.items) || [];

  const handleCategorySelect = (catName: string | null) => {
    if (selectedCategory === catName) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSelectedCategory(catName);
    }, 300);
  };

  // Helper for dynamic icons
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
    <>
      <HeaderC />
      <div className="bg-gradient-to-b from-white to-cebleu-purple-50/40 py-10 w-full">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-cebleu-purple-900 mb-3">
              Search Results for “{query}”
            </h2>
            <p className="text-cebleu-purple-800">
              {t("products.discoverUnique")}
            </p>
          </div>

          {/* Categories */}
          <ScrollArea className="mb-8 overflow-x-auto pb-4">
            <div className="flex gap-4">
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
                  {cat.IconComponent && (
                    <cat.IconComponent className="w-5 h-5" />
                  )}
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Grid & Filters */}
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            {/* Filters Sidebar */}
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
                <ProductFilter filters={filters} setFilters={setFilters} />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-grow product-grid-container">
              {isLoading ? (
                <div className="text-center text-cebleu-purple-600 py-10">
                  Loading products...
                </div>
              ) : allProducts.length > 0 ? (
                <>
                  <ProductGrid products={allProducts} />
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
                </>
              ) : (
                <p className="text-center text-gray-500 mt-10">
                  {t("search.noResults")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;
