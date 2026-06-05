import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, Sector, LabelList, ReferenceLine, ComposedChart, Line, Customized } from 'recharts';
import { usePortfolioData } from '../hooks/usePortfolioData';

const idbData = [
  { name: 'IFD', value: 14650, percentage: 25, fill: '#005173' },
  { name: 'SCL', value: 10276, percentage: 18, fill: '#A9B3BC' },
  { name: 'CSD', value: 4416, percentage: 8, fill: '#A9B3BC' },
  { name: 'PTI', value: 4361, percentage: 8, fill: '#A9B3BC' },
  { name: 'INE', value: 24077, percentage: 42, fill: '#A9B3BC' },
];

const ifdData = [
  { name: 'FMM', value: 4361, percentage: 29, fill: '#FFC000' },
  { name: 'ICS', value: 2586, percentage: 18, fill: '#005173' },
  { name: 'CIS', value: 1137, percentage: 8, fill: '#005173' },
  { name: 'CMF', value: 6718, percentage: 46, fill: '#005173' },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 4} 
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="white"
      strokeWidth={2}
    />
  );
};

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, percentage, isRightChart } = props;
  const RADIAN = Math.PI / 180;
  
  // Calculamos el centro radial exacto sin offsets artificiales
  const innerRadiusPos = innerRadius + (outerRadius - innerRadius) * 0.5;
  const xInner = cx + innerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerRadiusPos * Math.sin(-midAngle * RADIAN);

  const outerRadiusPos = outerRadius + 8;
  const xOuter = cx + outerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerRadiusPos * Math.sin(-midAngle * RADIAN);
  
  let textColor = '#666666';
  if (name === 'IFD') textColor = '#005173';
  if (name === 'FMM') textColor = '#000000';
  if (isRightChart && name !== 'FMM') textColor = '#005173';

  let innerTextColor = '#333333';
  if (name === 'IFD' || name === 'FMM' || isRightChart) innerTextColor = 'white';

  return (
    <g>
      <text x={xInner} y={yInner} fill={innerTextColor} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {percentage}%
      </text>
      <text x={xOuter} y={yOuter} fill={textColor} textAnchor={xOuter > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
        {name}
      </text>
    </g>
  );
};

const barData = [
  { name: 'FMM', disbursedAmount: 1322, undisbursedAmount: 1113, numberOfProjects: 34, disbursedPct: 54, undisbursedPct: 46 },
  { name: 'CIS', disbursedAmount: 335, undisbursedAmount: 370, numberOfProjects: 12, disbursedPct: 48, undisbursedPct: 52 },
  { name: 'CMF', disbursedAmount: 1790, undisbursedAmount: 1706, numberOfProjects: 33, disbursedPct: 51, undisbursedPct: 49 },
  { name: 'ICS', disbursedAmount: 733, undisbursedAmount: 1063, numberOfProjects: 38, disbursedPct: 41, undisbursedPct: 59 },
];

const allStagesBarData = [
  { name: 'FMM', disbursedAmount: 1558, undisbursedAmount: 2803, numberOfProjects: 48, disbursedPct: 36, undisbursedPct: 64 },
  { name: 'CIS', disbursedAmount: 489, undisbursedAmount: 649, numberOfProjects: 19, disbursedPct: 43, undisbursedPct: 57 },
  { name: 'CMF', disbursedAmount: 2754, undisbursedAmount: 3964, numberOfProjects: 62, disbursedPct: 41, undisbursedPct: 59 },
  { name: 'ICS', disbursedAmount: 1100, undisbursedAmount: 1486, numberOfProjects: 53, disbursedPct: 43, undisbursedPct: 57 },
];

const CustomDonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-semibold text-[#005173]">{data.name}</p>
        <p className="text-zinc-700 font-bold">${data.value.toLocaleString()}M</p>
      </div>
    );
  }
  return null;
};



const renderCustomLegend = (props: any) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: isMobile ? 'flex-start' : 'center', 
      alignItems: isMobile ? 'flex-start' : 'baseline',
      gap: isMobile ? '8px' : '20px', 
      marginTop: '10px', 
      paddingLeft: isMobile ? '20px' : '0px',
      fontSize: isMobile ? '9.7px' : '12px', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#005173' }}></div>
        <span>Disbursed Life Amount ($M)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#A6B3BC', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }}></div>
        <span>Undisbursed Amount ($M)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#FFC400', borderRadius: '50%' }}></div>
        <span>Number of Projects</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, hoveredSegment }: any) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  if (active && payload && payload.length && hoveredSegment) {
    // Obtenemos la data real desde el payload
    const data = payload[0].payload;
    
    // Evaluamos el estado explícito que pasaremos desde el onMouseEnter
    const isDisbursed = hoveredSegment === 'disbursed';
    
    const title = isDisbursed ? 'Disbursed Life Amount' : 'Undisbursed Amount';
    const pctValue = isDisbursed ? data.disbursedPct : data.undisbursedPct;

    return (
      <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e0e0e0', fontSize: isMobile ? '12.6px' : '14px' }}>
        <div style={{ color: '#005173', fontWeight: 'bold', marginBottom: '4px', fontSize: isMobile ? '12.6px' : '14px' }}>
          {title}
        </div>
        <div style={{ color: '#000000', fontSize: isMobile ? '14.4px' : '16px', fontWeight: 'bold' }}>
          {pctValue}%
        </div>
      </div>
    );
  }
  return null;
};

const CustomYellowDot = (props: any) => {
  const { cx, cy, index, payload, isSettled } = props;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  // Si la animación ya terminó, devolvemos un elemento estático a prueba de hovers
  if (isSettled) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#FFC400" />
        <text x={cx} y={cy - 12} textAnchor="middle" fill="#000000" fontWeight="bold" fontSize={isMobile ? 8.9 : 12}>
          {payload.numberOfProjects} 
        </text>
      </g>
    );
  }

  // Si no ha terminado, devolvemos la animación inicial
  const delay = 1.2 + (index * 0.3);
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: delay, type: 'spring', stiffness: 200, damping: 10 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle cx={cx} cy={cy} r={6} fill="#FFC400" />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#000000" fontWeight="bold" fontSize={isMobile ? 8.9 : 12}>
        {payload.numberOfProjects} 
      </text>
    </motion.g>
  );
};

const AnimatedBarShape = (props: any) => {
  const { x, y, width, height, index, fill, layerDelay = 0, isVisible } = props;
  const columnDelay = index === 0 ? 0.2 : 0.6; 
  const finalDelay = columnDelay + layerDelay;
  
  return (
    <motion.rect 
      x={x} 
      width={width} 
      fill={fill}
      initial={false}
      animate={isVisible ? { y, height } : { y: y + height, height: 0 }}
      transition={{ duration: 0.6, delay: finalDelay, ease: "easeOut" }}
    />
  );
};

const CustomActivePortfolioTooltip = ({ active, payload, hoveredSegment }: any) => {
  if (active && payload && payload.length && hoveredSegment) {
    const data = payload[0].payload;
    let label = '';
    let amount = 0;
    
    if (hoveredSegment === 'topSegment') {
      label = data.topLabel;
      amount = data.topAmount;
    } else if (hoveredSegment === 'middleSegment') {
      label = data.middleLabel;
      amount = data.middleAmount;
    } else {
      label = data.bottomLabel;
      amount = data.bottomAmount;
    }
    
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm">
        <div className="font-bold text-[#005173] mb-1">
          {label}
        </div>
        {amount > 0 && (
          <div className="font-bold text-black">
            ${amount.toLocaleString()}M
          </div>
        )}
      </div>
    );
  }
  return null;
};





export default function PortfolioOverview({ active }: { active: boolean }) {
  const { metrics } = usePortfolioData();
  const containerRef = useRef<HTMLDivElement>(null);
  // Lógica de Animación Coreografiada (Estilo McKinsey)
  const overviewRef = useRef(null);
  const isOverviewInView = useInView(overviewRef, { once: true, margin: "-20%" });
  const [donutStep, setDonutStep] = useState(0); // Inicia en 0 (todo oculto o esperando)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalProjects = 48;
  const invCount = 47;
  const pblCount = 1;
  const invAmount = 3761;
  const pblAmount = 600;
  const disbursedLifeAmount = 1558;
  const currentApprovedAmount = 4361;
  const disbursedLifePercent = 36;

  // Update FMM in barData
  const updatedBarData = barData.map(d => {
    if (d.name === 'FMM') {
      return {
        ...d,
        disbursedAmount: Math.round(disbursedLifeAmount),
        undisbursedAmount: Math.round(currentApprovedAmount - disbursedLifeAmount),
        numberOfProjects: totalProjects,
        disbursedPct: Math.round(disbursedLifePercent),
        undisbursedPct: Math.round(100 - disbursedLifePercent)
      };
    }
    return d;
  });

  // Update FMM in allStagesBarData
  const updatedAllStagesBarData = allStagesBarData.map(d => {
    if (d.name === 'FMM') {
      return {
        ...d,
        disbursedAmount: Math.round(disbursedLifeAmount),
        undisbursedAmount: Math.round(currentApprovedAmount - disbursedLifeAmount),
        numberOfProjects: totalProjects,
        disbursedPct: Math.round(disbursedLifePercent),
        undisbursedPct: Math.round(100 - disbursedLifePercent)
      };
    }
    return d;
  });

  useEffect(() => {
    if (isOverviewInView) {
      // Step 1: Fade In en el centro (0.1s)
      const t1 = setTimeout(() => setDonutStep(1), 100);
      
      // Step 2: Breve pausa (400ms) y luego inicia viaje a la izquierda (1.6s)
      const t2 = setTimeout(() => setDonutStep(2), 1600); 
      
      // Step 3: Aparece el triángulo conector (al terminar el viaje de 2s -> 3.6s)
      const t3 = setTimeout(() => setDonutStep(3), 3600);
      
      // Step 4: Aparece la Donut 2 deslizándose (4.1s)
      const t4 = setTimeout(() => setDonutStep(4), 4100);
      
      // Step 5: Highlight final (5.6s)
      const t5 = setTimeout(() => setDonutStep(5), 5600);

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }
  }, [isOverviewInView]);
  const [activeIndexA, setActiveIndexA] = useState(-1);
  const [activeIndexB, setActiveIndexB] = useState(-1);

  return (
    <div className={`w-full flex flex-col font-sans bg-zinc-50 pt-10 ${isMobile ? 'pb-0' : 'pb-4 lg:pb-20'}`}>
      
      {/* Portfolio Overview Section */}
      <div className="w-full relative py-6 md:py-10">
        <div className="flex flex-col items-center justify-center">
          {/* Header Section */}
          <motion.div 
            className="text-center max-w-[1440px] mx-auto mb-6 md:mb-10 px-4 md:px-6 lg:px-12 relative"
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: isMobile ? 0 : 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-3 md:mb-4 tracking-tight">Portfolio Overview</h2>
            <p className="text-lg md:text-xl lg:text-2xl text-zinc-700 leading-relaxed">
              FMM has <strong className="font-bold text-zinc-900">48</strong> projects for <strong className="font-bold text-zinc-900">$4,361 M</strong>, representing 29% of IFD’s active portfolio.
            </p>
          </motion.div>

          {/* State-Driven Charts Section */}
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12" ref={overviewRef}>
            
            {/* Contenedor Compacto de Gráficos */}
            <div className="flex flex-col items-center lg:flex-row w-full justify-center relative gap-8 lg:gap-0">
              
              {/* Spacer to give the container the correct height since children are absolute on lg screens */}
              <div className="hidden lg:block w-1/2 invisible pointer-events-none">
                <div className="h-16 mb-4"></div>
                <div className="w-full" style={{ height: 350 }}></div>
              </div>
                
              {/* Chart A: IDB Donut */}
              <motion.div 
                className="lg:absolute lg:top-0 h-full flex flex-col items-center z-10 w-full lg:w-1/2"
                initial={isMobile ? { opacity: 1, left: "0%", x: "0%" } : { opacity: 0, left: "50%", x: "-50%" }}
                animate={isMobile ? { opacity: 1, left: "0%", x: "0%" } : { 
                  opacity: donutStep > 0 ? 1 : 0, 
                  left: (donutStep === 0 || donutStep === 1) ? "50%" : "25%" 
                }}
                transition={{ duration: isMobile ? 0 : 2, ease: [0.25, 0.1, 0.25, 1] }} 
                style={{ x: isMobile ? "0%" : "-50%" }}
              >
                  <h3 className="text-[#005173] font-bold text-base md:text-lg text-center mb-4 px-4 h-auto md:h-16 flex flex-col items-center justify-end leading-tight">
                    <span>IDB: Current Approved Amount ($M, %), by Department</span>
                    <span>(INV and PBL)</span>
                  </h3>
                  <div className="w-full relative">
                    <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 350}>
                      <PieChart>
                        <Pie 
                          data={idbData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="50%" 
                          outerRadius="74%" 
                          dataKey="value" 
                          stroke="white"
                          strokeWidth={2}
                          label={renderCustomizedLabel} 
                          labelLine={false}
                          startAngle={47}
                          endAngle={-313}
                          isAnimationActive={false}
                          // @ts-ignore
                          activeIndex={activeIndexA === -1 ? undefined : activeIndexA}
                          // @ts-ignore
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActiveIndexA(index)}
                          onMouseLeave={() => setActiveIndexA(-1)}
                        >
                          {idbData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomDonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

              {/* Spotlight Triangle Wrapper */}
              <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 w-[32%] pointer-events-none z-0 flex-col">
                <div className="h-16 mb-4 shrink-0"></div> {/* Spacer for header */}
                <div className="w-full relative flex items-center justify-center" style={{ height: 350 }}>
                  <motion.div
                    className="h-[180px] w-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ 
                      opacity: donutStep >= 3 ? 1 : 0,
                      scaleX: donutStep >= 3 ? 1 : 0
                    }}
                    transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }} 
                    style={{
                      transformOrigin: "left center"
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <polygon points="0,25 100,0 100,100 0,75" fill="#D4D4D8" opacity="0.3" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Chart B: IFD Donut */}
              <motion.div 
                className="lg:absolute lg:top-0 h-full flex flex-col items-center z-10 w-full lg:w-1/2"
                initial={isMobile ? { opacity: 1, left: "0%", x: "0%" } : { opacity: 0, left: "65%" }}
                animate={isMobile ? { opacity: 1, left: "0%", x: "0%" } : { 
                  opacity: donutStep >= 4 ? 1 : 0,
                  left: (donutStep >= 4 ? "75%" : "65%")
                }} 
                transition={{ duration: isMobile ? 0 : 1.5, ease: "easeOut" }} 
                style={{ x: isMobile ? "0%" : "-50%" }}
              >
                  <h3 className="text-[#005173] font-bold text-base md:text-lg text-center mb-4 px-4 h-auto md:h-16 flex flex-col items-center justify-end leading-tight">
                    <span>FMM: Current Approved Amount ($M, %), by Division</span>
                    <span>(INV and PBL)</span>
                  </h3>
                  <div className="w-full relative">
                    <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 350}>
                      <PieChart>
                        <Pie 
                          data={ifdData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="50%" 
                          outerRadius="74%"
                          dataKey="value" 
                          stroke="white"
                          strokeWidth={2}
                          label={(props) => renderCustomizedLabel({ ...props, isRightChart: true })} 
                          labelLine={false}
                          startAngle={58}
                          endAngle={-302}
                          isAnimationActive={false}
                          // @ts-ignore
                          activeIndex={activeIndexB === -1 ? undefined : activeIndexB}
                          // @ts-ignore
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActiveIndexB(index)}
                          onMouseLeave={() => setActiveIndexB(-1)}
                        >
                          {ifdData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              /* Si es FMM, evalúa el step: si es 5 se pinta amarillo, si no, entra azul. En móvil se pinta amarillo directo. */
                              fill={entry.name === 'FMM' && (isMobile || donutStep >= 5) ? '#FFC000' : '#005173'} 
                              /* Transición CSS: Aumentada a 2s para un fundido de color muy lento y elegante */
                              style={{ transition: isMobile ? 'none' : 'fill 2.0s ease-in-out' }} 
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomDonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const CustomStackedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === 0 || value == null || value === '') return null;
  
  // Rule 2: Hide labels only if segment is extremely small
  const isHorizontal = width > height; 
  if (isHorizontal && width < 5) return null;
  if (!isHorizontal && height < 5) return null;

  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#ffffff" 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 9 : 11} 
      fontWeight={600}
    >
      {value}
    </text>
  );
};

export function LendingInstrumentsAndStages() {
  const { metrics } = usePortfolioData();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const lendingChartRef = useRef(null);
  const isLendingInView = useInView(lendingChartRef, { once: true, margin: "-10%" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalProjects = 48;
  const invCount = 47;
  const pblCount = 1;
  const invAmount = 3761;
  const pblAmount = 600;
  const stage1InvCount = metrics?.stage1InvCount || 7;
  const stage2InvCount = metrics?.stage2InvCount || 34;
  const stage3InvCount = metrics?.stage3InvCount || 4;
  const stage1InvAmount = metrics?.stage1InvAmount || 0;
  const stage2InvAmountValue = metrics?.stage2InvAmount || 2435;
  // User explicitly requested to replace 2400 with 2435 for Stage II
  const stage2InvAmount = Math.round(stage2InvAmountValue) === 2400 ? 2435 : stage2InvAmountValue;
  const stage3InvAmount = metrics?.stage3InvAmount || 0;

  const activePortfolioData = [
    {
      name: `${totalProjects} projects`,
      visualBottom: invCount,
      visualMiddle: 0,
      visualTop: pblCount,
      bottomLabel: `${invCount} INV`,
      bottomAmount: Math.round(invAmount),
      middleLabel: '',
      middleAmount: 0,
      topLabel: `${pblCount} PBL`,
      topAmount: Math.round(pblAmount),
    },
    {
      name: `${invCount} INV`,
      visualBottom: stage3InvCount,
      visualMiddle: stage2InvCount, 
      visualTop: stage1InvCount,
      bottomLabel: stage3InvCount > 0 ? `${stage3InvCount} Stage III` : '',
      bottomAmount: Math.round(stage3InvAmount),
      middleLabel: `${stage2InvCount} Stage II`,
      middleAmount: Math.round(stage2InvAmount),
      topLabel: `${stage1InvCount} Stage I`,
      topAmount: Math.round(stage1InvAmount),
    }
  ];

  const AnimatedReferenceLine = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    if (!xAxisMap || !yAxisMap) return null;

    const xAxis = xAxisMap[0];
    const yAxis = yAxisMap[0];

    if (!xAxis || !yAxis) return null;

    const x1 = xAxis.scale(`${totalProjects} projects`) + xAxis.scale.bandwidth() / 2;
    const x2 = xAxis.scale(`${invCount} INV`) + xAxis.scale.bandwidth() / 2;
    const y = yAxis.scale(invCount);

    return (
      <motion.line
        x1={x1} y1={y} x2={x2} y2={y}
        stroke="#005173"
        strokeWidth={2}
        strokeDasharray="4 4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />
    );
  };

  const PortfolioBracket = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    if (!xAxisMap || !yAxisMap) return null;

    const xAxis = xAxisMap[0];
    const yAxis = yAxisMap[0];

    if (!xAxis || !yAxis) return null;

    const xCenter = xAxis.scale(`${invCount} INV`) + xAxis.scale.bandwidth() / 2;
    const barWidth = xAxis.scale.bandwidth();
    
    const xStart = xCenter - barWidth / 2;
    const xEnd = xCenter + barWidth / 2;

    const yBase = yAxis.scale(totalProjects);

    const bracketPath = "M " + xStart + "," + yBase + " Q " + xStart + "," + (yBase-12) + " " + (xStart + (xEnd-xStart)/2 - 10) + "," + (yBase-12) + " L " + (xStart + (xEnd-xStart)/2 - 5) + "," + (yBase-12) + " Q " + (xStart + (xEnd-xStart)/2) + "," + (yBase-22) + " " + (xStart + (xEnd-xStart)/2 + 5) + "," + (yBase-12) + " L " + (xEnd - 10) + "," + (yBase-12) + " Q " + xEnd + "," + (yBase-12) + " " + xEnd + "," + yBase;

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <path d={bracketPath} fill="none" stroke="#000000" strokeWidth={3} />
        <text x={xCenter} y={yBase - 30} textAnchor="middle" fill="#18181b" fontWeight="bold" fontSize={isMobile ? 13.3 : 14}>
          {invCount} INV
        </text>
      </motion.g>
    );
  };

  const bottomBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0} isVisible={isLendingInView} />, [isLendingInView]);
  const middleBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0.25} isVisible={isLendingInView} />, [isLendingInView]);
  const topBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0.5} isVisible={isLendingInView} />, [isLendingInView]);

  return (
    <div className={`w-full h-auto flex flex-col font-sans bg-zinc-50 ${isMobile ? 'py-2 mt-4' : 'py-[5vh] mt-24 md:mt-0'}`}>
      <div className="w-full relative h-auto">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <motion.div 
                initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={isMobile ? { opacity: 1, y: 0 } : (isLendingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 })}
                transition={{ duration: isMobile ? 0 : 0.6, layout: { duration: 0.3 } }}
                className="w-full lg:w-[45%]"
              >
                <h2 className={`font-bold text-zinc-900 mb-4 md:mb-6 tracking-tight ${isMobile ? 'text-[28.5px]' : 'text-3xl md:text-4xl'}`}>Lending Instruments and Stages</h2>
                <div className={`text-zinc-700 leading-relaxed space-y-4 md:space-y-6 ${isMobile ? 'text-[17.1px]' : 'text-lg md:text-xl'}`}>
                  <p>
                    Our {totalProjects} projects consists of {pblCount} PBLs for ${Math.round(pblAmount).toLocaleString()}M and {invCount} Investment Loans (INV) for ${Math.round(invAmount).toLocaleString()}M.
                  </p>
                  <p>
                    The {invCount} INV operations comprise {stage1InvCount} operations in stage I, {stage2InvCount} in Stage II{stage3InvCount > 0 ? `, and ${stage3InvCount} in Stage III` : ''}.
                  </p>
                </div>
              </motion.div>
              <div className="w-full lg:w-[55%] flex justify-center items-start" ref={lendingChartRef}>
                <div className="w-full max-w-lg flex flex-col">
                  <motion.h3 
                    initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
                    animate={isMobile ? { opacity: 1 } : (isLendingInView ? { opacity: 1 } : { opacity: 0 })}
                    transition={{ duration: isMobile ? 0 : 0.6, layout: { duration: 0.3 } }}
                    className={`font-bold text-[#005173] text-center mb-0 mt-8 leading-tight ${isMobile ? 'text-[17.1px]' : 'text-lg'}`}
                  >
                    FMM: Active Portfolio breakdown, by Lending Instrument and Stage
                  </motion.h3>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" aspect={1.2}>
                      <BarChart data={activePortfolioData} margin={{ top: 35, right: 30, left: 20, bottom: 0 }} barCategoryGap="25%">
                        <XAxis 
                          dataKey="name" 
                          tick={{fontSize: isMobile ? 13.3 : 14, fontWeight: 'bold', fill: '#666'}} 
                          axisLine={{ stroke: '#e4e4e7', strokeWidth: 2 }} 
                          tickLine={false} 
                          dy={10}
                        />
                        <YAxis hide domain={[0, 60]} />
                        <RechartsTooltip 
                          content={<CustomActivePortfolioTooltip hoveredSegment={hoveredSegment} />} 
                          cursor={{fill: 'transparent'}} 
                        />
                        <Customized component={AnimatedReferenceLine} />
                        {/* BARRA INFERIOR (Navy Blue) - Entra primero */}
                        <Bar 
                          dataKey="visualBottom" 
                          stackId="a" 
                          fill="#005173" 
                          minPointSize={40}
                          shape={bottomBarShape}
                          isAnimationActive={false}
                          onMouseEnter={() => setHoveredSegment('bottomSegment')}
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          <LabelList dataKey="bottomLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                        </Bar>
                        {/* BARRA MEDIA */}
                        <Bar 
                          dataKey="visualMiddle" 
                          stackId="a" 
                          fill="#005173" 
                          minPointSize={40}
                          shape={middleBarShape}
                          isAnimationActive={false}
                          onMouseEnter={() => setHoveredSegment('middleSegment')}
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          <LabelList dataKey="middleLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                        </Bar>
                        {/* BARRA SUPERIOR (Gray) - Espera a que la Navy Blue avance */}
                        <Bar 
                          dataKey="visualTop" 
                          stackId="a" 
                          fill="#A6B3BC" 
                          minPointSize={40}
                          shape={topBarShape}
                          isAnimationActive={false}
                          onMouseEnter={() => setHoveredSegment('topSegment')}
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          {activePortfolioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 1 ? '#005173' : '#A6B3BC'} />
                          ))}
                          <LabelList dataKey="topLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                        </Bar>
                        <Customized component={PortfolioBracket} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export function CurrentDisbursement() {
  const { metrics } = usePortfolioData();
  const [hoveredDisbursement, setHoveredDisbursement] = useState<string | null>(null);
  const [dotsSettled, setDotsSettled] = useState(false);
  const [hoveredDisbursement2, setHoveredDisbursement2] = useState<string | null>(null);
  const [dotsSettled2, setDotsSettled2] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalProjects = 48;
  const stage2Projects = metrics?.stage2InvCount || 34;
  const disbursedLifePercent = 36;
  const disbursedLifeAmount = 1558;
  const stage2DisbursedAmount = 1322; // As requested by user
  const stage2TotalApproved = 2435; // 1322 + 1113
  const currentApprovedAmount = 4361;

  // Update FMM in barData
  const updatedBarData = barData.map(d => {
    if (d.name === 'FMM') {
      return {
        ...d,
        disbursedAmount: stage2DisbursedAmount,
        undisbursedAmount: Math.round(stage2TotalApproved - stage2DisbursedAmount),
        numberOfProjects: stage2Projects,
        disbursedPct: Math.round((stage2DisbursedAmount / stage2TotalApproved) * 100),
        undisbursedPct: Math.round(((stage2TotalApproved - stage2DisbursedAmount) / stage2TotalApproved) * 100)
      };
    }
    return d;
  });

  // Update FMM in allStagesBarData
  const updatedAllStagesBarData = allStagesBarData.map(d => {
    if (d.name === 'FMM') {
      return {
        ...d,
        disbursedAmount: Math.round(disbursedLifeAmount),
        undisbursedAmount: Math.round(currentApprovedAmount - disbursedLifeAmount),
        numberOfProjects: totalProjects,
        disbursedPct: Math.round(disbursedLifePercent),
        undisbursedPct: Math.round(100 - disbursedLifePercent)
      };
    }
    return d;
  });
  
  const disbursementRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: disbursementScrollProgress } = useScroll({
    target: disbursementRef,
    offset: ["start start", "end end"]
  });

  const step1Opacity = useTransform(disbursementScrollProgress, [0.1, 0.4], [1, 0]);
  const step1Y = useTransform(disbursementScrollProgress, [0.1, 0.4], [0, -30]);
  const step1PointerEvents = useTransform(disbursementScrollProgress, (v) => v > 0.4 ? 'none' : 'auto');

  const step2Opacity = useTransform(disbursementScrollProgress, [0.4, 0.7], [0, 1]);
  const step2Y = useTransform(disbursementScrollProgress, [0.4, 0.7], [30, 0]);
  const step2PointerEvents = useTransform(disbursementScrollProgress, (v) => v > 0.4 ? 'auto' : 'none');
  const step2Display = useTransform(disbursementScrollProgress, (v) => v < 0.4 ? 'none' : 'block');

  useEffect(() => {
    const unsubscribe = disbursementScrollProgress.on("change", (latest) => {
      if (latest > 0.55 && !dotsSettled2) {
        setTimeout(() => setDotsSettled2(true), 2500);
      }
    });
    return unsubscribe;
  }, [disbursementScrollProgress, dotsSettled2]);

  const step1OpacityMobile = isMobile ? 1 : step1Opacity;
  const step1YMobile = isMobile ? 0 : step1Y;
  const step1PointerEventsMobile = isMobile ? 'auto' : step1PointerEvents;

  const step2OpacityMobile = isMobile ? 1 : step2Opacity;
  const step2YMobile = isMobile ? 0 : step2Y;
  const step2PointerEventsMobile = isMobile ? 'auto' : step2PointerEvents;
  const step2DisplayMobile = isMobile ? 'block' : step2Display;

  return (
    <div className="w-full flex flex-col font-sans bg-zinc-50 py-4 lg:py-[5vh] mt-6 md:mt-0">
      <div className={`w-full ${isMobile ? 'h-auto' : 'h-[250vh]'} relative`} ref={disbursementRef}>
        {/* Centramos verticalmente el contenido sticky y ajustamos el inicio del sticky */}
        <div className={`${isMobile ? 'relative' : 'sticky top-0 h-screen'} flex flex-col justify-center w-full`}>
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 relative">
              {/* Left Column: Text */}
              <div className="w-full lg:w-[45%] relative">
                <div className="mb-6 md:mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">Current disbursement</h2>
                </div>
                <div className={`relative ${isMobile ? 'h-auto mb-12' : 'h-[150px] md:h-[200px]'}`}>
                  {/* Text 1 */}
                  <motion.div 
                    style={{ 
                      opacity: step1OpacityMobile, 
                      y: step1YMobile, 
                      position: isMobile ? 'relative' : 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%',
                      pointerEvents: step1PointerEventsMobile as any
                    }}
                  >
                    <div className="text-lg md:text-xl text-zinc-700 leading-relaxed space-y-4 md:space-y-6">
                      <p>
                        From a total approved amount of <strong className="font-bold text-zinc-900">$4,361 M</strong>, the division has disbursed <strong className="font-bold text-zinc-900">$1,558 M</strong> (36%), leaving a balance of <strong className="font-bold text-zinc-900">$2,803 M</strong> undisbursed.
                      </p>
                    </div>
                  </motion.div>

                  {/* Text 2 */}
                  <motion.div 
                    style={{ 
                      opacity: step2OpacityMobile, 
                      y: step2YMobile, 
                      position: isMobile ? 'relative' : 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%',
                      pointerEvents: step2PointerEventsMobile as any,
                      display: step2DisplayMobile as any,
                      marginTop: isMobile ? '2rem' : 0
                    }}
                  >
                    <div className="text-lg md:text-xl text-zinc-700 leading-relaxed space-y-4 md:space-y-6">
                      <p>
                        However, focusing exclusively on the 34 INV operations in Stage II, the disbursement rate reaches 54%, the highest among all IFD divisions.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Charts */}
              <div className="w-full lg:w-[55%] relative flex flex-col gap-12">
                {/* Chart 1 (allStagesBarData) */}
                <motion.div 
                  className={`w-full flex justify-center items-start ${isMobile ? 'relative' : 'lg:absolute top-0 left-0'}`}
                  style={{ 
                    opacity: step1OpacityMobile, 
                    y: step1YMobile,
                    pointerEvents: step1PointerEventsMobile as any
                  }}
                  onViewportEnter={() => setTimeout(() => setDotsSettled(true), 2500)}
                >
                  <div className="w-full flex flex-col">
                    <h3 className={`font-bold text-[#005173] text-center mb-2 leading-tight flex flex-col items-center ${isMobile ? 'text-[14.5px]' : 'text-lg'}`}>
                      <span>IFD: Undisbursed and Disbursed Amount ($M, %), by Division</span>
                      <span>(INV and PBL, all Stages)</span>
                    </h3>
                    <div className="w-full h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={updatedAllStagesBarData} margin={{ top: 20, right: 0, left: 0, bottom: 20 }} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: isMobile ? 11.3 : 14, fontWeight: 'bold'}} padding={{ left: 10, right: 10 }} />
                          
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value}`}
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#666', fontSize: isMobile ? 9.7 : 12}}
                            domain={[0, 7000]}
                            ticks={[0, 1000, 3000, 5000, 7000]}
                            label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: isMobile ? 9.7 : 12, fontWeight: 'bold' } }}
                          />
                          
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#666', fontSize: isMobile ? 9.7 : 12}}
                            domain={[0, 65]}
                            ticks={[0, 15, 30, 45, 65]}
                            label={{ value: 'Number of Projects', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#666', fontSize: isMobile ? 9.7 : 12, fontWeight: 'bold' } }}
                          />

                          <RechartsTooltip 
                            content={<CustomTooltip hoveredSegment={hoveredDisbursement} />} 
                            cursor={{fill: 'transparent'}} 
                            shared={false}
                          />
                          <Legend content={renderCustomLegend} verticalAlign="bottom" />
                          
                          <Bar 
                            yAxisId="left" 
                            dataKey="disbursedAmount" 
                            stackId="a" 
                            fill="#005173"
                            isAnimationActive={false}
                            onMouseEnter={() => setHoveredDisbursement('disbursed')}
                            onMouseLeave={() => setHoveredDisbursement(null)}
                          >
                            <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" style={{ fontSize: isMobile ? '8.9px' : '11px' }} formatter={(value: any) => `$${value}`} />
                          </Bar>

                          <Bar 
                            yAxisId="left" 
                            dataKey="undisbursedAmount" 
                            stackId="a" 
                            fill="url(#diagonalHatch)"
                            isAnimationActive={false}
                            onMouseEnter={() => setHoveredDisbursement('undisbursed')}
                            onMouseLeave={() => setHoveredDisbursement(null)}
                          >
                            <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" style={{ fontSize: isMobile ? '8.9px' : '11px' }} formatter={(value: any) => `$${value}`} />
                          </Bar>
                          
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="numberOfProjects"
                            name="Number of Projects"
                            stroke="none"
                            dot={(props: any) => <CustomYellowDot {...props} isSettled={dotsSettled} />}
                            isAnimationActive={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                      
                      <svg width="0" height="0">
                        <defs>
                          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                            <rect width="4" height="4" fill="#ffffff" />
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                          </pattern>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Chart 2 (barData) */}
                <motion.div 
                  className={`w-full flex justify-center items-start ${isMobile ? 'relative' : 'lg:absolute top-0 left-0'}`}
                  style={{ 
                    opacity: step2OpacityMobile, 
                    y: step2YMobile,
                    pointerEvents: step2PointerEventsMobile as any,
                    display: step2DisplayMobile as any
                  }}
                >
                  <div className="w-full flex flex-col">
                    <h3 className={`font-bold text-[#005173] text-center mb-2 leading-tight flex flex-col items-center ${isMobile ? 'text-[14.5px]' : 'text-lg'}`}>
                      <span>IFD: Disbursed and Undisbursed Amount ($M, %), by Division</span>
                      <span>(only INV and Stage II)</span>
                    </h3>
                    <div className="w-full h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={updatedBarData} margin={{ top: 20, right: 0, left: 0, bottom: 20 }} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: isMobile ? 11.3 : 14, fontWeight: 'bold'}} padding={{ left: 10, right: 10 }} />
                          
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value}`}
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#666', fontSize: isMobile ? 9.7 : 12}}
                            domain={[0, 6000]}
                            ticks={[0, 2000, 4000, 6000]}
                            label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: isMobile ? 9.7 : 12, fontWeight: 'bold' } }}
                          />
                          
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#666', fontSize: isMobile ? 9.7 : 12}}
                            domain={[0, 50]}
                            ticks={[0, 10, 20, 30, 40, 50]}
                            label={{ value: 'Number of Projects', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#666', fontSize: isMobile ? 9.7 : 12, fontWeight: 'bold' } }}
                          />

                          <RechartsTooltip 
                            content={<CustomTooltip hoveredSegment={hoveredDisbursement2} />} 
                            cursor={{fill: 'transparent'}} 
                            shared={false}
                          />
                          <Legend content={renderCustomLegend} verticalAlign="bottom" />
                          
                          <Bar 
                            yAxisId="left" 
                            dataKey="disbursedAmount" 
                            stackId="a" 
                            fill="#005173"
                            isAnimationActive={false}
                            onMouseEnter={() => setHoveredDisbursement2('disbursed')}
                            onMouseLeave={() => setHoveredDisbursement2(null)}
                          >
                            <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" style={{ fontSize: isMobile ? '8.9px' : '11px' }} formatter={(value: any) => `$${value}`} />
                          </Bar>

                          <Bar 
                            yAxisId="left" 
                            dataKey="undisbursedAmount" 
                            stackId="a" 
                            fill="url(#diagonalHatch)"
                            isAnimationActive={false}
                            onMouseEnter={() => setHoveredDisbursement2('undisbursed')}
                            onMouseLeave={() => setHoveredDisbursement2(null)}
                          >
                            <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" style={{ fontSize: isMobile ? '8.9px' : '11px' }} formatter={(value: any) => `$${value}`} />
                          </Bar>
                          
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="numberOfProjects"
                            name="Number of Projects"
                            stroke="none"
                            dot={(props: any) => <CustomYellowDot {...props} isSettled={dotsSettled2} />}
                            isAnimationActive={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                      
                      <svg width="0" height="0">
                        <defs>
                          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                            <rect width="4" height="4" fill="#ffffff" />
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                          </pattern>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
