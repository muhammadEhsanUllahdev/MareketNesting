import React from 'react';
import { FileBarChart, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface ShipmentsHeaderProps {
  onDownloadReport: () => void;
  onShareReport: () => void;
  alertsCount?: number;
}

export const ShipmentsHeader: React.FC<ShipmentsHeaderProps> = ({
  onDownloadReport,
  onShareReport,
  alertsCount = 0
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("shipments.header.title")}</h1>
        <p className="text-muted-foreground">{t("shipments.header.subtitle")}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {alertsCount > 0 && (
          <Button variant="destructive" className="gap-1">
            <Bell className="h-4 w-4" />
            {t("shipments.header.alerts")}
            <Badge className="ml-1 bg-white text-red-500 hover:bg-gray-100">{alertsCount}</Badge>
          </Button>
        )}
        <Button variant="outline" onClick={onDownloadReport}>
          <FileBarChart className="mr-2 h-4 w-4" />
          {t("shipments.header.exportData")}
        </Button>
        <Button className="bg-primary" onClick={onShareReport}>
          <TrendingUp className="mr-2 h-4 w-4" />
          {t("shipments.header.performanceReport")}
        </Button>
      </div>
    </div>
  );
};

export default ShipmentsHeader;
