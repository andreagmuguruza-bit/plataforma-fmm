import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const geoImpactData = [
  { country: 'BR', name: 'Brazil', region: 'CSC', amount: 1750, projects: 20, disbursed: 58, undisbursed: 42, disbursedVol: 1022, undisbursedVol: 727, flag: '🇧🇷', flagCode: 'br' },
  { country: 'AR', name: 'Argentina', region: 'CSC', amount: 330, projects: 3, disbursed: 40, undisbursed: 60, disbursedVol: 133, undisbursedVol: 197, flag: '🇦🇷', flagCode: 'ar' },
  { country: 'UR', name: 'Uruguay', region: 'CSC', amount: 204, projects: 4, disbursed: 42, undisbursed: 58, disbursedVol: 85, undisbursedVol: 119, flag: '🇺🇾', flagCode: 'uy' },
  { country: 'PR', name: 'Paraguay', region: 'CSC', amount: 55, projects: 2, disbursed: 29, undisbursed: 71, disbursedVol: 16, undisbursedVol: 39, flag: '🇵🇾', flagCode: 'py' },
  { country: 'CH', name: 'Chile', region: 'CSC', amount: 20, projects: 1, disbursed: 27, undisbursed: 73, disbursedVol: 5, undisbursedVol: 15, flag: '🇨🇱', flagCode: 'cl' },
  { country: 'CO', name: 'Colombia', region: 'CAN', amount: 300, projects: 2, disbursed: 32, undisbursed: 68, disbursedVol: 96, undisbursedVol: 204, flag: '🇨🇴', flagCode: 'co' },
  { country: 'PE', name: 'Peru', region: 'CAN', amount: 204, projects: 4, disbursed: 45, undisbursed: 55, disbursedVol: 92, undisbursedVol: 111, flag: '🇵🇪', flagCode: 'pe' },
  { country: 'EC', name: 'Ecuador', region: 'CAN', amount: 114, projects: 3, disbursed: 37, undisbursed: 63, disbursedVol: 42, undisbursedVol: 72, flag: '🇪🇨', flagCode: 'ec' },
  { country: 'SU', name: 'Suriname', region: 'CCB', amount: 50, projects: 1, disbursed: 13, undisbursed: 87, disbursedVol: 6, undisbursedVol: 44, flag: '🇸🇷', flagCode: 'sr' },
  { country: 'ME', name: 'Mexico', region: 'CID', amount: 500, projects: 1, disbursed: 0, undisbursed: 100, disbursedVol: 0, undisbursedVol: 500, flag: '🇲🇽', flagCode: 'mx' },
  { country: 'PN', name: 'Panama', region: 'CID', amount: 60, projects: 2, disbursed: 22, undisbursed: 78, disbursedVol: 13, undisbursedVol: 47, flag: '🇵🇦', flagCode: 'pa' },
  { country: 'BL', name: 'Belize', region: 'CCB', amount: 22, projects: 2, disbursed: 75, undisbursed: 25, disbursedVol: 17, undisbursedVol: 5, flag: '🇧🇿', flagCode: 'bz' },
];

const colorScale = scaleLinear<string>().domain([0, 1750]).range(["#e0f2fe", "#005274"]);

// --- Componentes Customizados Gráfico 1 ---
const CustomStackedLabel = (props: any) => {
  const { x, y, width, height, value, textColor } = props;
  if (value === 0 || value == null) return null;
  
  // Hide labels if segment is too small to avoid overlap/clutter
  if (width < 15) return null;

  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill={textColor || "#ffffff"} 
      textAnchor="middle" 
      dominantBaseline="middle" 
      fontSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 9 : 11} 
      fontWeight="bold"
      style={{ pointerEvents: 'none' }}
    >
      {value}%
    </text>
  );
};

const CustomBarLabel = (props: any) => {
  const { x, y, width, index } = props;
  const data = geoImpactData[index];
  if (!data) return null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  return (
    <g>
      <text x={x + width / 2} y={y - 12} fill="#52525b" textAnchor="middle" fontSize={isMobile ? 9 : 11} fontWeight={500}>${data.amount}</text>
    </g>
  );
};

const CustomAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const country = geoImpactData.find(d => d.country === payload.value);
  const showRegion = ['UR', 'PE', 'SU', 'PN'].includes(payload.value);
  const showSeparator = ['CH', 'EC', 'SU'].includes(payload.value);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  return (
    <g transform={`translate(${x},${y})`}>
      {showSeparator && !isMobile && <line x1={25} y1={0} x2={25} y2={45} stroke="#d4d4d8" strokeWidth={1} />}
      <image 
        x={isMobile ? -8 : -10} 
        y={isMobile ? 0 : 5} 
        width={isMobile ? 16 : 20} 
        height={isMobile ? 12 : 15} 
        href={`https://flagcdn.com/w40/${country?.flagCode}.png`} 
      />
      <g transform={isMobile ? "rotate(-90)" : ""}>
        <text 
          x={isMobile ? -25 : 0} 
          y={isMobile ? 2 : 35} 
          textAnchor={isMobile ? "end" : "middle"} 
          fill="#52525b" 
          fontSize={isMobile ? 8 : 9} 
          fontWeight="medium"
        >
          {country?.name}
        </text>
      </g>
      {showRegion && !isMobile && <text x={0} y={50} textAnchor="middle" fill="#a1a1aa" fontSize={10}>{country?.region}</text>}
    </g>
  );
};

// --- Componentes Customizados Gráfico 2 ---
// Orden ascendente para el layout vertical (los menores primero, BL queda último en el array y Recharts lo renderiza arriba)
const sortedForHorizontal = [...geoImpactData].sort((a, b) => a.disbursed - b.disbursed);

const CustomYAxisTickHorizontal = (props: any) => {
  const { x, y, payload } = props;
  const data = sortedForHorizontal.find(d => d.country === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <image 
        x={-115} 
        y={-8} 
        width={19} 
        height={14.25} 
        href={`https://flagcdn.com/w40/${data?.flagCode}.png`} 
      />
      <text x={-10} y={4} textAnchor="end" fill="#52525b" fontSize={10} fontWeight="medium">{data?.name}</text>
    </g>
  );
};

export default function GeographicImpact() {
  const [activeHoverCountry, setActiveHoverCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<any>(null);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Tiempos restaurados a los de Current Disbursement con espacio de 300vh
  const chart1Opacity = useTransform(scrollYProgress, [0.1, 0.4], [1, 0]);
  const chart1PointerEvents = useTransform(scrollYProgress, (v) => v > 0.4 ? 'none' : 'auto');

  const chart2Opacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const chart2PointerEvents = useTransform(scrollYProgress, (v) => v > 0.4 ? 'auto' : 'none');

  // Gráficos sin transición en mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  return (
    // Contenedor principal: bg-zinc-50 evita que "Historical Disbursements" se transparente por debajo
    <div ref={containerRef} className={`w-full ${isMobile ? 'h-auto mt-0 mb-4' : 'lg:h-[300vh]'} relative bg-zinc-50 z-10`}>
      <div className="lg:sticky lg:top-16 pt-6 w-full flex flex-col justify-start">
        {/* Título principal movido aquí */}
        <div className="w-full mb-6 px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-zinc-900 tracking-tight text-center lg:text-left">Geographic Reach</h2>
          <p className="text-base md:text-xl text-zinc-700 leading-relaxed mt-4 text-center lg:text-left">
            FMM operations span 12 countries. Brazil holds the largest share of FMM's portfolio with $1,750M allocated across 20 projects. In terms of execution, Belize has the highest disbursement rate at 75%, followed by Brazil (58%) and Peru (45%).
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto pb-12">
          {/* COLUMNA IZQUIERDA: Mapa Fijo */}
          <div className="w-full h-auto min-h-[350px] lg:h-full relative flex flex-col">
            <h3 className="text-lg font-bold text-[#005274] mb-2 text-center">Where are we driving impact?</h3>
            <div className="w-full relative overflow-hidden h-[300px] lg:h-[320px]">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full h-full"
              >
                <ComposableMap projection="geoAzimuthalEqualArea" projectionConfig={{ rotate: [70, 20, 0], scale: 350 }} className="w-full h-full">
                  <ZoomableGroup center={[-45, -15]} zoom={1}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const d = geoImpactData.find((s) => s.name === geo.properties.name);
                          const isHovered = activeHoverCountry === d?.country;
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={d ? (isHovered ? '#0284c7' : colorScale(d.amount) as string) : "#f4f4f5"}
                              stroke="#ffffff"
                              strokeWidth={0.5}
                              style={{ default: { outline: "none" }, hover: { fill: d ? "#0284c7" : "#f4f4f5", outline: "none" }, pressed: { outline: "none" } }}
                              onMouseEnter={() => { if (d) { setActiveHoverCountry(d.country); setTooltipContent(d); } }}
                              onMouseLeave={() => { setActiveHoverCountry(null); setTooltipContent(null); }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </motion.div>
              
              {/* Map Tooltip & Legend */}
              {tooltipContent && (
                <div className="absolute top-4 right-4 bg-zinc-900 text-white p-2 rounded-lg shadow-lg text-xs pointer-events-none z-10 w-40">
                  <p className="font-semibold mb-1">{tooltipContent.name}</p>
                  <p>${tooltipContent.amount} M | {tooltipContent.projects} projects | {tooltipContent.disbursed}% disbursed</p>
                </div>
              )}
              <div className="absolute bottom-8 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-zinc-200 text-[10px] z-10 pointer-events-none w-36 sm:w-44">
                <p className="text-center mb-1"><span className="font-bold text-zinc-900">Investment Amount</span> <span className="text-zinc-500">($M)</span></p>
                <div className="w-full h-2 bg-gradient-to-r from-[#e0f2fe] to-[#005274] mb-1"></div>
                <div className="flex justify-between text-zinc-500 font-medium text-[10px]"><span>$0</span><span>$875</span><span>$1750</span></div>
              </div>
            </div>
          </div>
          {/* COLUMNA DERECHA: Scrollytelling Charts */}
          <div className="w-full h-auto min-h-[400px] lg:h-full relative flex flex-col mb-6 lg:mb-12">
            
            {/* GRÁFICO 1: Original (Fade Out) */}
            <motion.div 
              className="lg:absolute lg:inset-0 w-full min-h-fit lg:h-full flex flex-col" 
              style={!isMobile && typeof window !== 'undefined' && window.innerWidth >= 1024 ? { opacity: chart1Opacity, pointerEvents: chart1PointerEvents as any } : { opacity: 1, pointerEvents: 'auto' }}
            >
              <h3 className="text-base sm:text-lg font-bold text-[#005274] mb-2 text-center px-2">
                 FMM: Current Approved Amount ($M) and Number of Projects, by Region and Country (only INV)
              </h3>
              <div className="w-full relative h-[275px] sm:h-[350px] lg:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoImpactData} margin={{ top: 30, right: 30, left: 0, bottom: 40 }} barCategoryGap="20%">
                    <XAxis dataKey="country" tick={<CustomAxisTick />} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: isMobile ? 9 : 10}} width={60} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-zinc-200 text-zinc-900 p-3 rounded-lg shadow-lg text-sm">
                              <p className="font-bold text-[#005274] mb-1">{data.name}</p>
                              <p>${data.amount} M | {data.projects} projects | {data.disbursed}% disbursed</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      radius={[4, 4, 0, 0]} 
                      label={<CustomBarLabel />} 
                      isAnimationActive={false}
                      onMouseEnter={(data: any) => setActiveHoverCountry(data.country || data.payload?.country)}
                      onMouseLeave={() => setActiveHoverCountry(null)}
                    >
                      {geoImpactData.map((entry, index) => <Cell key={`cell-${index}`} fill={activeHoverCountry === entry.country ? '#0284c7' : '#005274'} stroke="none" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            {/* GRÁFICO 2: Horizontal Apilado (Fade In) */}
            <motion.div 
              className="mt-12 lg:mt-0 lg:absolute lg:inset-0 w-full min-h-fit lg:h-full flex flex-col" 
              style={!isMobile && typeof window !== 'undefined' && window.innerWidth >= 1024 ? { opacity: chart2Opacity, pointerEvents: chart2PointerEvents as any } : { opacity: 1, pointerEvents: 'auto' }}
            >
              <h3 className="text-base sm:text-lg font-bold text-[#005274] mb-2 text-center px-2">FMM: Disbursed and Undisbursed Amount (%), by Country (only INV)</h3>
              <div className="w-full relative h-[400px] sm:h-[500px] lg:h-[350px] pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={sortedForHorizontal} margin={{ top: 5, right: 30, left: 20, bottom: 0 }}>
                    {/* Sin líneas de fondo */}
                    <XAxis type="number" hide domain={[0, 100]} />
                    {/* reversed={true} en YAxis */}
                    <YAxis type="category" dataKey="country" reversed={true} axisLine={false} tickLine={false} tick={<CustomYAxisTickHorizontal />} width={120} interval={0} />
                    
                    <RechartsTooltip cursor={{fill: '#f4f4f5'}} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-zinc-200 text-zinc-900 p-3 rounded-lg shadow-lg text-sm z-50">
                              <p className="font-bold text-[#005274] mb-2 border-b border-zinc-100 pb-1">{data.name}</p>
                              <p className="mb-1"><span className="font-bold text-[#005274]">Disbursed:</span> {data.disbursed}% (${data.disbursedVol}M)</p>
                              <p><span className="font-bold text-zinc-500">Undisbursed:</span> {data.undisbursed}% (${data.undisbursedVol}M)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} content={() => (
                      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 text-[10px] sm:text-[11px] text-zinc-600 font-bold mt-4 items-center">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#005274]"></div>Disbursed Life Amount (%)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[url(#diagonalHatchGeo)] border border-zinc-300"></div>Undisbursed Amount (%)</div>
                      </div>
                    )}/>
                    
                    <Bar 
                      dataKey="disbursed" 
                      stackId="a" 
                      isAnimationActive={false}
                      onMouseEnter={(data: any) => setActiveHoverCountry(data.country || data.payload?.country)}
                      onMouseLeave={() => setActiveHoverCountry(null)}
                    >
                      <LabelList dataKey="disbursed" content={<CustomStackedLabel textColor="#ffffff" />} />
                      {sortedForHorizontal.map((entry, index) => <Cell key={`cell-dis-${index}`} fill={activeHoverCountry === entry.country ? '#0284c7' : '#005274'} />)}
                    </Bar>
                    
                    <Bar 
                      dataKey="undisbursed" 
                      stackId="a" 
                      stroke="#d4d4d8" 
                      isAnimationActive={false}
                      onMouseEnter={(data: any) => setActiveHoverCountry(data.country || data.payload?.country)}
                      onMouseLeave={() => setActiveHoverCountry(null)}
                    >
                      <LabelList dataKey="undisbursed" content={<CustomStackedLabel textColor="#000000" />} />
                      {sortedForHorizontal.map((entry, index) => <Cell key={`cell-undis-${index}`} fill="url(#diagonalHatchGeo)" opacity={activeHoverCountry && activeHoverCountry !== entry.country ? 0.3 : 1} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                
                {/* Patrón SVG para la textura de Undisbursed */}
                <svg width="0" height="0">
                  <defs>
                    <pattern id="diagonalHatchGeo" patternUnits="userSpaceOnUse" width="4" height="4">
                      <rect width="4" height="4" fill="#ffffff" />
                      <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.5" />
                    </pattern>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
