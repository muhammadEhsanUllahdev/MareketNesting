import React, { useState } from "react";
import { Eye, Download, Filter, Search, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TrackingDetails from "./TrackingDetails";
import { useTranslation } from "react-i18next";

interface TrackingItem {
  id: string;
  packageId: string;
  customerName: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: string;
  lastUpdate: string;
  carrier: string;
}

interface PackageTrackingListProps {
  trackingData: TrackingItem[];
}

export const PackageTrackingList: React.FC<PackageTrackingListProps> = ({
  trackingData,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<TrackingItem | null>(
    null
  );
  const [activeView, setActiveView] = useState("list");

  const filteredData = trackingData.filter((item) => {
    const matchesSearch =
      item.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (item: TrackingItem) => {
    setSelectedPackage(item);
    setActiveView("details");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case t("tracking.status.delivered"):
      case "livré":
        return (
          <Badge className="bg-green-500">
            {t("tracking.status.delivered")}
          </Badge>
        );
      case t("tracking.status.in_transit"):
      case "en transit":
        return (
          <Badge className="bg-blue-500">
            {t("tracking.status.in_transit")}
          </Badge>
        );
      case t("tracking.status.pending"):
      case "en préparation":
        return (
          <Badge className="bg-yellow-500">
            {t("tracking.status.pending")}
          </Badge>
        );
      case t("tracking.status.delayed"):
      case "retardé":
        return (
          <Badge className="bg-red-500">{t("tracking.status.delayed")}</Badge>
        );
      default:
        return <Badge>{t("tracking.status.unknown")}</Badge>;
    }
  };

  return (
    <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="list">{t("tracking.list")}</TabsTrigger>
        {selectedPackage && (
          <TabsTrigger value="details">
            {t("tracking.details_for")} #{selectedPackage.packageId}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="list" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("tracking.search_placeholder")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("tracking.all_status")}</option>
                <option value="livré">{t("tracking.status.delivered")}</option>
                <option value="en transit">
                  {t("tracking.status.in_transit")}
                </option>
                <option value="en préparation">
                  {t("tracking.status.pending")}
                </option>
                <option value="retardé">{t("tracking.status.delayed")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tracking.package_id")}</TableHead>
                <TableHead>{t("tracking.customer")}</TableHead>
                <TableHead>{t("tracking.origin")}</TableHead>
                <TableHead>{t("tracking.destination")}</TableHead>
                <TableHead>{t("tracking.status_title")}</TableHead>
                <TableHead>{t("tracking.estimated_delivery")}</TableHead>
                <TableHead className="text-right">
                  {t("tracking.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.packageId}
                  </TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.origin}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.destination}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{" "}
                    {new Date(item.estimatedDelivery).toLocaleDateString(
                      "fr-FR"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Eye className="h-4 w-4 mr-1" />{" "}
                      {t("tracking.view_details")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </TabsContent>

      <TabsContent value="details">
        {selectedPackage && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {t("tracking.package_details")} #{selectedPackage.packageId}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPackage(null);
                  setActiveView("list");
                }}
              >
                {t("tracking.back_to_list")}
              </Button>
            </div>

            <TrackingDetails trackingItem={selectedPackage} />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
