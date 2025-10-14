import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Données de démonstration pour les expéditions
const mockShipments = [
  {
    id: "EXP-2024-001",
    orderId: "CMD-1234",
    customerName: "Ahmed Benali",
    customerPhone: "0555123456",
    origin: "Alger",
    destination: "Oran",
    carrier: "Yalidine",
    status: "en_transit",
    trackingNumber: "YAL123456789",
    estimatedDelivery: "2024-12-28",
    actualDelivery: null,
    weight: "2.5 kg",
    value: "15000 DA",
    shippingCost: "800 DA",
    notes: "Livraison en main propre uniquement",
    createdAt: "2024-12-25T10:00:00Z",
  },
  {
    id: "EXP-2024-002",
    orderId: "CMD-1235",
    customerName: "Fatima Ouali",
    customerPhone: "0666987654",
    origin: "Constantine",
    destination: "Annaba",
    carrier: "Zoom Delivery",
    status: "livre",
    trackingNumber: "ZOM987654321",
    estimatedDelivery: "2024-12-26",
    actualDelivery: "2024-12-26T14:30:00Z",
    weight: "1.2 kg",
    value: "8500 DA",
    shippingCost: "600 DA",
    notes: "",
    createdAt: "2024-12-24T08:30:00Z",
  },
  {
    id: "EXP-2024-003",
    orderId: "CMD-1236",
    customerName: "Karim Mansouri",
    customerPhone: "0777456123",
    origin: "Alger",
    destination: "Tlemcen",
    carrier: "Yalidine",
    status: "en_preparation",
    trackingNumber: "YAL456789123",
    estimatedDelivery: "2024-12-30",
    actualDelivery: null,
    weight: "3.8 kg",
    value: "22000 DA",
    shippingCost: "1000 DA",
    notes: "Produit fragile - Manipulation avec précaution",
    createdAt: "2024-12-25T16:45:00Z",
  },
  {
    id: "EXP-2024-004",
    orderId: "CMD-1237",
    customerName: "Sarah Amrani",
    customerPhone: "0550321789",
    origin: "Oran",
    destination: "Setif",
    carrier: "Express DZ",
    status: "retarde",
    trackingNumber: "EXP321789456",
    estimatedDelivery: "2024-12-27",
    actualDelivery: null,
    weight: "0.8 kg",
    value: "5500 DA",
    shippingCost: "450 DA",
    notes: "Retard dû aux conditions météorologiques",
    createdAt: "2024-12-23T12:15:00Z",
  },
];

const EnhancedShipmentManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [shipments, setShipments] = useState(mockShipments);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_preparation":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t("shipping.status.preparation")}
          </Badge>
        );
      case "en_transit":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {t("shipping.status.transit")}
          </Badge>
        );
      case "livre":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("shipping.status.delivered")}
          </Badge>
        );
      case "retarde":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("shipping.status.delayed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("shipping.status.unknown")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_preparation":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "en_transit":
        return <Truck className="h-4 w-4 text-orange-600" />;
      case "livre":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "retarde":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (shipment: any) => {
    setSelectedShipment(shipment);
    setIsDetailsModalOpen(true);
  };

  const handleEditShipment = (shipment?: any) => {
    if (shipment) {
      setSelectedShipment(shipment);
      setIsDetailsModalOpen(true);
    } else {
      setIsDetailsModalOpen(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedShipment) return;

    const nextStatus = getNextStatus(selectedShipment.status);

    // Mettre à jour les expéditions
    const updatedShipments = shipments.map((shipment) =>
      shipment.id === selectedShipment.id
        ? { ...shipment, status: nextStatus }
        : shipment
    );

    setShipments(updatedShipments);
    setSelectedShipment({ ...selectedShipment, status: nextStatus });

    alert(
      t("shipping.updateSelectedStatusMessage", {
        status: getStatusLabel(nextStatus),
      })
    );
  };

  const handleUpdateShipmentStatus = (shipment: any) => {
    if (!shipment || shipment.status === "livre") return;

    const nextStatus = getNextStatus(shipment.status);

    // Mettre à jour les expéditions
    const updatedShipments = shipments.map((s) =>
      s.id === shipment.id ? { ...s, status: nextStatus } : s
    );

    setShipments(updatedShipments);
    alert(
      t("shipping.updateStatusMessage", {
        id: shipment.id,
        status: getStatusLabel(nextStatus),
      })
    );
  };

  const handleCreateNewShipment = () => {
    // Créer une nouvelle expédition avec des données par défaut
    const newShipment = {
      id: `EXP-2024-${String(shipments.length + 1).padStart(3, "0")}`,
      orderId: `CMD-${Math.floor(Math.random() * 9999)}`,
      customerName: t("shipping.create.defaultCustomerName"),
      customerPhone: "0555000000",
      origin: t("shipping.create.defaultOrigin"),
      destination: t("shipping.create.defaultDestination"),
      carrier: t("shipping.providers.yalidine"),
      status: "en_preparation",
      trackingNumber: `TRK${Math.floor(Math.random() * 999999999)}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      actualDelivery: null,
      weight: "1 kg",
      value: "10000 DA",
      shippingCost: "500 DA",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    setShipments([...shipments, newShipment]);
    setIsCreateModalOpen(false);
    alert(t("shipping.create.successMessage"));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "en_preparation":
        return "En préparation";
      case "en_transit":
        return "En transit";
      case "livre":
        return "Livré";
      case "retarde":
        return "Retardé";
      default:
        return "Inconnu";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      en_preparation: "en_transit",
      en_transit: "livre",
      livre: "livre",
      retarde: "en_transit",
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  const handleCreateShipment = () => {
    setIsCreateModalOpen(true);
  };
  const { t } = useTranslation();
  const CreateShipmentModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("shipping.create.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.orderNumber")}
              </label>
              <Input
                placeholder={t("shipping.create.orderNumberPlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.customer")}
              </label>
              <Input placeholder={t("shipping.create.customerPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.phone")}
              </label>
              <Input placeholder={t("shipping.create.phonePlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.carrier")}
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("shipping.create.carrierPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yalidine">
                    {t("shipping.providers.yalidine")}
                  </SelectItem>
                  <SelectItem value="zoom">
                    {t("shipping.providers.zoomDelivery")}
                  </SelectItem>
                  <SelectItem value="express">
                    {t("shipping.providers.expressDZ")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.origin")}
              </label>
              <Input placeholder={t("shipping.create.originPlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.destination")}
              </label>
              <Input
                placeholder={t("shipping.create.destinationPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.weight")}
              </label>
              <Input placeholder={t("shipping.create.weightPlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.value")}
              </label>
              <Input placeholder={t("shipping.create.valuePlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("shipping.create.shippingCost")}
              </label>
              <Input
                placeholder={t("shipping.create.shippingCostPlaceholder")}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("shipping.create.notes")}
            </label>
            <Textarea placeholder={t("shipping.create.notesPlaceholder")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateNewShipment}>
              {t("shipping.create.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ShipmentDetailsModal = () => (
    <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("shipping.details.title")} {selectedShipment?.id}
          </DialogTitle>
        </DialogHeader>
        {selectedShipment && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedShipment.status)}
              {getStatusBadge(selectedShipment.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.order")}
                </label>
                <p className="font-medium">{selectedShipment.orderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.trackingNumber")}
                </label>
                <p className="font-medium">{selectedShipment.trackingNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.customer")}
                </label>
                <p className="font-medium">{selectedShipment.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedShipment.customerPhone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.carrier")}
                </label>
                <p className="font-medium">{selectedShipment.carrier}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.origin")}
                </label>
                <p className="font-medium">{selectedShipment.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.destination")}
                </label>
                <p className="font-medium">{selectedShipment.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.weight")}
                </label>
                <p className="font-medium">{selectedShipment.weight}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.value")}
                </label>
                <p className="font-medium">{selectedShipment.value}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.shippingCost")}
                </label>
                <p className="font-medium">{selectedShipment.shippingCost}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("shipping.details.estimatedDelivery")}
              </label>
              <p className="font-medium">
                {new Date(
                  selectedShipment.estimatedDelivery
                ).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {selectedShipment.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("shipping.details.notes")}
                </label>
                <p className="font-medium">{selectedShipment.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleEditShipment}>
                <Edit className="h-4 w-4 mr-1" />
                {t("shipping.details.edit")}
              </Button>
              <Button onClick={handleUpdateStatus}>
                {t("shipping.details.updateStatus")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {t("shipping.management.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("shipping.management.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleCreateShipment}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("shipping.management.newShipment")}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {t("shipping.dashboard.total")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockShipments.length}</div>
            <p className="text-sm text-muted-foreground">
              {t("shipping.dashboard.shipments")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              {t("shipping.dashboard.inTransit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockShipments.filter((s) => s.status === "en_transit").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipping.dashboard.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t("shipping.dashboard.delivered")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockShipments.filter((s) => s.status === "livre").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipping.dashboard.completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t("shipping.dashboard.delayed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockShipments.filter((s) => s.status === "retarde").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shipping.dashboard.issues")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des expéditions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("shipments.listTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("shipments.listSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("shipments.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="en_preparation">
                  {t("shipments.statusPreparation")}
                </SelectItem>
                <SelectItem value="en_transit">
                  {t("shipments.statusTransit")}
                </SelectItem>
                <SelectItem value="livre">
                  {t("shipments.statusDelivered")}
                </SelectItem>
                <SelectItem value="retarde">
                  {t("shipments.statusDelayed")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("shipments.shipment")}</TableHead>
                  <TableHead>{t("shipments.client")}</TableHead>
                  <TableHead>{t("shipments.route")}</TableHead>
                  <TableHead>{t("shipments.carrier")}</TableHead>
                  <TableHead>{t("shipments.status")}</TableHead>
                  <TableHead>{t("shipments.estimatedDelivery")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shipment.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {shipment.orderId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {shipment.customerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {shipment.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {shipment.origin} → {shipment.destination}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        {shipment.carrier}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(
                          shipment.estimatedDelivery
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Bouton Voir détails */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(shipment)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 transition-colors"
                          title={t("shipments.viewDetails")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Bouton Modifier */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditShipment(shipment)}
                          className="h-8 w-8 p-0 hover:bg-green-50 transition-colors"
                          title={t("shipments.editShipment")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Bouton Mettre à jour le statut */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateShipmentStatus(shipment)}
                          className="h-8 w-8 p-0 hover:bg-orange-50 transition-colors"
                          disabled={shipment.status === "livre"}
                          title={
                            shipment.status === "livre"
                              ? t("shipments.alreadyDelivered")
                              : t("shipments.updateStatus")
                          }
                        >
                          {getStatusIcon(shipment.status)}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateShipmentModal />
      <ShipmentDetailsModal />
    </div>
  );
};

export default EnhancedShipmentManager;
