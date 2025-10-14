import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Clipboard, Check } from "lucide-react";
import { useCarriers } from "./hooks/useCarriers";
import { useToast } from "@/hooks/use-toast";
import { TrackingCode } from "./types/shipping";
import { useTranslation } from "react-i18next";

export const TrackingCodeGenerator = () => {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [generatedCode, setGeneratedCode] = useState<TrackingCode | null>(null);
  const [copied, setCopied] = useState(false);
  const { carriers } = useCarriers();
  const { toast } = useToast();

  const generateCode = () => {
    if (!selectedCarrier) {
      toast({
        title: t("tracking.errorTitle"),
        description: t("tracking.selectCarrier"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const carrierPrefix =
        carriers
          .find((c) => c.id === selectedCarrier)
          ?.name.substring(0, 2)
          .toUpperCase() || "XX";
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      const timestamp = Date.now().toString().slice(-8);

      const newCode: TrackingCode = {
        code: `${carrierPrefix}-${randomPart}-${timestamp}`,
        carrier: selectedCarrier,
        shipment_id: trackingId || `SHIP-${timestamp}`,
        generated_at: new Date().toISOString(),
        status: "active",
      };

      setGeneratedCode(newCode);
      setIsGenerating(false);

      toast({
        title: t("tracking.generatedTitle"),
        description: t("tracking.generatedDesc"),
      });
    }, 1500);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: t("tracking.copiedTitle"),
        description: t("tracking.copiedDesc"),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tracking.generatorTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tracking.carrier")}</label>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger>
                <SelectValue placeholder={t("tracking.selectCarrierPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id || ""}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("tracking.shipmentIdOptional")}
            </label>
            <Input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder={t("tracking.shipmentIdPlaceholder")}
            />
          </div>
        </div>

        <Button
          onClick={generateCode}
          disabled={isGenerating || !selectedCarrier}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("tracking.generating")}
            </>
          ) : (
            t("tracking.generateButton")
          )}
        </Button>

        {generatedCode && (
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">{t("tracking.generatedCode")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-3 bg-primary-foreground border rounded flex items-center justify-center">
              <p className="text-lg font-mono tracking-wider">
                {generatedCode.code}
              </p>
            </div>
            <div className="mt-4 text-xs space-y-1 text-muted-foreground">
              <p>
                {t("tracking.generatedOn")}:{" "}
                {new Date(generatedCode.generated_at).toLocaleString()}
              </p>
              <p>
                {t("tracking.shipmentId")}: {generatedCode.shipment_id}
              </p>
              <p>
                {t("tracking.status")}: {generatedCode.status}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingCodeGenerator;
