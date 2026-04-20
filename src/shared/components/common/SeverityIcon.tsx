import { forwardRef } from 'react';
import severityCritical from '@/assets/severity-critical.png';
import severityMajor from '@/assets/severity-major.png';
import severityMinor from '@/assets/severity-minor.png';
import { Severity } from '@/shared/types';
import { cn } from '@/shared/lib/utils';

interface SeverityIconProps {
  severity: Severity;
  className?: string;
}

const severityIcons: Record<Severity, string | null> = {
  Critical: severityCritical,
  Major: severityMajor,
  Minor: severityMinor,
  Low: null,
  Info: null,
};

export const SeverityIcon = forwardRef<HTMLImageElement, SeverityIconProps>(
  ({ severity, className }, ref) => {
    const icon = severityIcons[severity];
    
    if (!icon) {
      return null;
    }
    
    return (
      <img 
        ref={ref}
        src={icon} 
        alt={`${severity} severity`}
        className={cn("h-4 w-4 object-contain opacity-80", className)}
      />
    );
  }
);

SeverityIcon.displayName = 'SeverityIcon';
