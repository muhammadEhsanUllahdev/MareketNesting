import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from "react-i18next";

const carrierAnalyticsData = [
  {
    name: 'Yalidine',
    onTime: 77.5,
    delayed: 17.5,
    failed: 5,
  },
  {
    name: 'Noest Express',
    onTime: 82.3,
    delayed: 14.2,
    failed: 3.5,
  },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  improvement: boolean;
  suffix?: string;
}

const StatCard = ({ title, value, change, improvement, suffix = '' }: StatCardProps) => {
  return (
    <div className="bg-white rounded-md p-4 border">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-semibold">{value}{suffix}</p>
        <div className={`flex items-center text-sm ${improvement ? 'text-green-600' : 'text-red-600'}`}>
          {improvement ? '▲' : '▼'} {change}
        </div>
      </div>
    </div>
  );
};

export const CarrierAnalytics = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("carrier.analytics.title")}</CardTitle>
        <CardDescription>
          {t("carrier.analytics.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={carrierAnalyticsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, '']}
                labelFormatter={(label) => `${t("carrier.analytics.carrier")}: ${label}`}
              />
              <Legend formatter={(value) => {
                const labels: Record<string, string> = {
                  onTime: t("carrier.analytics.onTime"),
                  delayed: t("carrier.analytics.delayed"),
                  failed: t("carrier.analytics.failed")
                };
                return labels[value] || value;
              }} />
              <Bar dataKey="onTime" name={t("carrier.analytics.onTime")} fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name={t("carrier.analytics.delayed")} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name={t("carrier.analytics.failed")} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title={t("carrier.analytics.onTime")}
            value="77.5"
            change="12%"
            improvement={true}
            suffix="%"
          />
          <StatCard 
            title={t("carrier.analytics.avgDeliveryTime")}
            value="2.4"
            change="8%"
            improvement={true}
            suffix={` ${t("carrier.analytics.days")}`}
          />
          <StatCard 
            title={t("carrier.analytics.successRate")}
            value="94.2"
            change="3.5%"
            improvement={true}
            suffix="%"
          />
        </div>

        <div className="border rounded-md">
          <div className="border-b p-3 bg-gray-50">
            <p className="font-medium">{t("carrier.analytics.statsByCarrier")}</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t("carrier.analytics.carrier")}</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">{t("carrier.analytics.onTime")}</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">{t("carrier.analytics.delayed")}</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">{t("carrier.analytics.failed")}</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">{t("carrier.analytics.status")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">{t("shipping.providers.yalidine")}</td>
                <td className="text-center p-3">77.5%</td>
                <td className="text-center p-3">17.5%</td>
                <td className="text-center p-3">5.0%</td>
                <td className="text-center p-3">
                  <Badge className="bg-green-100 text-green-800">{t("carrier.analytics.good")}</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-3">{t("shipping.providers.noestExpress")}</td>
                <td className="text-center p-3">82.3%</td>
                <td className="text-center p-3">14.2%</td>
                <td className="text-center p-3">3.5%</td>
                <td className="text-center p-3">
                  <Badge className="bg-green-100 text-green-800">{t("carrier.analytics.excellent")}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
