import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@shared/schema";
import { exportToExcel, formatDate, formatBoolean } from "@/utils/excel-export";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  Store,
  Clock,
  Search,
  Plus,
  Settings,
  X,
  Download,
} from "lucide-react";

// Form schema for creating users
// const { t } = useTranslation();




export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [userRole, setUserRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all");
  const createUserSchema = z.object({
  firstName: z.string().min(1, t("validation.firstNameRequired")),
  lastName: z.string().min(1, t("validation.lastNameRequired")),
  email: z.string().email(t("validation.invalidEmail")),
  username: z.string().min(3, t("validation.usernameMin")),
  password: z.string().min(6, t("validation.passwordMin")),
  role: z.enum(["client", "seller", "admin"]),
  isActive: z.boolean().default(true),
});

  // Form for adding new users
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      role: "client",
      isActive: true,
    },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const {
    data: userStats = {
      totalUsers: 0,
      activeUsers: 0,
      sellers: 0,
      onHold: 0,
      pendingSellers: 0,
    },
  } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    sellers: number;
    onHold: number;
    pendingSellers?: number;
  }>({
    queryKey: ["/api/admin/users/stats"],
  });

  // Calculate on-hold sellers
const onholdSellers = (users as User[]).filter(
  (user) => user.role === "seller" && user.sellerStatus === "onhold"
).length;

// Calculate pending sellers
const pendingSellers = (users as User[]).filter(
  (user) => user.role === "seller" && user.sellerStatus === "pending"
).length;

// Open user modal
const openUserModal = (user: User) => {
  setSelectedUser(user);
  setUserStatus(user.status);
  setUserRole(
    user.role === "client"
      ? "Client"
      : user.role === "seller"
        ? "Seller"
        : "Admin"
  );
  setIsModalOpen(true);
};



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserStatus("");
    setUserRole("");
  };

  const updateSellerStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/users/${userId}/seller-status`,
        { status },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: t("user.successTitle"),
        description: t("user.sellerStatusUpdated"),
      });
      closeModal();
    },
    onError: (error: any) => {
      toast({
        title: t("user.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },

  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
      role,
    }: {
      userId: string;
      status: string;
      role: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, {
        status,
        role,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      toast({
        title: t("user.successTitle"),
        description: t("user.userUpdated"),
      });
      closeModal();
    },
    onError: (error: any) => {
      toast({
        title: t("user.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },

  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      toast({
        title: t("user.successTitle"),
        description: t("user.userDeleted"),
      });
      closeModal();
    },
    onError: (error: any) => {
      toast({
        title: t("user.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },

  });

  const handleSafeguard = () => {
    if (!selectedUser) return;

    // If it's a seller pending approval, approve them
    if (
      selectedUser.role === "seller" &&
      selectedUser.sellerStatus === "pending"
    ) {
      updateSellerStatusMutation.mutate({
        userId: selectedUser.id,
        status: "approved",
      });
      queryClient.invalidateQueries({queryKey: ["/api/admin/users"]});

    } else {
      // Regular user update with new status and role
      updateUserMutation.mutate({
        userId: selectedUser.id,
        status: userStatus,
        role: userRole,
      });
    }
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    // If it's a seller pending approval, reject them
    if (
      selectedUser.role === "seller" &&
      selectedUser.sellerStatus === "pending"
    ) {
      updateSellerStatusMutation.mutate({
        userId: selectedUser.id,
        status: "rejected",
      });
    } else {
      // Regular user deletion
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleExportUsers = () => {
    if (!filteredUsers.length) {
      alert(t("user.noUsersToExport"));
      return;
    }

    const columns = [
      { key: "username", label: t("user.username") },
      { key: "firstName", label: t("user.firstName") },
      { key: "lastName", label: t("user.lastName") },
      { key: "email", label: t("user.email") },
      { key: "role", label: t("user.role") },
      { key: "status", label: t("user.status") },
      { key: "sellerStatus", label: t("user.sellerStatus") },
      { key: "isActive", label: t("user.active"), format: formatBoolean },
      { key: "createdAt", label: t("user.createdDate"), format: formatDate },
      { key: "lastLoginAt", label: t("user.lastLogin"), format: formatDate },
    ];

    const success = exportToExcel({
      filename: `users-${new Date().toISOString().split("T")[0]}`,
      sheetName: t("user.sheetName"),
      columns,
      data: filteredUsers,
    });

    if (success) {
      console.log(t("user.exportSuccess"));
    } else {
      alert(t("user.exportFailed"));
    }
  };


  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof createUserSchema>) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("user.createFailed"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      toast({
        title: t("user.successTitle"),
        description: t("user.userCreated"),
      });
      setIsAddUserModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("user.errorTitle"),
        description: error.message || t("user.createFailed"),
        variant: "destructive",
      });
    },
  });

  const onSubmitCreateUser = (data: z.infer<typeof createUserSchema>) => {
    createUserMutation.mutate(data);
  };

  const createTestUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/users/create-test-users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(t("user.createTestFailed"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
    },
  });


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "on hold":
        return "bg-yellow-100 text-yellow-700";
      case "terminated":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "seller":
        return "bg-purple-100 text-purple-700";
      case "customer":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = (users as User[]).filter((user: User) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.storeName &&
        user.storeName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        (t(user.status) === t("user.status.active") ||
          (user.isActive && !user.status))) ||
      (statusFilter === "inactive" &&
        (t(user.status) === t("user.status.inactive") ||
          (!user.isActive && !user.status))) ||
      (statusFilter === "onhold" && t(user.status) === t("user.status.onhold")) ||
      (statusFilter === "terminated" &&
        t(user.status) === t("user.status.terminated"));

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Seller status filter (only applies when role filter is "seller")
    const matchesSellerStatus =
      roleFilter !== "seller" ||
      sellerStatusFilter === "all" ||
      user.sellerStatus === sellerStatusFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesSellerStatus;
  });


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              {t("user.heading")}
            </h1>
            <p className="text-gray-600 mt-1">{t("user.subheading")}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportUsers}
              data-testid="button-export-users"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("user.actions.export")}
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddUserModalOpen(true)}
              data-testid="button-add-user"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("user.actions.add")}
            </Button>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("user.stats.total")}
                  </p>
                  <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("user.stats.active")}
                  </p>
                  <p className="text-2xl font-bold">{userStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Store className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("user.stats.sellers")}
                  </p>
                  <p className="text-2xl font-bold">{userStats.sellers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

         <Card
  // className={
  //   userStats.onHold > 0 ? "ring-2 ring-yellow-400 bg-yellow-50" : ""
  // }
  // onClick={() => {
  //             setRoleFilter("seller");
  //             setSellerStatusFilter("onhold");
  //           }}
        
>
  <CardContent className="p-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-yellow-100 rounded-lg">
        <Clock className="h-5 w-5 text-orange-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{t("user.stats.hold")}</p>
        <p className="text-2xl font-bold text-yellow-600">
          {userStats.onHold}
        </p>
        {/* {userStats.onHold > 0 && (
          <p className="text-xs text-orange-600 font-medium">
            {t("user.stats.hold.click")}
          </p>
        )} */}
      </div>
    </div>
  </CardContent>
</Card>


          <Card
             
            // onClick={() => {
            //   setRoleFilter("seller");
            //   setSellerStatusFilter("pending");
            // }}
            style={{ cursor: pendingSellers > 0 ? "pointer" : "default" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Store className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("user.stats.pending")}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingSellers}
                  </p>
                  {/* {pendingSellers > 0 && (
                    <p className="text-xs text-yellow-600 font-medium">
                      {t("user.stats.pending.click")}
                    </p>
                  )} */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("user.search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("user.filters.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("user.filters.status")}</SelectItem>
                <SelectItem value="active">{t("user.allactive")}</SelectItem>
                <SelectItem value="inactive">{t("user.allinactive")}</SelectItem>
                <SelectItem value="onhold">{t("user.allonhold")}</SelectItem>
                <SelectItem value="terminated">{t("user.allterminated")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("user.filters.rolesPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("user.filters.roles")}</SelectItem>
                <SelectItem value="client">{t("user.allcustomer")}</SelectItem>
                <SelectItem value="seller">{t("user.allseller")}</SelectItem>
                <SelectItem value="admin">{t("user.alladmin")}</SelectItem>
              </SelectContent>
            </Select>

            {roleFilter === "seller" && (
              <Select value={sellerStatusFilter} onValueChange={setSellerStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("user.filters.sellerStatusPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("user.filters.sellerStatus.all")}</SelectItem>
                  <SelectItem value="pending">{t("user.filters.sellerStatus.pending")}</SelectItem>
                  <SelectItem value="approved">{t("user.filters.sellerStatus.approved")}</SelectItem>
                  <SelectItem value="rejected">{t("user.filters.sellerStatus.rejected")}</SelectItem>
                  <SelectItem value="suspended">{t("user.filters.sellerStatus.suspended")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("user.list.heading")} ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{t("user.list.online")}</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("user.table.user")}</TableHead>
                    <TableHead>{t("user.table.role")}</TableHead>
                    <TableHead>{t("user.table.sellerstatus")}</TableHead>
                    <TableHead>{t("user.table.status")}</TableHead>
                    <TableHead>{t("user.table.registration")}</TableHead>
                    <TableHead>{t("user.table.lastlogin")}</TableHead>
                    <TableHead>{t("user.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <Users className="h-12 w-12 text-gray-400" />
                          <div>
                            <p className="text-gray-500 font-medium">
                              {searchTerm
                                ? t("user.empty.searchTitle")
                                : t("user.empty.noUsersTitle")}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {searchTerm
                                ? t("user.empty.searchSubtitle")
                                : t("user.empty.noUsersSubtitle")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                    : (
                      filteredUsers.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {(user.firstName?.charAt(0) || "") + (user.lastName?.charAt(0) || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                                {user.role === "seller" && user?.storeName && (
                                  <p className="text-xs text-purple-600 font-medium">
                                    🏪 {user?.storeName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {t(`user.roles.${user.role}`)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {user.role === "seller" && user.sellerStatus ? (
                              <Badge
                                className={
                                  user.sellerStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : user.sellerStatus === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : user.sellerStatus === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                }
                              >
                                {t(`user.sellerStatus.${user.sellerStatus}`)}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">{t("user.noStatus")}</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={getStatusColor(
                                user.status
                                  ? user.status.toLowerCase()
                                  : user.isActive
                                    ? "active"
                                    : "inactive"
                              )}
                            >
                              {user.status
                                ? t(`user.status.${user.status.toLowerCase()}`)
                                : user.isActive
                                  ? t("user.status.active")
                                  : t("user.status.inactive")}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString("en-US")}
                          </TableCell>

                          <TableCell className="text-sm text-gray-600">
                            {user.updatedAt
                              ? new Date(user.updatedAt).toLocaleDateString("en-US")
                              : t("user.never")}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {user.role === "seller" && user.sellerStatus === "pending" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() =>
                                      updateSellerStatusMutation.mutate({
                                        userId: user.id,
                                        status: "approved",
                                      })
                                    }
                                    disabled={updateSellerStatusMutation.isPending}
                                  >
                                    ✓ {t("user.actions.approve")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      updateSellerStatusMutation.mutate({
                                        userId: user.id,
                                        status: "rejected",
                                      })
                                    }
                                    disabled={updateSellerStatusMutation.isPending}
                                  >
                                    ✕ {t("user.actions.reject")}
                                  </Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => openUserModal(user)}>
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                      ))
                    )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {t("user.heading")}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {t("user.subheading", {
                firstName: selectedUser?.firstName,
                lastName: selectedUser?.lastName,
              })}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("user.allstatus")}
              </label>
              <Select value={userStatus} onValueChange={setUserStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("user.placeholders.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t("user.allactive")}</SelectItem>
                  <SelectItem value="Inactive">{t("user.allinactive")}</SelectItem>
                  <SelectItem value="On Hold">{t("user.allonhold")}</SelectItem>
                  <SelectItem value="Terminated">{t("user.allterminated")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("user.allroles")}
              </label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t("user.placeholders.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">{t("user.allcustomer")}</SelectItem>
                  <SelectItem value="Seller">{t("user.allseller")}</SelectItem>
                  <SelectItem value="Admin">{t("user.alladmin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteUserMutation.isPending || updateSellerStatusMutation.isPending
              }
              className="bg-red-400 hover:bg-red-500"
            >
              {deleteUserMutation.isPending
                ? t("user.deleting")
                : t("user.delete")}
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={
                  deleteUserMutation.isPending ||
                  updateUserMutation.isPending ||
                  updateSellerStatusMutation.isPending
                }
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSafeguard}
                disabled={
                  updateUserMutation.isPending ||
                  updateSellerStatusMutation.isPending
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateUserMutation.isPending ||
                  updateSellerStatusMutation.isPending
                  ? t("common.saving")
                  : t("common.safeguard")}
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>


      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-md" data-testid="modal-add-user">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t("user.addnewuser")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitCreateUser)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("user.firstname")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("user.firstnameplaceholder")}
                          {...field}
                          data-testid="input-first-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("user.lastname")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("user.lastnameplaceholder")}
                          {...field}
                          data-testid="input-last-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("user.emailplaceholder")}
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.username")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("user.usernameplaceholder")}
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("user.passwordplaceholder")}
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder={t("user.selectrole")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="client">{t("user.allcustomer")}</SelectItem>
                        <SelectItem value="seller">{t("user.allseller")}</SelectItem>
                        <SelectItem value="admin">{t("user.alladmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    form.reset();
                  }}
                  disabled={createUserMutation.isPending}
                  data-testid="button-cancel-add-user"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  data-testid="button-submit-add-user"
                >
                  {createUserMutation.isPending
                    ? t("user.creating")
                    : t("user.createuser")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
