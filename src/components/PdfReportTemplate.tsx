import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line, LabelList, ReferenceLine
} from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { useDashboardMetrics, DEFAULT_METRICS } from '../hooks/useDashboardMetrics';
import geoData from '../data/countries-110m.json';
import { IDB_LOGO_WHITE_BASE64 } from '../utils/idbLogo';
import { COUNTRY_FLAG_BASE64 } from '../utils/countryFlags';

// List of Latin American and Caribbean countries for pristine map display
const LATAM_COUNTRIES = [
  'Mexico', 'Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama',
  'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'Ecuador', 'Peru', 'Brazil', 'Bolivia', 'Paraguay',
  'Chile', 'Argentina', 'Uruguay', 'Cuba', 'Dominican Rep.', 'Haiti', 'Jamaica', 'Trinidad and Tobago', 'Bahamas'
];

// Default datasets with exact institutional values
const defaultIdbData = [
  { name: 'INE', value: 23972, percentage: 42, fill: '#A9B3BC' },
  { name: 'IFD', value: 14609, percentage: 26, fill: '#004b6b' },
  { name: 'SCL', value: 10268, percentage: 18, fill: '#A9B3BC' },
  { name: 'CSD', value: 4214, percentage: 7, fill: '#A9B3BC' },
  { name: 'PTI', value: 4091, percentage: 7, fill: '#A9B3BC' },
];

const defaultIfdData = [
  { name: 'CMF', value: 6703, percentage: 46, fill: '#004b6b' },
  { name: 'FMM', value: 4361, percentage: 30, fill: '#FFC000' },
  { name: 'ICS', value: 2476, percentage: 17, fill: '#004b6b' },
  { name: 'CIS', value: 1069, percentage: 7, fill: '#004b6b' },
];

const defaultAllStagesBarData = [
  { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 2796, numberOfProjects: 48, disbursedPct: 36, undisbursedPct: 64 },
  { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 642, numberOfProjects: 17, disbursedPct: 40, undisbursedPct: 60 },
  { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 3886, numberOfProjects: 50, disbursedPct: 42, undisbursedPct: 58 },
  { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 1455, numberOfProjects: 48, disbursedPct: 41, undisbursedPct: 59 },
];

const defaultStage23BarData = [
  { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 1216, numberOfProjects: 41, disbursedPct: 56, undisbursedPct: 44 },
  { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 439, numberOfProjects: 15, disbursedPct: 49, undisbursedPct: 51 },
  { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 1933, numberOfProjects: 41, disbursedPct: 59, undisbursedPct: 41 },
  { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 951, numberOfProjects: 39, disbursedPct: 52, undisbursedPct: 48 },
];

const defaultAgeData = [
  { name: 'CIS', age: 5.2 },
  { name: 'FMM', age: 4.8 },
  { name: 'ICS', age: 4.2 },
  { name: 'CMF', age: 3.3 },
];

const defaultGeoCountries = [
  { country: 'BR', name: 'Brazil', amount: 2048, projects: 23, flagCode: 'br', region: 'CSC' },
  { country: 'AR', name: 'Argentina', amount: 1154, projects: 5, flagCode: 'ar', region: 'CSC' },
  { country: 'UR', name: 'Uruguay', amount: 130, projects: 3, flagCode: 'uy', region: 'CSC' },
  { country: 'PR', name: 'Paraguay', amount: 55, projects: 2, flagCode: 'py', region: 'CSC' },
  { country: 'CH', name: 'Chile', amount: 20, projects: 1, flagCode: 'cl', region: 'CSC' },
  { country: 'CO', name: 'Colombia', amount: 300, projects: 2, flagCode: 'co', region: 'CAN' },
  { country: 'PE', name: 'Peru', amount: 204, projects: 4, flagCode: 'pe', region: 'CAN' },
  { country: 'EC', name: 'Ecuador', amount: 84, projects: 1, flagCode: 'ec', region: 'CAN' },
  { country: 'SU', name: 'Suriname', amount: 50, projects: 1, flagCode: 'sr', region: 'CCB' },
  { country: 'ME', name: 'Mexico', amount: 500, projects: 1, flagCode: 'mx', region: 'CID' },
  { country: 'PN', name: 'Panama', amount: 60, projects: 2, flagCode: 'pa', region: 'CID' },
  { country: 'BL', name: 'Belize', amount: 22, projects: 2, flagCode: 'bz', region: 'CCB' },
];

const ifd2026Disbursements = [
  { name: 'ICS', baseline: 286, actual: 287, disbursed: 34 },
  { name: 'CMF', baseline: 891, actual: 906, disbursed: 637 },
  { name: 'CIS', baseline: 229, actual: 425, disbursed: 17 },
  { name: 'FMM', baseline: 960, actual: 1450, disbursed: 630 },
];

const historicalDisbursementsData = [
  { year: '2019', baseline: 1663, disbursed: 1774, projected: null, pct: '+7%' },
  { year: '2020', baseline: 1724, disbursed: 2291, projected: null, pct: '+33%' },
  { year: '2021', baseline: 1512, disbursed: 1662, projected: null, pct: '+10%' },
  { year: '2022', baseline: 2231, disbursed: 2553, projected: null, pct: '+14%' },
  { year: '2023', baseline: 753, disbursed: 1117, projected: null, pct: '+48%' },
  { year: '2024', baseline: 1913, disbursed: 2961, projected: null, pct: '+55%' },
  { year: '2025', baseline: 2131, disbursed: 2502, projected: 2502, pct: '+17%' },
  { year: '2026', baseline: 960, disbursed: null, projected: 1216, pct: null },
];

/**
 * Official IDB Institutional Header Banner
 * - Full-bleed to outer black border (zero white gaps at top/left/right)
 * - Logo IDB reduced 15% (height: 41px)
 * - Main title & date mathematically centered dead-center via absolute side pinning
 * - Slightly squared white box with FMM (54px x 38px, rounded: 4px, not oval)
 */
const ReportHeader: React.FC<{ date?: string }> = ({ date }) => {
  const { data: metrics } = useDashboardMetrics();
  const displayDate = date || metrics?.pdf_date_format || '22-October-26';

  return (
    <div 
      className="relative w-full text-white px-7 py-3 flex items-center justify-center mb-3"
      style={{ 
        backgroundColor: '#004b6b', 
        minHeight: '70px',
        margin: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Official IDB Logo in White (reduced by 20% to 33px height) */}
      <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center">
        <img 
          src={IDB_LOGO_WHITE_BASE64} 
          alt="BID Logo" 
          style={{ height: '33px', width: 'auto', display: 'block' }}
        />
      </div>

      {/* Center: Main Title in Arial 14pt Bold and Date in Arial 11pt - Exactly centered */}
      <div className="text-center flex flex-col items-center justify-center">
        <h1 
          className="text-white tracking-wide leading-tight"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14pt', fontWeight: 'bold' }}
        >
          FMM Operations Report – Active Portfolio
        </h1>
        <p 
          className="text-white/90 font-medium tracking-wide mt-1"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt' }}
        >
          {displayDate}
        </p>
      </div>

      {/* Right: Slightly squared white box with FMM (not oval) */}
      <div 
        className="absolute right-7 top-1/2 -translate-y-1/2 bg-white font-bold tracking-wider flex items-center justify-center shadow-xs"
        style={{ 
          color: '#004b6b', 
          fontFamily: 'Arial, Helvetica, sans-serif', 
          fontSize: '12pt',
          width: '54px',
          height: '38px',
          borderRadius: '4px'
        }}
      >
        FMM
      </div>
    </div>
  );
};

// Donut labels helper
const renderCustomizedPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, percentage, isRightChart } = props;
  const RADIAN = Math.PI / 180;
  const innerRadiusPos = innerRadius + (outerRadius - innerRadius) * 0.5;
  const xInner = cx + innerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yInner = cy + innerRadiusPos * Math.sin(-midAngle * RADIAN);

  const outerRadiusPos = outerRadius + 9;
  const xOuter = cx + outerRadiusPos * Math.cos(-midAngle * RADIAN);
  const yOuter = cy + outerRadiusPos * Math.sin(-midAngle * RADIAN);

  let textColor = '#4b5563';
  if (name === 'IFD' || name === 'FMM') textColor = '#004b6b';

  let textAnchor: 'start' | 'end' | 'middle' = 'middle';
  if (xOuter > cx + 8) textAnchor = 'start';
  else if (xOuter < cx - 8) textAnchor = 'end';

  return (
    <g>
      <text x={xInner} y={yInner} fill={name === 'IFD' || name === 'FMM' || isRightChart ? '#ffffff' : '#374151'} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold">
        {percentage}%
      </text>
      <text x={xOuter} y={yOuter} fill={textColor} textAnchor={textAnchor} dominantBaseline="central" fontSize={9} fontWeight="bold">
        {name}
      </text>
    </g>
  );
};

export const PdfReportTemplate = React.forwardRef<HTMLDivElement, {}>(function PdfReportTemplate(_props, ref) {
  const { data: dashboardMetrics } = useDashboardMetrics();
  const metrics = dashboardMetrics;
  const pdfDateFormat = metrics?.pdf_date_format || '22-October-26';

  // Metrics extraction with dynamic fallbacks
  const totalProjects = Math.round(dashboardMetrics?.hero_total_projects ?? 48);
  const totalAmountM = Math.round(dashboardMetrics?.hero_total_amount_m ?? 4361);
  const fmmPctOfIfd = Math.round(dashboardMetrics?.fmm_pct_of_ifd ?? 30);
  const totalApproved = totalAmountM;

  const disbAmt = Math.round(dashboardMetrics?.disb_fmm_disbursed_amt ?? 1565);
  const undisbAmt = Math.round(dashboardMetrics?.disb_fmm_undisb_amt ?? 2796);
  const disbPct = Math.round(dashboardMetrics?.disb_fmm_disbursed_pct ?? 36);

  const heroTotalCountries = Math.round(dashboardMetrics?.hero_total_countries ?? 12);
  const geoTopCountryName = dashboardMetrics?.geo_top_country_name ?? 'Brazil';
  const geoTopCountryAmt = Math.round(dashboardMetrics?.geo_top_country_amt ?? 1802);
  const geoTopCountryProj = Math.round(dashboardMetrics?.geo_top_country_proj ?? 21);
  const geoRunnerup1Name = dashboardMetrics?.geo_runnerup_1_name ?? 'Belize';
  const geoRunnerup1Pct = Math.round(dashboardMetrics?.geo_runnerup_1_pct ?? 75);
  const geoRunnerup2Name = dashboardMetrics?.geo_runnerup_2_name ?? 'Peru';
  const geoRunnerup2Pct = Math.round(dashboardMetrics?.geo_runnerup_2_pct ?? 47);
  const geoRunnerup3Name = dashboardMetrics?.geo_runnerup_3_name ?? 'Ecuador';
  const geoRunnerup3Pct = Math.round(dashboardMetrics?.geo_runnerup_3_pct ?? 37);

  const pblCount = Math.round(dashboardMetrics?.pbl_count ?? 1);
  const pblAmount = Math.round(dashboardMetrics?.pbl_amount_m ?? 600);
  const invCount = Math.round(dashboardMetrics?.inv_count ?? 47);
  const invAmount = Math.round(dashboardMetrics?.inv_amount_m ?? 3761);

  const invStage1Count = Math.round(dashboardMetrics?.inv_stage_1_count ?? 12);
  const invStage2Count = Math.round(dashboardMetrics?.inv_stage_2_count ?? 33);
  const invStage3Count = Math.round(dashboardMetrics?.inv_stage_3_count ?? 2);
  const totalInv = invStage1Count + invStage2Count + invStage3Count || invCount || 47;

  const ageFmmAvg = dashboardMetrics?.age_fmm_avg ?? 4.8;
  const ageIdbAvg = dashboardMetrics?.age_idb_avg ?? 4.6;
  const ageIfdAvg = dashboardMetrics?.age_ifd_avg ?? 4.1;
  const agePctOver5Yrs = Math.round(dashboardMetrics?.age_pct_over_5_yrs ?? 38);
  const agePctExtensions = Math.round(dashboardMetrics?.age_pct_extensions ?? 35);
  const ageComparisonVsIdb = dashboardMetrics?.age_comparison_vs_idb ?? (ageFmmAvg >= ageIdbAvg ? 'above' : 'below');
  const ageComparisonSentence = dashboardMetrics?.age_comparison_sentence || `${ageComparisonVsIdb} the IDB (${ageIdbAvg.toFixed(1)}) and the IFD department (${ageIfdAvg.toFixed(1)})`;

  const currentIdbData = dashboardMetrics?.df_idb_overview?.length ? dashboardMetrics.df_idb_overview : defaultIdbData;
  const currentIfdData = dashboardMetrics?.df_ifd_overview?.length ? dashboardMetrics.df_ifd_overview : defaultIfdData;
  const currentAllStagesData = dashboardMetrics?.df_disb_all_stages?.length ? dashboardMetrics.df_disb_all_stages : defaultAllStagesBarData;
  const currentStage23Data = dashboardMetrics?.df_disb_stg2_3?.length ? dashboardMetrics.df_disb_stg2_3 : defaultStage23BarData;
  const currentAgeData = dashboardMetrics?.df_age_divisions?.length ? dashboardMetrics.df_age_divisions : defaultAgeData;

  // Geographic Map scale
  const geoImpactData = dashboardMetrics?.df_geo_impact?.length ? dashboardMetrics.df_geo_impact : DEFAULT_METRICS.df_geo_impact;
  const colorScale = useMemo(() => scaleLinear<string>().domain([0, 1802]).range(['#c6dbef', '#005274']), []);

  return (
    <div 
      ref={ref} 
      className="text-[#27272a] font-sans text-xs leading-normal"
      style={{
        fontFamily: "'Aptos', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: Active portfolio overview, Geographic Reach, Current disbursement  */}
      {/* ========================================================================= */}
      <div 
        id="pdf-page-1" 
        className="bid-print-page w-full flex flex-col justify-between mb-8"
        style={{
          border: '1.5px solid #000000',
          backgroundColor: '#FAFAFA',
          boxSizing: 'border-box',
          minHeight: '1070px',
          width: '794px',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div>
          {/* 1. Official Header: Flush with top/left/right border (zero white gap) */}
          <ReportHeader date={pdfDateFormat} />

          {/* Body content with padding */}
          <div className="px-6 pb-4">
            {/* Spacing / Enter before Active portfolio overview */}
            <div className="h-3" />

            {/* SECTION 1: Active portfolio overview */}
            <section className="mb-3">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Active portfolio overview
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                FMM has {totalProjects} projects for ${totalAmountM.toLocaleString()} M, representing {fmmPctOfIfd}% of IFD's active portfolio.
              </p>

              {/* Direct layout without white boxes/borders */}
              <div className="flex items-center justify-between gap-6 py-1">
                {/* Donut 1: IDB */}
                <div className="flex flex-col items-center w-[335px]">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center leading-tight mb-1">
                    IDB: Current Approved Amount ($M, %), by Department<br />(INV and PBL)
                  </h3>
                  <PieChart width={335} height={165}>
                    <Pie
                      data={currentIdbData}
                      cx="50%"
                      cy={75}
                      innerRadius={33}
                      outerRadius={58}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      label={renderCustomizedPieLabel}
                      labelLine={false}
                      startAngle={47}
                      endAngle={-313}
                      isAnimationActive={false}
                    >
                      {currentIdbData.map((entry: any, index: number) => (
                        <Cell key={`cell-idb-${index}`} fill={entry.fill || (entry.name === 'IFD' ? '#004b6b' : '#A9B3BC')} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>

                {/* Donut 2: IFD - Enter before (INV and PBL) */}
                <div className="flex flex-col items-center w-[335px]">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center leading-tight mb-1">
                    IFD: Current Approved Amount ($M, %), by Division<br />(INV and PBL)
                  </h3>
                  <PieChart width={335} height={165}>
                    <Pie
                      data={currentIfdData}
                      cx="50%"
                      cy={75}
                      innerRadius={33}
                      outerRadius={58}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      label={(p) => renderCustomizedPieLabel({ ...p, isRightChart: true })}
                      labelLine={false}
                      startAngle={58}
                      endAngle={-302}
                      isAnimationActive={false}
                    >
                      {currentIfdData.map((entry: any, index: number) => (
                        <Cell key={`cell-ifd-${index}`} fill={entry.name === 'FMM' ? '#FFC000' : '#004b6b'} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>
            </section>

            {/* SECTION 2: Geographic Reach */}
            <section className="mb-4">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Geographic Reach
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                FMM operations span {heroTotalCountries} countries. {geoTopCountryName} holds the largest share of FMM's portfolio with ${geoTopCountryAmt.toLocaleString()}M allocated across {geoTopCountryProj} projects. In terms of execution, {geoRunnerup1Name} has the highest disbursement rate at {geoRunnerup1Pct}%, followed by {geoRunnerup2Name} ({geoRunnerup2Pct}%) and {geoRunnerup3Name} ({geoRunnerup3Pct}%).
              </p>

              {/* Direct layout: Complete Map from Mexico to Argentina and Brazil */}
              <div className="flex items-center justify-between gap-4 py-1">
                {/* Left Column: Complete Latin America Map (scale tuned to show entire continent) */}
                <div className="w-[305px] flex flex-col items-center">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-1">
                    Where are we driving impact?
                  </h3>
                  <div className="relative w-[305px] h-[225px] flex items-center justify-center overflow-hidden">
                    <ComposableMap
                      projection="geoAzimuthalEqualArea"
                      projectionConfig={{ rotate: [70, 15, 0], scale: 135 }}
                      width={310}
                      height={225}
                      className="w-full h-full"
                    >
                      <ZoomableGroup center={[-68, -13]} zoom={1}>
                        <Geographies geography={geoData}>
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              if (!LATAM_COUNTRIES.includes(geo.properties.name)) return null;
                              const d = geoImpactData.find((s) => s.name === geo.properties.name);
                              const isBrazil = d?.country === 'BR';
                              const isParaguay = d?.country === 'PR';
                              let fillColor = '#e2e8f0';
                              if (isBrazil) fillColor = '#005274';
                              else if (isParaguay) fillColor = '#0284c7';
                              else if (d) fillColor = colorScale(d.amount);

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={fillColor}
                                  stroke="#ffffff"
                                  strokeWidth={0.5}
                                  style={{
                                    default: { outline: 'none' },
                                    hover: { outline: 'none' },
                                    pressed: { outline: 'none' }
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ZoomableGroup>
                    </ComposableMap>

                    {/* Floating Investment Amount Legend placed safely in Atlantic Ocean (bottom-right) */}
                    <div className="absolute bottom-2 right-2 bg-white/95 px-3 py-2 rounded-lg border border-zinc-200 text-[7pt] shadow-xs pointer-events-none">
                      <div className="text-center font-bold text-zinc-900 text-[7.5pt] mb-1.5">
                        Investment Amount <span className="text-zinc-500 font-normal text-[7pt]">($M)</span>
                      </div>
                      <div 
                        className="w-[110px] h-[7px] mb-1" 
                        style={{ 
                          background: 'linear-gradient(to right, #c6dbef, #005274)',
                          borderRadius: 0,
                        }}
                      />
                      <div className="flex justify-between text-zinc-600 text-[6.5pt] font-semibold px-0.5">
                        <span>$0</span>
                        <span>$901</span>
                        <span>$1,802</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Bar chart by Region and Country */}
                <div className="w-[370px] flex flex-col items-center">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-1">
                    FMM: Current Approved Amount ($M) and Number of Projects, by Region and Country (only INV)
                  </h3>
                  <BarChart
                    width={370}
                    height={225}
                    data={geoImpactData}
                    margin={{ top: 22, right: 10, left: 18, bottom: 25 }}
                    barCategoryGap="16%"
                  >
                    <XAxis
                      dataKey="country"
                      axisLine={{ stroke: '#d4d4d8' }}
                      tickLine={false}
                      interval={0}
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        const c = geoImpactData.find(d => d.country === payload.value || (payload.value === 'MX' && d.country === 'ME') || (payload.value === 'ME' && d.country === 'MX'));
                        const isRegionHeader = ['UR', 'PE', 'SU', 'PN'].includes(payload.value) || ['UR', 'PE', 'SU', 'PN'].includes(c?.country || '');
                        const flagCode = c?.flagCode || (payload.value === 'ME' ? 'mx' : payload.value?.toLowerCase());
                        const flagSrc = (flagCode && COUNTRY_FLAG_BASE64[flagCode]) || `https://flagcdn.com/w40/${flagCode}.png`;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <image
                              href={flagSrc}
                              x={-6.5}
                              y={2.5}
                              width={13}
                              height={9}
                            />
                            <text x={0} y={18} textAnchor="middle" fill="#52525b" fontSize={6} fontWeight="500">
                              {c?.name}
                            </text>
                            {isRegionHeader && (
                              <text x={0} y={26} textAnchor="middle" fill="#71717a" fontSize={6.5} fontWeight="bold">
                                {c?.region}
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      tickFormatter={(v) => `$${v}`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontSize: 7 }}
                      domain={[0, 2500]}
                      ticks={[0, 500, 1000, 1500, 2000, 2500]}
                      width={28}
                    />
                    <Bar dataKey="amount" fill="#004b6b" radius={[1.5, 1.5, 0, 0]} stroke="none" strokeWidth={0} isAnimationActive={false}>
                      <LabelList
                        dataKey="amount"
                        position="top"
                        formatter={(v: any) => `$${typeof v === 'number' ? v.toLocaleString() : v}`}
                        fill="#374151"
                        fontSize={7}
                        fontWeight="bold"
                      />
                      {geoImpactData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.country === 'BR' ? '#004b6b' : '#0284c7'} stroke="none" strokeWidth={0} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </div>
            </section>

            {/* SECTION 3: Current disbursement */}
            <section className="mb-1">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Current disbursement
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                From a total approved amount of ${totalApproved.toLocaleString()} M, the division has disbursed ${disbAmt.toLocaleString()} M ({disbPct}%), with a balance of ${undisbAmt.toLocaleString()} M undisbursed. When isolating INV operations in Stage II and III, FMM reaches a disbursement rate of 56%.
              </p>

              {/* Direct layout: NO border on bars, NO border on yellow dots, landing page hatch style, NO dividing gray line, separate duplicate legends on 1 line */}
              <div className="py-1">
                <div className="flex items-center justify-between gap-6">
                  {/* Chart 3a: All Stages with its own legend below */}
                  <div className="w-[335px] flex flex-col items-center">
                    <h3 className="text-[8.5pt] font-bold text-[#004b6b] text-center mb-1">
                      IFD: Undisbursed and Disbursed Amount ($M, %), by Division (INV and PBL, all Stages)
                    </h3>
                    <ComposedChart
                      width={335}
                      height={165}
                      data={currentAllStagesData}
                      margin={{ top: 16, right: 15, left: 15, bottom: 0 }}
                      barCategoryGap="25%"
                    >
                      <defs>
                        <pattern id="diagonalHatchCurrentA" patternUnits="userSpaceOnUse" width="4" height="4">
                          <rect width="4" height="4" fill="#ffffff" />
                          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                        </pattern>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 8.5, fontWeight: 'bold' }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 7 }} domain={[0, 7000]} ticks={[0, 1000, 3000, 5000, 7000]} width={28} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 7 }} domain={[0, 65]} ticks={[0, 15, 30, 45, 65]} width={16} />
                      <Bar yAxisId="left" dataKey="disbursedAmount" stackId="a" fill="#005173" stroke="none" strokeWidth={0} isAnimationActive={false}>
                        <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" fontSize={7} formatter={(v: any) => `$${v}`} />
                      </Bar>
                      <Bar yAxisId="left" dataKey="undisbursedAmount" stackId="a" fill="url(#diagonalHatchCurrentA)" stroke="none" strokeWidth={0} isAnimationActive={false}>
                        <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" fontSize={7} formatter={(v: any) => `$${v}`} />
                      </Bar>
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="numberOfProjects" 
                        stroke="none" 
                        isAnimationActive={false}
                        dot={(p: any) => <circle key={`dot-3a-${p.index}`} cx={p.cx} cy={p.cy} r={4} fill="#FFC000" stroke="none" strokeWidth={0} />}
                      >
                        <LabelList dataKey="numberOfProjects" position="top" fill="#000000" fontWeight="bold" fontSize={7} offset={4} />
                      </Line>
                    </ComposedChart>

                    {/* Chart 3a Legend strictly in 1 single line */}
                    <div className="flex items-center justify-center gap-2 text-[6.5pt] font-medium text-zinc-700 mt-2 whitespace-nowrap">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 bg-[#005173] inline-block shrink-0"></span> Disbursed Life Amount ($M)
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg width="10" height="10" className="inline-block shrink-0">
                          <defs>
                            <pattern id="hatchLeg3a" patternUnits="userSpaceOnUse" width="4" height="4">
                              <rect width="4" height="4" fill="#ffffff" />
                              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                            </pattern>
                          </defs>
                          <rect width="10" height="10" fill="url(#hatchLeg3a)" stroke="#d4d4d8" strokeWidth="0.5" />
                        </svg>
                        Undisbursed Amount ($M)
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg width="9" height="9" className="inline-block shrink-0">
                          <circle cx="4.5" cy="4.5" r="3.5" fill="#FFC000" stroke="none" />
                        </svg>
                        Number of Projects
                      </span>
                    </div>
                  </div>

                  {/* Chart 3b: Stage II and III with its own legend below */}
                  <div className="w-[335px] flex flex-col items-center">
                    <h3 className="text-[8.5pt] font-bold text-[#004b6b] text-center mb-1">
                      IFD: Undisbursed and Disbursed Amount ($M, %), by Division (only INV, Stage II and III)
                    </h3>
                    <ComposedChart
                      width={335}
                      height={165}
                      data={currentStage23Data}
                      margin={{ top: 16, right: 15, left: 15, bottom: 0 }}
                      barCategoryGap="25%"
                    >
                      <defs>
                        <pattern id="diagonalHatchCurrentB" patternUnits="userSpaceOnUse" width="4" height="4">
                          <rect width="4" height="4" fill="#ffffff" />
                          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                        </pattern>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 8.5, fontWeight: 'bold' }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 7 }} domain={[0, 6000]} ticks={[0, 2000, 4000, 6000]} width={28} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 7 }} domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} width={16} />
                      <Bar yAxisId="left" dataKey="disbursedAmount" stackId="a" fill="#005173" stroke="none" strokeWidth={0} isAnimationActive={false}>
                        <LabelList dataKey="disbursedAmount" position="center" fill="#FFFFFF" fontWeight="bold" fontSize={7} formatter={(v: any) => `$${v}`} />
                      </Bar>
                      <Bar yAxisId="left" dataKey="undisbursedAmount" stackId="a" fill="url(#diagonalHatchCurrentB)" stroke="none" strokeWidth={0} isAnimationActive={false}>
                        <LabelList dataKey="undisbursedAmount" position="center" fill="#000000" fontWeight="bold" fontSize={7} formatter={(v: any) => `$${v}`} />
                      </Bar>
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="numberOfProjects" 
                        stroke="none" 
                        isAnimationActive={false}
                        dot={(p: any) => <circle key={`dot-3b-${p.index}`} cx={p.cx} cy={p.cy} r={4} fill="#FFC000" stroke="none" strokeWidth={0} />}
                      >
                        <LabelList dataKey="numberOfProjects" position="top" fill="#000000" fontWeight="bold" fontSize={7} offset={4} />
                      </Line>
                    </ComposedChart>

                    {/* Chart 3b Legend strictly in 1 single line */}
                    <div className="flex items-center justify-center gap-2 text-[6.5pt] font-medium text-zinc-700 mt-2 whitespace-nowrap">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 bg-[#005173] inline-block shrink-0"></span> Disbursed Life Amount ($M)
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg width="10" height="10" className="inline-block shrink-0">
                          <defs>
                            <pattern id="hatchLeg3b" patternUnits="userSpaceOnUse" width="4" height="4">
                              <rect width="4" height="4" fill="#ffffff" />
                              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                            </pattern>
                          </defs>
                          <rect width="10" height="10" fill="url(#hatchLeg3b)" stroke="#d4d4d8" strokeWidth="0.5" />
                        </svg>
                        Undisbursed Amount ($M)
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg width="9" height="9" className="inline-block shrink-0">
                          <circle cx="4.5" cy="4.5" r="3.5" fill="#FFC000" stroke="none" />
                        </svg>
                        Number of Projects
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: Historical Disbursements, Lending Instruments, Portfolio Age      */}
      {/* ========================================================================= */}
      <div 
        id="pdf-page-2" 
        className="bid-print-page bid-print-page-break w-full flex flex-col justify-between"
        style={{
          border: '1.5px solid #000000',
          backgroundColor: '#FAFAFA',
          boxSizing: 'border-box',
          minHeight: '1070px',
          width: '794px',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div>
          {/* 1. Official Header: Flush with top/left/right border (zero white gap) */}
          <ReportHeader date={pdfDateFormat} />

          <div className="px-6 pb-4">
            {/* Spacing / Enter before Historical Disbursements */}
            <div className="h-5" />

            {/* SECTION 4: Historical Disbursements */}
            <section className="mb-4">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Historical Disbursements
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                In 2025, FMM's disbursements reached $2,502 M, outperforming the annual projection by 17%. For 2026, FMM projected $960 M in total disbursements, with $1,216 M disbursed year-to-date.
              </p>

              {/* Direct layout: NO dividing gray lines above legends, NO horizontal dotted lines on right chart */}
              <div className="flex items-start justify-between gap-6 py-1">
                {/* Left Chart: IFD 2026 Disbursements matching Image 4 (3 separate horizontal bars per division) */}
                <div className="w-[335px] flex flex-col items-center">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-2">
                    IFD: Disbursements ($M) in 2026, by Division
                  </h3>
                  <div className="w-full flex flex-col gap-3.5 px-1 py-1">
                    {ifd2026Disbursements.map((item, idx) => (
                      <div key={`ifd-div-${idx}`} className="flex items-center text-[8pt]">
                        {/* Division Name on left */}
                        <span className="w-10 font-bold text-zinc-800 text-[8.5pt]">{item.name}</span>

                        {/* 3 stacked separate bars */}
                        <div className="flex-1 flex flex-col gap-1 mx-2">
                          {/* 1. Baseline Projection Bar (identical SVG diagonal hatch pattern) */}
                          <div className="flex items-center gap-1.5 h-3">
                            <svg width={(item.baseline / 1450) * 190} height="12" className="overflow-hidden shrink-0">
                              <defs>
                                <pattern id={`diagHatchDiv-${idx}`} patternUnits="userSpaceOnUse" width="4" height="4">
                                  <rect width="4" height="4" fill="#ffffff" />
                                  <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                                </pattern>
                              </defs>
                              <rect 
                                width={(item.baseline / 1450) * 190} 
                                height="12" 
                                fill={`url(#diagHatchDiv-${idx})`} 
                                stroke="none" 
                                strokeWidth={0} 
                              />
                            </svg>
                            <span className="text-[7pt] text-zinc-600 font-semibold">${item.baseline.toLocaleString()}</span>
                          </div>

                          {/* 2. Actual Projection Bar (light grey) */}
                          <div className="flex items-center gap-1.5 h-3">
                            <div
                              className="h-full bg-[#e2e8f0]"
                              style={{
                                width: `${(item.actual / 1450) * 190}px`,
                              }}
                            />
                            <span className="text-[7pt] text-zinc-600 font-semibold">${item.actual.toLocaleString()}</span>
                          </div>

                          {/* 3. Disbursed YTD Bar (dark blue) */}
                          <div className="flex items-center gap-1.5 h-3">
                            <div
                              className="h-full bg-[#004b6b]"
                              style={{
                                width: `${(item.disbursed / 1450) * 190}px`,
                              }}
                            />
                            <span className="text-[7pt] text-[#004b6b] font-bold">${item.disbursed.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend strictly in 1 line (no gray line above) */}
                  <div className="flex items-center justify-center gap-2 text-[6.5pt] font-medium text-zinc-600 mt-2.5 w-full whitespace-nowrap">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <svg width="9" height="9" className="inline-block shrink-0">
                        <defs>
                          <pattern id="hatchLegDivHist" patternUnits="userSpaceOnUse" width="4" height="4">
                            <rect width="4" height="4" fill="#ffffff" />
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                          </pattern>
                        </defs>
                        <rect width="9" height="9" fill="url(#hatchLegDivHist)" stroke="none" strokeWidth={0} />
                      </svg>
                      Baseline Projection ($M)
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 bg-[#e2e8f0] inline-block shrink-0"></span> Actual Projection ($M)
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 bg-[#004b6b] inline-block shrink-0"></span> Disbursed Amount YTD ($M)
                    </span>
                  </div>
                </div>

                {/* Right Chart: FMM Historical Disbursements by Year (NO horizontal grid lines, landing page hatch style, investment amount labels) */}
                <div className="w-[345px] flex flex-col items-center">
                  <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-1">
                    FMM: Historical Disbursements ($M), by Year
                  </h3>
                  <ComposedChart
                    width={345}
                    height={195}
                    data={historicalDisbursementsData}
                    margin={{ top: 28, right: 10, left: 10, bottom: 0 }}
                    barCategoryGap="22%"
                  >
                    <defs>
                      <pattern id="diagonalHatchHist" patternUnits="userSpaceOnUse" width="4" height="4">
                        <rect width="4" height="4" fill="#ffffff" />
                        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                      </pattern>
                    </defs>
                    {/* NO horizontal grid lines / CartesianGrid as requested */}
                    <XAxis dataKey="year" axisLine={{ stroke: '#d4d4d8' }} tickLine={false} tick={{ fill: '#374151', fontSize: 8, fontWeight: 'bold' }} />
                    <YAxis hide domain={[0, 3400]} />
                    <Bar dataKey="baseline" fill="url(#diagonalHatchHist)" stroke="none" strokeWidth={0} barSize={22} isAnimationActive={false}>
                      <LabelList
                        dataKey="baseline"
                        position="insideBottom"
                        offset={6}
                        fill="#71717a"
                        fontSize={6.5}
                        fontWeight="500"
                        formatter={(v: any) => `$${v}`}
                      />
                    </Bar>
                    <Line type="natural" dataKey="disbursed" stroke="#004b6b" strokeWidth={2.2} dot={{ r: 3.5, fill: '#004b6b', strokeWidth: 0 }} isAnimationActive={false}>
                      <LabelList
                        content={(props: any) => {
                          const { x, y, index } = props;
                          const d = historicalDisbursementsData[index];
                          if (!d || d.disbursed == null) return null;
                          return (
                            <g>
                              {d.pct && (
                                <text x={x} y={y - 18} fill="#004b6b" textAnchor="middle" fontSize={7} fontWeight="bold">
                                  {d.pct}
                                </text>
                              )}
                              <text x={x} y={y - 7} fill="#18181b" textAnchor="middle" fontSize={7} fontWeight="bold">
                                ${d.disbursed.toLocaleString()}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Line>
                    <Line type="natural" dataKey="projected" stroke="#004b6b" strokeWidth={1.8} strokeDasharray="4 4" dot={{ r: 3.5, fill: '#004b6b', strokeWidth: 0 }} isAnimationActive={false}>
                      <LabelList
                        content={(props: any) => {
                          const { x, y, index } = props;
                          const d = historicalDisbursementsData[index];
                          if (!d || d.year !== '2026') return null;
                          return (
                            <text x={x} y={y - 8} fill="#004b6b" textAnchor="middle" fontSize={7.5} fontWeight="bold">
                              ${d.projected?.toLocaleString()}
                            </text>
                          );
                        }}
                      />
                    </Line>
                  </ComposedChart>

                  {/* Legend strictly in 1 line (no gray line above) */}
                  <div className="flex items-center justify-center gap-2 text-[6.5pt] font-medium text-zinc-600 mt-2.5 w-full whitespace-nowrap">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <svg width="9" height="9" className="inline-block shrink-0">
                        <defs>
                          <pattern id="hatchLegHistRight" patternUnits="userSpaceOnUse" width="4" height="4">
                            <rect width="4" height="4" fill="#ffffff" />
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#A6B3BC" strokeWidth="1" opacity="0.6" />
                          </pattern>
                        </defs>
                        <rect width="9" height="9" fill="url(#hatchLegHistRight)" stroke="#d4d4d8" strokeWidth="0.5" />
                      </svg>
                      Baseline Projection ($M)
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-3 h-0.5 bg-[#004b6b] inline-block shrink-0"></span> Disbursed Amount
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-[#004b6b] inline-block shrink-0"></span> Disbursed Amount YTD ($M)
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: Lending Instruments and Stages (Exact layout matching landing page / Image 3) */}
            <section className="mb-4">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Lending Instruments and Stages
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                Our {totalProjects} projects consists of {pblCount} PBLs for ${pblAmount}M and {invCount} Investment Loans (INV) for ${invAmount.toLocaleString()}M. The {invCount} INV operations comprise {invStage1Count} operations in Stage I, {invStage2Count} in Stage II, and {invStage3Count} in Stage III.
              </p>

              {/* Exact Landing Page Layout (Image 3): Clean 2-column stacked bars on baseline, right bar aligns with 47 INV */}
              <div className="py-2 flex flex-col items-center">
                <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-3">
                  FMM: Active Portfolio breakdown, by Lending Instrument and Stage
                </h3>

                <div className="w-[380px] flex flex-col items-center">
                  {/* Two bars side by side on bottom baseline */}
                  <div className="w-full flex items-end justify-center gap-16 pb-1">
                    {/* Column 1: Instruments (Total 48: 1 PBL on top, 47 INV on bottom) */}
                    <div className="flex flex-col items-center w-28">
                      <div className="w-full flex flex-col rounded-xs overflow-hidden" style={{ height: '185px' }}>
                        {/* PBL (gray) */}
                        <div 
                          className="bg-[#94a3b8] text-white flex items-center justify-center font-bold text-[7pt]" 
                          style={{ height: '14px' }}
                        >
                          {pblCount} PBL
                        </div>
                        {/* INV (dark blue #005173) */}
                        <div 
                          className="bg-[#005173] text-white flex items-center justify-center font-bold text-[7pt] flex-1"
                        >
                          {invCount} INV
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Stages (Total INV: height equals EXACTLY the INV segment of Column 1) */}
                    <div className="flex flex-col items-center w-28">
                      <div 
                        className="w-full flex flex-col rounded-xs overflow-hidden" 
                        style={{ height: '171px' }}
                      >
                        {/* Stage I (dark blue, with subtle separator) */}
                        <div 
                          className="bg-[#005173] text-white flex items-center justify-center font-bold text-[7pt] border-b border-[#003d57]" 
                          style={{ height: `${Math.round((invStage1Count / totalInv) * 171)}px` }}
                        >
                          {invStage1Count} Stage I
                        </div>
                        {/* Stage II (dark blue) */}
                        <div 
                          className="bg-[#005173] text-white flex items-center justify-center font-bold text-[7pt] flex-1 border-b border-[#003d57]"
                        >
                          {invStage2Count} Stage II
                        </div>
                        {/* Stage III (dark blue) */}
                        <div 
                          className="bg-[#005173] text-white flex items-center justify-center font-bold text-[7pt]" 
                          style={{ height: `${Math.max(16, Math.round((invStage3Count / totalInv) * 171))}px` }}
                        >
                          {invStage3Count} Stage III
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Labels below the bars */}
                  <div className="w-full flex justify-center gap-16 pt-2 text-[9pt] font-bold text-zinc-600">
                    <span className="w-28 text-center">{totalProjects} projects</span>
                    <span className="w-28 text-center">{invCount} INV</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 6: Portfolio Age (Calibrated width, yellow IDB label, centered legend & footnote) */}
            <section className="mb-2">
              <h2 className="text-[12pt] font-bold text-[#004b6b] tracking-tight mb-1">
                Portfolio Age
              </h2>
              <p className="text-[10pt] text-[#333333] leading-snug mb-2 font-normal">
                The FMM active portfolio has an average age of {ageFmmAvg.toFixed(1)} years, {ageComparisonSentence} averages. Currently, {agePctOver5Yrs.toFixed(0)}% of the projects have exceeded 5 years in execution, and {agePctExtensions.toFixed(0)}% have requested extensions.
              </p>

              {/* Direct layout: Bars grouped closely together to match title width */}
              <div className="py-1 flex flex-col items-center">
                <h3 className="text-[9pt] font-bold text-[#004b6b] text-center mb-1">
                  IFD: Average Portfolio Age (in years) in 2026, by Division (INV and PBL)¹/
                </h3>
                <BarChart
                  width={420}
                  height={145}
                  data={currentAgeData}
                  margin={{ top: 18, right: 25, left: 25, bottom: 0 }}
                >
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis hide domain={[0, 6]} />
                  <ReferenceLine
                    segment={[{ x: 'CIS', y: ageIdbAvg }, { x: 'CMF', y: ageIdbAvg }]}
                    stroke="#FFC000"
                    strokeDasharray="3 3"
                    strokeWidth={1.8}
                    label={{ position: 'top', value: `IDB (${ageIdbAvg.toFixed(1)})`, fill: '#FFC000', fontSize: 7.5, fontWeight: 'bold' }}
                  />
                  <ReferenceLine
                    segment={[{ x: 'CIS', y: ageIfdAvg }, { x: 'CMF', y: ageIfdAvg }]}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    strokeWidth={1.8}
                    label={{ position: 'bottom', value: `IFD (${ageIfdAvg.toFixed(1)})`, fill: '#0284c7', fontSize: 7.5, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="age" fill="#004b6b" stroke="none" strokeWidth={0} barSize={32} isAnimationActive={false}>
                    <LabelList
                      dataKey="age"
                      position="top"
                      formatter={(v: any) => typeof v === 'number' ? v.toFixed(1) : v}
                      fill="#004b6b"
                      fontSize={8.5}
                      fontWeight="bold"
                    />
                    {currentAgeData.map((entry: any, index: number) => (
                      <Cell key={`cell-age-${index}`} fill={entry.name === 'FMM' ? '#004b6b' : '#94a3b8'} stroke="none" strokeWidth={0} />
                    ))}
                  </Bar>
                </BarChart>

                {/* Legend & Footnote: NO gray line above, centered and close together */}
                <div className="flex items-center justify-center gap-8 text-[7.5pt] text-zinc-600 mt-2">
                  <span>¹/ Calculated from approval to date.</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 bg-[#004b6b] inline-block"></span> Divisions</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-[#0284c7] inline-block"></span> IFD</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-[#FFC000] inline-block"></span> IDB</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PdfReportTemplate;
