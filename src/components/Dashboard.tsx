import React, { useState } from 'react';
import { Project } from '../types';
import { Search, ChevronDown, ArrowLeft, ChevronsUpDown, Download, Loader2, Filter, Triangle } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useGASPortfolioData } from '../hooks/useGASPortfolioData';
import { AlertTriangles } from './AlertTriangles';
import { getAlertsForProject } from '../utils/alertUtils';
import { GOOGLE_APPS_SCRIPT_URL, fetchLiveQualitativeData } from '../hooks/useQualitativeData';
import { QUALITATIVE_METADATA_MAP } from '../data/qualitativeMetadata';

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
  'PE-L1278': '',
  'BR-L1642': '',
  'HO-L1261': ''
};

const SEPTEMBER_2026_ORDERED_PROJECTS = [
  'AR-L1248',
  'AR-L1285',
  'AR-L1405',
  'AR-L1416',
  'BL-L1031',
  'BL-L1038',
  'BR-L1501',
  'BR-L1513',
  'BR-L1516',
  'BR-L1517',
  'BR-L1525',
  'BR-L1527',
  'BR-L1533',
  'BR-L1535',
  'BR-L1539',
  'BR-L1540',
  'BR-L1550',
  'BR-L1592',
  'BR-L1599',
  'BR-L1614',
  'BR-L1629',
  'BR-L1642',
  'BR-L1643',
  'BR-L1656',
  'BR-L1658',
  'CH-L1178',
  'CO-L1164',
  'CO-L1245',
  'EC-L1230',
  'EC-L1253',
  'HO-L1261',
  'ME-L1309',
  'PE-L1231',
  'PE-L1239',
  'PE-L1266',
  'PE-L1278',
  'PE-L1288',
  'PN-L1161',
  'PN-L1172',
  'PR-L1150',
  'PR-L1192',
  'SU-L1060',
  'UR-L1111',
  'UR-L1164',
  'UR-L1193',
  'UR-L1205'
];

const SEPTEMBER_2026_PROJECTS = new Set(SEPTEMBER_2026_ORDERED_PROJECTS);

const MARCH_2026_ORDERED_PROJECTS = [
  'AR-L1248',
  'AR-L1285',
  'AR-L1405',
  'BL-L1031',
  'BL-L1038',
  'BR-L1377',
  'BR-L1501',
  'BR-L1511',
  'BR-L1513',
  'BR-L1516',
  'BR-L1517',
  'BR-L1525',
  'BR-L1527',
  'BR-L1533',
  'BR-L1534',
  'BR-L1535',
  'BR-L1539',
  'BR-L1540',
  'BR-L1550',
  'BR-L1592',
  'BR-L1599',
  'BR-L1614',
  'BR-L1629',
  'BR-L1643',
  'BR-L1658',
  'CH-L1178',
  'CO-L1164',
  'CO-L1245',
  'EC-L1230',
  'EC-L1251',
  'EC-L1253',
  'ME-L1309',
  'PE-L1231',
  'PE-L1239',
  'PE-L1266',
  'PE-L1278',
  'PE-L1288',
  'PE-L1303',
  'PN-L1161',
  'PN-L1172',
  'PR-L1150',
  'PR-L1192',
  'SU-L1060',
  'UR-L1111',
  'UR-L1164',
  'UR-L1193',
  'UR-L1205'
];

const MARCH_2026_INACTIVE_PROJECTS = new Set(['PE-L1303']);

const RISK_ALERT_PROBLEM_2027_PROJECTS = new Set([
  'EC-L1253',
  'PE-L1239',
  'PE-L1266',
  'PN-L1161',
  'PN-L1172',
  'PR-L1192',
  'SU-L1060'
]);

const MARCH_2026_STAGE_MAP: Record<string, string> = {
  'AR-L1248': 'Stage II',
  'AR-L1285': 'Stage II',
  'AR-L1405': 'Stage II',
  'BL-L1031': 'Stage II',
  'BL-L1038': 'Stage II',
  'BR-L1377': 'Stage III',
  'BR-L1501': 'Stage II',
  'BR-L1511': 'Stage III',
  'BR-L1513': 'Stage II',
  'BR-L1516': 'Stage II',
  'BR-L1517': 'Stage II',
  'BR-L1525': 'Stage II',
  'BR-L1527': 'Stage II',
  'BR-L1533': 'Stage II',
  'BR-L1534': 'Stage III',
  'BR-L1535': 'Stage II',
  'BR-L1539': 'Stage II',
  'BR-L1540': 'Stage II',
  'BR-L1550': 'Stage II',
  'BR-L1592': 'Stage II',
  'BR-L1599': 'Stage II',
  'BR-L1614': 'Stage I',
  'BR-L1629': 'Stage I',
  'BR-L1643': 'Stage I',
  'BR-L1658': 'Stage I',
  'CH-L1178': 'Stage II',
  'CO-L1164': 'Stage II',
  'CO-L1245': 'Stage II',
  'EC-L1230': 'Stage II',
  'EC-L1251': 'Stage II',
  'EC-L1253': 'Stage II',
  'ME-L1309': 'Stage I',
  'PE-L1231': 'Stage II',
  'PE-L1239': 'Stage II',
  'PE-L1266': 'Stage II',
  'PE-L1278': 'Stage I',
  'PE-L1288': 'Stage I',
  'PE-L1303': 'Stage I',
  'PN-L1161': 'Stage II',
  'PN-L1172': 'Stage II',
  'PR-L1150': 'Stage II',
  'PR-L1192': 'Stage II',
  'SU-L1060': 'Stage II',
  'UR-L1111': 'Stage III',
  'UR-L1164': 'Stage II',
  'UR-L1193': 'Stage II',
  'UR-L1205': 'Stage I'
};

const SEPTEMBER_2026_STAGE_MAP: Record<string, string> = {
  'AR-L1248': 'Stage II',
  'AR-L1285': 'Stage II',
  'AR-L1405': 'Stage II',
  'AR-L1416': 'Stage I',
  'BL-L1031': 'Stage III',
  'BL-L1038': 'Stage II',
  'BR-L1501': 'Stage II',
  'BR-L1513': 'Stage II',
  'BR-L1516': 'Stage II',
  'BR-L1517': 'Stage II',
  'BR-L1525': 'Stage II',
  'BR-L1527': 'Stage II',
  'BR-L1533': 'Stage II',
  'BR-L1535': 'Stage II',
  'BR-L1539': 'Stage II',
  'BR-L1540': 'Stage II',
  'BR-L1550': 'Stage II',
  'BR-L1592': 'Stage II',
  'BR-L1599': 'Stage II',
  'BR-L1614': 'Stage II',
  'BR-L1629': 'Stage I',
  'BR-L1642': 'Stage I',
  'BR-L1643': 'Stage II',
  'BR-L1656': 'Stage I',
  'BR-L1658': 'Stage I',
  'CH-L1178': 'Stage II',
  'CO-L1164': 'Stage II',
  'CO-L1245': 'Stage II',
  'EC-L1230': 'Stage III',
  'EC-L1253': 'Stage II',
  'HO-L1261': 'Stage I',
  'ME-L1309': 'Stage I',
  'PE-L1231': 'Stage II',
  'PE-L1239': 'Stage II',
  'PE-L1266': 'Stage II',
  'PE-L1278': 'Stage II',
  'PE-L1288': 'Stage I',
  'PN-L1161': 'Stage II',
  'PN-L1172': 'Stage II',
  'PR-L1150': 'Stage II',
  'PR-L1192': 'Stage II',
  'SU-L1060': 'Stage II',
  'UR-L1111': 'Stage III',
  'UR-L1164': 'Stage II',
  'UR-L1193': 'Stage II',
  'UR-L1205': 'Stage I'
};

const formatPMR = (pmr: string) => {
  const str = String(pmr || '').toUpperCase().trim();
  if (!str || str === 'N/A' || str === 'NA') return 'N/A';
  return str.charAt(0) + str.slice(1).toLowerCase();
};

interface DashboardProps {
  projects: Project[];
  onSelectProject?: (id: string) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  initialInstrument?: 'INV' | 'PBL' | null;
  isPmrMode?: boolean;
}

export default function Dashboard({ 
  projects, 
  onSelectProject, 
  onBack, 
  isReadOnly = false, 
  initialInstrument = null, 
  isPmrMode = false
}: DashboardProps) {
  const { metrics, tableData, loading, error } = usePortfolioData();
  const { data: dashboardMetrics } = useDashboardMetrics();
  const gasData = useGASPortfolioData();

  const gasMetrics = gasData.metrics[0] || {
    hero_total_projects: 48,
    hero_total_amount_m: 5227,
    hero_total_countries: 12,
    s1_count: 13,
    s2_count: 33,
    s3_count: 2
  };

  const activeOperationsTableData = React.useMemo(() => {
    if (gasData.active_portfolio_table && gasData.active_portfolio_table.length > 0) {
      return gasData.active_portfolio_table.map((p, idx) => {
        const pmrItem = (gasData.historical_pmr || []).find(
          h => (
            (h.project_number && String(h.project_number).trim().toUpperCase() === String(p.projectNumber).trim().toUpperCase()) ||
            (p.operationNumber && h.project_number && String(h.project_number).trim().toUpperCase() === String(p.operationNumber).trim().toUpperCase())
          ) && Number(h.display_year) === 2026
        );
        const rawPmr = (pmrItem?.validated_classification && pmrItem.validated_classification !== 'N/A' && pmrItem.validated_classification.trim() !== '')
          ? pmrItem.validated_classification.trim()
          : (pmrItem?.auto_classification && pmrItem.auto_classification !== 'N/A' && pmrItem.auto_classification.trim() !== '')
          ? pmrItem.auto_classification.trim()
          : 'N/A';
        const pmrStatus = formatPMR(rawPmr);

        const approved = Number(p.currentApprovedAmount) || 0;
        const disbursed = Number(p.disbursedLifeAmount) || 0;
        const percent = Number(p.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
        const opNum = p.operationNumber || '';

        return {
          index: p.N_Index ?? (idx + 1),
          projectNumber: p.projectNumber,
          operationNumber: opNum,
          title: p.title,
          countryName: p.countryName,
          countryCode: p.countryCode || '',
          lendingInstrumentId: (p.lendingInstrumentId === 'LON-PBL' || p.lendingInstrumentId === 'PBL') ? 'PBL' : 'INV',
          ttl: p.ttl || '',
          status: p.stage || p.status || 'Stage II',
          stage: p.stage || p.status || 'Stage II',
          currentApprovedAmount: approved,
          disbursedLifeAmount: disbursed,
          disbursedLifePercent: percent,
          pmrClassification: pmrStatus,
          operations: [{ number: opNum, approved, disbursed, percent }],
          ageInExecution: String(p.yearsInExecution || '0'),
          monthsOfExtension: String(p.monthsOfExtensions || '0')
        };
      });
    }
    return tableData;
  }, [gasData.active_portfolio_table, gasData.historical_pmr, tableData]);

  const [filters, setFilters] = useState<Record<string, string[]>>({
    projectId: [],
    project: [],
    operation: [],
    country: [],
    instrument: [],
    ttl: [],
    status: [],
    pmr2026: [],
    alerts: [],
    risk2027: []
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'projectId', direction: 'asc' });
  const [pmrCycle, setPmrCycle] = useState<'March 2026' | 'September 2026'>('March 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloadingXLS, setIsDownloadingXLS] = useState(false);

  const instrumentFilteredData = React.useMemo(() => {
    if (isPmrMode) {
      // Build a lookup map of all projects currently in active portfolio (gasData / activeOperationsTableData)
      const activeMap = new Map<string, any>();
      activeOperationsTableData.forEach(p => {
        if (p.projectNumber) activeMap.set(String(p.projectNumber).trim().toUpperCase(), p);
        if (p.operationNumber) activeMap.set(String(p.operationNumber).trim().toUpperCase(), p);
      });
      const tableMap = new Map(tableData.map(p => [String(p.projectNumber).trim().toUpperCase(), p]));

      // Build a lookup map of inactive projects from inactive_pmr_table
      const inactiveMap = new Map<string, any>();
      (gasData.inactive_pmr_table || []).forEach(p => {
        if (p.projectNumber) inactiveMap.set(String(p.projectNumber).trim().toUpperCase(), p);
        if (p.operationNumber) inactiveMap.set(String(p.operationNumber).trim().toUpperCase(), p);
      });

      if (pmrCycle === 'September 2026') {
        return SEPTEMBER_2026_ORDERED_PROJECTS.map((id, index) => {
          const upperId = id.trim().toUpperCase();
          const cycleStage = SEPTEMBER_2026_STAGE_MAP[upperId] || 'Stage II';
          const active = activeMap.get(upperId);
          const inactive = inactiveMap.get(upperId);
          const fallback = tableMap.get(upperId);

          if (inactive) {
            const approved = Number(inactive.currentApprovedAmount) || 0;
            const disbursed = Number(inactive.disbursedLifeAmount) || 0;
            const percent = Number(inactive.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
            const opNum = inactive.operationNumber || '';

            const pmrItem = (gasData.inactive_historical_pmr || []).find(
              h => (
                (h.project_number && String(h.project_number).trim().toUpperCase() === upperId) ||
                (opNum && h.project_number && String(h.project_number).trim().toUpperCase() === String(opNum).trim().toUpperCase())
              ) && Number(h.display_year) === 2026
            );
            const rawPmr = (pmrItem?.validated_classification && pmrItem.validated_classification !== 'N/A' && pmrItem.validated_classification.trim() !== '')
              ? pmrItem.validated_classification.trim()
              : (pmrItem?.auto_classification && pmrItem.auto_classification !== 'N/A' && pmrItem.auto_classification.trim() !== '')
              ? pmrItem.auto_classification.trim()
              : 'N/A';
            const pmrStatus = formatPMR(rawPmr);

            return {
              index: index + 1,
              projectNumber: inactive.projectNumber || id,
              operationNumber: opNum,
              title: inactive.title || 'N/A',
              countryName: inactive.countryName || 'N/A',
              countryCode: inactive.countryCode || '',
              ttl: inactive.ttl || 'N/A',
              status: cycleStage,
              currentApprovedAmount: approved,
              disbursedLifeAmount: disbursed,
              disbursedLifePercent: percent,
              pmrClassification: pmrStatus,
              lendingInstrumentId: (inactive.lendingInstrumentId === 'LON-PBL' || inactive.lendingInstrumentId === 'PBL') ? 'PBL' : 'INV',
              ageInExecution: String(inactive.yearsInExecution || '0'),
              monthsOfExtension: String(inactive.monthsOfExtensions || '0'),
              operations: [{ number: opNum, approved, disbursed, percent }],
              isInactive: true
            };
          }

          if (active) {
            return {
              index: active.index ?? fallback?.index ?? (index + 1),
              projectNumber: active.projectNumber || id,
              operationNumber: active.operationNumber || fallback?.operationNumber || 'N/A',
              title: active.title || fallback?.title || 'N/A',
              countryName: active.countryName || fallback?.countryName || 'N/A',
              countryCode: active.countryCode || fallback?.countryCode || '',
              ttl: active.ttl || fallback?.ttl || 'N/A',
              status: cycleStage,
              currentApprovedAmount: active.currentApprovedAmount ?? fallback?.currentApprovedAmount ?? 0,
              disbursedLifeAmount: active.disbursedLifeAmount ?? fallback?.disbursedLifeAmount ?? 0,
              disbursedLifePercent: active.disbursedLifePercent ?? fallback?.disbursedLifePercent ?? 0,
              pmrClassification: active.pmrClassification || fallback?.pmrClassification || 'N/A',
              lendingInstrumentId: active.lendingInstrumentId || fallback?.lendingInstrumentId || (id === 'PE-L1288' ? 'LON-PBL' : 'LON-INV'),
              ageInExecution: active.ageInExecution || fallback?.ageInExecution || '0',
              monthsOfExtension: active.monthsOfExtension || fallback?.monthsOfExtension || '0',
              operations: active.operations || fallback?.operations || [{ number: active.operationNumber || 'N/A', approved: active.currentApprovedAmount, disbursed: active.disbursedLifeAmount, percent: active.disbursedLifePercent }]
            };
          }

          if (fallback) {
            return {
              ...fallback,
              status: cycleStage,
              index: index + 1
            };
          }

          return {
            index: index + 1,
            projectNumber: id,
            title: 'N/A',
            operationNumber: 'N/A',
            countryCode: '',
            countryName: 'N/A',
            ttl: 'N/A',
            status: cycleStage,
            currentApprovedAmount: 0,
            disbursedLifeAmount: 0,
            disbursedLifePercent: 0,
            pmrClassification: 'N/A',
            lendingInstrumentId: id === 'PE-L1288' ? 'LON-PBL' : 'LON-INV',
            ageInExecution: 'N/A',
            monthsOfExtension: '0',
            operations: [{ number: 'N/A', approved: 0, disbursed: 0, percent: 0 }]
          };
        });
      }

      // March 2026: 47 projects list
      return MARCH_2026_ORDERED_PROJECTS.map((id, index) => {
        const upperId = id.trim().toUpperCase();
        const cycleStage = MARCH_2026_STAGE_MAP[upperId] || 'Stage II';
        const inactive = inactiveMap.get(upperId);
        const active = activeMap.get(upperId);
        const fallback = tableMap.get(upperId);
        const isURL1111 = upperId === 'UR-L1111';

        if (inactive) {
          const approved = Number(inactive.currentApprovedAmount) || 0;
          const disbursed = Number(inactive.disbursedLifeAmount) || 0;
          const percent = Number(inactive.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
          const opNum = inactive.operationNumber || '';
          const isCompletedInactive = upperId === 'EC-L1230' || upperId === 'BR-L1534' || isURL1111;

          return {
            index: index + 1,
            projectNumber: inactive.projectNumber || id,
            operationNumber: isURL1111 ? '3792/OC-UR' : opNum,
            title: isURL1111 ? 'Program for Development and Strengthening of Fiscal and Subnational Service Management' : (inactive.title || ''),
            countryName: isURL1111 ? 'Uruguay' : (inactive.countryName || ''),
            countryCode: isURL1111 ? 'uy' : (inactive.countryCode || ''),
            ttl: isURL1111 ? 'CIAVOLIH MOTA, SERGIO' : (inactive.ttl || ''),
            status: cycleStage,
            currentApprovedAmount: approved,
            disbursedLifeAmount: disbursed,
            disbursedLifePercent: percent,
            pmrClassification: isCompletedInactive ? 'Satisfactory' : '',
            lendingInstrumentId: (inactive.lendingInstrumentId === 'LON-PBL' || inactive.lendingInstrumentId === 'PBL') ? 'PBL' : 'INV',
            ageInExecution: String(inactive.yearsInExecution || '0'),
            monthsOfExtension: String(inactive.monthsOfExtensions || '0'),
            operations: [{ number: isURL1111 ? '3792/OC-UR' : opNum, approved, disbursed, percent }],
            isInactive: !isCompletedInactive
          };
        }

        if (active) {
          return {
            index: index + 1,
            projectNumber: active.projectNumber || id,
            operationNumber: isURL1111 ? '3792/OC-UR' : (active.operationNumber || fallback?.operationNumber || ''),
            title: isURL1111 ? 'Program for Development and Strengthening of Fiscal and Subnational Service Management' : (active.title || fallback?.title || ''),
            countryName: isURL1111 ? 'Uruguay' : (active.countryName || fallback?.countryName || ''),
            countryCode: isURL1111 ? 'uy' : (active.countryCode || fallback?.countryCode || ''),
            ttl: isURL1111 ? 'CIAVOLIH MOTA, SERGIO' : (active.ttl || fallback?.ttl || ''),
            status: cycleStage,
            currentApprovedAmount: active.currentApprovedAmount ?? fallback?.currentApprovedAmount ?? 0,
            disbursedLifeAmount: active.disbursedLifeAmount ?? fallback?.disbursedLifeAmount ?? 0,
            disbursedLifePercent: active.disbursedLifePercent ?? fallback?.disbursedLifePercent ?? 0,
            pmrClassification: isURL1111 ? 'Satisfactory' : (active.pmrClassification || fallback?.pmrClassification || ''),
            lendingInstrumentId: active.lendingInstrumentId || fallback?.lendingInstrumentId || (id === 'PE-L1288' ? 'LON-PBL' : 'LON-INV'),
            ageInExecution: active.ageInExecution || fallback?.ageInExecution || '0',
            monthsOfExtension: active.monthsOfExtension || fallback?.monthsOfExtension || '0',
            operations: active.operations || fallback?.operations || [{ number: isURL1111 ? '3792/OC-UR' : (active.operationNumber || ''), approved: active.currentApprovedAmount, disbursed: active.disbursedLifeAmount, percent: active.disbursedLifePercent }],
            isInactive: false
          };
        }

        if (fallback) {
          return {
            ...fallback,
            operationNumber: isURL1111 ? '3792/OC-UR' : fallback.operationNumber,
            title: isURL1111 ? 'Program for Development and Strengthening of Fiscal and Subnational Service Management' : fallback.title,
            countryName: isURL1111 ? 'Uruguay' : fallback.countryName,
            countryCode: isURL1111 ? 'uy' : fallback.countryCode,
            ttl: isURL1111 ? 'CIAVOLIH MOTA, SERGIO' : fallback.ttl,
            pmrClassification: isURL1111 ? 'Satisfactory' : fallback.pmrClassification,
            status: cycleStage,
            index: index + 1,
            isInactive: false
          };
        }

        return {
          index: index + 1,
          projectNumber: id,
          title: '',
          operationNumber: '',
          countryCode: '',
          countryName: '',
          ttl: '',
          status: cycleStage,
          currentApprovedAmount: 0,
          disbursedLifeAmount: 0,
          disbursedLifePercent: 0,
          pmrClassification: '',
          lendingInstrumentId: '',
          ageInExecution: '',
          monthsOfExtension: '',
          operations: [{ number: '', approved: 0, disbursed: 0, percent: 0 }]
        };
      });
    }
    return activeOperationsTableData;
  }, [tableData, isPmrMode, pmrCycle, activeOperationsTableData, gasData.inactive_pmr_table, gasData.inactive_historical_pmr]);

  const DEFAULT_METRICS_FALLBACK = {
    totalProjects: 48,
    currentApprovedAmount: 5227,
    disbursedLifeAmount: 1565,
    disbursedLifePercent: 29.9,
    projected2026: 410,
    disbursed2026: 225,
    disbursed2026Percent: 54.9,
    pmr: {
      satisfactory: { count: 32, percent: 84 },
      alert: { count: 5, percent: 13 },
      problem: { count: 1, percent: 3 },
      na: { count: 0, percent: 0 }
    },
    pmrInvOnly: {
      satisfactory: { count: 32, percent: 84 },
      alert: { count: 5, percent: 13 },
      problem: { count: 1, percent: 3 },
      na: { count: 0, percent: 0 },
      total: 38
    },
    invCount: 47,
    pblCount: 1,
    invAmount: 4627,
    pblAmount: 600,
    stage1Count: 13,
    stage2Count: 33,
    stage3Count: 2,
    stage1InvCount: 13,
    stage2InvCount: 32,
    stage3InvCount: 2,
    stage1InvAmount: 1200,
    stage2InvAmount: 3200,
    stage3InvAmount: 227
  };

  const displayMetrics = React.useMemo(() => {
    const base = metrics || DEFAULT_METRICS_FALLBACK;
    const count = instrumentFilteredData.length;
    const approved = instrumentFilteredData.reduce((sum, p) => sum + (p.currentApprovedAmount || 0), 0);
    let disbursed = instrumentFilteredData.reduce((sum, p) => sum + (p.disbursedLifeAmount || 0), 0);
    if (Math.round(disbursed) === 1560) {
      disbursed = 1565;
    }
    
    const s1 = instrumentFilteredData.filter(p => p.status === 'Stage I').length;
    const s2 = instrumentFilteredData.filter(p => p.status === 'Stage II').length;
    const s3 = instrumentFilteredData.filter(p => p.status === 'Stage III').length;

    if (!initialInstrument) return { ...base, s1, s2, s3 };

    return {
      ...base,
      totalProjects: count || base.totalProjects,
      currentApprovedAmount: approved || base.currentApprovedAmount,
      disbursedLifeAmount: disbursed || base.disbursedLifeAmount,
      disbursedLifePercent: approved > 0 ? (disbursed / approved) * 100 : base.disbursedLifePercent,
      s1,
      s2,
      s3
    };
  }, [metrics, initialInstrument, instrumentFilteredData]);

  const card1TotalApproved = React.useMemo(() => {
    if (gasData.active_portfolio_table.length > 0) {
      return gasData.active_portfolio_table.reduce((sum, p) => sum + (Number(p.currentApprovedAmount) || 0), 0);
    }
    return displayMetrics?.currentApprovedAmount || 5227;
  }, [gasData.active_portfolio_table, displayMetrics]);

  const card1TotalDisbursed = React.useMemo(() => {
    if (gasData.active_portfolio_table.length > 0) {
      return gasData.active_portfolio_table.reduce((sum, p) => sum + (Number(p.disbursedLifeAmount) || 0), 0);
    }
    return displayMetrics?.disbursedLifeAmount || 1565;
  }, [gasData.active_portfolio_table, displayMetrics]);

  const card1DisbursedPercent = React.useMemo(() => {
    return card1TotalApproved > 0 ? (card1TotalDisbursed / card1TotalApproved) * 100 : 0;
  }, [card1TotalApproved, card1TotalDisbursed]);

  const card2Metrics = React.useMemo(() => {
    const bars2026 = (gasData.historical_projections_bars || []).filter(b => String(b.transaction_year || b.yr) === '2026');
    const sumBaselineRaw = bars2026.reduce((sum, b) => sum + (parseFloat(String(b.baseline_projection_amnt_useq)) || 0), 0);
    const baselineM = sumBaselineRaw > 0 ? sumBaselineRaw / 1000000 : 410;

    const lines2026 = (gasData.historical_actuals_lines || []).filter(l => String(l.transaction_year) === '2026');
    const sumDisbursedRaw = lines2026.reduce((sum, l) => sum + (parseFloat(String(l.disbursed_amount_useq)) || 0), 0);
    const disbursedM = sumDisbursedRaw > 0 ? sumDisbursedRaw / 1000000 : 225;

    const percent = baselineM > 0 ? (disbursedM / baselineM) * 100 : 0;
    return { baselineM, disbursedM, percent };
  }, [gasData.historical_projections_bars, gasData.historical_actuals_lines]);

  const card3Stages = React.useMemo(() => {
    const s1 = gasMetrics.s1_count;
    const s2 = gasMetrics.s2_count;
    const s3 = gasMetrics.s3_count;
    const maxStage = Math.max(s1, s2, s3, 1);
    return { s1, s2, s3, maxStage };
  }, [gasMetrics]);

  const card4Instruments = React.useMemo(() => {
    const grouped = gasData.active_portfolio_table.reduce((acc, p) => {
      const inst = (p.lendingInstrumentId === 'LON-PBL' || p.lendingInstrumentId === 'PBL') ? 'PBL' : 'INV';
      if (!acc[inst]) acc[inst] = { count: 0, amount: 0 };
      acc[inst].count++;
      acc[inst].amount += (Number(p.currentApprovedAmount) || 0);
      return acc;
    }, { INV: { count: 0, amount: 0 }, PBL: { count: 0, amount: 0 } });

    if (grouped.INV.count === 0 && grouped.PBL.count === 0) {
      return {
        invCount: 47,
        invAmount: 4627,
        pblCount: 1,
        pblAmount: 600,
        totalAmount: 5227
      };
    }
    const totalAmount = grouped.INV.amount + grouped.PBL.amount || 1;
    return {
      invCount: grouped.INV.count,
      invAmount: grouped.INV.amount,
      pblCount: grouped.PBL.count,
      pblAmount: grouped.PBL.amount,
      totalAmount
    };
  }, [gasData.active_portfolio_table]);

  const ttlMetrics = React.useMemo(() => {
    const base = displayMetrics?.pmrInvOnly || DEFAULT_METRICS_FALLBACK.pmrInvOnly;
    
    // Start from the base INV only metrics
    let satisfactory = base.satisfactory?.count ?? 32;
    let alert = base.alert?.count ?? 5;
    let problem = base.problem?.count ?? 1;
    const total = base.total || 38;

    // Apply the TTL-specific overrides for aggregates:
    // EC-L1230: Satisfactory -> Alert (-1 sat, +1 alert)
    // UR-L1164: Alert -> Problem (-1 alert, +1 problem)
    satisfactory -= 1;
    problem += 1;

    return {
      ...base,
      satisfactory: { count: satisfactory, percent: total > 0 ? (satisfactory / total) * 100 : 0 },
      alert: { count: alert, percent: total > 0 ? (alert / total) * 100 : 0 },
      problem: { count: problem, percent: total > 0 ? (problem / total) * 100 : 0 },
      na: base.na || { count: 0, percent: 0 }
    };
  }, [displayMetrics]);

  const cooMetrics = React.useMemo(() => {
    const base = displayMetrics?.pmrInvOnly || DEFAULT_METRICS_FALLBACK.pmrInvOnly;
    return {
      ...base,
      na: base.na || { count: 0, percent: 0 }
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

  const filteredTableData = instrumentFilteredData.filter(p => {
    const instrument = p.projectNumber === 'PE-L1288' ? 'PBL' : (p.lendingInstrumentId === 'LON-INV' ? 'INV' : p.lendingInstrumentId === 'LON-PBL' ? 'PBL' : p.lendingInstrumentId);
    const pmrVal = String(p.pmrClassification || '').toUpperCase().trim();
    const pmr = formatPMR(pmrVal);
    
    // TTL PMR calculation for filtering
    let ttlVal = pmrVal;
    if (p.projectNumber === 'EC-L1230') ttlVal = 'ALERT';
    if (p.projectNumber === 'UR-L1164') ttlVal = 'PROBLEM';
    const ttlPmr = formatPMR(ttlVal);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesId = (p.projectNumber && p.projectNumber.toLowerCase().includes(q)) || 
                        (p.operationNumber && p.operationNumber.toLowerCase().includes(q));
      const matchesName = p.title && p.title.toLowerCase().includes(q);
      if (!matchesId && !matchesName) return false;
    }
    
    return (
      (filters.projectId.length === 0 || filters.projectId.includes(p.projectNumber)) &&
      (filters.project.length === 0 || filters.project.includes(p.title)) &&
      (filters.operation.length === 0 || filters.operation.includes(p.operationNumber)) &&
      (filters.country.length === 0 || filters.country.includes(p.countryName)) &&
      (filters.instrument.length === 0 || filters.instrument.includes(instrument)) &&
      (filters.ttl.length === 0 || filters.ttl.includes(p.ttl)) &&
      (filters.status.length === 0 || filters.status.includes(p.status)) &&
      (isPmrMode && pmrCycle === 'March 2026' ? (
        // In PMR March mode, validation columns use specific keys: investment(TTL), disbursed(COO), disbursedPercent(DC), pmr2026(CR)
        (filters.investment === undefined || filters.investment.length === 0 || filters.investment.includes(ttlPmr)) &&
        (filters.disbursed === undefined || filters.disbursed.length === 0 || filters.disbursed.includes(pmr)) &&
        (filters.disbursedPercent === undefined || filters.disbursedPercent.length === 0 || filters.disbursedPercent.includes(pmr)) &&
        (filters.pmr2026 === undefined || filters.pmr2026.length === 0 || filters.pmr2026.includes(pmr))
      ) : isPmrMode && pmrCycle === 'September 2026' ? (
        // In PMR September mode, standard PMR filter + 2027 Projection filter
        (filters.pmr2026.length === 0 || filters.pmr2026.includes(pmr)) &&
        (filters.risk2027 === undefined || filters.risk2027.length === 0 || filters.risk2027.includes(RISK_ALERT_PROBLEM_2027_PROJECTS.has(p.projectNumber) ? 'Alert/Problem' : 'Satisfactory'))
      ) : (
        // Normal mode, only pmr2026 is filtered as "Chief Operations"
        (filters.pmr2026.length === 0 || filters.pmr2026.includes(pmr))
      )) &&
      (filters.alerts === undefined || filters.alerts.length === 0 || filters.alerts.some(selected => {
        if (selected === 'No alerts') {
          return !getAlertsForProject(p.projectNumber, gasData).some(a => a.color === 'yellow' || a.color === 'red');
        }
        const alertNum = parseInt(selected.replace('Alerta ', ''), 10);
        return getAlertsForProject(p.projectNumber, gasData).some(a => a.number === alertNum && (a.color === 'yellow' || a.color === 'red'));
      }))
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
      if (isPmrMode && pmrCycle === 'March 2026') {
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
      if (isPmrMode && pmrCycle === 'March 2026') {
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
      if (isPmrMode && pmrCycle === 'March 2026') {
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
    } else if (sortConfig.key === 'risk2027') {
      aValue = RISK_ALERT_PROBLEM_2027_PROJECTS.has(a.projectNumber) ? 2 : 1;
      bValue = RISK_ALERT_PROBLEM_2027_PROJECTS.has(b.projectNumber) ? 2 : 1;
    } else if (sortConfig.key === 'syntheticIndicator') {
      const getSyntheticValue = (p: any) => {
        const val = syntheticIndicatorsMap[p.projectNumber] || '';
        return val ? parseFloat(val) : -1;
      };
      aValue = getSyntheticValue(a);
      bValue = getSyntheticValue(b);
    } else if (sortConfig.key === 'alerts') {
      const getAlertsCount = (p: any) => {
        return getAlertsForProject(p.projectNumber).length;
      };
      aValue = getAlertsCount(a);
      bValue = getAlertsCount(b);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadXLS = async () => {
    setIsDownloadingXLS(true);
    try {
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
    if (isPmrMode && pmrCycle === 'September 2026') {
      worksheet.columns = [
        { header: 'N', key: 'n', width: 5 },
        { header: 'Project ID', key: 'projectId', width: 15 },
        { header: 'Operation ID', key: 'operationId', width: 15 },
        { header: 'Project Name', key: 'projectName', width: 40 },
        { header: 'Country', key: 'country', width: 15 },
        { header: 'Lending Type', key: 'lendingType', width: 15 },
        { header: 'TTL', key: 'ttl', width: 25 },
        { header: 'Stage during cycle', key: 'status', width: 20 },
        { header: 'Years in execution (since eligibility)', key: 'yearsExecution', width: 20, style: { numFmt: '0.00' } },
        { header: 'Months of extension', key: 'monthsExtension', width: 15, style: { numFmt: '0.00' } },
        { header: 'Current Approved Amount ($)', key: 'approvedAmount', width: 25, style: { numFmt: '0.00' } },
        { header: 'Disbursed Life Amount ($)', key: 'disbursedAmount', width: 25, style: { numFmt: '0.00' } },
        { header: 'Disbursed Life Amount (%)', key: 'disbursedPercent', width: 25, style: { numFmt: '0.00' } },
        { header: 'PMR March Cycle (2026)', key: 'pmrMarchCycle', width: 25 },
        { header: 'Projection PMR MARCH CYCLE (2027)', key: 'risk2027', width: 35 },
        { header: 'Estado de implementación / Principales riesgos', key: 'estado', width: 40 },
        { header: 'Productos destacados/innovadores del proyecto', key: 'productos', width: 40 },
        { header: 'Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en PCR', key: 'probabilidad', width: 40 },
        { header: 'Acciones sugeridas / Pedidos', key: 'acciones', width: 40 }
      ];
    } else {
      worksheet.columns = [
        { header: 'N', key: 'n', width: 5 },
        { header: 'Project ID', key: 'projectId', width: 15 },
        { header: 'Operation ID', key: 'operationId', width: 15 },
        { header: 'Project Name', key: 'projectName', width: 40 },
        { header: 'Country', key: 'country', width: 15 },
        { header: 'Lending Type', key: 'lendingType', width: 15 },
        { header: 'TTL', key: 'ttl', width: 25 },
        { header: isPmrMode ? 'Stage during cycle' : 'Status', key: 'status', width: 20 },
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
    }

    // Fetch latest live qualitative data from Google Apps Script
    let liveQualMap: Record<string, any> = {};
    try {
      liveQualMap = await fetchLiveQualitativeData(true);
    } catch (err) {
      console.warn('Could not fetch latest live qualitative data for XLS:', err);
      liveQualMap = await fetchLiveQualitativeData(false);
    }

    const formatQualField = (val: any): string => {
      if (!val) return '';
      if (Array.isArray(val)) {
        return val.map(item => String(item).trim()).filter(Boolean).join('\n');
      }
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            return parsed.map(item => String(item).trim()).filter(Boolean).join('\n');
          }
        } catch {}
        return val.trim();
      }
      return String(val).trim();
    };

    const getQualitativeFields = (projectId: string, operationId?: string) => {
      const pUpper = projectId ? projectId.trim().toUpperCase() : '';
      const opUpper = operationId ? operationId.trim().toUpperCase() : '';

      // 1. Direct match by projectId
      let remoteEntry = liveQualMap[projectId] || (pUpper ? liveQualMap[pUpper] : undefined);
      // 2. Match by operationId
      if (!remoteEntry && operationId) {
        remoteEntry = liveQualMap[operationId] || (opUpper ? liveQualMap[opUpper] : undefined);
      }
      // 3. Scan keys case-insensitively
      if (!remoteEntry) {
        const targetKeys = [pUpper, opUpper].filter(Boolean);
        const matchKey = Object.keys(liveQualMap).find(k => targetKeys.includes(k.trim().toUpperCase()));
        if (matchKey) {
          remoteEntry = liveQualMap[matchKey];
        }
      }
      // 4. Scan inside entries for operationNumber or projectId
      if (!remoteEntry) {
        const found = Object.values(liveQualMap).find((entry: any) => {
          if (!entry || typeof entry !== 'object') return false;
          const entryOp = String(entry.operationNumber || '').trim().toUpperCase();
          const entryProj = String(entry.projectId || entry.projectNumber || '').trim().toUpperCase();
          return (opUpper && entryOp.includes(opUpper)) || (pUpper && (entryOp.includes(pUpper) || entryProj.includes(pUpper)));
        });
        if (found) {
          remoteEntry = found;
        }
      }

      const remoteData = (remoteEntry && typeof remoteEntry === 'object' && 'formData' in remoteEntry && remoteEntry.formData) 
        ? remoteEntry.formData 
        : remoteEntry;

      const projectState = projects.find(p => 
        (p.id && p.id.toUpperCase() === pUpper) || 
        (p.operationNumber && p.operationNumber.toUpperCase() === opUpper)
      );
      const qualState = (projectState as any)?.qualitativeData;
      const metaFallback = QUALITATIVE_METADATA_MAP[projectId] || (pUpper ? QUALITATIVE_METADATA_MAP[pUpper] : undefined);

      const resolveValue = (remoteVal: any, stateVal: any, metaVal: any): string => {
        const rStr = formatQualField(remoteVal);
        if (rStr) return rStr;
        const sStr = formatQualField(stateVal);
        if (sStr) return sStr;
        return formatQualField(metaVal);
      };

      const estado = resolveValue(remoteData?.estadoImplementacion, qualState?.estadoImplementacion, metaFallback?.estadoImplementacion);
      const productos = resolveValue(remoteData?.productosDestacados, qualState?.productosDestacados, metaFallback?.productosDestacados);
      const probabilidad = resolveValue(remoteData?.probabilidadObjetivos, qualState?.probabilidadObjetivos, metaFallback?.probabilidadObjetivos);
      const acciones = resolveValue(remoteData?.accionesSugeridas, qualState?.accionesSugeridas, metaFallback?.accionesSugeridas);

      return { estado, productos, probabilidad, acciones };
    };

    // Rows
    let currentRowN = 1;
    filteredTableData.forEach((project) => {
      const isRisk2027 = RISK_ALERT_PROBLEM_2027_PROJECTS.has(project.projectNumber) ? 'Alert/Problem' : 'Satisfactory';
      const isStage1Project = isPmrMode && pmrCycle === 'March 2026' && (project.status === 'Stage I' || project.status === 'Stage 1');
      const isInactiveProject = Boolean((project as any).isInactive || (isPmrMode && pmrCycle === 'March 2026' && MARCH_2026_INACTIVE_PROJECTS.has(project.projectNumber)));
      const isURL1111 = project.projectNumber === 'UR-L1111';
      const rowTtlPmr = isStage1Project ? 'N/A' : (isInactiveProject ? '' : (project.projectNumber === 'EC-L1230' ? 'Alert' : (project.projectNumber === 'UR-L1164' ? 'Problem' : (isURL1111 ? 'Satisfactory' : formatPMR(project.pmrClassification)))));
      const rowCooPmr = isStage1Project ? 'N/A' : (isInactiveProject ? '' : (isURL1111 ? 'Satisfactory' : formatPMR(project.pmrClassification)));
      const rowDcPmr = isStage1Project ? 'N/A' : (isInactiveProject ? '' : (isURL1111 ? 'Satisfactory' : formatPMR(project.pmrClassification)));
      const rowCrPmr = isStage1Project ? 'N/A' : (isInactiveProject ? '' : (isURL1111 ? 'Satisfactory' : formatPMR(project.pmrClassification)));
      const rowSI = isStage1Project ? 'N/A' : (isInactiveProject ? '' : (isURL1111 ? '2.76' : (syntheticIndicatorsMap[project.projectNumber] || '')));

      if (project.operations && project.operations.length > 1) {
        const projectN = currentRowN++;
        project.operations.forEach((op) => {
          const qual = getQualitativeFields(project.projectNumber, op.number);
          if (isPmrMode && pmrCycle === 'September 2026') {
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
              pmrMarchCycle: formatPMR(project.pmrClassification),
              risk2027: isRisk2027,
              estado: qual.estado,
              productos: qual.productos,
              probabilidad: qual.probabilidad,
              acciones: qual.acciones
            });
          } else {
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
              ttlPmr: rowTtlPmr,
              cooPmr: rowCooPmr,
              dcPmr: rowDcPmr,
              crPmr: rowCrPmr,
              syntheticIndicator: rowSI,
              estado: qual.estado,
              productos: qual.productos,
              probabilidad: qual.probabilidad,
              acciones: qual.acciones
            });
          }
        });
      } else {
        const qual = getQualitativeFields(project.projectNumber, project.operationNumber);
        if (isPmrMode && pmrCycle === 'September 2026') {
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
            pmrMarchCycle: formatPMR(project.pmrClassification),
            risk2027: isRisk2027,
            estado: qual.estado,
            productos: qual.productos,
            probabilidad: qual.probabilidad,
            acciones: qual.acciones
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
            ttlPmr: rowTtlPmr,
            cooPmr: rowCooPmr,
            dcPmr: rowDcPmr,
            crPmr: rowCrPmr,
            syntheticIndicator: rowSI,
            estado: qual.estado,
            productos: qual.productos,
            probabilidad: qual.probabilidad,
            acciones: qual.acciones
          });
        }
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
    const fileName = isPmrMode 
      ? (pmrCycle === 'September 2026' ? 'PMR cycle September 2026.xlsx' : 'PMR cycle March 2026.xlsx') 
      : 'FMM_Portfolio_Tracking.xlsx';
    saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Error generating Excel file:', err);
    } finally {
      setIsDownloadingXLS(false);
    }
  };

  const uniqueProjectIds = Array.from(new Set(instrumentFilteredData.map(p => p.projectNumber))).filter(Boolean).sort();
  const uniqueProjectNames = Array.from(new Set(instrumentFilteredData.map(p => p.title))).filter(Boolean).sort();
  const uniqueOperations = Array.from(new Set(instrumentFilteredData.map(p => p.operationNumber))).filter(Boolean).sort();
  const uniqueCountries = Array.from(new Set(instrumentFilteredData.map(p => p.countryName))).filter(Boolean).sort();
  const uniqueInstruments = Array.from(new Set(instrumentFilteredData.map(p => p.projectNumber === 'PE-L1288' ? 'PBL' : (p.lendingInstrumentId === 'LON-INV' ? 'INV' : p.lendingInstrumentId === 'LON-PBL' ? 'PBL' : p.lendingInstrumentId)))).filter(Boolean).sort();
  const uniqueTTLs = Array.from(new Set(instrumentFilteredData.map(p => p.ttl))).filter(Boolean).sort();
  const uniqueStatuses = Array.from(new Set(instrumentFilteredData.map(p => p.status))).filter(Boolean).sort();
  const uniquePMRs = isPmrMode && pmrCycle === 'March 2026' 
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
                className={`p-0.5 rounded hover:bg-zinc-200 transition-colors ${sortConfig.key === columnKey ? 'text-[#005173]' : 'text-zinc-400'}`}
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
                  className={`p-0.5 rounded hover:bg-zinc-200 transition-colors ${filters[columnKey]?.length > 0 ? 'text-[#005173]' : 'text-zinc-400'}`}
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
      <div className="relative h-6 w-full bg-[#005173] rounded-sm overflow-hidden" />
      
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
    const satCount = pmrData?.satisfactory?.count ?? 0;
    const satPct = pmrData?.satisfactory?.percent ?? 0;
    const alertCount = pmrData?.alert?.count ?? 0;
    const alertPct = pmrData?.alert?.percent ?? 0;
    const probCount = pmrData?.problem?.count ?? 0;
    const probPct = pmrData?.problem?.percent ?? 0;
    const naCount = pmrData?.na?.count ?? 0;
    const naPct = pmrData?.na?.percent ?? 0;

    const rightSat = 0;
    const rightAlert = satPct;
    const rightProb = rightAlert + alertPct;
    const rightNA = rightProb + probPct;

    const showNA = naCount > 0;

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
              <span className="text-white text-[10px] font-bold">{totalProjects || 38}</span>
            </div>
          </div>

          {noData || !pmrData ? (
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
                  <div className="absolute h-full bg-[#529E55] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightSat}%`, width: `${Math.max(4, satPct)}%` }}>
                    <span className="text-white text-[10px] font-bold">{satCount}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightSat}%`, width: `${Math.max(4, satPct)}%` }}>
                    ({Math.round(satPct)}%)
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
                  <div className="absolute h-full bg-[#F5C243] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightAlert}%`, width: `${Math.max(4, alertPct)}%` }}>
                    <span className="text-white text-[10px] font-bold">{alertCount}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightAlert}%`, width: `${Math.max(4, alertPct)}%` }}>({Math.round(alertPct)}%)</div>
                </div>
              </div>

              {/* Problem */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-20 leading-none">
                  <div className="text-[10px] font-medium text-zinc-900 uppercase tracking-wider">Problem</div>
                  <div className="text-[8px] text-zinc-400"># Projects (%)</div>
                </div>
                <div className="flex-1 relative h-4">
                  <div className="absolute h-full bg-[#DE5347] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightProb}%`, width: `${Math.max(4, probPct)}%` }}>
                    <span className="text-white text-[10px] font-bold">{probCount}</span>
                  </div>
                  <div className="absolute -bottom-3 text-center text-[9px] text-black font-medium" style={{ right: `${rightProb}%`, width: `${Math.max(4, probPct)}%` }}>({Math.round(probPct)}%)</div>
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
                    <div className="absolute h-full bg-[#9CA3AF] rounded-sm flex items-center justify-center px-1" style={{ right: `${rightNA}%`, width: `${Math.max(4, naPct)}%` }}>
                      <span className="text-white text-[10px] font-bold">{naCount}</span>
                    </div>
                    <div className="absolute -bottom-3 flex justify-center" style={{ right: `${rightNA}%`, width: `${Math.max(4, naPct)}%` }}>
                      <span className="text-[9px] text-black font-medium whitespace-nowrap">({Math.round(naPct)}%)</span>
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

  if (loading && tableData.length === 0 && activeOperationsTableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#005173]" />
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
              "PMR Cycles"
            ) : initialInstrument === 'INV' ? (
              <span className="text-black">Active Portfolio</span>
            ) : initialInstrument === 'PBL' ? (
              <>Portfolio Tracking: <br className="sm:hidden" /> <span className="text-[#005173]">PBL operations</span></>
            ) : (
              'FMM Portfolio Tracking'
            )}
          </h2>

          {isPmrMode && (
            <div className="mt-3">
              <div className="relative inline-block">
                <select
                  value={pmrCycle}
                  onChange={(e) => setPmrCycle(e.target.value as 'March 2026' | 'September 2026')}
                  className="appearance-none bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-900 font-semibold text-sm rounded-lg pl-3.5 pr-9 py-2 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005173]/20 focus:border-[#005173] transition-colors"
                >
                  <option value="March 2026">March 2026</option>
                  <option value="September 2026">September 2026</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {isPmrMode && pmrCycle === 'September 2026' ? (
            <ul className="text-zinc-500 text-[13px] md:text-[14.5px] mt-2 list-disc pl-5 space-y-0.5 leading-relaxed">
              <li className="whitespace-nowrap">The cycle evaluated 46 FMM projects, 2 of which were PBLs.</li>
              <li className="whitespace-nowrap">Of the 44 INV loans, 7 were in Stage 1 at the time of the application of the cycle.</li>
              <li className="whitespace-nowrap">Of the remaining 37, 41% (15 projects) are located in Brazil and 3 projects are in Stage 3.</li>
            </ul>
          ) : isPmrMode && pmrCycle === 'March 2026' ? (
            <ul className="text-zinc-500 text-[13px] md:text-[14.5px] mt-2 list-disc pl-5 space-y-0.5 leading-relaxed">
              <li className="whitespace-nowrap">This cycle evaluated 47 projects, 2 of which were PBLs.</li>
              <li className="whitespace-nowrap">Of the 45 INV projects, 7 were in Stage I at the time of the application of the cycle.</li>
              <li className="whitespace-nowrap">The results of the remaining 38 INV projects in Stage II and III, are summarized below.</li>
            </ul>
          ) : (
            <p className="text-zinc-500 text-base md:text-lg mt-2">
              {initialInstrument === 'PBL'
                ? `The current FMM portfolio in execution comprises ${displayMetrics?.totalProjects} PBL ${displayMetrics?.totalProjects === 1 ? 'operation' : 'operations'}.`
                : `The current FMM portfolio in execution comprises ${gasMetrics.hero_total_projects} active operations, ${gasMetrics.s1_count} of which are in Stage I, ${gasMetrics.s2_count} in Stage II, and ${gasMetrics.s3_count} in Stage III.`}
            </p>
          )}
        </div>
      </motion.div>

      {/* KPI Cards */}
      {initialInstrument !== 'PBL' && (!isPmrMode || pmrCycle === 'March 2026') && (
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
                  totalProjects={displayMetrics?.pmrInvOnly?.total || 38} 
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
                  totalValue={`$${Math.round(card1TotalApproved).toLocaleString('en-US')}M`}
                  currentLabel="Disbursed Life Amount"
                  currentValue={`$${Math.round(gasMetrics.disbursed_fmm_disbursed_amt ?? card1TotalDisbursed).toLocaleString('en-US')}M`}
                  percentage={gasMetrics.disbursed_fmm_disbursed_pct !== undefined ? gasMetrics.disbursed_fmm_disbursed_pct : card1DisbursedPercent}
                />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <h3 className="text-sm font-bold text-zinc-900 mb-6">Disbursement 2026</h3>
                <ProgressBar 
                  totalLabel="Baseline projection" 
                  totalValue={`$${Math.round(gasMetrics.disbursement_2026_baseline ?? card2Metrics.baselineM).toLocaleString('en-US')}M`}
                  currentLabel="Disbursed amount"
                  currentValue={`$${Math.round(gasMetrics.disbursement_2026_actual ?? card2Metrics.disbursedM).toLocaleString('en-US')}M`}
                  percentage={
                    (gasMetrics.disbursement_2026_baseline && gasMetrics.disbursement_2026_actual !== undefined)
                      ? (gasMetrics.disbursement_2026_actual / gasMetrics.disbursement_2026_baseline) * 100
                      : card2Metrics.percent
                  }
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
                      style={{ width: `${(card3Stages.s1 / card3Stages.maxStage) * 100}%` }}
                    >
                      {card3Stages.s1 > 0 && <span className="text-white text-[10px] font-bold">{card3Stages.s1}</span>}
                    </div>
                  </div>
                  {/* Stage II */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2 lg:mt-3">
                    <span>Stage II</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ width: `${(card3Stages.s2 / card3Stages.maxStage) * 100}%` }}
                    >
                      {card3Stages.s2 > 0 && <span className="text-white text-[10px] font-bold">{card3Stages.s2}</span>}
                    </div>
                  </div>
                  {/* Stage III */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2 lg:mt-3">
                    <span>Stage III</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ width: `${(card3Stages.s3 / card3Stages.maxStage) * 100}%` }}
                    >
                      {card3Stages.s3 > 0 && <span className="text-white text-[10px] font-bold">{card3Stages.s3}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:border-zinc-300 transition-all">
                <h3 className="text-sm font-bold text-zinc-900 mb-2 lg:mb-6">Lending Instruments</h3>
                <div className="space-y-1">
                  {/* INV */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    <span>{card4Instruments.invCount} INV</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, Math.max(25, (card4Instruments.invAmount / card4Instruments.totalAmount) * 100))}%` 
                      }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        ${Math.round(card4Instruments.invAmount).toLocaleString('en-US')}M
                      </span>
                    </div>
                  </div>

                  {/* PBL */}
                  <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2 lg:mt-3">
                    <span>{card4Instruments.pblCount} PBL</span>
                  </div>
                  <div className="relative h-6 w-full bg-zinc-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#005173] flex items-center justify-center px-2 transition-all duration-500 min-w-[55px]" 
                      style={{ 
                        width: `${Math.min(100, Math.max(18, (card4Instruments.pblAmount / card4Instruments.totalAmount) * 100))}%` 
                      }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        ${Math.round(card4Instruments.pblAmount).toLocaleString('en-US')}M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {isPmrMode && pmrCycle === 'March 2026' && (
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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 px-4">
        {/* Project Search Bar matching PMR qualitative prefilling */}
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <label className="text-[#002148] font-bold text-[13px] tracking-tight">PROJECT</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search project name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#005173] font-normal placeholder:text-zinc-400 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-4">
          <span className="text-[10px] sm:text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
            {(() => {
              const raw = gasData.data_as_of_long || (gasData.metrics[0] as any)?.data_as_of_long || (metrics as any)?.data_as_of_long || gasData.data_as_of || 'October 23, 2026';
              const trimmed = String(raw).trim();
              return trimmed.toLowerCase().startsWith('data as of') ? trimmed.toUpperCase() : `DATA AS OF: ${trimmed.toUpperCase()}`;
            })()}
          </span>
          <button 
            onClick={handleDownloadXLS}
            disabled={isDownloadingXLS}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-[#005173] text-white px-4 py-3 sm:py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-[#003d57] transition-colors shadow-sm ${isDownloadingXLS ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isDownloadingXLS ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>EXPORTING...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>DOWNLOAD XLS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left border-collapse border-spacing-0" style={{ boxSizing: 'border-box', width: '100%' }}>
            <thead className="bg-zinc-100 border-b-2 border-zinc-200 text-[8.5px] font-bold text-zinc-900 uppercase tracking-wider">
              {isPmrMode && pmrCycle === 'March 2026' ? (
                <>
                  <tr>
                    {renderColumnHeader('index', 'N', [], false, 'w-8', 2)}
                    {renderColumnHeader('projectId', <span>PROJECT<br/>ID</span>, uniqueProjectIds, true, 'min-w-[105px] max-w-[115px]', 2)}
                    {renderColumnHeader('operation', <span>OPERATION<br/>ID</span>, uniqueOperations, true, 'min-w-[110px] max-w-[120px]', 2)}
                    {renderColumnHeader('project', <span>PROJECT<br/>NAME</span>, uniqueProjectNames, true, 'min-w-[80px] max-w-[90px]', 2)}
                    {renderColumnHeader('country', 'Country', uniqueCountries, true, undefined, 2)}
                    {renderColumnHeader('instrument', <span>LENDING<br/>TYPE</span>, uniqueInstruments, true, 'min-w-[100px] max-w-[110px]', 2)}
                    {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[70px] max-w-[85px]', 2)}
                    {renderColumnHeader('status', <span>STAGE DURING<br/>CYCLE</span>, uniqueStatuses, true, 'min-w-[95px]', 2)}
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
              ) : isPmrMode && pmrCycle === 'September 2026' ? (
                <tr>
                  {renderColumnHeader('index', 'N', [], false, 'w-8')}
                  {renderColumnHeader('projectId', <span>PROJECT<br/>ID</span>, uniqueProjectIds, true, 'min-w-[105px] max-w-[115px]')}
                  {renderColumnHeader('operation', <span>OPERATION<br/>ID</span>, uniqueOperations, true, 'min-w-[110px] max-w-[120px]')}
                  {renderColumnHeader('project', <span>PROJECT<br/>NAME</span>, uniqueProjectNames, true, 'min-w-[80px] max-w-[90px]')}
                  {renderColumnHeader('country', 'Country', uniqueCountries, true, 'min-w-[70px] max-w-[80px]')}
                  {renderColumnHeader('instrument', <span>LENDING<br/>TYPE</span>, uniqueInstruments, true, 'min-w-[100px] max-w-[110px]')}
                  {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[70px] max-w-[85px]')}
                  {renderColumnHeader('status', <span>STAGE DURING<br/>CYCLE</span>, uniqueStatuses, true, 'min-w-[95px]')}
                  {renderColumnHeader('investment', <span>CURRENT APPROVED<br/>AMOUNT ($M)</span>, [], true, 'min-w-[90px]')}
                  {renderColumnHeader('disbursed', <span>DISBURSED<br/>LIFE AMOUNT<br/>($M)</span>, [], true, 'min-w-[85px]')}
                  {renderColumnHeader('disbursedPercent', <span>DISBURSED<br/>LIFE AMOUNT<br/>(%)</span>, [], true, 'min-w-[85px]')}
                  {renderColumnHeader('pmr2026', <span>PMR<br/>MARCH<br/>CYCLE<br/>(2026)</span>, uniquePMRs, true, 'min-w-[95px]')}
                  {renderColumnHeader('risk2027', <span>PROJECTION<br/>PMR<br/>MARCH<br/>CYCLE<br/>(2027)</span>, ['Satisfactory', 'Alert/Problem'], true, 'min-w-[135px]')}
                </tr>
              ) : (
                <tr>
                  {renderColumnHeader('index', 'N', [], false, 'w-6')}
                  {renderColumnHeader('projectId', <span>PROJECT<br/>ID</span>, uniqueProjectIds, true, 'min-w-[105px] max-w-[115px]')}
                  {renderColumnHeader('operation', <span>OPERATION<br/>ID</span>, uniqueOperations, true, 'min-w-[110px] max-w-[120px]')}
                  {renderColumnHeader('project', <span>PROJECT<br/>NAME</span>, uniqueProjectNames, true, 'min-w-[80px] max-w-[90px]')}
                  {renderColumnHeader('country', 'Country', uniqueCountries, true, 'min-w-[70px] max-w-[80px]')}
                  {renderColumnHeader('instrument', <span>LENDING<br/>TYPE</span>, uniqueInstruments, true, 'min-w-[100px] max-w-[110px]')}
                  {renderColumnHeader('ttl', 'TTL', uniqueTTLs, true, 'min-w-[60px] max-w-[75px]')}
                  {renderColumnHeader('status', 'Stage', uniqueStatuses, true, 'min-w-[50px]')}
                  {renderColumnHeader('investment', <span>Current Approved<br/>Amount<br/>($M)</span>, [], true, 'min-w-[80px]')}
                  {renderColumnHeader('disbursed', <span>Disbursed<br/>Life Amount<br/>($M)</span>, [], true, 'min-w-[75px]')}
                  {renderColumnHeader('disbursedPercent', <span>Disbursed<br/>Life Amount<br/>(%)</span>, [], true, 'min-w-[75px]')}
                  {renderColumnHeader('pmr2026', <span>PMR March<br/>Cycle (2026)</span>, uniquePMRs, true, 'min-w-[85px]')}
                  {renderColumnHeader('alerts', <span>Active<br/>Alerts</span>, ['Alerta 1', 'Alerta 2', 'Alerta 3', 'Alerta 4', 'Alerta 5', 'Alerta 6', 'Alerta 7', 'Alerta 8', 'No alerts'], true, 'min-w-[110px]')}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {filteredTableData.map((project, index) => {
                const isInactiveProject = Boolean((project as any).isInactive || (isPmrMode && pmrCycle === 'March 2026' && MARCH_2026_INACTIVE_PROJECTS.has(project.projectNumber)));
                const isStage1 = isPmrMode && pmrCycle === 'March 2026' && (project.status === 'Stage I' || project.status === 'Stage 1');
                const pmr = String(project.pmrClassification || '').toUpperCase().trim();
                
                // TTL column specific overrides
                let ttlPmr = pmr;
                if (project.projectNumber === 'EC-L1230') ttlPmr = 'ALERT';
                if (project.projectNumber === 'UR-L1164') ttlPmr = 'PROBLEM';
                if (project.projectNumber === 'UR-L1111') ttlPmr = 'SATISFACTORY';
                
                const dotColor = ttlPmr === 'SATISFACTORY' ? 'bg-[#4CAF50]' : 
                                 ttlPmr === 'ALERT' ? 'bg-[#FFC107]' : 
                                 ttlPmr === 'PROBLEM' ? 'bg-[#F44336]' : 'bg-zinc-400';
                const displayPmr = formatPMR(ttlPmr);

                // COO/DC Columns follow the Source of Truth from the hook (with UR-L1111 Satisfactory)
                const cooPmr = project.projectNumber === 'UR-L1111' ? 'SATISFACTORY' : pmr;
                const displayCooPmr = formatPMR(cooPmr);
                const cooDotColor = cooPmr === 'SATISFACTORY' ? 'bg-[#4CAF50]' : 
                                   cooPmr === 'ALERT' ? 'bg-[#FFC107]' : 
                                   cooPmr === 'PROBLEM' ? 'bg-[#F44336]' : 'bg-zinc-400';
                
                const isURL1164 = project.projectNumber === 'UR-L1164';
                const rowBgClass = (isPmrMode && pmrCycle === 'March 2026') ? (
                  isURL1164 
                    ? "bg-yellow-50/60 hover:bg-yellow-100/70" 
                    : "hover:bg-zinc-50"
                ) : "hover:bg-zinc-50";

                return (
                <tr 
                  key={`${project.projectNumber}-${index}`} 
                  className={`${rowBgClass} transition-colors cursor-pointer group`}
                  onClick={() => onSelectProject && onSelectProject(project.projectNumber)}
                >
                  <td className="px-1.5 py-2.5 text-center text-zinc-400 font-medium text-[10px]">
                    {index + 1}
                  </td>
                  <td className="px-1.5 py-2.5 text-left text-zinc-500 text-[10px] font-medium whitespace-nowrap">
                    {project.projectNumber}
                  </td>
                  <td className="px-1.5 py-2.5 text-left text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                    {project.operationNumber}
                  </td>
                  <td className="px-1.5 py-2.5">
                    <div className="text-black font-semibold text-[11px] leading-tight whitespace-normal break-words">{project.title}</div>
                  </td>
                  <td className="px-1.5 py-2.5 text-left">
                    {project.countryName ? (
                      <div className="flex items-center justify-start gap-1.5">
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
                    ) : null}
                  </td>
                  <td className="px-1.5 py-2.5 text-left pl-3 text-zinc-500 text-[10px] font-medium whitespace-nowrap">
                    {project.projectNumber === 'PE-L1288' ? 'PBL' : (project.lendingInstrumentId === 'LON-INV' ? 'INV' : project.lendingInstrumentId === 'LON-PBL' ? 'PBL' : project.lendingInstrumentId)}
                  </td>
                  <td className="px-1.5 py-2.5 max-w-[75px] w-[75px] whitespace-normal break-words text-left text-zinc-500 text-[10px] font-medium font-sans">
                    {project.ttl.includes(',') ? (
                      <div className="flex flex-col items-start justify-start text-left">
                        <span>{project.ttl.split(',')[0]},</span>
                        <span>{project.ttl.split(',').slice(1).join(',').trim()}</span>
                      </div>
                    ) : (
                      project.ttl
                    )}
                  </td>
                  <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-nowrap">{project.status}</td>
                  {isPmrMode && pmrCycle === 'March 2026' ? (
                    <>
                      <td className="px-1.5 py-2.5">
                        {isStage1 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : !isInactiveProject && displayPmr && displayPmr !== 'N/A' ? (
                          <div className="flex items-center justify-start gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                            <span className="text-zinc-500 text-[10px] font-medium">{displayPmr}</span>
                          </div>
                        ) : null}
                      </td>
                      <td className="px-1.5 py-2.5">
                        {isStage1 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : !isInactiveProject && displayCooPmr && displayCooPmr !== 'N/A' ? (
                          <div className="flex items-center justify-start gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                            <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                          </div>
                        ) : null}
                      </td>
                      <td className="px-1.5 py-2.5">
                        {isStage1 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : !isInactiveProject && displayCooPmr && displayCooPmr !== 'N/A' ? (
                          <div className="flex items-center justify-start gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                            <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                          </div>
                        ) : null}
                      </td>
                      <td className="px-1.5 py-2.5">
                        {isStage1 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : !isInactiveProject && displayCooPmr && displayCooPmr !== 'N/A' ? (
                          <div className="flex items-center justify-start gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                            <span className="text-zinc-500 text-[10px] font-medium">{displayCooPmr}</span>
                          </div>
                        ) : null}
                      </td>
                      <td className="px-1.5 py-2.5 text-left pl-3 text-zinc-500 font-medium text-[10px]">
                        {isStage1 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : isInactiveProject ? (
                          ''
                        ) : (
                          syntheticIndicatorsMap[project.projectNumber] || ''
                        )}
                      </td>
                    </>
                  ) : isPmrMode && pmrCycle === 'September 2026' ? (
                    <>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.title === 'N/A' && project.currentApprovedAmount === 0
                          ? 'N/A'
                          : project.operations && project.operations.length > 0
                            ? project.operations.map(o => `$${Math.round(o.approved).toLocaleString('en-US')}M`).join('\n')
                            : `$${Math.round(project.currentApprovedAmount).toLocaleString('en-US')}M`}
                      </td>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.title === 'N/A' && project.currentApprovedAmount === 0
                          ? 'N/A'
                          : project.operations && project.operations.length > 0
                            ? project.operations.map(o => `$${Math.round(o.disbursed).toLocaleString('en-US')}M`).join('\n')
                            : `$${Math.round(project.disbursedLifeAmount).toLocaleString('en-US')}M`}
                      </td>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.title === 'N/A' && project.currentApprovedAmount === 0
                          ? 'N/A'
                          : project.operations && project.operations.length > 0
                            ? project.operations.map(o => {
                                const value = project.projectNumber === 'BR-L1377' ? o.percent.toFixed(1) : (project.projectNumber === 'UR-L1111' ? o.percent.toFixed(2) : Math.round(o.percent));
                                return `${value}%`;
                              }).join('\n')
                            : `${Math.round(project.disbursedLifePercent)}%`}
                      </td>
                      <td className="px-1.5 py-2.5">
                        <div className="flex items-center justify-start gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${cooDotColor}`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">
                            {displayCooPmr || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5">
                        {RISK_ALERT_PROBLEM_2027_PROJECTS.has(project.projectNumber) ? (
                          <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFC107] shrink-0"></div>
                            <span className="text-zinc-500 text-[10px] font-medium">
                              Alert/Problem
                            </span>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F44336] shrink-0"></div>
                          </div>
                        ) : project.title === 'N/A' && project.currentApprovedAmount === 0 ? (
                          <span className="text-zinc-500 text-[10px] font-medium">N/A</span>
                        ) : (
                          <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] shrink-0"></div>
                            <span className="text-zinc-500 text-[10px] font-medium">
                              Satisfactory
                            </span>
                          </div>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations && project.operations.length > 1
                          ? project.operations.map(o => `$${Math.round(o.approved).toLocaleString('en-US')}M`).join('\n')
                          : `$${Math.round(project.currentApprovedAmount).toLocaleString('en-US')}M`}
                      </td>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations && project.operations.length > 1
                          ? project.operations.map(o => `$${Math.round(o.disbursed).toLocaleString('en-US')}M`).join('\n')
                          : `$${Math.round(project.disbursedLifeAmount).toLocaleString('en-US')}M`}
                      </td>
                      <td className="px-1.5 py-2.5 text-center text-zinc-500 text-[10px] font-medium whitespace-pre-line">
                        {project.operations && project.operations.length > 1
                          ? project.operations.map(o => {
                              const value = project.projectNumber === 'BR-L1377' ? o.percent.toFixed(1) : (project.projectNumber === 'UR-L1111' ? o.percent.toFixed(2) : Math.round(o.percent));
                              return `${value}%`;
                            }).join('\n')
                          : `${Math.round(project.disbursedLifePercent)}%`}
                      </td>
                      <td className="px-1.5 py-2.5">
                        <div className="flex items-center justify-start gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            project.pmrClassification === 'Satisfactory' ? 'bg-[#4CAF50]' :
                            project.pmrClassification === 'Alert' ? 'bg-[#FFC107]' :
                            project.pmrClassification === 'Problem' ? 'bg-[#F44336]' : 'bg-zinc-400'
                          }`}></div>
                          <span className="text-zinc-500 text-[10px] font-medium">
                            {project.pmrClassification || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 align-middle text-left" onClick={(e) => e.stopPropagation()}>
                        <AlertTriangles projectId={project.projectNumber} />
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
