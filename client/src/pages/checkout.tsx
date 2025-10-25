// checkout.tsx
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(
  "pk_test_51KMzn1SHHfrH8iaca5YGz9YWQl1kU3Sw1UtfBm1u8TP7LAupLRpAIaaJdj12a3J6OYNHDxT3M3P1UCry3nAneJE600vYe8X0uE"
);

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  description: string;
  price: number;
  vendorId: string;
  images: { url: string }[];
  stock: number;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

function PaymentModal({
  isOpen,
  onClose,
  shippingAddress,
  total,
  cartItems,
  shippingOption,
  onPaymentSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  shippingAddress: ShippingAddress;
  total: number;
  cartItems: CartItem[];
  shippingOption: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const paymentMutation = useMutation({
  mutationFn: async () => {
    if (!stripe || !elements) throw new Error(t("payment.stripeNotReady"));

    const res = await fetch("/api/checkout/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        cartItems,
        shippingAddress,
        amount: total,
        currency: "usd",
        carrierId: shippingOption?.carrierId,
        zoneId: shippingOption?.zoneId,
        shippingOption: shippingOption
          ? {
              carrierName: shippingOption.carrierName ?? t("payment.unknownCarrier"),
              price: Number(shippingOption.price || 0),
              deliveryTime: shippingOption.deliveryTime ?? "",
            }
          : undefined,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || t("payment.createIntentFailed"));
    }

    const { clientSecret, paymentIntentId } = await res.json();

    if (!clientSecret) throw new Error(t("payment.missingClientSecret"));

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: {
              line1: shippingAddress.street,
              city: shippingAddress.city,
              postal_code: shippingAddress.zipCode,
              country: shippingAddress.state,
            },
          },
        },
      }
    );

    if (error) throw new Error(error.message);
    if (!paymentIntent || paymentIntent.status !== "succeeded")
      throw new Error(t("payment.notSucceeded"));

    return paymentIntent.id;
  },
  onSuccess: async (paymentIntentId) => {
    try {
      await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });

      toast({
        title: t("payment.successTitle"),
        description: t("payment.successDescription"),
      });

      onPaymentSuccess(paymentIntentId);
      onClose();
    } catch (err: any) {
      toast({
        title: t("payment.confirmErrorTitle"),
        description: err.message || t("payment.confirmErrorDescription"),
        variant: "destructive",
      });
    }
  },
  onError: (err: any) => {
    toast({
      title: t("payment.failedTitle"),
      description: err.message,
      variant: "destructive",
    });
  },
});


  const handlePayment = async () => {
    paymentMutation.mutate();
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t("paymentDetails.title")}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 p-4">
      <CardElement className="p-3 border rounded-md" />
      <Button
        onClick={handlePayment}
        disabled={paymentMutation.isPending}
        className="w-full"
      >
        {paymentMutation.isPending ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />{" "}
            {t("paymentDetails.processing")}
          </>
        ) : (
          `${t("paymentDetails.pay")} ${new Intl.NumberFormat("en-DZ", {
            style: "currency",
            currency: "DZD",
          }).format(total)}`
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>

  );
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingPrice = selectedOption ? Number(selectedOption.price) : 0;
  const total = subtotal + shippingPrice;
 const handlePaymentSuccess = (paymentIntentId: string) => {
  toast({
    title: t("checkout.orderSuccessTitle"),
    description: t("checkout.orderSuccessDescription"),
  });
  setLocation("/dashboard/client/orders");
};

const handlePlaceOrderClick = () => {
  if (!selectedOption) {
    toast({
      title: t("checkout.selectShippingTitle"),
      description: t("checkout.selectShippingDescription"),
      variant: "destructive",
    });
    return;
  }
  // open the payment modal (existing logic)
  setShowPaymentModal(true);
};
const { t } = useTranslation();
const handleCheckoutNext = async () => {
  if (!shippingAddress.city) {
    toast({
      title: t("checkout.missingInfoTitle"),
      description: t("checkout.missingInfoDescription"),
      variant: "destructive",
    });
    return;
  }

  try {
    setOptionsLoading(true);
    const res = await fetch(
      `/api/shipping/options-by-city?city=${encodeURIComponent(
        shippingAddress.city
      )}`
    );
    const data = await res.json();
    setShippingOptions(data.options || []);
    setStep(2);
  } catch (err: any) {
    toast({
      title: t("checkout.fetchErrorTitle"),
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setOptionsLoading(false);
  }
};


  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(price);

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
           {t("checkout.backToShopping")}
          </Button>
          <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
          <p className="text-gray-600 mt-2">{t("checkout.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Step-based shipping info & options */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />{t("checkout.shippingAddress")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.fullNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("checkout.email")}</Label>
                    <Input
                      id="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.emailPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.phonePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">{t("checkout.street")}</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          street: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.streetPlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("checkout.city")}</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                        placeholder={t("checkout.cityPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">{t("checkout.state")}</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        placeholder={t("checkout.statePlaceholder")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">{t("checkout.zipCode")}</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            zipCode: e.target.value,
                          }))
                        }
                        placeholder={t("checkout.zipPlaceholder")}
                      />
                    </div>
                    <div />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleCheckoutNext}
                      disabled={optionsLoading}
                    >
                      {optionsLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          {t("checkout.loadingOptions")}
                        </>
                      ) : (
                        t("checkout.next")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("checkout.selectShippingOption")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optionsLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-primary" />
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                     {t("checkout.noShippingOptions")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((opt) => (
                        <label
                          key={opt.carrierId}
                          className={`flex items-center justify-between border p-3 rounded-lg cursor-pointer ${
                            selectedOption?.carrierId === opt.carrierId
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingOption"
                              value={opt.carrierId}
                              checked={
                                selectedOption?.carrierId === opt.carrierId
                              }
                              onChange={() => setSelectedOption(opt)}
                              className="w-4 h-4"
                            />
                            <div>
                              <div className="font-medium">
                                {opt.carrierName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {opt.deliveryTime}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPrice(Number(opt.price || 0))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                     {t("checkout.back")}
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedOption(null);
                          setStep(1);
                        }}
                      >
                        {t("checkout.editAddress")}
                      </Button>
                      <Button
                        onClick={handlePlaceOrderClick}
                        disabled={!selectedOption}
                      >
                        {t("checkout.placeOrder")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="text-center space-y-4 py-12">
                <h2 className="text-2xl font-bold">
                  {t("checkout.thankYou")}
                </h2>
                <p className="text-muted-foreground">
                  {t("checkout.confirmationEmail")}
                </p>
              </div>
            )}
          </div>

          {/* Right column: Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("checkout.qty")}: {item.quantity}
                      </p>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t("checkout.shipping")}</span>
                  <span>{formatPrice(shippingPrice)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("checkout.total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        shippingAddress={shippingAddress}
        shippingOption={selectedOption}
        total={Math.round(total)} // integer amount
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Elements>
  );
}
