import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Truck, Clock, AlertTriangle, RefreshCw, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status,
  showIcon = true,
  size = 'md' 
}) => {
  const { t } = useTranslation();

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs py-0 px-1.5';
      case 'lg': return 'text-sm py-1 px-3';
      default: return 'text-xs py-0.5 px-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-2.5 w-2.5 mr-0.5';
      case 'lg': return 'h-4 w-4 mr-1.5';
      default: return 'h-3 w-3 mr-1';
    }
  };

  const sizeClass = getSizeClass();
  const iconSize = getIconSize();

  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'livré':
      return <Badge className={`bg-green-500 hover:bg-green-600 ${sizeClass}`}>
        {showIcon && <CheckCircle className={iconSize} />}
        {t('status.delivered')}
      </Badge>;
    case 'in_transit':
    case 'en transit':
      return <Badge className={`bg-blue-500 hover:bg-blue-600 ${sizeClass}`}>
        {showIcon && <Truck className={iconSize} />}
        {t('status.inTransit')}
      </Badge>;
    case 'pending':
    case 'en préparation':
      return <Badge className={`bg-yellow-500 hover:bg-yellow-600 ${sizeClass}`}>
        {showIcon && <Package className={iconSize} />}
        {t('status.pending')}
      </Badge>;
    case 'processing':
    case 'traitement':
      return <Badge className={`bg-indigo-500 hover:bg-indigo-600 ${sizeClass}`}>
        {showIcon && <Clock className={iconSize} />}
        {t('status.processing')}
      </Badge>;
    case 'delayed':
    case 'retardé':
      return <Badge className={`bg-red-500 hover:bg-red-600 ${sizeClass} animate-pulse`}>
        {showIcon && <AlertTriangle className={iconSize} />}
        {t('status.delayed')}
      </Badge>;
    case 'returned':
    case 'retourné':
      return <Badge className={`bg-purple-500 hover:bg-purple-600 ${sizeClass}`}>
        {showIcon && <RefreshCw className={iconSize} />}
        {t('status.returned')}
      </Badge>;
    default:
      return <Badge variant="outline" className={sizeClass}>{t('status.unknown')}</Badge>;
  }
};

export default StatusBadge;
