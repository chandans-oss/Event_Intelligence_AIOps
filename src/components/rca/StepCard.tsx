import React from 'react';
import '@/styles/rcaPlayground.css';

interface StepCardProps {
    step: {
        step: number;
        title: string;
        icon?: string;
        sub?: string;
        mini?: string;
        data: Record<string, any>;
        is_final?: boolean;
        is_loading?: boolean;
    };
}

const KPI_MAP: Record<string, [string, string]> = {
    "utilization_percent": ["B/W Util", "%"],
    "util_pct": ["B/W Util", "%"],
    "cpu_percent": ["CPU Util", "%"],
    "cpu_pct": ["CPU Util", "%"],
    "mem_percent": ["Mem Util", "%"],
    "mem_util_pct": ["Mem Util", "%"],
    "men_util_pct": ["Mem Util", "%"],
    "temp_c": ["Device Temperature", " ℃"],
    "latency_ms": ["Latency", " ms"],
    "packet_loss_percent": ["Packet Loss", "%"],
    "traffic_dscp0_percent": ["DSCP0 Traffic", "%"],
    "in_errors": ["Input Errors", " pkts"],
    "crc_errors": ["CRC Errors", " pkts"],
    "out_discards": ["Output Errors", " pkts"],
    "queue_depth": ["Buffer Util", " pkts"],
    "buffer_util": ["Buffer Util", " pkts"],
    "fan_speed": ["Fan Speed", " rpm"],
    "power_watt": ["Power Supply", " watt"]
};

const formatValue = (key: string, value: any) => {
    if (React.isValidElement(value)) {
        return value;
    }

    if (typeof value === 'object' && value !== null) {
        // If it's formatted metrics
        if (key === 'KPIs' || key === 'signals') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {Object.entries(value).map(([device, metrics]: [string, any]) => (
                        <div key={device} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--rca-text-primary)' }}>Device: {device}</div>
                            {Object.entries(metrics).map(([mk, mv]) => {
                                const [name, unit] = KPI_MAP[mk] || [mk, ''];
                                return (
                                    <div key={mk} style={{ fontSize: '0.85rem' }}>
                                        • {name}: {String(mv)}{unit}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            );
        }

        if (Array.isArray(value)) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {value.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px' }}>
                            <span>•</span>
                            <span>{String(item)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(value, null, 2)}</pre>;
    }

    return String(value);
};

export const StepCard: React.FC<StepCardProps> = ({ step }) => {
    return (
        <div className={`rca-card ${step.is_final ? 'final' : ''} ${step.is_loading ? 'loading' : ''}`}>
            <div className="rca-step-title">
                {step.icon || '📍'} {step.title}
                {step.is_final && <span className="step-badge"></span>}
            </div>
            {step.sub && <div className="rca-step-sub" dangerouslySetInnerHTML={{ __html: step.sub }} />}

            <div className="rca-grid">
                {Object.entries(step.data).map(([k, v]) => (
                    <React.Fragment key={k}>
                        <div className="rca-k">{k}</div>
                        <div className="rca-v">{formatValue(k, v)}</div>
                    </React.Fragment>
                ))}
            </div>

            {step.mini && !step.is_loading && (
                <div className="rca-mini">
                    <span>✔</span> {step.mini}
                </div>
            )}

            {step.is_loading && (
                <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--rca-text-secondary)', fontWeight: 500 }}>
                    Processing step logic...
                </div>
            )}
        </div>
    );
};
