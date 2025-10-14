import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Store,
  Building2,
  MoreVertical,
  CheckCircle,
  X,
  FileText,
  Ban,
  Pause,
  AlertTriangle,
  MessageCircle,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  Eye,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertStoreSchema } from "@shared/schema";
import type { Store as StoreType } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
 
// Enhanced store data type for the UI
interface StoreWithDetails extends StoreType {
  name: string;
  description: string;
  ownerName?: string;
  ownerEmail?: string;
  categoryName?: string;
  ownerPhone: string;
  website: string;
  taxId: string;
  ownerAddressStreet: string;
  ownerAddressCity: string;
  ownerAddressZipCode: string;
  ownerAddressCountry: string;
}

const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  ownerPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  taxId: z.string().optional(),
  ownerAddressStreet: z.string().optional(),
  ownerAddressCity: z.string().optional(),
  ownerAddressZipCode: z.string().optional(),
  ownerAddressCountry: z.string().optional(),
});

type CreateStoreFormData = z.infer<typeof createStoreSchema>;

// Send message form schema
// const sendMessageSchema = z.object({
//   messageType: z.string().min(1, "Message type is required"),
//   messageContent: z.string().min(1, "Message content is required"),
// });



// type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export default function StoreManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const sendMessageSchema = z.object({
  messageType: z.string().min(1, { message: t("validation.messageTypeRequired") }),
  messageContent: z.string().min(1, { message: t("validation.messageContentRequired") }),
});
type SendMessageFormData = z.infer<typeof sendMessageSchema>;
  const [selectedStore, setSelectedStore] = useState<StoreWithDetails | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [sendMessageStore, setSendMessageStore] =
    useState<StoreWithDetails | null>(null);
 
async function getStoreStats() {
  // Client-side helper to fetch store statistics from the server API
  const res = await fetch("/api/admin/stores/stats", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch store stats");
  }
  return res.json();
}

  // 🟢 Add your useQuery HERE — inside the component, before the return()
  const { data: storeStats = {
    totalStores: 0,
    activeStores: 0,
    onHoldStores: 0,
    totalRevenue: "0"
  } } = useQuery({
    queryKey: ["/api/admin/stores/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stores/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch store stats");
      return res.json();
    },
  });
    

  // // Fetch store statistics
  // const { data: storeStats } = useQuery<{
  //   totalStores: number;
  //   activeStores: number;
  //   onHoldStores: number;
  //   totalRevenue: string;
  // }>({
  //   queryKey: ["/api/admin/stores/stats"],
  // });

  // Fetch all stores
  const { data: stores = [], isLoading } = useQuery<StoreWithDetails[]>({
    queryKey: ["/api/admin/stores"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Fetch categories for the add store form
  const { data: categories = [] } = useQuery<
    Array<{ id: string; name: string }>
  >({
    queryKey: ["/api/categories"],
  });

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: async (data: CreateStoreFormData) => {
      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t("store.create.failed"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores/stats"] });
      toast({
        title: t("store.create.success.title"),
        description: t("store.create.success.description"),
      });
      setShowAddModal(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t("store.create.failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ✅ Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/admin/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(t("store.update.failed"));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores/stats"] });
      toast({
        title: t("store.update.success.title"),
        description: t("store.update.success.description"),
      });
    },
    onError: () => {
      toast({
        title: t("store.update.failed"),
        description: t("store.update.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      ownerEmail: "",
      categoryId: "",
      description: "",
    },
  });

  // Form for sending messages
  const messageForm = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      messageType: "",
      messageContent: "",
    },
  });

  const handleStoreAction = (store: StoreWithDetails, action: string) => {
    switch (action) {
      case "validate":
        updateStoreMutation.mutate({
          id: store.id,
          updates: { status: "active" },
        });
        break;
      case "dismiss":
        updateStoreMutation.mutate({
          id: store.id,
          updates: { status: "dismissed" },
        });
        break;
      case "suspend_noncompliance":
        updateStoreMutation.mutate({
          id: store.id,
          updates: {
            status: "suspended_noncompliance",
            suspensionReason:
              "Your store has been suspended due to non-compliance with our terms and conditions. Please review our policies and contact support for clarification.",
          },
        });
        break;
      case "suspend_documents":
        updateStoreMutation.mutate({
          id: store.id,
          updates: {
            status: "suspended_documents",
            suspensionReason:
              "Your store has been suspended because required documents are missing or invalid. Please provide the requested documentation to reactivate your store.",
          },
        });
        break;
      case "suspend_fraud":
        updateStoreMutation.mutate({
          id: store.id,
          updates: {
            status: "suspended_fraud",
            suspensionReason:
              "Your store has been suspended due to suspected fraudulent activity. Please contact our support team immediately to resolve this issue.",
          },
        });
        break;
      case "request_documents":
        updateStoreMutation.mutate({
          id: store.id,
          updates: {
            status: "documents_requested",
            messagesSent: (store.messagesSent || 0) + 1,
          },
        });
        break;
      case "send_message":
        setSendMessageStore(store);
        messageForm.reset();
        break;
    }
  };

  // Send message mutation

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageFormData) => {
      if (!sendMessageStore)
        throw new Error(t("store.message.noStoreSelected"));

      const response = await fetch(
        `/api/admin/stores/${sendMessageStore.id}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t("store.message.failed"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({
        title: t("store.message.success.title"),
        description: t("store.message.success.description", {
          store: sendMessageStore?.name,
        }),
      });
      setSendMessageStore(null);
      messageForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t("store.message.failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSendMessage = async (data: SendMessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  // Dummy messages for demonstration (will be replaced with DB fetch later)
  const getDummyLastMessage = (store: StoreWithDetails) => {
    const dummyMessages = [
      {
        type: t("messages.types.kyc"),
        content: t("messages.contents.kyc"),
        time: t("messages.time.2days"),
      },
      {
        type: t("messages.types.payment"),
        content: t("messages.contents.payment"),
        time: t("messages.time.5hours"),
      },
      {
        type: t("messages.types.suspension"),
        content: t("messages.contents.suspension"),
        time: t("messages.time.1week"),
      },
      {
        type: t("messages.types.reactivation"),
        content: t("messages.contents.reactivation"),
        time: t("messages.time.3days"),
      },
      {
        type: t("messages.types.extension"),
        content: t("messages.contents.extension"),
        time: t("messages.time.1day"),
      },
      {
        type: t("messages.types.personalized"),
        content: t("messages.contents.personalized"),
        time: t("messages.time.6hours"),
      },
    ];

    const messageIndex =
      store.messagesSent > 0
        ? (store.messagesSent - 1) % dummyMessages.length
        : 0;
    return store.messagesSent > 0 ? dummyMessages[messageIndex] : null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            {t("store.status.active")}
          </span>
        );
      case "pending_validation":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            {t("store.status.pendingValidation")}
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            {t("store.status.dismissed")}
          </span>
        );
      case "suspended_noncompliance":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            {t("store.status.suspendedNonCompliance")}
          </span>
        );
      case "suspended_documents":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            {t("store.status.missingDocs")}
          </span>
        );
      case "suspended_fraud":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            {t("store.status.fraud")}
          </span>
        );
         case "suspended_approved":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            {t("store.status.approved")}
          </span>
        );
      case "documents_requested":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {t("store.status.docsRequested")}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
            {t(`store.status.${status}`, { defaultValue: status })}
          </span>
        );
    }
  };

  const onSubmit = (data: CreateStoreFormData) => {
    createStoreMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <span>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Store className="h-6 w-6 mr-2" />
                {t("store.heading")}
              </h1>
              <p className="text-gray-600 mt-1">{t("store.subheading")}</p>
            </span>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-add-store"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("store.actions.add")}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("store.stats.total")}
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="stat-total-stores"
              >
              <p className="text-2xl font-bold">{storeStats.totalStores}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("store.stats.active")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-green-600"
                data-testid="stat-active-stores"
              >
               <p className="text-2xl font-bold">{storeStats.activeStores}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("store.stats.hold")}
              </CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-yellow-600"
                data-testid="stat-onhold-stores"
              >
                <p className="text-2xl font-bold">{storeStats.onHoldStores}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("store.stats.revenue")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-purple-600"
                data-testid="stat-total-revenue"
              >
                {parseFloat(storeStats?.totalRevenue || "0").toLocaleString()}{" "}
                DA
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stores Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("store.list.heading")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("store.list.code")}</TableHead>
                  <TableHead>{t("store.list.name")}</TableHead>
                  <TableHead>{t("store.list.status")}</TableHead>
                  <TableHead>{t("store.list.creation")}</TableHead>
                  <TableHead>{t("store.list.subscription")}</TableHead>
                  <TableHead>{t("store.list.messages")}</TableHead>
                  <TableHead>{t("store.list.lastaction")}</TableHead>
                  <TableHead className="w-[50px]">
                    {t("store.list.Action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                                  <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                      {t("categories.loadingSuper")}
                                    </TableCell>
                                  </TableRow>
                                ) : stores.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                      <div className="text-lg text-gray-600 mb-2">
                                        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                       No Store Found
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Create your first store to get started
                                      </div>
                                     
                                    </TableCell>
                                  </TableRow>
                                ) : (stores.map((store) => (
                  <TableRow
                    key={store.id}
                    data-testid={`row-store-${store.id}`}
                  >
                    <TableCell
                      className="font-medium"
                      data-testid={`text-code-${store.id}`}
                    >
                      {store.codeStore}
                    </TableCell>
                    <TableCell>
                      <div
                        className="cursor-pointer hover:text-purple-600"
                        onClick={() => setSelectedStore(store)}
                        data-testid={`button-store-details-${store.id}`}
                      >
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-gray-500">
                          {store.ownerName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`status-${store.id}`}>
                      {getStatusBadge(store.status)}
                    </TableCell>
                    <TableCell data-testid={`date-created-${store.id}`}>
                      {new Date(store.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell data-testid={`subscription-end-${store.id}`}>
                      {store.subscriptionEnd
                        ? new Date(store.subscriptionEnd).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell
                      data-testid={`messages-sent-${store.id}`}
                      className="max-w-[200px]"
                    >
                      {(() => {
                        const lastMessage = getDummyLastMessage(store);
                        if (!lastMessage) {
                          return (
                            <span className="text-gray-400 text-sm">
                              {t("messages.none")}
                            </span>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-purple-600">
                              {lastMessage.type}
                            </div>
                            <div
                              className="text-xs text-gray-600 dark:text-gray-400 truncate"
                              title={lastMessage.content}
                            >
                              {lastMessage.content}
                            </div>
                            <div className="text-xs text-gray-400">
                              {lastMessage.time}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell data-testid={`last-action-${store.id}`}>
                      {store.lastActionAt
                        ? new Date(store.lastActionAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Details button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStore(store)}
                          data-testid={`action-details-${store.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-600" />
                          {t("store.table.details")}
                        </Button>

                        {/* Actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              {t("store.table.actions")}
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {store.status === "pending_validation" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStoreAction(store, "validate")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  {t("stores.validateStore")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStoreAction(store, "dismiss")
                                  }
                                >
                                  <X className="h-4 w-4 mr-2 text-red-600" />
                                  {t("stores.dismiss")}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction(store, "request_documents")
                              }
                            >
                              <FileText className="h-4 w-4 mr-2 text-blue-600" />
                              {t("stores.requestDocuments")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction(
                                  store,
                                  "suspend_noncompliance"
                                )
                              }
                            >
                              <Ban className="h-4 w-4 mr-2 text-orange-600" />
                              {t("stores.suspendNonCompliance")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction(store, "suspend_documents")
                              }
                            >
                              <Pause className="h-4 w-4 mr-2 text-purple-600" />
                              {t("stores.suspendMissingDocuments")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction(store, "suspend_fraud")
                              }
                            >
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              {t("stores.suspendFraud")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Send Message below row */}
                      <div className="mt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleStoreAction(store, "send_message")
                          }
                          data-testid={`action-send-message-${store.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                          {t("store.table.sendMessage")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Store Details Modal */}
        {selectedStore && (
          <Dialog
            open={!!selectedStore}
            onOpenChange={() => setSelectedStore(null)}
          >
            <DialogContent
              className="max-w-md"
              data-testid="modal-store-details"
            >
              <DialogHeader>
                <DialogTitle>{t("stores.storeDetails")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3
                    className="font-semibold text-lg"
                    data-testid="text-store-name"
                  >
                    {selectedStore.name}
                  </h3>
                  <div className="mt-1" data-testid="text-store-status">
                    {getStatusBadge(selectedStore.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{t("stores.owner")}:</span>
                    <span className="ml-2" data-testid="text-owner-name">
                      {selectedStore.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t("stores.email")}:</span>
                    <span className="ml-2" data-testid="text-owner-email">
                      {selectedStore.ownerEmail}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{t("stores.category")}:</span>
                    <span className="ml-2" data-testid="text-category">
                      {selectedStore.categoryName || t("stores.uncategorized")}
                    </span>
                  </div>
                  {selectedStore.description && (
                    <div>
                      <span className="font-medium">
                        {t("stores.description")}:
                      </span>
                      <p
                        className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                        data-testid="text-description"
                      >
                        {selectedStore.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      data-testid="text-product-count"
                    >
                      {selectedStore.productCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("stores.products")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      data-testid="text-order-count"
                    >
                      {selectedStore.orderCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("stores.orders")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      data-testid="text-revenue"
                    >
                      {parseFloat(
                        selectedStore.totalRevenue || "0"
                      ).toLocaleString()}{" "}
                      DA
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("stores.revenue")}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Store Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent
            className="max-w-md max-h-[80vh] overflow-y-auto"
            data-testid="modal-add-store"
          >
            <DialogHeader>
              <DialogTitle>{t("stores.addNewStore")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.storeName")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-store-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.ownerEmail")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="input-owner-email">
                            <SelectValue placeholder={t("stores.ownerEmail")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.filter(
                            (user) =>
                              user.sellerStatus === null &&
                              user.isActive &&
                              user.role === "seller"
                          ).length > 0 ? (
                            users
                              .filter(
                                (user) =>
                                  user.sellerStatus === null &&
                                  user.isActive &&
                                  user.role === "seller"
                              )
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-gray-500"> {t("common.noitem")} </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.businessPhone")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-owner-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerAddressStreet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.street")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-street"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerAddressCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.city")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-city"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerAddressZipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.zipCode")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-zipCode"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerAddressCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.country")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-country"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.websiteOptional")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-website"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.taxIdOptional")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          data-testid="input-taxId"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.ownerEmail")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-owner-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.category")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue
                              placeholder={t("stores.selectCategory")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.descriptionOptional")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    data-testid="button-cancel-add-store"
                  >
                    {t("stores.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStoreMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-create-store"
                  >
                    {createStoreMutation.isPending
                      ? t("stores.creating")
                      : t("stores.createStore")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Send Message Modal */}
        <Dialog
          open={!!sendMessageStore}
          onOpenChange={() => setSendMessageStore(null)}
        >
          <DialogContent className="max-w-md" data-testid="modal-send-message">
            <DialogHeader>
              <DialogTitle>
                {t("stores.sendMessageTo", { name: sendMessageStore?.name })}
              </DialogTitle>
            </DialogHeader>
            <Form {...messageForm}>
              <form
                onSubmit={messageForm.handleSubmit(onSendMessage)}
                className="space-y-4"
              >
                <FormField
                  control={messageForm.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.messageType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-message-type">
                            <SelectValue
                              placeholder={t("stores.chooseMessageType")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kyc_document_request">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              {t("stores.kycDocumentRequest")}
                            </div>
                          </SelectItem>
                          <SelectItem value="payment_reminder">
                            <div className="flex items-center">
                              <span className="h-4 w-4 mr-2 flex items-center justify-center text-sm">
                                $
                              </span>
                              {t("stores.paymentReminder")}
                            </div>
                          </SelectItem>
                          <SelectItem value="suspension_notification">
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {t("stores.suspensionNotification")}
                            </div>
                          </SelectItem>
                          <SelectItem value="reactivation_notification">
                            <div className="flex items-center">
                              <span className="h-4 w-4 mr-2 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full border-2 border-current"></div>
                              </span>
                              {t("stores.reactivationNotification")}
                            </div>
                          </SelectItem>
                          <SelectItem value="extension_time_limit">
                            <div className="flex items-center">
                              <span className="h-4 w-4 mr-2 flex items-center justify-center text-sm">
                                ⏰
                              </span>
                              {t("stores.extensionTimeLimit")}
                            </div>
                          </SelectItem>
                          <SelectItem value="personalized_message">
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {t("stores.personalizedMessage")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={messageForm.control}
                  name="messageContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("stores.messageContent")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("stores.typeYourMessage")}
                          className="min-h-[120px]"
                          data-testid="textarea-message-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-gray-500 mt-2">
                  <strong>{t("stores.tip")}:</strong>{" "}
                  {t("stores.personalizeMessageTip")}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSendMessageStore(null)}
                    data-testid="button-cancel-message"
                  >
                    {t("stores.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending
                      ? t("stores.sending")
                      : t("stores.send")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
