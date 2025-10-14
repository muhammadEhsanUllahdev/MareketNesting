import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Link } from "wouter";

export default function CartPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart"] }),
  });

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    updateQuantityMutation.mutate({ productId: id, quantity: qty });
  };

  const removeItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
    }).format(price);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  //   const discount = 34375;
  const total = subtotal;

  return (
    <DashboardLayout title={t("cart.title")}>
      <div className="container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <p>{t("common.loading")}</p>
          ) : cartItems.length === 0 ? (
            <p>{t("cart.empty.title")}</p>
          ) : (
            cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-600 font-semibold">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
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
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("cart.summary")}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {/* <div className="flex justify-between text-green-600">
                  <span>{t("cart.discount")}</span>
                  <span>-{formatPrice(discount)}</span>
                </div> */}
                <div className="flex justify-between">
                  <span>{t("cart.shipping")}</span>
                  <span className="text-green-600">
                    {t("cart.shipping.free")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t("cart.total")}</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button
                className="w-full mt-4"
                size="lg">
                {t("cart.checkout")}
              </Button>
              </Link>
            
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
