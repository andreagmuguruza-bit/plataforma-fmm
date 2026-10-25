import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { ArrowLeft, Database, Mic, FileText, CheckCircle, Upload, FileSearch, TrendingUp, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  ComposedChart, Line, Legend, Area, LabelList
} from 'recharts';
import { History, CheckCircle2, RotateCcw, ClipboardCheck, Loader2 } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useQualitativeData } from '../hooks/useQualitativeData';
import { useGASPortfolioData } from '../hooks/useGASPortfolioData';
import { AlertTriangles } from './AlertTriangles';
import { getAlertsForProject, getAlertTagForProject } from '../utils/alertUtils';

const getDotColor = (status: string) => {
  const s = String(status || '').toUpperCase().trim();
  if (s === 'SATISFACTORY') return '#4CAF50';
  if (s === 'ALERT') return '#FFC107';
  if (s === 'PROBLEM') return '#F44336';
  return '#9CA3AF'; // N/A
};

const formatPMR = (pmr: string) => {
  const str = String(pmr || '').toUpperCase().trim();
  if (str === 'N/A' || str === 'NA') return 'N/A';
  return str ? str.charAt(0) + str.slice(1).toLowerCase() : '';
};

const getDotIcon = (status: string) => {
  const s = String(status || '').toUpperCase();
  if (s.includes('SATISFACTORY')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  }
  if (s.includes('ALERT')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  }
  if (s.includes('PROBLEM')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
  }
  return null;
};

const getLineColor = (s1: string, s2: string) => {
  const c1 = getDotColor(s1);
  const c2 = getDotColor(s2);
  if (c1 === '#4CAF50' && c2 === '#4CAF50') return '#4CAF50';
  if (c1 === '#9CA3AF' || c2 === '#9CA3AF') return '#D1D5DB';
  if (c1 === '#F44336' || c2 === '#F44336') return '#F44336';
  return '#FFC107';
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatCurrencyM = (val: number) => {
  return `$${Math.round(val)}M`;
};

const formatOperationStatus = (rawStatus: string | undefined | null): string => {
  if (!rawStatus) return 'N/A';
  const str = String(rawStatus).trim();
  const upper = str.toUpperCase();

  if (upper.startsWith('DI -') || upper.startsWith('DI-') || upper === 'DI' || upper.includes('DISBURSING') || upper.includes('DESEMBOLSANDO')) {
    return 'DI - Disbursing';
  }
  if (upper.startsWith('AF -') || upper.startsWith('AF-') || upper === 'AF' || upper.includes('APPROVED BY THE BOARD') || upper.includes('APROBADO POR DIRECTORIO')) {
    return 'AF - Approved by the Board';
  }
  if (upper.startsWith('FD -') || upper.startsWith('FD-') || upper === 'FD' || upper.includes('FULLY DISBURSED') || upper.includes('TOTALMENTE DESEMBOLSADO')) {
    return 'FD - Fully disbursed';
  }
  if (upper.startsWith('EF -') || upper.startsWith('EF-') || upper === 'EF' || upper.includes('EFFECTIVE') || upper.includes('EFECTIVO')) {
    return 'EF - Effective';
  }
  if (upper.startsWith('EL -') || upper.startsWith('EL-') || upper === 'EL' || upper.includes('ELIGIBLE') || upper.includes('ELEGIBLE')) {
    return 'EL - Eligible';
  }
  if (upper.startsWith('CO -') || upper.startsWith('CO-') || upper === 'CO' || upper.startsWith('CL -') || upper.includes('CLOSED') || upper.includes('CERRADO')) {
    return 'CO - Closed';
  }
  if (upper.startsWith('CA -') || upper.startsWith('CA-') || upper === 'CA' || upper.startsWith('CF -') || upper.includes('CANCELLED') || upper.includes('CANCELADO')) {
    return 'CA - Cancelled';
  }
  if (upper.startsWith('AP -') || upper.startsWith('AP-') || upper === 'AP' || upper.includes('APPROVED')) {
    return 'AP - Approved';
  }
  if (upper.startsWith('PE -') || upper.startsWith('PE-') || upper === 'PE' || upper.includes('PENDING ELIGIBILITY')) {
    return 'PE - Pending eligibility';
  }
  if (upper.startsWith('SI -') || upper.startsWith('SI-') || upper === 'SI' || upper.includes('SIGNED') || upper.includes('FIRMA')) {
    return 'SI - Signed';
  }
  if (upper.startsWith('IP -') || upper.startsWith('IP-') || upper === 'IP' || upper.includes('IN PREPARATION') || upper.includes('EN PREPARACIÓN')) {
    return 'IP - In preparation';
  }

  const match = str.match(/^([A-Za-z0-9]+)\s*[-–]\s*([^-–]+)/);
  if (match) {
    const code = match[1].toUpperCase();
    const rawDesc = match[2].trim();
    const titleDesc = rawDesc.charAt(0).toUpperCase() + rawDesc.slice(1).toLowerCase();
    return `${code} - ${titleDesc}`;
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatDateDDMMMYYYY = (dateStr: string | undefined | null): string => {
  if (!dateStr || String(dateStr).trim() === '' || String(dateStr).trim().toUpperCase() === 'N/A' || String(dateStr).trim().toUpperCase() === 'PENDING') {
    return 'N/A';
  }
  const s = String(dateStr).trim();
  const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  if (ymdMatch) {
    const year = ymdMatch[1];
    const monthIdx = parseInt(ymdMatch[2], 10) - 1;
    const day = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day}/${months[monthIdx]}/${year}`;
    }
  }

  const dmyAlphaMatch = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{2,4})$/);
  if (dmyAlphaMatch) {
    const day = String(parseInt(dmyAlphaMatch[1], 10)).padStart(2, '0');
    const monthStr = dmyAlphaMatch[2].slice(0, 3).toUpperCase();
    let year = dmyAlphaMatch[3];
    if (year.length === 2) year = `20${year}`;
    return `${day}/${monthStr}/${year}`;
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return s;
};

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
  onNavigateToAlert?: (alertNumber: number, alertTitle: string) => void;
  initialTab?: 'baseline' | 'interview' | 'qa' | 'midterm' | 'critical_procurement';
}

const CustomFileSearchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="10" y2="9" />
  </svg>
);

const DollarIcon = ({ className }: { className?: string }) => (
  <div className={`font-bold flex items-center justify-center leading-none ${className}`}>
    $
  </div>
);

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Filter out duplicate entries based on name to avoid showing "Disbursed" twice
    const uniquePayload = payload.reduce((acc: any[], current: any) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm z-50">
        <p className="font-bold text-[#005173] mb-2 border-b border-zinc-100 pb-1">{label}</p>
        {uniquePayload.map((entry: any, index: number) => {
          const displayValue = entry.dataKey === 'baselineDisplay' ? entry.payload.baseline : entry.value;
          const isDisbursed = entry.name === 'Disbursed Amount ($M)' || entry.name === 'Cumulative Disbursed Amount' || entry.name === 'Disbursed Amount';
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
          
          const code = entry.payload?.projectCode || entry.payload?.projectId;
          const isCoCumulativeProjection = (code === 'CO-L1164') && (entry.name === 'Cumulative Baseline Projection' || entry.name === 'Current Projection ($M)' || entry.name === 'Current Projection' || entry.dataKey === 'cumulativeProjection');
          const formattedValue = isCoCumulativeProjection 
            ? (displayValue || 0).toFixed(1)
            : Math.round(displayValue || 0).toLocaleString();

          const labelName = entry.name.endsWith(' ($M)') ? entry.name.slice(0, -5) : entry.name;

          return (
            <p key={index} className={`mb-1 ${isMobile ? 'text-[9.5px]' : 'text-xs'}`}>
              <span className={`font-bold ${isDisbursed ? 'text-[#005173]' : 'text-zinc-500'}`}>{labelName}:</span> ${formattedValue}M
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const CustomChart1Tooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const uniquePayload = payload.reduce((acc: any[], current: any) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);

    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm z-50">
        <p className="font-bold text-[#005173] mb-2 border-b border-zinc-100 pb-1">{label}</p>
        {uniquePayload.map((entry: any, index: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          const isDisbursed = String(entry.name).toLowerCase().includes('disburs');
          const val = Number(entry.value).toFixed(1);
          return (
            <p key={index} className="mb-1 text-xs">
              <span className={`font-bold ${isDisbursed ? 'text-[#005173]' : 'text-zinc-500'}`}>{entry.name}:</span> US${val}M
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const CustomStackedLabel = (props: any) => {
  const { x, y, width, height, value, fill } = props;
  if (value === 0 || value == null) return null;
  
  // Rule 2: Hide labels if segment is too small (< 25px)
  // Recharts passes width/height of the bar segment.
  const isHorizontal = width > height * 2; // Heuristic to detect orientation
  if (isHorizontal && width < 25) return null;
  if (!isHorizontal && height < 25) return null;

  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill={fill || "#ffffff"} 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 11} 
      fontWeight={500}
    >
      {value}
    </text>
  );
};

const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value, payload } = props;
  if (value == null) return null;
  const barVal = Number(value);
  if (barVal === 0) return null;

  // Retrieve actual disbursed value from payload
  const disbRaw = payload?.line_actual_disbursed ?? payload?.disbursed ?? payload?.combinedDisbursed;
  const hasDisb = disbRaw !== null && disbRaw !== undefined && disbRaw !== '';
  const disbVal = hasDisb ? Number(disbRaw) : null;

  // Default: slightly above the top of the bar
  let dy = -10;

  if (hasDisb && disbVal !== null) {
    const diff = barVal - disbVal;
    const absDiff = Math.abs(diff);

    // When baseline bar top and disbursed line dot are close (within 4M),
    // line dot label is placed cleanly ABOVE the point (yLine - 12).
    // The bar label is placed BELOW the point/bar top to avoid collision.
    if (absDiff <= 4) {
      if (diff >= 0) {
        // Bar is slightly taller than or equal to dot (e.g. 2020: 16.3 vs 15.3)
        // Place bar label inside the bar below the dot
        dy = 18;
      } else {
        // Bar is slightly shorter than dot (e.g. 2021: 17.5 vs 19.0)
        // Place bar label below the dot inside the bar
        dy = 16;
      }
    } else {
      dy = -10;
    }
  }

  return (
    <text 
      x={x + width / 2} 
      y={y + dy} 
      fill="#52525b" 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 11} 
      fontWeight={500}
    >
      ${barVal.toFixed(1)}
    </text>
  );
};

const renderCustomLineLabel = (props: any) => {
  const { x, y, value } = props;
  if (value == null) return null;

  // Disbursed amount label ALWAYS sits cleanly ABOVE the point (dot)
  const labelY = y - 12;

  return (
    <text 
      x={x} 
      y={labelY} 
      fill="#18181b" 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 11} 
      fontWeight={600}
    >
      ${Number(value).toFixed(1)}
    </text>
  );
};

const renderProjectionLabel = (props: any) => {
  const { x, y, value, payload, projectCode } = props;
  if (value == null || value === 0) return null;
  
  const code = projectCode || payload?.projectCode || payload?.projectId;
  const formattedValue = (code === 'CO-L1164') ? value.toFixed(1) : Math.round(value);
  
  return (
    <text 
      x={x} 
      y={y + 20} 
      fill="#94a3b8" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 11} 
      fontWeight={500}
    >
      ${formattedValue}
    </text>
  );
};

const renderTextToDataURL = (text: string, font: string, color: string, maxWidth: number = 1000): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const scale = 2;
  ctx.font = font;
  
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  const fontSizeMatch = font.match(/\d+px/);
  const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[0]) : 16;
  const lineHeight = fontSize * 1.3;
  
  let actualMaxWidth = 0;
  lines.forEach(l => {
    const w = ctx.measureText(l).width;
    if (w > actualMaxWidth) actualMaxWidth = w;
  });
  
  canvas.width = (actualMaxWidth + 10) * scale;
  canvas.height = (lines.length * lineHeight + 10) * scale;
  
  ctx.scale(scale, scale);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  
  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), 0, i * lineHeight);
  });
  
  return canvas.toDataURL('image/png');
};

const countryCodes: Record<string, string> = {
  'Colombia': 'co',
  'Peru': 'pe',
  'Brazil': 'br',
  'Argentina': 'ar',
  'Uruguay': 'uy',
  'Paraguay': 'py',
  'Chile': 'cl',
  'Ecuador': 'ec',
  'Suriname': 'sr',
  'Mexico': 'mx',
  'Panama': 'pa',
  'Belize': 'bz',
  'Bolivia': 'bo',
  'Costa Rica': 'cr',
  'Dominican Republic': 'do',
  'El Salvador': 'sv',
  'Guatemala': 'gt',
  'Honduras': 'hn',
  'Nicaragua': 'ni',
};

interface EvaluationPillar {
  name: string;
  findings: string[];
  actions: string[];
}

const EVALUATION_DATA: Record<string, EvaluationPillar[]> = {
  'PN-L1161': [
    {
      name: 'Gobernanza',
      findings: [
        'Escaso funcionamiento del Comité de Dirección Estratégica del Programa (CDEP).',
        'Escasa articulación PATDAT con las Autoridades y con las áreas operativas de la DGI, lo cual afecta la gestión y la apropiación.'
      ],
      actions: [
        'Promover el relanzamiento del CDEP.',
        'Impulsar la involucración de la Alta Dirección.'
      ]
    },
    {
      name: 'Seguimiento de resultados',
      findings: [
        'Ejecución enfocada en los productos sin seguimiento indicadores de resultado e impacto.',
        'No hay relevamiento de las fuentes de información necesarias.'
      ],
      actions: [
        'Impulsar desde el Banco el seguimiento de los indicadores de resultados e impacto.',
        'Brindar asistencia técnica, de ser necesaria.'
      ]
    },
    {
      name: 'Adquisiciones',
      findings: [
        'Procesos con gran cantidad de pasos debido a normativa. El diseño no contempló adecuadamente esta restricción.',
        'TDR de productos tecnológicos complejos para el Ejecutor.'
      ],
      actions: [
        'Plan de Acción simplificado seleccionando productos clave.',
        'Asistencia técnica para la elaboración de TDR complejos.'
      ]
    }
  ],
  'PN-L1172': [
    {
      name: 'Gobernanza',
      findings: [
        'Existe muy buen nivel de direccionamiento estratégico e involucración de parte del Viceministerio de Economía. Ello genera momentum, decisión y apropiación.'
      ],
      actions: [
        'Seguimiento de este modelo de gestión de la gobernanza.',
        'Apoyar desde el Banco en lo que sea necesario.'
      ]
    },
    {
      name: 'Seguimiento de resultados',
      findings: [
        'Ejecución enfocada en los productos sin seguimiento indicadores de resultado e impacto.',
        'No hay relevamiento de las fuentes de información necesarias.'
      ],
      actions: [
        'Impulsar desde el Banco el seguimiento de los indicadores de resultados e impacto.',
        'Brindar asistencia técnica.'
      ]
    },
    {
      name: 'Adquisiciones',
      findings: [
        'Procesos con gran cantidad de revisiones que inciden en los plazos de contratación y, con ello, en la ejecución.'
      ],
      actions: [
        'Identificar los motivos por los cuales los procesos deben ser revisados múltiples veces.'
      ]
    },
    {
      name: 'Capacidades',
      findings: [
        'Al comenzar el trabajo se identificaron diferencias sustantivas de capacidades tecnológicas y de recursos humanos entre entidades'
      ],
      actions: [
        'Favorecer, desde el proyecto, el fortalecimiento de capacidades tecnológicas de organismos del EFI.'
      ]
    },
    {
      name: 'Enfoque y modalidad de ejecución',
      findings: [
        'La modificación de la modalidad y el enfoque de la ejecución, en 2025, facilitó alinear las expectativas estratégicas de las Autoridades'
      ],
      actions: [
        'Continuar apoyando esta modalidad de ejecución.'
      ]
    },
    {
      name: 'Coordinación estratégica de operaciones del Banco',
      findings: [
        'Hay 3 operaciones que abordan la digitalización e interoperabilidad desde el banco. Es necesario fortalecer la articulación entre estas.'
      ],
      actions: [
        'Identificar posibilidades de mejora en la articulación y sinergia entre proyectos.'
      ]
    }
  ]
};

// Temporarily disabled per user request: "elimina por ahora el tab de midterm evaluations de todos los proyectos que lo tienen actualmente, mas adelante lo volveremos a incorporar"
const MIDTERM_PROJECT_IDS: string[] = [
  /*
  'BL-L1038', 'BR-L1550', 'BR-L1539', 'UR-L1193', 'PN-L1172', 'EC-L1253',
  'BR-L1540', 'CO-L1245', 'SU-L1060', 'BR-L1513', 'BR-L1525', 'UR-L1164',
  'BR-L1592', 'PN-L1161'
  */
];

export default function ProjectView({ project, onBack, onUpdate, onNavigateToAlert, initialTab }: ProjectViewProps) {
  const projectCode = project.id;
  const gasData = useGASPortfolioData();
  const selectedProjId = project.id || (project as any).projectNumber;
  const hidePmrHistoricEvaluation = selectedProjId === 'HO-L1261' || selectedProjId === 'PE-L1303' || project.id === 'HO-L1261' || project.id === 'PE-L1303';

  const gasProjectRow = React.useMemo(() => {
    const list = [...(gasData.active_portfolio_table || []), ...(gasData.inactive_pmr_table || [])];
    return list.find(
      r => (r.projectNumber && String(r.projectNumber).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase()) ||
           (r.operationNumber && String(r.operationNumber).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase())
    );
  }, [gasData.active_portfolio_table, gasData.inactive_pmr_table, selectedProjId]);

  const { getProjectDetails, loading: dataLoading } = usePortfolioData();
  const rawDetails = getProjectDetails(project.id);
  const details = React.useMemo(() => {
    if (rawDetails) return rawDetails;
    const inactiveRow = gasProjectRow;
    const approved = Number(inactiveRow?.currentApprovedAmount || 0);
    const approvedFull = approved >= 100000 ? approved : approved * 1000000;
    const approvedM = approved >= 100000 ? approved / 1000000 : approved;
    const disbursed = Number(inactiveRow?.disbursedLifeAmount || 0);
    const disbursedFull = disbursed >= 100000 ? disbursed : disbursed * 1000000;
    const disbursedM = disbursed >= 100000 ? disbursed / 1000000 : disbursed;
    const percent = Number(inactiveRow?.disbursedLifePercent || 0);

    return {
      id: selectedProjId,
      name: inactiveRow?.title || project.name || '',
      country: inactiveRow?.countryName || project.country || '',
      countryCode: inactiveRow?.countryCode || project.countryCode || '',
      countryName: inactiveRow?.countryName || project.countryName || '',
      ttl: inactiveRow?.ttl || project.ttl || '',
      pmrStatus: 'N/A',
      operationStatus: inactiveRow?.operationStatus || 'CO - Closed',
      executingAgency: inactiveRow?.executingAgency || '',
      linkedLoans: inactiveRow?.operationNumber ? [inactiveRow.operationNumber] : [],
      currentApprovedAmount: approvedFull,
      disbursedLifeAmount: disbursedFull,
      disbursedLifePercent: percent,
      ageInExecution: String(inactiveRow?.yearsInExecution || '0'),
      monthsOfExtension: String(inactiveRow?.monthsOfExtensions || '0'),
      objective: inactiveRow?.objective || '',
      timeline: {
        approval: { date: inactiveRow?.approvalDate || 'N/A', status: 'completed' },
        effectiveness: { date: inactiveRow?.effectiveDate || 'N/A', status: 'completed' },
        eligibility: { date: inactiveRow?.eligibilityDate || 'N/A', status: 'completed' },
        firstDisbursement: { date: inactiveRow?.firstDisbursementDate || 'N/A', status: 'completed' },
        lastDisbursement: { date: inactiveRow?.totallyDisbursedDate || 'N/A', status: 'completed', currentDeadline: inactiveRow?.deadlineCurrentDisbursement || 'N/A' },
        extension: { text: `${inactiveRow?.monthsOfExtensions || 0} months`, status: 'completed' },
        closure: { date: inactiveRow?.closureDate || 'N/A', status: 'completed' },
      },
      lastDisbursementMade: inactiveRow?.lastDisbursementDate || 'N/A',
      localContribution: inactiveRow?.localContribution ? `$${(Number(inactiveRow.localContribution) / 1000000).toFixed(1)}M` : 'N/A',
      undisbursedAmountStr: `$${Number(inactiveRow?.undisbursedAmount || 0)}M`,
      financial: {
        originalApprovedAmount: Number(inactiveRow?.originalApprovedAmount || approvedFull),
        canceledAmount: Number(inactiveRow?.canceledAmount || 0),
        currentApprovedAmount: approvedFull,
        deadlineLastDisbursement: inactiveRow?.deadlineCurrentDisbursement || 'N/A',
        timeWithoutDisbursements: String(inactiveRow?.monthsWithoutDisbursement || '0'),
        currentApprovedAmountM: approvedM,
        disbursedLifeAmountM: disbursedM,
        disbursedLifePercent: percent,
        isDisbursedFully: percent >= 99.9,
      },
      pmrHistory: [],
      historicalPerformanceData: [],
      monthlyMonitoringData: [],
    } as any;
  }, [rawDetails, gasProjectRow, selectedProjId, project]);

  const currentYear = new Date().getFullYear();

  const {
    qualitativeData,
    isPrefilledByTeam,
    validatedByTTLDate,
    isLoading: isLoadingQualitative,
  } = useQualitativeData(project, onUpdate);

  const activeQualitativeData = qualitativeData || project.qualitativeData;
  const activeValidatedByTTLDate = validatedByTTLDate !== undefined ? validatedByTTLDate : project.validatedByTTLDate;
  const activeIsPrefilledByTeam = isPrefilledByTeam !== undefined ? isPrefilledByTeam : project.isPrefilledByTeam;
  
  // Extract approval year from string (e.g., "MAR/2020", "22/MAR/2020", etc.)
  const approvalDate = gasProjectRow?.approvalDate || details?.timeline?.approval?.date || '';
  const approvalYearMatch = approvalDate.match(/\d{4}/);
  const startYear = approvalYearMatch ? parseInt(approvalYearMatch[0]) : 0;

  const rawHistoricalData = details?.historicalPerformanceData || [];
  const historicalData = rawHistoricalData.filter(d => {
    const year = parseInt(d.year);
    if (isNaN(year)) return false;
    return year >= startYear && year <= currentYear;
  });

  const pmr2026Item = React.useMemo(() => {
    const list = [...(gasData.historical_pmr || []), ...(gasData.inactive_historical_pmr || [])];
    return list.find(
      h => (
        (h.project_number && String(h.project_number).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase()) ||
        (gasProjectRow?.operationNumber && h.project_number && String(h.project_number).trim().toUpperCase() === String(gasProjectRow.operationNumber).trim().toUpperCase())
      ) && Number(h.display_year) === 2026
    );
  }, [gasData.historical_pmr, gasData.inactive_historical_pmr, selectedProjId, gasProjectRow?.operationNumber]);

  const bannerPmrStatus = React.useMemo(() => {
    if (pmr2026Item) {
      const raw = (pmr2026Item.validated_classification && pmr2026Item.validated_classification !== 'N/A' && pmr2026Item.validated_classification.trim() !== '')
        ? pmr2026Item.validated_classification.trim()
        : (pmr2026Item.auto_classification && pmr2026Item.auto_classification !== 'N/A' && pmr2026Item.auto_classification.trim() !== '')
        ? pmr2026Item.auto_classification.trim()
        : 'N/A';
      return formatPMR(raw);
    }
    return formatPMR(details?.pmrStatus);
  }, [pmr2026Item, details?.pmrStatus]);

  const bannerTitle = gasProjectRow?.title || project.name || details.name;
  const bannerProjectId = gasProjectRow?.projectNumber || project.id || details.id;
  const bannerOpNumber = gasProjectRow?.operationNumber || (details.linkedLoans && details.linkedLoans.length > 0 ? details.linkedLoans.join(', ') : '');
  const bannerCountryName = gasProjectRow?.countryName || project.countryName || details.countryName;
  const bannerCountryCode = gasProjectRow?.countryCode || project.countryCode || details.countryCode;
  const bannerTtl = gasProjectRow?.ttl || project.ttl || details.ttl;
  const bannerStatus = formatOperationStatus(gasProjectRow?.operationStatus || details.operationStatus);

  const dataAsOfLongText = React.useMemo(() => {
    const raw = 
      gasProjectRow?.data_as_of_long ||
      gasData.data_as_of_long ||
      gasData.data_as_of ||
      'October 23, 2026';
    const trimmed = String(raw).trim();
    return trimmed.toLowerCase().startsWith('data as of') ? trimmed : `Data as of: ${trimmed}`;
  }, [gasProjectRow, gasData.data_as_of_long, gasData.data_as_of]);

  // Financial fields mapped strictly from active_portfolio_table (with fallback to details)
  const fpOriginalApprovedAmount = gasProjectRow?.originalApprovedAmount != null && String(gasProjectRow.originalApprovedAmount) !== ''
    ? Number(gasProjectRow.originalApprovedAmount)
    : details.financial.originalApprovedAmount;

  const fpCanceledAmount = gasProjectRow?.canceledAmount != null && String(gasProjectRow.canceledAmount) !== ''
    ? Number(gasProjectRow.canceledAmount)
    : details.financial.canceledAmount;

  // currentApprovedAmount in active_portfolio_table is in millions (e.g. 94)
  const fpCurrentApprovedAmountM = gasProjectRow?.currentApprovedAmount != null && String(gasProjectRow.currentApprovedAmount) !== ''
    ? (Number(gasProjectRow.currentApprovedAmount) >= 100000 ? Number(gasProjectRow.currentApprovedAmount) / 1000000 : Number(gasProjectRow.currentApprovedAmount))
    : details.financial.currentApprovedAmountM;

  const fpCurrentApprovedAmountRaw = gasProjectRow?.currentApprovedAmount != null && String(gasProjectRow.currentApprovedAmount) !== ''
    ? (Number(gasProjectRow.currentApprovedAmount) >= 100000 ? Number(gasProjectRow.currentApprovedAmount) : Number(gasProjectRow.currentApprovedAmount) * 1000000)
    : details.financial.currentApprovedAmount;

  // disbursedLifeAmount in active_portfolio_table is in millions (e.g. 93.61)
  const fpDisbursedLifeAmountM = gasProjectRow?.disbursedLifeAmount != null && String(gasProjectRow.disbursedLifeAmount) !== ''
    ? (Number(gasProjectRow.disbursedLifeAmount) >= 100000 ? Number(gasProjectRow.disbursedLifeAmount) / 1000000 : Number(gasProjectRow.disbursedLifeAmount))
    : details.financial.disbursedLifeAmountM;

  // disbursedLifePercent in active_portfolio_table is % (e.g. 99.58)
  const fpDisbursedLifePercent = gasProjectRow?.disbursedLifePercent != null && String(gasProjectRow.disbursedLifePercent) !== ''
    ? Number(gasProjectRow.disbursedLifePercent)
    : details.financial.disbursedLifePercent;

  const fpDeadlineLastDisbursement = gasProjectRow?.deadlineCurrentDisbursement || details.financial.deadlineLastDisbursement;

  const isDisbursedFully = fpDisbursedLifePercent >= 99.9 || Boolean(gasProjectRow?.totallyDisbursedDate && gasProjectRow.totallyDisbursedDate !== 'Pending');

  // General Details mapped strictly from active_portfolio_table
  const gdExecutingAgency = gasProjectRow?.executingAgency || details.executingAgency;
  const gdOperationStatus = gasProjectRow?.operationStatus || details.operationStatus;

  const gdLocalContribution = React.useMemo(() => {
    let rawVal: any = gasProjectRow?.localContribution;
    if (rawVal == null || String(rawVal).trim() === '') {
      rawVal = details.localContribution;
    }
    if (rawVal == null || String(rawVal).trim() === '' || String(rawVal).trim().toUpperCase() === 'N/A') {
      return 'N/A';
    }
    const cleanNum = typeof rawVal === 'number' 
      ? rawVal 
      : parseFloat(String(rawVal).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(cleanNum)) {
      const inM = cleanNum >= 100000 ? cleanNum / 1000000 : cleanNum;
      return `$${inM.toFixed(1)}M`;
    }
    return String(rawVal);
  }, [gasProjectRow?.localContribution, details.localContribution]);

  const gdUndisbursedAmountStr = React.useMemo(() => {
    if (gasProjectRow?.undisbursedAmount != null && String(gasProjectRow.undisbursedAmount) !== '') {
      const num = Number(gasProjectRow.undisbursedAmount);
      if (!isNaN(num)) {
        if (num === 0) return '$0M';
        if (num < 1) return `$${num.toFixed(2)}M`;
        return `$${Math.round(num)}M`;
      }
      return String(gasProjectRow.undisbursedAmount);
    }
    return details.undisbursedAmountStr || 'N/A';
  }, [gasProjectRow?.undisbursedAmount, details.undisbursedAmountStr]);

  const gdMonthsOfExtensions = gasProjectRow?.monthsOfExtensions != null && String(gasProjectRow.monthsOfExtensions) !== ''
    ? String(gasProjectRow.monthsOfExtensions)
    : (details.monthsOfExtension || '0');

  const gdLastDisbursementDate = React.useMemo(() => {
    const raw = gasProjectRow?.lastDisbursementDate && gasProjectRow.lastDisbursementDate !== 'N/A'
      ? gasProjectRow.lastDisbursementDate
      : (details.lastDisbursementMade || 'N/A');
    return formatDateDDMMMYYYY(raw);
  }, [gasProjectRow?.lastDisbursementDate, details.lastDisbursementMade]);

  const gdMonthsWithoutDisbursement = gasProjectRow?.monthsWithoutDisbursement != null && String(gasProjectRow.monthsWithoutDisbursement) !== ''
    ? String(gasProjectRow.monthsWithoutDisbursement)
    : (details.financial.timeWithoutDisbursements || 'N/A');

  const gdYearsInExecution = React.useMemo(() => {
    const raw = gasProjectRow?.yearsInExecution != null && String(gasProjectRow.yearsInExecution) !== ''
      ? gasProjectRow.yearsInExecution
      : details.ageInExecution;
    if (raw == null || String(raw).trim() === '' || String(raw).trim().toUpperCase() === 'N/A') return 'N/A';
    const cleanStr = String(raw).replace(/years?/gi, '').trim();
    const num = parseFloat(cleanStr);
    return isNaN(num) ? cleanStr : num.toFixed(1);
  }, [gasProjectRow?.yearsInExecution, details.ageInExecution]);

  const gdObjective = gasProjectRow?.objective || details.objective;

  // Timeline dates
  const tlApprovalDate = gasProjectRow?.approvalDate || details.timeline.approval.date;
  const tlApprovalCompleted = Boolean(tlApprovalDate && tlApprovalDate.trim().toUpperCase() !== 'PENDING' && tlApprovalDate.trim().toUpperCase() !== 'N/A');

  const tlEffectiveDate = gasProjectRow?.effectiveDate || details.timeline.effectiveness.date;
  const tlEffectiveCompleted = Boolean(tlEffectiveDate && tlEffectiveDate.trim().toUpperCase() !== 'PENDING' && tlEffectiveDate.trim().toUpperCase() !== 'N/A');

  const tlEligibilityDate = gasProjectRow?.eligibilityDate || details.timeline.eligibility.date;
  const tlEligibilityCompleted = Boolean(tlEligibilityDate && tlEligibilityDate.trim().toUpperCase() !== 'PENDING' && tlEligibilityDate.trim().toUpperCase() !== 'N/A');

  const tlFirstDisbursementDate = gasProjectRow?.firstDisbursementDate || details.timeline.firstDisbursement.date;
  const tlFirstDisbursementCompleted = Boolean(tlFirstDisbursementDate && tlFirstDisbursementDate.trim().toUpperCase() !== 'PENDING' && tlFirstDisbursementDate.trim().toUpperCase() !== 'N/A');

  const tlTotallyDisbursedDate = gasProjectRow?.totallyDisbursedDate || details.timeline.lastDisbursement.date;
  const tlTotallyDisbursedCompleted = Boolean(tlTotallyDisbursedDate && tlTotallyDisbursedDate.trim().toUpperCase() !== 'PENDING' && tlTotallyDisbursedDate.trim().toUpperCase() !== 'N/A');

  const tlExtensionText = gasProjectRow?.monthsOfExtensions !== undefined
    ? `${gasProjectRow.monthsOfExtensions} months`
    : details.timeline.extension.text;

  const tlDeadlineText = gasProjectRow?.deadlineCurrentDisbursement || details.timeline.lastDisbursement.currentDeadline || 'N/A';

  const tlClosureDate = gasProjectRow?.closureDate || details.timeline.closure.date;
  const tlClosureCompleted = Boolean(tlClosureDate && tlClosureDate.trim().toUpperCase() !== 'PENDING' && tlClosureDate.trim().toUpperCase() !== 'N/A');

  const hasFirstDisbursement = tlFirstDisbursementCompleted && tlFirstDisbursementDate !== '';

  const splitIndex = historicalData.findIndex(d => parseInt(d.year) === currentYear - 1);
  const splitPercentage = historicalData.length > 1 && splitIndex !== -1 
    ? (splitIndex / (historicalData.length - 1)) * 100 
    : 100;

  const gasChart1 = React.useMemo(() => {
    const list = [...(gasData.chart1_yearly_performance || []), ...(gasData.inactive_chart1_yearly_performance || [])];
    return list
      .filter(item => (
        (item.project_number && String(item.project_number).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase()) ||
        (gasProjectRow?.operationNumber && String(item.project_number).trim().toUpperCase() === String(gasProjectRow.operationNumber).trim().toUpperCase())
      ) && Number(item.year) <= 2026)
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [gasData.chart1_yearly_performance, gasData.inactive_chart1_yearly_performance, selectedProjId, gasProjectRow?.operationNumber]);

  const gasChart2 = React.useMemo(() => {
    const list = [...(gasData.chart2_monthly_cumulative || []), ...(gasData.inactive_chart2_monthly_cumulative || [])];
    return list
      .filter(item => (
        (item.project_number && String(item.project_number).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase()) ||
        (gasProjectRow?.operationNumber && String(item.project_number).trim().toUpperCase() === String(gasProjectRow.operationNumber).trim().toUpperCase())
      ))
      .sort((a, b) => Number(a.month) - Number(b.month));
  }, [gasData.chart2_monthly_cumulative, gasData.inactive_chart2_monthly_cumulative, selectedProjId, gasProjectRow?.operationNumber]);

  const gasHistoricalPmr = React.useMemo(() => {
    const list = [...(gasData.historical_pmr || []), ...(gasData.inactive_historical_pmr || [])];
    return list
      .filter(item => (
        (item.project_number && String(item.project_number).trim().toUpperCase() === String(selectedProjId).trim().toUpperCase()) ||
        (gasProjectRow?.operationNumber && String(item.project_number).trim().toUpperCase() === String(gasProjectRow.operationNumber).trim().toUpperCase())
      ))
      .sort((a, b) => Number(a.display_year) - Number(b.display_year));
  }, [gasData.historical_pmr, gasData.inactive_historical_pmr, selectedProjId, gasProjectRow?.operationNumber]);

  const chart1Data = React.useMemo(() => {
    const baseItems = gasChart1.length > 0
      ? gasChart1.map(item => {
          const baselineRaw = Number(item.bar_historical_baseline) || 0;
          const disbursedRaw = item.line_actual_disbursed !== null && item.line_actual_disbursed !== undefined && item.line_actual_disbursed !== ''
            ? Number(item.line_actual_disbursed)
            : null;
          const baselineM = baselineRaw > 0 ? baselineRaw / 1000000 : 0;
          const disbursedM = disbursedRaw !== null ? disbursedRaw / 1000000 : null;

          return {
            year: String(item.year),
            baselineM,
            disbursedM,
            rawBaseline: baselineRaw,
            rawDisbursed: disbursedRaw,
          };
        })
      : historicalData.map(d => ({
          year: String(d.year),
          baselineM: d.projection,
          disbursedM: d.disbursed !== null ? d.disbursed : (d.projected_disbursed ?? null),
          rawBaseline: d.projection * 1000000,
          rawDisbursed: (d.disbursed ?? d.projected_disbursed ?? 0) * 1000000,
        }));

    const lastIdx = baseItems.length - 1;

    return baseItems.map((item, idx) => {
      // Solid line covers up to lastIdx - 1
      const solidDisbursed = idx < lastIdx ? item.disbursedM : null;
      // Dashed line connects lastIdx - 1 to lastIdx
      const dashedDisbursed = (idx === lastIdx - 1 || idx === lastIdx) ? item.disbursedM : null;

      return {
        year: item.year,
        bar_historical_baseline: item.baselineM,
        line_actual_disbursed: item.disbursedM,
        solidDisbursed,
        dashedDisbursed,
        projection: item.baselineM,
        disbursed: item.disbursedM,
        rawBaseline: item.rawBaseline,
        rawDisbursed: item.rawDisbursed,
      };
    });
  }, [gasChart1, historicalData]);

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chart2Data = React.useMemo(() => {
    if (gasChart2.length > 0) {
      return gasChart2.map(item => {
        const monthNum = Number(item.month);
        const monthLabel = MONTH_NAMES[monthNum - 1] || `M${item.month}`;

        const projRaw = item.cumulative_current_projection;
        const projM = (projRaw !== null && projRaw !== undefined && projRaw !== '') 
          ? Number(projRaw) / 1000000 
          : 0;

        const disbRaw = item.cumulative_disbursed;
        const hasDisb = disbRaw !== null && disbRaw !== undefined && disbRaw !== '';
        const disbM = hasDisb ? Number(disbRaw) / 1000000 : null;

        return {
          month: monthLabel,
          monthNum,
          cumulative_current_projection: projM,
          cumulative_disbursed: disbM,
          rawProjection: Number(projRaw) || 0,
          rawDisbursed: hasDisb ? Number(disbRaw) : null,
        };
      });
    }

    return (details?.monthlyMonitoringData || []).map(item => ({
      month: item.month,
      monthNum: 0,
      cumulative_current_projection: item.cumulativeProjection,
      cumulative_disbursed: item.cumulativeDisbursed,
      rawProjection: (item.cumulativeProjection || 0) * 1000000,
      rawDisbursed: item.cumulativeDisbursed !== null ? item.cumulativeDisbursed * 1000000 : null,
    }));
  }, [gasChart2, details?.monthlyMonitoringData]);

  const pmrTimelineData = React.useMemo(() => {
    if (gasHistoricalPmr.length > 0) {
      return gasHistoricalPmr.map(item => {
        const year = Number(item.display_year);
        const finalStatus = (item.validated_classification && item.validated_classification !== 'N/A' && item.validated_classification.trim() !== '')
          ? item.validated_classification
          : (item.auto_classification && item.auto_classification !== 'N/A' && item.auto_classification.trim() !== '')
          ? item.auto_classification
          : 'N/A';

        const dotColor = 
          finalStatus === 'Satisfactory' ? '#4CAF50' :
          finalStatus === 'Alert' ? '#FFC107' :
          finalStatus === 'Problem' ? '#F44336' :
          '#9ca3af';

        const tooltipText = `${item.tooltip || `Jan-Dec ${year - 1}`}: ${finalStatus}`;

        return {
          year,
          tooltip: item.tooltip,
          finalStatus,
          dotColor,
          tooltipText,
        };
      }).sort((a, b) => a.year - b.year);
    }

    return (details?.pmrHistory || []).map(item => {
      const finalStatus = item.validatedStatus && item.validatedStatus !== 'N/A' 
        ? item.validatedStatus 
        : (item.autoCalculatedStatus || 'N/A');
      const dotColor = 
        finalStatus.toLowerCase().includes('sat') ? '#4CAF50' :
        finalStatus.toLowerCase().includes('alert') ? '#FFC107' :
        finalStatus.toLowerCase().includes('prob') ? '#F44336' :
        '#9ca3af';
      return {
        year: item.year,
        tooltip: item.hoverText || `Jan-Dec ${item.year - 1}`,
        finalStatus: formatPMR(finalStatus),
        dotColor,
        tooltipText: `${item.hoverText || `Jan-Dec ${item.year - 1}`}: ${formatPMR(finalStatus)}`,
      };
    }).sort((a, b) => a.year - b.year);
  }, [gasHistoricalPmr, details?.pmrHistory]);

  const pmrTwoRowsData = React.useMemo(() => {
    if (gasHistoricalPmr.length > 0) {
      return gasHistoricalPmr.map(item => ({
        year: Number(item.display_year),
        tooltip: item.tooltip || `Jan-Dec ${Number(item.display_year) - 1}`,
        autoClassification: item.auto_classification && item.auto_classification.trim() !== '' ? item.auto_classification : 'N/A',
        validatedClassification: item.validated_classification && item.validated_classification.trim() !== '' ? item.validated_classification : 'N/A',
      })).sort((a, b) => a.year - b.year);
    }

    return (details?.pmrHistory || []).map(item => ({
      year: item.year,
      tooltip: item.hoverText || `Jan-Dec ${item.year - 1}`,
      autoClassification: item.autoCalculatedStatus || 'N/A',
      validatedClassification: item.validatedStatus || 'N/A',
    })).sort((a, b) => a.year - b.year);
  }, [gasHistoricalPmr, details?.pmrHistory]);

  const [activeTab, setActiveTab] = useState<'baseline' | 'interview' | 'qa' | 'midterm' | 'critical_procurement'>(initialTab || 'baseline');
  const lastInitRef = React.useRef<{ projectId: string; initialTab?: string } | null>(null);

  // Sync activeTab with initialTab when initialTab or project changes
  React.useEffect(() => {
    const isMidtermSupported = MIDTERM_PROJECT_IDS.includes(project.id);
    const isCriticalProcurementSupported = project.id === 'PN-L1161' || project.id === 'PN-L1172';
    
    const needsInit = !lastInitRef.current || 
                      lastInitRef.current.projectId !== project.id || 
                      lastInitRef.current.initialTab !== initialTab;
                      
    if (needsInit) {
      lastInitRef.current = { projectId: project.id, initialTab };
      if (initialTab) {
        if (initialTab === 'midterm' && !isMidtermSupported) {
          setActiveTab('baseline');
        } else if (initialTab === 'critical_procurement' && !isCriticalProcurementSupported) {
          setActiveTab('baseline');
        } else {
          setActiveTab(initialTab);
        }
      } else {
        setActiveTab('baseline');
      }
    } else {
      if (activeTab === 'midterm' && !isMidtermSupported) {
        setActiveTab('baseline');
      } else if (activeTab === 'critical_procurement' && !isCriticalProcurementSupported) {
        setActiveTab('baseline');
      }
    }
  }, [initialTab, project.id, activeTab]);
  const [historicalView, setHistoricalView] = useState<'graph' | 'values'>('graph');
  const [monthlyView, setMonthlyView] = useState<'graph' | 'values'>('graph');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfRenderKey, setPdfRenderKey] = useState(0);
  const [hoveredPmrTooltip, setHoveredPmrTooltip] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const titleImage = React.useMemo(() => renderTextToDataURL(bannerTitle, 'bold 30px Inter, system-ui, sans-serif', '#18181b', 1530), [bannerTitle]);
  const generalDetailsImage = React.useMemo(() => renderTextToDataURL('General Details', 'bold 24px Inter, system-ui, sans-serif', '#18181b', 500), []);
  const financialProgressImage = React.useMemo(() => renderTextToDataURL('Financial Progress', 'bold 24px Inter, system-ui, sans-serif', '#18181b', 500), []);

  const renderReadOnlyQualitativeList = (items?: string[]) => {
    const lines = (items || []).join('\n').split('\n');
    const hasContent = lines.some(l => l && l.trim().length > 0);
    if (!hasContent) {
      return <li className="text-zinc-400 italic list-none -ml-5">No information available</li>;
    }
    return lines.map((line, index) => {
      const cleanLine = line.replace(/^•\s*/, '').trim();
      if (cleanLine) {
        return <li key={index}>{cleanLine}</li>;
      }
      return (
        <li 
          key={index} 
          className="list-none min-h-[1.5em]" 
          style={{ listStyle: 'none', minHeight: '1.5em' }}
        />
      );
    });
  };

  // Scroll to top when tab changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005173]"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <p className="text-zinc-500">Project details not found.</p>
        <button onClick={onBack} className="text-[#005173] font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const waitForImages = (element: HTMLElement) => {
    const images = element.getElementsByTagName('img');
    const promises = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.complete) {
        promises.push(new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        }));
      }
    }
    return Promise.all(promises);
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    setIsGeneratingPDF(true);
    // Force Recharts to completely remount from scratch to ensure correct x/y calculations
    setPdfRenderKey(Date.now());

    try {
      // Wait 2 seconds strictly for the freshly mounted charts to paint off-screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      if ('fonts' in document) {
        await (document as any).fonts.ready;
      }
      window.scrollTo(0, 0);

      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageIds = (project.id === 'PN-L1161' || project.id === 'PN-L1172') 
        ? ['pdf-page-1', 'pdf-page-2', 'pdf-page-3'] 
        : ['pdf-page-1', 'pdf-page-2'];

      for (let i = 0; i < pageIds.length; i++) {
        const pageElement = document.getElementById(pageIds[i]);
        if (!pageElement) continue;

        // Wait for flag images on this specific page
        await waitForImages(pageElement);

        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      try {
        pdf.save(`${project.name.replace(/\s+/g, '_')}_Report.pdf`);
      } catch (saveError) {
        console.warn('Sandbox block, opening in new tab', saveError);
        window.open(pdf.output('bloburl'), '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isMidtermSupported = MIDTERM_PROJECT_IDS.includes(project.id);
  const isCriticalProcurementSupported = project.id === 'PN-L1161' || project.id === 'PN-L1172';

  const tabs = [
    { id: 'baseline', label: 'General Details', icon: <CustomFileSearchIcon className="w-4 h-4" /> },
    { id: 'qa', label: 'Financial Progress', icon: <DollarIcon className="w-4 h-4" /> },
    { id: 'interview', label: 'PMR Performance', icon: <TrendingUp className="w-4 h-4" /> },
    ...(isMidtermSupported ? [{ id: 'midterm', label: 'Mid-Term Evaluation', icon: <FileText className="w-4 h-4" /> } as const] : []),
    ...(isCriticalProcurementSupported ? [{ id: 'critical_procurement', label: 'Critical Procurement Processes', icon: <ClipboardCheck className="w-4 h-4" /> } as const] : []),
  ] as const;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6"
      >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:items-center gap-4">
          <div className="flex items-start gap-1 lg:gap-3 w-full lg:w-auto -ml-8 lg:ml-0 pr-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left flex-1 min-w-0">
              <h2 className="text-lg md:text-[18px] font-semibold tracking-tight text-black leading-tight mt-1 lg:mt-0 w-full break-words lg:truncate">{bannerTitle}</h2>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-y-2 lg:gap-x-3 text-xs text-zinc-500 font-medium mt-3 lg:whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span className="lg:hidden shrink-0">Project ID:</span> 
                  {bannerProjectId}
                </span>
                {bannerOpNumber && (
                  <>
                    <span className="hidden lg:inline text-zinc-300">|</span>
                    <div className="flex items-start gap-1.5 lg:whitespace-nowrap">
                      <span className="lg:hidden shrink-0 mt-0.5">•</span>
                      <div className="flex flex-row items-center gap-x-1">
                        <span className="lg:hidden shrink-0 font-medium whitespace-nowrap">Operation ID:</span>
                        <span className="flex-1 whitespace-nowrap">{bannerOpNumber}</span>
                      </div>
                    </div>
                  </>
                )}
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span className="lg:hidden shrink-0 mr-0.5">Country:</span>
                  {bannerCountryName && countryCodes[bannerCountryName] ? (
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[bannerCountryName]}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={bannerCountryName || 'Country flag'}
                    />
                  ) : bannerCountryCode ? (
                    <img 
                      src={`https://flagcdn.com/w40/${bannerCountryCode.toLowerCase()}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={bannerCountryName || 'Country flag'}
                    />
                  ) : (
                    '🏳️'
                  )}
                  {bannerCountryName}
                </span>
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span>TTL: {bannerTtl}</span>
                </span>
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span>Status: {bannerStatus}</span>
                </span>
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex flex-col lg:flex-row lg:items-center justify-start lg:justify-start gap-x-1 gap-y-1 w-full lg:w-auto lg:whitespace-nowrap">
                  <div className="flex items-center gap-1.5 lg:shrink-0">
                    <span className="lg:hidden shrink-0">•</span>
                    <span className="whitespace-nowrap">PMR March Cycle 2026: </span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:shrink-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ 
                        backgroundColor: getDotColor(bannerPmrStatus)
                      }}
                    ></span> 
                    {bannerPmrStatus}
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-2 pt-2">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`w-full lg:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-[#005173] text-white px-4 py-[10.8px] lg:py-2 rounded-lg font-bold text-[9.9px] lg:text-[11px] uppercase tracking-widest transition-colors shadow-sm ${isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#003d57]'}`}
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? 'GENERATING...' : 'DOWNLOAD PDF'}
          </button>
        </div>
      </div>

      {/* Active Alerts Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3 mx-4 lg:mx-0 mb-4 pl-0 lg:pl-10">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 select-none">ACTIVE ALERTS:</span>
        {(() => {
          const activeAlerts = (getAlertsForProject(project.id, gasData) || []).filter(
            a => a.color === 'red' || a.color === 'yellow'
          );
          if (activeAlerts.length === 0) {
            return (
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-xs select-none bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 stroke-white shrink-0" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                <span>No active alerts</span>
              </div>
            );
          }
          return (
            <div className="flex flex-wrap items-center gap-[10px] select-none">
              {activeAlerts.map(alert => {
                const info = getAlertTagForProject(project.id, alert.number, gasData);
                let boxColor = '#cccccc';
                if (info.color === 'red') boxColor = '#e53935';
                else if (info.color === 'yellow') boxColor = '#ffb300';
                else if (info.color === 'green') boxColor = '#00b04f';

                const cleanTitle = alert.title.replace(' (last 3 cycles)', '');
                return (
                  <button 
                    key={alert.number} 
                    onClick={() => {
                      if (onNavigateToAlert) {
                        onNavigateToAlert(alert.number, alert.title);
                      }
                    }}
                    className="flex items-center gap-2 bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5 shadow-xs whitespace-nowrap hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer text-left focus:outline-none"
                  >
                    {/* [Cuadrado de color] */}
                    <div 
                      className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-xs" 
                      style={{ backgroundColor: boxColor }} 
                    />

                    {/* [font-bold text-slate-800: #ID y Nombre en inglés] */}
                    <span className="text-slate-800 text-[12px] font-bold shrink-0">
                      {alert.number}. {cleanTitle}
                    </span>

                    {/* [separador textual ':'] */}
                    <span className="text-zinc-400 font-normal text-[12px] -ml-0.5">:</span>

                    {/* [font-medium text-zinc-500: Detalle del problema] */}
                    <span className="text-zinc-500 font-medium text-[12px]">
                      {info.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-12">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 px-4 lg:px-0 lg:pl-10">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-1 lg:p-2 lg:sticky lg:top-6 grid grid-cols-4 lg:flex lg:flex-col overflow-hidden lg:overflow-x-visible no-scrollbar whitespace-normal items-stretch">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-start text-center lg:text-left gap-1 lg:gap-3 px-1 lg:px-3 py-3 lg:py-2.5 rounded-lg text-[10.5px] lg:text-sm font-medium transition-colors leading-[1.2] ${
                  activeTab === tab.id 
                    ? 'bg-[#005173] text-white' 
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="shrink-0 hidden lg:block">{tab.icon}</span>
                <span className="whitespace-normal block max-w-[70px] lg:max-w-none">
                  {tab.id === 'baseline' ? (
                    <>General<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Details</>
                  ) : tab.id === 'qa' ? (
                    <>Financial<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Progress</>
                  ) : tab.id === 'interview' ? (
                    <>PMR<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Performance</>
                  ) : tab.id === 'midterm' ? (
                    <>Mid-Term<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Evaluation</>
                  ) : (
                    <>Critical Procurement<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Processes</>
                  )}
                </span>
                {tab.id === 'baseline' && project.history && <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500 hidden lg:block" />}
                {tab.id === 'interview' && project.binnacle && <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500 hidden lg:block" />}
                {tab.id === 'qa' && project.evaluation?.score && project.evaluation.score >= 80 && <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500 hidden lg:block" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-none lg:rounded-xl shadow-sm border-y lg:border border-zinc-200 min-h-[600px] flex flex-col">
            {activeTab === 'baseline' && (
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <CustomFileSearchIcon className="w-6 h-6 text-zinc-900" />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">General Details</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Left Card: All Details */}
                  <div className="bg-zinc-50 p-6 lg:p-8 rounded-2xl border border-zinc-200 space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Operation status:</span>
                        <span className="text-zinc-500 font-medium text-right ml-4">{formatOperationStatus(gdOperationStatus)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Executing Agency:</span>
                        <span className="text-zinc-500 font-medium text-right ml-4">{gdExecutingAgency}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Linked to<br className="lg:hidden" /> the loan:</span>
                        <span className="text-zinc-500 font-medium text-right ml-4 whitespace-pre-line">{details.linkedLoans.join('\n')}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Current<br className="lg:hidden" /> Approved<br className="lg:hidden" /> Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrencyM(fpCurrentApprovedAmountM)}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Local contribution:</span>
                        <span className="text-zinc-500 font-medium">{gdLocalContribution}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Disbursed Life<br className="lg:hidden" /> Amount:</span>
                        <span className="text-zinc-500 font-medium">{`${fpDisbursedLifePercent.toFixed(1)}%`}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Undisbursed Amount:</span>
                        <span className="text-zinc-500 font-medium">{gdUndisbursedAmountStr}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Months of extensions:</span>
                        <span className="text-zinc-500 font-medium">{gdMonthsOfExtensions}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Last disbursement made:</span>
                        <span className="text-zinc-500 font-medium">{gdLastDisbursementDate}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Time without<br className="lg:hidden" /> disbursement (months):</span>
                        <span className="text-zinc-500 font-medium">{gdMonthsWithoutDisbursement}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Years in execution<br className="lg:hidden" /> (since eligibility):</span>
                        <span className="text-zinc-500 font-medium">{gdYearsInExecution}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10.8px] lg:text-xs font-bold text-zinc-900 uppercase tracking-wider">OBJECTIVE</h4>
                        <p className="text-[12.6px] lg:text-sm text-zinc-500 font-medium leading-relaxed text-justify">
                          {gdObjective ? (gdObjective.split('.')[0] + '.') : 'No objective provided.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Progress */}
                  <div className="bg-zinc-50 p-6 lg:p-8 rounded-2xl border border-zinc-200 min-h-[400px]">
                    <h4 className="text-[10.8px] lg:text-xs font-bold text-zinc-900 uppercase tracking-wider mb-8">PROGRESS</h4>
                    
                    <div className="space-y-0.5 max-w-sm mx-auto lg:mx-0">
                      {/* Stage I */}
                      <div className="flex gap-0.5 relative z-40">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage I</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm space-y-6 relative pl-14 z-40">
                          {/* Approval */}
                          <div className="relative">
                            <div className="absolute -left-[31px] top-[30px] bottom-[-20px] w-0.5 z-50" style={{ backgroundColor: (tlApprovalCompleted && tlEffectiveCompleted) ? '#4EA72E' : '#71717a' }} />
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlApprovalCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Approval:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{tlApprovalDate}</span>
                            </div>
                          </div>
                          {/* Effectiveness */}
                          <div className="relative">
                            <div className="absolute -left-[31px] top-[30px] bottom-[-48px] w-0.5 z-50" style={{ backgroundColor: (tlEffectiveCompleted && tlEligibilityCompleted) ? '#4EA72E' : '#71717a' }} />
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlEffectiveCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Effectiveness:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{tlEffectiveDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stage II */}
                      <div className="flex gap-0.5 relative z-30">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage II</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm space-y-6 relative pl-14 z-30">
                          {/* Eligibility */}
                          <div className="relative">
                            <div className="absolute -left-[31px] top-[30px] bottom-[-20px] w-0.5 z-50" style={{ backgroundColor: (tlEligibilityCompleted && tlFirstDisbursementCompleted) ? '#4EA72E' : '#71717a' }} />
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlEligibilityCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Eligibility:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{tlEligibilityDate}</span>
                            </div>
                          </div>
                          {/* First disbursement */}
                          <div className="relative">
                            <div className="absolute -left-[31px] top-[30px] bottom-[-48px] w-0.5 z-50" style={{ backgroundColor: (tlFirstDisbursementCompleted && tlTotallyDisbursedCompleted) ? '#4EA72E' : '#71717a' }} />
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlFirstDisbursementCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">First disbursement:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{tlFirstDisbursementDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stage III */}
                      <div className="flex gap-0.5 relative z-20">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage III</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm relative pl-14 z-20">
                          {/* Last disbursement */}
                          <div className="relative">
                            <div className="absolute -left-[31px] top-[30px] bottom-[-48px] w-0.5 z-50" style={{ backgroundColor: (tlTotallyDisbursedCompleted && tlClosureCompleted) ? '#4EA72E' : '#71717a' }} />
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlTotallyDisbursedCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Totally disbursed:</span>
                              <div className="text-[12.6px] lg:text-sm text-zinc-600">
                                {tlTotallyDisbursedDate}
                                <div className="text-[12.6px] lg:text-sm text-zinc-500 font-normal mt-0.5">
                                  Extension: {tlExtensionText}
                                </div>
                                <div className="text-[12.6px] lg:text-sm text-zinc-500 font-normal mt-0.5">
                                  Current deadline: {tlDeadlineText}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Closure (CLOSURE Stage) */}
                      <div className="flex gap-0.5 relative z-10">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>CLOSURE</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm relative pl-14 z-10" >
                          <div className="relative">
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {tlClosureCompleted ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Closure:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{tlClosureDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {project.history && (
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Executive history</h4>
                    <div className="flex-1 bg-zinc-50 p-5 rounded-xl border border-zinc-200 overflow-y-auto text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-serif">
                      {project.history}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          onUpdate({ ...project, status: 'Pending Q&A' });
                          setActiveTab('qa');
                        }}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Continue to Q&A
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'interview' && (
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-zinc-900" />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">PMR Performance</h3>
                  </div>
                </div>
                
                {!hidePmrHistoricEvaluation && (
                  <>
                    <div className="flex items-center gap-2 mt-6 mb-3">
                      <p className="text-sm text-zinc-600">
                        <span className="font-bold text-black uppercase">PMR HISTORIC EVALUATION - MARCH CYCLE </span>
                        <span className="italic text-black">(After eligibility)</span>
                      </p>
                    </div>

                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                  {pmrTwoRowsData.length > 0 ? (
                    <div className="w-full py-4 overflow-x-auto">
                      <div className="min-w-[620px] px-4">
                        {/* Traffic light legend - aligned right above years */}
                        <div className="flex items-center justify-end gap-6 mb-5 text-xs text-zinc-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></span>
                            <span>Satisfactory</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107]"></span>
                            <span>Alert</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F44336]"></span>
                            <span>Problem</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]"></span>
                            <span>N/A</span>
                          </div>
                        </div>

                        {/* Header: Label Column Spacer + Years */}
                        <div className="flex items-center mb-6">
                          <div className="w-56 lg:w-64 shrink-0" />
                          <div className="flex-1 flex items-center justify-between px-3">
                            {pmrTwoRowsData.map((item, index, array) => (
                              <React.Fragment key={item.year}>
                                <div className="w-8 flex justify-center">
                                  <span className="text-sm font-bold text-zinc-900">{item.year}</span>
                                </div>
                                {index < array.length - 1 && <div className="flex-1 min-w-[20px]" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Row 1: Auto-calculated Classification */}
                        <div className="flex items-center mb-8">
                          <div className="w-56 lg:w-64 shrink-0 pr-4">
                            <span className="text-sm font-bold text-zinc-900">Auto-calculated Classification</span>
                          </div>
                          <div className="flex-1 flex items-center justify-between px-3 relative">
                            {pmrTwoRowsData.map((item, index, array) => {
                              const status = item.autoClassification;
                              const nextStatus = array[index + 1]?.autoClassification;
                              const dotColor = getDotColor(status);
                              const tooltipText = `${item.year} Auto-calculated: ${status} (${item.tooltip})`;

                              return (
                                <React.Fragment key={`auto-${item.year}`}>
                                  <div className="w-8 flex justify-center relative">
                                    <div 
                                      className="group relative cursor-pointer"
                                      title={tooltipText}
                                    >
                                      <div 
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-125 relative z-10"
                                        style={{ backgroundColor: dotColor }}
                                      >
                                        {getDotIcon(status)}
                                      </div>
                                      
                                      {/* Tooltip on Hover */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                        <div className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl relative">
                                          {tooltipText}
                                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {index < array.length - 1 && (
                                    <div 
                                      className="flex-1 h-[2.5px] mx-1 min-w-[20px]"
                                      style={{ backgroundColor: getLineColor(status, nextStatus) }}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {/* Row 2: Validated Classification */}
                        <div className="flex items-center">
                          <div className="w-56 lg:w-64 shrink-0 pr-4">
                            <span className="text-sm font-bold text-zinc-900">Validated Classification</span>
                          </div>
                          <div className="flex-1 flex items-center justify-between px-3 relative">
                            {pmrTwoRowsData.map((item, index, array) => {
                              const status = item.validatedClassification;
                              const nextStatus = array[index + 1]?.validatedClassification;
                              const dotColor = getDotColor(status);
                              const tooltipText = `${item.year} Validated: ${status} (${item.tooltip})`;

                              return (
                                <React.Fragment key={`val-${item.year}`}>
                                  <div className="w-8 flex justify-center relative">
                                    <div 
                                      className="group relative cursor-pointer"
                                      title={tooltipText}
                                    >
                                      <div 
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-125 relative z-10"
                                        style={{ backgroundColor: dotColor }}
                                      >
                                        {getDotIcon(status)}
                                      </div>
                                      
                                      {/* Tooltip on Hover */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                        <div className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl relative">
                                          {tooltipText}
                                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {index < array.length - 1 && (
                                    <div 
                                      className="flex-1 h-[2.5px] mx-1 min-w-[20px]"
                                      style={{ backgroundColor: getLineColor(status, nextStatus) }}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] lg:text-sm text-zinc-600">
                      {details.timeline.eligibility.date.trim().toUpperCase() === 'PENDING' 
                        ? "The project has not yet reached eligibility. Therefore, there is no PMR evaluation to show."
                        : `The project reached eligibility on ${details.timeline.eligibility.date}. Therefore, there is no PMR historic evaluation after eligibility yet.`
                      }
                    </p>
                  )}
                </div>
                  </>
                )}

                <div className="flex items-center gap-2 mt-6 mb-3">
                  <p className="text-sm text-zinc-600">
                    <span className="font-bold text-black uppercase">QUALITATIVE INFORMATION - PMR March Cycle 2026</span> | 
                    <span className="inline-flex items-center gap-1.5 ml-1.5">
                      {isLoadingQualitative ? (
                        <span className="inline-flex items-center gap-1.5 text-zinc-400 text-[13.3px] lg:text-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005173]" />
                          <span className="italic">Synchronizing latest data from Google Sheets...</span>
                        </span>
                      ) : (
                        <>
                          <span className={`w-2 h-2 rounded-full ${activeValidatedByTTLDate ? 'bg-[#4EA72E]' : 'bg-yellow-400'}`}></span>
                          <span className="italic text-[13.3px] lg:text-sm">
                            {activeValidatedByTTLDate 
                              ? `Validated by the TTL on ${activeValidatedByTTLDate}` 
                              : activeIsPrefilledByTeam 
                                ? 'Pending TTL validation' 
                                : 'Pending Effectiveness Team prefilling'}
                          </span>
                        </>
                      )}
                    </span>
                  </p>
                </div>

                {isLoadingQualitative ? (
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-6">
                    <div className="flex items-center gap-2.5 text-zinc-500 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#005173]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#005173]">
                        Loading qualitative information...
                      </span>
                    </div>
                    <div className="space-y-6 animate-pulse">
                      <div>
                        <div className="h-3.5 bg-zinc-200 rounded w-64 mb-3" />
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 space-y-2">
                          <div className="h-3 bg-zinc-100 rounded w-full" />
                          <div className="h-3 bg-zinc-100 rounded w-5/6" />
                        </div>
                      </div>
                      <div>
                        <div className="h-3.5 bg-zinc-200 rounded w-48 mb-3" />
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 space-y-2">
                          <div className="h-3 bg-zinc-100 rounded w-full" />
                          <div className="h-3 bg-zinc-100 rounded w-4/6" />
                        </div>
                      </div>
                      <div>
                        <div className="h-3.5 bg-zinc-200 rounded w-72 mb-3" />
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 space-y-2">
                          <div className="h-3 bg-zinc-100 rounded w-full" />
                          <div className="h-3 bg-zinc-100 rounded w-3/4" />
                        </div>
                      </div>
                      <div>
                        <div className="h-3.5 bg-zinc-200 rounded w-60 mb-3" />
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 space-y-2">
                          <div className="h-3 bg-zinc-100 rounded w-full" />
                          <div className="h-3 bg-zinc-100 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="h-3.5 bg-zinc-200 rounded w-40 mb-3" />
                          <div className="bg-white p-4 rounded-xl border border-zinc-100 h-12" />
                        </div>
                        <div>
                          <div className="h-3.5 bg-zinc-200 rounded w-40 mb-3" />
                          <div className="bg-white p-4 rounded-xl border border-zinc-100 h-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Estado de implementación / Principales riesgos</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                          <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                            {renderReadOnlyQualitativeList(activeQualitativeData?.estadoImplementacion)}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Acciones sugeridas / Pedidos</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                          <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                            {renderReadOnlyQualitativeList(activeQualitativeData?.accionesSugeridas)}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Productos destacados/innovadores del proyecto</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                          <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                            {renderReadOnlyQualitativeList(activeQualitativeData?.productosDestacados)}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en el PCR</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                          <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                            {renderReadOnlyQualitativeList(activeQualitativeData?.probabilidadObjetivos)}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Fecha evaluación intermedia</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 min-h-[50px]">
                          <p className="text-[11px] lg:text-sm text-zinc-700 whitespace-pre-wrap">
                            {activeQualitativeData?.fechaEvaluacionIntermedia || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Fecha talleres de arranque</h4>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 min-h-[50px]">
                          <p className="text-[11px] lg:text-sm text-zinc-700 whitespace-pre-wrap">
                            {activeQualitativeData?.fechaTalleresArranque || 'N/A'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'qa' && (
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-6">
                  <DollarIcon className="w-6 h-6 text-zinc-900 text-lg" />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Financial Progress</h3>
                  </div>
                </div>
                
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-8">
                  {/* Left Column: Financial Details */}
                  <div className="w-full lg:col-span-7 flex flex-col justify-start py-1 gap-y-[12.75px]">
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Original Approved Amount:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{formatCurrency(fpOriginalApprovedAmount)}</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Canceled Amount:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">({formatCurrency(fpCanceledAmount)})</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Current Approved Amount:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{formatCurrency(fpCurrentApprovedAmountRaw)}</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Deadline for last Current Disbursement:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{fpDeadlineLastDisbursement}</span>
                    </div>
                  </div>

                  {/* Right Column: Progress Bars */}
                  <div className="w-full lg:col-span-5 flex flex-col justify-start lg:justify-between py-1 gap-y-6 lg:gap-y-0 mt-4 lg:mt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>CURRENT APPROVED AMOUNT</span>
                        <span className="text-zinc-900">{formatCurrencyM(fpCurrentApprovedAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden flex items-center justify-end px-2">
                        <span className="relative z-10 text-[9px] lg:text-[10px] font-bold" style={{ color: '#ffffff' }}>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2 lg:mt-3">
                      <div className="flex justify-between text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>DISBURSED LIFE AMOUNT</span>
                          {isDisbursedFully && (
                            <div className="w-3 h-3 bg-[#4EA72E] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white stroke-[4]" />
                            </div>
                          )}
                        </div>
                        <span className="text-zinc-900">{formatCurrencyM(fpDisbursedLifeAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-zinc-200 rounded-sm overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#00AEEF] flex items-center justify-end px-2"
                          style={{ width: `${Math.min(100, Math.max(0, fpDisbursedLifePercent))}%` }}
                        >
                          <span className="relative z-10 text-[9px] lg:text-[10px] font-bold" style={{ color: '#ffffff' }}>
                            {`${fpDisbursedLifePercent.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section - Now inside the card */}
                  <div className="w-full lg:col-span-12 grid grid-cols-1 gap-8 lg:gap-16 mt-4 lg:mt-[-8px] pt-6 border-t border-zinc-200">
                    {!hasFirstDisbursement ? (
                      <div className="py-4 px-1">
                        <p className="text-[10px] lg:text-sm text-zinc-600">
                          The project has not made its first disbursement yet. So there is no financial data to show.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Chart 1: Historical Performance */}
                        <div className={`flex flex-col w-full ${historicalView === 'graph' ? 'h-[370px] lg:h-[400px]' : 'h-auto'} px-1 lg:px-0 overflow-visible`}>
                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 lg:gap-0 mb-1 lg:mb-4 w-full px-1 lg:px-4">
                      {/* Left spacer for desktop centering */}
                      <div className="hidden lg:block lg:flex-[1]"></div>
                      
                      <div className="order-2 lg:order-none lg:flex-[6] flex justify-center">
                        <h4 className="text-[9.5px] lg:text-sm font-bold text-[#005173] text-center leading-tight m-0">
                          Historical Performance, Baseline Projection vs<br className="hidden lg:block" /> Disbursed Amount ($M), by Year
                        </h4>
                      </div>

                      <div className="order-1 lg:order-none lg:flex-[1] flex justify-center lg:justify-end">
                        <div className="flex border border-[#005173] rounded overflow-hidden">
                          <button 
                            onClick={() => setHistoricalView('graph')}
                            className={`px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${historicalView === 'graph' ? 'bg-[#005173] text-white' : 'bg-white text-[#005173] hover:bg-zinc-50'}`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            GRAPH
                          </button>
                          <button 
                            onClick={() => setHistoricalView('values')}
                            className={`px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${historicalView === 'values' ? 'bg-[#005173] text-white' : 'bg-white text-[#005173] hover:bg-zinc-50'}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            VALUES
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      {historicalView === 'graph' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chart1Data} margin={{ top: 30, right: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 0 : 30, bottom: 65, left: 10 }}>
                            <defs>
                              <pattern id="diagonalHatchProj" patternUnits="userSpaceOnUse" width="4" height="4">
                                <rect width="4" height="4" fill="#ffffff" />
                                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                              </pattern>
                            </defs>
                            <XAxis 
                              dataKey="year" 
                              axisLine={{ stroke: '#e4e4e7' }} 
                              tickLine={false} 
                              tick={{fill: '#52525b', fontSize: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 7.2 : 11, fontWeight: 'bold'}} 
                              interval={0} 
                              dy={15}
                              angle={window.innerWidth < 1024 ? -90 : 0}
                              textAnchor={window.innerWidth < 1024 ? "end" : "middle"}
                            />
                            <YAxis hide domain={[0, 'auto']} />
                            <RechartsTooltip content={<CustomChart1Tooltip />} />
                            <Legend verticalAlign="bottom" height={40} content={() => (
                              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-8 text-[8px] lg:text-[11px] text-zinc-600 font-bold mt-4 whitespace-normal sm:whitespace-nowrap items-center text-center">
                                <div className="flex items-center gap-2">
                                  <svg width="12" height="12" className="border border-[#d4d4d8]">
                                    <rect width="12" height="12" fill="url(#diagonalHatchProj)" />
                                  </svg>
                                  Baseline Projection ($M)
                                </div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005173]"></div>Disbursed Amount ($M)</div>
                              </div>
                            )}/>
                            <Bar dataKey="bar_historical_baseline" name="Baseline Projection" barSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 18 : 24} fill="url(#diagonalHatchProj)" stroke="#d4d4d8" isAnimationActive={false}>
                              <LabelList dataKey="bar_historical_baseline" content={(props: any) => renderCustomBarLabel({ ...props, projectCode: project.id })} />
                            </Bar>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="solidDisbursed" name="Disbursed Amount" stroke="#005173" strokeWidth={2} dot={{r: 4, fill: '#005173', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                              <LabelList dataKey="solidDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                            </Line>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="dashedDisbursed" name="Disbursed Amount" legendType="none" stroke="#005173" strokeWidth={2} strokeDasharray="4 4" dot={{r: 4, fill: '#005173', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                              <LabelList dataKey="dashedDisbursed" position="top" offset={10} content={(props: any) => {
                                if (props.index === chart1Data.length - 1) {
                                  return renderCustomLineLabel({ ...props, projectCode: project.id });
                                }
                                return null;
                              }} />
                            </Line>
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="px-1 lg:px-8 pb-4 overflow-x-auto">
                          <table className="w-full min-w-full border-collapse" style={{ boxSizing: 'border-box', width: '100%' }}>
                            <thead>
                              <tr className="bg-zinc-100 border-b border-zinc-200">
                                <th className="py-2 px-1 lg:px-4 text-left text-[9px] lg:text-xs font-bold text-zinc-600 uppercase">Year</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Baseline<br className="lg:hidden" /> Projection ($)</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Disbursed<br className="lg:hidden" /> Amount ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chart1Data.map((row, idx) => (
                                <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-zinc-900">{row.year}</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.rawBaseline > 0 ? Math.round(row.rawBaseline).toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.rawDisbursed !== null && row.rawDisbursed !== undefined ? Math.round(row.rawDisbursed).toLocaleString() : '-'}
                                  </td>
                                </tr>
                              ))}
                              {chart1Data.length > 0 && (
                                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-[#005173]">Total</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-[#005173] font-bold">
                                    {chart1Data.reduce((sum, row) => sum + (row.rawBaseline || 0), 0) > 0 
                                      ? Math.round(chart1Data.reduce((sum, row) => sum + (row.rawBaseline || 0), 0)).toLocaleString() 
                                      : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-[#005173] font-bold">
                                    {chart1Data.reduce((sum, row) => sum + (row.rawDisbursed || 0), 0) > 0 
                                      ? Math.round(chart1Data.reduce((sum, row) => sum + (row.rawDisbursed || 0), 0)).toLocaleString() 
                                      : '-'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chart 2: Monthly Monitoring */}
                  <div className={`flex flex-col w-full ${monthlyView === 'graph' ? 'h-[320px] lg:h-[400px]' : 'h-auto'} px-1 lg:px-0 overflow-visible`}>
                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 lg:gap-0 mb-1 lg:mb-4 w-full px-1 lg:px-4">
                      {/* Left spacer for desktop centering */}
                      <div className="hidden lg:block lg:flex-[1]"></div>
                      
                      <div className="order-2 lg:order-none lg:flex-[6] flex justify-center">
                        <h4 className="text-[9.5px] lg:text-sm font-bold text-[#005173] text-center leading-tight m-0">
                          2026 Cumulative Monthly Disbursements, Current Projection vs<br className="hidden lg:block" /> Disbursed Amount ($M)
                        </h4>
                      </div>

                      <div className="order-1 lg:order-none lg:flex-[1] flex justify-center lg:justify-end">
                        <div className="flex border border-[#005173] rounded overflow-hidden">
                          <button 
                            onClick={() => setMonthlyView('graph')}
                            className={`px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${monthlyView === 'graph' ? 'bg-[#005173] text-white' : 'bg-white text-[#005173] hover:bg-zinc-50'}`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            GRAPH
                          </button>
                          <button 
                            onClick={() => setMonthlyView('values')}
                            className={`px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${monthlyView === 'values' ? 'bg-[#005173] text-white' : 'bg-white text-[#005173] hover:bg-zinc-50'}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            VALUES
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      {monthlyView === 'graph' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chart2Data} margin={{ top: 30, right: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 15 : 30, bottom: 65, left: 25 }}>
                            <XAxis 
                              dataKey="month" 
                              axisLine={{ stroke: '#e4e4e7' }} 
                              tickLine={false} 
                              tick={{fill: '#52525b', fontSize: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 7.2 : 11, fontWeight: 'bold'}} 
                              interval={0} 
                              dy={15} 
                              angle={window.innerWidth < 1024 ? -90 : 0}
                              textAnchor={window.innerWidth < 1024 ? "end" : "middle"}
                              padding={{ left: 24, right: 16 }}
                            />
                            <YAxis hide domain={[0, 'dataMax + 1']} />
                            <RechartsTooltip content={<CustomChartTooltip />} />
                            <Legend verticalAlign="bottom" height={40} content={() => (
                              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-8 text-[8px] lg:text-[11px] text-zinc-600 font-bold mt-4 whitespace-normal sm:whitespace-nowrap items-center text-center">
                                <div className="flex items-center gap-2 whitespace-nowrap text-[7.5px] sm:text-[10px] lg:text-[11px]"><div className="w-8 h-[1px] border-t border-dashed border-zinc-400"></div>Current Projection ($M)</div>
                                <div className="flex items-center gap-2 whitespace-nowrap text-[7.5px] sm:text-[10px] lg:text-[11px]"><div className="w-8 h-[2px] bg-[#FFB800] relative flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>Disbursed Amount ($M)</div>
                              </div>
                            )}/>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulative_current_projection" name="Current Projection ($M)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false}>
                              <LabelList dataKey="cumulative_current_projection" content={(props: any) => renderProjectionLabel({ ...props, projectCode: project.id })} />
                            </Line>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulative_disbursed" name="Disbursed Amount ($M)" stroke="#FFB800" strokeWidth={2} dot={{r: 4, fill: '#FFB800', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                              <LabelList dataKey="cumulative_disbursed" position="top" offset={10} content={renderCustomLineLabel} />
                            </Line>
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="px-1 lg:px-8 pb-4 overflow-x-auto">
                          <table className="w-full min-w-full border-collapse" style={{ boxSizing: 'border-box', width: '100%' }}>
                            <thead>
                              <tr className="bg-zinc-100 border-b border-zinc-200">
                                <th className="py-2 px-1 lg:px-4 text-left text-[9px] lg:text-xs font-bold text-zinc-600 uppercase">Month</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Current<br className="lg:hidden" /> Projection<br className="lg:hidden" /> ($)</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Cumulative<br className="lg:hidden" /> Disbursed<br className="lg:hidden" /> Amount ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chart2Data.map((row, idx) => (
                                <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-zinc-900">{row.month}</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.rawProjection > 0 ? Math.round(row.rawProjection).toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.rawDisbursed !== null && row.rawDisbursed !== undefined ? Math.round(row.rawDisbursed).toLocaleString() : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                  </>
                )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'midterm' && (
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-zinc-900" />
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Mid-Term Evaluation</h3>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="py-3 px-6 text-left text-xs lg:text-sm font-bold text-black uppercase tracking-wider w-[20%]">Pillar</th>
                        <th className="py-3 px-6 text-center text-xs lg:text-sm font-bold text-black uppercase tracking-wider w-[45%]">Main findings</th>
                        <th className="py-3 px-6 text-center text-xs lg:text-sm font-bold text-black uppercase tracking-wider w-[35%]">Recommended actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EVALUATION_DATA[project.id] ? (
                        EVALUATION_DATA[project.id].map((item, index) => (
                          <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                            <td className="py-4 px-6 align-top text-xs lg:text-sm font-bold text-zinc-900">
                              {item.name}
                            </td>
                            <td className="py-4 px-6 align-top text-xs lg:text-sm text-zinc-700">
                              <ul className="list-disc pl-5 space-y-1">
                                {item.findings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-4 px-6 align-top text-xs lg:text-sm text-zinc-700">
                              <ul className="list-disc pl-5 space-y-1">
                                {item.actions.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-12 px-6 text-center text-xs lg:text-sm text-zinc-500 font-medium">
                            No evaluation data available yet for this project.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="hidden">
                {/* Project Name */}
                <div className="border-b border-zinc-200 pb-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1 select-none">Project Name</span>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-black leading-tight">
                    {project.name}
                  </h2>
                </div>

                {/* Row 1 metadata */}
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3 select-none">Project Metadata</span>
                  <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs flex flex-wrap gap-y-4 gap-x-6 items-center text-xs text-zinc-600 font-medium">
                    
                    {/* Project ID */}
                    <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">Project ID</span>
                      <span className="text-zinc-800 font-semibold">{project.id}</span>
                    </div>

                    {/* Operation ID */}
                    {details.linkedLoans.length > 0 && (
                      <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100 last:border-0">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">Operation ID</span>
                        <span className="text-zinc-800 font-semibold whitespace-pre-line">
                          {project.id === 'EC-L1253' ? '5598/OC-EC\n5599/OC-EC' : details.linkedLoans.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Country */}
                    <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">Country</span>
                      <div className="flex items-center gap-1.5 text-zinc-800 font-semibold">
                        {project.countryName && countryCodes[project.countryName] ? (
                          <img 
                            src={`https://flagcdn.com/w40/${countryCodes[project.countryName]}.png`} 
                            className="w-5 h-auto shadow-sm shrink-0" 
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer" 
                            alt={project.countryName || 'Country flag'}
                          />
                        ) : project.countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w40/${project.countryCode.toLowerCase()}.png`} 
                            className="w-5 h-auto shadow-sm shrink-0" 
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer" 
                            alt={project.countryName || 'Country flag'}
                          />
                        ) : (
                          '🏳️'
                        )}
                        <span>{project.countryName}</span>
                      </div>
                    </div>

                    {/* TTL */}
                    <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">TTL</span>
                      <span className="text-zinc-800 font-semibold">
                        {(() => {
                          const ttlStr = project.ttl || '';
                          if (['BR-L1377', 'BR-L1534'].includes(project.id)) return 'MARIA CRISTINA';
                          if (ttlStr.toUpperCase() === 'YARYGINA UDOVENKO, ANASTASIYA') return 'ANASTASIYA';
                          
                          const isEcuador = project.countryName === 'Ecuador';
                          if (isEcuador && ttlStr.toUpperCase().includes('ARIEL')) return 'ARIEL';
                          
                          return ttlStr;
                        })()}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">Status</span>
                      <span className="text-zinc-800 font-semibold">{details.operationStatus}</span>
                    </div>

                    {/* PMR March Cycle */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">PMR March Cycle 2026</span>
                      <div className="flex items-center gap-1.5 text-zinc-800 font-semibold">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ 
                            backgroundColor: getDotColor(details.pmrStatus)
                          }}
                        ></span> 
                        <span>{formatPMR(details.pmrStatus)}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Row 2 active alerts */}
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3 select-none">Active Alerts</span>
                  <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-start gap-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 select-none">ACTIVE ALERTS:</span>
                    {(() => {
                      const activeAlerts = (getAlertsForProject(project.id, gasData) || []).filter(
                        a => a.color === 'red' || a.color === 'yellow'
                      );
                      if (activeAlerts.length === 0) {
                        return (
                          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-xs select-none bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 className="w-4 h-4 stroke-white shrink-0" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                            <span>No active alerts</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-wrap items-center gap-[10px] select-none">
                          {activeAlerts.map(alert => {
                            const info = getAlertTagForProject(project.id, alert.number, gasData);
                            let boxColor = '#cccccc';
                            if (info.color === 'red') boxColor = '#e53935';
                            else if (info.color === 'yellow') boxColor = '#ffb300';
                            else if (info.color === 'green') boxColor = '#00b04f';

                            const cleanTitle = alert.title.replace(' (last 3 cycles)', '');
                            return (
                              <div 
                                key={alert.number} 
                                className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-left"
                              >
                                {/* [Cuadrado de color] */}
                                <div 
                                  className="w-3.5 h-3.5 rounded-sm shrink-0" 
                                  style={{ backgroundColor: boxColor }} 
                                />

                                {/* [font-bold text-slate-800: #ID y Nombre en inglés] */}
                                  <span className="text-slate-800 text-[12px] font-bold shrink-0">
                                    {alert.number}. {cleanTitle}
                                  </span>

                                  {/* [separador textual ':'] */}
                                  <span className="text-zinc-400 font-normal text-[12px] -ml-0.5">:</span>

                                  {/* [font-medium text-zinc-500: Detalle del problema] */}
                                  <span className="text-zinc-500 font-medium text-[12px]">
                                    {info.tag}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'critical_procurement' && (
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardCheck className="w-6 h-6 text-zinc-900" />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Critical Procurement Processes</h3>
                  </div>
                </div>
                
                <div className="space-y-12">
                  {((project.id === 'PN-L1172') ? [
                    {
                      number: "1",
                      title: "Diseño y acompañamiento técnico para la implementación del Ecosistema Fiscal Inteligente (EFI)",
                      processCode: "PN-L1172-P00027",
                      amount: "$ 1.2 MM (6%)*",
                      status: "En ejecución",
                      actions: [
                        "Contrato en ejecución desde enero de 2026, con fecha de finalización en 2027. La firma consultora maneja un cronograma normal y otro acelerado que podría terminar en febrero de 2027.",
                        "Este contrato es crítico no tanto por el monto como por su alcance: la FC debe acompañar al ejecutor en todos los pasos de la implementación. Un área crucial es identificar las necesidades de inversión que demandarán cada una de las instituciones que integran el EFI. Adicionalmente, el MEF creó un comité de de Gobernanza del EFI, con MEF, AIG, Contraloría, BID y la FC, a fin de acelerar la identificación de necesidades y toma de decisiones alineados a los objetivos del EFI. Se espera una propuesta detallada de necesidades de inversión al cierre de agosto 2026 que reordenará el plan de adquisiciones del EFI. El Banco ha recibido una solicitud de extensión del plazo contractual por 2 años más allá del 18 de agosto de 2026."
                      ]
                    }
                  ] : [
                    {
                      number: "1",
                      title: "Diagnóstico, diseño, desarrollo e implementación para la modernización del Sistema Tributario (e-Tax 2.0)",
                      processCode: "PN-L1161-P00074",
                      amount: "$ 6 MM (15%)*",
                      status: "Recepción de ofertas",
                      actions: [
                        "Proceso fue publicado y se encuentra en etapa de recibimiento de ofertas (técnicas y económicas, LPI).",
                        "Se fortaleció la UEP, en especial en el área de Adquisiciones, para que los documentos contractuales tengan una altísima calidad.",
                        "Adicionalmente, se ha instruido a la UEP para que pueda apoyar a la Comisión Evaluadora del proceso, con base a los lineamientos y políticas de adquisiciones del BID, con la finalidad de tener un informe de evaluación de alta calidad que permita asignar el contrato con seguridad. Se espera dar inicio en ejecución 1Q 2027."
                      ]
                    },
                    {
                      number: "2",
                      title: "Adquisición de licenciamiento, implementación, soporte y mantenimiento de plataforma de base de datos ORACLE",
                      processCode: "PN-L1161-P00062",
                      amount: "$ 10 MM (25%)*",
                      status: "Por iniciar licitación",
                      actions: [
                        "Se cuenta con el visto bueno de las instancias técnicas del Gobierno (AIG) para pasarlo a no objeción del BID e iniciar enseguida el proceso de licitación.",
                        "El proceso llevaba dos años en discusiones internas entre el Departamento de Tecnología de la Dirección General Impositiva y el área de tecnología del MEF (recordemos que la DGI está integrada en la estructura del MEF).",
                        "El equipo técnico del Banco (el Asociado Senior de Sectores – Arquitectura de Datos y Sistemas de IFD/FMM y un Consultor PEC) facilitaron sesiones de trabajo conjuntas con los departamentos del Gobierno y finalmente se cuenta con el VoBo de ambas instancias. Se espera dar inicio a la ejecución en 1Q 2027."
                      ]
                    },
                    {
                      number: "3",
                      title: "Adquisición, implementación, soporte y mantenimiento para el fortalecimiento de infraestructura tecnológica (balanceadores)",
                      processCode: "PN-L1161-P00067",
                      amount: "$ 2.3 MM (6%)*",
                      status: "Por iniciar licitación",
                      actions: [
                        "Fue enviado el 9 de junio para no objeción al BID. Se iniciará el proceso de licitación de modo inmediato.",
                        "Al igual que el proceso anterior, este llevaba un año en negociaciones internas entre departamento de tecnología de DGI y MEF.",
                        "Finalmente se cuenta con el VoBo de ambas instancias tras sesiones de trabajo conjuntas con el equipo técnico del Banco. Se espera dar inicio en ejecución 2Q 2027."
                      ]
                    }
                  ]).map((item, index) => (
                    <div key={index} className="bg-zinc-50 p-6 lg:p-8 rounded-2xl border border-zinc-200 shadow-xs relative overflow-hidden">
                      {/* Title block with deep blue border accent */}
                      <div className="border-l-4 border-[#005173] pl-4 mb-6">
                        <h4 className="text-base lg:text-lg font-bold text-zinc-900 leading-snug">
                          {item.number}. {item.title}
                        </h4>
                      </div>

                      {/* Info Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#005173] text-white py-2 px-3 rounded-xl shadow-xs text-center flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] lg:text-[12px] tracking-tight select-none">
                            <span className="font-bold text-white">Process code: </span>
                            <span className="font-normal text-white">{item.processCode}</span>
                          </span>
                        </div>
                        <div className="bg-[#005173] text-white py-2 px-3 rounded-xl shadow-xs text-center flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] lg:text-[12px] tracking-tight select-none">
                            <span className="font-bold text-white">Amount: </span>
                            <span className="font-normal text-white">{item.amount}</span>
                          </span>
                        </div>
                        <div className="bg-[#005173] text-white py-2 px-3 rounded-xl shadow-xs text-center flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] lg:text-[12px] tracking-tight select-none">
                            <span className="font-bold text-white">Status: </span>
                            <span className="font-normal text-white">{item.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions Container */}
                      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        <div className="bg-zinc-100 border-b border-zinc-200 px-5 py-2.5">
                          <span className="text-xs font-bold text-black uppercase tracking-wider select-none">ACTIONS</span>
                        </div>
                        <div className="p-5 lg:p-6">
                          <ul className="list-disc pl-5 space-y-3.5 text-xs lg:text-sm text-zinc-700 leading-relaxed">
                            {item.actions.map((act, actIdx) => (
                              <li key={actIdx} className="marker:text-[#005173]">
                                {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Footnote */}
                  <div className="pt-4 border-t border-zinc-200">
                    <p className="text-xs italic text-zinc-500 font-medium">
                      *% la licitación sobre el monto total actual del proyecto.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>

      {/* Hidden Container for PDF Generation */}
      <div 
        ref={pdfRef}
        className="absolute pointer-events-none bg-white p-12 w-[1600px] pdf-container z-[-10]"
        style={{ left: '-9999px', top: '0', opacity: 1 }}
      >
        <style>{`
          .pdf-container {
            --color-zinc-50: #fafafa !important;
            --color-zinc-100: #f4f4f5 !important;
            --color-zinc-200: #e4e4e7 !important;
            --color-zinc-300: #d4d4d8 !important;
            --color-zinc-400: #a1a1aa !important;
            --color-zinc-500: #71717a !important;
            --color-zinc-600: #52525b !important;
            --color-zinc-700: #3f3f46 !important;
            --color-zinc-800: #27272a !important;
            --color-zinc-900: #18181b !important;
            --color-slate-50: #f8fafc !important;
            --color-slate-100: #f1f5f9 !important;
            --color-slate-200: #e2e8f0 !important;
            --color-slate-300: #cbd5e1 !important;
            --color-slate-400: #94a3b8 !important;
            --color-slate-500: #64748b !important;
            --color-slate-600: #475569 !important;
            --color-slate-700: #334155 !important;
            --color-slate-800: #1e293b !important;
            --color-slate-900: #0f172a !important;
            --color-emerald-500: #10b981 !important;
            --color-emerald-600: #059669 !important;
            --color-emerald-700: #047857 !important;
            --color-blue-500: #3b82f6 !important;
            --color-blue-600: #2563eb !important;
            --color-red-500: #ef4444 !important;
            --color-red-600: #dc2626 !important;
            --color-amber-500: #f59e0b !important;
            --color-amber-600: #d97706 !important;
            --color-white: #ffffff !important;
            --color-black: #000000 !important;
          }
          .pdf-container * {
            color: inherit;
            border-color: inherit;
          }
          .pdf-blue-badge, .pdf-blue-badge * {
            color: #FFFFFF !important;
          }
        `}</style>
        <div id="pdf-page-1" className="bg-white p-8 w-[1600px] min-h-[1130px] flex flex-col break-inside-avoid">
          {/* PDF Header */}
          <div className="mb-1">
            <div className="mb-4">
              <img src={titleImage} alt={bannerTitle} style={{ height: 'auto', maxWidth: '100%' }} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-base text-black font-medium">
              <span>{bannerProjectId}</span>
              {bannerOpNumber && (
                <>
                  <span>|</span>
                  <span>{bannerOpNumber}</span>
                </>
              )}
              <span>|</span>
              <span className="flex items-center gap-1">
                {bannerCountryName && countryCodes[bannerCountryName] ? (
                  <img 
                    src={`https://flagcdn.com/w40/${countryCodes[bannerCountryName]}.png`} 
                    className="w-5 h-auto shadow-sm" 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer" 
                    alt={bannerCountryName || 'Country flag'}
                  />
                ) : bannerCountryCode ? (
                  <img 
                    src={`https://flagcdn.com/w40/${bannerCountryCode.toLowerCase()}.png`} 
                    className="w-5 h-auto shadow-sm" 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer" 
                    alt={bannerCountryName || 'Country flag'}
                  />
                ) : (
                  '🏳️'
                )}
                {bannerCountryName}
              </span>
              <span>|</span>
              <span>TTL: {bannerTtl}</span>
              <span>|</span>
              <span>Status: {bannerStatus}.</span>
              <span>|</span>
              <span className="flex items-center gap-1">
                PMR March Cycle 2026: 
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getDotColor(bannerPmrStatus) }}></div> 
                {bannerPmrStatus}
              </span>
            </div>

            {/* Active Alerts Ribbon in PDF */}
            <div className="flex flex-row items-center justify-start gap-4 mt-3">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider shrink-0 select-none">ACTIVE ALERTS:</span>
              {(() => {
                const activeAlerts = (getAlertsForProject(details.id, gasData) || []).filter(
                  a => a.color === 'red' || a.color === 'yellow'
                );
                if (activeAlerts.length === 0) {
                  return (
                    <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-sm select-none bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 stroke-white shrink-0" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                      <span>No active alerts</span>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-wrap items-center gap-[10px] select-none">
                    {activeAlerts.map(alert => {
                      const info = getAlertTagForProject(details.id, alert.number, gasData);
                      let boxColor = '#cccccc';
                      if (alert.color === 'red') boxColor = '#dc2626';
                      if (alert.color === 'yellow') boxColor = '#f59e0b';

                      const cleanTitle = alert.title.replace(' (last 3 cycles)', '');
                      return (
                        <div 
                          key={alert.number} 
                          className="flex items-center gap-2 bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5 shadow-xs whitespace-nowrap animate-none"
                        >
                          {/* [Cuadrado de color] */}
                          <div 
                            className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-xs animate-none" 
                            style={{ backgroundColor: boxColor }} 
                          />

                          {/* [font-bold text-slate-800: #ID y Nombre en inglés] */}
                          <span className="text-slate-800 text-[12px] font-bold shrink-0 animate-none">
                            {alert.number}. {cleanTitle}
                          </span>

                          {/* [separador textual ':'] */}
                          <span className="text-zinc-400 font-normal text-[12px] -ml-0.5 animate-none">:</span>

                          {/* [font-medium text-zinc-500: Detalle del problema] */}
                          <span className="text-zinc-500 font-medium text-[12px] animate-none">
                            {info.tag}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-2 flex-1">
            {/* COLUMNA IZQUIERDA: General Details & Financial Progress */}
            <div className="col-span-7 flex flex-col gap-4">
              {/* Section 1: General Details */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-black" />
                  <div className="mt-1.5">
                    <img src={generalDetailsImage} alt="General Details" style={{ height: '28px', width: 'auto' }} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Card: All Details */}
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Operation status:</span>
                        <span className="text-zinc-500 font-medium">{formatOperationStatus(gdOperationStatus)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Executing Agency:</span>
                        <span className="text-zinc-500 font-medium text-right">{gdExecutingAgency}</span>
                      </div>
                      <div className="flex justify-between items-start text-sm">
                        <span className="font-bold text-zinc-900">Linked to the loan:</span>
                        <span className="text-zinc-500 font-medium text-right whitespace-pre-line">{details.linkedLoans.join('\n')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Current Approved Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrencyM(fpCurrentApprovedAmountM)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Local contribution:</span>
                        <span className="text-zinc-500 font-medium">{gdLocalContribution}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Disbursed Life Amount:</span>
                        <span className="text-zinc-500 font-medium">{`${fpDisbursedLifePercent.toFixed(1)}%`}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Undisbursed Amount:</span>
                        <span className="text-zinc-500 font-medium">{gdUndisbursedAmountStr}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Months of extensions:</span>
                        <span className="text-zinc-500 font-medium">{gdMonthsOfExtensions}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Last disbursement made:</span>
                        <span className="text-zinc-500 font-medium">{gdLastDisbursementDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Time without disbursement (months):</span>
                        <span className="text-zinc-500 font-medium">{gdMonthsWithoutDisbursement}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Age in execution (since eligibility):</span>
                        <span className="text-zinc-500 font-medium">{gdYearsInExecution}</span>
                      </div>
                    </div>
 
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">OBJECTIVE</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed text-justify">
                          {gdObjective ? (gdObjective.split('.')[0] + '.') : 'No objective provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
 
                  {/* Right Card: Progress */}
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">PROGRESS</h4>
                    
                    <div className="relative space-y-6 pl-10">
                      {/* Steps */}
                      {(() => {
                        const stepList = [
                          { label: 'Approval:', date: tlApprovalDate, completed: tlApprovalCompleted },
                          { label: 'Effectiveness:', date: tlEffectiveDate, completed: tlEffectiveCompleted },
                          { label: 'Eligibility:', date: tlEligibilityDate, completed: tlEligibilityCompleted },
                          { label: 'First disbursement:', date: tlFirstDisbursementDate, completed: tlFirstDisbursementCompleted },
                          { label: 'Totally disbursed:', date: `${tlTotallyDisbursedDate}\nExtension: ${tlExtensionText}\nCurrent deadline: ${tlDeadlineText}`, completed: tlTotallyDisbursedCompleted },
                          { label: 'Closure:', date: tlClosureDate, completed: tlClosureCompleted },
                        ];
                        return stepList.map((step, index) => (
                          <div key={index} className="relative">
                            {index < stepList.length - 1 && (
                              <div 
                                className="absolute w-0.5 z-0" 
                                style={{ 
                                  left: '-28px', 
                                  top: '12px', 
                                  bottom: '-36px', 
                                  backgroundColor: (step.completed && stepList[index + 1].completed) ? '#4EA72E' : '#71717a'
                                }} 
                              />
                            )}
                            <div className="absolute -left-[41px] top-0 p-1 bg-zinc-50 z-10">
                              {step.completed ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-800">{step.label}</span>
                              <span className="text-sm text-zinc-600 whitespace-pre-line">{step.date}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Section 2: Financial Progress */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarIcon className="w-8 h-8 text-black text-2xl" />
                  <div className="mt-1.5">
                    <img src={financialProgressImage} alt="Financial Progress" style={{ height: '28px', width: 'auto' }} />
                  </div>
                </div>
                
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 grid grid-cols-2 gap-6">
                  <div className="space-y-[15.3px] flex flex-col justify-center">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Original Approved Amount:</span>
                      <span className="text-zinc-900 font-bold">{formatCurrency(fpOriginalApprovedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Canceled Amount:</span>
                      <span className="text-zinc-900 font-bold">({formatCurrency(fpCanceledAmount)})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Current Approved Amount:</span>
                      <span className="text-zinc-900 font-bold">{formatCurrency(fpCurrentApprovedAmountRaw)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Deadline for last Current Disbursement:</span>
                      <span className="text-zinc-900 font-bold">{fpDeadlineLastDisbursement}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>CURRENT APPROVED AMOUNT</span>
                        <span className="text-zinc-900">{formatCurrencyM(fpCurrentApprovedAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden flex items-center justify-end px-3">
                        <span className="relative z-10 text-xs font-bold" style={{ color: '#ffffff' }}>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>DISBURSED LIFE AMOUNT</span>
                          {isDisbursedFully && (
                            <div className="w-3 h-3 bg-[#4EA72E] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white stroke-[4]" />
                            </div>
                          )}
                        </div>
                        <span className="text-zinc-900">{formatCurrencyM(fpDisbursedLifeAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-zinc-200 rounded-sm overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#00AEEF] flex items-center justify-end px-3"
                          style={{ width: `${Math.min(100, Math.max(0, fpDisbursedLifePercent))}%` }}
                        >
                          <span className="relative z-10 text-xs font-bold" style={{ color: '#ffffff' }}>
                            {`${fpDisbursedLifePercent.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Los 2 Gráficos */}
            <div className="col-span-5 flex flex-col pt-[48px]">
              {/* Caja con menos padding vertical (py-4) para quitar espacio sobrante arriba y abajo */}
              <div className="bg-zinc-50 rounded-2xl border border-zinc-200 px-6 py-4 flex flex-col gap-8 min-h-[600px]">
                {!hasFirstDisbursement ? (
                  <div className="py-2 px-1">
                    <p className="text-sm text-zinc-600">
                      The project has not made its first disbursement yet. So there is no financial data to show.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chart 1: Historical */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-[13px] font-bold text-[#005173] mb-1 text-center px-4">
                        Historical Performance, Baseline Projection vs Disbursed Amount ($M), by Year
                      </h4>
                      <ComposedChart key={`hist-${pdfRenderKey}`} data={chart1Data} width={550} height={265} margin={{ top: 30, right: 30, bottom: 0, left: 10 }}>
                        <XAxis dataKey="year" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 'bold'}} interval={0} dy={10} />
                        <YAxis hide domain={[0, 'auto']} />
                        <Bar dataKey="bar_historical_baseline" name="Baseline Projection" barSize={30} fill="#e4e4e7" stroke="#a1a1aa" isAnimationActive={false}>
                          <LabelList dataKey="bar_historical_baseline" content={(props: any) => renderCustomBarLabel({ ...props, projectCode: project.id })} />
                        </Bar>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="solidDisbursed" name="Disbursed Amount" stroke="#005173" strokeWidth={3} dot={{r: 5, fill: '#005173', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                          <LabelList dataKey="solidDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                        </Line>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="dashedDisbursed" name="Disbursed Amount" legendType="none" stroke="#005173" strokeWidth={3} strokeDasharray="4 4" dot={{r: 5, fill: '#005173', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                          <LabelList dataKey="dashedDisbursed" position="top" offset={10} content={(props: any) => {
                            if (props.index === chart1Data.length - 1) {
                              return renderCustomLineLabel({ ...props, projectCode: project.id });
                            }
                            return null;
                          }} />
                        </Line>
                      </ComposedChart>
                      <div className="flex justify-center gap-8 text-xs text-zinc-600 font-bold mt-1">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#e4e4e7] border border-[#a1a1aa]"></div>Baseline Projection ($M)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005173]"></div>Disbursed Amount ($M)</div>
                      </div>
                    </div>

                    {/* Chart 2: Monthly */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-[13px] font-bold text-[#005173] mt-2 mb-1 text-center px-4">
                        2026 Cumulative Monthly Disbursements, Current Projection vs Disbursed Amount ($M)
                      </h4>
                      <ComposedChart key={`month-${pdfRenderKey}`} data={chart2Data} width={550} height={265} margin={{ top: 30, right: 30, bottom: 0, left: 25 }}>
                        <XAxis dataKey="month" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 'bold'}} interval={0} dy={10} padding={{ left: 24, right: 16 }} />
                        <YAxis hide domain={[0, 'dataMax + 1']} />
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulative_current_projection" name="Current Projection ($M)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false}>
                          <LabelList dataKey="cumulative_current_projection" content={(props: any) => renderProjectionLabel({ ...props, projectCode: project.id })} />
                        </Line>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulative_disbursed" name="Disbursed Amount ($M)" stroke="#FFB800" strokeWidth={3} dot={{r: 5, fill: '#FFB800', strokeWidth: 0}} connectNulls={false} isAnimationActive={false}>
                          <LabelList dataKey="cumulative_disbursed" position="top" offset={10} content={renderCustomLineLabel} />
                        </Line>
                      </ComposedChart>
                      <div className="flex justify-center gap-8 text-xs text-zinc-600 font-bold mt-1 whitespace-nowrap">
                        <div className="flex items-center gap-2"><div className="w-8 h-[2px] border-t-2 border-dashed border-zinc-400"></div>Current Projection ($M)</div>
                        <div className="flex items-center gap-2"><div className="w-8 h-[3px] bg-[#FFB800] relative flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></div></div>Disbursed Amount ($M)</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
        </div>

        {/* Footer with Data as of */}
        <div className="mt-auto pt-4 flex justify-end">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {dataAsOfLongText}
          </span>
        </div>
        </div>

        <div id="pdf-page-2" className="bg-white p-8 w-[1600px] min-h-[1130px] flex flex-col mt-4 break-inside-avoid">
          {/* Section 3: PMR Performance */}
          <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#005173]" />
              <h2 className="text-2xl font-bold text-[#005173]">PMR Performance</h2>
            </div>
            {!hidePmrHistoricEvaluation && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#4EA72E' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-sm font-bold text-zinc-700">Satisfactory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-[#F59E0B]">
                    <span className="text-white font-bold text-[12px] leading-none">!</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-700">Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#B91C1C' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <span className="text-sm font-bold text-zinc-700">Problem</span>
                </div>
              </div>
            )}
          </div>
          </div>
          
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 flex flex-col gap-6 break-inside-avoid">
            {!hidePmrHistoricEvaluation && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-base text-zinc-600">
                    <span className="font-bold text-black uppercase">PMR HISTORIC EVALUATION - MARCH CYCLE </span>
                    <span className="italic text-black">(After eligibility)</span>
                  </p>
                </div>
            
            {pmrTwoRowsData.length > 0 ? (
              <div className="w-full py-4 px-6">
                {/* Header: Label Spacer + Years */}
                <div className="flex items-center mb-6">
                  <div className="w-64 shrink-0" />
                  <div className="flex-1 flex items-center justify-between px-3">
                    {pmrTwoRowsData.map((item, index, array) => (
                      <React.Fragment key={item.year}>
                        <div className="w-10 flex justify-center">
                          <span className="text-base font-bold text-zinc-900">{item.year}</span>
                        </div>
                        {index < array.length - 1 && <div className="flex-1 min-w-[30px]" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Row 1: Auto-calculated Classification */}
                <div className="flex items-center mb-8">
                  <div className="w-64 shrink-0 pr-4">
                    <span className="text-base font-bold text-zinc-900">Auto-calculated Classification</span>
                  </div>
                  <div className="flex-1 flex items-center justify-between px-3 relative">
                    {pmrTwoRowsData.map((item, index, array) => {
                      const status = item.autoClassification;
                      const nextStatus = array[index + 1]?.autoClassification;
                      const dotColor = getDotColor(status);
                      const tooltipText = `${item.year} Auto-calculated: ${status} (${item.tooltip})`;

                      return (
                        <React.Fragment key={`pdf-auto-${item.year}`}>
                          <div className="w-10 flex justify-center relative">
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-zinc-50 relative z-10"
                              style={{ backgroundColor: dotColor }}
                              title={tooltipText}
                            >
                              {getDotIcon(status)}
                            </div>
                          </div>
                          {index < array.length - 1 && (
                            <div 
                              className="flex-1 h-[3px] mx-1 min-w-[30px]"
                              style={{ backgroundColor: getLineColor(status, nextStatus) }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Row 2: Validated Classification */}
                <div className="flex items-center">
                  <div className="w-64 shrink-0 pr-4">
                    <span className="text-base font-bold text-zinc-900">Validated Classification</span>
                  </div>
                  <div className="flex-1 flex items-center justify-between px-3 relative">
                    {pmrTwoRowsData.map((item, index, array) => {
                      const status = item.validatedClassification;
                      const nextStatus = array[index + 1]?.validatedClassification;
                      const dotColor = getDotColor(status);
                      const tooltipText = `${item.year} Validated: ${status} (${item.tooltip})`;

                      return (
                        <React.Fragment key={`pdf-val-${item.year}`}>
                          <div className="w-10 flex justify-center relative">
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-zinc-50 relative z-10"
                              style={{ backgroundColor: dotColor }}
                              title={tooltipText}
                            >
                              {getDotIcon(status)}
                            </div>
                          </div>
                          {index < array.length - 1 && (
                            <div 
                              className="flex-1 h-[3px] mx-1 min-w-[30px]"
                              style={{ backgroundColor: getLineColor(status, nextStatus) }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Traffic light legend */}
                <div className="flex items-center justify-end gap-6 mt-6 pt-4 border-t border-zinc-200/60 text-xs text-zinc-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></span>
                    <span>Satisfactory</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107]"></span>
                    <span>Alert</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F44336]"></span>
                    <span>Problem</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]"></span>
                    <span>N/A</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600">
                {details.timeline.eligibility.date.trim().toUpperCase() === 'PENDING' 
                  ? "The project has not yet reached eligibility. Therefore, there is no PMR evaluation to show."
                  : `The project reached eligibility on ${details.timeline.eligibility.date}. Therefore, there is no PMR historic evaluation after eligibility yet.`
                }
              </p>
            )}

            <div className="h-px bg-zinc-200" />
              </>
            )}

            <div className="flex items-center gap-2 -mb-2">
              <p className="text-base text-zinc-600">
                <span className="font-bold text-black uppercase">QUALITATIVE INFORMATION - PMR March Cycle 2026</span> | 
                <span className="inline-flex items-center gap-1.5 ml-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${activeValidatedByTTLDate ? 'bg-[#4EA72E]' : 'bg-yellow-400'}`}></span>
                  <span className="italic">
                    {activeValidatedByTTLDate 
                      ? `Validated by the TTL on ${activeValidatedByTTLDate}` 
                      : activeIsPrefilledByTeam 
                        ? 'Pending TTL validation' 
                        : 'Pending Effectiveness Team prefilling'}
                  </span>
                </span>
              </p>
            </div>
            
            <div className="space-y-4 break-inside-avoid">
              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Estado de implementación / Principales riesgos</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(activeQualitativeData?.estadoImplementacion || []).join(' ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Acciones sugeridas / Pedidos</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(activeQualitativeData?.accionesSugeridas || []).join(' ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Productos destacados/innovadores del proyecto</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(activeQualitativeData?.productosDestacados || []).join('. ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en el PCR</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    {renderReadOnlyQualitativeList(activeQualitativeData?.probabilidadObjetivos)}
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-tight">Fecha evaluación intermedia</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {activeQualitativeData?.fechaEvaluacionIntermedia || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-tight">Fecha talleres de arranque</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {activeQualitativeData?.fechaTalleresArranque || 'N/A'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer with Data as of */}
          <div className="mt-auto pt-6 flex justify-end">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {dataAsOfLongText}
            </span>
          </div>
        </div>

        {['PN-L1161', 'PN-L1172'].includes(projectCode) && (
          <div 
            id="pdf-page-3" 
            className="bg-white p-8 w-[1600px] min-h-[1130px] flex flex-col mt-4 break-inside-avoid"
            style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { pageBreakBefore: 'always' } : undefined}
          >
            {/* Page Header */}
            <div className="mb-6">
              <div className="mb-4">
                <img src={titleImage} alt={details.name} style={{ height: 'auto', maxWidth: '100%' }} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-base text-black font-medium pb-4 border-b border-zinc-200">
                <span>{details.id}</span>
                <span className="flex items-center gap-1">
                  {details.countryName && countryCodes[details.countryName] ? (
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[details.countryName]}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={details.countryName || 'Country flag'}
                    />
                  ) : details.countryCode ? (
                    <img 
                      src={`https://flagcdn.com/w40/${details.countryCode.toLowerCase()}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={details.countryName || 'Country flag'}
                    />
                  ) : (
                    '🏳️'
                  )}
                  {details.countryName}
                </span>
                <span>|</span>
                <span>TTL: {details.ttl}</span>
                <span>|</span>
                <span>Status: {details.operationStatus}.</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  PMR March Cycle 2026: 
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getDotColor(details.pmrStatus) }}></div> 
                  {formatPMR(details.pmrStatus)}
                </span>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-2 gap-8 flex-1">
              {/* Left Column: Mid-Term Evaluation */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-7 h-7 text-[#005173]" />
                  <h3 className="text-xl font-bold text-[#005173]">Mid-Term Evaluation</h3>
                </div>

                <div 
                  className={`bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs ${
                    ['PN-L1161', 'PN-L1172'].includes(projectCode) ? 'h-fit' : 'flex-1'
                  }`}
                  style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { height: 'fit-content' } : undefined}
                >
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="py-2.5 px-4 text-left text-xs font-bold text-black uppercase tracking-wider w-[25%]">Pillar</th>
                        <th className="py-2.5 px-4 text-center text-xs font-bold text-black uppercase tracking-wider w-[40%]">Main findings</th>
                        <th className="py-2.5 px-4 text-center text-xs font-bold text-black uppercase tracking-wider w-[35%]">Recommended actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {EVALUATION_DATA[project.id] ? (
                        EVALUATION_DATA[project.id].map((item, index) => (
                          <tr key={index}>
                            <td className="py-3 px-4 align-top text-xs font-bold text-zinc-900 leading-tight">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 align-top text-[11px] text-zinc-700 leading-normal">
                              <ul className="list-disc pl-4 space-y-1">
                                {item.findings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-3 px-4 align-top text-[11px] text-zinc-700 leading-normal">
                              <ul className="list-disc pl-4 space-y-1">
                                {item.actions.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-xs text-zinc-500 font-medium">
                            No evaluation data available yet for this project.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Critical Procurement Processes */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <ClipboardCheck className="w-7 h-7 text-[#005173]" />
                  <h3 className="text-xl font-bold text-[#005173]">Critical Procurement Processes</h3>
                </div>

                <div className="space-y-4 flex-1">
                  {((project.id === 'PN-L1172') ? [
                    {
                      number: "1",
                      title: "Diseño y acompañamiento técnico para la implementación del Ecosistema Fiscal Inteligente (EFI)",
                      processCode: "PN-L1172-P00027",
                      amount: "$ 1.2 MM (6%)*",
                      status: "En ejecución",
                      actions: [
                        "Contrato en ejecución desde enero de 2026, con fecha de finalización en 2027. La firma consultora maneja un cronograma normal y otro acelerado que podría terminar en febrero de 2027.",
                        "Este contrato es crítico no tanto por el monto como por su alcance: la FC debe acompañar al ejecutor en todos los pasos de la implementación. Un área crucial es identificar las necesidades de inversión que demandarán cada una de las instituciones que integran el EFI. Adicionalmente, el MEF creó un comité de de Gobernanza del EFI, con MEF, AIG, Contraloría, BID y la FC, a fin de acelerar la identificación de necesidades y toma de decisiones alineados a los objetivos del EFI. Se espera una propuesta detallada de necesidades de inversión al cierre de agosto 2026 que reordenará el plan de adquisiciones del EFI. El Banco ha recibido una solicitud de extensión del plazo contractual por 2 años más allá del 18 de agosto de 2026."
                      ]
                    }
                  ] : [
                    {
                      number: "1",
                      title: "Diagnóstico, diseño, desarrollo e implementación para la modernización del Sistema Tributario (e-Tax 2.0)",
                      processCode: "PN-L1161-P00074",
                      amount: "$ 6 MM (15%)*",
                      status: "Recepción de ofertas",
                      actions: [
                        "Proceso fue publicado y se encuentra en etapa de recibimiento de ofertas (técnicas y económicas, LPI).",
                        "Se fortaleció la UEP, en especial en el área de Adquisiciones, para que los documentos contractuales tengan una altísima calidad.",
                        "Adicionalmente, se ha instruido a la UEP para que pueda apoyar a la Comisión Evaluadora del proceso, con base a los lineamientos y políticas de adquisiciones del BID, con la finalidad de tener un informe de evaluación de alta calidad que permita asignar el contrato con seguridad. Se espera dar inicio en ejecución 1Q 2027."
                      ]
                    },
                    {
                      number: "2",
                      title: "Adquisición de licenciamiento, implementación, soporte y mantenimiento de plataforma de base de datos ORACLE",
                      processCode: "PN-L1161-P00062",
                      amount: "$ 10 MM (25%)*",
                      status: "Por iniciar licitación",
                      actions: [
                        "Se cuenta con el visto bueno de las instancias técnicas del Gobierno (AIG) para pasarlo a no objeción del BID e iniciar enseguida el proceso de licitación.",
                        "El proceso llevaba dos años en discusiones internas entre el Departamento de Tecnología de la Dirección General Impositiva y el área de tecnología del MEF (recordemos que la DGI está integrada en la estructura del MEF).",
                        "El equipo técnico del Banco (el Asociado Senior de Sectores – Arquitectura de Datos y Sistemas de IFD/FMM y un Consultor PEC) facilitaron sesiones de trabajo conjuntas con los departamentos del Gobierno y finalmente se cuenta con el VoBo de ambas instancias. Se espera dar inicio a la ejecución en 1Q 2027."
                      ]
                    },
                    {
                      number: "3",
                      title: "Adquisición, implementación, soporte y mantenimiento para el fortalecimiento de infraestructura tecnológica (balanceadores)",
                      processCode: "PN-L1161-P00067",
                      amount: "$ 2.3 MM (6%)*",
                      status: "Por iniciar licitación",
                      actions: [
                        "Fue enviado el 9 de junio para no objeción al BID. Se iniciará el proceso de licitación de modo inmediato.",
                        "Al igual que el proceso anterior, este llevaba un año en negociaciones internas entre departamento de tecnología de DGI y MEF.",
                        "Finalmente se cuenta con el VoBo de ambas instancias tras sesiones de trabajo conjuntas con el equipo técnico del Banco. Se espera dar inicio en ejecución 2Q 2027."
                      ]
                    }
                  ]).map((item, index) => (
                    <div key={index} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-xs">
                      {/* Title block with deep blue border accent */}
                      <div className="border-l-4 border-[#005173] pl-3 mb-3">
                        <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                          {item.number}. {item.title}
                        </h4>
                      </div>

                      {/* Info Badges */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className={`bg-[#005173] text-white py-1.5 px-2 rounded-lg text-center flex items-center justify-center ${['PN-L1161', 'PN-L1172'].includes(projectCode) ? 'pdf-blue-badge' : ''}`} style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                          <span className="text-[9px] tracking-tight text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                            <span className="font-bold text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>Process code: </span>
                            <span className="font-normal text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>{item.processCode}</span>
                          </span>
                        </div>
                        <div className={`bg-[#005173] text-white py-1.5 px-2 rounded-lg text-center flex items-center justify-center ${['PN-L1161', 'PN-L1172'].includes(projectCode) ? 'pdf-blue-badge' : ''}`} style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                          <span className="text-[9px] tracking-tight text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                            <span className="font-bold text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>Amount: </span>
                            <span className="font-normal text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>{item.amount}</span>
                          </span>
                        </div>
                        <div className={`bg-[#005173] text-white py-1.5 px-2 rounded-lg text-center flex items-center justify-center ${['PN-L1161', 'PN-L1172'].includes(projectCode) ? 'pdf-blue-badge' : ''}`} style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                          <span className="text-[9px] tracking-tight text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>
                            <span className="font-bold text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>Status: </span>
                            <span className="font-normal text-white" style={['PN-L1161', 'PN-L1172'].includes(projectCode) ? { color: '#FFFFFF' } : undefined}>{item.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions Box */}
                      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-xs">
                        <div className="bg-zinc-100 border-b border-zinc-200 px-3 py-1.5">
                          <span className="text-[10px] font-bold text-black uppercase tracking-wider">ACTIONS</span>
                        </div>
                        <div className="p-3">
                          <ul className="list-disc pl-4 space-y-1 text-[10px] text-zinc-700 leading-normal">
                            {item.actions.map((action, actionIdx) => (
                              <li key={actionIdx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Data as of */}
            <div className="mt-auto pt-6 flex justify-end">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {dataAsOfLongText}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
