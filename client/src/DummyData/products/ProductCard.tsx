import React, { useState, useCallback } from "react";
import {
  Store,
  Star,
  ShoppingCart,
  Heart,
  Share,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ImageOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { Product } from "./interface/product";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
// interface Product {
//   id: number;
//   name: string;
//   brand: string;
//   rating: number;
//   reviews: number;
//   category: string;
//   categoryName: string;
//   image: string;
//   images?: { url: string }[];
//   price: string;
//   currency: string;
//   description: string;
//   badges: string[];
//   delivery: string;
// }

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  compact?: boolean;
}

const ProductCard = ({
  product,
  onSelect,
  compact = false,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    product.images?.[0]?.url || product.image
  );
  type WishlistCheckResponse = {
    inWishlist: boolean;
  };
  // Check if product is in wishlist
  const { data: wishlistStatus } = useQuery<WishlistCheckResponse>({
    queryKey: [`/api/wishlist/${product.id}/check`],
    enabled: !!user,
  });

  const isInWishlist = wishlistStatus?.inWishlist || false;

  // Wishlist mutations
  // const addToWishlistMutation = useMutation({
  //   mutationFn: () => apiRequest(`/api/wishlist/${product.id}`, { method: "POST" }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [`/api/wishlist/${product.id}/check`] });
  //     queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
  //     toast({
  //       title: t("products.addedToWishlist"),
  //       description: product.name,
  //       duration: 3000,
  //     });
  //   },
  //   onError: () => {
  //     toast({
  //       title: "Error",
  //       description: "Failed to add to wishlist",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //   },
  // });

  const addToWishlistMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/wishlist/${product.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/wishlist/${product.id}/check`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: t("products.addedToWishlist"),
        description: product.name,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/wishlist/${product.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/wishlist/${product.id}/check`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: product.name,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () =>
      apiRequest(
        "POST", // method
        `/api/cart/${product.id}`,
        { quantity: 1 }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: t("products.addedToCart"),
        description: product.name,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // const addToCartMutation = useMutation({
  //   mutationFn: () =>
  //     apiRequest(`/api/cart/${product.id}`, {
  //       method: "POST",
  //       body: JSON.stringify({ quantity: 1 }),
  //       headers: { "Content-Type": "application/json" },
  //     }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  //     queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
  //     toast({
  //       title: t("products.addedToCart"),
  //       description: product.name,
  //       duration: 3000,
  //     });
  //   },
  //   onError: () => {
  //     toast({
  //       title: "Error",
  //       description: "Failed to add to cart",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //   },
  // });

  // Fallback images for different product categories
  const fallbackImages = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80&auto=format&fit=crop",
  ];

  // Only generate the fallback URL when needed, don't call setState during render
  const getFallbackImage = useCallback(() => {
    if (product.category) {
      const categoryHash = product.category
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      const fallbackIndex = categoryHash % fallbackImages.length;
      return fallbackImages[fallbackIndex];
    }
    return fallbackImages[0];
  }, [product.category, fallbackImages]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) onSelect(product);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop

    if (!imageError) {
      // First fallback attempt
      const fallback = getFallbackImage();
      setImageSrc(fallback);
      setImageError(true);
    } else {
      // If we already tried a fallback and it failed, try a different one
      const fallbackIndex = (product.id || 0) % fallbackImages.length;
      setImageSrc(fallbackImages[fallbackIndex]);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use wishlist",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  const handleShare = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // In a real app, you would generate the actual URL for the product
    const productUrl = `https://cebleu.fr/product/${product.id}`;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          productUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          product.name
        )}&url=${encodeURIComponent(productUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          productUrl
        )}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct sharing URL, but we'll include it for UI completeness
        toast({
          title: t("products.shareOnInstagram"),
          description: t("products.instagramShareDescription"),
          duration: 3000,
        });
        setIsPopoverOpen(false);
        return;
    }

    // Open share URL in a new window
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }

    toast({
      title: t("products.shared"),
      description: t("products.sharedOn") + " " + platform,
      duration: 2000,
    });

    setIsPopoverOpen(false);
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 border-cebleu-purple-200 h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0">
        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden rounded-t-lg">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />

          {/* Image error overlay that shows if all attempts fail */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-cebleu-purple-50/80 opacity-50">
              <div className="text-center">
                <ImageOff className="h-8 w-8 text-cebleu-purple-300 mx-auto mb-1" />
                <p className="text-xs text-cebleu-purple-400 font-medium">
                  {product.name}
                </p>
              </div>
            </div>
          )}

          {/* <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {product.badges.map((badge, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/90 text-cebleu-purple-800 backdrop-blur-sm border border-cebleu-purple-200 text-[10px] sm:text-xs"
              >
                {badge}
              </Badge>
            ))}
          </div> */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-white/80 hover:bg-white border border-cebleu-purple-100 text-cebleu-purple-700 hover:text-cebleu-purple-900 backdrop-blur-sm opacity-70 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#1877F2] hover:bg-[#1877F2]/10"
                    onClick={(e) => handleShare("facebook", e)}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                    onClick={(e) => handleShare("twitter", e)}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#0A66C2] hover:bg-[#0A66C2]/10"
                    onClick={(e) => handleShare("linkedin", e)}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#E4405F] hover:bg-[#E4405F]/10"
                    onClick={(e) => handleShare("instagram", e)}
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-white/80 hover:bg-white border border-cebleu-purple-100 text-cebleu-purple-700 hover:text-cebleu-purple-900 backdrop-blur-sm opacity-70 group-hover:opacity-100 transition-opacity"
              onClick={handleWishlistClick}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist
                    ? "fill-red-500 text-red-500"
                    : "text-cebleu-purple-700 hover:text-red-500"
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={`flex-grow ${compact ? "p-2 sm:p-3" : "p-3 sm:p-4"}`}
      >
        <div className="mb-1.5">
          <Badge
            variant="outline"
            className="bg-cebleu-purple-50 text-cebleu-purple-700 text-[10px] sm:text-xs"
          >
            {product.categoryName}
          </Badge>
        </div>

        <h3
          className={`font-semibold ${
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
          } mb-1.5 text-cebleu-purple-900 line-clamp-2`}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 text-cebleu-gold fill-cebleu-gold" />
            <span className="font-medium text-xs ml-1">{product.rating}</span>
          </div>
          <span className="text-[10px] sm:text-xs text-cebleu-purple-600">
            ({product.reviews} {t("products.reviews")})
          </span>
        </div>

        {!compact && (
          <p className="text-xs text-cebleu-purple-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-[10px] sm:text-xs">
          <Store className="h-3 w-3 text-cebleu-purple-600" />
          <span className="font-medium text-cebleu-purple-700">
            {product.brand}
          </span>
        </div>
      </CardContent>
      <CardFooter
        className={`${compact ? "p-2 sm:p-3" : "p-3 sm:p-4"} pt-0 mt-auto`}
      >
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm sm:text-base text-cebleu-purple-800">
              {product.currency}
              {product.price}
            </span>

            {product.stock === 0 ? (
              <Badge
                variant="destructive"
                className="text-xs bg-red-100 text-red-600 border border-red-300"
              >
                {t("products.outOfStock", "Out of Stock")}
              </Badge>
            ) : (
              <span className="text-[10px] sm:text-xs text-cebleu-purple-600 italic">
                {product.delivery}
              </span>
            )}
          </div>

          {/* ✅ Disable or hide "Add to Cart" button when stock = 0 */}
          {product.stock > 0 ? (
            <Button
              className="w-full h-9 text-xs sm:text-sm bg-gradient-to-r from-cebleu-gold to-cebleu-gold-light text-cebleu-dark hover:from-cebleu-gold-light hover:to-cebleu-gold font-medium rounded-md flex items-center justify-center shadow-md"
              onClick={handleCartClick}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />
              <span>{t("products.addToCart")}</span>
            </Button>
          ) : (
            <Button
              className="w-full h-9 text-xs sm:text-sm bg-gray-300 text-gray-600 font-medium rounded-md flex items-center justify-center cursor-not-allowed"
              disabled
            >
              {t("products.unavailable", "Unavailable")}
            </Button>
          )}

          {!compact && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs bg-gradient-to-r from-cebleu-purple-400 to-cebleu-purple-600 hover:from-cebleu-purple-500 hover:to-cebleu-purple-700 text-white border-0 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: t("products.viewingShop"),
                  description: product.brand,
                });
              }}
            >
              <Store className="h-3 w-3 mr-1" />
              <span className="truncate">{t("products.viewShopBtn")}</span>
            </Button>
          )}
        </div>
      </CardFooter>

      {/* <CardFooter
        className={`${compact ? "p-2 sm:p-3" : "p-3 sm:p-4"} pt-0 mt-auto`}
      >
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm sm:text-base text-cebleu-purple-800">
              {product.currency}
              {product.price}
            </span>
            <span className="text-[10px] sm:text-xs text-cebleu-purple-600 italic">
              {product.delivery}
            </span>
          </div>

          <Button
            className="w-full h-9 text-xs sm:text-sm bg-gradient-to-r from-cebleu-gold to-cebleu-gold-light text-cebleu-dark hover:from-cebleu-gold-light hover:to-cebleu-gold font-medium rounded-md flex items-center justify-center shadow-md"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-2" />
            <span>{t("products.addToCart")}</span>
          </Button>

          {!compact && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs bg-gradient-to-r from-cebleu-purple-400 to-cebleu-purple-600 hover:from-cebleu-purple-500 hover:to-cebleu-purple-700 text-white border-0 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                // View shop functionality
                toast({
                  title: t("products.viewingShop"),
                  description: product.brand,
                });
              }}
            >
              <Store className="h-3 w-3 mr-1" />
              <span className="truncate">{t("products.viewShopBtn")}</span>
            </Button>
          )}
        </div>
      </CardFooter> */}
    </Card>
  );
};

export default ProductCard;
