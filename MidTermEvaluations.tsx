import React, { useMemo } from 'react';
import { ArrowLeft, AlertCircle, ChevronsUpDown, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface MidTermEvaluationsProps {
  projects: Project[];
  onBack: () => void;
  backLabel?: string;
  onSelectProject?: (id: string) => void;
  isCriticalProcurement?: boolean;
}

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

const operationFallbacks: Record<string, string> = {
  'PN-L1161': '5126/OC-PN',
  'PN-L1172': '5533/OC-PN',
  'EC-L1253': '5598/OC-EC\n5599/OC-EC',
  'BR-L1540': '5344/OC-BR',
  'CO-L1245': '5148/OC-CO',
  'PR-L1150': '4671/OC-PR',
  'UR-L1193': '5783/OC-UR',
  'SU-L1060': '5727/OC-SU'
};

export default function MidTermEvaluations({ projects, onBack, backLabel, onSelectProject, isCriticalProcurement }: MidTermEvaluationsProps) {
  const targetIds = isCriticalProcurement ? ['PN-L1161', 'PN-L1172'] : [
    'PN-L1161',
    'PN-L1172',
    'EC-L1253',
    'BR-L1540',
    'CO-L1245',
    'PR-L1150',
    'UR-L1193',
    'SU-L1060'
  ];

  const statuses: Record<string, { label: string; dotClass: string }> = {
    'PN-L1161': { label: 'Finished', dotClass: 'bg-[#4CAF50]' },
    'PN-L1172': { label: 'Finished', dotClass: 'bg-[#4CAF50]' },
    'EC-L1253': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' },
    'BR-L1540': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' },
    'CO-L1245': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' },
    'PR-L1150': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' },
    'UR-L1193': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' },
    'SU-L1060': { label: 'Planned for the next 6 months', dotClass: 'bg-[#FFC107]' }
  };

  const fallbacks: Record<string, { name: string; country: string; ttl: string; amount: string }> = {
    'PN-L1161': {
      name: 'Program to Support the Digital Transformation of the Tax Administration in Panama',
      country: 'Panama',
      ttl: 'CALIJURI, MONICA',
      amount: '$40.0M'
    },
    'PN-L1172': {
      name: 'Fiscal Intelligence Program to Improve Spending Quality in Panama',
      country: 'Panama',
      ttl: 'GONZALEZ DE FRUTOS, UBALDO JESUS',
      amount: '$20.0M'
    },
    'EC-L1253': {
      name: 'Program to Improve Tax and Customs Administration',
      country: 'Ecuador',
      ttl: 'ZALTSMAN, TEODORO ARIEL',
      amount: '$84.0M'
    },
    'BR-L1540': {
      name: 'Fiscal Management Modernization Project for the State of Alagoas - PROFISCO II AL',
      country: 'Brazil',
      ttl: 'GONCALVES, CARLOS EDUARDO',
      amount: '$36.0M'
    },
    'CO-L1245': {
      name: 'Program to Support the Modernization of the National Tax and Customs Directorate',
      country: 'Colombia',
      ttl: 'LLEMPEN LOPEZ, ZOILA CRISTINA',
      amount: '$250.0M'
    },
    'PR-L1150': {
      name: 'Investments in Public Finances for Sustainable Development',
      country: 'Paraguay',
      ttl: 'LORA ROCHA, OSCAR',
      amount: '$25.0M'
    },
    'UR-L1193': {
      name: 'Fiscal Management Digital Transformation Program',
      country: 'Uruguay',
      ttl: 'CIAVOLIH MOTA, SERGIO RICARDO',
      amount: '$20.0M'
    },
    'SU-L1060': {
      name: 'Fiscal Support Program to Regain Growth',
      country: 'Suriname',
      ttl: 'REYES-TAGLE, GERARDO',
      amount: '$50.0M'
    }
  };

  const { tableData } = usePortfolioData();

  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = React.useState<Record<string, string[]>>({
    id: [],
    operationId: [],
    name: [],
    country: [],
    lendingType: [],
    ttl: [],
    amount: [],
    status: [],
  });
  const [openFilter, setOpenFilter] = React.useState<string | null>(null);

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

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

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

  const rawProjects = useMemo(() => {
    return targetIds.map(id => {
      const match = projects.find(p => p.id === id || p.id.toUpperCase() === id);
      const portfolioMatch = tableData.find(p => p.projectNumber === id || p.projectNumber.toUpperCase() === id);
      const fallback = fallbacks[id];
      const statusInfo = statuses[id];

      const rawAmount = match?.metadata?.investmentAmount || fallback.amount;
      const formattedAmount = String(rawAmount).replace('.0M', 'M');

      // Get lending type from active portfolio
      let lendingType = 'INV';
      if (portfolioMatch) {
        const instId = portfolioMatch.lendingInstrumentId;
        lendingType = portfolioMatch.projectNumber === 'PE-L1288' ? 'PBL' : (instId === 'LON-INV' ? 'INV' : instId === 'LON-PBL' ? 'PBL' : instId || 'INV');
      }

      // Get operation ID
      let operationId = portfolioMatch?.operationNumber || operationFallbacks[id] || '';
      if (id === 'EC-L1253') {
        operationId = '5598/OC-EC\n5599/OC-EC';
      }

      return {
        id,
        operationId,
        name: match?.name || fallback.name,
        country: match?.country || fallback.country,
        ttl: match?.ttl || fallback.ttl,
        amount: formattedAmount,
        status: isCriticalProcurement 
          ? (id === 'PN-L1161' ? "PN-L1161-P00074\nPN-L1161-P00062\nPN-L1161-P00067" : "PN-L1172-P00027")
          : statusInfo.label,
        dotClass: statusInfo.dotClass,
        lendingType
      };
    });
  }, [projects, tableData, isCriticalProcurement]);

  const uniqueIds = useMemo(() => Array.from(new Set(rawProjects.map(p => p.id))).sort(), [rawProjects]);
  const uniqueOperationIds = useMemo(() => Array.from(new Set(rawProjects.map(p => p.operationId))).sort(), [rawProjects]);
  const uniqueNames = useMemo(() => Array.from(new Set(rawProjects.map(p => p.name))).sort(), [rawProjects]);
  const uniqueCountries = useMemo(() => Array.from(new Set(rawProjects.map(p => p.country))).sort(), [rawProjects]);
  const uniqueLendingTypes = useMemo(() => Array.from(new Set(rawProjects.map(p => p.lendingType))).sort(), [rawProjects]);
  const uniqueTTLs = useMemo(() => Array.from(new Set(rawProjects.map(p => p.ttl))).sort(), [rawProjects]);
  const uniqueAmounts = useMemo(() => {
    return Array.from(new Set(rawProjects.map(p => p.amount))).sort((a, b) => {
      const cleanA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
      const cleanB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
      return cleanA - cleanB;
    });
  }, [rawProjects]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(rawProjects.map(p => p.status))).sort(), [rawProjects]);

  const filteredProjects = useMemo(() => {
    return rawProjects.filter(p => {
      if (filters.id.length > 0 && !filters.id.includes(p.id)) return false;
      if (filters.operationId && filters.operationId.length > 0 && !filters.operationId.includes(p.operationId)) return false;
      if (filters.name.length > 0 && !filters.name.includes(p.name)) return false;
      if (filters.country.length > 0 && !filters.country.includes(p.country)) return false;
      if (filters.lendingType.length > 0 && !filters.lendingType.includes(p.lendingType)) return false;
      if (filters.ttl.length > 0 && !filters.ttl.includes(p.ttl)) return false;
      if (filters.amount.length > 0 && !filters.amount.includes(p.amount)) return false;
      if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;
      return true;
    });
  }, [rawProjects, filters]);

  const displayedProjects = useMemo(() => {
    if (!sortConfig) return filteredProjects;

    return [...filteredProjects].sort((a, b) => {
      let valA = a[sortConfig.key as keyof typeof a];
      let valB = b[sortConfig.key as keyof typeof b];

      if (sortConfig.key === 'amount') {
        const numA = parseFloat(String(valA).replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(String(valB).replace(/[^0-9.]/g, '')) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortConfig]);

  const renderColumnHeader = (columnKey: string, label: string | React.ReactNode, options: string[], sortable: boolean = true, minWidth?: string) => {
    return (
      <th 
        className={`px-1.5 py-3 text-center border-b border-zinc-200 relative ${minWidth ? minWidth : ''}`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="leading-tight">{label}</span>
          <div className="flex items-center gap-0.5">
            {sortable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort(columnKey);
                }}
                className={`p-1 rounded hover:bg-zinc-200 transition-colors ${sortConfig?.key === columnKey ? 'text-[#005173]' : 'text-zinc-400'}`}
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 max-h-60 flex flex-col font-normal normal-case text-left">
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

  return (
    <div className="w-full">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel || "Back to Execution"}
        </button>

        {/* Title & Description with exact style/font matching */}
        <div className="mb-6">
          <h1 
            className="text-3xl md:text-4xl font-extrabold tracking-tight" 
            style={{ color: 'black' }}
            id="mid-term-evaluations-title"
          >
            {isCriticalProcurement ? "Critical Procurement Processes" : "Mid-term Evaluations"}
          </h1>
          <p className="text-zinc-600 text-sm mt-3 leading-relaxed">
            {isCriticalProcurement 
              ? "This section identifies projects with critical procurement processes, determined by their scale, complexity, thematic scope, or priority in driving project progress."
              : "This section summarizes key findings and actionable recommendations from the mid-term evaluations."}
          </p>
        </div>
      </motion.div>

      {/* Main Dashboard Section with exact styles */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="space-y-4 mt-6 w-full font-sans"
      >
        {/* Dashboard Table Component */}
        <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left border-collapse border-spacing-0 font-sans" style={{ boxSizing: 'border-box', width: '100%' }}>
              <thead className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                <tr>
                  <th className="px-1.5 py-3 text-center border-b border-zinc-200 w-14 min-w-[60px] max-w-[70px]">
                    N
                  </th>
                  {renderColumnHeader('id', <span>PROJECT<br/>ID</span>, uniqueIds, true, 'min-w-[108px] max-w-[122px] w-[115px]')}
                  {renderColumnHeader('operationId', <span>OPERATION<br/>ID</span>, uniqueOperationIds, true, 'min-w-[108px] max-w-[122px] w-[115px]')}
                  {renderColumnHeader('name', <span>PROJECT<br/>NAME</span>, uniqueNames, true, 'min-w-[220px]')}
                  {renderColumnHeader('country', 'COUNTRY', uniqueCountries, true, 'min-w-[150px] max-w-[170px] w-[160px]')}
                  {renderColumnHeader('lendingType', 'LENDING TYPE', uniqueLendingTypes, true, 'min-w-[100px] max-w-[115px] w-[108px]')}
                  {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[144px] max-w-[168px] w-[156px]')}
                  {renderColumnHeader('amount', <span>CURRENT APPROVED<br/>AMOUNT ($M)</span>, uniqueAmounts, true, 'min-w-[128px] max-w-[144px] w-[136px]')}
                  {renderColumnHeader('status', isCriticalProcurement ? <span>CRITICAL PROCUREMENT<br/>PROCESSES</span> : <span>MID-TERM<br/>EVALUATION STATUS</span>, uniqueStatuses, true, 'min-w-[185px] max-w-[215px] w-[200px]')}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-sm">
                {displayedProjects.map((project, index) => {
                  return (
                    <tr 
                      key={project.id}
                      className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                      onClick={() => onSelectProject?.(project.id)}
                    >
                      {/* N */}
                      <td className="px-1.5 py-2.5 text-center text-zinc-400 font-medium text-[10px] w-14 min-w-[60px] max-w-[70px]">
                        {index + 1}
                      </td>
                      
                      {/* Project ID */}
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-nowrap min-w-[108px] max-w-[122px] w-[115px]">
                        {project.id}
                      </td>

                      {/* Operation ID */}
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line min-w-[108px] max-w-[122px] w-[115px]">
                        {project.operationId}
                      </td>

                      {/* Project Name */}
                      <td className="px-1.5 py-2.5 min-w-[220px]">
                        <div className="text-black font-semibold text-[11px] leading-tight whitespace-normal break-words">
                          {project.name}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-1.5 py-2.5 text-center min-w-[150px] max-w-[170px] w-[160px]">
                        <div className="flex items-center justify-center gap-1.5">
                          {countryCodes[project.country] ? (
                            <img 
                              src={`https://flagcdn.com/w40/${countryCodes[project.country]}.png`} 
                              alt={project.country}
                              className="w-4 h-auto shadow-sm border border-zinc-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-lg">🏳️</span>
                          )}
                          <span className="text-zinc-500 text-[10px] font-medium">{project.country}</span>
                        </div>
                      </td>

                      {/* Lending Type */}
                      <td className="px-1.5 py-2.5 text-center min-w-[100px] max-w-[115px] w-[108px] text-zinc-500 text-[10px] font-medium leading-tight">
                        {project.lendingType}
                      </td>

                      {/* TTL */}
                      <td className="px-1.5 py-2.5 min-w-[144px] max-w-[168px] w-[156px] whitespace-normal break-words text-left text-zinc-500 text-[10px] font-medium font-sans leading-tight">
                        {project.ttl}
                      </td>

                      {/* Current Approved Amount */}
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-nowrap min-w-[128px] max-w-[144px] w-[136px]">
                        {project.amount}
                      </td>

                      {/* Mid-term Evaluation Status / Critical Procurement Processes */}
                      <td className="px-1.5 py-2.5 text-left min-w-[185px] max-w-[215px] w-[200px]">
                        {isCriticalProcurement ? (
                          <div className="flex flex-col gap-1 text-zinc-500 text-[10px] font-medium font-sans leading-tight whitespace-normal break-words">
                            {project.status.split('\n').map((code, codeIdx) => (
                              <div key={codeIdx}>{code}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-start gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${project.dotClass} flex-shrink-0`}></div>
                            <span className="text-zinc-500 text-[10px] font-medium leading-none">{project.status}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
