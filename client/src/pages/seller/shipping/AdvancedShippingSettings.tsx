import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from "react-i18next";

const shippingSettingsSchema = z.object({
  maxWeight: z.number().min(0).optional(),
  defaultDimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }),
  webhookUrl: z.string().url().optional().or(z.string().length(0)),
  webhookEnabled: z.boolean().default(false),
});

export const AdvancedShippingSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof shippingSettingsSchema>>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      maxWeight: 15,
      defaultDimensions: {
        length: 30,
        width: 20,
        height: 15,
      },
      webhookUrl: '',
      webhookEnabled: false,
    },
  });

  function onSubmit(values: z.infer<typeof shippingSettingsSchema>) {
    setIsSaving(true);
    console.log("Saving shipping settings:", values);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: t("shipping.settings.savedTitle"),
        description: t("shipping.settings.savedDescription"),
      });
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shipping.settings.advancedTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="limits" className="w-full">
              <TabsList>
                <TabsTrigger value="limits">{t("shipping.settings.packageLimits")}</TabsTrigger>
                <TabsTrigger value="webhooks">{t("shipping.settings.webhooks")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="limits" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="maxWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("shipping.settings.maxWeight")}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("shipping.settings.maxWeightDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">{t("shipping.settings.defaultDimensionsTitle")}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultDimensions.length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("shipping.settings.length")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="defaultDimensions.width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("shipping.settings.width")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="defaultDimensions.height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("shipping.settings.height")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("shipping.settings.defaultDimensionsDescription")}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="webhooks" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="webhookEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("shipping.settings.enableWebhooks")}</FormLabel>
                        <FormDescription>
                          {t("shipping.settings.enableWebhooksDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("shipping.settings.webhookUrl")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("shipping.settings.webhookUrlPlaceholder")} 
                          {...field} 
                          disabled={!form.watch("webhookEnabled")}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("shipping.settings.webhookUrlDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">{t("shipping.settings.important")}</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {t("shipping.settings.importantDescription")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? t("common.saving") : t("shipping.settings.saveButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdvancedShippingSettings;
