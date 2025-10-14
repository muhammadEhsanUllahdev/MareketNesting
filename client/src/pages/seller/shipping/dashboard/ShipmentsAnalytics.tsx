import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileBarChart, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CARRIERS_DATA = [
  { name: 'Maystro Delivery', cost: 45, percentage: 35 },
  { name: 'Yalidine Express', cost: 56, percentage: 43 },
  { name: 'Noest DZ', cost: 28, percentage: 22 }
];

const DELIVERY_STATUS = [
  { status: 'deliveryStatus.delivered', count: 67, percentage: 67, color: 'bg-green-500' },
  { status: 'deliveryStatus.inTransit', count: 25, percentage: 25, color: 'bg-blue-500' },
  { status: 'deliveryStatus.delayed', count: 5, percentage: 5, color: 'bg-amber-500' },
  { status: 'deliveryStatus.failed', count: 3, percentage: 3, color: 'bg-red-500' }
];

export const ShipmentsAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            {t("shipmentsAnalytics.costAnalysis")}
          </CardTitle>
          <CardDescription>{t("shipmentsAnalytics.costDistribution")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CARRIERS_DATA.map((carrier) => (
              <div key={carrier.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{carrier.name}</span>
                  <span className="font-medium">{carrier.cost} 000 DA</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${carrier.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right text-muted-foreground">
                  {carrier.percentage}% {t("shipmentsAnalytics.ofCosts")}
                </div>
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t("shipmentsAnalytics.totalCost")}</p>
                  <p className="text-lg font-bold">129 000 DA</p>
                </div>
                <div className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% {t("shipmentsAnalytics.thisMonth")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("shipmentsAnalytics.deliveryRate")}
          </CardTitle>
          <CardDescription>{t("shipmentsAnalytics.successVsFailure")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {DELIVERY_STATUS.map((status) => (
                <div 
                  key={status.status}
                  className="h-24 flex-1 flex flex-col justify-end rounded-t-lg overflow-hidden"
                >
                  <div
                    className={`${status.color} h-0 transition-all duration-700`}
                    style={{ height: `${status.percentage}%` }}
                  ></div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DELIVERY_STATUS.map((status) => (
                <div key={status.status} className="text-center">
                  <div className={`h-3 w-3 ${status.color} rounded-full mx-auto mb-1`}></div>
                  <p className="text-xs font-medium">{t(status.status)}</p>
                  <p className="text-lg font-bold">{status.count}</p>
                  <p className="text-xs text-muted-foreground">{status.percentage}%</p>
                </div>
              ))}
            </div>
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-50 p-2 rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-orange-500 mr-1.5" />
                    <span className="text-sm">{t("shipmentsAnalytics.avgDelay")}</span>
                  </div>
                  <span className="font-medium">2.3 {t("shipmentsAnalytics.days")}</span>
                </div>
                <div className="bg-red-50 p-2 rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" />
                    <span className="text-sm">{t("shipmentsAnalytics.delays")}</span>
                  </div>
                  <span className="font-medium">8 {t("shipmentsAnalytics.packages")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentsAnalytics;
