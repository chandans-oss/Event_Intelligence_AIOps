import { Severity } from '@/shared/types';

export interface RedesignedEvent {
  id: string;
  resource: string;
  issueIcon: 'database' | 'router' | 'server' | 'network';
  issueText: string;
  severity: Severity;
  count: number;
  date: string;
  alarmId: string;
  node: string;
  nodeIp: string;
  alertValue: string;
  acknowledged: boolean;
  clusterId: string;
}

export const redesignedMockEvents: RedesignedEvent[] = [
  {
    id: '1',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177394',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '789041397 ms',
    acknowledged: false,
    clusterId: 'CLU-NET-004'
  },
  {
    id: '2',
    resource: 'Oracle Slow Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded slow query threshold',
    severity: 'Critical',
    count: 446,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177390',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '6912282 ms',
    acknowledged: false,
    clusterId: 'CLU-LC-001'
  },
  {
    id: '3',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177385',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '71110692 ms',
    acknowledged: false,
    clusterId: 'CLU-12345'
  },
  {
    id: '4',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177392',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '89426356 ms',
    acknowledged: false,
    clusterId: 'CLU-003'
  },
  {
    id: '5',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177387',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '78022346 ms',
    acknowledged: false,
    clusterId: 'CLU-12347'
  },
  {
    id: '6',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177384',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '64687807 ms',
    acknowledged: false,
    clusterId: 'CLU-12348'
  },
  {
    id: '7',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177382',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '2431792070 ms',
    acknowledged: false,
    clusterId: 'CLU-NET-004'
  },
  {
    id: '8',
    resource: 'Oracle Big Queries',
    issueIcon: 'database',
    issueText: 'Query exceeded big query threshold',
    severity: 'Critical',
    count: 223,
    date: 'Apr 23, 2026 12:47 PM',
    alarmId: '26113177381',
    node: '10.0.4.166',
    nodeIp: '10.0.4.166',
    alertValue: '131867028 ms',
    acknowledged: false,
    clusterId: 'CLU-LC-001'
  }
];
