import React from "react";
import {
  HelpCircle,
  RefreshCcw,
  Store,
  ChevronRight,
  ShieldCheck,
  Gift,
  Star,
  BarChart2,
  Megaphone,
  TrendingUp,
  Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ServiceCard = ({
  icon,
  title,
  description,
  button = false,
  buttonText = "",
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  button?: boolean;
  buttonText?: string;
  className?: string;
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="icon-circle flex items-center justify-center w-8 h-8 rounded-full bg-cebleu-purple-50 border border-cebleu-purple-100 text-cebleu-dark">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-cebleu-purple-900">
          {title}
        </h3>
      </div>

      <div className="ml-11">
        {button ? (
          <div className="bg-cebleu-gray-light p-3 rounded-lg border border-cebleu-gold/20">
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <Button className="gold-button bg-cebleu-gold text-cebleu-dark hover:bg-cebleu-gold-rich text-xs py-1 h-8">
              {buttonText}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};

const ConfidenceCard = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-lg p-4 space-y-2 border border-cebleu-purple-200 shadow-sm mb-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-cebleu-purple-900">
        <ShieldCheck className="text-cebleu-gold" size={18} />
        {t("popSearches.shopConfidence")}
      </div>
      <p className="text-xs text-cebleu-purple-700">
        {t("popSearches.secureTransactions")}
      </p>
      <Button className="w-full bg-cebleu-gold text-cebleu-dark text-xs font-medium py-1 h-8 rounded-md hover:bg-cebleu-gold-rich transition-colors">
        {t("common.startShopping")}
      </Button>
    </div>
  );
};

const ExclusiveDealsCard = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-lg p-4 space-y-2 border border-cebleu-purple-200 shadow-sm mb-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-cebleu-purple-900">
        <Gift className="text-cebleu-gold" size={18} />
        {t("popSearches.exclusiveDeals")}
      </div>
      <p className="text-xs text-cebleu-purple-700">
        {t("popSearches.accessSpecial")}
      </p>
      <Button className="w-full border border-cebleu-gold text-cebleu-gold text-xs font-medium py-1 h-8 rounded-md hover:bg-cebleu-gold/10 transition-colors">
        {t("common.viewDeals")}
      </Button>
    </div>
  );
};

const GoldLevelCard = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-white to-cebleu-purple-50 rounded-lg p-4 border border-cebleu-purple-200 shadow-sm mb-4">
      <h3 className="flex items-center text-sm font-semibold text-cebleu-purple-900 pb-2 border-b border-cebleu-purple-100">
        <Star className="mr-1.5 text-cebleu-gold fill-cebleu-gold" size={16} />
        {t("popSearches.goldLevel")}
      </h3>
      <div className="mt-3 space-y-3">
        <div className="border-b border-cebleu-purple-100 pb-2">
          <ul className="space-y-1.5 pl-4">
            <li className="text-xs text-cebleu-purple-700 list-disc">
              {t("popSearches.premiumServices")}
            </li>
            <li className="text-xs text-cebleu-purple-700 list-disc">
              {t("popSearches.fastDelivery")}
            </li>
            <li className="text-xs text-cebleu-purple-700 list-disc">
              {t("popSearches.vipSupport")}
            </li>
          </ul>
        </div>

        <div className="pt-1">
          <h4 className="text-xs font-medium text-cebleu-purple-800 mb-2">
            🛠️ {t("popSearches.toolsServices")}
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center text-xs text-cebleu-purple-700">
              <Megaphone className="mr-2 h-3 w-3 text-cebleu-gold" />
              <span>📢 {t("popSearches.promoCreation")}</span>
            </li>
            <li className="flex items-center text-xs text-cebleu-purple-700">
              <BarChart2 className="mr-2 h-3 w-3 text-cebleu-gold" />
              <span>📊 {t("popSearches.advancedAnalytics")}</span>
            </li>

            <li className="flex items-center text-xs text-cebleu-purple-700">
              <TrendingUp className="mr-2 h-3 w-3 text-cebleu-gold" />
              <span>📈 {t("popSearches.internalAdvertising")}</span>
            </li>
            <li className="flex items-center text-xs text-cebleu-purple-700">
              <Video className="mr-2 h-3 w-3 text-cebleu-gold" />
              <span>🎥 {t("popSearches.exclusiveTraining")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const HeroContent = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 animate-fade-in flex flex-col py-2">
      <ConfidenceCard />
      <ExclusiveDealsCard />
      <GoldLevelCard />

      <ServiceCard
        icon={<HelpCircle size={18} className="text-cebleu-dark" />}
        title={t("popSearches.helpCenter")}
        description={t("popSearches.customerCare")}
        className="mt-3"
      />

      <ServiceCard
        icon={<RefreshCcw size={18} className="text-cebleu-dark" />}
        title={t("popSearches.easyReturn")}
        description={t("popSearches.quickRefund")}
        button
        buttonText={t("popSearches.learnMore")}
      />

      <ServiceCard
        icon={<Store size={18} className="text-cebleu-dark" />}
        title={t("popSearches.sellOnCebleu")}
        description={t("popSearches.millionsVisitors")}
      />
    </div>
  );
};

export default HeroContent;
