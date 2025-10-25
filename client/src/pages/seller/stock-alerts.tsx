import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Settings,
  TrendingDown,
  RefreshCw,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface StockAlert {
  id: string;
  productName: string;
  alertType: "critical" | "important" | "medium";
  message: string;
  currentStock: number;
  timestamp: string;
  status: "active" | "resolved";
  resolvedAt?: string;
}

export default function StockAlertsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("active");
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["stockAlerts"],
    queryFn: async () => {
      const res = await fetch("/api/stock-alerts");
      if (!res.ok) throw new Error(t("alerts.error.fetchFailed"));
      return res.json();
    },
  });

  const solveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/stock-alerts/${id}/resolve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(t("alerts.error.solveFailed"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockAlerts"] });
      toast({ title: t("alerts.toast.resolved") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/stock-alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("alerts.error.deleteFailed"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockAlerts"] });
      toast({ title: t("alerts.toast.deleted") });
    },
  });

  const criticalAlerts = alerts.filter(
    (alert) => alert.alertType === "critical"
  );
  const importantAlerts = alerts.filter(
    (alert) => alert.alertType === "important"
  );
  const mediumAlerts = alerts.filter((alert) => alert.alertType === "medium");
  const activeAlerts = alerts.filter((alert) => alert.status === "active");
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved");

  const handleSolveAlert = (alertId: string) => {
    solveMutation.mutate(alertId);
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteMutation.mutate(alertId);
  };

  const getAlertConfig = (type: string) => {
    switch (type) {
      case "critical":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: "bg-red-50 border-l-red-500",
          textColor: "text-red-800",
          badgeColor: "bg-red-100 text-red-800",
        };
      case "important":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          bgColor: "bg-orange-50 border-l-orange-500",
          textColor: "text-orange-800",
          badgeColor: "bg-orange-100 text-orange-800",
        };
      case "medium":
        return {
          icon: <Info className="h-4 w-4" />,
          bgColor: "bg-yellow-50 border-l-yellow-500",
          textColor: "text-yellow-800",
          badgeColor: "bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          bgColor: "bg-gray-50 border-l-gray-500",
          textColor: "text-gray-800",
          badgeColor: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t("alerts.pageTitle")}</h1>
            </div>
            <p className="text-gray-600 mt-1">{t("alerts.pageSubtitle")}</p>
          </div>
          {/* <Button className="flex items-center space-x-2" variant="outline">
            <Settings className="h-4 w-4" />
            <span>{t("alerts.configure")}</span>
          </Button> */}
        </div>

        {/* Alert Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("alerts.critical")}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {criticalAlerts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("alerts.important")}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {importantAlerts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("alerts.medium")}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mediumAlerts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bell className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("alerts.totalActive")}
                  </p>
                  <p className="text-2xl font-bold">{activeAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t("alerts.management")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger
                  value="active"
                  className="flex items-center space-x-2"
                >
                  <span>{t("alerts.active")}</span>
                  <Badge variant="secondary" className="ml-2">
                    {activeAlerts.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="flex items-center space-x-2"
                >
                  <span>{t("alerts.resolved")}</span>
                  <Badge variant="secondary" className="ml-2">
                    {resolvedAlerts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("alerts.noActiveTitle")}
                    </h3>
                    <p className="text-gray-600">
                      {t("alerts.noActiveSubtitle")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => {
                      const config = getAlertConfig(alert.alertType);

                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${config.bgColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className={config.textColor}>
                                  {config.icon}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {alert.productName}
                                  </h3>
                                  <p className={`text-sm ${config.textColor}`}>
                                    {config.icon} {alert.message}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {alert.alertType === "critical"
                                        ? t("alerts.outOfStock")
                                        : t("alerts.lowStock")}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {alert.timestamp}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  {t("alerts.currentStock")}
                                </div>
                                <div className="text-2xl font-bold">
                                  {alert.currentStock}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSolveAlert(alert.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  <span>{t("alerts.solve")}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resolved" className="mt-6">
                {resolvedAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("alerts.noResolvedTitle")}
                    </h3>
                    <p className="text-gray-600">
                      {t("alerts.noResolvedSubtitle")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resolvedAlerts.map((alert) => {
                      const config = getAlertConfig(alert.alertType);
                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${config.bgColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {alert.productName}
                              </h3>
                              <p className={`text-sm ${config.textColor}`}>
                                {alert.message}
                              </p>
                              <span className="text-xs text-gray-500">
                                {t("alerts.resolvedAt")}{" "}
                                {alert.resolvedAt
                                  ? new Date(alert.resolvedAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
