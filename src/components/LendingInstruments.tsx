import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, LabelList, Customized, Cell } from 'recharts';
import { usePortfolioData } from '../hooks/usePortfolioData';

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
      fontSize={11} 
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

    const xAxis = xAxisMap[Object.keys(xAxisMap)[0]];
    const yAxis = yAxisMap[Object.keys(yAxisMap)[0]];

    if (!xAxis || !yAxis) return null;

    const xCenter = xAxis.scale(`${invCount} INV`) + xAxis.scale.bandwidth() / 2;
    const barWidth = xAxis.scale.bandwidth();
    
    const xStart = xCenter - barWidth / 2;
    const xEnd = xCenter + barWidth / 2;

    const yBase = yAxis.scale(totalProjects);

    const bracketPath = `M ${xStart},${yBase} 
      Q ${xStart},${yBase - 12} ${xCenter - 10},${yBase - 12} 
      L ${xCenter - 5},${yBase - 12} 
      Q ${xCenter},${yBase - 22} ${xCenter + 5},${yBase - 12} 
      L ${xCenter + 10},${yBase - 12} 
      Q ${xEnd},${yBase - 12} ${xEnd},${yBase}`;

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <path d={bracketPath} fill="none" stroke="#000000" strokeWidth={3} />
        <text x={xCenter} y={yBase - 30} textAnchor="middle" fill="#18181b" fontWeight="bold" fontSize={14}>
          {invCount} INV
        </text>
      </motion.g>
    );
  };

  const bottomBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0} isVisible={isLendingInView} />, [isLendingInView]);
  const middleBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0.25} isVisible={isLendingInView} />, [isLendingInView]);
  const topBarShape = React.useCallback((props: any) => <AnimatedBarShape {...props} layerDelay={0.5} isVisible={isLendingInView} />, [isLendingInView]);

  return (
    <div className="w-full flex flex-col font-sans bg-zinc-50 py-[5vh]">
      <div className="w-full relative">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={isLendingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, layout: { duration: 0.3 } }}
                className="w-full lg:w-[45%]"
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">Lending Instruments and Stages</h2>
                <div className="text-lg lg:text-xl text-zinc-700 leading-relaxed space-y-6">
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
                    initial={{ opacity: 0 }}
                    animate={isLendingInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, layout: { duration: 0.3 } }}
                    className="text-lg font-bold text-[#005173] text-center mb-2 leading-tight"
                  >
                    FMM: Active Portfolio breakdown, by Lending Instrument and Stage
                  </motion.h3>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" aspect={1.2}>
                      <BarChart data={activePortfolioData} margin={{ top: 60, right: 30, left: 20, bottom: 0 }} barCategoryGap="25%">
                        <XAxis 
                          dataKey="name" 
                          tick={{fontSize: 14, fontWeight: 'bold', fill: '#666'}} 
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
                        {/* CORCHETE - Al final para que se dibuje encima */}
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
