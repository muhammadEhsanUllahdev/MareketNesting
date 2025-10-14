import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Check,
  X,
  RefreshCcw,
  DollarSign,
  Truck,
  Phone,
  Mail,
  History,
  ShieldAlert,
  Ban,
  Unlock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ValidateOrderDialog from "./dialogs/ValidateOrderDialog";
import ShipOrderDialog from "./dialogs/ShipOrderDialog";
import RefundOrderDialog from "./dialogs/RefundOrderDialog";
import ContactCustomerDialog from "./dialogs/ContactCustomerDialog";
import FlagOrderDialog from "./dialogs/FlagOrderDialog";
import CustomerHistoryDialog from "./dialogs/CustomerHistoryDialog";

export interface UnifiedOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string;
}

export interface OrderAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface CarrierInfo {
  name: string;
  tracking_number?: string;
  tracking_url?: string;
  deliveryTime?: string;
}
export interface UnifiedOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_method: string;
  payment_method: string;
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  shippingOption: {
    carrierName: string;
    deliveryTime: string;
  };
  item_count: number;
  items: UnifiedOrderItem[];
  carrier?: CarrierInfo;
  notes?: string;
  priority?: "normal" | "urgent" | "suspicious";
  tags?: string[];
}
interface OrderAdvancedActionsProps {
  order: UnifiedOrder;
  onUpdateStatus?: (
    orderId: string,
    status: UnifiedOrder["status"]
  ) => Promise<void>;
  onUpdateCarrier?: (orderId: string, carrier: any) => Promise<void>;
}

const OrderAdvancedActions = ({
  order,
  onUpdateStatus,
  onUpdateCarrier,
}: OrderAdvancedActionsProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // Dialog handlers
  const handleValidateOrder = async (data: {
    priority: string;
    notes: string;
  }) => {
    await onUpdateStatus?.(order.id, "processing");
    console.log("Validate order with data:", data);
  };

  const handleShipOrder = async (data: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    notes: string;
  }) => {
    await onUpdateStatus?.(order.id, "shipped");
    await onUpdateCarrier?.(order.id, {
      name: data.carrier,
      tracking_number: data.trackingNumber,
      tracking_url: `https://tracking.example.com/${data.trackingNumber}`,
      estimated_delivery: data.estimatedDelivery,
    });
    console.log("Ship order with data:", data);
  };

  const handleRefundOrder = async (data: any) => {
    console.log("Refund order with data:", data);
  };

  const handleSendEmail = async (data: {
    subject: string;
    message: string;
    template: string;
  }) => {
    console.log("Send email with data:", data);
  };

  const handleInitiateCall = async (data: {
    reason: string;
    notes: string;
  }) => {
    console.log("Initiate call with data:", data);
  };

  const handleFlagOrder = async (data: any) => {
    console.log("Flag order with data:", data);
  };

  const handleAction = async (
    action: string,
    callback?: () => Promise<void>
  ) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      }
      toast({
        title: t("orderActions.success"),
        description: t(`orderActions.messages.${action}`),
      });
    } catch (error) {
      toast({
        title: t("orderActions.error.title"),
        description: t("orderActions.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusActions = () => {
    const actions = [];

    switch (order.status) {
      case "pending":
        actions.push(
          <DropdownMenuItem
            key="validate"
            onClick={() => setShowValidateDialog(true)}
            className="text-green-600"
          >
            <Check className="h-4 w-4 mr-2" />
            {t("orderActions.validate")}
          </DropdownMenuItem>
        );
        break;

      case "processing":
        actions.push(
          <DropdownMenuItem
            key="ship"
            onClick={() => setShowShipDialog(true)}
            className="text-blue-600"
          >
            <Truck className="h-4 w-4 mr-2" />
            {t("orderActions.ship")}
          </DropdownMenuItem>
        );
        break;

      case "shipped":
        actions.push(
          <DropdownMenuItem
            key="deliver"
            onClick={() =>
              handleAction("deliver", async () => {
                await onUpdateStatus?.(order.id, "delivered");
              })
            }
            className="text-green-600"
          >
            <Check className="h-4 w-4 mr-2" />
            {t("orderActions.deliver")}
          </DropdownMenuItem>
        );
        break;
    }

    if (order.payment_status === "failed") {
      actions.push(
        <DropdownMenuItem
          key="retry"
          onClick={() => handleAction("retry_payment")}
          className="text-orange-600"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          {t("orderActions.retryPayment")}
        </DropdownMenuItem>
      );
    }

    return actions;
  };

  const getFinancialActions = () => [
    <DropdownMenuItem
      key="refund"
      onClick={() => setShowRefundDialog(true)}
      className="text-purple-600"
    >
      <DollarSign className="h-4 w-4 mr-2" />
      {t("orderActions.refund")}
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="freeze"
      onClick={() => handleAction("freeze")}
      className="text-yellow-600"
    >
      <Ban className="h-4 w-4 mr-2" />
      {t("orderActions.freeze")}
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="unfreeze"
      onClick={() => handleAction("unfreeze")}
      className="text-green-600"
    >
      <Unlock className="h-4 w-4 mr-2" />
      {t("orderActions.unfreeze")}
    </DropdownMenuItem>,
  ];

  const getCustomerActions = () => [
    <DropdownMenuItem key="contact" onClick={() => setShowContactDialog(true)}>
      <Mail className="h-4 w-4 mr-2" />
      {t("orderActions.contact")}
    </DropdownMenuItem>,
    <DropdownMenuItem key="call" onClick={() => setShowContactDialog(true)}>
      <Phone className="h-4 w-4 mr-2" />
      {t("orderActions.call")}
    </DropdownMenuItem>,
    <DropdownMenuItem key="history" onClick={() => setShowHistoryDialog(true)}>
      <History className="h-4 w-4 mr-2" />
      {t("orderActions.history")}
    </DropdownMenuItem>,
  ];

  const getSecurityActions = () => [
    <DropdownMenuItem
      key="flag"
      onClick={() => setShowFlagDialog(true)}
      className="text-red-600"
    >
      <ShieldAlert className="h-4 w-4 mr-2" />
      {t("orderActions.flag")}
    </DropdownMenuItem>,
  ];

  const getPriorityBadge = () => {
    if (!order.priority || order.priority === "normal") return null;

    const variants = {
      urgent: {
        className: "bg-orange-100 text-orange-800",
        label: t("orderActions.priority.urgent"),
      },
      suspicious: {
        className: "bg-red-100 text-red-800",
        label: t("orderActions.priority.suspicious"),
      },
    };

    const variant = variants[order.priority];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="flex items-center gap-2">
      {getPriorityBadge()}

      {order.shippingOption.carrierName && (
        <Badge variant="outline" className="text-blue-600">
          <Truck className="h-3 w-3 mr-1" />
          {order.shippingOption.carrierName}
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {getStatusActions()}
          {getStatusActions().length > 0 && <DropdownMenuSeparator />}
          {getFinancialActions()}
          <DropdownMenuSeparator />
          {getCustomerActions()}
          <DropdownMenuSeparator />
          {getSecurityActions()}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              handleAction("cancel", async () => {
                await onUpdateStatus?.(order.id, "cancelled");
              })
            }
          >
            <X className="h-4 w-4 mr-2" />
            {t("orderActions.cancel")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <ValidateOrderDialog
        open={showValidateDialog}
        onOpenChange={setShowValidateDialog}
        orderNumber={order.order_number}
        onConfirm={handleValidateOrder}
      />
      <ShipOrderDialog
        open={showShipDialog}
        onOpenChange={setShowShipDialog}
        orderNumber={order.order_number}
        orderCarrier={order.shippingOption.carrierName || ""}
        estimatedDeliveryDate={order.shippingOption.deliveryTime || ""}
        orderId={order.id}
        onConfirm={handleShipOrder}
      />
      <RefundOrderDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        orderNumber={order.order_number}
        totalAmount={order.total_amount}
        orderId={order.id}
        onConfirm={handleRefundOrder}
      />
      <ContactCustomerDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        orderNumber={order.order_number}
        customerName={order.customer_name}
        customerEmail={order.customer_email}
        customerPhone={order.customer_phone}
        onSendEmail={handleSendEmail}
        onInitiateCall={handleInitiateCall}
      />
      <FlagOrderDialog
        open={showFlagDialog}
        onOpenChange={setShowFlagDialog}
        orderNumber={order.order_number}
        orderId={order.id}
        customerName={order.customer_name}
        onConfirm={handleFlagOrder}
      />
      <CustomerHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        customerId={order.customer_id}
        customerName={order.customer_name}
        customerEmail={order.customer_email}
      />
    </div>
  );
};

export default OrderAdvancedActions;
