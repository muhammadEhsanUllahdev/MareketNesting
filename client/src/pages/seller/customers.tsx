import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  TrendingUp,
  Star,
  Search,
  Plus,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive";
  totalOrders: number;
  totalSpent: number;
  averageBasket: number;
  joinDate: string;
}

interface CustomerStats {
  totalClients: number;
  activeCustomers: number;
  totalTurnover: number;
  averageBasket: number;
}

// Mock data - in reality this would come from the API
const mockStats: CustomerStats = {
  totalClients: 0,
  activeCustomers: 0,
  totalTurnover: 0,
  averageBasket: 0,
};

export default function SellerCustomersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as "active" | "inactive",
  });

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error(t("customers.fetchFailed"));
      return res.json();
    },
  });

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      !searchQuery ||
      customer.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === t("common.all") || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle add customer
  const handleAddCustomer = () => {
    if (!newCustomer.fullName || !newCustomer.email) {
      toast({
        title: t("common.error"),
        description: t("customers.validation.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call
    toast({
      title: t("customers.add.successTitle"),
      description: t("customers.add.successDescription", {
        name: newCustomer.fullName,
      }),
    });

    // Reset form and close modal
    setNewCustomer({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });
    setIsAddCustomerOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setNewCustomer({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });
    setIsAddCustomerOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>{t("customers.pageTitle")}</span>
            </h1>
            <p className="text-gray-600 mt-1">
              {t("customers.pageDescription")}
            </p>
          </div>

          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>{t("customers.addButton")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("customers.addDialog.title")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("customers.form.fullName")} *
                  </Label>
                  <Input
                    id="fullName"
                    value={newCustomer.fullName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        fullName: e.target.value,
                      })
                    }
                    placeholder={t("customers.form.fullNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("customers.form.email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder={t("customers.form.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("customers.form.phone")}</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    placeholder={t("customers.form.phonePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("customers.form.address")}</Label>
                  <Textarea
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                    placeholder={t("customers.form.addressPlaceholder")}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t("customers.form.status")}</Label>
                  <Select
                    value={newCustomer.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setNewCustomer({ ...newCustomer, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("customers.form.statusPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("customers.status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("customers.status.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleAddCustomer}>
                  {t("customers.form.submit")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("customers.stats.totalClients")}
                  </p>
                  <p className="text-2xl font-bold">{mockStats.totalClients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("customers.stats.activeCustomers")}
                  </p>
                  <p className="text-2xl font-bold">
                    {mockStats.activeCustomers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("customers.stats.totalTurnover")}
                  </p>
                  <p className="text-2xl font-bold">
                    {mockStats.totalTurnover.toFixed(2)} {t("common.currency")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("customers.stats.averageBasket")}
                  </p>
                  <p className="text-2xl font-bold">
                    {mockStats.averageBasket.toFixed(2)} {t("common.currency")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("customers.searchPlaceholder")}
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  {t("customers.filter.all")}
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  {t("customers.filter.active")}
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  {t("customers.filter.inactive")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>{t("common.loading")}</p>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("customers.noResults.title")}
                </h3>
                <p className="text-gray-500 text-center max-w-sm">
                  {searchQuery
                    ? t("customers.noResults.searchMessage")
                    : t("customers.noResults.emptyMessage")}
                </p>
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("customers.table.fullName")}</TableHead>
                      <TableHead>{t("customers.table.email")}</TableHead>
                      <TableHead>{t("customers.table.phone")}</TableHead>
                      <TableHead>{t("customers.table.totalOrders")}</TableHead>
                      <TableHead>{t("customers.table.totalSpent")}</TableHead>
                      <TableHead>
                        {t("customers.table.averageBasket")}
                      </TableHead>
                      <TableHead>{t("customers.table.joinDate")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.fullname}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>
                          {Number(customer.totalSpent).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {Number(customer.averageBasket).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(customer.joinDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>

    // <DashboardLayout>
    //   <div className="space-y-6">
    //     {/* Page Header */}
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <h1 className="text-2xl font-bold flex items-center space-x-2">
    //           <Users className="h-6 w-6" />
    //           <span>Customer Management</span>
    //         </h1>
    //         <p className="text-gray-600 mt-1">
    //           Manage and track your customers
    //         </p>
    //       </div>

    //       <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
    //         <DialogTrigger asChild>
    //           <Button className="flex items-center space-x-2">
    //             <Plus className="h-4 w-4" />
    //             <span>Add a customer</span>
    //           </Button>
    //         </DialogTrigger>
    //         <DialogContent className="sm:max-w-md">
    //           <DialogHeader>
    //             <DialogTitle>Add a new customer</DialogTitle>
    //           </DialogHeader>
    //           <div className="space-y-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="fullName">Full name *</Label>
    //               <Input
    //                 id="fullName"
    //                 value={newCustomer.fullName}
    //                 onChange={(e) =>
    //                   setNewCustomer({
    //                     ...newCustomer,
    //                     fullName: e.target.value,
    //                   })
    //                 }
    //                 placeholder="Enter customer's full name"
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="email">Email *</Label>
    //               <Input
    //                 id="email"
    //                 type="email"
    //                 value={newCustomer.email}
    //                 onChange={(e) =>
    //                   setNewCustomer({ ...newCustomer, email: e.target.value })
    //                 }
    //                 placeholder="Enter customer's email"
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="phone">Phone</Label>
    //               <Input
    //                 id="phone"
    //                 value={newCustomer.phone}
    //                 onChange={(e) =>
    //                   setNewCustomer({ ...newCustomer, phone: e.target.value })
    //                 }
    //                 placeholder="Enter phone number"
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="address">Address</Label>
    //               <Textarea
    //                 id="address"
    //                 value={newCustomer.address}
    //                 onChange={(e) =>
    //                   setNewCustomer({
    //                     ...newCustomer,
    //                     address: e.target.value,
    //                   })
    //                 }
    //                 placeholder="Enter customer's address"
    //                 rows={3}
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="status">Status</Label>
    //               <Select
    //                 value={newCustomer.status}
    //                 onValueChange={(value: "active" | "inactive") =>
    //                   setNewCustomer({ ...newCustomer, status: value })
    //                 }
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   <SelectItem value="active">Active</SelectItem>
    //                   <SelectItem value="inactive">Inactive</SelectItem>
    //                 </SelectContent>
    //               </Select>
    //             </div>
    //           </div>
    //           <div className="flex justify-end space-x-3 mt-6">
    //             <Button variant="outline" onClick={handleCancel}>
    //               Cancel
    //             </Button>
    //             <Button onClick={handleAddCustomer}>Create the client</Button>
    //           </div>
    //         </DialogContent>
    //       </Dialog>
    //     </div>

    //     {/* Statistics Cards */}
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    //       <Card>
    //         <CardContent className="p-6">
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <p className="text-sm text-gray-600">Total Clients</p>
    //               <p className="text-2xl font-bold">{mockStats.totalClients}</p>
    //             </div>
    //             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
    //               <Users className="h-6 w-6 text-blue-600" />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       <Card>
    //         <CardContent className="p-6">
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <p className="text-sm text-gray-600">Active Customers</p>
    //               <p className="text-2xl font-bold">
    //                 {mockStats.activeCustomers}
    //               </p>
    //             </div>
    //             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
    //               <UserCheck className="h-6 w-6 text-green-600" />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       <Card>
    //         <CardContent className="p-6">
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <p className="text-sm text-gray-600">Total turnover</p>
    //               <p className="text-2xl font-bold">
    //                 {mockStats.totalTurnover.toFixed(2)} YES
    //               </p>
    //             </div>
    //             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
    //               <Star className="h-6 w-6 text-yellow-600" />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       <Card>
    //         <CardContent className="p-6">
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <p className="text-sm text-gray-600">Average basket</p>
    //               <p className="text-2xl font-bold">
    //                 {mockStats.averageBasket.toFixed(2)} YES
    //               </p>
    //             </div>
    //             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
    //               <Star className="h-6 w-6 text-purple-600" />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </div>

    //     {/* Search and Filter Section */}
    //     <Card>
    //       <CardHeader>
    //         <div className="flex items-center justify-between">
    //           <div className="flex items-center space-x-4">
    //             {/* Search */}
    //             <div className="relative">
    //               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    //               <Input
    //                 placeholder="Search by name or email..."
    //                 className="pl-10 w-80"
    //                 value={searchQuery}
    //                 onChange={(e) => setSearchQuery(e.target.value)}
    //               />
    //             </div>
    //           </div>

    //           {/* Filter Buttons */}
    //           <div className="flex items-center space-x-2">
    //             <Button
    //               variant={statusFilter === "all" ? "default" : "outline"}
    //               size="sm"
    //               onClick={() => setStatusFilter("all")}
    //             >
    //               All
    //             </Button>
    //             <Button
    //               variant={statusFilter === "active" ? "default" : "outline"}
    //               size="sm"
    //               onClick={() => setStatusFilter("active")}
    //             >
    //               Assets
    //             </Button>
    //             <Button
    //               variant={statusFilter === "inactive" ? "default" : "outline"}
    //               size="sm"
    //               onClick={() => setStatusFilter("inactive")}
    //             >
    //               Inactive
    //             </Button>
    //           </div>
    //         </div>
    //       </CardHeader>
    //       <CardContent>
    //         {isLoading ? (
    //           <p>Loading...</p>
    //         ) : filteredCustomers.length === 0 ? (
    //           <div className="flex flex-col items-center justify-center py-12">
    //             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    //               <User className="h-8 w-8 text-gray-400" />
    //             </div>
    //             <h3 className="text-lg font-medium text-gray-900 mb-2">
    //               No customers found
    //             </h3>
    //             <p className="text-gray-500 text-center max-w-sm">
    //               {searchQuery
    //                 ? "Try adjusting your search terms to find the customers you're looking for."
    //                 : "You haven't added any customers yet. Start by adding your first customer."}
    //             </p>
    //           </div>
    //         ) : (
    //           <div>
    //             {/* {filteredCustomers.map((customer) => (
    //               <Card key={customer.id}>
    //                 <CardHeader>
    //                   <CardTitle>{customer.fullName}</CardTitle>
    //                 </CardHeader>
    //                 <CardContent className="space-y-2">
    //                   <p>
    //                     <strong>Email:</strong> {customer.email}
    //                   </p>
    //                   {customer.phone && (
    //                     <p>
    //                       <strong>Phone:</strong> {customer.phone}
    //                     </p>
    //                   )}
    //                   {customer.address && (
    //                     <p>
    //                       <strong>Address:</strong> {customer.address}
    //                     </p>
    //                   )}
    //                   <p>
    //                     <strong>Status:</strong>
    //                     <Badge
    //                       className="ml-2"
    //                       variant={
    //                         customer.status === "active"
    //                           ? "default"
    //                           : "secondary"
    //                       }
    //                     >
    //                       {customer.status}
    //                     </Badge>
    //                   </p>
    //                   <p>
    //                     <strong>Total Orders:</strong> {customer.totalOrders}
    //                   </p>
    //                   <p>
    //                     <strong>Total Spent:</strong>{" "}
    //                     {Number(customer.totalSpent).toFixed(2)}
    //                   </p>
    //                   <p>
    //                     <strong>Average Basket:</strong>{" "}
    //                     {Number(customer.averageBasket).toFixed(2)}
    //                   </p>
    //                   <p>
    //                     <strong>Join Date:</strong>{" "}
    //                     {new Date(customer.joinDate).toLocaleDateString()}
    //                   </p>
    //                 </CardContent>
    //               </Card>
    //             ))} */}
    //             <Table>
    //               <TableHeader>
    //                 <TableRow>
    //                   <TableHead>Full Name</TableHead>
    //                   <TableHead>Email</TableHead>
    //                   <TableHead>Phone</TableHead>
    //                   {/* <TableHead>Address</TableHead> */}
    //                   {/* <TableHead>Status</TableHead> */}
    //                   <TableHead>Total Orders</TableHead>
    //                   <TableHead>Total Spent</TableHead>
    //                   <TableHead>Average Basket</TableHead>
    //                   <TableHead>Join Date</TableHead>
    //                 </TableRow>
    //               </TableHeader>
    //               <TableBody>
    //                 {filteredCustomers.map((customer) => (
    //                   <TableRow key={customer.id}>
    //                     <TableCell>{customer.fullname}</TableCell>
    //                     <TableCell>{customer.email}</TableCell>
    //                     <TableCell>{customer.phone || "-"}</TableCell>
    //                     {/* <TableCell>{customer.address || "-"}</TableCell> */}
    //                     {/* <TableCell>
    //                       <Badge
    //                         variant={
    //                           customer.status === "active"
    //                             ? "default"
    //                             : "secondary"
    //                         }
    //                       >
    //                         {customer.status}
    //                       </Badge>
    //                     </TableCell> */}
    //                     <TableCell>{customer.totalOrders}</TableCell>
    //                     <TableCell>
    //                       {Number(customer.totalSpent).toFixed(2)}
    //                     </TableCell>
    //                     <TableCell>
    //                       {Number(customer.averageBasket).toFixed(2)}
    //                     </TableCell>
    //                     <TableCell>
    //                       {new Date(customer.joinDate).toLocaleDateString()}
    //                     </TableCell>
    //                   </TableRow>
    //                 ))}
    //               </TableBody>
    //             </Table>
    //           </div>
    //         )}
    //       </CardContent>
    //       {/* <CardContent>
    //         <div className="flex flex-col items-center justify-center py-12">
    //           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    //             <User className="h-8 w-8 text-gray-400" />
    //           </div>
    //           <h3 className="text-lg font-medium text-gray-900 mb-2">
    //             No customers found
    //           </h3>
    //           <p className="text-gray-500 text-center max-w-sm">
    //             {searchQuery
    //               ? "Try adjusting your search terms to find the customers you're looking for."
    //               : "You haven't added any customers yet. Start by adding your first customer."}
    //           </p>
    //         </div>
    //       </CardContent> */}
    //     </Card>
    //   </div>
    // </DashboardLayout>
  );
}
