import React from "react";
import {
  Star,
  ShoppingBag,
  HelpCircle,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Gift,
  Megaphone,
  BarChart2,
  Edit,
  TrendingUp,
  Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const PopularSearches = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Shop with Confidence */}
      <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-lg p-5 space-y-3 border border-cebleu-purple-200 shadow-md">
        <div className="flex items-center gap-2 text-sm font-semibold text-cebleu-purple-900">
          <ShieldCheck className="text-cebleu-gold" size={20} />
          {t("popSearches.shopConfidence")}
        </div>
        <p className="text-xs text-cebleu-purple-700">
          {t("popSearches.secureTransactions")}
        </p>
        <button className="w-full bg-cebleu-gold text-cebleu-dark text-xs font-medium py-2.5 rounded-md hover:bg-cebleu-gold-rich transition-colors">
          {t("common.startShopping")}
        </button>
      </div>

      {/* Exclusive Deals bloc */}
      <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-lg p-5 space-y-3 border border-cebleu-purple-200 shadow-md">
        <div className="flex items-center gap-2 text-sm font-semibold text-cebleu-purple-900">
          <Gift className="text-cebleu-gold" size={20} />
          {t("popSearches.exclusiveDeals")}
        </div>
        <p className="text-xs text-cebleu-purple-700">
          {t("popSearches.accessSpecial")}
        </p>
        <button className="w-full border border-cebleu-gold text-cebleu-gold text-xs font-medium py-2.5 rounded-md hover:bg-cebleu-gold/10 transition-colors">
          {t("common.viewDeals")}
        </button>
      </div>

      {/* Niveau Or */}
      <div className="bg-gradient-to-br from-white to-cebleu-purple-50 rounded-lg p-5 border border-cebleu-purple-200 shadow-md">
        <h3 className="flex items-center text-sm font-semibold text-cebleu-purple-900 pb-2 border-b border-cebleu-purple-100">
          <Star
            className="mr-1.5 text-cebleu-gold fill-cebleu-gold"
            size={16}
          />
          {t("popSearches.goldLevel")}
        </h3>
        <div className="mt-3 space-y-3">
          <div className="border-b border-cebleu-purple-100 pb-3">
            <ul className="space-y-2 pl-4">
              <li className="text-sm text-cebleu-purple-700 list-disc">
                {t("popSearches.premiumServices")}
              </li>
              <li className="text-sm text-cebleu-purple-700 list-disc">
                {t("popSearches.fastDelivery")}
              </li>
              <li className="text-sm text-cebleu-purple-700 list-disc">
                {t("popSearches.vipSupport")}
              </li>
            </ul>
          </div>

          <div className="pt-1">
            <h4 className="text-sm font-medium text-cebleu-purple-800 mb-2">
              🛠️ {t("popSearches.toolsServices")}
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center text-sm text-cebleu-purple-700">
                <Megaphone className="mr-2 h-4 w-4 text-cebleu-gold" />
                <span>📢 {t("popSearches.promoCreation")}</span>
              </li>
              <li className="flex items-center text-sm text-cebleu-purple-700">
                <BarChart2 className="mr-2 h-4 w-4 text-cebleu-gold" />
                <span>📊 {t("popSearches.advancedAnalytics")}</span>
              </li>

              <li className="flex items-center text-sm text-cebleu-purple-700">
                <TrendingUp className="mr-2 h-4 w-4 text-cebleu-gold" />
                <span>📈 {t("popSearches.internalAdvertising")}</span>
              </li>
              <li className="flex items-center text-sm text-cebleu-purple-700">
                <Video className="mr-2 h-4 w-4 text-cebleu-gold" />
                <span>🎥 {t("popSearches.exclusiveTraining")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Center and other sections in one card */}
      <div className="bg-gradient-to-br from-cebleu-purple-50 to-white rounded-lg p-5 space-y-4 border border-cebleu-purple-200 shadow-md">
        {/* Help Center */}
        <div>
          <h3 className="flex items-center text-sm font-semibold text-cebleu-purple-900 pb-2 border-b border-cebleu-purple-100">
            <HelpCircle className="mr-1.5 text-cebleu-gold" size={18} />
            {t("popSearches.helpCenter")}
          </h3>
          <p className="mt-2 text-sm text-cebleu-purple-700">
            {t("popSearches.customerCare")}
          </p>
        </div>

        {/* Easy Return */}
        <div className="pt-2 border-t border-cebleu-purple-100">
          <h3 className="flex items-center text-sm font-semibold text-cebleu-purple-900 pb-2">
            <ArrowLeft className="mr-1.5 text-cebleu-gold" size={18} />
            {t("popSearches.easyReturn")}
          </h3>
          <p className="text-sm text-cebleu-purple-700">
            {t("popSearches.quickRefund")}
          </p>
          <button className="mt-2 bg-cebleu-gold/10 text-cebleu-purple-800 hover:text-cebleu-dark rounded-md px-4 py-1.5 text-xs font-medium">
            {t("popSearches.learnMore")}
          </button>
        </div>

        {/* Sell on CEBLEU */}
        <div className="pt-2 border-t border-cebleu-purple-100">
          <h3 className="flex items-center text-sm font-semibold text-cebleu-purple-900 pb-2">
            <ShoppingCart className="mr-1.5 text-cebleu-gold" size={18} />
            {t("popSearches.sellOnCebleu")}
          </h3>
          <p className="text-sm text-cebleu-purple-700">
            {t("popSearches.millionsVisitors")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopularSearches;
