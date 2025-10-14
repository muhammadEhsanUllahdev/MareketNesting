// // pages/AdminPackages.tsx
// import React, { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import PackageModal from "@/components/modals/package-modal";
// import { Edit, Eye, Search, Trash2 } from "lucide-react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";

// // types
// type Package = {
//   id: string;
//   name: string;
//   description?: string;
//   price: string;
//   billing: string;
//   commission: string;
//   maxProducts: number;
//   isActive: boolean;
// };

// // ✅ Delete Package Modal
// function DeletePackageModal({
//   isOpen,
//   onClose,
//   pkg,
//   onConfirm,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   pkg: Package | null;
//   onConfirm: () => void;
// }) {
//   if (!pkg) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//               <Trash2 className="h-5 w-5 text-red-600" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Delete Package
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Are you sure you want to delete this package?
//               </p>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="space-y-4">
//           <p className="text-sm text-gray-700">
//             This will permanently delete{" "}
//             <span className="font-medium">{pkg.name}</span>. This action cannot
//             be undone.
//           </p>

//           <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
//             <div className="flex items-start gap-2">
//               <div className="w-4 h-4 bg-amber-400 rounded-full flex-shrink-0 mt-0.5" />
//               <div className="text-xs text-amber-800">
//                 <strong>Warning:</strong> Once deleted, this package will no
//                 longer be available.
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 pt-4">
//           <Button type="button" variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             className="bg-red-600 hover:bg-red-700 text-white"
//             onClick={onConfirm}
//           >
//             Delete
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function AdminPackages() {
//   const queryClient = useQueryClient();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selected, setSelected] = useState<Package | null>(null);
//   const [viewOnly, setViewOnly] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
//   const { toast } = useToast();

//   // ✅ Fetch packages
//   const { data: packages = [], isLoading } = useQuery<Package[]>({
//     queryKey: ["/api/admin/packages"],
//     queryFn: async () => {
//       const res = await fetch("/api/admin/packages", {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to fetch packages");
//       return res.json();
//     },
//   });

//   // ✅ Create
//   const createMutation = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await fetch("/api/admin/packages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Failed to create package");
//       return res.json();
//     },
//     onSuccess: () => {
//       toast({ title: "Created", description: "Package created successfully" });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
//       setModalOpen(false);
//     },
//   });

//   // ✅ Update
//   const updateMutation = useMutation({
//     mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
//       const res = await fetch(`/api/admin/packages/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Failed to update package");
//       return res.json();
//     },
//     onSuccess: () => {
//       toast({ title: "Updated", description: "Package updated successfully" });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
//       setModalOpen(false);
//     },
//   });

//   // ✅ Delete
//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const res = await fetch(`/api/admin/packages/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
//       return true;
//     },
//     onSuccess: () => {
//       toast({ title: "Deleted", description: "Package deleted successfully" });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
//       setDeleteModalOpen(false);
//       setPackageToDelete(null);
//     },
//   });

//   // ✅ Handlers
//   const handleCreate = (formData: any) => createMutation.mutate(formData);
//   const handleUpdate = (formData: any) =>
//     selected && updateMutation.mutate({ id: selected.id, payload: formData });

//   const handleOpenCreate = () => {
//     setSelected(null);
//     setViewOnly(false);
//     setModalOpen(true);
//   };

//   const handleOpenEdit = (pkg: Package) => {
//     setSelected(pkg);
//     setViewOnly(false);
//     setModalOpen(true);
//   };

//   const handleOpenView = (pkg: Package) => {
//     setSelected(pkg);
//     setViewOnly(true);
//     setModalOpen(true);
//   };

//   // ✅ Search
//   const filteredPackages = packages.filter(
//     (p) =>
//       !searchQuery ||
//       p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (isLoading) return <p className="p-4">Loading packages...</p>;

//   return (
//     <DashboardLayout title="Packages">
//       <div className="p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-xl font-semibold">Package Management</h1>
//           <div>
//             <button
//               onClick={handleOpenCreate}
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//             >
//               Add Package
//             </button>
//           </div>
//         </div>

//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             placeholder="Search by name or description..."
//             className="pl-10 w-80"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <Card>
//           <CardHeader className="text-lg font-medium p-4 border-b">
//             Packages
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Billing</TableHead>
//                   <TableHead>Commission</TableHead>
//                   <TableHead>Max Products</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredPackages.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={7}>No packages</TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredPackages.map((pkg: Package) => (
//                     <TableRow key={pkg.id}>
//                       <TableCell>{pkg.name}</TableCell>
//                       <TableCell>{pkg.price}</TableCell>
//                       <TableCell>{pkg.billing}</TableCell>
//                       <TableCell>{pkg.commission}</TableCell>
//                       <TableCell>{pkg.maxProducts}</TableCell>
//                       <TableCell>
//                         {pkg.isActive ? "Active" : "Inactive"}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex gap-2">
//                           <button onClick={() => handleOpenView(pkg)}>
//                             <Eye size={16} className="text-gray-600" />
//                           </button>
//                           <button onClick={() => handleOpenEdit(pkg)}>
//                             <Edit size={16} className="text-blue-600" />
//                           </button>
//                           <button
//                             onClick={() => {
//                               setDeleteModalOpen(true);
//                               setPackageToDelete(pkg);
//                             }}
//                           >
//                             <Trash2 size={16} className="text-red-600" />
//                           </button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Delete modal */}
//       {deleteModalOpen && (
//         <DeletePackageModal
//           isOpen={deleteModalOpen}
//           pkg={packageToDelete}
//           onClose={() => {
//             setDeleteModalOpen(false);
//             setPackageToDelete(null);
//           }}
//           onConfirm={() => {
//             if (packageToDelete) deleteMutation.mutate(packageToDelete.id);
//           }}
//         />
//       )}

//       {/* Create/Edit/View modal */}
//       <PackageModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         isEdit={!!selected}
//         initialData={selected || undefined}
//         viewOnly={viewOnly}
//         onSave={(form) => {
//           if (selected) handleUpdate(form);
//           else handleCreate(form);
//         }}
//       />
//     </DashboardLayout>
//   );
// }

// pages/AdminPackages.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import PackageModal from "@/components/modals/package-modal";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type Package = {
  id: string;
  name: string;
  description?: string;
  price: string;
  billing: string;
  commission: string;
  maxProducts: number;
  isActive: boolean;
};

// ✅ Delete Package Modal
function DeletePackageModal({
  isOpen,
  onClose,
  pkg,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("packages.deleteTitle")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("packages.deleteConfirmation")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {t("packages.deleteWarning")}{" "}
            <span className="font-medium">{pkg.name}</span>.{" "}
            {t("packages.actionCannotBeUndone")}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <strong>{t("packages.warningLabel")}</strong>{" "}
                {t("packages.deleteImpact")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            {t("common.delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPackages() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Package | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const { toast } = useToast();

  // ✅ Fetch packages
  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ["/api/admin/packages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/packages", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("packages.fetchError"));
      return res.json();
    },
  });

  // ✅ Create
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("packages.createError"));
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("packages.created"),
        description: t("packages.createSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setModalOpen(false);
    },
  });

  // ✅ Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("packages.updateError"));
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("packages.updated"),
        description: t("packages.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setModalOpen(false);
    },
  });

  // ✅ Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204)
        throw new Error(t("packages.deleteError"));
      return true;
    },
    onSuccess: () => {
      toast({
        title: t("packages.deleted"),
        description: t("packages.deleteSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setDeleteModalOpen(false);
      setPackageToDelete(null);
    },
  });

  // ✅ Handlers
  const handleCreate = (formData: any) => createMutation.mutate(formData);
  const handleUpdate = (formData: any) =>
    selected && updateMutation.mutate({ id: selected.id, payload: formData });

  const handleOpenCreate = () => {
    setSelected(null);
    setViewOnly(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setSelected(pkg);
    setViewOnly(false);
    setModalOpen(true);
  };

  const handleOpenView = (pkg: Package) => {
    setSelected(pkg);
    setViewOnly(true);
    setModalOpen(true);
  };

  // ✅ Search
  const filteredPackages = packages.filter(
    (p) =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <p className="p-4">{t("packages.loading")}</p>;

  return (
    <DashboardLayout title={t("packages.title")}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {t("packages.managementTitle")}
          </h1>
          <div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {t("packages.addPackage")}
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("packages.searchPlaceholder")}
            className="pl-10 w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="text-lg font-medium p-4 border-b">
            {t("packages.listTitle")}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("packages.name")}</TableHead>
                  <TableHead>{t("packages.price")}</TableHead>
                  <TableHead>{t("packages.billing")}</TableHead>
                  <TableHead>{t("packages.commission")}</TableHead>
                  <TableHead>{t("packages.maxProducts")}</TableHead>
                  <TableHead>{t("packages.status")}</TableHead>
                  <TableHead>{t("packages.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>{t("packages.noPackages")}</TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map((pkg: Package) => (
                    <TableRow key={pkg.id}>
                      <TableCell>{pkg.name}</TableCell>
                      <TableCell>{pkg.price}</TableCell>
                      <TableCell>{pkg.billing}</TableCell>
                      <TableCell>{pkg.commission}</TableCell>
                      <TableCell>{pkg.maxProducts}</TableCell>
                      <TableCell>
                        {pkg.isActive
                          ? t("packages.active")
                          : t("packages.inactive")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenView(pkg)}>
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button onClick={() => handleOpenEdit(pkg)}>
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalOpen(true);
                              setPackageToDelete(pkg);
                            }}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete modal */}
      {deleteModalOpen && (
        <DeletePackageModal
          isOpen={deleteModalOpen}
          pkg={packageToDelete}
          onClose={() => {
            setDeleteModalOpen(false);
            setPackageToDelete(null);
          }}
          onConfirm={() => {
            if (packageToDelete) deleteMutation.mutate(packageToDelete.id);
          }}
        />
      )}

      {/* Create/Edit/View modal */}
      <PackageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isEdit={!!selected}
        initialData={selected || undefined}
        viewOnly={viewOnly}
        onSave={(form) => {
          if (selected) handleUpdate(form);
          else handleCreate(form);
        }}
      />
    </DashboardLayout>
  );
}

