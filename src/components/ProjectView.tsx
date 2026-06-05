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
import { History, CheckCircle2, RotateCcw } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const getDotColor = (status: string) => {
  const s = String(status || '').toUpperCase().trim();
  if (s === 'SATISFACTORY') return '#4CAF50';
  if (s === 'ALERT') return '#FFC107';
  if (s === 'PROBLEM') return '#F44336';
  return '#9CA3AF'; // N/A
};

const formatPMR = (pmr: string) => {
  const str = String(pmr || '').toUpperCase().trim();
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

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
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
          return (
            <p key={index} className={`mb-1 ${isMobile ? 'text-[9.5px]' : 'text-xs'}`}>
              <span className={`font-bold ${isDisbursed ? 'text-[#005173]' : 'text-zinc-500'}`}>{entry.name}:</span> ${Math.round(displayValue || 0).toLocaleString()}M
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
  const { x, y, width, height, value, payload, projectCode } = props;
  const disb = payload?.combinedDisbursed || 0;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isSpecialProject = String(projectCode || '').trim().toUpperCase() === 'AR-L1248';
  const year = payload?.year ? parseInt(payload.year) : 0;

  if (value == null) return null;
  if (value === 0 && !(isSpecialProject && isDesktop && year === 2024)) return null;

  let dy = 16; // Default: securely inside the top of the bar

  if (isDesktop) {
    if (isSpecialProject && year === 2020) {
      // FIX: Push label to the very bottom of the tall 2020 bar on desktop.
      dy = Math.abs(height || 0) > 20 ? Math.abs(height) - 15 : 12;
    } else if (value <= 6) {
      // Logic for tiny bars on desktop
      dy = -14;
      if (Math.abs(value - disb) <= 6) {
        dy = -34;
      }
      // FIX: Force 2024 (0$) to align perfectly with 2025 (1$) horizontally
      if (isSpecialProject && (year === 2024 || year === 2025)) {
        dy = -34;
      }
    } else {
      // Collision avoidance for normal bars on desktop
      if (value > disb && (value - disb) <= 12) {
        dy = 32; 
      }
    }
  } else {
    // Mobile view fallback: Only apply a simple, safe offset for tiny bars
    // to prevent labels from disappearing inside 2px high bars on small screens.
    if (value <= 6) {
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
      ${Math.round(value)}
    </text>
  );
};

const renderCustomLineLabel = (props: any) => {
  const { x, y, value, payload, projectCode } = props;
  if (value == null) return null;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isSpecialProject = String(projectCode || '').trim().toUpperCase() === 'AR-L1248';
  const year = payload?.year ? parseInt(payload.year) : 0;

  let labelY = y - 12; // Default above

  // The line label ALWAYS sits cleanly above the dot.
  // The Bar label logic above is now mathematically designed to dynamically avoid this space.
  return (
    <text 
      x={x} 
      y={labelY} 
      fill="#18181b" 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 11} 
      fontWeight={500}
    >
      ${Math.round(value)}
    </text>
  );
};

const renderProjectionLabel = (props: any) => {
  const { x, y, value } = props;
  if (value == null || value === 0) return null;
  
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
      ${Math.round(value)}
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

export default function ProjectView({ project, onBack, onUpdate }: ProjectViewProps) {
  const { getProjectDetails, loading: dataLoading } = usePortfolioData();
  const details = getProjectDetails(project.id);
  const currentYear = new Date().getFullYear();
  
  // Extract approval year from string (e.g., "MAR/2020", "22/MAR/2020", etc.)
  const approvalDate = details?.timeline?.approval?.date || '';
  const approvalYearMatch = approvalDate.match(/\d{4}/);
  const startYear = approvalYearMatch ? parseInt(approvalYearMatch[0]) : 0;

  const rawHistoricalData = details?.historicalPerformanceData || [];
  const historicalData = rawHistoricalData.filter(d => {
    const year = parseInt(d.year);
    if (isNaN(year)) return false;
    return year >= startYear && year <= currentYear;
  });

  const firstDisbursementDate = details?.timeline?.firstDisbursement?.date || '';
  const hasFirstDisbursement = firstDisbursementDate.trim().toUpperCase() !== 'PENDING' && firstDisbursementDate !== '';

  const splitIndex = historicalData.findIndex(d => parseInt(d.year) === currentYear - 1);
  const splitPercentage = historicalData.length > 1 && splitIndex !== -1 
    ? (splitIndex / (historicalData.length - 1)) * 100 
    : 100;

  const [activeTab, setActiveTab] = useState<'baseline' | 'interview' | 'qa'>('baseline');
  const [historicalView, setHistoricalView] = useState<'graph' | 'values'>('graph');
  const [monthlyView, setMonthlyView] = useState<'graph' | 'values'>('graph');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfRenderKey, setPdfRenderKey] = useState(0);
  const pdfRef = useRef<HTMLDivElement>(null);

  const titleImage = React.useMemo(() => renderTextToDataURL(project.name, 'bold 30px Inter, system-ui, sans-serif', '#18181b', 1530), [project.name]);
  const generalDetailsImage = React.useMemo(() => renderTextToDataURL('General Details', 'bold 24px Inter, system-ui, sans-serif', '#18181b', 500), []);
  const financialProgressImage = React.useMemo(() => renderTextToDataURL('Financial Progress', 'bold 24px Inter, system-ui, sans-serif', '#18181b', 500), []);

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
      const pageIds = ['pdf-page-1', 'pdf-page-2'];

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

  const tabs = [
    { id: 'baseline', label: 'General Details', icon: <CustomFileSearchIcon className="w-4 h-4" /> },
    { id: 'qa', label: 'Financial Progress', icon: <DollarIcon className="w-4 h-4" /> },
    { id: 'interview', label: 'PMR Performance', icon: <TrendingUp className="w-4 h-4" /> },
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
              <h2 className="text-lg md:text-[18px] font-semibold tracking-tight text-black leading-tight mt-1 lg:mt-0 w-full break-words lg:truncate">{project.name}</h2>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-y-2 lg:gap-x-3 text-xs text-zinc-500 font-medium mt-3 lg:whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span className="lg:hidden shrink-0">Project ID:</span> 
                  {project.id}
                </span>
                {details.linkedLoans.length > 0 && (
                  <>
                    <span className="hidden lg:inline text-zinc-300">|</span>
                    <div className="flex items-start gap-1.5 lg:whitespace-nowrap">
                      <span className="lg:hidden shrink-0 mt-0.5">•</span>
                      <div className="flex flex-row items-center gap-x-1">
                        <span className="lg:hidden shrink-0 font-medium whitespace-nowrap">Operation ID:</span>
                        <span className="flex-1 whitespace-nowrap">{details.linkedLoans.join(', ')}</span>
                      </div>
                    </div>
                  </>
                )}
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span className="lg:hidden shrink-0 mr-0.5">Country:</span>
                  {project.countryName && countryCodes[project.countryName] ? (
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[project.countryName]}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={project.countryName || 'Country flag'}
                    />
                  ) : project.countryCode ? (
                    <img 
                      src={`https://flagcdn.com/w40/${project.countryCode.toLowerCase()}.png`} 
                      className="w-5 h-auto shadow-sm" 
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer" 
                      alt={project.countryName || 'Country flag'}
                    />
                  ) : (
                    '🏳️'
                  )}
                  {project.countryName}
                </span>
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span>TTL: {(() => {
                    const ttlStr = project.ttl || '';
                    if (['BR-L1377', 'BR-L1534'].includes(project.id)) return 'MARIA CRISTINA';
                    if (ttlStr.toUpperCase() === 'YARYGINA UDOVENKO, ANASTASIYA') return 'ANASTASIYA';
                    
                    const isEcuador = project.countryName === 'Ecuador';
                    if (isEcuador && ttlStr.toUpperCase().includes('ARIEL')) return 'ARIEL';

                    // Determine if we need to shorten the name to save space on desktop
                    const hasLongOperationId = details.linkedLoans.length > 1 || (details.linkedLoans.length === 1 && details.linkedLoans[0].length > 12);
                    
                    if (hasLongOperationId && ttlStr.includes(',')) {
                      const [lastPart, firstPart] = ttlStr.split(',').map(s => s.trim());
                      const lastNames = lastPart.split(' ');
                      const firstNames = firstPart.split(' ');
                      
                      // If very tight (2+ loans), show only first name
                      if (details.linkedLoans.length >= 2) {
                        return firstNames[0];
                      }
                      
                      // Otherwise, try to keep first surname and first name
                      if (lastNames.length >= 2) {
                        return `${lastNames[0]}, ${firstNames[0]}`;
                      }
                    }
                    
                    return ttlStr;
                  })()}</span>
                </span>
                <span className="hidden lg:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="lg:hidden shrink-0">•</span>
                  <span>Status: {details.operationStatus}</span>
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
                        backgroundColor: getDotColor(details.pmrStatus)
                      }}
                    ></span> 
                    {formatPMR(details.pmrStatus)}
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

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-12">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 px-4 lg:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-1 lg:p-2 lg:sticky lg:top-6 grid grid-cols-3 lg:flex lg:flex-col overflow-hidden lg:overflow-x-visible no-scrollbar whitespace-normal items-stretch">
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
                  ) : (
                    <>PMR<span className="lg:hidden"><br /></span><span className="hidden lg:inline"> </span>Performance</>
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
                        <span className="text-zinc-500 font-medium text-right ml-4">{details.operationStatus}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Executing Agency:</span>
                        <span className="text-zinc-500 font-medium text-right ml-4">{details.executingAgency}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Linked to<br className="lg:hidden" /> the loan:</span>
                        <span className="text-zinc-500 font-medium text-right ml-4 whitespace-pre-line">{details.linkedLoans.join('\n')}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Current<br className="lg:hidden" /> Approved<br className="lg:hidden" /> Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrency(details.currentApprovedAmount)}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Local contribution:</span>
                        <span className="text-zinc-500 font-medium">{project.id === 'AR-L1416' ? '$ 0.00' : project.id === 'BR-L1656' ? '$5,875,000.00' : ''}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Disbursed Life<br className="lg:hidden" /> Amount:</span>
                        <span className="text-zinc-500 font-medium">{details.disbursedLifePercent.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Undisbursed Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrency(details.currentApprovedAmount - details.disbursedLifeAmount)}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Months of extensions:</span>
                        <span className="text-zinc-500 font-medium">{details.monthsOfExtension || '0'}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Last disbursement date:</span>
                        <span className="text-zinc-500 font-medium">{project.id === 'AR-L1416' ? 'N/A' : (details.timeline.lastDisbursement.date === 'Pending' ? 'N/A' : details.timeline.lastDisbursement.date)}</span>
                      </div>
                      <div className="flex justify-between items-start text-[12.6px] lg:text-sm">
                        <span className="font-bold text-zinc-900">Years in execution<br className="lg:hidden" /> (since eligibility):</span>
                        <span className="text-zinc-500 font-medium">{details.ageInExecution || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10.8px] lg:text-xs font-bold text-zinc-900 uppercase tracking-wider">OBJECTIVE</h4>
                        <p className="text-[12.6px] lg:text-sm text-zinc-500 font-medium leading-relaxed text-justify">
                          {details.objective ? (details.objective.split('.')[0] + '.') : 'No objective provided.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Progress */}
                  <div className="bg-zinc-50 p-6 lg:p-8 rounded-2xl border border-zinc-200 min-h-[400px]">
                    <h4 className="text-[10.8px] lg:text-xs font-bold text-zinc-900 uppercase tracking-wider mb-8">PROGRESS</h4>
                    
                    <div className="space-y-0.5 max-w-sm mx-auto lg:mx-0">
                      {/* Stage I */}
                      <div className="flex gap-0.5">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage I</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm space-y-6 relative pl-14 z-30">
                          {/* Approval */}
                          <div className="relative">
                            {details.timeline.approval.status === 'completed' && (
                              <div className="absolute -left-[31px] top-[28px] bottom-[-20px] w-0.5 bg-[#4EA72E]" />
                            )}
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.approval.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Approval:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{details.timeline.approval.date}</span>
                            </div>
                          </div>
                          {/* Effectiveness */}
                          <div className="relative">
                            {details.timeline.effectiveness.status === 'completed' && (
                              <div className="absolute -left-[31px] top-[28px] bottom-[-48px] w-0.5 bg-[#4EA72E] z-50" />
                            )}
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.effectiveness.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Effectiveness:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{details.timeline.effectiveness.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stage II */}
                      <div className="flex gap-0.5">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage II</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm space-y-6 relative pl-14 z-20">
                          {/* Eligibility */}
                          <div className="relative">
                            {details.timeline.eligibility.status === 'completed' && (
                              <div className="absolute -left-[31px] top-[28px] bottom-[-20px] w-0.5 bg-[#4EA72E]" />
                            )}
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.eligibility.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Eligibility:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{details.timeline.eligibility.date}</span>
                            </div>
                          </div>
                          {/* First disbursement */}
                          <div className="relative">
                            {details.timeline.firstDisbursement.status === 'completed' && (
                              <div className="absolute -left-[31px] top-[28px] bottom-[-48px] w-0.5 bg-[#4EA72E] z-50" />
                            )}
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.firstDisbursement.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">First disbursement:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{details.timeline.firstDisbursement.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stage III */}
                      <div className="flex gap-0.5">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Stage III</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm relative pl-14 z-10">
                          {/* Last disbursement */}
                          <div className="relative">
                            {details.timeline.lastDisbursement.status === 'completed' && (
                              <div className="absolute -left-[31px] top-[28px] bottom-[-45px] w-0.5 bg-[#4EA72E]" />
                            )}
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.lastDisbursement.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Last disbursement:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">
                                {details.timeline.lastDisbursement.date}.<br />
                                <span className="text-[12.6px] lg:text-sm text-zinc-500 font-normal">Extension: {details.timeline.extension.text}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Closure (CLOSURE Stage) */}
                      <div className="flex gap-0.5">
                        <div className="w-6 bg-[#BFBFBF] rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-white text-[6.3px] lg:text-[7px] font-bold uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>CLOSURE</span>
                        </div>
                        <div className="flex-1 bg-zinc-100/80 p-6 rounded-sm relative pl-14 z-10">
                          <div className="relative">
                            <div className="absolute -left-[42px] top-0 p-0.5 bg-transparent z-10">
                              {details.timeline.closure.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 stroke-white" style={{ color: '#4EA72E', fill: '#4EA72E' }} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                  <RotateCcw className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[12.6px] lg:text-sm font-bold text-zinc-800">Closure:</span>
                              <span className="text-[12.6px] lg:text-sm text-zinc-600">{details.timeline.closure.date}</span>
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
                
                <div className="flex items-center gap-2 mt-6 mb-3">
                  <p className="text-sm text-zinc-600">
                    <span className="font-bold text-black uppercase">PMR HISTORIC EVALUATION - MARCH CYCLE </span>
                    <span className="italic text-black">(After eligibility)</span>
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 sm:p-6 rounded-2xl border border-zinc-200">
                  {details.pmrHistory.length > 0 ? (
                    <>
                      {/* Desktop Horizontal View */}
                      <div className="hidden lg:block pb-4 w-full">
                        <div className="grid lg:grid-cols-[220px_1fr] gap-y-4 w-full">
                          {/* Years Header */}
                          <div />
                          <div className="flex items-center w-full lg:px-4 justify-between">
                            {details.pmrHistory.map((item, index, array) => (
                              <React.Fragment key={item.year}>
                                <div className="w-6 flex justify-center">
                                  <span className="text-sm font-bold text-zinc-900">{item.year}</span>
                                </div>
                                {index < array.length - 1 && <div className="flex-1 min-w-[4px]" />}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Auto-calculated Classification */}
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-zinc-900 leading-tight">Auto-calculated Classification</span>
                          </div>
                          <div className="flex items-center w-full lg:px-4 justify-between">
                            {details.pmrHistory.map((item, index, array) => (
                              <React.Fragment key={item.year}>
                                <div className="w-6 flex justify-center">
                                  <div className="relative group">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm cursor-help transition-transform duration-200 group-hover:scale-110 ring-[2px] ring-zinc-50 relative z-10"
                                      style={{ backgroundColor: getDotColor(item.autoCalculatedStatus) }}
                                    >
                                      {getDotIcon(item.autoCalculatedStatus)}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                      {item.hoverText}: {item.autoCalculatedStatus}
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                    </div>
                                  </div>
                                </div>
                                {index < array.length - 1 && (
                                  <div 
                                    className="flex-1 h-[2px] mx-0.5 min-w-[4px]"
                                    style={{ backgroundColor: getLineColor(item.autoCalculatedStatus, array[index+1].autoCalculatedStatus) }}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Validated Classification */}
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-zinc-900 leading-tight">Validated Classification</span>
                          </div>
                          <div className="flex items-center w-full lg:px-4 justify-between">
                            {details.pmrHistory.map((item, index, array) => (
                              <React.Fragment key={item.year}>
                                <div className="w-6 flex justify-center">
                                  <div className="relative group">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm cursor-help transition-transform duration-200 group-hover:scale-110 ring-[2px] ring-zinc-50 relative z-10"
                                      style={{ backgroundColor: getDotColor(item.validatedStatus) }}
                                    >
                                      {getDotIcon(item.validatedStatus)}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                      {item.hoverText}: {item.validatedStatus}
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                    </div>
                                  </div>
                                </div>
                                {index < array.length - 1 && (
                                  <div 
                                    className="flex-1 h-[2px] mx-0.5 min-w-[4px]"
                                    style={{ backgroundColor: getLineColor(item.validatedStatus, array[index+1].validatedStatus) }}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Vertical View */}
                      <div className="block lg:hidden w-full overflow-visible">
                        <div className="grid grid-cols-[50px_1fr_1fr] gap-y-[18px] w-full max-w-[340px] mx-auto items-center px-2">
                          {/* Header Row */}
                          <div className="text-[10px] font-bold text-zinc-500 text-center leading-tight">Year</div>
                          <div className="text-[10px] font-bold text-zinc-500 text-center leading-tight px-1">Auto-calculated<br/>Classification</div>
                          <div className="text-[10px] font-bold text-zinc-500 text-center leading-tight px-1">Validated<br/>Classification</div>
                          
                          {/* Data Rows */}
                          {details.pmrHistory.map((item, index, array) => (
                            <React.Fragment key={item.year}>
                              <div className="flex justify-center">
                                <span className="text-[11px] font-bold text-zinc-900">{item.year}</span>
                              </div>
                              <div className="flex justify-center relative">
                                <div className="relative group">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm ring-[2px] ring-zinc-50 relative z-10"
                                    style={{ backgroundColor: getDotColor(item.autoCalculatedStatus) }}
                                  >
                                    {getDotIcon(item.autoCalculatedStatus)}
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                    {item.autoCalculatedStatus}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                  </div>
                                </div>
                                {index < array.length - 1 && (
                                  <div 
                                    className="absolute top-6 left-1/2 -translate-x-1/2 w-[2px] h-[11px] z-0"
                                    style={{ backgroundColor: getLineColor(item.autoCalculatedStatus, array[index+1].autoCalculatedStatus) }}
                                  />
                                )}
                              </div>
                              <div className="flex justify-center relative">
                                <div className="relative group">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm ring-[2px] ring-zinc-50 relative z-10"
                                    style={{ backgroundColor: getDotColor(item.validatedStatus) }}
                                  >
                                    {getDotIcon(item.validatedStatus)}
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                    {item.validatedStatus}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                  </div>
                                </div>
                                {index < array.length - 1 && (
                                  <div 
                                    className="absolute top-6 left-1/2 -translate-x-1/2 w-[2px] h-[11px] z-0"
                                    style={{ backgroundColor: getLineColor(item.validatedStatus, array[index+1].validatedStatus) }}
                                  />
                                )}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] lg:text-sm text-zinc-600">
                      {details.timeline.eligibility.date.trim().toUpperCase() === 'PENDING' 
                        ? "The project has not yet reached eligibility. Therefore, there is no PMR evaluation to show."
                        : `The project reached eligibility on ${details.timeline.eligibility.date}. Therefore, there is no PMR historic evaluation after eligibility yet.`
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-6 mb-3">
                  <p className="text-sm text-zinc-600">
                    <span className="font-bold text-black uppercase">QUALITATIVE INFORMATION - PMR March Cycle 2026</span> | 
                    <span className="inline-flex items-center gap-1.5 ml-1.5">
                      <span className={`w-2 h-2 rounded-full ${project.validatedByTTLDate ? 'bg-[#4EA72E]' : 'bg-yellow-400'}`}></span>
                      <span className="italic text-[13.3px] lg:text-sm">
                        {project.validatedByTTLDate 
                          ? `Validated by the TTL on ${project.validatedByTTLDate}` 
                          : project.isPrefilledByTeam 
                            ? 'Pending TTL validation' 
                            : 'Pending Effectiveness Team prefilling'}
                      </span>
                    </span>
                  </p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Estado de implementación / Principales riesgos</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                          {(project.qualitativeData?.estadoImplementacion || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Productos destacados/innovadores del proyecto</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                          {(project.qualitativeData?.productosDestacados || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en el PCR</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                          {(project.qualitativeData?.probabilidadObjetivos || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Acciones sugeridas / Pedidos</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <ul className="list-disc pl-5 text-[11px] lg:text-sm text-zinc-700 space-y-1">
                          {(project.qualitativeData?.accionesSugeridas || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Fecha evaluación intermedia</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 min-h-[50px]">
                        <p className="text-[11px] lg:text-sm text-zinc-700 whitespace-pre-wrap">
                          {project.qualitativeData?.fechaEvaluacionIntermedia || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] lg:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-tight">Fecha talleres de arranque</h4>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 min-h-[50px]">
                        <p className="text-[11px] lg:text-sm text-zinc-700 whitespace-pre-wrap">
                          {project.qualitativeData?.fechaTalleresArranque || 'N/A'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
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
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{formatCurrency(details.financial.originalApprovedAmount)}</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Canceled Amount:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">({formatCurrency(details.financial.canceledAmount)})</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Current Approved Amount:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{formatCurrency(details.financial.currentApprovedAmount)}</span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Time without disbursement (months):</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0"></span>
                    </div>
                    <div className="flex flex-row justify-between items-start lg:items-center text-[12.6px] lg:text-sm gap-2">
                      <span className="font-bold text-zinc-900 text-left w-[45%] lg:w-auto whitespace-normal leading-snug pr-2">Deadline for last Current Disbursement:</span>
                      <span className="text-zinc-500 font-medium text-right w-[55%] lg:w-auto break-words shrink-0">{details.financial.deadlineLastDisbursement}</span>
                    </div>
                  </div>

                  {/* Right Column: Progress Bars */}
                  <div className="w-full lg:col-span-5 flex flex-col justify-start lg:justify-between py-1 gap-y-6 lg:gap-y-0 mt-4 lg:mt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>CURRENT APPROVED AMOUNT</span>
                        <span className="text-zinc-900">{formatCurrencyM(details.financial.currentApprovedAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden flex items-center justify-end px-2">
                        <span className="relative z-10 text-[9px] lg:text-[10px] font-bold" style={{ color: '#ffffff' }}>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2 lg:mt-3">
                      <div className="flex justify-between text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>DISBURSED LIFE AMOUNT</span>
                          {details.financial.isDisbursedFully && (
                            <div className="w-3 h-3 bg-[#4EA72E] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white stroke-[4]" />
                            </div>
                          )}
                        </div>
                        <span className="text-zinc-900">{formatCurrencyM(details.financial.disbursedLifeAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-zinc-200 rounded-sm overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#00AEEF] flex items-center justify-end px-2"
                          style={{ width: `${details.financial.disbursedLifePercent}%` }}
                        >
                          <span className="relative z-10 text-[9px] lg:text-[10px] font-bold" style={{ color: '#ffffff' }}>
                            {details.financial.disbursedLifePercent.toFixed(1)}%
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
                          <ComposedChart data={historicalData} margin={{ top: 30, right: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 0 : 30, bottom: 65, left: 5 }}>
                            <defs>
                              <pattern id="diagonalHatchProj" patternUnits="userSpaceOnUse" width="4" height="4">
                                <rect width="4" height="4" fill="#ffffff" />
                                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                              </pattern>
                              <linearGradient id="solidLineGradient" x1="0" y1="0" x2="100%" y2="0">
                                <stop offset={`${splitPercentage}%`} stopColor="#005173" />
                                <stop offset={`${splitPercentage}%`} stopColor="transparent" />
                              </linearGradient>
                              <linearGradient id="dashedLineGradient" x1="0" y1="0" x2="100%" y2="0">
                                <stop offset={`${splitPercentage}%`} stopColor="transparent" />
                                <stop offset={`${splitPercentage}%`} stopColor="#005173" />
                              </linearGradient>
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
                            <YAxis hide domain={[0, 'dataMax + 10']} />
                            <RechartsTooltip content={<CustomChartTooltip />} />
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
                            <Bar dataKey="projection" name="Baseline Projection" barSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 18 : 24} fill="url(#diagonalHatchProj)" stroke="#d4d4d8" isAnimationActive={false}>
                              <LabelList dataKey="projection" content={(props: any) => renderCustomBarLabel({ ...props, projectCode: project.id })} />
                            </Bar>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="combinedDisbursed" name="Disbursed Amount ($M)" stroke="url(#solidLineGradient)" strokeWidth={2} dot={{r: 4, fill: '#005173', strokeWidth: 0}} isAnimationActive={false}>
                              <LabelList dataKey="combinedDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                            </Line>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="combinedDisbursed" name="Disbursed Amount ($M)" stroke="url(#dashedLineGradient)" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#005173', strokeWidth: 0}} isAnimationActive={false}>
                              <LabelList dataKey="combinedDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                            </Line>
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="px-1 lg:px-8 pb-4 overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-zinc-100 border-b border-zinc-200">
                                <th className="py-2 px-1 lg:px-4 text-left text-[9px] lg:text-xs font-bold text-zinc-600 uppercase">Year</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Baseline<br className="lg:hidden" /> Projection ($)</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Disbursed<br className="lg:hidden" /> Amount ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalData.map((row, idx) => (
                                <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-zinc-900">{row.year}</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.projection > 0 ? (row.projection * 1000000).toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.disbursed !== null ? (row.disbursed * 1000000).toLocaleString() : (row.projected_disbursed !== undefined ? (row.projected_disbursed * 1000000).toLocaleString() : '-')}
                                  </td>
                                </tr>
                              ))}
                              {historicalData.length > 0 && (
                                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-[#005173]">Total</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-[#005173] font-bold">
                                    {historicalData.reduce((sum, row) => sum + (row.projection || 0), 0) > 0 
                                      ? (historicalData.reduce((sum, row) => sum + (row.projection || 0), 0) * 1000000).toLocaleString() 
                                      : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-[#005173] font-bold">
                                    {historicalData.reduce((sum, row) => sum + (row.disbursed || row.projected_disbursed || 0), 0) > 0 
                                      ? (historicalData.reduce((sum, row) => sum + (row.disbursed || row.projected_disbursed || 0), 0) * 1000000).toLocaleString() 
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
                          2026 Cumulative Monthly Disbursements, Baseline Projection vs<br className="hidden lg:block" /> Disbursed Amount ($M)
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
                          <ComposedChart data={details?.monthlyMonitoringData || []} margin={{ top: 30, right: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 15 : 30, bottom: 65, left: 5 }}>
                            <XAxis 
                              dataKey="month" 
                              axisLine={{ stroke: '#e4e4e7' }} 
                              tickLine={false} 
                              tick={{fill: '#52525b', fontSize: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 7.2 : 11, fontWeight: 'bold'}} 
                              interval={0} 
                              dy={15} 
                              angle={window.innerWidth < 1024 ? -90 : 0}
                              textAnchor={window.innerWidth < 1024 ? "end" : "middle"}
                            />
                            <YAxis hide domain={[0, 'dataMax + 1']} />
                            <RechartsTooltip content={<CustomChartTooltip />} />
                            <Legend verticalAlign="bottom" height={40} content={() => (
                              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-8 text-[8px] lg:text-[11px] text-zinc-600 font-bold mt-4 whitespace-normal sm:whitespace-nowrap items-center text-center">
                                <div className="flex items-center gap-2 whitespace-nowrap text-[7.5px] sm:text-[10px] lg:text-[11px]"><div className="w-8 h-[1px] border-t border-dashed border-zinc-400"></div>Cumulative Baseline Projection ($M)</div>
                                <div className="flex items-center gap-2 whitespace-nowrap text-[7.5px] sm:text-[10px] lg:text-[11px]"><div className="w-8 h-[2px] bg-[#FFB800] relative flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#FFB800]"></div></div>Cumulative Disbursed Amount ($M)</div>
                              </div>
                            )}/>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulativeProjection" name="Cumulative Baseline Projection" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={false}>
                              <LabelList dataKey="cumulativeProjection" content={renderProjectionLabel} />
                            </Line>
                            <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulativeDisbursed" name="Cumulative Disbursed Amount" stroke="#FFB800" strokeWidth={2} dot={{r: 4, fill: '#FFB800', strokeWidth: 0}} isAnimationActive={false}>
                              <LabelList dataKey="cumulativeDisbursed" position="top" offset={10} content={renderCustomLineLabel} />
                            </Line>
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="px-1 lg:px-8 pb-4 overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-zinc-100 border-b border-zinc-200">
                                <th className="py-2 px-1 lg:px-4 text-left text-[9px] lg:text-xs font-bold text-zinc-600 uppercase">Month</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Cumulative<br className="lg:hidden" /> Baseline<br className="lg:hidden" /> Projection ($)</th>
                                <th className="py-2 px-1 lg:px-4 text-right text-[9px] lg:text-xs font-bold text-zinc-600 uppercase whitespace-nowrap">Cumulative<br className="lg:hidden" /> Disbursed<br className="lg:hidden" /> Amount ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {details?.monthlyMonitoringData.map((row, idx) => (
                                <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm font-bold text-zinc-900">{row.month}</td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.cumulativeProjection !== null ? (row.cumulativeProjection * 1000000).toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2 px-1 lg:px-4 text-[10px] lg:text-sm text-right text-zinc-600 font-medium">
                                    {row.cumulativeDisbursed !== null ? (row.cumulativeDisbursed * 1000000).toLocaleString() : '-'}
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
        `}</style>
        <div id="pdf-page-1" className="bg-white p-8 w-[1600px] min-h-[1130px] flex flex-col break-inside-avoid">
          {/* PDF Header */}
          <div className="mb-6">
            <div className="mb-4">
              <img src={titleImage} alt={details.name} style={{ height: 'auto', maxWidth: '100%' }} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-base text-black font-medium">
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

          <div className="grid grid-cols-12 gap-6 mt-6 flex-1">
            {/* COLUMNA IZQUIERDA: General Details & Financial Progress */}
            <div className="col-span-7 flex flex-col gap-6">
              {/* Section 1: General Details */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-black" />
                  <div className="mt-1.5">
                    <img src={generalDetailsImage} alt="General Details" style={{ height: '28px', width: 'auto' }} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Card: All Details */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Operation status:</span>
                        <span className="text-zinc-500 font-medium">{details.operationStatus}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Executing Agency:</span>
                        <span className="text-zinc-500 font-medium text-right">{details.executingAgency}</span>
                      </div>
                      <div className="flex justify-between items-start text-sm">
                        <span className="font-bold text-zinc-900">Linked to the loan:</span>
                        <span className="text-zinc-500 font-medium text-right whitespace-pre-line">{details.linkedLoans.join('\n')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Current Approved Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrency(details.currentApprovedAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Local contribution:</span>
                        <span className="text-zinc-500 font-medium">{project.id === 'AR-L1416' ? '$ 0.00' : project.id === 'BR-L1656' ? '$5,875,000.00' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Disbursed Life Amount:</span>
                        <span className="text-zinc-500 font-medium">{details.disbursedLifePercent.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Undisbursed Amount:</span>
                        <span className="text-zinc-500 font-medium">{formatCurrency(details.currentApprovedAmount - details.disbursedLifeAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Months of extensions:</span>
                        <span className="text-zinc-500 font-medium">{details.monthsOfExtension || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Last disbursement date:</span>
                        <span className="text-zinc-500 font-medium">{project.id === 'AR-L1416' ? 'N/A' : (details.timeline.lastDisbursement.date === 'Pending' ? 'N/A' : details.timeline.lastDisbursement.date)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-900">Age in execution (since eligibility):</span>
                        <span className="text-zinc-500 font-medium">{details.ageInExecution || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">OBJECTIVE</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed text-justify">
                          {details.objective ? (details.objective.split('.')[0] + '.') : 'No objective provided.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Progress */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-6">PROGRESS</h4>
                    
                    <div className="relative space-y-6 pl-10">
                      {/* Vertical Line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 flex flex-col">
                        <div className="h-[80%]" style={{ backgroundColor: '#4EA72E' }}></div>
                        <div className="flex-1 border-l-2 border-dashed border-zinc-400"></div>
                      </div>

                      {/* Steps */}
                      {[
                        { label: 'Approval:', date: details.timeline.approval.date, completed: details.timeline.approval.status === 'completed' },
                        { label: 'Effectiveness:', date: details.timeline.effectiveness.date, completed: details.timeline.effectiveness.status === 'completed' },
                        { label: 'Eligibility:', date: details.timeline.eligibility.date, completed: details.timeline.eligibility.status === 'completed' },
                        { label: 'First disbursement:', date: details.timeline.firstDisbursement.date, completed: details.timeline.firstDisbursement.status === 'completed' },
                        { label: 'Last disbursement:', date: `${details.timeline.lastDisbursement.date}${details.timeline.extension.status === 'completed' ? `.\nExtension: ${details.timeline.extension.text}` : ''}`, completed: details.timeline.lastDisbursement.status === 'completed' },
                        { label: 'Closure:', date: details.timeline.closure.date, completed: details.timeline.closure.status === 'completed' },
                      ].map((step, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[39px] top-0 p-0.5 bg-zinc-50 z-10">
                            {step.completed ? (
                              <CheckCircle2 className="w-6 h-6" style={{ color: '#4EA72E' }} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                                <RotateCcw className="w-3 h-3" style={{ color: '#ffffff' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-800">{step.label}</span>
                            <span className="text-sm text-zinc-600 whitespace-pre-line">{step.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Progress */}
              <div>
                <div className="flex items-center gap-1.5 mb-4">
                  <DollarIcon className="w-8 h-8 text-black text-2xl" />
                  <div className="mt-1.5">
                    <img src={financialProgressImage} alt="Financial Progress" style={{ height: '28px', width: 'auto' }} />
                  </div>
                </div>
                
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 grid grid-cols-2 gap-8">
                  <div className="space-y-[15.3px] flex flex-col justify-center">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Original Approved Amount:</span>
                      <span className="text-zinc-900 font-bold">{formatCurrency(details.financial.originalApprovedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Canceled Amount:</span>
                      <span className="text-zinc-900 font-bold">({formatCurrency(details.financial.canceledAmount)})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Current Approved Amount:</span>
                      <span className="text-zinc-900 font-bold">{formatCurrency(details.financial.currentApprovedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Time without disbursement (months):</span>
                      <span className="text-zinc-900 font-bold"></span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-900">Deadline for last Current Disbursement:</span>
                      <span className="text-zinc-900 font-bold">{details.financial.deadlineLastDisbursement}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>CURRENT APPROVED AMOUNT</span>
                        <span className="text-zinc-900">{formatCurrencyM(details.financial.currentApprovedAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden flex items-center justify-end px-3">
                        <span className="relative z-10 text-xs font-bold" style={{ color: '#ffffff' }}>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>DISBURSED LIFE AMOUNT</span>
                          {details.financial.isDisbursedFully && (
                            <div className="w-3 h-3 bg-[#4EA72E] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white stroke-[4]" />
                            </div>
                          )}
                        </div>
                        <span className="text-zinc-900">{formatCurrencyM(details.financial.disbursedLifeAmountM)}</span>
                      </div>
                      <div className="relative h-6 w-full bg-zinc-200 rounded-sm overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#00AEEF] flex items-center justify-end px-3"
                          style={{ width: `${details.financial.disbursedLifePercent}%` }}
                        >
                          <span className="relative z-10 text-xs font-bold" style={{ color: '#ffffff' }}>
                            {details.financial.disbursedLifePercent.toFixed(1)}%
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
                      {/* Margen top/bottom de Recharts reducido */}
                      <ComposedChart key={`hist-${pdfRenderKey}`} data={historicalData} width={550} height={265} margin={{ top: 30, right: 30, bottom: 0, left: 10 }}>
                        <defs>
                          <linearGradient id="solidLineGradientPDF" x1="0" y1="0" x2="100%" y2="0">
                            <stop offset={`${splitPercentage}%`} stopColor="#005173" />
                            <stop offset={`${splitPercentage}%`} stopColor="transparent" />
                          </linearGradient>
                          <linearGradient id="dashedLineGradientPDF" x1="0" y1="0" x2="100%" y2="0">
                            <stop offset={`${splitPercentage}%`} stopColor="transparent" />
                            <stop offset={`${splitPercentage}%`} stopColor="#005173" />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 'bold'}} interval={0} dy={10} />
                        <YAxis hide domain={[0, 'dataMax + 10']} />
                        <Bar dataKey="projection" name="Baseline Projection" barSize={30} fill="#e4e4e7" stroke="#a1a1aa" isAnimationActive={false}>
                          <LabelList dataKey="projection" content={(props: any) => renderCustomBarLabel({ ...props, projectCode: project.id })} />
                        </Bar>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="combinedDisbursed" name="Disbursed Amount ($M)" stroke="url(#solidLineGradientPDF)" strokeWidth={3} dot={{r: 5, fill: '#005173', strokeWidth: 0}} isAnimationActive={false}>
                          <LabelList dataKey="combinedDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                        </Line>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="combinedDisbursed" name="Disbursed Amount ($M)" stroke="url(#dashedLineGradientPDF)" strokeWidth={3} strokeDasharray="5 5" dot={{r: 5, fill: '#005173', strokeWidth: 0}} isAnimationActive={false}>
                          <LabelList dataKey="combinedDisbursed" position="top" offset={10} content={(props: any) => renderCustomLineLabel({ ...props, projectCode: project.id })} />
                        </Line>
                      </ComposedChart>
                      {/* Margen top de la leyenda reducido */}
                      <div className="flex justify-center gap-8 text-xs text-zinc-600 font-bold mt-1">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#e4e4e7] border border-[#a1a1aa]"></div>Baseline Projection ($M)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005173]"></div>Disbursed Amount ($M)</div>
                      </div>
                    </div>

                    {/* Chart 2: Monthly */}
                    <div className="flex flex-col items-center">
                      {/* Margen top/bottom reducido */}
                      <h4 className="text-[13px] font-bold text-[#005173] mt-2 mb-1 text-center px-4">
                        2026 Cumulative Monthly Disbursements, Baseline Projection vs Disbursed Amount ($M)
                      </h4>
                      <ComposedChart key={`month-${pdfRenderKey}`} data={details?.monthlyMonitoringData || []} width={550} height={265} margin={{ top: 30, right: 30, bottom: 0, left: 10 }}>
                        <XAxis dataKey="month" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 'bold'}} interval={0} dy={10} />
                        <YAxis hide domain={[0, 'dataMax + 1']} />
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulativeProjection" name="Cumulative Baseline Projection" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false}>
                          <LabelList dataKey="cumulativeProjection" content={renderProjectionLabel} />
                        </Line>
                        <Line type="monotoneX" strokeLinecap="round" strokeLinejoin="round" dataKey="cumulativeDisbursed" name="Cumulative Disbursed Amount" stroke="#FFB800" strokeWidth={3} dot={{r: 5, fill: '#FFB800', strokeWidth: 0}} isAnimationActive={false}>
                          <LabelList dataKey="cumulativeDisbursed" position="top" offset={10} content={renderCustomLineLabel} />
                        </Line>
                      </ComposedChart>
                      <div className="flex justify-center gap-8 text-xs text-zinc-600 font-bold mt-1 whitespace-nowrap">
                        <div className="flex items-center gap-2"><div className="w-8 h-[2px] border-t-2 border-dashed border-zinc-400"></div>Cumulative Baseline Projection ($M)</div>
                        <div className="flex items-center gap-2"><div className="w-8 h-[3px] bg-[#FFB800] relative flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></div></div>Cumulative Disbursed Amount ($)</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
        </div>
        </div>

        <div id="pdf-page-2" className="bg-white p-8 w-[1600px] min-h-[1130px] flex flex-col mt-4 break-inside-avoid">
          {/* Section 3: PMR Performance */}
          <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#005173]" />
              <h2 className="text-2xl font-bold text-[#005173]">PMR Performance</h2>
            </div>
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
          </div>
          
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 flex flex-col gap-6 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-base text-zinc-600">
                <span className="font-bold text-black uppercase">PMR HISTORIC EVALUATION - MARCH CYCLE </span>
                <span className="italic text-black">(After eligibility)</span>
              </p>
            </div>
            
            {details.pmrHistory.length > 0 ? (
              <div className="grid grid-cols-[250px_1fr] gap-y-6">
                {/* Years Header */}
                <div />
                <div className="flex items-center w-full px-4">
                  {details.pmrHistory.map((item, index, array) => (
                    <React.Fragment key={item.year}>
                      <div className="w-8 flex justify-center">
                        <span className="text-sm font-bold text-zinc-900">{item.year}</span>
                      </div>
                      {index < array.length - 1 && <div className="flex-1" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Auto-calculated Classification */}
                <div className="flex items-center">
                  <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">Auto-calculated Classification</span>
                </div>
                <div className="flex items-center w-full px-4">
                  {details.pmrHistory.map((item, index, array) => (
                    <React.Fragment key={item.year}>
                      <div className="w-8 flex justify-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-zinc-50 relative z-10 cursor-help group"
                          style={{ backgroundColor: getDotColor(item.autoCalculatedStatus) }}
                        >
                          {getDotIcon(item.autoCalculatedStatus)}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                            {item.hoverText}
                          </div>
                        </div>
                      </div>
                      {index < array.length - 1 && (
                        <div 
                          className="flex-1 h-[4px]"
                          style={{ backgroundColor: getLineColor(item.autoCalculatedStatus, array[index+1].autoCalculatedStatus) }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Validated Classification */}
                <div className="flex items-center">
                  <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">Validated Classification</span>
                </div>
                <div className="flex items-center w-full px-4">
                  {details.pmrHistory.map((item, index, array) => (
                    <React.Fragment key={item.year}>
                      <div className="w-8 flex justify-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-zinc-50 relative z-10 cursor-help group"
                          style={{ backgroundColor: getDotColor(item.validatedStatus) }}
                        >
                          {getDotIcon(item.validatedStatus)}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                            {item.hoverText}
                          </div>
                        </div>
                      </div>
                      {index < array.length - 1 && (
                        <div 
                          className="flex-1 h-[4px]"
                          style={{ backgroundColor: getLineColor(item.validatedStatus, array[index+1].validatedStatus) }}
                        />
                      )}
                    </React.Fragment>
                  ))}
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

            <div className="flex items-center gap-2 -mb-2">
              <p className="text-base text-zinc-600">
                <span className="font-bold text-black uppercase">QUALITATIVE INFORMATION - PMR March Cycle 2026</span> | 
                <span className="inline-flex items-center gap-1.5 ml-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${project.validatedByTTLDate ? 'bg-[#4EA72E]' : 'bg-yellow-400'}`}></span>
                  <span className="italic">
                    {project.validatedByTTLDate 
                      ? `Validated by the TTL on ${project.validatedByTTLDate}` 
                      : project.isPrefilledByTeam 
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
                    <li>{(project.qualitativeData?.estadoImplementacion || []).join(' ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Productos destacados/innovadores del proyecto</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(project.qualitativeData?.productosDestacados || []).join('. ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en el PCR</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(project.qualitativeData?.probabilidadObjetivos || []).join(' ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Acciones sugeridas / Pedidos</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>{(project.qualitativeData?.accionesSugeridas || []).join(' ')}</li>
                  </ul>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-tight">Fecha evaluación intermedia</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {project.qualitativeData?.fechaEvaluacionIntermedia || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-tight">Fecha talleres de arranque</h4>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 break-inside-avoid">
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {project.qualitativeData?.fechaTalleresArranque || 'N/A'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
