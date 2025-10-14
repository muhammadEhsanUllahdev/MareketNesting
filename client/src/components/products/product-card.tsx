import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Star, ShoppingCart, Store as StoreIcon, Truck, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    rating: number;
    reviewCount: number;
    vendorName: string;
    isFeatured?: boolean;
    isHotDeal?: boolean;
    isNew?: boolean;
    isBundle?: boolean;
    discount?: number;
    features: string[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", product.id);
  };

  const getBadgeConfig = () => {
    if (product.isHotDeal) return { text: "Hot Deal", className: "bg-red-500 text-white" };
    if (product.isFeatured) return { text: "Featured", className: "bg-primary-500 text-white" };
    if (product.isNew) return { text: "New", className: "bg-blue-500 text-white" };
    if (product.isBundle) return { text: "Bundle", className: "bg-green-500 text-white" };
    return null;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "fast shipping":
        return <Truck className="h-3 w-3" />;
      case "free shipping":
        return <Truck className="h-3 w-3" />;
      case "best seller":
        return <Award className="h-3 w-3" />;
      case "2y warranty":
        return <Shield className="h-3 w-3" />;
      default:
        return <StoreIcon className="h-3 w-3" />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    
    return stars;
  };

  const badge = getBadgeConfig();

  return (
    <Card className="product-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border group cursor-pointer overflow-hidden" data-testid={`card-product-${product.id}`}>
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="relative w-full h-48 bg-gray-100">
          <img
            src={product.images && product.images[0] ? product.images[0] : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&w=400&h=400"}
            alt={product.name}
            className={`product-image w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            data-testid={`img-product-${product.id}`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
        
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.className}`}>
              {badge.text}
            </Badge>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="flex items-center ml-2">
            <div className="flex text-yellow-400 text-sm" data-testid={`rating-product-${product.id}`}>
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-gray-500 ml-1" data-testid={`text-review-count-${product.id}`}>
              ({product.reviewCount})
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900" data-testid={`text-product-price-${product.id}`}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through" data-testid={`text-original-price-${product.id}`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
          {product.discount && (
            <Badge className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full" data-testid={`badge-discount-${product.id}`}>
              {product.discount}% OFF
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <StoreIcon className="h-3 w-3 mr-1" />
            <span data-testid={`text-vendor-name-${product.id}`}>{product.vendorName}</span>
          </div>
          <div className="flex items-center">
            {product.features && product.features[0] && getFeatureIcon(product.features[0])}
            <span className="ml-1" data-testid={`text-product-feature-${product.id}`}>
              {product.features && product.features[0] ? product.features[0] : "Standard"}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t("products.addToCart")}
        </Button>
      </CardContent>
    </Card>
  );
}
