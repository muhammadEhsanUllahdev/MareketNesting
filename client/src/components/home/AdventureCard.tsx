import React from "react";
import { Button } from "@/components/ui/button";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { ChevronRight, Compass } from "lucide-react";
const AdventureCard = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="md:flex"></div>
    </div>
  );
};
export default AdventureCard;
