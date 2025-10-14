import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Package, Star, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ClientNotifications() {
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

const markAsReadMutation = useMutation({
  mutationFn: async (notificationId: string) => {
    const res = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(t("notifications.error.failedToMarkRead"));
    }
    return res.json();
  },
  onSuccess: (data, notificationId) => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

    toast({
      title: t("notifications.readTitle"),
      description: t("notifications.markedAsRead", { id: notificationId }),
    });
  },
  onError: (error: any) => {
    toast({
      title: t("notifications.error.title"),
      description: error.message || t("notifications.error.message"),
      variant: "destructive",
    });
  },
});

const deleteNotificationMutation = useMutation({
  mutationFn: async (notificationId: string) => {
    const res = await fetch(`/api/notifications/${notificationId}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(t("notifications.error.failedToDelete"));
    }
    return res.json();
  },
  onSuccess: (data, notificationId) => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

    toast({
      title: t("notifications.deletedTitle"),
      description: t("notifications.deletedSuccessfully", { id: notificationId }),
    });
  },
  onError: (error: any) => {
    toast({
      title: t("notifications.error.title"),
      description: error.message || t("notifications.error.message"),
      variant: "destructive",
    });
  },
});


  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <DashboardLayout title={t("client.dashboard.notifications")}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {t("client.dashboard.notifications")}
          </CardTitle>
          {/* <Button
            variant="ghost"
            size="sm"
            data-testid="button-view-all-notifications"
          >
            3 {t("client.dashboard.notifications.item")}
          </Button> */}
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              className={`px-4 py-2 rounded-lg ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => setFilter("all")}
            >
              {t("notifications.all")}
            </Button>

            <Button
              className={`px-4 py-2 rounded-lg ${
                filter === "unread" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => setFilter("unread")}
            >
              {t("notifications.unread")}
            </Button>

            <Button
              className={`px-4 py-2 rounded-lg ${
                filter === "read" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => setFilter("read")}
            >
              {t("notifications.read")}
            </Button>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg 
    ${
      notification.isRead
        ? "bg-gray-100 text-gray-600"
        : "bg-blue-50 text-blue-800"
    }
  `}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex-shrink-0 mr-3">
                  {notification.type === "shipped" && (
                    <Package className="h-5 w-5 text-blue-500" />
                  )}
                  {notification.type === "sale" && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                  {notification.type === "review" && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium text-gray-900"
                    data-testid={`notification-title-${notification.id}`}
                  >
                    {notification.title}
                  </p>
                  <p
                    className="text-sm text-gray-600"
                    data-testid={`notification-message-${notification.id}`}
                  >
                    {notification.message}
                  </p>
                  <p
                    className="text-xs text-gray-500 mt-1"
                    data-testid={`notification-time-${notification.id}`}
                  >
                    {notification.time}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <Button
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      className="p-3 text-green-600 hover:text-green-800 bg-white"
                      data-testid={`notification-check-${notification.id}`}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  )}

                  <Button
                    onClick={() =>
                      deleteNotificationMutation.mutate(notification.id)
                    }
                    className="p-3 text-red-600 hover:text-red-800 bg-white"
                    data-testid={`notification-trash-${notification.id}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-all-notifications"
            >
              {t("client.dashboard.notifications.view")}
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
