import React, { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Store,
  Check,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Product } from "@/types/product";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import ProductQA from "./ProductQA";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "./interface/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { add } from "date-fns";
import { Badge } from "@/components/ui/badge";
// interface Product {
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
interface ProductDetailsProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductDetails = ({ product, open, onClose }: ProductDetailsProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("No product selected");
      return apiRequest(
        "POST", // method
        `/api/cart/${product.id}`,
        { quantity: quantity }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: t("products.addedToCart"),
        description: product?.name ?? "",
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

  useEffect(() => {
    if (product) {
      setSelectedImage(
        product.images && product.images.length > 0
          ? product.images[0].url
          : product.image
      );
    }
  }, [product]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!product) return null;
  const getPlainText = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 mr-2"
              onClick={onClose}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-lg line-clamp-1">
              {product.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-square w-full max-w-2xl mx-auto relative rounded-lg overflow-hidden border border-cebleu-purple-200">
                <img
                  src={selectedImage ?? product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                        selectedImage === img.url
                          ? "border-cebleu-gold"
                          : "border-transparent hover:border-cebleu-purple-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-cebleu-purple-200 sticky top-20">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-cebleu-purple-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex gap-1">
                    {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-5 w-5 text-cebleu-purple-600" />
                    </Button> */}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-5 w-5 text-cebleu-purple-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-cebleu-gold fill-cebleu-gold" />
                    <span className="font-medium text-base ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-sm text-cebleu-purple-600">
                    ({product.reviews} {t("products.reviews")})
                  </span>
                </div>

                <div className="mb-6">
                  <span className="font-bold text-2xl text-cebleu-purple-900">
                    {product.currency}
                    {product.price}
                  </span>
                </div>

                <div className="space-y-6 mb-6">
                  {/* Product Options */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {t("products.color")}
                    </h4>
                    <RadioGroup
                      defaultValue="black"
                      className="flex flex-wrap gap-2"
                    >
                      <div className="flex flex-col items-center">
                        <RadioGroupItem
                          value="black"
                          id="black"
                          className="sr-only"
                        />
                        <label
                          htmlFor="black"
                          className="w-10 h-10 rounded-full bg-black cursor-pointer border-2 border-transparent data-[state=checked]:border-cebleu-gold"
                        />
                        <span className="text-xs mt-1">Black</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <RadioGroupItem
                          value="white"
                          id="white"
                          className="sr-only"
                        />
                        <label
                          htmlFor="white"
                          className="w-10 h-10 rounded-full bg-white cursor-pointer border-2 border-gray-200 data-[state=checked]:border-cebleu-gold"
                        />
                        <span className="text-xs mt-1">White</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <RadioGroupItem
                          value="blue"
                          id="blue"
                          className="sr-only"
                        />
                        <label
                          htmlFor="blue"
                          className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer border-2 border-transparent data-[state=checked]:border-cebleu-gold"
                        />
                        <span className="text-xs mt-1">Blue</span>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {t("products.quantity")}
                    </h4>
                    <div className="flex items-center border border-cebleu-purple-200 rounded-md w-fit">
                      <button
                        className="px-3 py-1 text-cebleu-purple-800 hover:bg-cebleu-purple-50"
                        onClick={decrementQuantity}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x border-cebleu-purple-200">
                        {quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-cebleu-purple-800 hover:bg-cebleu-purple-50"
                        onClick={incrementQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Delivery Info - Replace TruckDelivery with Truck */}
                  <div className="flex gap-2 items-start text-sm text-cebleu-purple-700">
                    <Truck className="h-5 w-5 text-cebleu-purple-700 mt-0.5" />
                    <div>
                      <p className="font-semibold">{product.delivery}</p>
                      <p className="text-xs">{t("products.deliveryNote")}</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 text-sm">
                    {product.stock === 0 ? (
                      <Badge
                        variant="destructive"
                        className="text-xs bg-red-100 text-red-600 border border-red-300"
                      >
                        {t("products.outOfStock", "Out of Stock")}
                      </Badge>
                    ) : (
                      <div>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {t("products.inStock")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {product.stock > 0 ? (
                    <Button
                      onClick={() => addToCartMutation.mutate()}
                      disabled={addToCartMutation.isPending}
                      className="w-full bg-gradient-to-r from-gold to-cebleu-gold-light text-cebleu-dark hover:from-cebleu-gold-light hover:to-cebleu-gold font-medium h-12 shadow-md"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {addToCartMutation.isPending
                        ? t("products.addingToCart")
                        : t("products.addToCart")}
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-9 text-xs sm:text-sm bg-gray-300 text-gray-600 font-medium rounded-md flex items-center justify-center cursor-not-allowed"
                      disabled
                    >
                      {t("products.unavailable", "Unavailable")}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-cebleu-purple-300 text-cebleu-purple-800 h-11"
                  >
                    <Store className="mr-2 h-5 w-5" />
                    {t("products.viewShop")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="description">
              <TabsList className="w-full border-b mb-6">
                <TabsTrigger value="description" className="text-base">
                  {t("products.description")}
                </TabsTrigger>
                <TabsTrigger value="specifications" className="text-base">
                  {t("products.specifications")}
                </TabsTrigger>
                <TabsTrigger value="qa" className="text-base">
                  {t("products.questionsAnswers")}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="text-cebleu-purple-700 space-y-4"
              >
                <h3 className="text-xl font-semibold text-cebleu-purple-800">
                  {t("products.productDescription")}
                </h3>
                <p>
                  {getPlainText(product.translations?.en?.description || "")}
                </p>
                <p>
                  {getPlainText(product.translations?.en?.description || "")}
                </p>{" "}
                {/* Repeated for demo purposes */}
              </TabsContent>

              <TabsContent
                value="specifications"
                className="text-cebleu-purple-700"
              >
                <h3 className="text-xl font-semibold text-cebleu-purple-800 mb-4">
                  {t("products.technicalDetails")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.brand")}
                      </span>
                      <span className="w-2/3">{product.brand}</span>
                    </div>
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.category")}
                      </span>
                      <span className="w-2/3">{product.categoryName}</span>
                    </div>
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.model")}
                      </span>
                      <span className="w-2/3">XZ-1000</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.warranty")}
                      </span>
                      <span className="w-2/3">12 {t("products.months")}</span>
                    </div>
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.color")}
                      </span>
                      <span className="w-2/3">Black</span>
                    </div>
                    <div className="flex py-2 border-b border-cebleu-purple-100">
                      <span className="font-medium w-1/3">
                        {t("products.weight")}
                      </span>
                      <span className="w-2/3">0.5 kg</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="qa">
                <ProductQA />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
