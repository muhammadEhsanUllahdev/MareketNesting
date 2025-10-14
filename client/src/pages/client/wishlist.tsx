import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Heart,
  ShoppingCart,
  Info,
  Star,
  Plus,
  Minus,
  Shield,
  Truck,
  MessageCircle,
  ThumbsUp,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiRequest } from "@/lib/queryClient";

interface WishlistProduct {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: { id: string; url: string }[];
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  sku: string;
  weight?: string;
  category: string;
  categoryName: string;
  isNew?: boolean;
  // inStock: boolean;
  description?: string;
  isActive: boolean;
  specifications?: Array<{ name: string; value: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
    helpful: number;
  }>;
}

export default function WishlistPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] =
    useState<WishlistProduct | null>(null);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [newQuestion, setNewQuestion] = useState("");

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistProduct[]>({
    queryKey: ["/api/wishlist"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("wishlist.errors.fetch"));
      return response.json();
    },
    enabled: !!user,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("wishlist.errors.remove"));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: t("common.success"),
        description: t("wishlist.messages.removed"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("wishlist.errors.remove"),
        variant: "destructive",
      });
    },
  });



  const addToCartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => apiRequest("POST", `/api/cart/${productId}`, { quantity }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: t("products.addedToCart"),
        description: t("wishlist.productAdded", {
          productId: variables.productId,
        }),
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: t("cart.errors.add"),
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const getQuantity = (productId: string) => productQuantities[productId] || 1;

  const updateQuantity = (productId: string, change: number) => {
    const currentQuantity = getQuantity(productId);
    const newQuantity = Math.max(1, currentQuantity + change);
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = (productId: string) => {
    const quantity = getQuantity(productId);
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  function getTranslatedField(wishlist: any, field: string, language: string) {
    const translation = wishlist.translations.find(
      (tr: any) => tr.language === language
    );
    return translation?.[field] || wishlist[field] || "";
  }

  function getTranslatedCategory(obj: any, field: string, language: string) {
    const target = obj?.[field];
    if (!target) return "";

    // If it has translations array
    if (target.translations) {
      const translation = target.translations.find(
        (tr: any) => tr.language === language
      );
      return translation?.name || "";
    }

    return target;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("auth.signInRequired")}
          </h1>
          <p className="text-gray-600">{t("wishlist.signInMessage")}</p>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <DashboardLayout title={t("wishlist.title")}>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("wishlist.title")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("wishlist.productsInList", { count: wishlistItems.length })}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("wishlist.emptyTitle")}
              </h2>
              <p className="text-gray-600 mb-8">{t("wishlist.emptyMessage")}</p>
              {/* <Button>{t("wishlist.browseProducts")}</Button> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    {product.isNew && (
                      <Badge className="absolute top-3 left-3 bg-green-500">
                        {t("common.new")}
                      </Badge>
                    )}
                    {product.stock == 0 && (
                      <Badge className="absolute top-3 right-3 bg-red-500">
                        {t("common.outOfStock")}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleRemoveFromWishlist(product.productId)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {getTranslatedField(product, "name", i18n.language) ||
                          product.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {product.brand} •{" "}
                      <span className="capitalize">
                        {getTranslatedCategory(
                          product,
                          "category",
                          i18n.language
                        ) || product.category}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">
                        {t("common.inStock")}
                      </span>
                      <Badge
                        variant={product.stock > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {product.stock > 0
                          ? t("common.available", { count: product.stock })
                          : t("common.outOfStock")}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.productId)}
                      disabled={
                        getQuantity(product.id) > product.stock ||
                        product.stock <= 0
                      }
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t("common.addToCart")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Product Details Modal */}
          <Dialog
            open={!!selectedProduct}
            onOpenChange={() => setSelectedProduct(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedProduct && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {" "}
                      {getTranslatedField(
                        selectedProduct,
                        "name",
                        i18n.language
                      ) || selectedProduct.name}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <img
                        src={selectedProduct.images[0].url}
                        alt={selectedProduct.name}
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      {selectedProduct.isNew && (
                        <Badge className="absolute top-3 left-3 bg-green-500">
                          {t("common.new")}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {renderStars(selectedProduct.rating)}
                        <span className="text-sm text-gray-600">
                          ({selectedProduct.reviewCount} {t("product.reviews")})
                        </span>
                      </div>

                      <div className="text-3xl font-bold text-blue-600">
                        {formatPrice(selectedProduct.price)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {t("product.brand")}:
                          </span>
                          <span>{selectedProduct.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {t("product.stockAvailable")}:
                          </span>
                          <span>{selectedProduct.stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {t("product.sku")}:
                          </span>
                          <span>{selectedProduct.sku}</span>
                        </div>
                        {selectedProduct.weight && (
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("product.weight")}:
                            </span>
                            <span>{selectedProduct.weight}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <Label>{t("product.quantity")}:</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(selectedProduct.id, -1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {getQuantity(selectedProduct.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(selectedProduct.id, 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(selectedProduct.id)}
                          disabled={
                            getQuantity(selectedProduct.id) >
                              selectedProduct.stock ||
                            selectedProduct.stock <= 0
                          }
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t("common.addToCart")}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">
                            {t("product.guarantee")}
                          </span>
                        </div>
                        <p className="text-sm text-blue-600">
                          {t("product.guaranteeMessage")}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <Truck className="h-5 w-5" />
                          <span className="font-medium">
                            {t("product.delivery")}
                          </span>
                        </div>
                        <p className="text-sm text-green-600">
                          {t("product.deliveryMessage")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="description" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="description">
                        {t("product.description")}
                      </TabsTrigger>
                      <TabsTrigger value="reviews">
                        {t("product.reviews")} ({selectedProduct.reviewCount})
                      </TabsTrigger>
                      <TabsTrigger value="questions">
                        {t("product.qa")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-4">
                      <div className="prose max-w-none">
                        <p>
                          {selectedProduct.description ||
                            t("product.noDescription")}
                        </p>

                        {selectedProduct.specifications &&
                          selectedProduct.specifications.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">
                                {t("product.specifications")}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedProduct.specifications.map(
                                  (spec: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <span className="font-medium">
                                        {spec.name}:
                                      </span>
                                      <span>{spec.value}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4">
                      <div className="space-y-4">
                        {selectedProduct.reviews?.length ? (
                          selectedProduct.reviews.map((review: any) => (
                            <div key={review.id} className="border-b pb-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {review.userName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {review.userName}
                                      </span>
                                      {review.verified && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {t("product.verifiedPurchase")}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {renderStars(review.rating)}
                                      <span className="text-sm text-gray-500 ml-2">
                                        {review.date}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">
                                {review.comment}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {t("product.useful", {
                                  count: review.helpful,
                                })}
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            {t("product.noReviews")}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="questions" className="mt-4">
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {t("product.askQuestion")}
                          </h4>
                          <Textarea
                            placeholder={t("product.askQuestionPlaceholder")}
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="mb-2"
                          />
                          <Button size="sm">
                            {t("product.submitQuestion")}
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">
                            {t("product.faq")}
                          </h4>
                          <div className="space-y-4">
                            {selectedProduct.faqs?.length ? (
                              selectedProduct.faqs.map(
                                (faq: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border"
                                  >
                                    <h5 className="font-medium mb-2">
                                      {faq.question}
                                    </h5>
                                    <p className="text-gray-700">
                                      {faq.answer}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 mt-2"
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      {t("product.usefulGeneric")}
                                    </Button>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-gray-500">
                                {t("product.noFaq")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </DashboardLayout>
  );
}
