import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getAlertsForProject } from '../utils/alertUtils';

interface AlertTrianglesProps {
  projectId: string;
}

export function AlertTriangles({ projectId }: AlertTrianglesProps) {
  const allAlerts = getAlertsForProject(projectId);
  const alerts = allAlerts.filter(alert => alert.color === 'red' || alert.color === 'yellow');

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-1.5 justify-start text-zinc-500 font-medium text-[11px] select-none">
        <CheckCircle2 className="w-4 h-4 stroke-white shrink-0" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
        <span>No alerts</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-start">
      {alerts.map((alert) => {
        let fill = '';
        let stroke = '';
        let textColor = '';
        
        let cleanTitle = alert.title;
        if (cleanTitle.endsWith(' (last 3 cycles)')) {
          cleanTitle = cleanTitle.replace(' (last 3 cycles)', '');
        }
        
        if (alert.color === 'red') {
          fill = '#F44336';
          stroke = '#F44336';
          textColor = '#ffffff';
        } else if (alert.color === 'yellow') {
          fill = '#FFC107';
          stroke = '#FFC107';
          textColor = '#ffffff';
        } else {
          fill = '#4CAF50';
          stroke = '#4CAF50';
          textColor = '#ffffff';
        }

        return (
          <div 
            key={alert.number} 
            className="relative flex items-center justify-center select-none group/alert cursor-help z-10 hover:z-40"
          >
            {/* Custom Inline SVG for Triangle to fit the number inside perfectly */}
            <svg 
              width="22" 
              height="20" 
              viewBox="0 0 22 20" 
              className="transition-transform group-hover/alert:scale-110"
            >
              <polygon 
                points="11,1 21,19 1,19" 
                fill={fill} 
                stroke={stroke} 
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span 
              className="absolute font-extrabold text-[9px] text-center"
              style={{ 
                color: textColor, 
                top: '52%', 
                left: '50%', 
                transform: 'translate(-50%, -40%)' 
              }}
            >
              {alert.number}
            </span>
 
            {/* Custom PMR style Tooltip */}
            <div 
              className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-[130px] px-2 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/alert:opacity-100 transition-all pointer-events-none text-center leading-normal shadow-lg scale-95 origin-bottom group-hover/alert:scale-100"
              style={{ 
                zIndex: 100,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textWrap: 'balance'
              }}
            >
              <span>{alert.number}. {cleanTitle}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 -translate-y-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}


