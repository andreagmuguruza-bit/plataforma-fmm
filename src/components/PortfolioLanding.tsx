import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Line, LabelList
} from 'recharts';
import { Handshake, Coins, Map } from 'lucide-react';
import GeographicImpact from './GeographicImpact';
import PortfolioOverview, { LendingInstrumentsAndStages, CurrentDisbursement } from './PortfolioOverview';
import PortfolioAgeAndSectors from './PortfolioAgeAndSectors';
import { usePortfolioData } from '../hooks/usePortfolioData';

// Mock Data
const idbOverviewData = [
  { name: 'INE', value: 23415, percentage: 41, fill: '#e4e4e7' },
  { name: 'IFD', value: 15034, percentage: 26, fill: '#005274' },
  { name: 'SCL', value: 10326, percentage: 18, fill: '#e4e4e7' },
  { name: 'CSD', value: 4493, percentage: 8, fill: '#e4e4e7' },
  { name: 'PTI', value: 3898, percentage: 7, fill: '#e4e4e7' }
];

const ifdOverviewData = [
  { name: 'CMF', value: 6590, percentage: 44, fill: '#e4e4e7' },
  { name: 'FMM', value: 4361, percentage: 29, fill: '#005274' },
  { name: 'ICS', value: 2526, percentage: 17, fill: '#e4e4e7' },
  { name: 'CIS', value: 1138, percentage: 8, fill: '#e4e4e7' }
];



const geoImpactData = [
  { country: 'BR', disbursed: 56, undisbursed: 44, total: 1750, projects: 20 },
  { country: 'PE', disbursed: 44, undisbursed: 56, total: 800, projects: 8 },
  { country: 'UR', disbursed: 42, undisbursed: 58, total: 600, projects: 6 },
  { country: 'AR', disbursed: 40, undisbursed: 60, total: 900, projects: 9 },
  { country: 'EC', disbursed: 31, undisbursed: 69, total: 730, projects: 5 },
];

const historicalData = [
  { year: '2019', projection: 1663, disbursed: 1774, projected_disbursed: null, percentage: '+7%' },
  { year: '2020', projection: 1724, disbursed: 2291, projected_disbursed: null, percentage: '+33%' },
  { year: '2021', projection: 1512, disbursed: 1662, projected_disbursed: null, percentage: '+10%' },
  { year: '2022', projection: 2231, disbursed: 2553, projected_disbursed: null, percentage: '+14%' },
  { year: '2023', projection: 753, disbursed: 1117, projected_disbursed: null, percentage: '+48%' },
  { year: '2024', projection: 1913, disbursed: 2961, projected_disbursed: null, percentage: '+55%' },
  { year: '2025', projection: 2131, disbursed: 2502, projected_disbursed: 2502, percentage: '+17%' },
  { year: '2026', projection: 960, disbursed: null, projected_disbursed: 623, percentage: null },
];

const ifdDisbursementsData = [
  { name: 'ICS', baseline: 286, actual: 265, disbursed: 17 },
  { name: 'CMF', baseline: 891, actual: 894, disbursed: 616 },
  { name: 'CIS', baseline: 229, actual: 225, disbursed: 10 },
  { name: 'FMM', baseline: 960, actual: 963, disbursed: 623 },
];

const CustomIFDBarLabel = (props: any) => {
  const { x, y, width, height, value, offset = 0 } = props;
  if (value == null) return null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  return (
    <text 
      x={x + width + (isMobile ? 8 : 5) + offset} 
      y={y + height / 2} 
      fill="#52525b" 
      textAnchor="start" 
      fontSize={isMobile ? 9 : 11} 
      fontWeight={500}
      dominantBaseline="middle"
    >
      ${value.toLocaleString()}
    </text>
  );
};

const CustomIFDTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-zinc-200 text-zinc-900 p-3 rounded-lg shadow-lg text-sm z-50">
        <p className="font-bold text-[#005274] mb-2 border-b border-zinc-100 pb-1">{data.name}</p>
        <p className="mb-1"><span className="font-bold text-zinc-500">Baseline Projection:</span> ${data.baseline.toLocaleString()}M</p>
        <p className="mb-1"><span className="font-bold text-zinc-500">Actual Projection:</span> ${data.actual.toLocaleString()}M</p>
        <p><span className="font-bold text-[#005274]">Disbursed YTD:</span> ${data.disbursed.toLocaleString()}M</p>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isYear2026 = label === '2026';

    // Extrayendo variables de forma segura
    const projValue = data.projection ? `$${data.projection.toLocaleString()} M` : 'N/A';
    const disbValue = data.disbursed ? `$${data.disbursed.toLocaleString()} M` : 
                      (data.projected_disbursed ? `$${data.projected_disbursed.toLocaleString()} M` : 'N/A');
    
    const disbursedLabel = isYear2026 ? "Disbursed YTD" : "Disbursed Amount";

    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm z-50">
        <p className="font-bold text-[#005274] mb-2 border-b border-zinc-100 pb-1">{label}</p>
        <p className="mb-1"><span className="font-bold text-zinc-500">Baseline Projection:</span> {projValue}</p>
        <p><span className="font-bold text-[#005274]">{disbursedLabel}:</span> {disbValue}</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-semibold">{data.name}</p>
        <p style={{ color: data.fill === '#e4e4e7' ? '#52525b' : data.fill }}>
          ${data.value.toLocaleString()}M ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CountUp = ({ end, duration = 2, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      // easeOutCubic - more direct than Quart
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * end));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const HeroCard = ({ value, label, prefix = '', suffix = '', icon: Icon }: { value: number, label: string, prefix?: string, suffix?: string, icon?: any }) => {
  return (
    <motion.div 
      className="flex items-center justify-center gap-2 md:gap-4 px-4 md:px-12 py-3 md:py-4 group" 
      whileHover={{ scale: 1.05 }}
    >
      {Icon && (
        <div className="w-10 h-10 md:w-16 md:h-16 text-white opacity-90">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="w-full h-full" strokeWidth={1.5} />
          )}
        </div>
      )}
      <div className="flex flex-col items-start">
        <div className="text-[32px] md:text-5xl font-bold text-white tracking-tight">
          <CountUp end={value} prefix={prefix} suffix={suffix} />
        </div>
        <div className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/80 mt-0.5">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value == null) return null;
  return (
    <text x={x + width / 2} y={y + height - 10} fill="#64748b" textAnchor="middle" fontSize={12}>
      ${value.toLocaleString()}
    </text>
  );
};

const CustomHistBarLabel = (props: any) => {
  const { x, y, width, height, value, index } = props;
  if (value == null) return null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const isYear2026 = historicalData[index]?.year === '2026';

  if (isYear2026) {
    return (
      <text 
        x={x + width / 2} 
        y={y - 12} 
        fill="#18181b" 
        textAnchor="middle" 
        fontSize={isMobile ? 9 : 11} 
        fontWeight={500}
      >
        ${value.toLocaleString()}
      </text>
    );
  }

  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#18181b" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize={isMobile ? 9 : 11} 
      fontWeight={500}
    >
      ${value.toLocaleString()}
    </text>
  );
};

const CustomLineLabel = (props: any) => {
  const { x, y, index, value } = props;
  const data = historicalData[index];
  if (!data || value == null) return null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const isYear2026 = data.year === '2026';

  if (isYear2026) {
    return (
      <g>
        <text x={x} y={y + 18} fill="#18181b" textAnchor="middle" fontSize={isMobile ? 9 : 11} fontWeight={500}>
          ${value.toLocaleString()}
        </text>
      </g>
    );
  }

  return (
    <g>
      {data.percentage && (
        <text x={x} y={y - 28} fill="#18181b" textAnchor="middle" fontSize={isMobile ? 9 : 11} fontWeight={500}>
          {data.percentage}
        </text>
      )}
      <text x={x} y={y - 12} fill="#18181b" textAnchor="middle" fontSize={isMobile ? 9 : 11} fontWeight={500}>
        ${value.toLocaleString()}
      </text>
    </g>
  );
};

export default function PortfolioLanding() {
  const { metrics, tableData, loading } = usePortfolioData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // REF Y ESTADO PARA LA ANIMACIÓN ON-SCROLL DEL GRÁFICO HISTÓRICO
  const historicalSectionRef = useRef(null);
  const isHistoricalInView = useInView(historicalSectionRef, { 
    once: true, 
    amount: typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.1 : 0.75 
  });
  const [animatedHistoricalData, setAnimatedHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (isHistoricalInView) {
      // Se inyectan los datos al entrar al viewport, disparando la animación de Recharts
      setAnimatedHistoricalData(historicalData);
    }
  }, [isHistoricalInView]);

  const totalProjects = 48;
  const totalAmountM = 4361;
  const uniqueCountries = 12;

  return (
    <div className="relative bg-zinc-50 font-sans">
      
      {/* NEW HERO SECTION */}
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden z-20 bg-zinc-50 shadow-sm">
        {/* Background Animation CSS */}
        <style>{`
          @keyframes smoothPan {
            0% { transform: scale(1.1) translateX(4%); }
            50% { transform: scale(1.1) translateX(-4%); }
            100% { transform: scale(1.1) translateX(4%); }
          }
          .bg-pan-animate {
            animation: smoothPan 30s ease-in-out infinite;
          }
        `}</style>

        {/* Animated Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-pan-animate"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" 
          }}
        />

        {/* Custom brand overlay for depth and text legibility - updated to brand grey [#545A5E] */}
        <div className="absolute inset-0 z-10 bg-[#545A5E]/80" />

        {/* Content */}
        <div className="relative z-20 text-center px-4 md:px-6 max-w-6xl mx-auto flex flex-col items-center w-full pt-2 md:pt-12 -mt-32 md:mt-0">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[18.7px] md:text-2xl text-white font-semibold mb-4 md:mb-4"
          >
            Smart data for{' '}
            <span className="relative inline-block">
              decisive action
              <motion.span
                className="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#97A6B4] to-white w-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-[36.3px] md:text-6xl lg:text-7xl font-semibold text-white mb-5 md:mb-8 tracking-tight flex flex-col leading-[1.2] md:leading-normal md:block"
          >
            <span>The FMM <span className="relative inline-block bg-gradient-to-r from-[#6E8CA0] to-[#A7B1BB] bg-clip-text text-transparent">effectiveness</span> </span>
            <span>platform</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-[15px] md:text-xl lg:text-2xl text-gray-100 mb-5 md:mb-6 max-w-3xl font-normal"
          >
            Learn how FMM operations are driving impact across the region.
          </motion.p>

          {/* Stat Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center justify-center w-full mt-4 md:mt-6 bg-transparent md:bg-transparent backdrop-blur-none md:backdrop-blur-none rounded-none md:rounded-none border-none md:border-none md:divide-x md:divide-white/20"
          >
            <div className="w-full md:w-auto">
              <HeroCard value={totalProjects} label="Projects" icon={Handshake} />
            </div>
            {/* Mobile Separator Line */}
            <div className="md:hidden w-1/4 h-[1px] bg-white/20 mx-auto"></div>
            <div className="w-full md:w-auto">
              <HeroCard 
                value={totalAmountM} 
                label="Million" 
                icon={
                  <div className="text-[40px] md:text-6xl font-bold text-white flex items-start justify-center h-full w-full leading-none -mt-1">
                    $
                  </div>
                } 
              />
            </div>
            {/* Mobile Separator Line */}
            <div className="md:hidden w-1/4 h-[1px] bg-white/20 mx-auto"></div>
            <div className="w-full md:w-auto">
              <HeroCard 
                value={uniqueCountries} 
                label="Countries" 
                icon={<img src="/mapa-alc.svg" alt="ALC Map Contour" className="w-10 h-10 md:w-16 md:h-16 text-white opacity-90" />} 
              />
            </div>
          </motion.div>


          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-7 md:mt-12"
          >
            <a 
              href="/FMM Operations Report - Execution.pdf" 
              download="FMM Operations Report - Execution.pdf"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#718C9F] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF Report
            </a>
          </motion.div>
        </div>
        
      </div>

      {/* Content Sections */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-24 flex flex-col ${isMobile ? 'gap-2' : 'gap-6 md:gap-32'}`}>

        
        {/* Section 1: Portfolio Overview */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full">
            <PortfolioOverview active={true} />
          </div>
        </div>

        {/* Section 2: Geographic Impact */}
        <div className="w-full">
          <GeographicImpact />
        </div>

        {/* Section 5: Current Disbursement */}
        <div className="w-full">
          <CurrentDisbursement />
        </div>

        {/* Section 6: Historical Disbursements */}
        <div className="flex flex-col w-full mt-6 md:mt-0">
          
          {/* Título y texto arriba ocupando todo el ancho */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="w-full px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto mb-8 md:mb-12 text-center lg:text-left"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-4 md:mb-6 tracking-tight text-center lg:text-left">Historical Disbursements</h2>
            <p className="text-base md:text-xl text-zinc-700 leading-relaxed mt-4 text-center lg:text-left">
              In 2025, FMM’s disbursements reached $2,502 M, outperforming the annual projection by 17%. For 2026, FMM projects <strong className="font-bold text-zinc-900">$960 M</strong> in total disbursements, with <strong className="font-bold text-zinc-900">$623 M</strong> (65%) disbursed year-to-date.
            </p>
          </motion.div>
      {/* Contenedor de dos gráficos */}
      <div ref={historicalSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full lg:h-[380px]">
        
        {/* Nuevo Gráfico Izquierdo: IFD Disbursements */}
        <div className={`w-full ${isMobile ? 'h-[450px]' : 'h-[320px]'} lg:h-full flex flex-col`}>
                  <h3 className={`font-bold text-[#005274] mb-6 text-center flex flex-col ${isMobile ? 'text-[14.5px]' : 'text-lg'}`}>
            <span>IFD: Disbursements ($M) in 2026, by Division</span>
            <span>(INV, PBL and SDL)</span>
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={ifdDisbursementsData} margin={{ top: 10, right: 60, left: 10, bottom: 20 }} barGap={2}>
                <XAxis type="number" hide domain={[0, 1300]} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: isMobile ? 10.8 : 12, fontWeight: 'bold'}} width={40} />
                <RechartsTooltip cursor={{fill: '#f4f4f5'}} content={<CustomIFDTooltip />} />
                <Legend verticalAlign="bottom" height={isMobile ? 80 : 36} content={() => (
                  <div className={`flex gap-2 sm:gap-6 font-bold mt-4 ${isMobile ? 'flex-col items-start px-4 text-[9px] text-zinc-500' : 'justify-center text-[10px] text-zinc-500'}`}>
                    <div className="flex items-center gap-2">
                      <svg width="12" height="12" className="border border-zinc-200">
                        <rect width="12" height="12" fill="url(#diagonalHatchHist)" />
                      </svg>
                      Baseline Projection ($M)
                    </div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#e4e4e7]"></div>Actual Projection ($M)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005274]"></div>Disbursed Amount YTD ($M)</div>
                  </div>
                )}/>
                
                {/* Baseline */}
                <Bar dataKey="baseline" barSize={12} fill="url(#diagonalHatchHist)" stroke="#d4d4d8" isAnimationActive={false}>
                  <LabelList content={<CustomIFDBarLabel offset={-15} />} />
                </Bar>
                {/* Actual Projection */}
                <Bar dataKey="actual" barSize={12} fill="#e4e4e7" isAnimationActive={false}>
                  <LabelList content={<CustomIFDBarLabel offset={-15} />} />
                </Bar>
                {/* Disbursed */}
                <Bar dataKey="disbursed" barSize={16} fill="#005274" isAnimationActive={false}>
                  <LabelList content={<CustomIFDBarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <svg width="0" height="0">
              <defs>
                <pattern id="diagonalHatchHist" patternUnits="userSpaceOnUse" width="4" height="4">
                  <rect width="4" height="4" fill="#ffffff" />
                  <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                </pattern>
              </defs>
            </svg>
          </div>
        </div>
        {/* Gráfico Original Derecho: Historical Disbursements */}
        <div className={`w-full ${isMobile ? 'h-[450px]' : 'h-[320px]'} lg:h-full flex flex-col`}>
          <h3 className={`font-bold text-[#005274] mb-6 text-center flex flex-col ${isMobile ? 'text-[14.5px]' : 'text-lg'}`}>
            <span>FMM: Historical Disbursements ($M), by Year</span>
            <span>(INV, PBL and SDL)</span>
          </h3>
          <div className="flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {/* USAMOS EL ESTADO INYECTADO "animatedHistoricalData" EN LUGAR DE "historicalData" DIRECTO */}
              <ComposedChart data={animatedHistoricalData} margin={{ top: 40, right: 30, bottom: 20, left: 20 }}>
                <defs>
                  {/* AJUSTE 2: Nuevo patrón diagonalHatchHist replicado para este gráfico */}
                  <pattern id="diagonalHatchHist" patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill="#ffffff" />
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                  </pattern>
                </defs>
                <XAxis dataKey="year" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{fill: '#52525b', fontSize: isMobile ? 8.9 : 11, fontWeight: 'bold'}} dy={10} />
                <YAxis hide={true} domain={[0, 'dataMax + 500']} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={isMobile ? 60 : 36} content={() => (
                  <div className={`flex gap-2 sm:gap-6 font-bold mt-4 ${isMobile ? 'flex-col items-start px-4 text-[8.9px] text-zinc-600' : 'justify-center text-[11px] text-zinc-600'}`}>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005274]"></div>Disbursed Amount ($M)</div>
                    <div className="flex items-center gap-2">
                       <svg width={isMobile ? 10 : 12} height={isMobile ? 10 : 12} className="border border-[#d4d4d8]">
                        <rect width={isMobile ? 10 : 12} height={isMobile ? 10 : 12} fill="url(#diagonalHatchHist)" />
                      </svg>
                      Baseline Projection ($M)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-0.5 border-t-2 border-[#005274] border-dotted"></div>
                      </div>
                      Disbursed Amount YTD ($M)
                    </div>
                  </div>
                )}/>
                
                <Bar dataKey="projection" barSize={isMobile ? 30.4 : 32} fill="url(#diagonalHatchHist)" stroke="#d4d4d8" strokeWidth={1} isAnimationActive={false} label={<CustomHistBarLabel />} />
                {/* LÍNEA PRINCIPAL: Dibuja durante 2s */}
                <Line type="natural" dataKey="disbursed" stroke="#005274" strokeWidth={2} dot={{r: 4, fill: '#005274', strokeWidth: 0}} activeDot={{r: 6}} isAnimationActive={!isMobile} animationDuration={2000} animationEasing="ease-out" label={<CustomLineLabel />} />
                
                {/* LÍNEA PUNTEADA: Espera 2000ms a que termine la principal, luego dibuja en 1s */}
                <Line type="natural" dataKey="projected_disbursed" stroke="#005274" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#005274', strokeWidth: 0}} activeDot={{r: 6}} isAnimationActive={!isMobile} animationBegin={2000} animationDuration={1000} animationEasing="ease-out" label={<CustomLineLabel />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>

        {/* Section 4: Portfolio Age and Sectors */}
        <div className="w-full">
          <PortfolioAgeAndSectors />
        </div>

        {/* Section 3: Lending Instruments and Stages */}
        <div className="w-full">
          <LendingInstrumentsAndStages />
        </div>

      </div>
    </div>
  );
}
