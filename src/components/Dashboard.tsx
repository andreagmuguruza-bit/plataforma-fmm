import React, { useState } from 'react';
import { Project } from '../types';
import { Search, ChevronDown, ArrowLeft, ChevronsUpDown, Download, Loader2, Filter, Triangle } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { usePortfolioData } from '../hooks/usePortfolioData';

const syntheticIndicatorsMap: Record<string, string> = {
  'BR-L1629': '',
  'BR-L1658': '',
  'ME-L1309': '',
  'PE-L1288': '',
  'UR-L1205': '',
  'AR-L1248': '2.75',
  'UR-L1111': '2.76',
  'BR-L1377': '2.6',
  'PE-L1231': '2.85',
  'PE-L1239': '2.9',
  'EC-L1230': '2.05',
  'BR-L1501': '3',
  'BR-L1511': '3',
  'AR-L1285': '1.9',
  'CO-L1164': '2.5',
  'BR-L1516': '2.7',
  'BL-L1031': '3',
  'EC-L1251': '2.7',
  'BR-L1527': '2.85',
  'CO-L1245': '2.65',
  'PR-L1150': '2.75',
  'BR-L1534': '3',
  'PN-L1161': '2.2',
  'PE-L1266': '2.5',
  'BR-L1535': '2.55',
  'BR-L1517': '2.7',
  'BR-L1533': '2.85',
  'BL-L1038': '2.65',
  'PN-L1172': '1.4',
  'BR-L1550': '3',
  'EC-L1253': '2.2',
  'SU-L1060': '2.6',
  'BR-L1539': '2.9',
  'BR-L1540': '3',
  'UR-L1164': '1.9',
  'UR-L1193': '2.65',
  'BR-L1599': '2.75',
  'BR-L1513': '2.55',
  'BR-L1525': '2.55',
  'CH-L1178': '3',
  'BR-L1592': '3',
  'AR-L1405': '2.9',
  'PR-L1192': '3',
  'BR-L1643': '',
  'BR-L1614': '',
  'PE-L1278': ''
};

interface DashboardProps {
  projects: Project[];
  onSelectProject?: (id: string) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  initialInstrument?: 'INV' | 'PBL' | null;
  isPmrMode?: boolean;
}

export default function Dashboard({ projects, onSelectProject, onBack, isReadOnly = false, initialInstrument = null, isPmrMode = false }: DashboardProps) {
  const { metrics, tableData, loading, error } = usePortfolioData();

  const [filters, setFilters] = useState<Record<string, string[]>>({
    projectId: [],
    project: [],
    operation: [],
    country: [],
    instrument: [],
    ttl: [],
    status: [],
    pmr2026: []
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'projectId', direction: 'asc' });

  const instrumentFilteredData = React.useMemo(() => {
    return tableData.filter(p => {
      if (isPmrMode) {
        return p.lendingInstrumentId === 'LON-INV' && p.status !== 'Stage I';
      }
      return true;
    });
  }, [tableData, isPmrMode]);

  const displayMetrics = React.useMemo(() => {
    if (!metrics) return null;

    const count = instrumentFilteredData.length;
    const approved = instrumentFilteredData.reduce((sum, p) => sum + p.currentApprovedAmount, 0);
    const disbursed = instrumentFilteredData.reduce((sum, p) => sum + p.disbursedLifeAmount, 0);
    
    const s1 = instrumentFilteredData.filter(p => p.status === 'Stage I').length;
    const s2 = instrumentFilteredData.filter(p => p.status === 'Stage II').length;
    const s3 = instrumentFilteredData.filter(p => p.status === 'Stage III').length;

    if (!initialInstrument) return { ...metrics, s1, s2, s3 };

    return {
      ...metrics,
      totalProjects: count,
      currentApprovedAmount: approved,
      disbursedLifeAmount: disbursed,
      disbursedLifePercent: approved > 0 ? (disbursed / approved) * 100 : 0,
      s1,
      s2,
      s3
    };
  }, [metrics, initialInstrument, instrumentFilteredData]);

  const ttlMetrics = React.useMemo(() => {
    if (!displayMetrics?.pmrInvOnly) return null;
    
    // Start from the base INV only metrics
    let satisfactory = displayMetrics.pmrInvOnly.satisfactory.count;
    let alert = displayMetrics.pmrInvOnly.alert.count;
    let problem = displayMetrics.pmrInvOnly.problem.count;
    const total = displayMetrics.pmrInvOnly.total;

    // Apply the TTL-specific overrides for aggregates:
    // EC-L1230: Satisfactory -> Alert (-1 sat, +1 alert)
    // UR-L1164: Alert -> Problem (-1 alert, +1 problem)
    satisfactory -= 1;
    // alert = alert + 1 - 1 // no change
    problem += 1;

    return {
      ...displayMetrics.pmrInvOnly,
      satisfactory: { count: satisfactory, percent: (satisfactory / total) * 100 },
      alert: { count: alert, percent: (alert / total) * 100 },
      problem: { count: problem, percent: (problem / total) * 100 },
    };
  }, [displayMetrics]);

  const cooMetrics = React.useMemo(() => {
    if (!displayMetrics?.pmrInvOnly) return null;
    
    let satisfactory = displayMetrics.pmrInvOnly.satisfactory.count;
    let alert = displayMetrics.pmrInvOnly.alert.count;
    let problem = displayMetrics.pmrInvOnly.problem.count;
    const total = displayMetrics.pmrInvOnly.total;

    return {
      ...displayMetrics.pmrInvOnly,
      satisfactory: { count: satisfactory, percent: (satisfactory / total) * 100 },
      alert: { count: alert, percent: (alert / total) * 100 },
      problem: { count: problem, percent: (problem / total) * 100 },
    };
  }, [displayMetrics]);

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openFilter && !(e.target as Element).closest('.filter-dropdown')) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const formatSmallNumber = (val: number) => {
    if (val === 0) return '0';
    const rounded = Math.round(val);
    if (rounded === 0) {
      const formatted = val.toFixed(1);
      return formatted === '0.0' ? '0.1' : formatted;
    }
    return rounded.toLocaleString('en-US');
  };

  const formatPMR = (pmr: string) => {
    const str = String(pmr || '').toUpperCase().trim();
    return str ? str.charAt(0) + str.slice(1).toLowerCase() : '';
  };

  const filteredTableData = instrumentFilteredData.filter(p => {
    const instrument = p.projectNumber === 'PE-L1288' ? 'PBL' : (p.lendingInstrumentId === 'LON-INV' ? 'INV' : p.lendingInstrumentId === 'LON-PBL' ? 'PBL' : p.lendingInstrumentId);
    const pmrVal = String(p.pmrClassification || '').toUpperCase().trim();
    const pmr = formatPMR(pmrVal);
    
    // TTL PMR calculation for filtering
    let ttlVal = pmrVal;
    if (p.projectNumber === 'EC-L1230') ttlVal = 'ALERT';
    if (p.projectNumber === 'UR-L1164') ttlVal = 'PROBLEM';
    const ttlPmr = formatPMR(ttlVal);
    
    return (
      (filters.projectId.length === 0 || filters.projectId.includes(p.projectNumber)) &&
      (filters.project.length === 0 || filters.project.includes(p.title)) &&
      (filters.operation.length === 0 || filters.operation.includes(p.operationNumber)) &&
      (filters.country.length === 0 || filters.country.includes(p.countryName)) &&
      (filters.instrument.length === 0 || filters.instrument.includes(instrument)) &&
      (filters.ttl.length === 0 || filters.ttl.includes(p.ttl)) &&
      (filters.status.length === 0 || filters.status.includes(p.status)) &&
      (isPmrMode ? (
        // In PMR mode, validation columns use specific keys: investment(TTL), disbursed(COO), disbursedPercent(DC), pmr2026(CR)
        (filters.investment === undefined || filters.investment.length === 0 || filters.investment.includes(ttlPmr)) &&
        (filters.disbursed === undefined || filters.disbursed.length === 0 || filters.disbursed.includes(pmr)) &&
        (filters.disbursedPercent === undefined || filters.disbursedPercent.length === 0 || filters.disbursedPercent.includes(pmr)) &&
        (filters.pmr2026 === undefined || filters.pmr2026.length === 0 || filters.pmr2026.includes(pmr))
      ) : (
        // Normal mode, only pmr2026 is filtered as "Chief Operations"
        (filters.pmr2026.length === 0 || filters.pmr2026.includes(pmr))
      ))
    );
  }).sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'index') {
      aValue = a.index;
      bValue = b.index;
    } else if (sortConfig.key === 'projectId') {
      aValue = a.projectNumber;
      bValue = b.projectNumber;
    } else if (sortConfig.key === 'project') {
      aValue = a.title;
      bValue = b.title;
    } else if (sortConfig.key === 'operation') {
      aValue = a.operationNumber;
      bValue = b.operationNumber;
    } else if (sortConfig.key === 'country') {
      aValue = a.countryName;
      bValue = b.countryName;
    } else if (sortConfig.key === 'ttl') {
      aValue = a.ttl;
      bValue = b.ttl;
    } else if (sortConfig.key === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else if (sortConfig.key === 'instrument') {
      aValue = a.projectNumber === 'PE-L1288' ? 'PBL' : (a.lendingInstrumentId === 'LON-INV' ? 'INV' : 'PBL');
      bValue = b.projectNumber === 'PE-L1288' ? 'PBL' : (b.lendingInstrumentId === 'LON-INV' ? 'INV' : 'PBL');
    } else if (sortConfig.key === 'investment') {
      if (isPmrMode) {
        const getPmrOrder = (p: any) => {
          let val = String(p.pmrClassification || '').toUpperCase().trim();
          if (p.projectNumber === 'EC-L1230') val = 'ALERT';
          if (p.projectNumber === 'UR-L1164') val = 'PROBLEM';
          if (val === 'SATISFACTORY') return 1;
          if (val === 'ALERT') return 2;
          if (val === 'PROBLEM') return 3;
          return 4;
        };
        aValue = getPmrOrder(a);
        bValue = getPmrOrder(b);
      } else {
        aValue = a.currentApprovedAmount;
        bValue = b.currentApprovedAmount;
      }
    } else if (sortConfig.key === 'disbursed') {
      if (isPmrMode) {
        const getPmrOrder = (p: any) => {
          const val = String(p.pmrClassification || '').toUpperCase().trim();
          if (val === 'SATISFACTORY') return 1;
          if (val === 'ALERT') return 2;
          if (val === 'PROBLEM') return 3;
          return 4;
        };
        aValue = getPmrOrder(a);
        bValue = getPmrOrder(b);
      } else {
        aValue = a.disbursedLifeAmount;
        bValue = b.disbursedLifeAmount;
      }
    } else if (sortConfig.key === 'disbursedPercent') {
      if (isPmrMode) {
        const getPmrOrder = (p: any) => {
          const val = String(p.pmrClassification || '').toUpperCase().trim();
          if (val === 'SATISFACTORY') return 1;
          if (val === 'ALERT') return 2;
          if (val === 'PROBLEM') return 3;
          return 4;
        };
        aValue = getPmrOrder(a);
        bValue = getPmrOrder(b);
      } else {
        aValue = a.disbursedLifePercent;
        bValue = b.disbursedLifePercent;
      }
    } else if (sortConfig.key === 'pmr2026') {
      if (isPmrMode) {
        const getPmrOrder = (p: any) => {
          const val = String(p.pmrClassification || '').toUpperCase().trim();
          if (val === 'SATISFACTORY') return 1;
          if (val === 'ALERT') return 2;
          if (val === 'PROBLEM') return 3;
          return 4;
        };
        aValue = getPmrOrder(a);
        bValue = getPmrOrder(b);
      } else {
        aValue = a.pmrClassification;
        bValue = b.pmrClassification;
      }
    } else if (sortConfig.key === 'syntheticIndicator') {
      const getSyntheticValue = (p: any) => {
        const val = syntheticIndicatorsMap[p.projectNumber] || '';
        return val ? parseFloat(val) : -1;
      };
      aValue = getSyntheticValue(a);
      bValue = getSyntheticValue(b);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Portfolio', {
      views: [{ showGridLines: false }]
    });

    const parseXlsNum = (val: any) => {
      if (val === 'N/A' || val === null || val === undefined) return val;
      const n = parseFloat(String(val));
      return isNaN(n) ? val : n;
    };

    // Define Columns
    worksheet.columns = [
      { header: 'N', key: 'n', width: 5 },
      { header: 'Project ID', key: 'projectId', width: 15 },
      { header: 'Operation ID', key: 'operationId', width: 15 },
      { header: 'Project Name', key: 'projectName', width: 40 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Lending Type', key: 'lendingType', width: 15 },
      { header: 'TTL', key: 'ttl', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Years in execution (since eligibility)', key: 'yearsExecution', width: 20, style: { numFmt: '0.00' } },
      { header: 'Months of extension', key: 'monthsExtension', width: 15, style: { numFmt: '0.00' } },
      { header: 'Current Approved Amount ($)', key: 'approvedAmount', width: 25, style: { numFmt: '0.00' } },
      { header: 'Disbursed Life Amount ($)', key: 'disbursedAmount', width: 25, style: { numFmt: '0.00' } },
      { header: 'Disbursed Life Amount (%)', key: 'disbursedPercent', width: 25, style: { numFmt: '0.00' } },
      { header: 'Auto-calculated by TTL', key: 'ttlPmr', width: 30 },
      { header: 'Validated by Chief Operations (COO)', key: 'cooPmr', width: 35 },
      { header: 'Validated by Division Chief (DC)', key: 'dcPmr', width: 30 },
      { header: 'Validated by Representative (CR)', key: 'crPmr', width: 30 },
      { header: 'SI', key: 'syntheticIndicator', width: 15 },
      { header: 'Estado de implementación / Principales riesgos', key: 'estado', width: 40 },
      { header: 'Productos destacados/innovadores del proyecto', key: 'productos', width: 40 },
      { header: 'Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en PCR', key: 'probabilidad', width: 40 },
      { header: 'Acciones sugeridas / Pedidos', key: 'acciones', width: 40 }
    ];

    // Rows
    let currentRowN = 1;
    filteredTableData.forEach((project) => {
      const qualitativeInfo = projects.find(p => p.id === project.projectNumber)?.qualitativeData;

      if (project.operations && project.operations.length > 1) {
        const projectN = currentRowN++;
        project.operations.forEach((op) => {
          worksheet.addRow({
            n: projectN,
            projectId: project.projectNumber,
            operationId: op.number,
            projectName: project.title,
            country: project.countryName,
            lendingType: project.projectNumber === 'PE-L1288' ? 'PBL' : (project.lendingInstrumentId === 'LON-INV' ? 'INV' : project.lendingInstrumentId === 'LON-PBL' ? 'PBL' : project.lendingInstrumentId),
            ttl: project.ttl,
            status: project.status,
            yearsExecution: parseXlsNum(project.ageInExecution),
            monthsExtension: parseXlsNum(project.monthsOfExtension),
            approvedAmount: op.approved * 1000000,
            disbursedAmount: op.disbursed * 1000000,
            disbursedPercent: op.percent,
            ttlPmr: (project.projectNumber === 'EC-L1230') ? 'Alert' : (project.projectNumber === 'UR-L1164' ? 'Problem' : formatPMR(project.pmrClassification)),
            cooPmr: formatPMR(project.pmrClassification),
            dcPmr: formatPMR(project.pmrClassification),
            crPmr: formatPMR(project.pmrClassification),
            syntheticIndicator: syntheticIndicatorsMap[project.projectNumber] || '',
            estado: qualitativeInfo?.estadoImplementacion?.join(' ') || '',
            productos: qualitativeInfo?.productosDestacados?.join(' ') || '',
            probabilidad: qualitativeInfo?.probabilidadObjetivos?.join(' ') || '',
            acciones: qualitativeInfo?.accionesSugeridas?.join(' ') || ''
          });
        });
      } else {
        worksheet.addRow({
          n: currentRowN++,
          projectId: project.projectNumber,
          operationId: project.operationNumber,
          projectName: project.title,
          country: project.countryName,
          lendingType: project.projectNumber === 'PE-L1288' ? 'PBL' : (project.lendingInstrumentId === 'LON-INV' ? 'INV' : project.lendingInstrumentId === 'LON-PBL' ? 'PBL' : project.lendingInstrumentId),
          ttl: project.ttl,
          status: project.status,
          yearsExecution: parseXlsNum(project.ageInExecution),
          monthsExtension: parseXlsNum(project.monthsOfExtension),
          approvedAmount: project.currentApprovedAmount * 1000000,
          disbursedAmount: project.disbursedLifeAmount * 1000000,
          disbursedPercent: project.disbursedLifePercent,
          ttlPmr: (project.projectNumber === 'EC-L1230') ? 'Alert' : (project.projectNumber === 'UR-L1164' ? 'Problem' : formatPMR(project.pmrClassification)),
          cooPmr: formatPMR(project.pmrClassification),
          dcPmr: formatPMR(project.pmrClassification),
          crPmr: formatPMR(project.pmrClassification),
          syntheticIndicator: syntheticIndicatorsMap[project.projectNumber] || '',
          estado: qualitativeInfo?.estadoImplementacion?.join(' ') || '',
          productos: qualitativeInfo?.productosDestacados?.join(' ') || '',
          probabilidad: qualitativeInfo?.probabilidadObjetivos?.join(' ') || '',
          acciones: qualitativeInfo?.accionesSugeridas?.join(' ') || ''
        });
      }
    });

    // Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF005173' } // Navy blue (#005173)
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // White
        bold: true
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Style the data cells to align left as well (headers are already done)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          if (!cell.alignment) cell.alignment = {};
          cell.alignment.horizontal = 'left';
        });
      }
    });

    // Generate Buffer and Download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'FMM_Portfolio_Tracking.xlsx');
  };

  const uniqueProjectIds = Array.from(new Set(instrumentFilteredData.map(p => p.projectNumber))).filter(Boolean).sort();
  const uniqueProjectNames = Array.from(new Set(instrumentFilteredData.map(p => p.title))).filter(Boolean).sort();
  const uniqueOperations = Array.from(new Set(instrumentFilteredData.map(p => p.operationNumber))).filter(Boolean).sort();
  const uniqueCountries = Array.from(new Set(instrumentFilteredData.map(p => p.countryName))).filter(Boolean).sort();
  const uniqueInstruments = Array.from(new Set(instrumentFilteredData.map(p => p.projectNumber === 'PE-L1288' ? 'PBL' : (p.lendingInstrumentId === 'LON-INV' ? 'INV' : p.lendingInstrumentId === 'LON-PBL' ? 'PBL' : p.lendingInstrumentId)))).filter(Boolean).sort();
  const uniqueTTLs = Array.from(new Set(instrumentFilteredData.map(p => p.ttl))).filter(Boolean).sort();
  const uniqueStatuses = Array.from(new Set(instrumentFilteredData.map(p => p.status))).filter(Boolean).sort();
  const uniquePMRs = isPmrMode 
    ? ['Satisfactory', 'Alert', 'Problem']
    : Array.from(new Set(instrumentFilteredData.map(p => formatPMR(p.pmrClassification)))).filter(Boolean).sort();

  const toggleFilter = (column: string, value: string) => {
    setFilters(prev => {
      const current = prev[column] || [];
      if (current.includes(value)) {
        return { ...prev, [column]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [column]: [...current, value] };
      }
    });
  };

  const renderColumnHeader = (columnKey: string, label: string | React.ReactNode, options: string[], sortable: boolean = true, minWidth?: string, rowSpan?: number) => {
    const isSI = columnKey === 'syntheticIndicator';
    return (
      <th 
        rowSpan={rowSpan}
        className={`px-1 py-3 ${isSI ? 'text-left pl-4' : 'text-center'} relative ${minWidth ? minWidth : ''}`}
      >
        <div className={`flex items-center ${isSI ? 'justify-start' : 'justify-center'} gap-1.5`}>
          <span className="leading-tight">{label}</span>
          <div className="flex items-center gap-0.5">
            {sortable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort(columnKey);
                }}
                className={`p-1 rounded hover:bg-zinc-200 transition-colors ${sortConfig.key === columnKey ? 'text-[#005173]' : 'text-zinc-400'}`}
                title="Sort"
              >
                <ChevronsUpDown className="w-3 h-3" />
              </button>
            )}
            
            {options.length > 0 && (
              <div className="relative filter-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFilter(openFilter === columnKey ? null : columnKey);
                  }}
                  className={`p-1 rounded hover:bg-zinc-200 transition-colors ${filters[columnKey]?.length > 0 ? 'text-[#005173]' : 'text-zinc-400'}`}
                  title="Filter"
                >
                  <Filter className="w-3 h-3" />
                </button>
                
                {openFilter === columnKey && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 max-h-60 flex flex-col font-normal normal-case">
                    <div className="p-2 border-b border-zinc-100 bg-white">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters(prev => ({ ...prev, [columnKey]: [] }));
                        }}
                        className="text-xs text-[#005173] hover:underline w-full text-left font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                    <div className="p-2 flex flex-col gap-1 overflow-y-auto">
                      {options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={filters[columnKey]?.includes(opt) || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleFilter(columnKey, opt);
                            }}
                            className="rounded border-zinc-300 text-[#005173] focus:ring-[#005173]"
                          />
                          <span className="truncate">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </th>
    );
  };

  const ProgressBar = ({ totalLabel, currentLabel, totalValue, currentValue, percentage, showStripes = false }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
        <span>{totalLabel}</span>
        <span className="text-zinc-900">{totalValue}</span>
      </div>
      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden flex items-center justify-end px-2">
        <span className="relative z-10 text-white text-[10px] font-bold">100%</span>
      </div>
      
      <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-3">
        <span>{currentLabel}</span>
        <span className="text-zinc-900">{currentValue}</span>
      </div>
      <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
        {showStripes && (
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f4f4f5, #f4f4f5 5px, #e4e4e7 5px, #e4e4e7 10px)' }}></div>
        )}
        <div 
          className="absolute inset-y-0 left-0 bg-[#00AEEF] flex items-center justify-center px-2 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        >
          <span className="text-white text-[10px] font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
  const PMRChartMockup = ({ title, subTitle, pmrData, totalProjects, noData = false, showTrend = false }: any) => {
    if (!pmrData) return null;
    
    // Right-to-left cumulative positions
    const rightSat = 0;
    const rightAlert = pmrData.satisfactory.percent;
    const rightProb = rightAlert + pmrData.alert.percent;
    const rightNA = rightProb + pmrData.problem.percent;

    const showNA = pmrData.na.count > 0;

    return (
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-bold text-zinc-900 mb-3 leading-tight whitespace-nowrap" title={title}>
          {title}
          {subTitle && (
            <div className="block italic font-normal normal-case mt-0.5">
              {subTitle}
            </div>
          )}
        </h3>
        <div className="relative flex-1 flex flex-col gap-1.5">
          {/* Total Projects */}
          <div className="flex items-center gap-2">
            <div className="w-20 leading-tight">
              <div className="text-[10px] font-bold text-[#005173]">Total Projects</div>
            </div>
            <div className="flex-1 h-4 bg-[#005173] rounded-sm flex items-center justify-end px-2">
              <span className="text-white text-[10px] font-bold">{totalProjects}</span>
            </div>
          </div>

          {noData ? (
            <div className="mt-4 flex flex-col items-start">
              <span className="text-zinc-500 text-[11px] font-medium italic">No data yet</span>
            </div>
          ) : (
            <>
              {/* Satisfactory */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 leading-none">
                  <div className="text-[10px] font-medium text-zinc-900 uppercase tracking-wider">Satisfactory</div>
                  <div className="text-[8px] text-zinc-400"># Projects (%)</div>
                </div>
                <div className="flex-1 relative h-4">
                  <div className="absolute h-full bg-[#529E55] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightSat}%`, width: `${Math.max(4, pmrData.satisfactory.percent)}%` }}>
                    <span className="text-white text-[10px] font-bold">{pmrData.satisfactory.count}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightSat}%`, width: `${Math.max(4, pmrData.satisfactory.percent)}%` }}>
                    ({Math.round(pmrData.satisfactory.percent)}%)
                    {showTrend && <Triangle className="w-2 h-2 text-[#529E55] fill-[#529E55] inline mb-0.5 ml-0.5" />}
                  </div>
                </div>
              </div>

              {/* Alert */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-20 leading-none">
                  <div className="text-[10px] font-medium text-zinc-900 uppercase tracking-wider">Alert</div>
                  <div className="text-[8px] text-zinc-400"># Projects (%)</div>
                </div>
                <div className="flex-1 relative h-4">
                  <div className="absolute h-full bg-[#F5C243] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightAlert}%`, width: `${Math.max(4, pmrData.alert.percent)}%` }}>
                    <span className="text-white text-[10px] font-bold">{pmrData.alert.count}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightAlert}%`, width: `${Math.max(4, pmrData.alert.percent)}%` }}>({Math.round(pmrData.alert.percent)}%)</div>
                </div>
              </div>

              {/* Problem */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-20 leading-none">
                  <div className="text-[10px] font-medium text-zinc-900 uppercase tracking-wider">Problem</div>
                  <div className="text-[8px] text-zinc-400"># Projects (%)</div>
                </div>
                <div className="flex-1 relative h-4">
                  <div className="absolute h-full bg-[#DE5347] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightProb}%`, width: `${Math.max(4, pmrData.problem.percent)}%` }}>
                    <span className="text-white text-[10px] font-bold">{pmrData.problem.count}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightProb}%`, width: `${Math.max(4, pmrData.problem.percent)}%` }}>({Math.round(pmrData.problem.percent)}%)</div>
                </div>
              </div>

              {/* N/A */}
              {showNA && (
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <div className="w-20 leading-none">
                    <div className="text-[10px] font-medium text-zinc-900 uppercase tracking-wider">N/A</div>
                    <div className="text-[8px] text-zinc-400"># Projects (%)</div>
                  </div>
                  <div className="flex-1 relative h-4">
                    <div className="absolute h-full bg-[#9CA3AF] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightNA}%`, width: `${Math.max(4, pmrData.na.percent)}%` }}>
                      <span className="text-white text-[10px] font-bold">{pmrData.na.count}</span>
                    </div>
                    <div className="absolute -bottom-3 flex justify-center" style={{ right: `${rightNA}%`, width: `${Math.max(4, pmrData.na.percent)}%` }}>
                      <span className="text-[9px] text-black font-medium whitespace-nowrap">({Math.round(pmrData.na.percent)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#005173]" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error loading portfolio data. Please try again later.
      </div>
    );
  }

  const stage1Count = tableData.filter(p => p.status === 'Stage I').length;
  const stage2Count = tableData.filter(p => p.status === 'Stage II').length;
  const stage3Count = tableData.filter(p => p.status === 'Stage III').length;
  const maxStageCount = Math.max(stage1Count, stage2Count, stage3Count, 1);

  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-4 px-4 lg:px-0"
      >
        <button 
          onClick={onBack}
          className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Execution
        </button>
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            {isPmrMode ? (
              "PMR March Cycle 2026"
            ) : initialInstrument === 'INV' ? (
              <>Portfolio Tracking: <br className="sm:hidden" /> <span className="text-[#005173]">Active operations</span></>
            ) : initialInstrument === 'PBL' ? (
              <>Portfolio Tracking: <br className="sm:hidden" /> <span className="text-[#005173]">PBL operations</span></>
            ) : (
              'FMM Portfolio Tracking'
            )}
          </h2>
          <p className="text-zinc-500 text-base md:text-lg mt-2">
            {isPmrMode
              ? "This cycle evaluated 38 INV projects in Stage II and III."
              : initialInstrument === 'INV' 
                ? `The current FMM portfolio in execution comprises ${displayMetrics?.totalProjects} active operations, ${displayMetrics?.s1} of which are in Stage I, ${displayMetrics?.s2} in Stage II, and ${displayMetrics?.s3} in Stage III.`
                : initialInstrument === 'PBL'
                  ? `The current FMM portfolio in execution comprises ${displayMetrics?.totalProjects} PBL ${displayMetrics?.totalProjects === 1 ? 'operation' : 'operations'}.`
                  : `Project level viewer of the status of all the ${displayMetrics?.totalProjects} projects.`}
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {initialInstrument !== 'PBL' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`grid grid-cols-1 sm:grid-cols-2 ${isPmrMode ? 'lg:grid-cols-[1fr_1.11fr_0.945fr_0.945fr]' : 'lg:grid-cols-4'} gap-4 px-4 lg:px-0`}
        >
          {isPmrMode ? (
            ['Auto-calculated by TTL', 'Validated by Chief Operations (COO)', 'Validated by Division Chief (DC)', 'Validated by Representative (CR)'].map((title, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <PMRChartMockup 
                  title={title} 
                  subTitle={null} 
                  pmrData={i === 0 ? ttlMetrics : cooMetrics} 
                  totalProjects={displayMetrics?.pmrInvOnly.total} 
                  noData={false}
                  showTrend={i === 1}
                />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <h3 className="text-sm font-bold text-zinc-900 mb-6">Disbursed Life Amount</h3>
                <ProgressBar 
                  totalLabel="Current Approved Amount" 
                  totalValue={`$${Math.round(displayMetrics?.currentApprovedAmount || 0).toLocaleString('en-US')}M`}
                  currentLabel="Disbursed Life Amount"
                  currentValue={`$${Math.round(displayMetrics?.disbursedLifeAmount || 0).toLocaleString('en-US')}M`}
                  percentage={displayMetrics?.disbursedLifePercent || 0}
                />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <h3 className="text-sm font-bold text-zinc-900 mb-6">Disbursement 2026</h3>
                <ProgressBar 
                  totalLabel="Baseline projection" 
                  totalValue={`$${Math.round(displayMetrics?.projected2026 || 0).toLocaleString('en-US')}M`}
                  currentLabel="Disbursed amount"
                  currentValue={`$${Math.round(displayMetrics?.disbursed2026 || 0).toLocaleString('en-US')}M`}
                  percentage={displayMetrics?.disbursed2026Percent || 0}
                />
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <h3 className="text-sm font-bold text-zinc-900 mb-2 lg:mb-6">Project Stages</h3>
                <div className="space-y-1">
                  {/* Stage I */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    <span>Stage I</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ width: `${((displayMetrics?.s1 || 0) / Math.max(displayMetrics?.s1 || 0, displayMetrics?.s2 || 0, displayMetrics?.s3 || 0, 1)) * 100}%` }}
                    >
                      {(displayMetrics?.s1 || 0) > 0 && <span className="text-white text-[10px] font-bold">{displayMetrics?.s1}</span>}
                    </div>
                  </div>
                  {/* Stage II */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2 lg:mt-3">
                    <span>Stage II</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ width: `${((displayMetrics?.s2 || 0) / Math.max(displayMetrics?.s1 || 0, displayMetrics?.s2 || 0, displayMetrics?.s3 || 0, 1)) * 100}%` }}
                    >
                      {(displayMetrics?.s2 || 0) > 0 && <span className="text-white text-[10px] font-bold">{displayMetrics?.s2}</span>}
                    </div>
                  </div>
                  {/* Stage III */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2 lg:mt-3">
                    <span>Stage III</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ width: `${((displayMetrics?.s3 || 0) / Math.max(displayMetrics?.s1 || 0, displayMetrics?.s2 || 0, displayMetrics?.s3 || 0, 1)) * 100}%` }}
                    >
                      {(displayMetrics?.s3 || 0) > 0 && <span className="text-white text-[10px] font-bold">{displayMetrics?.s3}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <PMRChartMockup 
                  title="PMR March cycle (2026)" 
                  subTitle="Chief Operations (INV Stage II & III)" 
                  pmrData={displayMetrics?.pmrInvOnly} 
                  totalProjects={displayMetrics?.pmrInvOnly.total} 
                />
              </div>
            </>
          )}
        </motion.div>
      )}

      {isPmrMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="space-y-6 px-4 lg:px-0"
        >          <div className="pt-4">
            <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">FMM PMR performance</h2>
            <p className="text-zinc-500 text-base md:text-lg mt-2">
              FMM holds the second-highest percentage of satisfactory projects among all divisions, outperforming both IFD (79%) and IDB (75%).
            </p>
          </div>
          
          {/* First row: Percentage PMR 2026 and Percentage 2022-2025 side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-zinc-100 h-auto lg:h-[320px] pb-6 flex flex-col">
              <h3 className="text-[15px] font-bold text-center text-zinc-900 mb-2 lg:mb-4 shrink-0">Percentage of Satisfactory Projects, PMR March Cycle 2026 (Validated by COO)</h3>
              <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-zinc-100 border-y border-zinc-200 text-zinc-900">
                      <th className="px-1 py-1 text-left font-bold w-[25%] text-[10px]">Division</th>
                      <th className="px-1 py-1 text-center font-bold w-[13%] text-[10px]">Alert</th>
                      <th className="px-1 py-1 text-center font-bold w-[14%] text-[10px]">Problem</th>
                      <th className="px-1 py-1 text-center font-bold w-[14%] whitespace-nowrap text-[10px]">Satisfactory</th>
                      <th className="px-1 py-1 text-center font-bold w-[14%] text-[10px]">Total</th>
                      <th className="px-1 py-1 text-center font-bold w-[20%] text-[10px]">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      { div: 'PTI/CTI', alert: '', prob: '1', sat: '15', total: '16', pct: '94%' },
                      { div: 'IFD/FMM', alert: '3', prob: '2', sat: '33', total: '38', pct: '87%', highlight: true },
                      { div: 'IFD/CIS', alert: '2', prob: '1', sat: '14', total: '17', pct: '82%' },
                      { div: 'CSD/HUD', alert: '3', prob: '1', sat: '28', total: '35', pct: '80%' },
                      { div: 'IFD/ICS', alert: '5', prob: '4', sat: '36', total: '45', pct: '80%' },
                      { div: 'IFD', alert: '13', prob: '16', sat: '109', total: '138', pct: '79%', bold: true, bg: 'bg-[#F0F9FF]' },
                      { div: 'SCL/HNP', alert: '4', prob: '3', sat: '25', total: '33', pct: '76%' },
                      { div: 'INE/ENE', alert: '4', prob: '6', sat: '31', total: '41', pct: '76%' },
                      { div: 'IDB', alert: '70', prob: '48', sat: '369', total: '493', pct: '75%', bold: true, bg: 'bg-[#F0F9FF]' },
                      { div: 'INE/TSP', alert: '8', prob: '4', sat: '34', total: '46', pct: '74%' },
                      { div: 'PTI/TIN', alert: '5', prob: '1', sat: '14', total: '20', pct: '70%' },
                      { div: 'IFD/CMF', alert: '3', prob: '9', sat: '26', total: '38', pct: '68%' },
                      { div: 'PTI/ARD', alert: '6', prob: '3', sat: '18', total: '27', pct: '67%' },
                      { div: 'SCL/SPL', alert: '6', prob: '3', sat: '20', total: '30', pct: '67%' },
                      { div: 'INE/WSA', alert: '16', prob: '7', sat: '47', total: '70', pct: '67%' },
                      { div: 'SCL/EDU', alert: '5', prob: '3', sat: '17', total: '26', pct: '65%' },
                      { div: 'SCL/MIG', alert: '2', prob: '3', sat: '5', total: '12', pct: '42%' },
                    ].map((row, idx) => (
                      <tr key={idx} className={`${row.highlight ? 'bg-[#F0F9FF] border-2 border-yellow-400 font-bold' : row.bg || ''} ${row.bold && !row.highlight ? 'font-bold' : ''}`}>
                        <td className="px-1 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          {row.div}
                        </td>
                        <td className="px-1 py-0.5 text-center">{row.alert}</td>
                        <td className="px-1 py-0.5 text-center">{row.prob}</td>
                        <td className="px-1 py-0.5 text-center">{row.sat}</td>
                        <td className="px-1 py-0.5 text-center">{row.total}</td>
                        <td className={`px-1 py-0.5 text-center text-zinc-900 ${(row.highlight || row.bold) ? 'font-bold' : ''}`}>{row.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-[11px] text-zinc-500 text-left shrink-0">
                Note: Four divisions with six or fewer projects in their portfolio were excluded.
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 overflow-hidden h-auto lg:h-[320px] flex flex-col justify-between">
              <h3 className="text-[15px] font-bold text-center text-zinc-900 mb-4 mt-0 leading-tight">Percentage of Satisfactory Projects, 2022-2025 PMR March Cycles (Validated by COO)</h3>
              <div className="overflow-x-auto mt-0 px-2 flex-grow flex items-center">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-zinc-100 border-y border-zinc-200 text-zinc-900">
                      <th className="px-1 py-1.5 text-center border-r border-zinc-200 w-[16%] font-bold text-[10px]"></th>
                      <th className="px-1 py-1.5 text-center border-r border-zinc-200 w-[28%] font-bold text-[10px] leading-tight">Average Jan-Dec<br />2022-2024</th>
                      <th className="px-1 py-1.5 text-center border-r border-zinc-200 w-[28%] font-bold text-[10px] leading-tight">Jan-Dec<br />2025</th>
                      <th className="px-1 py-1.5 text-center w-[28%] font-bold text-[10px] leading-tight">Difference<br />(pp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'FMM', avg: '91%', curr: '87%', diff: '-3.98' },
                      { name: 'IFD', avg: '85%', curr: '79%', diff: '-6.19', highlight: true },
                      { name: 'IDB', avg: '81%', curr: '75%', diff: '-5.85', highlight: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="h-10">
                        <td className="px-2 py-1.5 font-bold text-zinc-800 bg-[#F0F9FF] border-b border-white">{row.name}</td>
                        <td className="px-2 py-1.5 text-center text-zinc-600 border-b border-zinc-50">{row.avg}</td>
                        <td className="px-2 py-1.5 text-center text-zinc-600 border-b border-zinc-50">{row.curr}</td>
                        <td className="px-2 py-1.5 text-center border-b border-zinc-50">
                          <div className="flex items-center justify-center gap-1">
                            <Triangle className="w-2 h-2 text-red-600 fill-red-600 rotate-180 shrink-0" />
                            <span className="text-zinc-600">{row.diff}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Second row: FMM Historic PMR March Cycles (2017-2026) alone */}
          <div className="mt-4">
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-zinc-100 h-[310px] lg:h-[350px] w-full">
              <h3 className="text-sm font-bold text-center text-zinc-900 mb-2 lg:mb-6">FMM Historic PMR March Cycles (2017-2026)</h3>
              <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 1024 ? "70%" : "85%"}>
                <LineChart 
                  data={[
                    { year: '2017', autocalculado: 77, validados: 87 },
                    { year: '2018', autocalculado: 82, validados: 88 },
                    { year: '2019', autocalculado: 89, validados: 93 },
                    { year: '2020', autocalculado: 93, validados: 84 },
                    { year: '2021', autocalculado: 73, validados: 88 },
                    { year: '2022', autocalculado: 73, validados: 83 },
                    { year: '2023', autocalculado: 84, validados: 88 },
                    { year: '2024', autocalculado: 87, validados: 92 },
                    { year: '2025', autocalculado: 85, validados: 90 },
                    { year: '2026', autocalculado: 84, validados: 87 },
                  ]} 
                  margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="0 0" vertical={false} horizontal={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontWeight: 500 }} 
                    dy={0}
                  />
                  <YAxis 
                    hide={true}
                    domain={[70, 95]} 
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-zinc-100 shadow-lg rounded-lg text-[11px]">
                            <p className="font-bold text-zinc-900 mb-1">{label}</p>
                            <div className="space-y-1">
                              <p>
                                <span className="font-bold text-zinc-600">Chief Operations:</span> 
                                <span className="text-black ml-1">{payload[0]?.value}%</span>
                              </p>
                              {payload[1] && (
                                <p>
                                  <span className="font-bold text-[#005173]">Validated:</span> 
                                  <span className="text-black ml-1">{payload[1]?.value}%</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    height={typeof window !== 'undefined' && window.innerWidth < 1024 ? 30 : 40}
                    iconType="plainline"
                    iconSize={16}
                    formatter={(value) => <span className="text-[10px] font-medium text-zinc-600">{value === 'autocalculado' ? 'Satisfactory (Chief Operations)' : 'Satisfactory (Validated)'}</span>}
                  />
                  <Line 
                    type="natural" 
                    dataKey="autocalculado" 
                    name="autocalculado"
                    stroke="#A9B3BC" 
                    strokeWidth={2.25} 
                    isAnimationActive={false}
                    dot={{ r: 2.7, fill: '#A9B3BC' }} 
                    activeDot={{ r: 4.5 }} 
                    label={{ position: 'top', offset: 8, fontSize: 10, fill: '#333', fontWeight: 600, formatter: (val: number) => `${val}%` }}
                  />
                  <Line 
                    type="natural" 
                    dataKey="validados" 
                    name="validados"
                    stroke="#005173" 
                    strokeWidth={2.25} 
                    isAnimationActive={false}
                    dot={{ r: 2.7, fill: '#005173' }} 
                    activeDot={{ r: 4.5 }} 
                    label={{ position: 'top', offset: 8, fontSize: 10, fill: '#333', fontWeight: 600, formatter: (val: number) => val ? `${val}%` : '' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-4 mt-8 px-4">
        <span className="text-[10px] sm:text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Data as of: {isPmrMode ? 'June 4, 2026' : 'April 29, 2026'}</span>
        <button 
          onClick={handleDownloadXLS}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#005173] text-white px-4 py-3 sm:py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-[#003d57] transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD XLS</span>
        </button>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
              {isPmrMode ? (
                <>
                  <tr>
                    {renderColumnHeader('index', 'N', [], false, 'w-8', 2)}
                    {renderColumnHeader('projectId', <span>PROJECT<br/>ID</span>, uniqueProjectIds, true, 'min-w-[80px]', 2)}
                    {renderColumnHeader('operation', <span>OPERATION<br/>ID</span>, uniqueOperations, true, 'min-w-[80px]', 2)}
                    {renderColumnHeader('project', <span>PROJECT<br/>NAME</span>, uniqueProjectNames, true, 'min-w-[100px] max-w-[120px]', 2)}
                    {renderColumnHeader('country', 'Country', uniqueCountries, true, undefined, 2)}
                    {renderColumnHeader('instrument', <span>LENDING<br/>TYPE</span>, uniqueInstruments, true, 'min-w-[80px] max-w-[90px]', 2)}
                    {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[70px] max-w-[85px]', 2)}
                    {renderColumnHeader('status', 'Stage', uniqueStatuses, true, undefined, 2)}
                    <th colSpan={4} className="px-1 py-3 text-center border-b border-zinc-200">
                      Validation stage
                    </th>
                    {renderColumnHeader('syntheticIndicator', <span>SI</span>, [], true, 'min-w-[60px]', 2)}
                  </tr>
                  <tr>
                    {renderColumnHeader('investment', 'TTL', uniquePMRs, true, 'min-w-[100px]')}
                    {renderColumnHeader('disbursed', 'COO', uniquePMRs, true, 'min-w-[100px]')}
                    {renderColumnHeader('disbursedPercent', 'DC', uniquePMRs, true, 'min-w-[100px]')}
                    {renderColumnHeader('pmr2026', 'CR', uniquePMRs, true, 'min-w-[100px]')}
                  </tr>
                </>
              ) : (
                <tr>
                  {renderColumnHeader('index', 'N', [], false, 'w-8')}
                  {renderColumnHeader('projectId', <span>PROJECT<br/>ID</span>, uniqueProjectIds, true, 'min-w-[80px]')}
                  {renderColumnHeader('operation', <span>OPERATION<br/>ID</span>, uniqueOperations, true, 'min-w-[80px]')}
                  {renderColumnHeader('project', <span>PROJECT<br/>NAME</span>, uniqueProjectNames, true, 'min-w-[100px] max-w-[120px]')}
                  {renderColumnHeader('country', 'Country', uniqueCountries, true)}
                  {renderColumnHeader('instrument', <span>LENDING<br/>TYPE</span>, uniqueInstruments, true, 'min-w-[80px] max-w-[90px]')}
                  {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[70px] max-w-[85px]')}
                  {renderColumnHeader('status', 'Stage', uniqueStatuses, true)}
                  {renderColumnHeader('investment', <span>Current Approved<br/>Amount<br/>($M)</span>, [], true, 'min-w-[90px]')}
                  {renderColumnHeader('disbursed', <span>Disbursed<br/>Life Amount<br/>($M)</span>, [], true, 'min-w-[80px]')}
                  {renderColumnHeader('disbursedPercent', <span>Disbursed<br/>Life Amount<br/>(%)</span>, [], true, 'min-w-[80px]')}
                  {renderColumnHeader('pmr2026', <span>PMR March<br/>Cycle (2026)<br/><i className="font-normal normal-case">Chief Operations</i></span>, uniquePMRs, true)}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {filteredTableData.map((project, index) => {
                const pmr = String(project.pmrClassification || '').toUpperCase().trim();
                
                // TTL column specific overrides
                let ttlPmr = pmr;
                if (project.projectNumber === 'EC-L1230') ttlPmr = 'ALERT';
                if (project.projectNumber === 'UR-L1164') ttlPmr = 'PROBLEM';
                
                const dotColor = ttlPmr === 'SATISFACTORY' ? 'bg-[#4CAF50]' : 
                                 ttlPmr === 'ALERT' ? 'bg-[#FFC107]' : 
                                 ttlPmr === 'PROBLEM' ? 'bg-[#F44336]' : 'bg-zinc-400';
                const displayPmr = formatPMR(ttlPmr);

                // COO/DC Columns follow the Source of Truth from the hook (no overrides here)
                const cooPmr = pmr;
                const displayCooPmr = formatPMR(cooPmr);
                const cooDotColor = pmr === 'SATISFACTORY' ? 'bg-[#4CAF50]' : 
                                   pmr === 'ALERT' ? 'bg-[#FFC107]' : 
                                   pmr === 'PROBLEM' ? 'bg-[#F44336]' : 'bg-zinc-400';
                
                const isECL1230 = project.projectNumber === 'EC-L1230';
                const isURL1164 = project.projectNumber === 'UR-L1164';
                const rowBgClass = isECL1230 
                  ? "bg-green-50/60 hover:bg-green-100/70" 
                  : isURL1164 
                  ? "bg-yellow-50/60 hover:bg-yellow-100/70" 
                  : "hover:bg-zinc-50";

                return (
                <tr 
                  key={`${project.projectNumber}-${index}`} 
                  className={`${rowBgClass} transition-colors cursor-pointer group`}
                  onClick={() => onSelectProject && onSelectProject(project.projectNumber)}
                >
                  <td className="px-2 py-3 text-center text-zinc-400 font-medium text-[10px]">
                    {index + 1}
                  </td>
                  <td className="px-2 py-3 text-left text-zinc-500 text-[10px] font-medium whitespace-nowrap">
                    {project.projectNumber}
                  </td>
                  <td className="px-2 py-3 text-left text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                    {project.operationNumber}
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-black font-semibold text-[11px] leading-tight whitespace-normal break-words">{project.title}</div>
                  </td>
                  <td className="px-2 py-3 text-left">
                    <div className="flex items-center justify-start gap-3">
                      {countryCodes[project.countryName] ? (
                        <img 
                          src={`https://flagcdn.com/w40/${countryCodes[project.countryName]}.png`} 
                          alt={project.countryName}
                          className="w-4 h-auto shadow-sm border border-zinc-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-lg">🏳️</span>
                      )}
                      <span className="text-zinc-500 text-[10px] font-medium">{project.countryName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-left pl-6 text-zinc-500 text-[10px] font-medium whitespace-nowrap">
                    {project.projectNumber === 'PE-L1288' ? 'PBL' : (project.lendingInstrumentId === 'LON-INV' ? 'INV' : project.lendingInstrumentId === 'LON-PBL' ? 'PBL' : project.lendingInstrumentId)}
                  </td>
                  <td className="px-3 py-3 max-w-[75px] w-[75px] whitespace-normal break-words text-left text-zinc-500 text-[10px] font-medium font-sans">
                    {project.ttl.includes(',') ? (
                      <div className="flex flex-col items-start justify-start text-left">
                        <span>{project.ttl.split(',')[0]},</span>
                        <span>{project.ttl.split(',').slice(1).join(',').trim()}</span>
                      </div>
                    ) : (
                      project.ttl
                    )}
                  </td>
                  <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-medium whitespace-nowrap">{project.status}</td>
                  {isPmrMode ? (
                    <>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">{displayPmr}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-left pl-4 text-zinc-500 font-medium text-[10px]">
                        {syntheticIndicatorsMap[project.projectNumber] || ''}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations.map(o => `$${Math.round(o.approved).toLocaleString('en-US')}M`).join('\n')}
                      </td>
                      <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations.map(o => `$${Math.round(o.disbursed).toLocaleString('en-US')}M`).join('\n')}
                      </td>
                      <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations.map(o => {
                          const value = project.projectNumber === 'BR-L1377' ? o.percent.toFixed(1) : Math.round(o.percent);
                          return `${value}%`;
                        }).join('\n')}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">
                            {displayCooPmr}
                          </span>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
