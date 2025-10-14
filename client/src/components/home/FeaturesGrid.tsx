import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg p-6 h-full flex flex-col border border-cebleu-purple-200 shadow-md bg-gradient-to-br from-white to-cebleu-blue-extra-pale">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-3 text-cebleu-purple-dark">
            {t("index.maximizeSales")}
          </h2>
          <p className="text-sm text-cebleu-purple-700 mb-4">
            {t("index.leverageTools")}
          </p>
          <Button className="bg-cebleu-gold text-cebleu-dark hover:bg-cebleu-gold-rich text-sm h-9 px-4 mx-auto">
            {t("index.exploreTools")} <ArrowRight className="ml-1" size={14} />
          </Button>
        </div>
        <div className="mt-auto flex justify-center">
          <img
            alt="Tableau de Bord d'Analytique"
            className="rounded-md w-full max-w-[220px] h-auto shadow-sm"
            src="/lovable-uploads/b62cf8e5-cf2c-41ec-8372-82ee496531d2.png"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 h-full flex flex-col border border-cebleu-purple-200 shadow-md bg-gradient-to-br from-white to-cebleu-blue-extra-pale">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-3 text-cebleu-purple-dark">
            {t("index.discoverUniqueProducts")}
          </h2>
          <p className="text-sm text-cebleu-purple-700 mb-4">
            {t("index.browseThousands")}
          </p>
          <Button className="bg-cebleu-gold text-cebleu-dark hover:bg-cebleu-gold-rich flex items-center justify-center text-sm h-9 px-4 mx-auto">
            {t("index.startBuying")} <ArrowRight className="ml-1" size={14} />
          </Button>
        </div>
        <div className="mt-auto flex justify-center">
          <img
            alt="Marketplace"
            src="/lovable-uploads/ad33cdde-3fc1-46be-9746-30992b60cf4c.png"
            className="rounded-md w-full max-w-[220px] h-auto shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;
