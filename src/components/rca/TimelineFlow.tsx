import React from 'react';
import '@/styles/rcaPlayground.css';

interface TimelineFlowProps {
    steps: Array<{
        step: number;
        title: string;
        tl_title?: string;
        tl_desc?: string;
    }>;
    currentIdx: number;
}

export const TimelineFlow: React.FC<TimelineFlowProps> = ({ steps, currentIdx }) => {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="rca-timeline-container">
            {steps.map((step, index) => {
                const isDone = index < currentIdx;
                const isCurrent = index === currentIdx;
                const isPending = index > currentIdx;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <div className={`rca-tl-line ${isDone || isCurrent ? 'done' : ''}`} />
                        )}
                        <div
                            className={`rca-tl-box ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
                            id={`tl-step-${index}`}
                        >
                            <div className="tl-title-text">{step.tl_title || step.title}</div>
                            <small className="tl-status-text">
                                {isDone ? (step.tl_desc || 'Done') :
                                    isCurrent ? (step.tl_desc || 'In Progress...') :
                                        'Pending...'}
                            </small>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
