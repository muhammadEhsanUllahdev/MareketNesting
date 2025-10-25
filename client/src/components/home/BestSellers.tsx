import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Award,
  Heart,
  TrendingUp,
  ShoppingBag,
  Crown,
  Clock,
  Star,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { products } from '@/data/products';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface SellerItem {
  rank: number;
  name: string;
  rating: number;
  reviews: number;
  image: string;
}

const BestSellers = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("weekly");

  // Sample data for weekly sellers
  const weeklySellers: SellerItem[] = [
    {
      rank: 1,
      name: "ElectroMart",
      rating: 5,
      reviews: 673,
      image:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=100&q=80",
    },
    {
      rank: 2,
      name: "SportZone",
      rating: 4.9,
      reviews: 512,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=100&q=80",
    },
    {
      rank: 3,
      name: "HomeDecorPro",
      rating: 4.8,
      reviews: 418,
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80",
    },
    {
      rank: 4,
      name: "GadgetWorld",
      rating: 4.7,
      reviews: 356,
      image:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=100&q=80",
    },
    {
      rank: 5,
      name: "FashionTrends",
      rating: 4.6,
      reviews: 289,
      image:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=100&q=80",
    },
  ];

  // Products of the week with improved images
  const weeklyProducts = [
    {
      id: 1,
      name: 'Gaming Monitor 32" UHD',
      shopName: "TechPro Store",
      rating: 4.8,
      reviews: 245,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1616711906333-23cf1306b3e9?w=500&q=80",
      price: "399.99",
      currency: "€",
      description:
        "32-inch 4K UHD gaming monitor with 144Hz refresh rate and 1ms response time.",
      badges: ["New", "Gaming"],
      delivery: "Express",
    },
    {
      id: 2,
      name: "Pro Travel Backpack",
      shopName: "Adventure Gear",
      rating: 4.9,
      reviews: 189,
      category: "Travel",
      image:
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80",
      price: "89.99",
      currency: "€",
      description:
        "Waterproof travel backpack with laptop compartment and USB charging port.",
      badges: ["Bestseller", "Travel"],
      delivery: "Standard",
    },
    {
      id: 3,
      name: "Wireless Gaming Headset",
      shopName: "GameZone",
      rating: 4.7,
      reviews: 312,
      category: "Gaming",
      image:
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
      price: "159.99",
      currency: "€",
      description:
        "Premium wireless gaming headset with 7.1 surround sound and noise cancellation.",
      badges: ["Gaming", "Wireless"],
      delivery: "Express",
    },
    {
      id: 4,
      name: "Smart Mini Fridge",
      shopName: "Home Tech",
      rating: 4.6,
      reviews: 156,
      category: "Appliances",
      image:
        "https://images.unsplash.com/photo-1610416481686-c3468da9f293?w=500&q=80",
      price: "299.99",
      currency: "€",
      description:
        "Compact smart refrigerator with temperature control and app connectivity.",
      badges: ["Smart Home", "New"],
      delivery: "Standard",
    },
    {
      id: 5,
      name: "Ergonomic Office Chair",
      shopName: "WorkSpace Pro",
      rating: 4.8,
      reviews: 203,
      category: "Furniture",
      image:
        "https://images.unsplash.com/photo-1589384267710-7a25bc5b68bb?w=500&q=80",
      price: "249.99",
      currency: "€",
      description:
        "Premium ergonomic office chair with lumbar support and adjustable features.",
      badges: ["Ergonomic", "Office"],
      delivery: "Premium",
    },
  ];

  // Customer favorites - Products of the week
  const customerFavorites = [
    {
      id: 7,
      name: "4K Webcam Pro",
      shopName: "StreamTech",
      rating: 4.9,
      reviews: 267,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1629429407756-28d453c7fcc7?w=500&q=80",
      price: "199.99",
      currency: "€",
      description:
        "Professional 4K webcam with auto-focus and low light correction.",
      badges: ["Streaming", "4K"],
      delivery: "Standard",
    },
    {
      id: 8,
      name: "Wireless Gaming Mouse",
      shopName: "GameZone",
      rating: 4.7,
      reviews: 389,
      category: "Gaming",
      image:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
      price: "79.99",
      currency: "€",
      description: "Ultra-light wireless gaming mouse with 25K DPI sensor.",
      badges: ["Gaming", "Wireless"],
      delivery: "Express",
    },
    {
      id: 6,
      name: "Mechanical Gaming Keyboard",
      shopName: "Gaming Gear Pro",
      rating: 4.7,
      reviews: 178,
      category: "Gaming",
      image:
        "https://images.unsplash.com/photo-1644933891402-2e5ea8fd3abc?w=500&q=80",
      price: "129.99",
      currency: "€",
      description:
        "RGB mechanical gaming keyboard with custom switches and programmable keys.",
      badges: ["Gaming", "RGB"],
      delivery: "Express",
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderSellerItem = (seller: SellerItem, index: number) => (
    <div
      key={seller.name}
      className="flex items-center py-2 px-1 hover:bg-gray-50 rounded transition-colors group"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full relative">
        {index === 0 ? (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        ) : (
          <span className="text-xs font-semibold w-5 h-5 flex items-center justify-center bg-cebleu-purple-100 rounded-full text-cebleu-purple">
            {seller.rank}
          </span>
        )}
      </div>
      <div className="relative ml-2 mr-3">
        <img
          src={seller.image}
          alt={seller.name}
          className="w-8 h-8 object-cover rounded-full border-2 border-white shadow-sm"
        />
        {index === 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3 flex items-center justify-center">
            <Star className="w-2 h-2 text-white fill-current" />
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-xs font-medium truncate flex items-center">
          {seller.name}
          {index === 0 && <Tag className="w-3 h-3 ml-1 text-amber-500" />}
        </p>
        <div className="flex items-center">
          <span className="flex text-xs">{renderStars(seller.rating)}</span>
          <span className="text-[9px] text-gray-500 ml-0.5">
            ({seller.reviews})
          </span>
        </div>
      </div>
    </div>
  );

  const renderProductItem = (
    product: any,
    isFavorite: boolean = false,
    index: number = -1
  ) => (
    <div
      key={product.id}
      className="flex items-center gap-3 hover:bg-gray-50 rounded p-2 transition-colors group"
    >
      <div className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200 shadow-sm">
        <AspectRatio ratio={1 / 1}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </AspectRatio>
        {isFavorite && (
          <div className="absolute top-0 right-0 bg-gradient-to-br from-cebleu-gold to-cebleu-gold-rich text-white rounded-bl-md p-0.5">
            <Heart className="w-3 h-3 fill-white" />
          </div>
        )}
        {index === 0 && !isFavorite && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 py-0.5 text-[8px] font-bold rounded-br-md">
            #1
          </div>
        )}
        {product.badges && product.badges.includes("New") && (
          <div className="absolute bottom-0 left-0 bg-cebleu-blue px-1 py-0.5 text-[8px] font-bold text-white rounded-tr-md">
            {t("badge.new")}
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center">
          <p className="text-xs font-bold truncate text-gray-800">
            {product.name}
          </p>
          {product.reviews > 300 && (
            <span className="ml-1">
              <TrendingUp className="w-3 h-3 text-cebleu-purple" />
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 truncate">{product.shopName}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold text-cebleu-purple-800">
            {product.price} {product.currency}
          </p>
          {product.delivery === "Express" && (
            <span className="text-[8px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full flex items-center">
              <Clock className="w-2 h-2 mr-0.5" /> 24h
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-cebleu-dark flex items-center">
          <Crown className="w-5 h-5 mr-2 text-cebleu-gold-rich" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cebleu-purple-800 to-cebleu-purple">
            {t("dashboard.bestSaleOfMonth")}
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-cebleu-purple hover:text-cebleu-purple-dark hover:bg-cebleu-purple-50"
        >
          {t("common.seeAll")} <ChevronRight className="w-3 h-3 ml-0.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Sellers Section */}
        <Card className="shadow-sm overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-cebleu-purple-800 to-cebleu-purple-600 px-4 py-2.5 border-b border-cebleu-purple-800">
            <h3 className="font-medium text-sm flex items-center text-white">
              <Award className="w-4 h-4 mr-1.5" />
              {t("bestSellers.weeklyProducts")}
            </h3>
          </div>

          <div className="p-2">
            <ScrollArea className="h-[220px]">
              <div className="space-y-0.5 px-2">
                {weeklySellers.map((seller, idx) =>
                  renderSellerItem(seller, idx)
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Best Products Section */}
        <Card className="shadow-sm overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-cebleu-blue-dark to-cebleu-blue px-4 py-2.5 border-b border-cebleu-blue-dark">
            <h3 className="font-medium text-sm flex items-center text-white">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              {t("bestSellers.weeklySellers")}
            </h3>
          </div>

          <div className="p-2">
            <ScrollArea className="h-[220px]">
              <div className="space-y-2 px-2">
                {weeklyProducts.map((product, idx) =>
                  renderProductItem(product, false, idx)
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Weekly Customer Favorites */}
        <Card className="shadow-sm overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-cebleu-gold-rich to-cebleu-gold px-4 py-2.5 border-b border-cebleu-gold-rich">
            <h3 className="font-medium text-sm flex items-center text-gray-800">
              <Heart className="w-4 h-4 mr-1.5 fill-cebleu-gray-dark" />
              {t("bestSellers.customerFavorites")}
            </h3>
          </div>

          <div className="p-3">
            <ScrollArea className="h-[220px]">
              <div className="space-y-3">
                {customerFavorites.map((product, idx) =>
                  renderProductItem(product, true, idx)
                )}

                {/* Special Flash Sale Item */}
                <div className="mt-4">
                  <div className="relative overflow-hidden rounded-lg shadow-sm border border-cebleu-gold">
                    <div className="absolute -right-12 -top-12 transform rotate-45 w-24 h-24 bg-red-600 text-white"></div>
                    <div className="absolute right-1 top-1 transform rotate-45 text-[9px] font-bold text-white">
                      -40%
                    </div>

                    <div className="bg-gradient-to-r from-cebleu-gold-light to-cebleu-gold-light p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="animate-pulse inline-block w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                          <p className="text-xs font-bold text-red-600">
                            {t("common.flashSale")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                          <Clock className="w-3 h-3 text-red-600" />
                          <span className="text-[10px] font-bold text-gray-800">
                            {t("common.endsSoon")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden border border-white shadow-sm">
                          <img
                            src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=100&q=80"
                            alt="Flash sale product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {t("common.wirelessHeadset")}
                          </p>
                          <div className="flex items-baseline mt-1">
                            <span className="text-xs font-bold text-red-600">
                              €99.99
                            </span>
                            <span className="ml-1.5 text-[10px] line-through text-gray-500">
                              €169.99
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-red-600 h-1.5 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-[9px] text-gray-600 mt-1">
                        75% {t("common.claimed")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BestSellers;
