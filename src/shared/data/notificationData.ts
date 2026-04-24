import { Severity } from '../types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: Severity;
  read: boolean;
  type: 'alert' | 'system' | 'remediation';
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'New Root Cause Identified',
    message: 'High-confidence RCA identified for Cluster CLU-LC-001 (Link Congestion).',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    severity: 'Critical',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-2',
    title: 'Remediation Successful',
    message: 'Automated QoS throttle applied to core-router-dc1 successfully.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'Info',
    read: true,
    type: 'remediation'
  },
  {
    id: 'notif-3',
    title: 'System Maintenance',
    message: 'Scheduled maintenance for Correlation Engine starting at 02:00 AM.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'Major',
    read: false,
    type: 'system'
  },
  {
    id: 'notif-4',
    title: 'High CPU Alert',
    message: 'app-server-05 CPU utilization crossed 90% threshold.',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    severity: 'Major',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-5',
    title: 'BGP Flap Detected',
    message: 'BGP session flap detected on router-dc-east-01.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    severity: 'Major',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-6',
    title: 'New Knowledge Base Article',
    message: 'A new guide for SSL Certificate Expiry has been added.',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    severity: 'Info',
    read: false,
    type: 'system'
  }
];
