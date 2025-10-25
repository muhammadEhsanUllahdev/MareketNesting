import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { useIsMobile } from "@/hooks/use-mobile";

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products/featured");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-10 text-gray-500">
        {t("loading") || "Chargement..."}
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 py-10">
        {t("error") || "Erreur de chargement"}
      </div>
    );

  // ✅ Ensure we always have an array
  const productsArray = Array.isArray(data) ? data : data?.items || [];

  const featuredProducts = productsArray
    .filter((p: any) => p.isFeatured)
    .slice(0, 10);

  return (
    <section className="bg-gradient-to-b from-white to-cebleu-purple-50/40 py-10 w-full">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Star className="text-yellow-500 h-6 w-6" />
            <h2 className="text-3xl font-bold text-cebleu-purple-900">
              {t("products.featuredProducts") || "Produits en vedette"}
            </h2>
          </div>
          <p className="text-cebleu-purple-800">
            {t("products.discoverUnique") ||
              "Découvrez nos produits les plus populaires"}
          </p>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 ? (
          <>
            <ProductGrid
              products={
                isMobile
                  ? featuredProducts.slice(0, 5)
                  : featuredProducts.slice(0, 10)
              }
            />

            <div className="mt-8 text-center">
              <Button className="bg-cebleu-purple-900 text-white px-6 py-2">
                {t("products.exploreMore") || "Explorer plus"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            {t("noFeaturedProducts") || "Aucun produit en vedette trouvé."}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
