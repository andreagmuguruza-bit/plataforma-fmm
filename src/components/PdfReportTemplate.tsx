import React from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line, LabelList, ReferenceLine
} from 'recharts';
import { IDB_LOGO_BASE64 } from '../utils/idbLogo';

// Data definitions
const idbData = [
  { name: 'INE', value: 23972, percentage: 42, fill: '#A9B3BC' },
  { name: 'IFD', value: 14609, percentage: 26, fill: '#005173' },
  { name: 'SCL', value: 10268, percentage: 18, fill: '#A9B3BC' },
  { name: 'CSD', value: 4214, percentage: 7, fill: '#A9B3BC' },
  { name: 'PTI', value: 4091, percentage: 7, fill: '#A9B3BC' },
];

const ifdData = [
  { name: 'CMF', value: 6703, percentage: 46, fill: '#005173' },
  { name: 'FMM', value: 4361, percentage: 30, fill: '#FFC000' },
  { name: 'ICS', value: 2476, percentage: 17, fill: '#005173' },
  { name: 'CIS', value: 1069, percentage: 7, fill: '#005173' },
];

const allStagesBarData = [
  { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 2797, numberOfProjects: 48, disbursedPct: 36, undisbursedPct: 64 },
  { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 642, numberOfProjects: 17, disbursedPct: 40, undisbursedPct: 60 },
  { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 3886, numberOfProjects: 50, disbursedPct: 42, undisbursedPct: 58 },
  { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 1455, numberOfProjects: 48, disbursedPct: 41, undisbursedPct: 59 },
];

const activePortfolioData = [
  {
    name: '48 projects',
    visualBottom: 47,
    visualMiddle: 0,
    visualTop: 1,
    bottomLabel: '47 INV',
    middleLabel: '',
    topLabel: '1 PBL',
  },
  {
    name: '47 INV',
    visualBottom: 4,
    visualMiddle: 37,
    visualTop: 6,
    bottomLabel: '4 Stage III',
    middleLabel: '37 Stage II',
    topLabel: '6 Stage I',
  }
];

const stage23BarData = [
  { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 1216, numberOfProjects: 41, disbursedPct: 56, undisbursedPct: 44 },
  { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 439, numberOfProjects: 15, disbursedPct: 49, undisbursedPct: 51 },
  { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 1933, numberOfProjects: 41, disbursedPct: 59, undisbursedPct: 41 },
  { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 951, numberOfProjects: 39, disbursedPct: 52, undisbursedPct: 48 },
];

const ageData = [
  { name: 'CIS', age: 5.2 },
  { name: 'FMM', age: 4.8 },
  { name: 'ICS', age: 4.2 },
  { name: 'CMF', age: 3.3 },
];

const geoImpactData = [
  { country: 'BR', name: 'Brazil', amount: 1802, projects: 21, disbursed: 58, undisbursed: 42 },
  { country: 'MX', name: 'Mexico', amount: 500, projects: 1, disbursed: 0, undisbursed: 100 },
  { country: 'AR', name: 'Argentina', amount: 430, projects: 4, disbursed: 31, undisbursed: 69 },
  { country: 'CO', name: 'Colombia', amount: 300, projects: 2, disbursed: 33, undisbursed: 67 },
  { country: 'UR', name: 'Uruguay', amount: 204, projects: 4, disbursed: 46, undisbursed: 54 },
  { country: 'PE', name: 'Peru', amount: 204, projects: 4, disbursed: 47, undisbursed: 53 },
  { country: 'EC', name: 'Ecuador', amount: 114, projects: 3, disbursed: 37, undisbursed: 63 },
  { country: 'PN', name: 'Panama', amount: 60, projects: 2, disbursed: 22, undisbursed: 78 },
  { country: 'PR', name: 'Paraguay', amount: 55, projects: 2, disbursed: 29, undisbursed: 71 },
  { country: 'SU', name: 'Suriname', amount: 50, projects: 1, disbursed: 13, undisbursed: 87 },
  { country: 'BL', name: 'Belize', amount: 22, projects: 2, disbursed: 75, undisbursed: 25 },
  { country: 'CH', name: 'Chile', amount: 20, projects: 1, disbursed: 34, undisbursed: 66 },
];

const sortedForHorizontal = [...geoImpactData].sort((a, b) => a.disbursed - b.disbursed);

const ifdDisbursementsData = [
  { name: 'ICS', baseline: 286, actual: 287, disbursed: 34 },
  { name: 'CMF', baseline: 891, actual: 906, disbursed: 637 },
  { name: 'CIS', baseline: 229, actual: 425, disbursed: 17 },
  { name: 'FMM', baseline: 960, actual: 1450, disbursed: 630 },
];

const historicalData = [
  { year: '2019', projection: 1663, disbursed: 1774, projected_disbursed: null, percentage: '+7%' },
  { year: '2020', projection: 1724, disbursed: 2291, projected_disbursed: null, percentage: '+33%' },
  { year: '2021', projection: 1512, disbursed: 1662, projected_disbursed: null, percentage: '+10%' },
  { year: '2022', projection: 2231, disbursed: 2553, projected_disbursed: null, percentage: '+14%' },
  { year: '2023', projection: 753, disbursed: 1117, projected_disbursed: null, percentage: '+48%' },
  { year: '2024', projection: 1913, disbursed: 2961, projected_disbursed: null, percentage: '+55%' },
  { year: '2025', projection: 2131, disbursed: 2502, projected_disbursed: 2502, percentage: '+17%' },
  { year: '2026', projection: 960, disbursed: null, projected_disbursed: 630, percentage: null },
];

// Custom Label Helpers for static PDF print
const renderCustomizedPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, percentage, isRightChart } = props;
  const RADIAN = Math.PI / 180;
  const innerRadiusPos = innerRadius + (outerRadius - innerRadius) * 0.5;
  const xInner = cx + innerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerRadiusPos * Math.sin(-midAngle * RADIAN);

  const outerRadiusPos = outerRadius + 8;
  const xOuter = cx + outerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerRadiusPos * Math.sin(-midAngle * RADIAN);

  let textColor = '#4b5563';
  if (name === 'IFD') textColor = '#005173';
  if (name === 'FMM') textColor = '#000000';
  if (isRightChart && name !== 'FMM') textColor = '#005173';

  let innerTextColor = '#374151';
  if (name === 'IFD' || name === 'FMM' || isRightChart) innerTextColor = '#ffffff';

  return (
    <g>
      <text x={xInner} y={yInner} fill={innerTextColor} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold">
        {percentage}%
      </text>
      <text x={xOuter} y={yOuter} fill={textColor} textAnchor={xOuter > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={9} fontWeight="bold">
        {name}
      </text>
    </g>
  );
};

const CustomStackedLabel = (props: any) => {
  const { x, y, width, height, value, fill, textColor } = props;
  if (!value || width < 12 || height < 10) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill={textColor || fill || "#ffffff"}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={8.5}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

const CustomAgeLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y - 6} fill="#005274" textAnchor="middle" fontSize={9} fontWeight="bold">
      {typeof value === 'number' ? value.toFixed(1) : value}
    </text>
  );
};

const CustomCountryBarLabel = (props: any) => {
  const { x, y, width, index } = props;
  const data = geoImpactData[index];
  if (!data) return null;
  return (
    <text x={x + width / 2} y={y - 5} fill="#4b5563" textAnchor="middle" fontSize={8} fontWeight="bold">
      ${data.amount}
    </text>
  );
};

const CustomIFDBarLabel = (props: any) => {
  const { x, y, width, height, value, offset = 0 } = props;
  if (value == null) return null;
  return (
    <text
      x={x + width + 4 + offset}
      y={y + height / 2}
      fill="#4b5563"
      textAnchor="start"
      fontSize={8}
      fontWeight="bold"
      dominantBaseline="middle"
    >
      ${value.toLocaleString()}
    </text>
  );
};

const CustomHistBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value == null) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#1f2937"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={8}
      fontWeight="bold"
    >
      ${value.toLocaleString()}
    </text>
  );
};

const CustomLineLabel = (props: any) => {
  const { x, y, index, value } = props;
  const data = historicalData[index];
  if (!data || value == null) return null;
  const isYear2026 = data.year === '2026';

  if (isYear2026) {
    return (
      <text x={x} y={y + 12} fill="#005274" textAnchor="middle" fontSize={8} fontWeight="bold">
        ${value.toLocaleString()}
      </text>
    );
  }

  return (
    <g>
      {data.percentage && (
        <text x={x} y={y - 14} fill="#005274" textAnchor="middle" fontSize={7.5} fontWeight="bold">
          {data.percentage}
        </text>
      )}
      <text x={x} y={y - 5} fill="#005274" textAnchor="middle" fontSize={8} fontWeight="bold">
        ${value.toLocaleString()}
      </text>
    </g>
  );
};

const ReportHeader = () => (
  <div className="flex items-center justify-between border-b-2 border-[#005274] pb-2 mb-3">
    <div className="flex items-center gap-2.5">
      <img
        src={IDB_LOGO_BASE64}
        alt="IDB"
        className="h-6 object-contain"
      />
      <span className="text-base font-black tracking-tight text-[#005274]">BID</span>
      <span className="text-zinc-400">|</span>
      <h1 className="text-sm font-bold text-[#005274] tracking-tight">
        FMM Operations Report – Active Portfolio
      </h1>
    </div>
    <div className="text-[11px] font-semibold text-zinc-600">
      16-June-26
    </div>
  </div>
);

export const PdfReportTemplate = React.forwardRef<HTMLDivElement, {}>(function PdfReportTemplate(props, ref) {
  return (
    <div ref={ref} className="text-black bg-white font-sans text-xs leading-normal">
      {/* ========================================================================= */}
      {/* PAGE 1: A4 (w-[210mm] p-[20mm])                                          */}
      {/* ========================================================================= */}
      <div id="pdf-page-1" className="w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] overflow-hidden bg-white text-black p-[20mm] box-border flex flex-col justify-between">
        <div>
          {/* Header */}
          <ReportHeader />

          {/* Sección 1: Active portfolio overview */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Active portfolio overview
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1.5">
              FMM has <strong className="text-zinc-900 font-bold">48</strong> projects for{' '}
              <strong className="text-zinc-900 font-bold">$4,361 M</strong>, representing 30% of IFD’s active portfolio.
            </p>

            <div className="flex items-center justify-between gap-2 bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              {/* Donut 1: IDB */}
              <div className="flex flex-col items-center w-[310px]">
                <h3 className="text-[9.5px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  IDB: Current Approved Amount ($M, %), by Department (INV and PBL)
                </h3>
                <PieChart width={310} height={118}>
                  <Pie
                    data={idbData}
                    cx="50%"
                    cy="50%"
                    innerRadius={26}
                    outerRadius={46}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    label={renderCustomizedPieLabel}
                    labelLine={false}
                    startAngle={47}
                    endAngle={-313}
                    isAnimationActive={false}
                  >
                    {idbData.map((entry, index) => (
                      <Cell key={`cell-idb-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              {/* Donut 2: IFD */}
              <div className="flex flex-col items-center w-[310px]">
                <h3 className="text-[9.5px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  IFD: Current Approved Amount ($M, %), by Division (INV and PBL)
                </h3>
                <PieChart width={310} height={118}>
                  <Pie
                    data={ifdData}
                    cx="50%"
                    cy="50%"
                    innerRadius={26}
                    outerRadius={46}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    label={(p) => renderCustomizedPieLabel({ ...p, isRightChart: true })}
                    labelLine={false}
                    startAngle={58}
                    endAngle={-302}
                    isAnimationActive={false}
                  >
                    {ifdData.map((entry, index) => (
                      <Cell
                        key={`cell-ifd-${index}`}
                        fill={entry.name === 'FMM' ? '#FFC000' : '#005173'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          </section>

          {/* Sección 2: Current disbursement */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Current disbursement
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1">
              From a total approved amount of <strong className="text-zinc-900 font-bold">$4,361 M</strong>, the division has disbursed <strong className="text-zinc-900 font-bold">$1,565 M</strong> (36%), with a balance of <strong className="text-zinc-900 font-bold">$2,796 M</strong> undisbursed.
            </p>
            <div className="bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              <h3 className="text-[9.5px] font-bold text-[#005173] text-center mb-0.5">
                IFD: Undisbursed and Disbursed Amount ($M, %), by Division (INV and PBL, all Stages)
              </h3>
              <ComposedChart
                width={630}
                height={125}
                data={allStagesBarData}
                margin={{ top: 12, right: 25, left: 10, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 9.5, fontWeight: 'bold' }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 8 }} domain={[0, 7000]} ticks={[0, 2000, 4000, 7000]} width={36} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 8 }} domain={[0, 65]} ticks={[0, 25, 50, 65]} width={22} />
                <Bar yAxisId="left" dataKey="disbursedAmount" stackId="a" fill="#005173" isAnimationActive={false}>
                  <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" fontSize={8} formatter={(v: any) => `$${v}`} />
                </Bar>
                <Bar yAxisId="left" dataKey="undisbursedAmount" stackId="a" fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5} isAnimationActive={false}>
                  <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" fontSize={8} formatter={(v: any) => `$${v}`} />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="numberOfProjects" stroke="none" dot={{ r: 3.5, fill: '#FFC400', stroke: '#d97706', strokeWidth: 1 }} isAnimationActive={false}>
                  <LabelList dataKey="numberOfProjects" position="top" fill="#000000" fontWeight="bold" fontSize={8} offset={3} />
                </Line>
              </ComposedChart>
              <div className="flex items-center justify-center gap-4 text-[8px] font-semibold text-zinc-600 mt-0.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#005173] inline-block"></span> Disbursed Life Amount ($M)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-200 border border-zinc-400 inline-block"></span> Undisbursed Amount ($M)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FFC400] rounded-full inline-block"></span> Number of Projects</span>
              </div>
            </div>
          </section>

          {/* Sección 3: Lending instruments and stages */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Lending instruments and stages
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1">
              The 48 operations consist of 1 PBL for $600 M and 47 Investment Loans (INV) for $3,761 M. The 47 INV operations comprise 6 operations in Stage I, 37 in Stage II, and 4 in Stage III.
            </p>
            <div className="flex items-center justify-between gap-2 bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              {/* Chart 3a */}
              <div className="flex flex-col items-center w-[305px]">
                <h3 className="text-[9px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  FMM: Breakdown by Lending Instrument & Stage
                </h3>
                <BarChart width={305} height={120} data={activePortfolioData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }} barCategoryGap="28%">
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#374151' }} axisLine={{ stroke: '#e4e4e7' }} tickLine={false} />
                  <YAxis hide domain={[0, 60]} />
                  <Bar dataKey="visualBottom" stackId="a" fill="#005173" isAnimationActive={false}>
                    <LabelList dataKey="bottomLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                  </Bar>
                  <Bar dataKey="visualMiddle" stackId="a" fill="#005173" isAnimationActive={false}>
                    <LabelList dataKey="middleLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                  </Bar>
                  <Bar dataKey="visualTop" stackId="a" fill="#A6B3BC" isAnimationActive={false}>
                    {activePortfolioData.map((_, index) => (
                      <Cell key={`cell-top-${index}`} fill={index === 1 ? '#005173' : '#A6B3BC'} />
                    ))}
                    <LabelList dataKey="topLabel" content={<CustomStackedLabel fill="#FFFFFF" />} />
                  </Bar>
                </BarChart>
              </div>

              {/* Chart 3b */}
              <div className="flex flex-col items-center w-[315px]">
                <h3 className="text-[9px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  Undisbursed and Disbursed, Stage II/III (only INV)
                </h3>
                <ComposedChart width={315} height={120} data={stage23BarData} margin={{ top: 12, right: 15, left: 10, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 7.5 }} domain={[0, 6000]} ticks={[0, 2000, 4000, 6000]} width={32} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 7.5 }} domain={[0, 50]} ticks={[0, 25, 50]} width={18} />
                  <Bar yAxisId="left" dataKey="disbursedAmount" stackId="a" fill="#005173" isAnimationActive={false}>
                    <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" fontSize={7.5} formatter={(v: any) => `$${v}`} />
                  </Bar>
                  <Bar yAxisId="left" dataKey="undisbursedAmount" stackId="a" fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5} isAnimationActive={false}>
                    <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" fontSize={7.5} formatter={(v: any) => `$${v}`} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="numberOfProjects" stroke="none" dot={{ r: 3, fill: '#FFC400', stroke: '#d97706', strokeWidth: 1 }} isAnimationActive={false}>
                    <LabelList dataKey="numberOfProjects" position="top" fill="#000000" fontWeight="bold" fontSize={7.5} offset={3} />
                  </Line>
                </ComposedChart>
              </div>
            </div>
          </section>

          {/* Sección 4: Portfolio Age */}
          <section>
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Portfolio age
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1">
              The FMM active portfolio has an average age of 4.8 years, above the IDB (4.6) and the IFD department (4.1) averages. Currently, <strong className="text-zinc-900 font-bold">38%</strong> of the projects have exceeded 5 years in execution, and <strong className="text-zinc-900 font-bold">35%</strong> have requested extensions.
            </p>
            <div className="bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              <h3 className="text-[9.5px] font-bold text-[#005173] text-center mb-0.5">
                IFD: Average Portfolio Age (in years) in 2026, by Division (INV and PBL)
              </h3>
              <BarChart width={630} height={105} data={ageData} margin={{ top: 15, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 9.5, fontWeight: 'bold' }} />
                <YAxis hide domain={[0, 6]} />
                <ReferenceLine segment={[{ x: 'CIS', y: 4.6 }, { x: 'CMF', y: 4.6 }]} stroke="#FFC000" strokeDasharray="3 3" strokeWidth={1.5} label={{ position: 'top', value: 'IDB (4.6)', fill: '#b45309', fontSize: 8, fontWeight: 'bold' }} />
                <ReferenceLine segment={[{ x: 'CIS', y: 4.1 }, { x: 'CMF', y: 4.1 }]} stroke="#0284c7" strokeDasharray="3 3" strokeWidth={1.5} label={{ position: 'top', value: 'IFD (4.1)', fill: '#0284c7', fontSize: 8, fontWeight: 'bold' }} />
                <Bar dataKey="age" fill="#005274" barSize={26} isAnimationActive={false}>
                  <LabelList dataKey="age" content={<CustomAgeLabel />} />
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-age-${index}`} fill={entry.name === 'FMM' ? '#005274' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
              <div className="flex items-center justify-center gap-4 text-[8px] font-semibold text-zinc-600 mt-0.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#005274] inline-block"></span> Divisions</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t border-dashed border-[#0284c7] inline-block"></span> IFD Average (4.1)</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t border-dashed border-[#FFC000] inline-block"></span> IDB Average (4.6)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Page 1 */}
        <div className="text-[9px] text-zinc-400 flex justify-between border-t border-zinc-200 pt-1 mt-1">
          <span>Inter-American Development Bank · Fiscal Management Division (IFD/FMM)</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: A4 (w-[210mm] p-[20mm] break-before-page)                        */}
      {/* ========================================================================= */}
      <div id="pdf-page-2" className="w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] overflow-hidden bg-white text-black p-[20mm] box-border flex flex-col justify-between break-before-page">
        <div>
          {/* Header */}
          <ReportHeader />

          {/* Sección 5: Geographic breakdown */}
          <section className="mb-4">
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Geographic breakdown
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1.5">
              Brazil holds the largest share of FMM's portfolio with $1,802M allocated across 21 projects. In terms of execution, Belize has the highest disbursement rate at 75%, followed by Brazil (58%) and Peru (47%). FMM operations span 12 countries.
            </p>

            {/* Gráfico 5a: Montos totales por país */}
            <div className="bg-zinc-50/60 p-1.5 rounded border border-zinc-200 mb-2">
              <h3 className="text-[9.5px] font-bold text-[#005173] text-center mb-0.5">
                FMM: Current Approved Amount ($M) and Projects, by Country (only INV)
              </h3>
              <BarChart
                width={630}
                height={155}
                data={geoImpactData}
                margin={{ top: 15, right: 10, left: 5, bottom: 15 }}
                barCategoryGap="18%"
              >
                <XAxis dataKey="country" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#374151', fontSize: 8.5, fontWeight: 'bold' }} interval={0} />
                <YAxis tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 7.5 }} width={35} />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]} isAnimationActive={false} fill="#005274">
                  <LabelList content={<CustomCountryBarLabel />} />
                  {geoImpactData.map((entry, index) => (
                    <Cell key={`cell-country-${index}`} fill={entry.country === 'BR' ? '#005274' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </div>

            {/* Gráfico 5b: Porcentajes de desembolso por país (Horizontal apilado) */}
            <div className="bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              <h3 className="text-[9.5px] font-bold text-[#005173] text-center mb-0.5">
                FMM: Disbursed and Undisbursed Amount (%), by Country (only INV)
              </h3>
              <BarChart
                layout="vertical"
                width={630}
                height={165}
                data={sortedForHorizontal}
                margin={{ top: 2, right: 20, left: 10, bottom: 0 }}
                barCategoryGap="15%"
              >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  reversed={true}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 8, fontWeight: 'bold' }}
                  width={65}
                  interval={0}
                />
                <Bar dataKey="disbursed" stackId="a" fill="#005274" isAnimationActive={false}>
                  <LabelList dataKey="disbursed" content={<CustomStackedLabel textColor="#ffffff" />} />
                </Bar>
                <Bar dataKey="undisbursed" stackId="a" fill="url(#diagonalHatchPrint)" stroke="#cbd5e1" strokeWidth={0.5} isAnimationActive={false}>
                  <LabelList dataKey="undisbursed" content={<CustomStackedLabel textColor="#000000" />} />
                </Bar>
              </BarChart>
              <div className="flex items-center justify-center gap-4 text-[8px] font-semibold text-zinc-600 mt-0.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#005274] inline-block"></span> Disbursed Life Amount (%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-200 border border-zinc-400 inline-block"></span> Undisbursed Amount (%)</span>
              </div>
            </div>
          </section>

          {/* Sección 6: Historical disbursements */}
          <section>
            <h2 className="text-xs font-bold text-[#005274] uppercase tracking-wide mb-1">
              Historical disbursements
            </h2>
            <p className="text-[11px] text-zinc-700 leading-snug mb-1.5">
              In 2025, FMM’s disbursements reached <strong className="text-zinc-900 font-bold">$2,502 M</strong>, outperforming the annual projection by 17%. For 2026, FMM projected <strong className="text-zinc-900 font-bold">$960 M</strong> in total disbursements, with <strong className="text-zinc-900 font-bold">$630 M</strong> (66%) disbursed year-to-date.
            </p>

            <div className="flex items-center justify-between gap-2 bg-zinc-50/60 p-1.5 rounded border border-zinc-200">
              {/* Gráfico 6a: IFD Disbursements 2026 */}
              <div className="flex flex-col items-center w-[310px]">
                <h3 className="text-[9px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  IFD: Disbursements ($M) in 2026, by Division
                </h3>
                <BarChart
                  layout="vertical"
                  width={310}
                  height={155}
                  data={ifdDisbursementsData}
                  margin={{ top: 5, right: 35, left: 5, bottom: 0 }}
                  barGap={1.5}
                >
                  <XAxis type="number" hide domain={[0, 1500]} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 9, fontWeight: 'bold' }} width={30} />
                  <Bar dataKey="baseline" barSize={7} fill="url(#diagonalHatchPrint)" stroke="#94a3b8" strokeWidth={0.5} isAnimationActive={false}>
                    <LabelList content={<CustomIFDBarLabel offset={-8} />} />
                  </Bar>
                  <Bar dataKey="actual" barSize={7} fill="#e4e4e7" isAnimationActive={false}>
                    <LabelList content={<CustomIFDBarLabel offset={-8} />} />
                  </Bar>
                  <Bar dataKey="disbursed" barSize={10} fill="#005274" isAnimationActive={false}>
                    <LabelList content={<CustomIFDBarLabel />} />
                  </Bar>
                </BarChart>
                <div className="flex items-center justify-center gap-2.5 text-[7.5px] font-semibold text-zinc-600 mt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-200 border border-zinc-400 inline-block"></span> Baseline ($M)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#e4e4e7] inline-block"></span> Actual Proj ($M)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#005274] inline-block"></span> Disbursed ($M)</span>
                </div>
              </div>

              {/* Gráfico 6b: FMM Historical Disbursements */}
              <div className="flex flex-col items-center w-[315px]">
                <h3 className="text-[9px] font-bold text-[#005173] text-center leading-tight mb-0.5">
                  FMM: Historical Disbursements ($M), by Year
                </h3>
                <ComposedChart
                  width={315}
                  height={155}
                  data={historicalData}
                  margin={{ top: 22, right: 15, bottom: 0, left: 10 }}
                >
                  <XAxis dataKey="year" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#374151', fontSize: 8.5, fontWeight: 'bold' }} dy={3} />
                  <YAxis hide domain={[0, 3600]} />
                  <Bar dataKey="projection" barSize={18} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.5} isAnimationActive={false} label={<CustomHistBarLabel />} />
                  <Line type="natural" dataKey="disbursed" stroke="#005274" strokeWidth={1.8} dot={{ r: 2.5, fill: '#005274', strokeWidth: 0 }} isAnimationActive={false} label={<CustomLineLabel />} />
                  <Line type="natural" dataKey="projected_disbursed" stroke="#005274" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2.5, fill: '#005274', strokeWidth: 0 }} isAnimationActive={false} label={<CustomLineLabel />} />
                </ComposedChart>
                <div className="flex items-center justify-center gap-2.5 text-[7.5px] font-semibold text-zinc-600 mt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-200 border border-zinc-400 inline-block"></span> Projection ($M)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#005274] inline-block"></span> Disbursed</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t border-dotted border-[#005274] inline-block"></span> Projected Disb.</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Page 2 */}
        <div className="text-[9px] text-zinc-400 flex justify-between border-t border-zinc-200 pt-1 mt-1">
          <span>Inter-American Development Bank · Fiscal Management Division (IFD/FMM)</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
});

export default PdfReportTemplate;
