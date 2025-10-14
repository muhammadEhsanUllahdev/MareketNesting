import React from 'react';
import { Package, MapPin, Calendar, Truck, Phone, User, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface TrackingItem {
  id: string;
  packageId: string;
  customerName: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: string;
  lastUpdate: string;
  carrier: string;
}

interface TrackingDetailsProps {
  trackingItem: TrackingItem;
  onClose?: () => void;
}

// Enhanced function to get tracking steps based on status
const getTrackingSteps = (trackingItem: TrackingItem) => {
  const currentDate = new Date();
  const shipDate = new Date(currentDate);
  shipDate.setDate(currentDate.getDate() - 3);
  
  const transitDate = new Date(currentDate);
  transitDate.setDate(currentDate.getDate() - 2);
  
  const delayDate = new Date(currentDate);
  delayDate.setDate(currentDate.getDate() - 1);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const steps = [
    {
      date: formatDate(shipDate),
      time: "08:30",
      location: trackingItem.origin,
      status: "Colis reçu",
      description: "Le colis a été reçu au centre de distribution.",
      isActive: true,
      icon: "package"
    },
    {
      date: formatDate(shipDate),
      time: "10:15",
      location: trackingItem.origin,
      status: "En préparation",
      description: "Le colis est en cours de préparation pour l'expédition.",
      isActive: ["pending", "in_transit", "delayed", "delivered", "returned", "en préparation", "en transit", "retardé", "livré", "retourné"].includes(trackingItem.status.toLowerCase()),
      icon: "processing"
    },
    {
      date: formatDate(transitDate),
      time: "07:45",
      location: trackingItem.origin,
      status: "Expédié",
      description: "Le colis a quitté le centre de distribution d'origine.",
      isActive: ["in_transit", "delayed", "delivered", "returned", "en transit", "retardé", "livré", "retourné"].includes(trackingItem.status.toLowerCase()),
      icon: "shipping"
    }
  ];
  
  if (["in_transit", "delayed", "delivered", "returned", "en transit", "retardé", "livré", "retourné"].includes(trackingItem.status.toLowerCase())) {
    steps.push({
      date: formatDate(transitDate),
      time: "14:20",
      location: "Centre de tri",
      status: "En transit",
      description: "Le colis est en transit vers sa destination.",
      isActive: true,
      icon: "transit"
    });
  }
  
  if (["delayed", "retardé"].includes(trackingItem.status.toLowerCase())) {
    steps.push({
      date: formatDate(delayDate),
      time: "09:30",
      location: "Centre de transit",
      status: "Retardé",
      description: "La livraison est retardée en raison de conditions météorologiques.",
      isActive: true,
      icon: "delay"
    });
  }

  if (["returned", "retourné"].includes(trackingItem.status.toLowerCase())) {
    steps.push({
      date: formatDate(currentDate),
      time: "11:20",
      location: trackingItem.destination,
      status: "Retourné",
      description: "Le colis a été retourné à l'expéditeur.",
      isActive: true,
      icon: "return"
    });
  }
  
  if (["delivered", "livré"].includes(trackingItem.status.toLowerCase())) {
    steps.push({
      date: formatDate(currentDate),
      time: "16:45",
      location: trackingItem.destination,
      status: "Livré",
      description: "Le colis a été livré avec succès.",
      isActive: true,
      icon: "delivered"
    });
  }
  
  return steps;
};

// Icon renderer based on step type
const renderStepIcon = (iconType: string) => {
  switch (iconType) {
    case "package":
      return <Package className="h-5 w-5 text-blue-500" />;
    case "processing":
      return <RefreshCw className="h-5 w-5 text-yellow-500" />;
    case "shipping":
      return <Truck className="h-5 w-5 text-indigo-500" />;
    case "transit":
      return <Truck className="h-5 w-5 text-blue-500" />;
    case "delay":
      return <Calendar className="h-5 w-5 text-red-500" />;
    case "delivered":
      return <MapPin className="h-5 w-5 text-green-500" />;
    case "return":
      return <RefreshCw className="h-5 w-5 text-purple-500" />;
    default:
      return <Package className="h-5 w-5 text-gray-500" />;
  }
};

const TrackingDetails: React.FC<TrackingDetailsProps> = ({ trackingItem }) => {
  const { t } = useTranslation();
  const trackingSteps = getTrackingSteps(trackingItem);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'livré':
        return 'bg-green-100 text-green-800';
      case 'in_transit':  
      case 'en transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'en préparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
      case 'retardé':
        return 'bg-red-100 text-red-800';
      case 'returned':
      case 'retourné':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Package Info Card */}
        <Card className="p-4 md:col-span-1 bg-white">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> {t('tracking.package_info')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Package className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tracking.tracking_number')}</p>
                <p className="font-medium">{trackingItem.packageId}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Truck className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tracking.carrier')}</p>
                <p className="font-medium">{trackingItem.carrier}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tracking.estimated_delivery')}</p>
                <p className="font-medium">{new Date(trackingItem.estimatedDelivery).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-1">{t('tracking.current_status')}</p>
              <Badge className={`${getStatusClass(trackingItem.status)} px-3 py-1`}>
                {trackingItem.status}
              </Badge>
            </div>
          </div>
        </Card>
        
        {/* Customer & Shipping Info Card */}
        <Card className="p-4 md:col-span-2 bg-white">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> {t('tracking.delivery_details')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('tracking.customer')}</p>
                  <p className="font-medium">{trackingItem.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('tracking.contact')}</p>
                  <p className="font-medium">+33 6 12 34 56 78</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('tracking.origin')}</p>
                  <p className="font-medium">{trackingItem.origin}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('tracking.destination')}</p>
                  <p className="font-medium">{trackingItem.destination}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tracking Timeline Card */}
      <Card className="p-4 bg-white">
        <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" /> {t('tracking.history')}
        </h3>
        <div className="relative">
          {trackingSteps.map((step, index) => (
            <div key={index} className="flex mb-8 last:mb-0">
              <div className="mr-4 relative">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.isActive 
                    ? 'bg-primary-50 border-primary' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {renderStepIcon(step.icon)}
                </div>
                {index < trackingSteps.length - 1 && (
                  <div className={`absolute top-12 bottom-0 left-5 w-0.5 ${
                    step.isActive && trackingSteps[index + 1].isActive 
                      ? 'bg-primary' 
                      : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                  <div>
                    <p className={`font-medium ${step.isActive ? 'text-primary' : 'text-gray-500'}`}>{t(`tracking.step.${step.status.toLowerCase().replace(/\s/g, '_')}`, step.status)}</p>
                    <p className="text-sm text-gray-500">{step.location}</p>
                  </div>
                  <p className={`text-sm ${step.isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                    {new Date(step.date).toLocaleDateString('fr-FR')} {step.time}
                  </p>
                </div>
                <p className={`text-sm ${step.isActive ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TrackingDetails;
