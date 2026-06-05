import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip as RechartsTooltip, ReferenceLine, LabelList, Cell
} from 'recharts';

const ageData = [
  { name: 'CIS', age: 4.5 },
  { name: 'ICS', age: 4.2 },
  { name: 'FMM', age: 4.0 },
  { name: 'CMF', age: 2.1 },
];

const sectorData = [
  { name: 'Gestión Fiscal Subnacional', projects: 28, amount: 2829 },
  { name: 'Administración Tributaria', projects: 6, amount: 468 },
  { name: 'Gestión Financiera Integrada', projects: 6, amount: 197 },
  { name: 'Inversión Pública', projects: 2, amount: 68 },
  { name: 'Macrofiscal', projects: 1, amount: 600 },
  { name: 'Calidad del gasto', projects: 1, amount: 20 },
  { name: 'Empresas Públicas', projects: 1, amount: 7 },
  { name: 'Compras Públicas', projects: 1, amount: 20 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAgeChart = 'age' in data;

    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-sm z-50">
        <p className="font-bold text-zinc-900 mb-2 border-b border-zinc-100 pb-1">{label}</p>
        {isAgeChart ? (
          <p className="mb-1">
            <span className="font-bold text-zinc-500">Average Age:</span>{' '}
            <span className="font-bold text-[#005274]">{data.age} years</span>
          </p>
        ) : (
          <>
            <p className="mb-1">
              <span className="font-bold text-zinc-500">Projects:</span>{' '}
              <span className="font-bold text-[#005274]">{data.projects}</span>
            </p>
            <p className="mb-1">
              <span className="font-bold text-zinc-500">Amount:</span>{' '}
              <span className="font-bold text-[#005274]">${data.amount.toLocaleString()} M</span>
            </p>
          </>
        )}
      </div>
    );
  }
  return null;
};

const CustomAgeLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y - 12} fill="#005274" textAnchor="middle" fontSize={11} fontWeight={500}>
      {value}
    </text>
  );
};

const CustomSectorLabel = (props: any) => {
  const { x, y, width, height, value, amount } = props;
  const isSmall = width < 25;
  return (
    <g>
      <text 
        x={isSmall ? x + width + 8 : x + width - 8} 
        y={y + height / 2} 
        fill={isSmall ? "#005274" : "#ffffff"} 
        textAnchor={isSmall ? "start" : "end"} 
        dominantBaseline="middle" 
        fontSize={11} 
        fontWeight={500}
      >
        {value}
      </text>
      <text 
        x={isSmall ? x + width + 24 : x + width + 8} 
        y={y + height / 2} 
        fill="#52525b" 
        textAnchor="start" 
        dominantBaseline="middle" 
        fontSize={11} 
        fontWeight={500}
      >
        (${amount.toLocaleString()})
      </text>
    </g>
  );
};

export default function PortfolioAgeAndSectors() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-20%" });
  const [activeHoverItem, setActiveHoverItem] = useState<string | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="w-full flex flex-col py-4 lg:py-[5vh]" ref={sectionRef}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="w-full mb-8 px-4 md:px-6 lg:px-12 max-w-[1440px] mx-auto"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-4 md:mb-6 tracking-tight text-center lg:text-left">Portfolio Age</h2>
        <p className="text-base md:text-xl text-zinc-700 leading-relaxed w-full text-center lg:text-left">
          The FMM active portfolio has an average age of 4 years, above the IFD department average (3.5). Currently, <strong className="font-bold text-zinc-900">35%</strong> of the projects have exceeded 5 years in execution, and <strong className="font-bold text-zinc-900">35%</strong> have requested extensions.
        </p>
      </motion.div>

      <div className="flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 items-center justify-center">
        {/* Left Chart */}
        <motion.div 
          className="w-full max-w-2xl flex flex-col"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h3 className="text-base sm:text-lg font-bold text-[#005274] mb-4 text-center flex flex-col px-2">
            <span>IFD: Average Portfolio Age (in years) in 2026, by Division</span>
            <span>(INV and PBL)</span>
          </h3>
          <div className="w-full flex flex-col">
            <div className="w-full">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData} margin={{ top: 35, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis hide domain={[0, 6]} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f4f4f5'}} />
                  
                  <ReferenceLine segment={[{ x: 'CIS', y: 4.1 }, { x: 'CMF', y: 4.1 }]} stroke="#FFC000" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'IDB (4.1)', fill: '#FFC000', fontSize: 10, fontWeight: 'bold' }} />
                  <ReferenceLine segment={[{ x: 'CIS', y: 3.5 }, { x: 'CMF', y: 3.5 }]} stroke="#00bcd4" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'IFD (3.5)', fill: '#00bcd4', fontSize: 10, fontWeight: 'bold' }} />
                  
                  <Bar 
                    dataKey="age" 
                    fill="#005274" 
                    barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40} 
                    isAnimationActive={false} 
                    onMouseEnter={(data: any) => setActiveHoverItem(data.name)}
                    onMouseLeave={() => setActiveHoverItem(null)}
                  >
                    <LabelList dataKey="age" content={<CustomAgeLabel />} />
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-age-${index}`} fill={activeHoverItem === entry.name ? '#0284c7' : '#005274'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-[10px] sm:text-xs font-bold text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#005274]"></div>
                <span>Divisions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0 border-t-2 border-dashed border-[#00bcd4]"></div>
                <span>IFD</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0 border-t-2 border-dashed border-[#FFC000]"></div>
                <span>IDB</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
