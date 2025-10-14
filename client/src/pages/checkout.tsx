// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useAuth } from "@/hooks/use-auth";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
// import { useLocation } from "wouter";
// import {
//   CreditCard,
//   MapPin,
//   Package,
//   ArrowLeft,
//   Phone,
//   User,
// } from "lucide-react";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const stripePromise = loadStripe(
//   "pk_test_51KMzn1SHHfrH8iaca5YGz9YWQl1kU3Sw1UtfBm1u8TP7LAupLRpAIaaJdj12a3J6OYNHDxT3M3P1UCry3nAneJE600vYe8X0uE"
// );

// interface CartItem {
//   id: string;
//   productId: string;
//   quantity: number;
//   name: string;
//   description: string;
//   price: number;
//   images: { url: string }[];
//   stock: number;
// }

// interface ShippingAddress {
//   fullName: string;
//   email: string;
//   phone: string;
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   // country: string;
// }

// function PaymentModal({
//   isOpen,
//   onClose,
//   shippingAddress,
//   total,
//   cartItems,
//   onPaymentSuccess,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   shippingAddress: ShippingAddress;
//   total: number;
//   cartItems: CartItem[];
//   onPaymentSuccess: (paymentIntentId: string) => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { toast } = useToast();

//   const paymentMutation = useMutation({
//     mutationFn: async () => {
//       if (!stripe || !elements) throw new Error("Stripe not ready");

//       const res = await fetch("/api/checkout/payment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           cartItems,
//           shippingAddress,
//           amount: total,
//           currency: "usd",
//         }),
//       });
//       const { clientSecret } = await res.json();
//       if (!clientSecret) throw new Error("No client secret received");

//       const cardElement = elements.getElement(CardElement);
//       // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//       //   payment_method: { card: cardElement! },
//       // });

//       const { error, paymentIntent } = await stripe.confirmCardPayment(
//         clientSecret,
//         {
//           payment_method: {
//             card: cardElement!,
//             billing_details: {
//               name: shippingAddress.fullName,
//               email: shippingAddress.email,
//               phone: shippingAddress.phone,
//               address: {
//                 line1: shippingAddress.street,
//                 city: shippingAddress.city,
//                 country: shippingAddress.state,
//                 postal_code: shippingAddress.zipCode,
//                 // country: shippingAddress.country,
//               },
//             },
//           },
//         }
//       );

//       if (error) throw new Error(error.message);
//       if (!paymentIntent || paymentIntent.status !== "succeeded")
//         throw new Error("Payment did not succeed");

//       return paymentIntent.id;
//     },
//     // onSuccess: (paymentIntentId) => {
//     //   toast({
//     //     title: "Payment Successful",
//     //     description: "Your payment has been processed.",
//     //   });
//     //   onPaymentSuccess(paymentIntentId);
//     //   onClose();
//     // },
//     onSuccess: async (paymentIntentId) => {
//       try {
//         // ✅ Ask backend to verify and update DB
//         await fetch("/api/checkout/confirm", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ paymentIntentId }),
//         });

//         // ✅ Show success UI
//         toast({
//           title: "Payment Successful",
//           description: "Your payment has been processed.",
//         });

//         // ✅ Let parent know payment succeeded
//         onPaymentSuccess(paymentIntentId);

//         // ✅ Close modal
//         onClose();
//       } catch (err: any) {
//         toast({
//           title: "Payment Confirm Error",
//           description: err.message || "Failed to confirm payment with server.",
//           variant: "destructive",
//         });
//       }
//     },
//     onError: (err: any) => {
//       toast({
//         title: "Payment Failed",
//         description: err.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const handlePayment = () => {
//     paymentMutation.mutate();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Enter Card Details</DialogTitle>
//         </DialogHeader>
//         <div className="p-4 space-y-4">
//           <CardElement className="p-2 border rounded" />
//           <Button
//             onClick={handlePayment}
//             disabled={paymentMutation.isPending}
//             className="w-full"
//           >
//             {paymentMutation.isPending
//               ? "Processing..."
//               : `Pay ${new Intl.NumberFormat("en-DZ", {
//                   style: "currency",
//                   currency: "DZD",
//                 }).format(total)}`}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function CheckoutPage() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [, setLocation] = useLocation();
//   const queryClient = useQueryClient();

//   const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
//     fullName: "",
//     email: "",
//     phone: "",
//     street: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     // country: "",
//   });

//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   // Fetch cart items
//   const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
//     queryKey: ["/api/cart"],
//     enabled: !!user,
//   });

//   // Calculate totals
//   const subtotal = cartItems.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );
//   const shipping = 500;
//   const total = subtotal + shipping;

//   // Checkout mutation
//   const checkoutMutation = useMutation({
//     mutationFn: async (checkoutData: {
//       shippingAddress: ShippingAddress;
//       paymentIntentId: string;
//       cartItems: CartItem[];
//       amount: number;
//     }) => {
//       const response = await fetch("/api/checkout", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(checkoutData),
//       });
//       if (!response.ok) throw new Error("Failed to process checkout");
//       return response.json();
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
//       toast({
//         title: "Order Placed Successfully!",
//         description: `Your order #${data.order.orderNumber} has been confirmed.`,
//       });
//       setLocation("/dashboard/client/orders");
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Checkout Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const handleCheckout = () => {
//     if (
//       !shippingAddress.fullName ||
//       !shippingAddress.phone ||
//       !shippingAddress.street ||
//       !shippingAddress.city ||
//       !shippingAddress.zipCode
//     ) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }
//     setShowPaymentModal(true);
//   };

//   // const handlePaymentSuccess = (paymentIntentId: string) => {
//   //   checkoutMutation.mutate({
//   //     shippingAddress,
//   //     paymentIntentId,
//   //     cartItems, // include the cart items
//   //     amount: total, // include the total amount
//   //   });
//   // };
//   const handlePaymentSuccess = (paymentIntentId: string) => {
//     toast({
//       title: "Order Placed Successfully!",
//       description: "Your order has been confirmed.",
//     });
//     setLocation("/dashboard/client/orders");
//   };

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat("en-DZ", {
//       style: "currency",
//       currency: "DZD",
//     }).format(price);

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!user) setLocation("/auth");
//   }, [user, setLocation]);

//   if (!user) return null;
//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
//         <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
//       </div>
//     );
//   }
//   if (cartItems.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8 text-center">
//         <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//         <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
//         <p className="text-gray-600 mb-6">
//           Add some items to your cart before checking out.
//         </p>
//         <Button onClick={() => setLocation("/")} className="gap-2">
//           <ArrowLeft className="w-4 h-4" />
//           Continue Shopping
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <Elements stripe={stripePromise}>
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-6">
//           <Button
//             variant="ghost"
//             onClick={() => setLocation("/")}
//             className="gap-2 mb-4"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Shopping
//           </Button>
//           <h1 className="text-3xl font-bold">Checkout</h1>
//           <p className="text-gray-600 mt-2">Complete your order below</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Shipping Address */}
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <MapPin className="w-5 h-5" /> Shipping Address
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="fullName">Full Name</Label>
//                   <Input
//                     id="fullName"
//                     value={shippingAddress.fullName}
//                     onChange={(e) =>
//                       setShippingAddress((p) => ({
//                         ...p,
//                         fullName: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter your full name"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     value={shippingAddress.email}
//                     onChange={(e) =>
//                       setShippingAddress((p) => ({
//                         ...p,
//                         email: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter your Email Address"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     value={shippingAddress.phone}
//                     onChange={(e) =>
//                       setShippingAddress((p) => ({
//                         ...p,
//                         phone: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter your phone number"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="street">Street Address</Label>
//                   <Input
//                     id="street"
//                     value={shippingAddress.street}
//                     onChange={(e) =>
//                       setShippingAddress((p) => ({
//                         ...p,
//                         street: e.target.value,
//                       }))
//                     }
//                     placeholder="Street Address"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="city">City</Label>
//                     <Input
//                       id="city"
//                       value={shippingAddress.city}
//                       onChange={(e) =>
//                         setShippingAddress((p) => ({
//                           ...p,
//                           city: e.target.value,
//                         }))
//                       }
//                       placeholder="City"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="state">State/Province</Label>
//                     <Input
//                       id="state"
//                       value={shippingAddress.state}
//                       onChange={(e) =>
//                         setShippingAddress((p) => ({
//                           ...p,
//                           state: e.target.value,
//                         }))
//                       }
//                       placeholder="CA"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="zipCode">ZIP/Postal Code</Label>
//                     <Input
//                       id="zipCode"
//                       value={shippingAddress.zipCode}
//                       onChange={(e) =>
//                         setShippingAddress((p) => ({
//                           ...p,
//                           zipCode: e.target.value,
//                         }))
//                       }
//                       placeholder="ZIP Code"
//                     />
//                   </div>
//                   {/* <div>
//                     <Label htmlFor="country">Country</Label>
//                     <Input
//                       id="country"
//                       value={shippingAddress.country}
//                       onChange={(e) => setShippingAddress((p) => ({ ...p, country: e.target.value }))}
//                       placeholder="Country"
//                     />
//                   </div> */}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Order Summary */}
//           <div>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Order Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {cartItems.map((item) => (
//                   <div key={item.id} className="flex gap-3">
//                     <img
//                       src={item.images?.[0]?.url || "/placeholder.jpg"}
//                       alt={item.name}
//                       className="w-16 h-16 object-cover rounded"
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-medium text-sm truncate">
//                         {item.name}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         Qty: {item.quantity}
//                       </p>
//                       <p className="font-semibold text-sm">
//                         {formatPrice(item.price * item.quantity)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 <Separator />
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>{formatPrice(subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping</span>
//                   <span>{formatPrice(shipping)}</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between text-lg font-semibold">
//                   <span>Total</span>
//                   <span>{formatPrice(total)}</span>
//                 </div>
//                 <Button
//                   onClick={handleCheckout}
//                   disabled={checkoutMutation.isPending}
//                   className="w-full"
//                   size="lg"
//                 >
//                   {checkoutMutation.isPending
//                     ? "Processing..."
//                     : `Place Order • ${formatPrice(total)}`}
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//       <PaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         shippingAddress={shippingAddress}
//         total={total}
//         cartItems={cartItems}
//         onPaymentSuccess={handlePaymentSuccess}
//       />
//     </Elements>
//   );
// }
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

  const [loading, setLoading] = useState(false);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe not ready");

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
                carrierName: shippingOption.carrierName ?? "Unknown Carrier",
                price: Number(shippingOption.price || 0),
                deliveryTime: shippingOption.deliveryTime ?? "",
              }
            : undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create PaymentIntent");
      }

      const { clientSecret, paymentIntentId } = await res.json();

      if (!clientSecret) throw new Error("Missing client secret");

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
        throw new Error("Payment did not succeed");

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
          title: "Payment Successful",
          description: "Your payment has been processed.",
        });

        onPaymentSuccess(paymentIntentId);

        onClose();
      } catch (err: any) {
        toast({
          title: "Payment Confirm Error",
          description: err.message || "Failed to confirm payment with server.",
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = async () => {
    paymentMutation.mutate();
    // if (!stripe || !elements) return;

    // setLoading(true);
    // try {
    //   // 1️⃣ Create PaymentIntent + order on backend
    //   const res = await fetch("/api/checkout/payment", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     credentials: "include",
    //     body: JSON.stringify({
    //       cartItems,
    //       shippingAddress,
    //       amount: total,
    //       currency: "usd",
    //       carrierId: shippingOption?.carrierId,
    //       zoneId: shippingOption?.zoneId,
    //       shippingOption: shippingOption
    //         ? {
    //             carrierName: shippingOption.carrierName ?? "Unknown Carrier",
    //             price: Number(shippingOption.price || 0),
    //             deliveryTime: shippingOption.deliveryTime ?? "",
    //           }
    //         : undefined,
    //     }),
    //   });

    //   if (!res.ok) {
    //     const text = await res.text();
    //     throw new Error(text || "Failed to create PaymentIntent");
    //   }

    //   const { clientSecret, paymentIntentId } = await res.json();

    //   if (!clientSecret) throw new Error("Missing client secret");

    //   // 2️⃣ Confirm card payment
    //   const cardElement = elements.getElement(CardElement);
    //   const { error, paymentIntent } = await stripe.confirmCardPayment(
    //     clientSecret,
    //     {
    //       payment_method: {
    //         card: cardElement!,
    //         billing_details: {
    //           name: shippingAddress.fullName,
    //           email: shippingAddress.email,
    //           phone: shippingAddress.phone,
    //           address: {
    //             line1: shippingAddress.street,
    //             city: shippingAddress.city,
    //             postal_code: shippingAddress.zipCode,
    //             country: shippingAddress.state,
    //           },
    //         },
    //       },
    //     }
    //   );

    //   if (error) throw new Error(error.message);
    //   if (paymentIntent?.status !== "succeeded")
    //     throw new Error("Payment did not succeed");

    //   // 3️⃣ Confirm with backend
    //   await fetch("/api/checkout/confirm", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ paymentIntentId }),
    //   });

    //   toast({
    //     title: "Payment Successful",
    //     description: "Your order has been confirmed and paid.",
    //   });

    //   onPaymentSuccess(paymentIntentId);
    //   onClose();
    // } catch (err: any) {
    //   console.error("Payment error:", err);
    //   toast({
    //     title: "Payment Failed",
    //     description: err?.message || "Something went wrong during payment.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
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
                <Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing...
              </>
            ) : (
              `Pay ${new Intl.NumberFormat("en-DZ", {
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

  // const handlePaymentComplete = async (orderId: string) => {
  //   toast({
  //     title: "Order Confirmed!",
  //     description: `Your order #${orderId} has been placed successfully.`,
  //   });
  //   setLocation("/dashboard/client/orders");
  // };
  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: "Order Placed Successfully!",
      description: "Your order has been confirmed.",
    });
    setLocation("/dashboard/client/orders");
  };
  const handlePlaceOrderClick = () => {
    if (!selectedOption) {
      toast({
        title: "Select a shipping option",
        description: "Please choose one shipping option to continue.",
        variant: "destructive",
      });
      return;
    }
    // open the payment modal (existing logic)
    setShowPaymentModal(true);
  };

  const handleCheckoutNext = async () => {
    if (!shippingAddress.city) {
      toast({
        title: "Missing Info",
        description: "Please fill out the shipping address first.",
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
        title: "Failed to fetch shipping options",
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
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Step-based shipping info & options */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter your Email Address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress((p) => ({
                          ...p,
                          street: e.target.value,
                        }))
                      }
                      placeholder="Street Address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress((p) => ({
                            ...p,
                            zipCode: e.target.value,
                          }))
                        }
                        placeholder="ZIP Code"
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
                          Loading options...
                        </>
                      ) : (
                        "Next"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Shipping Option</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optionsLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-primary" />
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No shipping options available for this city.
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
                      Back
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedOption(null);
                          setStep(1);
                        }}
                      >
                        Edit Address
                      </Button>
                      <Button
                        onClick={handlePlaceOrderClick}
                        disabled={!selectedOption}
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="text-center space-y-4 py-12">
                <h2 className="text-2xl font-bold">
                  Thank you — order placed!
                </h2>
                <p className="text-muted-foreground">
                  We emailed you order confirmation.
                </p>
              </div>
            )}
          </div>

          {/* Right column: Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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
                        Qty: {item.quantity}
                      </p>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingPrice)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {/* If user hasn't advanced to shipping options, show Next/Place depending on step */}
                {/* {step === 1 && (
                  <Button onClick={handleCheckoutNext} className="w-full">
                    Next
                  </Button>
                )}
                {step === 2 && (
                  <Button
                    onClick={handlePlaceOrderClick}
                    disabled={!selectedOption}
                    className="w-full"
                  >
                    Place Order • {formatPrice(total)}
                  </Button>
                )} */}
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
