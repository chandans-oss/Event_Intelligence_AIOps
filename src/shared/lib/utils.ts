import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMetricLabel = (str: string) => {
    if (!str) return '';
    const map: Record<string, string> = {
        'cpu_pct': 'CPU Util',
        'cpu_util': 'CPU Util',
        'cpu_percent': 'CPU Util',
        'cpu': 'CPU Util',
        'crc_errors': 'CRC Errors',
        'crc_error': 'CRC Errors',
        'crc': 'CRC Errors',
        'queue_depth': 'Buffer Util',
        'buffer_util': 'Buffer Util',
        'latency_ms': 'Latency',
        'latency': 'Latency',
        'lat_ms': 'Latency',
        'lat': 'Latency',
        'util_pct': 'B/W Util',
        'utilization_percent': 'B/W Util',
        'util': 'B/W Util',
        'mem_util_pct': 'Mem Util',
        'mem_util': 'Mem Util',
        'mem_percent': 'Mem Util',
        'men_util_pct': 'Mem Util',
        'bw_util': 'B/W Util'
    };

    const lower = str.toLowerCase();
    if (map[lower]) return map[lower];

    return str
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|[^a-zA-Z0-9])([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
        .replace(/Cpu/g, 'CPU')
        .replace(/Crc/g, 'CRC')
        .replace(/Queue Depth/g, 'Buffer Util')
        .replace(/Latency Ms/g, 'Latency')
        .replace(/Util Pct/g, 'B/W Util')
        .replace(/Cpu Pct/g, 'CPU Util')
        .replace(/Mem Util Pct/g, 'Mem Util')
        .replace(/Men Util Pct/g, 'Mem Util');
};
