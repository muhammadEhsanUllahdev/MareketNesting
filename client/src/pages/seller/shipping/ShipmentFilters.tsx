import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Truck, MapPin, Calendar } from "lucide-react";
import { Carrier } from "./types/shipping";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// Algerian wilaya options for location filtering
const ALGERIA_WILAYAS = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Batna",
  "Sétif",
  "Sidi Bel Abbès",
  "Biskra",
  "Tlemcen",
  "Tizi Ouzou",
  "Béjaïa",
  "Tiaret",
  "Djelfa",
];

interface ShipmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedCarrier: string;
  setSelectedCarrier: (carrier: string) => void;
  carriers: Carrier[];
}

export const ShipmentFilters: React.FC<ShipmentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedCarrier,
  setSelectedCarrier,
  carriers,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-2 justify-between">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("shipment.filters.searchPlaceholder")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("shipment.filters.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("shipment.filters.allStatuses")}
              </SelectItem>
              <SelectItem value="delivered">
                {t("shipment.status.delivered")}
              </SelectItem>
              <SelectItem value="in_transit">
                {t("shipment.status.inTransit")}
              </SelectItem>
              <SelectItem value="pending">
                {t("shipment.status.pending")}
              </SelectItem>
              <SelectItem value="delayed">
                {t("shipment.status.delayed")}
              </SelectItem>
              <SelectItem value="returned">
                {t("shipment.status.returned")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("shipment.filters.allCarriers")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("shipment.filters.allCarriers")}
              </SelectItem>
              <SelectItem value="maystro">
                {t("shipment.carriers.maystro")}
              </SelectItem>
              <SelectItem value="yalidine">
                {t("shipment.carriers.yalidine")}
              </SelectItem>
              <SelectItem value="noest">
                {t("shipment.carriers.noest")}
              </SelectItem>
              {carriers.map(
                (carrier) =>
                  carrier.name !== "Maystro Delivery" &&
                  carrier.name !== "Yalidine Express" &&
                  carrier.name !== "Noest DZ" && (
                    <SelectItem key={carrier.id} value={carrier.id || ""}>
                      {carrier.name}
                    </SelectItem>
                  )
              )}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t("shipment.filters.advancedFilters")}
          </Button>

          <Button className="bg-green-600 hover:bg-green-700">
            <Plus size={16} className="mr-2" />
            {t("shipment.filters.newShipment")}
          </Button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {t("shipment.filters.destination")}
            </label>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("shipment.filters.allDestinations")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("shipment.filters.allDestinations")}
                </SelectItem>
                {ALGERIA_WILAYAS.map((wilaya) => (
                  <SelectItem key={wilaya} value={wilaya.toLowerCase()}>
                    {wilaya}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              {t("shipment.filters.shippingDate")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy")
                    : t("shipment.filters.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Truck className="h-4 w-4 mr-1" />
              {t("shipment.filters.serviceType")}
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder={t("shipment.filters.allServices")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("shipment.filters.allServices")}
                </SelectItem>
                <SelectItem value="standard">
                  {t("shipment.filters.standard")}
                </SelectItem>
                <SelectItem value="express">
                  {t("shipment.filters.express")}
                </SelectItem>
                <SelectItem value="cod">{t("shipment.filters.cod")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentFilters;
