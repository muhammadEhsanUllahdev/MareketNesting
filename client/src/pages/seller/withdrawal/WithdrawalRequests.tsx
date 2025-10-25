import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processed";
  bankAccountInfo: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    iban?: string;
  };
  createdAt: string;
  processedAt?: string;
}
const WithdrawalRequests = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    iban: "",
  });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/withdrawals", {
        credentials: "include",
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      toast({
        title: t("withdrawals.errorTitle"),
        description: t("withdrawals.loadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/seller/withdrawals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: parseFloat(newRequest.amount),
          bankAccountInfo: {
            bank_name: newRequest.bank_name,
            account_number: newRequest.account_number,
            account_holder_name: newRequest.account_holder_name,
            iban: newRequest.iban,
          },
        }),
      });

      if (!res.ok) throw new Error("Request creation failed");
      toast({ title: t("withdrawals.createSuccess") });
      setShowDialog(false);
      setNewRequest({
        amount: "",
        bank_name: "",
        account_number: "",
        account_holder_name: "",
        iban: "",
      });
      fetchWithdrawals();
    } catch (err) {
      toast({
        title: t("withdrawals.errorTitle"),
        description: t("withdrawals.createError"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (a: number) => `${a.toLocaleString("fr-FR")} DA`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

  const getStatusBadge = (s: string) => {
    const cfg: any = {
      pending: {
        label: t("withdrawals.status.pending"),
        color: "text-yellow-600 border-yellow-600",
        icon: Clock,
      },
      approved: {
        label: t("withdrawals.status.approved"),
        color: "text-blue-600 border-blue-600",
        icon: CheckCircle,
      },
      processed: {
        label: t("withdrawals.status.processed"),
        color: "text-green-600 border-green-600",
        icon: CheckCircle,
      },
      rejected: {
        label: t("withdrawals.status.rejected"),
        color: "text-red-600 border-red-600",
        icon: X,
      },
    };
    const Icon = cfg[s]?.icon || Clock;
    return (
      <Badge variant="outline" className={cfg[s]?.color}>
        <Icon className="h-3 w-3 mr-1" /> {cfg[s]?.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout title={t("withdrawals.pageTitle")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("withdrawals.pageTitle")}</h1>
            <p className="text-muted-foreground">
              {t("withdrawals.pageSubtitle")}
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("withdrawals.newRequest")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("withdrawals.historyTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t("withdrawals.loading")}</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("withdrawals.noRequests")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("withdrawals.id")}</TableHead>
                    <TableHead>{t("withdrawals.amount")}</TableHead>
                    <TableHead>{t("withdrawals.bank")}</TableHead>
                    <TableHead>{t("withdrawals.statusLabel")}</TableHead>
                    <TableHead>{t("withdrawals.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>#{r.id.slice(0, 8)}</TableCell>
                      <TableCell>{formatCurrency(r.amount)}</TableCell>
                      <TableCell>{r.bankAccountInfo.bank_name}</TableCell>
                      <TableCell>{getStatusBadge(r.status)}</TableCell>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("withdrawals.newRequestTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>{t("withdrawals.amountLabel")}</Label>
              <Input
                type="number"
                value={newRequest.amount}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, amount: e.target.value })
                }
              />
              <Label>{t("withdrawals.bankNameLabel")}</Label>
              <Input
                value={newRequest.bank_name}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, bank_name: e.target.value })
                }
              />
              <Label>{t("withdrawals.accountNumberLabel")}</Label>
              <Input
                value={newRequest.account_number}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    account_number: e.target.value,
                  })
                }
              />
              <Label>{t("withdrawals.accountHolderLabel")}</Label>
              <Input
                value={newRequest.account_holder_name}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    account_holder_name: e.target.value,
                  })
                }
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-3"
              >
                {submitting
                  ? t("withdrawals.submitting")
                  : t("withdrawals.submit")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawalRequests;
