import React, { useState } from "react";
import {
  Store,
  ShoppingBag,
  BarChart2,
  ShieldCheck,
  Package,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const SellerBuyerTabs = () => {
  const [activeTab, setActiveTab] = useState("sellers");
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-cebleu-purple-200">
      <div className="grid grid-cols-2">
        <div
          className={`${
            activeTab === "sellers"
              ? "bg-gold-gradient text-cebleu-dark"
              : "bg-cebleu-purple-100/50 text-cebleu-gray-dark"
          } font-medium p-3 text-center cursor-pointer transition-colors`}
          onClick={() => setActiveTab("sellers")}
        >
          {t("index.becomeSeller")}
        </div>
        <div
          className={`${
            activeTab === "buyers"
              ? "bg-gold-gradient text-cebleu-dark"
              : "bg-cebleu-purple-100/50 text-cebleu-gray-dark"
          } font-medium p-3 text-center cursor-pointer transition-colors`}
          onClick={() => setActiveTab("buyers")}
        >
          {t("index.buyOnCebleu")}
        </div>
      </div>

      {activeTab === "sellers" && (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-cebleu-dark mb-2">
            {t("index.developBusiness")}
          </h2>
          <p className="text-gray-600 mb-6 text-sm">{t("index.expandReach")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-gold/10 rounded-full flex items-center justify-center mb-3">
                <Store className="text-cebleu-gold" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.createShop")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("index.buildOnlinePresence")}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-purple-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="text-cebleu-purple" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.showcaseProducts")}
              </h3>
              <p className="text-xs text-gray-500">{t("index.uploadPrice")}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-gold/10 rounded-full flex items-center justify-center mb-3">
                <BarChart2 className="text-cebleu-gold" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.analyzePerformance")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("index.optimizeSelling")}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/auth">
              <Button className="bg-cebleu-gold text-cebleu-dark hover:bg-cebleu-gold/90 group text-sm px-4 py-2 h-auto">
                {t("index.startSelling")}
                <ChevronRight className="ml-1" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "buyers" && (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-cebleu-dark mb-2">
            {t("index.ultimateShopping")}
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            {t("index.discoverQuality")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-gold/10 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="text-cebleu-gold" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.totalProtection")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("index.secureTransactions")}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-purple-100 rounded-full flex items-center justify-center mb-3">
                <Package className="text-cebleu-purple" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.fastShipping")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("index.rapidDelivery")}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cebleu-gold/10 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="text-cebleu-gold" size={24} />
              </div>
              <h3 className="font-medium text-sm mb-1">
                {t("index.hassleReturns")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("index.simpleReturns")}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/auth">
              <Button className="bg-cebleu-gold text-cebleu-dark hover:bg-cebleu-gold/90 group text-sm px-4 py-2 h-auto">
                {t("index.shopNow")}
                <ChevronRight className="ml-1" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerBuyerTabs;
