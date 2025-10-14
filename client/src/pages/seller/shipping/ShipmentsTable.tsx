import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from 'react-i18next';

interface ShipmentsTableProps {
  shipments: any[];
  onViewDetails: (shipment: any) => void;
  isLoading: boolean;
}

export const ShipmentsTable: React.FC<ShipmentsTableProps> = ({
  shipments,
  onViewDetails,
  isLoading
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">{t("shipment.loading")}</p>
        </div>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-10">
        <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">{t("shipment.empty.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("shipment.empty.subtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("shipment.table.trackingNumber")}</TableHead>
            <TableHead>{t("shipment.table.customer")}</TableHead>
            <TableHead>{t("shipment.table.carrier")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("shipment.table.origin")}</TableHead>
            <TableHead>{t("shipment.table.destination")}</TableHead>
            <TableHead>{t("shipment.table.status")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("shipment.table.estimatedDate")}</TableHead>
            <TableHead className="text-right">{t("shipment.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
              <TableCell>{shipment.customer_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>{shipment.carrier?.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{shipment.origin}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{shipment.destination}</span>
                </div>
              </TableCell>
              <TableCell><StatusBadge status={shipment.status} /></TableCell>
              <TableCell className="hidden md:table-cell">
                {shipment.estimated_delivery 
                  ? new Date(shipment.estimated_delivery).toLocaleDateString('fr-FR') 
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(shipment)}
                >
                  {t("shipment.table.viewDetails")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShipmentsTable;
