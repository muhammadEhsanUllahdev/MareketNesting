import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "wouter";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  stock: number;
  createdAt: string;
}

interface CartComponentProps {
  className?: string;
}

export default function CartComponent({ className }: CartComponentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("cart.error.fetchFailed"));
      return response.json();
    },
    enabled: !!user,
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
  mutationFn: async ({
    productId,
    quantity,
  }: {
    productId: string;
    quantity: number;
  }) => {
    const response = await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error(t("cart.error.updateQuantity"));
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  },
  onError: () => {
    toast({
      title: t("cart.toast.error.title"),
      description: t("cart.toast.error.updateQuantity"),
      variant: "destructive",
    });
  },
});


  // Remove item from cart
 const removeItemMutation = useMutation({
  mutationFn: async (productId: string) => {
    const response = await fetch(`/api/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error(t("cart.error.removeItem"));
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    toast({
      title: t("cart.toast.success.title"),
      description: t("cart.toast.success.removeItem"),
    });
  },
  onError: () => {
    toast({
      title: t("cart.toast.error.title"),
      description: t("cart.toast.error.removeItem"),
      variant: "destructive",
    });
  },
});


  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const removeItem = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const cartItemCount = getTotalItems();
  const totalPrice = getTotalPrice();
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={`relative ${className}`}>
          <ShoppingCart className="h-4 w-4" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("cart.title")} ({t("cart.subtotal")} {cartItemCount}{" "}
            {t("cart.items")} )
          </SheetTitle>
          <SheetDescription>{t("cart.description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("cart.empty.title")}
              </h3>
              <p className="text-gray-600 mb-4">{t("cart.empty.subtitle")}</p>
              <Button onClick={() => setIsOpen(false)}>
                {t("cart.empty.button")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.images?.[0]?.url || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-blue-600">
                            {formatPrice(item.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                updateQuantityMutation.isPending
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >= item.stock ||
                                updateQuantityMutation.isPending
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        disabled={removeItemMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {t("cart.subtotal")}:{" "}
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.stock < 5 && (
                        <Badge variant="destructive" className="text-xs">
                          {t("cart.onlyLeft", { count: item.stock })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t("cart.subtotal")}: {cartItemCount} {t("cart.items")}
                </span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("cart.shipping")}</span>
                <span className="text-green-600">
                  {t("cart.shipping.free")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t("cart.total")}</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link href="/checkout">
                <Button
                  className="w-full"
                  size="lg"
                  // onClick={() => (window.location.href = "/checkout")}
                  data-testid="button-proceed-checkout"
                >
                  {t("cart.checkout")} • {formatPrice(totalPrice)}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                {t("cart.empty.button")}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
