import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ArrowLeft, AlertTriangle, AlertCircle, Search, MapPin, User, ChevronDown, X, ChevronsUpDown, Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface AlertsProps {
  projects: Project[];
  onBack: () => void;
  onSelectProject?: (id: string) => void;
  initialState?: {
    openTabs: { id: string; number: number; title: string }[];
    activeTabId: string;
    tabSearchTerm: string;
    selectedSlice: string | null;
    tabFilters: Record<string, string[]>;
    tabSortConfig: { key: string, direction: 'asc' | 'desc' | null };
  };
  onStateChange?: (state: {
    openTabs: { id: string; number: number; title: string }[];
    activeTabId: string;
    tabSearchTerm: string;
    selectedSlice: string | null;
    tabFilters: Record<string, string[]>;
    tabSortConfig: { key: string, direction: 'asc' | 'desc' | null };
  }) => void;
}

// Helper functions for SVG donut charts
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const getIndicatorBoxColor = (colorClass: string) => {
  if (colorClass.includes('red-')) return '#e60000';
  if (colorClass.includes('amber-') || colorClass.includes('yellow-')) return '#ffb300';
  if (colorClass.includes('emerald-') || colorClass.includes('green-')) return '#00b04f';
  return '#cccccc';
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

const getCardDetails = (cardNumber: number, list: Project[]) => {
  switch (cardNumber) {
    case 1:
      return {
        description: "The indicator includes projects approved by the Bank's Board of Directors whose loan contract(s) are pending signature or ratification. The warning is activated when the regulatory deadline for signing is exceeded. The regulatory term is 12 months when prior legislative approval is required, or 3 months when it is not required.",
        columns: [
          { key: 'effectivenessStatus', label: 'Plazo Transcurrido' }
        ],
        projects: [
          ...['ME-L1309', 'UR-L1205'].map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
            ...p,
            effectivenessStatus: '+3 meses de extensión',
            effectivenessColor: 'bg-amber-100 text-amber-800'
          })),
          ...['BR-L1656', 'BR-L1658', 'BR-L1629', 'AR-L1416'].map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
            ...p,
            effectivenessStatus: 'Dentro del plazo (OA-420/423)',
            effectivenessColor: 'bg-emerald-100 text-emerald-800'
          }))
        ]
      };
    case 2:
      return {
        description: "Projects with signed loan contracts and pending full eligibility are included; 100% of the clauses must be fulfilled and the approval of the Country Office Representative is required for completion.",
        columns: [
          { key: 'eligibilityStatus', label: 'Estatus de Extensión' }
        ],
        projects: [list.find(p => p.id === 'PE-L1288') || list[6]].filter(Boolean).map((p) => ({
          ...p,
          eligibilityStatus: '+6 meses de extensión',
          eligibilityColor: 'bg-red-100 text-red-800 border-red-200'
        }))
      };
    case 3:
      return {
        description: "The indicator includes eligible projects from the active portfolio that have not yet made their first disbursement.The warning is activated if the project does not make its first disbursement within a month of being declared eligible.",
        columns: [
          { key: 'disbursementStatus', label: 'Retraso de Desembolso' }
        ],
        projects: [list.find(p => p.id === 'PE-L1278') || list[7]].filter(Boolean).map((p) => ({
          ...p,
          disbursementStatus: '1-6 meses de retraso',
          disbursementColor: 'bg-amber-100 text-amber-800 border-amber-200'
        }))
      };
    case 4: {
      const redIds = ['PN-L1172', 'PN-L1161', 'BR-L1513'];
      const yellowIds = ['BL-L1031', 'AR-L1248', 'CO-L1164', 'AR-L1285', 'SU-L1060', 'BR-L1501', 'BR-L1525', 'EC-L1253'];
      const greenIds = ['BL-L1038', 'BR-L1517', 'PR-L1150'];

      const redProjects = redIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        noDisbStatus: '+12 meses transcurridos',
        noDisbColor: 'bg-red-100 text-red-800 border-red-200'
      }));

      const yellowProjects = yellowIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        noDisbStatus: '7-12 meses transcurridos',
        noDisbColor: 'bg-amber-100 text-amber-800 border-amber-200'
      }));

      const greenProjects = greenIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        noDisbStatus: '6 meses transcurridos',
        noDisbColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }));

      return {
        description: "The indicator includes eligible projects that have not disbursed for more than 6 months since their eligibility. Projects that have already disbursed 100% of their resources are not included.",
        columns: [
          { key: 'noDisbStatus', label: 'Tiempo sin desembolsos' }
        ],
        projects: [...redProjects, ...yellowProjects, ...greenProjects]
      };
    }
    case 5: {
      const yellowIds = ['PE-L1266', 'EC-L1253', 'PN-L1172'];
      const greenIds = [
        'UR-L1111', 'BR-L1377', 'BR-L1511', 'BR-L1534', 'EC-L1251',
        'EC-L1230', 'BL-L1031', 'PE-L1231', 'BR-L1501', 'BR-L1516',
        'PE-L1239', 'BR-L1527', 'AR-L1248', 'BR-L1535', 'BR-L1550',
        'BR-L1533', 'BR-L1517', 'PR-L1150', 'BL-L1038', 'CO-L1164',
        'CO-L1245', 'PN-L1161', 'AR-L1285'
      ];

      const yellowProjects = yellowIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        lifeDisbPercent: '11%-25% Desembolsado',
        lifeDisbColor: 'bg-amber-100 text-amber-800 border-amber-200'
      }));

      const greenProjects = greenIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        lifeDisbPercent: '>25% Desembolsado',
        lifeDisbColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }));

      return {
        description: "The indicator includes eligible projects with more than 36 months in execution. It classifies these projects according to their disbursed life amount as a percentage of their current approved amount.",
        columns: [
          { key: 'lifeDisbPercent', label: 'Porcentaje Desembolsado / Estatus' }
        ],
        projects: [...yellowProjects, ...greenProjects]
      };
    }
    case 6: {
      const yellowIds = [
        'EC-L1230', 'AR-L1285', 'CO-L1164', 'CO-L1245', 'PN-L1161',
        'PE-L1266', 'BL-L1038', 'PN-L1172', 'EC-L1253', 'UR-L1164',
        'CH-L1178', 'BR-L1592', 'BR-L1614', 'PE-L1278'
      ];
      const greenIds = [
        'AR-L1416', 'BR-L1629', 'BR-L1656', 'BR-L1658', 'ME-L1309',
        'PE-L1288', 'UR-L1205', 'AR-L1248', 'UR-L1111', 'BR-L1377',
        'PE-L1231', 'PE-L1239', 'BR-L1501', 'BR-L1511', 'BR-L1516',
        'BL-L1031', 'EC-L1251', 'BR-L1527', 'PR-L1150', 'BR-L1534',
        'BR-L1535', 'BR-L1517', 'BR-L1533', 'BR-L1550', 'SU-L1060',
        'BR-L1539', 'BR-L1540', 'UR-L1193', 'BR-L1599', 'BR-L1513',
        'BR-L1525', 'AR-L1405', 'PR-L1192', 'BR-L1643'
      ];

      const yellowProjects = yellowIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        pmrPerfStatus: 'Con alerta o problema: 1-2',
        pmrPerfColor: 'bg-amber-100 text-amber-800 border-amber-200'
      }));

      const greenProjects = greenIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        pmrPerfStatus: 'Sin alerta o problema',
        pmrPerfColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }));

      return {
        description: "Projects in the active portfolio (since COO approval) that have received at least one performance rating in the past three years are included. The warning is activated if the project is classified as alert or problem in at least one of the last three PMR cycles.",
        columns: [
          { key: 'pmrPerfStatus', label: 'Estatus PMR (Señales de Alerta)' }
        ],
        projects: [...yellowProjects, ...greenProjects]
      };
    }
    case 7: {
      const yellowIds = ['BR-L1377', 'UR-L1111'];
      const redIds = ['EC-L1230', 'PE-L1231', 'EC-L1251'];
      const greenIds = [
        'AR-L1416', 'BR-L1629', 'BR-L1656', 'BR-L1658', 'ME-L1309',
        'PE-L1288', 'UR-L1205', 'AR-L1248', 'PE-L1239', 'BR-L1501',
        'BR-L1511', 'AR-L1285', 'CO-L1164', 'BR-L1516', 'BL-L1031',
        'BR-L1527', 'CO-L1245', 'PR-L1150', 'BR-L1534', 'PN-L1161',
        'PE-L1266', 'BR-L1535', 'BR-L1517', 'BR-L1533', 'BL-L1038',
        'PN-L1172', 'BR-L1550', 'EC-L1253', 'SU-L1060', 'BR-L1539',
        'BR-L1540', 'UR-L1164', 'UR-L1193', 'BR-L1599', 'BR-L1513',
        'BR-L1525', 'CH-L1178', 'BR-L1592', 'AR-L1405', 'PR-L1192',
        'BR-L1643', 'BR-L1614', 'PE-L1278'
      ];

      const redProjects = redIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        cancellationStatus: 'Cancelación > 15%',
        cancellationColor: 'bg-red-100 text-red-800 border-red-200'
      }));

      const yellowProjects = yellowIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        cancellationStatus: 'Cancelación Hasta 15%',
        cancellationColor: 'bg-amber-100 text-amber-800 border-amber-200'
      }));

      const greenProjects = greenIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        cancellationStatus: 'Sin cancelación parcial',
        cancellationColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }));

      return {
        description: "The indicator includes projects in active portfolio that have cancelled a portion of their original approved amount. Projects that have canceled all of their resources are not included. The warning is activated when a project has a partial cancellation, regardless of the amount or the moment in which it was cancelled.",
        columns: [
          { key: 'cancellationStatus', label: 'Estatus de Cancelación' }
        ],
        projects: [...redProjects, ...yellowProjects, ...greenProjects]
      };
    }
    case 8: {
      const yellowIds = ['EC-L1251', 'BR-L1534', 'BR-L1511', 'BR-L1377', 'EC-L1230', 'UR-L1111'];
      const greenIds = ['AR-L1248'];

      const yellowProjects = yellowIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        expiredDeadlineStatus: '5-12 meses atrasado',
        expiredDeadlineColor: 'bg-amber-100 text-amber-800 border-amber-200'
      }));

      const greenProjects = greenIds.map(id => list.find(p => p.id === id)).filter(Boolean).map(p => ({
        ...p,
        expiredDeadlineStatus: '0-4 meses atrasado',
        expiredDeadlineColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }));

      return {
        description: "The indicator includes projects that have exceeded the term for the current last disbursement date, but have not justified 100% of the resources and its operational closure is pending. The warning is activated if 120 days after the date of the last current disbursement, the project has not achieved its operational closure (COO).",
        columns: [
          { key: 'expiredDeadlineStatus', label: 'Retraso de Plazo' }
        ],
        projects: [...yellowProjects, ...greenProjects]
      };
    }
    default:
      return { description: '', columns: [], projects: [] };
  }
};

export default function Alerts({ projects, onBack, onSelectProject, initialState, onStateChange }: AlertsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertLevel, setSelectedAlertLevel] = useState<string>('ALL');

  const [openTabs, setOpenTabs] = useState<{ id: string; number: number; title: string }[]>(
    initialState?.openTabs || [{ id: 'overview', number: 0, title: 'Scorecard' }]
  );
  const [activeTabId, setActiveTabId] = useState<string>(initialState?.activeTabId || 'overview');
  const [tabSearchTerm, setTabSearchTerm] = useState<string>(initialState?.tabSearchTerm || '');
  const [selectedSlice, setSelectedSlice] = useState<string | null>(initialState?.selectedSlice || null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    const updatedTabs = [...openTabs];
    const [removed] = updatedTabs.splice(draggedIndex, 1);
    updatedTabs.splice(targetIndex, 0, removed);
    setOpenTabs(updatedTabs);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const [tabFilters, setTabFilters] = useState<Record<string, string[]>>(
    initialState?.tabFilters || {
      id: [],
      name: [],
      country: [],
      ttl: [],
      status: []
    }
  );
  const [openTabFilter, setOpenTabFilter] = useState<string | null>(null);
  const [tabSortConfig, setTabSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>(
    initialState?.tabSortConfig || { key: '', direction: null }
  );

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    onStateChange?.({
      openTabs,
      activeTabId,
      tabSearchTerm,
      selectedSlice,
      tabFilters,
      tabSortConfig
    });
  }, [openTabs, activeTabId, tabSearchTerm, selectedSlice, tabFilters, tabSortConfig, onStateChange]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openTabFilter && !(e.target as Element).closest('.tab-filter-dropdown')) {
        setOpenTabFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openTabFilter]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setTabFilters({
      id: [],
      name: [],
      country: [],
      ttl: [],
      status: []
    });
    setTabSortConfig({ key: '', direction: null });
    setOpenTabFilter(null);
  }, [activeTabId]);

  const isSelected = (status: string) => selectedSlice === status;
  const getOpacity = (status: string, isInsideTab: boolean) => {
    if (!isInsideTab) return "1";
    if (!selectedSlice) return "1";
    return isSelected(status) ? "1" : "0.3";
  };

  const handleSliceClick = (status: string, isInsideTab: boolean) => {
    if (!isInsideTab) return;
    if (selectedSlice === status) {
      setSelectedSlice(null);
    } else {
      setSelectedSlice(status);
    }
  };

  const renderLegendItem = (color: string, label: string, statusKey: string, isInsideTab: boolean) => {
    const isFiltered = selectedSlice === statusKey;
    const hasFilter = selectedSlice !== null;
    
    return (
      <div 
        onClick={() => handleSliceClick(statusKey, isInsideTab)}
        className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all ${
          isInsideTab 
            ? `cursor-pointer ${
                isFiltered 
                  ? 'bg-zinc-200/90 font-extrabold border border-zinc-300 shadow-sm' 
                  : hasFilter 
                    ? 'opacity-40 hover:opacity-80 hover:bg-zinc-100/30' 
                    : 'hover:bg-zinc-100/50'
              }`
            : ''
        }`}
      >
        <div className="w-3 h-3 rounded-sm shrink-0 shadow-sm font-sans" style={{ backgroundColor: color }} />
        <span className={`text-[11px] truncate font-sans ${isFiltered ? 'text-zinc-950 font-extrabold' : 'text-zinc-700 font-semibold'}`}>
          {label}
        </span>
      </div>
    );
  };

  // Filter projects that are either "Alert" or "Problem" in PMR 2026
  const alertProjects = useMemo(() => {
    return projects.filter(project => {
      const pmrStatus = project.metadata?.pmr2026?.status;
      return pmrStatus === 'Alert' || pmrStatus === 'Problem';
    });
  }, [projects]);

  // Apply search and alert level filter
  const filteredAlerts = useMemo(() => {
    return alertProjects.filter(project => {
      const pmrStatus = project.metadata?.pmr2026?.status || 'N/A';
      const matchesSearch = 
        project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.ttl.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedAlertLevel === 'ALL' || pmrStatus === selectedAlertLevel;

      return matchesSearch && matchesLevel;
    });
  }, [alertProjects, searchTerm, selectedAlertLevel]);

  // Metrics
  const alertCount = alertProjects.filter(p => p.metadata?.pmr2026?.status === 'Alert').length;
  const problemCount = alertProjects.filter(p => p.metadata?.pmr2026?.status === 'Problem').length;

  // Precomputed coordinates for Donut segments (20% larger: center at 86, radius at 58)
  // Card 1 Donut: Yellow (0 to 120 deg), Green (120 to 360 deg)
  const card1YellowArc = describeArc(86, 86, 58, 0, 120);
  const card1GreenArc = describeArc(86, 86, 58, 120, 360);
  const card1YellowLabel = polarToCartesian(86, 86, 58, 60);
  const card1GreenLabel = polarToCartesian(86, 86, 58, 240);

  // Card 2 Donut: Full Red (-0.1 to 359.9 deg)
  const card2RedArc = describeArc(86, 86, 58, 0, 359.9);
  const card2RedLabel = polarToCartesian(86, 86, 58, 180);

  // Card 3 Donut: Full Yellow (-0.1 to 359.9 deg)
  const card3YellowArc = describeArc(86, 86, 58, 0, 359.9);
  const card3YellowLabel = polarToCartesian(86, 86, 58, 180);

  // Card 4 Donut: Red (0 to 77.1 deg), Yellow (77.1 to 282.9 deg), Green (282.9 to 360 deg)
  const card4RedArc = describeArc(86, 86, 58, 0, 77.1);
  const card4YellowArc = describeArc(86, 86, 58, 77.1, 282.9);
  const card4GreenArc = describeArc(86, 86, 58, 282.9, 360);
  const card4RedLabel = polarToCartesian(86, 86, 58, 38.6);
  const card4YellowLabel = polarToCartesian(86, 86, 58, 180);
  const card4GreenLabel = polarToCartesian(86, 86, 58, 321.4);

  // Card 5 Donut: Yellow (0 to 41.5 deg), Green (41.5 to 360 deg)
  const card5YellowArc = describeArc(86, 86, 58, 0, 41.5);
  const card5GreenArc = describeArc(86, 86, 58, 41.5, 360);
  const card5YellowLabel = polarToCartesian(86, 86, 58, 20.7);
  const card5GreenLabel = polarToCartesian(86, 86, 58, 200.7);

  // Card 6 Donut: Yellow (0 to 105 deg), Green (105 to 360 deg)
  const card6YellowArc = describeArc(86, 86, 58, 0, 105);
  const card6GreenArc = describeArc(86, 86, 58, 105, 360);
  const card6YellowLabel = polarToCartesian(86, 86, 58, 52.5);
  const card6GreenLabel = polarToCartesian(86, 86, 58, 232.5);

  // Card 7 Donut: Red (0 to 23 deg), Yellow (23 to 38 deg), Green (38 to 360 deg)
  const card7RedArc = describeArc(86, 86, 58, 0, 23);
  const card7YellowArc = describeArc(86, 86, 58, 23, 38);
  const card7GreenArc = describeArc(86, 86, 58, 38, 360);
  const card7RedLabel = polarToCartesian(86, 86, 58, 11.5);
  const card7YellowLabel = polarToCartesian(86, 86, 58, 30.5);
  const card7GreenLabel = polarToCartesian(86, 86, 58, 199);

  // Card 8 Donut: Yellow (0 to 308.6 deg), Green (308.6 to 360 deg)
  const card8YellowArc = describeArc(86, 86, 58, 0, 308.6);
  const card8GreenArc = describeArc(86, 86, 58, 308.6, 360);
  const card8YellowLabel = polarToCartesian(86, 86, 58, 154.3);
  const card8GreenLabel = polarToCartesian(86, 86, 58, 334.3);

  const renderIndicatorDonut = (cardNumber: number, isInsideTab: boolean = false) => {
    let subtitle: React.ReactNode = null;
    let projectsCount = 0;
    let donutChart: React.ReactNode = null;
    let legends: React.ReactNode = null;

    switch (cardNumber) {
      case 1:
        projectsCount = 6;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card1GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('Dentro del plazo (OA-420/423)') ? 35 : 29} 
              opacity={getOpacity('Dentro del plazo (OA-420/423)', isInsideTab)}
              onClick={() => handleSliceClick('Dentro del plazo (OA-420/423)', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card1YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('+3 meses de extensión') ? 35 : 29} 
              opacity={getOpacity('+3 meses de extensión', isInsideTab)}
              onClick={() => handleSliceClick('+3 meses de extensión', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card1YellowLabel.x} y={card1YellowLabel.y} transform={`rotate(90, ${card1YellowLabel.x}, ${card1YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>2</text>
            <text x={card1GreenLabel.x} y={card1GreenLabel.y} transform={`rotate(90, ${card1GreenLabel.x}, ${card1GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>4</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+1 año de extensión', '+1 año de extensión', isInsideTab)}
            {renderLegendItem('#ffb300', '+3 meses de extensión', '+3 meses de extensión', isInsideTab)}
            {renderLegendItem('#00b04f', 'Dentro del plazo (OA-420/423)', 'Dentro del plazo (OA-420/423)', isInsideTab)}
          </div>
        );
        break;
      case 2:
        projectsCount = 1;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <circle 
              cx="86" 
              cy="86" 
              r="58" 
              fill="none" 
              stroke="#e60000" 
              strokeWidth={isSelected('+6 meses de extensión') ? 35 : 29} 
              opacity={getOpacity('+6 meses de extensión', isInsideTab)}
              onClick={() => handleSliceClick('+6 meses de extensión', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
            />
            <text x={card2RedLabel.x} y={card2RedLabel.y} transform={`rotate(90, ${card2RedLabel.x}, ${card2RedLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>1</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+6 meses de extensión', '+6 meses de extensión', isInsideTab)}
            {renderLegendItem('#ffb300', '6 meses de extensión', '6 meses de extensión', isInsideTab)}
            {renderLegendItem('#00b04f', 'Dentro del plazo (OA-420/423)', 'Dentro del plazo (OA-420/423)', isInsideTab)}
          </div>
        );
        break;
      case 3:
        projectsCount = 1;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <circle 
              cx="86" 
              cy="86" 
              r="58" 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('1-6 meses de retraso') ? 35 : 29} 
              opacity={getOpacity('1-6 meses de retraso', isInsideTab)}
              onClick={() => handleSliceClick('1-6 meses de retraso', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
            />
            <text x={card3YellowLabel.x} y={card3YellowLabel.y} transform={`rotate(90, ${card3YellowLabel.x}, ${card3YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>1</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+6 meses', '+6 meses', isInsideTab)}
            {renderLegendItem('#ffb300', '1-6 meses', '1-6 meses de retraso', isInsideTab)}
            {renderLegendItem('#00b04f', 'Menos de 1 mes', 'Menos de 1 mes', isInsideTab)}
          </div>
        );
        break;
      case 4:
        projectsCount = 14;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card4GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('6 meses transcurridos') ? 35 : 29} 
              opacity={getOpacity('6 meses transcurridos', isInsideTab)}
              onClick={() => handleSliceClick('6 meses transcurridos', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card4YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('7-12 meses transcurridos') ? 35 : 29} 
              opacity={getOpacity('7-12 meses transcurridos', isInsideTab)}
              onClick={() => handleSliceClick('7-12 meses transcurridos', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card4RedArc} 
              fill="none" 
              stroke="#e60000" 
              strokeWidth={isSelected('+12 meses transcurridos') ? 35 : 29} 
              opacity={getOpacity('+12 meses transcurridos', isInsideTab)}
              onClick={() => handleSliceClick('+12 meses transcurridos', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card4RedLabel.x} y={card4RedLabel.y} transform={`rotate(90, ${card4RedLabel.x}, ${card4RedLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>3</text>
            <text x={card4YellowLabel.x} y={card4YellowLabel.y} transform={`rotate(90, ${card4YellowLabel.x}, ${card4YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>8</text>
            <text x={card4GreenLabel.x} y={card4GreenLabel.y} transform={`rotate(90, ${card4GreenLabel.x}, ${card4GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>3</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+12 meses', '+12 meses transcurridos', isInsideTab)}
            {renderLegendItem('#ffb300', '7-12 meses', '7-12 meses transcurridos', isInsideTab)}
            {renderLegendItem('#00b04f', '6 meses', '6 meses transcurridos', isInsideTab)}
          </div>
        );
        break;
      case 5:
        subtitle = null;
        projectsCount = 26;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card5GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('>25% Desembolsado') ? 35 : 29} 
              opacity={getOpacity('>25% Desembolsado', isInsideTab)}
              onClick={() => handleSliceClick('>25% Desembolsado', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card5YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('11%-25% Desembolsado') ? 35 : 29} 
              opacity={getOpacity('11%-25% Desembolsado', isInsideTab)}
              onClick={() => handleSliceClick('11%-25% Desembolsado', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card5YellowLabel.x} y={card5YellowLabel.y} transform={`rotate(90, ${card5YellowLabel.x}, ${card5YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>3</text>
            <text x={card5GreenLabel.x} y={card5GreenLabel.y} transform={`rotate(90, ${card5GreenLabel.x}, ${card5GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>23</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '0%-10%', '0%-10%', isInsideTab)}
            {renderLegendItem('#ffb300', '11%-25%', '11%-25% Desembolsado', isInsideTab)}
            {renderLegendItem('#00b04f', '>25%', '>25% Desembolsado', isInsideTab)}
          </div>
        );
        break;
      case 6:
        subtitle = null;
        projectsCount = 48;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card6GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('Sin alerta o problema') ? 35 : 29} 
              opacity={getOpacity('Sin alerta o problema', isInsideTab)}
              onClick={() => handleSliceClick('Sin alerta o problema', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card6YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('Con alerta o problema: 1-2') ? 35 : 29} 
              opacity={getOpacity('Con alerta o problema: 1-2', isInsideTab)}
              onClick={() => handleSliceClick('Con alerta o problema: 1-2', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card6YellowLabel.x} y={card6YellowLabel.y} transform={`rotate(90, ${card6YellowLabel.x}, ${card6YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>14</text>
            <text x={card6GreenLabel.x} y={card6GreenLabel.y} transform={`rotate(90, ${card6GreenLabel.x}, ${card6GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>34</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', 'Con alerta o problema: 3', 'Con alerta o problema: 3', isInsideTab)}
            {renderLegendItem('#ffb300', 'Con alerta o problema: 1-2', 'Con alerta o problema: 1-2', isInsideTab)}
            {renderLegendItem('#00b04f', 'Sin alerta o problema', 'Sin alerta o problema', isInsideTab)}
          </div>
        );
        break;
      case 7:
        projectsCount = 48;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card7GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('Sin cancelación parcial') ? 35 : 29} 
              opacity={getOpacity('Sin cancelación parcial', isInsideTab)}
              onClick={() => handleSliceClick('Sin cancelación parcial', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card7YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('Cancelación Hasta 15%') ? 35 : 29} 
              opacity={getOpacity('Cancelación Hasta 15%', isInsideTab)}
              onClick={() => handleSliceClick('Cancelación Hasta 15%', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card7RedArc} 
              fill="none" 
              stroke="#e60000" 
              strokeWidth={isSelected('Cancelación > 15%') ? 35 : 29} 
              opacity={getOpacity('Cancelación > 15%', isInsideTab)}
              onClick={() => handleSliceClick('Cancelación > 15%', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card7RedLabel.x} y={card7RedLabel.y} transform={`rotate(90, ${card7RedLabel.x}, ${card7RedLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>3</text>
            <text x={card7YellowLabel.x} y={card7YellowLabel.y} transform={`rotate(90, ${card7YellowLabel.x}, ${card7YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>2</text>
            <text x={card7GreenLabel.x} y={card7GreenLabel.y} transform={`rotate(90, ${card7GreenLabel.x}, ${card7GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>43</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+15%', 'Cancelación > 15%', isInsideTab)}
            {renderLegendItem('#ffb300', 'Hasta 15%', 'Cancelación Hasta 15%', isInsideTab)}
            {renderLegendItem('#00b04f', 'Sin cancelación parcial', 'Sin cancelación parcial', isInsideTab)}
          </div>
        );
        break;
      case 8:
        projectsCount = 7;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <path 
              d={card8GreenArc} 
              fill="none" 
              stroke="#00b04f" 
              strokeWidth={isSelected('0-4 meses atrasado') ? 35 : 29} 
              opacity={getOpacity('0-4 meses atrasado', isInsideTab)}
              onClick={() => handleSliceClick('0-4 meses atrasado', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <path 
              d={card8YellowArc} 
              fill="none" 
              stroke="#ffb300" 
              strokeWidth={isSelected('5-12 meses atrasado') ? 35 : 29} 
              opacity={getOpacity('5-12 meses atrasado', isInsideTab)}
              onClick={() => handleSliceClick('5-12 meses atrasado', isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
              strokeLinecap="butt" 
            />
            <text x={card8YellowLabel.x} y={card8YellowLabel.y} transform={`rotate(90, ${card8YellowLabel.x}, ${card8YellowLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>6</text>
            <text x={card8GreenLabel.x} y={card8GreenLabel.y} transform={`rotate(90, ${card8GreenLabel.x}, ${card8GreenLabel.y})`} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>1</text>
          </svg>
        );
        legends = (
          <div className="space-y-1 w-full">
            {renderLegendItem('#e60000', '+12 meses', '+12 meses', isInsideTab)}
            {renderLegendItem('#ffb300', '5-12 meses', '5-12 meses atrasado', isInsideTab)}
            {renderLegendItem('#00b04f', '0-4 meses', '0-4 meses atrasado', isInsideTab)}
          </div>
        );
        break;
      default:
        return null;
    }

    if (isInsideTab) {
      return (
        <div className="w-full flex flex-col items-center">
          {subtitle}
          <p className="text-zinc-800 font-bold text-sm md:text-base mt-2 mb-4 text-center font-sans">
            Total Projects in indicator: {projectsCount}
          </p>
          <div className="w-[172px] h-[172px] flex items-center justify-center mb-6 relative">
            {donutChart}
          </div>
          
          <div className="w-full space-y-1 text-zinc-700 text-xs self-start px-2 mt-auto">
            {legends}
          </div>
        </div>
      );
    }

    return (
      <>
        {subtitle}
        <p className="text-zinc-800 font-bold text-sm md:text-base mt-2 mb-4 text-center">
          Total Projects in indicator: {projectsCount}
        </p>

        <div className="w-[172px] h-[172px] flex items-center justify-center mb-6 relative">
          {donutChart}
        </div>

        {/* Legend */}
        <div className="w-full space-y-1 text-zinc-700 text-xs self-start px-2 mt-auto">
          {legends}
        </div>
      </>
    );
  };

  // Tab functions
  const openAlertTab = (number: number, title: string) => {
    const tabId = `card-${number}`;
    if (!openTabs.some(t => t.id === tabId)) {
      setOpenTabs([...openTabs, { id: tabId, number, title }]);
    }
    setActiveTabId(tabId);
    setTabSearchTerm('');
    setSelectedSlice(null);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabId === 'overview') return;
    
    const targetIndex = openTabs.findIndex(t => t.id === tabId);
    const updatedTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(updatedTabs);
    
    if (activeTabId === tabId) {
      const nextTab = updatedTabs[targetIndex - 1] || updatedTabs[0];
      setActiveTabId(nextTab.id);
      setTabSearchTerm('');
      setSelectedSlice(null);
    }
  };

  const activeTabDetails = useMemo(() => {
    if (activeTabId === 'overview') return null;
    const num = parseInt(activeTabId.replace('card-', ''), 10);
    return getCardDetails(num, projects);
  }, [activeTabId, projects]);

  const uniqueTabIds = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.id))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabNames = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.name))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabCountries = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.country))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabTTLs = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.ttl))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabStatusChoices = useMemo(() => {
    if (!activeTabDetails) return [];
    const colKey = activeTabDetails.columns[0]?.key;
    if (!colKey) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => (p as any)[colKey] as string))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const handleTabSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (tabSortConfig.key === key && tabSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (tabSortConfig.key === key && tabSortConfig.direction === 'desc') {
      direction = null;
    }
    setTabSortConfig({ key, direction });
  };

  const toggleTabFilter = (column: string, value: string) => {
    setTabFilters(prev => {
      const current = prev[column] || [];
      if (current.includes(value)) {
        return { ...prev, [column]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [column]: [...current, value] };
      }
    });
  };

  const filteredTabProjects = useMemo(() => {
    if (!activeTabDetails) return [];
    return activeTabDetails.projects.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.country.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.ttl.toLowerCase().includes(tabSearchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Slice click donut filter
      if (selectedSlice) {
        const colKey = activeTabDetails.columns[0]?.key;
        if (colKey) {
          if ((p as any)[colKey] !== selectedSlice) return false;
        }
      }

      // Dropdown checkbox filters
      const matchesIdField = tabFilters.id.length === 0 || tabFilters.id.includes(p.id);
      const matchesNameField = tabFilters.name.length === 0 || tabFilters.name.includes(p.name);
      const matchesCountryField = tabFilters.country.length === 0 || tabFilters.country.includes(p.country);
      const matchesTtlField = tabFilters.ttl.length === 0 || tabFilters.ttl.includes(p.ttl);

      const colKey = activeTabDetails.columns[0]?.key;
      const indicatorValue = colKey ? (p as any)[colKey] : '';
      const matchesStatusField = tabFilters.status.length === 0 || tabFilters.status.includes(indicatorValue);

      return matchesIdField && matchesNameField && matchesCountryField && matchesTtlField && matchesStatusField;
    }).sort((a, b) => {
      if (!tabSortConfig.key || !tabSortConfig.direction) return 0;
      
      let aVal: any = '';
      let bVal: any = '';
      
      if (tabSortConfig.key === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else if (tabSortConfig.key === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (tabSortConfig.key === 'country') {
        aVal = a.country;
        bVal = b.country;
      } else if (tabSortConfig.key === 'ttl') {
        aVal = a.ttl;
        bVal = b.ttl;
      } else if (tabSortConfig.key === 'investment') {
        const parseValue = (str: string) => {
          const num = parseFloat(str.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        };
        aVal = parseValue(a.metadata?.investmentAmount || '');
        bVal = parseValue(b.metadata?.investmentAmount || '');
      } else if (tabSortConfig.key === 'status') {
        const colKey = activeTabDetails.columns[0]?.key;
        aVal = colKey ? (a as any)[colKey] : '';
        bVal = colKey ? (b as any)[colKey] : '';
      }

      const order = tabSortConfig.direction === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }, [activeTabDetails, tabSearchTerm, selectedSlice, tabFilters, tabSortConfig]);

  const renderTabColumnHeader = (columnKey: string, label: string | React.ReactNode, options: string[], sortable: boolean = true, minWidth?: string) => {
    const isFiltered = tabFilters[columnKey]?.length > 0;
    return (
      <th 
        className={`px-3 py-3 text-center relative font-bold text-[10px] text-zinc-900 uppercase tracking-wider border-b border-zinc-200 ${minWidth ? minWidth : ''}`}
      >
        <div className="flex items-center justify-center gap-1.5 font-sans">
          <span className="leading-tight">{label}</span>
          <div className="flex items-center gap-0.5">
            {sortable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabSort(columnKey);
                }}
                className={`p-1 rounded hover:bg-zinc-200 transition-colors ${tabSortConfig.key === columnKey ? 'text-[#005173]' : 'text-zinc-600'}`}
                title="Sort"
              >
                <ChevronsUpDown className="w-3" style={{ height: '12px', width: '12px' }} />
              </button>
            )}
            
            {options.length > 0 && (
              <div className="relative tab-filter-dropdown inline-block">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTabFilter(openTabFilter === columnKey ? null : columnKey);
                  }}
                  className={`p-1 rounded hover:bg-zinc-200 transition-colors ${isFiltered ? 'text-[#005173]' : 'text-zinc-650'}`}
                  title="Filter"
                >
                  <Filter className="w-3 h-3" />
                </button>
                
                {openTabFilter === columnKey && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 max-h-60 flex flex-col font-normal normal-case">
                    <div className="p-2 border-b border-zinc-100 bg-white text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTabFilters(prev => ({ ...prev, [columnKey]: [] }));
                        }}
                        className="text-xs text-[#005173] hover:underline w-full text-left font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                    <div className="p-2 flex flex-col gap-1 overflow-y-auto text-left">
                      {options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1.5 rounded">
                          <input 
                            type="checkbox" 
                            checked={tabFilters[columnKey]?.includes(opt) || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTabFilter(columnKey, opt);
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
      {/* Header section with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Execution
        </button>

        {/* Header with strictly black font color */}
        <div className="mb-4">
          <h1 
            className="text-3xl md:text-4xl font-extrabold tracking-tight" 
            style={{ color: 'black' }}
            id="alerts-indicators-title"
          >
            Alerts
          </h1>
          <br />
          <p className="text-zinc-600">
            This section shows key warning indicators before and during the execution phase.
          </p>
        </div>
      </motion.div>

      {/* Content section with slide-up entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="space-y-8 mt-8 w-full"
      >
        {/* Tab Navigation Menu */}
        <div className="flex border-b border-zinc-200/85 overflow-x-auto pb-px gap-1.5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {openTabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isDraggingThis = draggedIndex === index;
            const isDragOverThis = dragOverIndex === index;
            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setTabSearchTerm('');
                  setSelectedSlice(null);
                }}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-t-xl transition-all border-t border-x text-xs font-bold uppercase tracking-wider whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-white text-[#005173] border-zinc-200 border-b-white z-10 font-extrabold shadow-sm'
                    : 'bg-zinc-50/75 border-transparent text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/50'
                } ${isDraggingThis ? 'opacity-40 bg-zinc-200/50 border-dashed border-zinc-300' : 'cursor-grab active:cursor-grabbing'} ${
                  isDragOverThis && !isDraggingThis ? 'border-l-4 border-l-[#005173] bg-zinc-100' : ''
                }`}
              >
                {tab.number > 0 && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 ${
                    isActive ? 'bg-[#005173] text-white' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {tab.number}
                  </span>
                )}
                <span>{tab.title}</span>
                {tab.id !== 'overview' && (
                  <button
                    onClick={(e) => closeTab(e, tab.id)}
                    className="ml-1 p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {activeTabId === 'overview' ? (
          <>
            {/* Subtitle 1: Alerts before the execution */}
        <div className="mt-4 mb-10">
          <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight" style={{ color: 'black' }}>
            Alerts before the execution
          </h2>
        </div>

      {/* Metrics Cards: Dynamic & High Fidelity Footnote Indicators (Grid 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 mt-4 font-sans">
        
        {/* Card 1: Pending legal effectiveness */}
        <div 
          onClick={() => openAlertTab(1, "Pending legal effectiveness")}
          className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              1
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending legal effectiveness</span>
          </div>
          {renderIndicatorDonut(1)}
        </div>

        {/* Card 2: Pending eligibility */}
        <div 
          onClick={() => openAlertTab(2, "Pending eligibility")}
          className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              2
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending eligibility</span>
          </div>
          {renderIndicatorDonut(2)}
        </div>

        {/* Card 3: Pending first disbursement */}
        <div 
          onClick={() => openAlertTab(3, "Pending first disbursement")}
          className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              3
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending first disbursement</span>
          </div>
          {renderIndicatorDonut(3)}
        </div>

      </div>

      {/* Subtitle 2: Alerts during execution */}
      <div className="mt-6 mb-10">
        <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight" style={{ color: 'black' }}>
          Alerts during execution
        </h2>
      </div>

      {/* Metrics Cards: Dynamic & High Fidelity Footnote Indicators (Grid 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mt-4 font-sans">

        {/* Card 4: Projects without disbursements */}
        <div 
          onClick={() => openAlertTab(4, "Projects without disbursements")}
          className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              4
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Projects without disbursements</span>
          </div>
          {renderIndicatorDonut(4)}
        </div>

        {/* Card 5: Disbursed life amount */}
        <div 
          onClick={() => openAlertTab(5, "Disbursed life amount")}
          className="relative bg-[#fafafa] pt-[38px] pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              5
            </div>
            <span className="font-extrabold text-white text-xs md:text-sm tracking-tight text-center">Disbursed life amount</span>
          </div>
          {renderIndicatorDonut(5)}
        </div>

        {/* Card 6: PMR performance */}
        <div 
          onClick={() => openAlertTab(6, "PMR performance (last 3 cycles)")}
          className="relative bg-[#fafafa] pt-[38px] pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[95%] bg-[#005173] text-white py-2.5 px-2 md:px-3 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57] whitespace-nowrap overflow-hidden">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              6
            </div>
            <span className="font-extrabold text-white text-[10.5px] sm:text-xs md:text-sm tracking-tight text-center truncate">PMR performance (last 3 cycles)</span>
          </div>
          {renderIndicatorDonut(6)}
        </div>

      </div>

      {/* Subtitle 3: Other alerts */}
      <div className="mt-6 mb-10">
        <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight" style={{ color: 'black' }}>
          Other alerts
        </h2>
      </div>

      {/* Metrics Cards: Dynamic & High Fidelity Footnote Indicators (Other alerts, centered flex) */}
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-12 mt-4 max-w-5xl mx-auto">
        
        {/* Card 7: Partial cancellations */}
        <div 
          onClick={() => openAlertTab(7, "Partial cancellations")}
          className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center w-full md:w-[320px] shrink-0 cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              7
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Partial cancellations</span>
          </div>
          {renderIndicatorDonut(7)}
        </div>

        {/* Card 8: Expired disbursement deadline */}
        <div 
          onClick={() => openAlertTab(8, "Expired disbursement deadline")}
          className="relative bg-[#fafafa] pt-[30px] pb-[25px] px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center w-full md:w-[320px] shrink-0 cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group"
        >
          {/* Float Header Pill */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57]">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
              8
            </div>
            <span className="font-extrabold text-[#ffffff] text-xs md:text-sm tracking-tight text-center">Expired disbursement deadline</span>
          </div>
          {renderIndicatorDonut(8)}
        </div>

      </div>
          </>
        ) : activeTabDetails ? (
          <div className="space-y-6 font-sans">
            {/* Header: Left aligned blue box matching exact style of the cards */}
            <div className="bg-[#005173] text-white py-2.5 px-6 rounded-xl flex items-center gap-3 shadow-md border border-[#003d57] max-w-max self-start">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                {parseInt(activeTabId.replace('card-', ''), 10)}
              </div>
              <span className="font-extrabold text-white text-xs md:text-sm tracking-tight text-center">
                {openTabs.find(t => t.id === activeTabId)?.title}
              </span>
            </div>

            {/* Indicator Definition: Full Width */}
            <div className="bg-[#fafafa] p-6 rounded-2xl border border-zinc-200/90 shadow-sm w-full">
              <h4 className="text-[#005173] font-extrabold text-xs uppercase tracking-widest mb-2 font-sans">INDICATOR DEFINITION:</h4>
              <p className="text-zinc-700 text-sm font-normal leading-relaxed font-sans">
                {activeTabDetails.description}
              </p>
            </div>

            {/* Split Grid: Donut Filter on Left, Project Dashboard on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Donut Card Filter */}
              <div className="lg:col-span-4 bg-[#fafafa] p-6 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center animate-fadeIn">
                {renderIndicatorDonut(parseInt(activeTabId.replace('card-', ''), 10), true)}
              </div>

              {/* Right Column: Project Dashboard */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* High-Fidelity Table */}
                <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-spacing-0">
                      <thead>
                        <tr className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                          {renderTabColumnHeader('index', 'N', [], false, 'w-8')}
                          {renderTabColumnHeader('id', <span>PROJECT<br/>ID</span>, uniqueTabIds, true, 'min-w-[80px]')}
                          {renderTabColumnHeader('name', <span>PROJECT<br/>NAME</span>, uniqueTabNames, true, 'min-w-[124px] max-w-[150px]')}
                          {renderTabColumnHeader('country', 'Country', uniqueTabCountries, true)}
                          {renderTabColumnHeader('ttl', 'TTL', uniqueTabTTLs, true, 'min-w-[100px] max-w-[120px]')}
                          {renderTabColumnHeader('investment', <span>Current Approved<br/>Amount<br/>($M)</span>, [], true, 'min-w-[90px]')}
                          {renderTabColumnHeader('status', <span>Status of<br/>indicator</span>, uniqueTabStatusChoices, true)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-sm">
                        {filteredTabProjects.length > 0 ? (
                          filteredTabProjects.map((project, index) => {
                            const customCol = activeTabDetails.columns[0];
                            const customValue = customCol ? (project as any)[customCol.key] : '';
                            const colorKey = customCol 
                              ? (customCol.key.endsWith('Status') 
                                ? customCol.key.replace('Status', 'Color') 
                                : customCol.key.endsWith('Percent') 
                                  ? customCol.key.replace('Percent', 'Color') 
                                  : customCol.key + 'Color') 
                              : '';
                            const customColorClass = colorKey ? ((project as any)[colorKey] || 'bg-zinc-100/80 text-zinc-800') : 'bg-zinc-100/80 text-zinc-800';
                            const textColorClass = customColorClass.split(' ').find(cls => cls.startsWith('text-')) || 'text-zinc-800';

                            return (
                              <tr 
                                key={project.id}
                                className="hover:bg-zinc-50 transition-colors cursor-pointer group font-sans text-sm"
                                onClick={() => onSelectProject?.(project.id)}
                              >
                                <td className="px-2 py-3 text-center text-zinc-400 font-medium text-[10px]">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-3 text-left text-zinc-500 text-[10px] font-semibold whitespace-nowrap">
                                  {project.id}
                                </td>
                                <td className="px-2 py-3">
                                  <div className="text-black font-semibold text-[11px] leading-tight whitespace-normal break-words">
                                    {project.name}
                                  </div>
                                </td>
                                <td className="px-2 py-3 text-left">
                                  <div className="flex items-center justify-start gap-3">
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
                                <td className="px-3 py-3 max-w-[100px] w-[100px] whitespace-normal break-words text-left text-zinc-500 text-[10px] font-medium">
                                  {project.ttl.includes(',') ? (
                                    <div className="flex flex-col items-start justify-start text-left">
                                      <span>{project.ttl.split(',')[0]},</span>
                                      <span>{project.ttl.split(',').slice(1).join(',').trim()}</span>
                                    </div>
                                  ) : (
                                    project.ttl
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-bold whitespace-nowrap">
                                  {project.metadata?.investmentAmount || 'N/A'}
                                </td>
                                <td className="px-2 py-3 text-left">
                                  <div className="flex items-start justify-start gap-2 max-w-[180px] whitespace-normal break-words">
                                    <div 
                                      className="w-3 h-3 rounded-sm shrink-0 shadow-sm mt-0.5" 
                                      style={{ backgroundColor: getIndicatorBoxColor(customColorClass) }} 
                                    />
                                    <span className="text-[11px] text-zinc-700 font-normal leading-tight">
                                      {customValue}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                              No projects matched the search criteria or selected filter category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
