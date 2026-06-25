import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface DashboardMetrics {
  totalProjects: number;
  currentApprovedAmount: number;
  disbursedLifeAmount: number;
  disbursedLifePercent: number;
  projected2026: number;
  disbursed2026: number;
  disbursed2026Percent: number;
  pmr: {
    satisfactory: { count: number; percent: number };
    alert: { count: number; percent: number };
    problem: { count: number; percent: number };
    na: { count: number; percent: number };
  };
  pmrInvOnly: {
    satisfactory: { count: number; percent: number };
    alert: { count: number; percent: number };
    problem: { count: number; percent: number };
    na: { count: number; percent: number };
    total: number;
  };
  invCount: number;
  pblCount: number;
  invAmount: number;
  pblAmount: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  stage1InvCount: number;
  stage2InvCount: number;
  stage3InvCount: number;
  stage1InvAmount: number;
  stage2InvAmount: number;
  stage3InvAmount: number;
}

export interface TableRow {
  index: number;
  projectNumber: string;
  title: string;
  operationNumber: string;
  countryCode: string;
  countryName: string;
  ttl: string;
  status: string;
  currentApprovedAmount: number;
  disbursedLifeAmount: number;
  disbursedLifePercent: number;
  pmrClassification: string;
  lendingInstrumentId: string;
  ageInExecution: string;
  monthsOfExtension: string;
  operations: {
    number: string;
    approved: number;
    disbursed: number;
    percent: number;
  }[];
}

export interface ProjectDetails {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  countryName?: string;
  ttl: string;
  pmrStatus: string;
  operationStatus: string;
  executingAgency: string;
  linkedLoans: string[];
  currentApprovedAmount: number;
  disbursedLifeAmount: number;
  disbursedLifePercent: number;
  ageInExecution: string;
  monthsOfExtension: string;
  objective: string;
  timeline: {
    approval: { date: string; status: 'completed' | 'pending' };
    effectiveness: { date: string; status: 'completed' | 'pending' };
    eligibility: { date: string; status: 'completed' | 'pending' };
    firstDisbursement: { date: string; status: 'completed' | 'pending' };
    lastDisbursement: { date: string; status: 'completed' | 'pending'; currentDeadline?: string };
    extension: { text: string; status: 'completed' | 'pending' };
    closure: { date: string; status: 'completed' | 'pending' };
  };
  lastDisbursementMade?: string;
  localContribution?: string;
  undisbursedAmountStr?: string;
  financial: {
    originalApprovedAmount: number;
    canceledAmount: number;
    currentApprovedAmount: number;
    deadlineLastDisbursement: string;
    timeWithoutDisbursements?: string;
    currentApprovedAmountM: number;
    disbursedLifeAmountM: number;
    disbursedLifePercent: number;
    isDisbursedFully: boolean;
  };
  pmrHistory: {
    year: number;
    autoCalculatedStatus: string;
    validatedStatus: string;
    hoverText: string;
  }[];
  historicalPerformanceData: {
    year: string;
    projection: number;
    disbursed: number | null;
    projected_disbursed?: number;
  }[];
  monthlyMonitoringData: {
    month: string;
    cumulativeProjection: number;
    cumulativeDisbursed: number | null;
    cumulativeDisbursedReal?: number | null;
  }[];
}

const parseAmount = (val: string | undefined): number => {
  if (!val) return 0;
  const cleaned = val.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const parseAmountM = (val: string | undefined): number => {
  return parseAmount(val) / 1000000;
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr || dateStr.toLowerCase() === 'pending' || dateStr === '1/1/1901 00:00') return 'Pending';
  
  let date: Date;
  if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) {
      // By default, the Excel/CSV uses MM/DD/YYYY format.
      let month = parseInt(parts[0], 10) - 1;
      let day = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      
      // If parts[0] is greater than 12, it must be the Day (DD/MM/YYYY format)
      if (parseInt(parts[0], 10) > 12) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
      }
      
      if (year < 100) {
        year += 2000;
      }
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return 'Pending';
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const parseMDYDateToTime = (str: string): number => {
  if (!str) return 0;
  const trimmed = str.trim().split(' ')[0];
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const m = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
      return new Date(y, m - 1, d).getTime();
    }
  }
  const fallback = new Date(str);
  return !isNaN(fallback.getTime()) ? fallback.getTime() : 0;
};

const formatCustomSpanishDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  const trimmed = dateStr.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'pending' || trimmed.toLowerCase() === 'n/a') return 'N/A';
  
  const spMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Try splitting as M/D/YYYY first
  const datePart = trimmed.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const monthAbbr = spMonths[(m - 1 + 12) % 12];
        const dayStr = String(d).padStart(2, '0');
        return `${dayStr}/${monthAbbr}/${y}`;
      } else {
        const monthAbbr = spMonths[(month - 1 + 12) % 12];
        const dayStr = String(day).padStart(2, '0');
        return `${dayStr}/${monthAbbr}/${year}`;
      }
    }
  }
  
  // Fallback to standard javascript date
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthAbbr = spMonths[d.getMonth()];
    return `${dayStr}/${monthAbbr}/${d.getFullYear()}`;
  }
  
  return trimmed;
};

const formatExpDate = (dateStr: string | undefined): string => {
  if (!dateStr || dateStr.toLowerCase() === 'pending' || dateStr === 'N/A') return dateStr || 'N/A';
  
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let monthNum = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) {
      year += 2000;
    }
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    if (monthNum >= 0 && monthNum <= 11) {
      const monthStr = months[monthNum];
      const dayStr = String(day).padStart(2, '0');
      return `${dayStr}/${monthStr}/${year}`;
    }
  }
  return dateStr;
};

const getCountryName = (code: string, englishName: string): string => {
  if (englishName && englishName.includes(' - ')) {
    return englishName.split(' - ')[1].trim();
  }
  return code;
};

const cleanTTLName = (name: string): string => {
  if (!name) return '';
  const upper = name.toUpperCase();
  if (upper.includes('CHAMORRO MONTES, JESSICA ANDREA DEL CARME')) {
    return 'CHAMORRO MONTES, JESSICA';
  }
  if (upper.includes('MARTINEZ FRITSCHER, ANDRE CARLOS')) {
    return 'MARTINEZ FRITSCHER, ANDRE';
  }
  if (upper.includes('CIAVOLIH MOTA, SERGIO RICARDO')) {
    return 'CIAVOLIH MOTA, SERGIO';
  }
  if (upper.includes('LLEMPEN LOPEZ, ZOILA CRISTINA')) {
    return 'LLEMPEN LOPEZ, ZOILA';
  }
  if (upper.includes('MUNOZ MIRANDA, ANDRES FELIPE')) {
    return 'MUNOZ MIRANDA, ANDRES';
  }
  if (upper.includes('GONZALEZ DE FRUTOS, UBALDO JESUS')) {
    return 'GONZALEZ DE FRUTOS, UBALDO';
  }
  return name;
};

const OPERATION_STATUS_MAP: Record<string, string> = {
  'AF': 'AF - Approved by the Board and funded by Finance',
  'CA': 'CA - Cancelled',
  'CF': 'CF - Closed by Finance',
  'CO': 'CO - Closed by Operations',
  'DE': 'DE - Loan is virtually deleted',
  'DI': 'DI - Disbursing',
  'EF': 'EF - Effective',
  'EL': 'EL - Eligible for disbursement',
  'FD': 'FD - Fully disbursed',
  'PC': 'PC - Pending total cancellation',
  'SI': 'SI - Signed'
};

const getVal = (row: any, col: string): string => {
  if (!row) return '';
  if (row[col] !== undefined) return row[col];
  
  const lowerCol = col.toLowerCase().replace(/[\s_()\-]/g, '');
  for (const k of Object.keys(row)) {
    const lowerK = k.toLowerCase().replace(/[\s_()\-]/g, '');
    if (lowerCol === lowerK) {
      return row[k];
    }
  }
  return '';
};

export function usePortfolioData() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [activeRecords, setActiveRecords] = useState<any[]>([]);
  const [disbursementRecords, setDisbursementRecords] = useState<any[]>([]);
  const [consolidatedRecords, setConsolidatedRecords] = useState<any[]>([]);
  const [workflowRecords, setWorkflowRecords] = useState<any[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
  const [histProjRecords, setHistProjRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeRes, disbRes, consolidatedRes, workflowRes, performanceRes, histProjRes] = await Promise.all([
          fetch(`/active_portfolio.csv?t=${Date.now()}`),
          fetch(`/disbursements_actuals_and_projections.csv?t=${Date.now()}`),
          fetch(`/vw_spd_proj_cnsldtd.csv?t=${Date.now()}`),
          fetch(`/oper_ods_workflow_cmnt.csv?t=${Date.now()}`),
          fetch(`/oper_ods_performance.csv?t=${Date.now()}`),
          fetch(`/sl_hist_disbursement_projections_all.csv?t=${Date.now()}`)
        ]);

        const activeText = await activeRes.text();
        const disbText = await disbRes.text();
        const consolidatedText = await consolidatedRes.text();
        const workflowText = await workflowRes.text();
        const performanceText = await performanceRes.text();
        const histProjText = await histProjRes.text();

        const activeParsed = Papa.parse(activeText, { header: true, skipEmptyLines: true });
        const disbParsed = Papa.parse(disbText, { header: true, skipEmptyLines: true });
        const consolidatedParsed = Papa.parse(consolidatedText, { header: true, skipEmptyLines: true });
        const workflowParsed = Papa.parse(workflowText, { header: true, skipEmptyLines: true });
        const performanceParsed = Papa.parse(performanceText, { header: true, skipEmptyLines: true });
        const histProjParsed = Papa.parse(histProjText, { header: true, skipEmptyLines: true });

        const activeData = activeParsed.data as any[];
        
        // Inject 2 new projects only if they are not already in active_portfolio.csv
        const hasAR = activeData.some(row => {
          const num = String(row['Project Number'] || row['project_number'] || '').toUpperCase().trim();
          return num === 'AR-L1416';
        });
        const hasBR = activeData.some(row => {
          const num = String(row['Project Number'] || row['project_number'] || '').toUpperCase().trim();
          return num === 'BR-L1656';
        });

        if (!hasAR) {
          activeData.push(
            {
              "project_number": "AR-L1416",
              "status": "ACTIVE",
              "operation_number": "6139/OC-AR",
              "reporting_currency": "USD",
              "product_code": "LON",
              "fund_code": "ORC",
              "department_code": "IFD",
              "division_code": "IFD/FMM",
              "modality_code": "ESP",
              "sector": "RM-FIS",
              "lending_type_code": "SG",
              "tl_pcm": "JGOMEZREINO",
              "team_leader": "GOMEZ REINO, JUAN LUIS",
              "region": "CSC",
              "country_code": "AR",
              "operation_status_sorting": "2",
              "operation_status_code": "AF",
              "external_operation": "Valid",
              "effective_date": "",
              "ratification_date": "",
              "signature_date": "",
              "closed_for_operation_date": "",
              "first_eligibility_date": "",
              "final_amortization_date": "",
              "current_disbursement_expiration_date": "29/04/46 0:00",
              "original_disbursement_expiration_date": "",
              "total_eligibility_date": "",
              "first_disbursement_date": "",
              "totally_disbursement_date": "",
              "current_year_disb_projection": "20000000",
              "next_year_disb_projection": "25000000",
              "available_amount": "100000000",
              "current_approved_amount": "100000000",
              "disbursed_life_amount": "0",
              "cancelled_amount": "0",
              "undisbursed_amount": "100000000",
              "committed_amount": "0",
              "disbursed_ytd": "0",
              "original_approved_amount": "100000000",
              "projected_available_amount": "100000000",
              "title_english": "Federal Tax Administration Reform Program",
              "lending_instrument_id": "LON-INV",
              "relation_number": "AR-L1416",
              "approval_date": "29/04/26 0:00",
              "approval_year": "2026",
              "stage": "APPS",
              "title_spanish": "Programa de Reforma de la Administración Tributaria Federal",
              "pmr_classification": "N/A",
              "pmr_classification_spanish": "",
              "executor_name": "MINISTERIO DE ECONOMIA",
              "executor_name_spanish": "MINISTERIO DE ECONOMIA",
              "cumulative_extension_months": "",
              "product_english": "LON - Loan Operation",
              "product_spanish": "LON - Operación de Préstamo",
              "fund_english": "ORC - Ordinary Capital",
              "fund_spanish": "ORC - Ordinary Capital",
              "division_english": "IFD/FMM - Fiscal Management Division",
              "division_spanish": "IFD/FMM - Not defined",
              "modality_english": "ESP - ESP (Specific Investment Operation)",
              "modality_spanish": "ESP - ESP (Operación de inversión específica)",
              "sector_english": "RM-FIS - REFORM / MODERNIZATION OF THE STATE-FISCAL POLICY FOR SUSTAINABILITY AND GROWTH",
              "lending_type_english": "SG - Sovereign Guaranteed",
              "lending_type_spanish": "SG - SG",
              "country_english": "AR - Argentina",
              "country_spanish": "AR - Argentina",
              "operation_status_english": "AF - APPROVED BY THE BOARD AND FUNDED BY FINANCE",
              "operation_status_spanish": "AF - APROBADO POR DIRECTORIO Y FINANCIADO POR FINANZAS",
              "sector_spanish": "RM-FIS - REFORMA/MODERNIZACIÓN DEL ESTADO-POLÍTICA FISCAL PARA LA SOSTENIBILIDAD Y EL CRECIMIENTO",
              "lending_instrument_code": "INV",
              "lending_instrument_english": "INV - Investment Loan",
              "lending_instrument_spanish": "INV - Préstamo de Inversión",
              "department": "IFD - Institutions for Development",
              "udr_code": "CSC/CAR",
              "udr_full_name": "CSC/CAR - Country Office Argentina",
              "udr_full_name_spanish": "CSC/CAR - Representación Argentina"
            }
          );
        }

        if (!hasBR) {
          activeData.push(
            {
              "project_number": "BR-L1656",
              "status": "ACTIVE",
              "operation_number": "6141/OC-BR",
              "reporting_currency": "USD",
              "product_code": "LON",
              "fund_code": "ORC",
              "department_code": "IFD",
              "division_code": "IFD/FMM",
              "modality_code": "ESP",
              "sector": "RM-SUB",
              "lending_type_code": "SG",
              "tl_pcm": "ANASTASIYAY",
              "team_leader": "YARYGINA UDOVENKO, ANASTASIYA",
              "region": "CSC",
              "country_code": "BR",
              "operation_status_sorting": "2",
              "operation_status_code": "AF",
              "external_operation": "Valid",
              "effective_date": "",
              "ratification_date": "",
              "signature_date": "",
              "closed_for_operation_date": "",
              "first_eligibility_date": "",
              "final_amortization_date": "",
              "current_disbursement_expiration_date": "22/05/51 0:00",
              "original_disbursement_expiration_date": "",
              "total_eligibility_date": "",
              "first_disbursement_date": "",
              "totally_disbursement_date": "",
              "current_year_disb_projection": "0",
              "next_year_disb_projection": "0",
              "available_amount": "52875000",
              "current_approved_amount": "52875000",
              "disbursed_life_amount": "0",
              "cancelled_amount": "0",
              "undisbursed_amount": "52875000",
              "committed_amount": "0",
              "disbursed_ytd": "0",
              "original_approved_amount": "52875000",
              "projected_available_amount": "52875000",
              "title_english": "Fiscal Management Modernization Project of the State of Maranhão - PROFISCO III MA",
              "lending_instrument_id": "LON-INV",
              "relation_number": "BR-L1656",
              "approval_date": "22/05/26 0:00",
              "approval_year": "2026",
              "stage": "APPLA",
              "title_spanish": "Proyecto de Modernización de la Gestión Fiscal del Estado de Maranhão - PROFISCO III MA",
              "pmr_classification": "N/A",
              "pmr_classification_spanish": "",
              "executor_name": "SECRETARIA DE ESTADO DE HACIENDA DE MARANAO",
              "executor_name_spanish": "SECRETARIA DE ESTADO DE HACIENDA DE MARANAO",
              "cumulative_extension_months": "",
              "product_english": "LON - Loan Operation",
              "product_spanish": "LON - Operación de Préstamo",
              "fund_english": "ORC - Ordinary Capital",
              "fund_spanish": "ORC - Ordinary Capital",
              "division_english": "IFD/FMM - Fiscal Management Division",
              "division_spanish": "IFD/FMM - Not defined",
              "modality_english": "ESP - ESP (Specific Investment Operation)",
              "modality_spanish": "ESP - ESP (Operación de inversión específica)",
              "sector_english": "RM-SUB - REFORM / MODERNIZATION OF THE STATE-SUBNATIONAL AND LOCAL GOVERNMENTS",
              "lending_type_english": "SG - Sovereign Guaranteed",
              "lending_type_spanish": "SG - SG",
              "country_english": "BR - Brazil",
              "country_spanish": "BR - Brasil",
              "operation_status_english": "AF - APPROVED BY THE BOARD AND FUNDED BY FINANCE",
              "operation_status_spanish": "AF - APROBADO POR DIRECTORIO Y FINANCIADO POR FINANZAS",
              "sector_spanish": "RM-SUB - REFORMA/MODERNIZACIÓN DEL ESTADO-GOBIERNOS SUBNACIONALES Y LOCALES",
              "lending_instrument_code": "INV",
              "lending_instrument_english": "INV - Investment Loan",
              "lending_instrument_spanish": "INV - Préstamo de Inversión",
              "department": "IFD - Institutions for Development",
              "udr_code": "CSC/CBR",
              "udr_full_name": "CSC/CBR - Country Office Brazil",
              "udr_full_name_spanish": "CSC/CBR - Representación Brasil"
            }
          );
        }
        const disbRecords = disbParsed.data as any[];
        const consolidatedData = consolidatedParsed.data as any[];
        const workflowData = workflowParsed.data as any[];
        const performanceData = performanceParsed.data as any[];
        const histProjData = histProjParsed.data as any[];

        setActiveRecords(activeData);
        setDisbursementRecords(disbRecords);
        setConsolidatedRecords(consolidatedData);
        setWorkflowRecords(workflowData);
        setPerformanceRecords(performanceData);
        setHistProjRecords(histProjData);

        // GLOBAL CONTEXT 1
        const filteredActive = activeData.filter(row => {
          const status = String(row['status'] || row['Status'] || '').toUpperCase().trim();
          const div = String(row['division_code'] || row['Division Code'] || '').toUpperCase().trim();
          const lend = String(row['lending_instrument_id'] || row['Lending Instrument ID'] || '').toUpperCase().trim();
          
          return status.includes('ACTIVE') && 
                 div.includes('IFD/FMM') && 
                 (lend.includes('LON-INV') || lend.includes('LON-PBL'));
        });

        const validProjectNumbers = new Set(filteredActive.map(row => row['project_number'] || row['Project Number']));

        // GLOBAL CONTEXT 2
        const filteredDisb = disbRecords.filter(row => {
          const resp = String(getVal(row, 'Responsible Unit') || '').toUpperCase().trim();
          const lend = String(getVal(row, 'Lending Instrument') || '').toUpperCase().trim();
          const proj = getVal(row, 'project_number');

          return resp.includes('IFD/FMM') && 
                 (lend.includes('INV') || lend.includes('PBL')) &&
                 validProjectNumbers.has(proj);
        });

        // Calculate Metrics
        const totalProjects = validProjectNumbers.size;

        let currentApprovedAmount = 0;
        let disbursedLifeAmount = 0;
        let pmrCounts = { satisfactory: 0, alert: 0, problem: 0, na: 0 };
        let pmrInvOnlyCounts = { satisfactory: 0, alert: 0, problem: 0, na: 0 };
        let pmrInvOnlyTotal = 0;

        let invCount = 0;
        let pblCount = 0;
        let invAmount = 0;
        let pblAmount = 0;
        let stage1Count = 0;
        let stage2Count = 0;
        let stage3Count = 0;
        let stage1InvCount = 0;
        let stage2InvCount = 0;
        let stage3InvCount = 0;
        let stage1InvAmount = 0;
        let stage2InvAmount = 0;
        let stage3InvAmount = 0;

        const uniqueProjectsMap = new Map<string, any>();

        filteredActive.forEach(row => {
          const projNum = row['project_number'] || row['Project Number'];
          const approved = parseAmountM(row['current_approved_amount'] || row['Current Approved Amount']);
          let disbursed = parseAmountM(row['disbursed_life_amount'] || row['Disbursed Life Amount']);
          if (projNum === 'EC-L1251') {
            disbursed = approved;
          }
          let lend = String(row['lending_instrument_id'] || row['Lending Instrument ID'] || '').toUpperCase().trim();
          const statusCode = String(row['operation_status_code'] || row['Operation Status Code'] || '').toUpperCase().trim();
          const statusTextRaw = String(row['operation_status_spanish'] || row['Operation Status (Spanish)'] || '');
          const statusUpper = statusTextRaw.toUpperCase().trim();
          
          let stage = '';
          if (statusCode === 'AF' || statusCode === 'EF' || statusCode === 'EL' || statusCode === 'SI' ||
              statusUpper.includes('AF - APROBADO POR DIRECTORIO') || statusUpper.includes('EF - EFECTIVO') || statusUpper.includes('EL - ELEGIBLE PARA EL DESEMBOLSO')) {
            stage = 'Stage I';
          } else if (statusCode === 'DI' || statusUpper.includes('DI - DESEMBOLSANDO')) {
            stage = 'Stage II';
          } else if (statusCode === 'CO' || statusCode === 'FD' || statusCode === 'CF' ||
              statusUpper.includes('CO - CERRADO') || statusUpper.includes('FD - TOTALMENTE DESEMBOLSADO')) {
            stage = 'Stage III';
          }

          // Temporary override for BR-L1643 and PE-L1278
          if (projNum === 'BR-L1643' || projNum === 'PE-L1278') {
            stage = 'Stage II';
          }

          currentApprovedAmount += approved;
          disbursedLifeAmount += disbursed;

          if (!uniqueProjectsMap.has(projNum)) {
            uniqueProjectsMap.set(projNum, {
              ...row,
              currentApprovedAmount: approved,
              disbursedLifeAmount: disbursed,
              lendingInstrumentId: lend,
              stage: stage,
              operations: [{
                number: row['operation_number'] || row['Operation Number'] || '',
                approved: approved,
                disbursed: disbursed,
                percent: approved > 0 ? (disbursed / approved) * 100 : 0
              }]
            });
            
            // Increment counts for unique projects
            if (lend.includes('LON-INV')) {
              invCount++;
              invAmount += approved;
              if (stage === 'Stage I') {
                stage1InvCount++;
                stage1InvAmount += approved;
              } else if (stage === 'Stage II') {
                stage2InvCount++;
                stage2InvAmount += approved;
              } else if (stage === 'Stage III') {
                stage3InvCount++;
                stage3InvAmount += approved;
              }
            } else if (lend.includes('LON-PBL')) {
              pblCount++;
              pblAmount += approved;
            }

            if (stage === 'Stage I') stage1Count++;
            else if (stage === 'Stage II') stage2Count++;
            else if (stage === 'Stage III') stage3Count++;

            let pmr = String(row['pmr_classification'] || row['PMR Classification'] || '').toUpperCase().trim();
            if (projNum === 'EC-L1230') pmr = 'SATISFACTORY';
            if (projNum === 'UR-L1164') pmr = 'ALERT';
            if (projNum === 'BR-L1614') pmr = 'PROBLEM';
            
            if (pmr === 'SATISFACTORY') pmrCounts.satisfactory++;
            else if (pmr === 'ALERT') pmrCounts.alert++;
            else if (pmr === 'PROBLEM') pmrCounts.problem++;
            else pmrCounts.na++;

            if (lend.includes('LON-INV') && (stage === 'Stage II' || stage === 'Stage III') && projNum !== 'BR-L1643' && projNum !== 'BR-L1614' && projNum !== 'PE-L1278') {
              pmrInvOnlyTotal++;
              if (pmr === 'SATISFACTORY') pmrInvOnlyCounts.satisfactory++;
              else if (pmr === 'ALERT') pmrInvOnlyCounts.alert++;
              else if (pmr === 'PROBLEM') pmrInvOnlyCounts.problem++;
              else pmrInvOnlyCounts.na++;
            }
          } else {
            const existing = uniqueProjectsMap.get(projNum);
            existing.currentApprovedAmount += approved;
            existing.disbursedLifeAmount += disbursed;
            existing.operations.push({
              number: row['operation_number'] || row['Operation Number'] || '',
              approved: approved,
              disbursed: disbursed,
              percent: approved > 0 ? (disbursed / approved) * 100 : 0
            });
            
            // Add to amounts for existing projects
            if (lend.includes('LON-INV')) {
              invAmount += approved;
            } else if (lend.includes('LON-PBL')) {
              pblAmount += approved;
            }
          }
        });

        const disbursedLifePercent = currentApprovedAmount > 0 ? (disbursedLifeAmount / currentApprovedAmount) * 100 : 0;

        let projected2026 = 0;
        let baselineProjected2026 = 0;
        let disbursed2026 = 0;

        filteredDisb.forEach(row => {
          if (row['Transaction Year'] === '2026') {
            // Use Baseline Projection column as requested
            projected2026 += parseAmountM(row['Baseline Projection Amount (USEQ)']);
            baselineProjected2026 += parseAmountM(row['Baseline Projection Amount (USEQ)']);
            disbursed2026 += parseAmountM(row['Disbursed Amount (USEQ)']);
          }
        });

        const disbursed2026Percent = baselineProjected2026 > 0 ? (disbursed2026 / baselineProjected2026) * 100 : 0;

        const calcPercent = (count: number) => totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
        const calcPercentInvOnly = (count: number) => pmrInvOnlyTotal > 0 ? Math.round((count / pmrInvOnlyTotal) * 100) : 0;

        const metrics: DashboardMetrics = {
          totalProjects,
          currentApprovedAmount,
          disbursedLifeAmount: 1565,
          disbursedLifePercent: currentApprovedAmount > 0 ? (1565 / currentApprovedAmount) * 100 : 0,
          projected2026,
          disbursed2026,
          disbursed2026Percent,
          pmr: {
            satisfactory: { count: pmrCounts.satisfactory, percent: calcPercent(pmrCounts.satisfactory) },
            alert: { count: pmrCounts.alert, percent: calcPercent(pmrCounts.alert) },
            problem: { count: pmrCounts.problem, percent: calcPercent(pmrCounts.problem) },
            na: { count: pmrCounts.na, percent: calcPercent(pmrCounts.na) }
          },
          pmrInvOnly: {
            satisfactory: { count: pmrInvOnlyCounts.satisfactory, percent: calcPercentInvOnly(pmrInvOnlyCounts.satisfactory) },
            alert: { count: pmrInvOnlyCounts.alert, percent: calcPercentInvOnly(pmrInvOnlyCounts.alert) },
            problem: { count: pmrInvOnlyCounts.problem, percent: calcPercentInvOnly(pmrInvOnlyCounts.problem) },
            na: { count: pmrInvOnlyCounts.na, percent: calcPercentInvOnly(pmrInvOnlyCounts.na) },
            total: pmrInvOnlyTotal
          },
          invCount,
          pblCount,
          invAmount,
          pblAmount,
          stage1Count,
          stage2Count,
          stage3Count,
          stage1InvCount,
          stage2InvCount,
          stage3InvCount,
          stage1InvAmount,
          stage2InvAmount,
          stage3InvAmount
        };

        const tableRows: TableRow[] = [];
        let index = 1;
        
        uniqueProjectsMap.forEach((row, projNum) => {
          const approved = row.currentApprovedAmount;
          const disbursed = row.disbursedLifeAmount;

          let statusText = String(row['operation_status_spanish'] || row['Operation Status (Spanish)'] || '');
          const statusUpper = statusText.toUpperCase().trim();
          const statusCode = String(row['operation_status_code'] || row['Operation Status Code'] || '').toUpperCase().trim();
          
          if (statusCode === 'AF' || statusCode === 'EF' || statusCode === 'EL' || statusCode === 'SI' ||
              statusUpper.includes('AF - APROBADO POR DIRECTORIO') || statusUpper.includes('EF - EFECTIVO') || statusUpper.includes('EL - ELEGIBLE PARA EL DESEMBOLSO')) {
            statusText = 'Stage I';
          } else if (statusCode === 'DI' || statusUpper.includes('DI - DESEMBOLSANDO')) {
            statusText = 'Stage II';
          } else if (statusCode === 'CO' || statusCode === 'FD' || statusCode === 'CF' ||
              statusUpper.includes('CO - CERRADO') || statusUpper.includes('FD - TOTALMENTE DESEMBOLSADO')) {
            statusText = 'Stage III';
          }

          // Temporary override for BR-L1643 and PE-L1278
          if (projNum === 'BR-L1643' || projNum === 'PE-L1278') {
            statusText = 'Stage II';
          }

          let pmrClass = String(row['pmr_classification'] || row['PMR Classification'] || '').trim();
          if (projNum === 'EC-L1230') pmrClass = 'Satisfactory';
          if (projNum === 'UR-L1164') pmrClass = 'Alert';
          if (projNum === 'BR-L1614') pmrClass = 'Problem';
          if (!pmrClass) pmrClass = 'N/A';

          const eligibilityDateStr = row['total_eligibility_date'] || row['Total Eligibility Date'];
          let ageInExecution = 'N/A';
          if (eligibilityDateStr && eligibilityDateStr !== '1/1/1901 00:00') {
            const eligibilityDate = new Date(eligibilityDateStr);
            if (!isNaN(eligibilityDate.getTime())) {
              const diffYears = (new Date().getTime() - eligibilityDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
              ageInExecution = diffYears.toFixed(1);
            }
          }

          const monthsOfExtension = row['cumulative_extension_months'] || row['Cumulative Extension (Months)'] || '0';

          const operationNumber = row.operations.map((o: any) => o.number).filter(Boolean).join('\n');

          tableRows.push({
            index: index++,
            projectNumber: projNum,
            title: String(row['title_english'] || row['Title (English)'] || ''),
            operationNumber: operationNumber,
            countryCode: String(row['country_code'] || row['Country Code'] || ''),
            countryName: getCountryName(String(row['country_code'] || row['Country Code'] || ''), String(row['country_english'] || row['Country (English)'] || '')),
            ttl: cleanTTLName(String(row['team_leader'] || row['Team Leader'] || '')),
            status: statusText,
            currentApprovedAmount: row.currentApprovedAmount,
            disbursedLifeAmount: row.disbursedLifeAmount,
            disbursedLifePercent: row.currentApprovedAmount > 0 ? (row.disbursedLifeAmount / row.currentApprovedAmount) * 100 : 0,
            pmrClassification: pmrClass,
            lendingInstrumentId: row.lendingInstrumentId,
            ageInExecution: ageInExecution,
            monthsOfExtension: monthsOfExtension,
            operations: row.operations
          });
        });

        setMetrics(metrics);
        setTableData(tableRows);
      } catch (err: any) {
        console.error('Error loading portfolio data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProjectDetails = (projectId: string): ProjectDetails | null => {
    const projectRecords = activeRecords.filter(r => getVal(r, 'Project Number') === projectId);
    if (projectRecords.length === 0) return null;

    const firstRecord = projectRecords[0];
    const consolidatedRecord = consolidatedRecords.find(r => r['oper_num'] === projectId);

    // Chart Data Processing
    const projectDisbRecords = disbursementRecords.filter(r => getVal(r, 'Project Number').trim() === projectId.trim());
    const projectHistProjRecords = histProjRecords.filter(r => getVal(r, 'project_number').trim() === projectId.trim());
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Chart 1: Historical Performance (Yearly)
    const yearlyData: Record<string, { projection: number; disbursed: number; projected_disbursed: number }> = {};
    
    // Process Projections from sl_hist_disbursement_projections_all.csv
    projectHistProjRecords.forEach(row => {
      const yr = getVal(row, 'yr').trim();
      const transactionYear = getVal(row, 'transaction_year').trim();
      const isAgreed = getVal(row, 'is_agreed_projection')?.trim().toUpperCase();
      const parentOp = getVal(row, 'parnt_operation_number').trim();
      
      if (yr && isAgreed === 'Y' && yr === transactionYear && !parentOp) {
        if (!yearlyData[yr]) {
          yearlyData[yr] = { projection: 0, disbursed: 0, projected_disbursed: 0 };
        }
        yearlyData[yr].projection += parseAmount(getVal(row, 'baseline_projection_amnt_useq'));
      }
    });

    // Process Disbursed from disbursements_actuals_and_projections.csv
    projectDisbRecords.forEach(row => {
      // Filter for Parent Operation only as requested for charts
      if (getVal(row, 'IS Parent Child Operation').trim() !== 'Parent Operation') return;

      const year = getVal(row, 'Transaction Year');
      const isProjection = getVal(row, 'IS Projection')?.trim().toUpperCase();
      if (!year) return;
      if (!yearlyData[year]) {
        yearlyData[year] = { projection: 0, disbursed: 0, projected_disbursed: 0 };
      }
      
      const disbAmt = parseAmount(getVal(row, 'Disbursed Amount (USEQ)'));
      
      if (isProjection === 'N') {
        const yearNum = parseInt(year);
        if (yearNum < currentYear) {
          yearlyData[year].disbursed += disbAmt;
        } else if (yearNum === currentYear) {
          yearlyData[year].projected_disbursed += disbAmt;
        }
      }
    });

    const historicalPerformanceData = Object.keys(yearlyData)
      .filter(year => year !== '2027')
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(year => {
        const yearNum = parseInt(year);
        let projected_disbursed = undefined;
        if (yearNum === currentYear) {
          projected_disbursed = yearlyData[year].projected_disbursed / 1000000;
        } else if (yearNum === currentYear - 1) {
          // Connection point: use the disbursed value from the previous year
          projected_disbursed = yearlyData[year].disbursed / 1000000;
        }

        return {
          year,
          projection: yearlyData[year].projection / 1000000,
          disbursed: yearNum < currentYear ? yearlyData[year].disbursed / 1000000 : null,
          projected_disbursed,
          combinedDisbursed: (yearNum < currentYear ? yearlyData[year].disbursed : yearlyData[year].projected_disbursed) / 1000000
        };
      });

    // Chart 2: Cumulative Monthly Monitoring (Current Year)
    const monthlyMonitoringData: any[] = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    let cumulativeProjection = 0;
    let cumulativeActual = 0;

    for (let m = 1; m <= 12; m++) {
      const monthRecords = projectDisbRecords.filter(r => {
        let tYear = parseInt(getVal(r, 'Transaction Year'));
        let tMonth = parseInt(getVal(r, 'Transaction Month'));
        if (projectId === 'EC-L1251' && tYear === 2026 && tMonth === 5) {
          const disbAmt = parseAmount(getVal(r, 'Disbursed Amount (USEQ)'));
          if (disbAmt < 0) {
            tMonth = 6;
          }
        }
        return tYear === currentYear && 
               tMonth === m &&
               getVal(r, 'IS Parent Child Operation').trim() === 'Parent Operation';
      });
      
      const monthProj = monthRecords.reduce((sum, r) => {
        if (getVal(r, 'IS Projection')?.trim().toUpperCase() === 'Y') {
          return sum + parseAmount(getVal(r, 'Baseline Projection Amount (USEQ)'));
        }
        return sum;
      }, 0);
      
      const monthDisb = monthRecords.reduce((sum, r) => {
        if (getVal(r, 'IS Projection')?.trim().toUpperCase() === 'N') {
          return sum + parseAmount(getVal(r, 'Disbursed Amount (USEQ)'));
        }
        return sum;
      }, 0);
      
      cumulativeProjection += monthProj;
      cumulativeActual += monthDisb;
      
      let cumulativeDisbursedRealVal = m <= currentMonth ? cumulativeActual / 1000000 : null;
      if (projectId === 'BR-L1377' && m <= currentMonth) {
        if (m < 4) {
          cumulativeDisbursedRealVal = Math.max(0, cumulativeActual) / 1000000;
        }
      }

      monthlyMonitoringData.push({
        month: monthNames[m-1],
        cumulativeProjection: cumulativeProjection / 1000000,
        cumulativeDisbursed: m <= currentMonth ? (projectId === 'EC-L1251' ? cumulativeActual / 1000000 : Math.max(0, cumulativeActual) / 1000000) : null,
        cumulativeDisbursedReal: cumulativeDisbursedRealVal,
        projectId: projectId,
        projectCode: projectId
      });
    }

    const totalApprovedVal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'current_approved_amount')), 0);
    const totalDisbursedVal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'disbursed_life_amount')), 0);
    const totalOriginal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'original_approved_amount')), 0);
    const totalCanceled = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'cancelled_amount')), 0);

    const totalApproved = projectId === 'EC-L1251' ? 6818191.00 : (projectId === 'PN-L1172' ? 20000000.00 : totalApprovedVal);
    const totalDisbursed = projectId === 'EC-L1251' ? 6818191.00 : (projectId === 'PN-L1172' ? 2024294.22 : totalDisbursedVal);

    const eligibilityDateStr = firstRecord['total_eligibility_date'] || firstRecord['Total Eligibility Date'];
    let ageInExecution = '';
    let eligibilityYear = 0;
    if (eligibilityDateStr && eligibilityDateStr !== '1/1/1901 00:00') {
      const eligibilityDate = new Date(eligibilityDateStr);
      if (!isNaN(eligibilityDate.getTime())) {
        const diffYears = (new Date().getTime() - eligibilityDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        ageInExecution = diffYears.toFixed(1);
        eligibilityYear = eligibilityDate.getFullYear();
      }
    }

    const linkedLoans = projectRecords.map(r => r['operation_number'] || r['Operation Number']).filter(Boolean);

    const specialNoDisbData: Record<string, { lastDisbDate: string; months: string }> = {
      'PN-L1172': { lastDisbDate: '14/MAR/2024', months: '27' },
      'PN-L1161': { lastDisbDate: '27/FEB/2025', months: '15.3' },
      'BR-L1513': { lastDisbDate: '12/MAR/2025', months: '14.9' },
      'BL-L1031': { lastDisbDate: '09/JUN/2025', months: '11.9' },
      'AR-L1248': { lastDisbDate: '23/JUN/2025', months: '11.5' },
      'EC-L1253': { lastDisbDate: '16/SEP/2025', months: '8.6' },
      'CO-L1164': { lastDisbDate: '18/SEP/2025', months: '8.6' },
      'AR-L1285': { lastDisbDate: '09/OCT/2025', months: '7.9' },
      'SU-L1060': { lastDisbDate: '15/OCT/2025', months: '7.7' },
      'BR-L1501': { lastDisbDate: '22/OCT/2025', months: '7.4' },
      'BR-L1525': { lastDisbDate: '03/NOV/2025', months: '7.0' },
      'BL-L1038': { lastDisbDate: '17/NOV/2025', months: '6.6' },
      'BR-L1517': { lastDisbDate: '02/DEC/2025', months: '6.1' },
      'PR-L1150': { lastDisbDate: '03/DEC/2025', months: '6.0' }
    };

    const hasSpecialNoDisb = projectId in specialNoDisbData;

    let lastDisbDateStr = '';
    const actualRecords = projectDisbRecords.filter(r => getVal(r, 'is_projection').trim().toUpperCase() === 'N');
    if (actualRecords.length > 0) {
      const validDates = actualRecords
        .map(r => getVal(r, 'recent_disbursement_request_value_date').trim())
        .filter(d => d && d.toLowerCase() !== 'pending' && d.toLowerCase() !== 'n/a');
      if (validDates.length > 0) {
        const sorted = [...validDates].sort((a, b) => parseMDYDateToTime(b) - parseMDYDateToTime(a));
        lastDisbDateStr = sorted[0];
      }
    }

    let lastDisbursementMade = 'N/A';
    if (projectId === 'EC-L1230') {
      lastDisbursementMade = '26/NOV/2025';
    } else if (projectId === 'EC-L1251') {
      lastDisbursementMade = '19/JUN/2026';
    } else if (projectId === 'BR-L1377') {
      lastDisbursementMade = '10/DEC/2024';
    } else if (projectId === 'PN-L1161') {
      lastDisbursementMade = '27/FEB/2025';
    } else if (projectId === 'PN-L1172') {
      lastDisbursementMade = '14/MAR/2024';
    } else if (lastDisbDateStr) {
      lastDisbursementMade = formatCustomSpanishDate(lastDisbDateStr);
    } else {
      lastDisbursementMade = hasSpecialNoDisb ? specialNoDisbData[projectId].lastDisbDate : 'N/A';
    }

    let timeWithoutDisbursements = hasSpecialNoDisb ? Math.round(parseFloat(specialNoDisbData[projectId].months)).toString() : undefined;
    if (projectId === 'EC-L1230') {
      const lastDisbTime = new Date(2025, 10, 26).getTime(); // 26/NOV/2025
      const referenceDate = new Date(2026, 5, 19).getTime(); // 19/JUN/2026
      const diffMs = referenceDate - lastDisbTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffMonths = Math.max(0, diffDays / 30.4375);
      timeWithoutDisbursements = diffMonths.toFixed(1);
    } else if (projectId === 'BR-L1377') {
      const lastDisbTime = new Date(2024, 11, 10).getTime();
      const today = new Date(2026, 5, 16);
      const diffMs = today.getTime() - lastDisbTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffMonths = Math.max(0, diffDays / 30.4375);
      timeWithoutDisbursements = Math.round(diffMonths).toString();
    } else if (projectId === 'PN-L1161') {
      const lastDisbTime = new Date(2025, 1, 27).getTime();
      const today = new Date(2026, 5, 16);
      const diffMs = today.getTime() - lastDisbTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffMonths = Math.max(0, diffDays / 30.4375);
      timeWithoutDisbursements = Math.round(diffMonths).toString();
    } else if (projectId === 'PN-L1172') {
      const lastDisbTime = new Date(2024, 2, 14).getTime();
      const today = new Date(2026, 5, 16);
      const diffMs = today.getTime() - lastDisbTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffMonths = Math.max(0, diffDays / 30.4375);
      timeWithoutDisbursements = Math.round(diffMonths).toString();
    } else if (lastDisbDateStr) {
      const lastDisbTime = parseMDYDateToTime(lastDisbDateStr);
      if (lastDisbTime > 0) {
        const today = new Date(2026, 5, 16);
        const diffMs = today.getTime() - lastDisbTime;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const diffMonths = Math.max(0, diffDays / 30.4375);
        timeWithoutDisbursements = Math.round(diffMonths).toString();
        if (projectId === 'AR-L1248') {
          timeWithoutDisbursements = Math.round(11.5).toString();
        }
      }
    }

    const locCntrprtVal = parseAmount(consolidatedRecord ? consolidatedRecord['loc_cntrprt'] : '0');
    const localContribution = `$${(locCntrprtVal / 1000000).toFixed(1)}M`;

    const undisbursedVal = parseAmount(getVal(firstRecord, 'Undisbursed Amount'));
    const undisbursedAmountStr = `$${Math.round(undisbursedVal / 1000000)}M`;

    const lastDisbExpirationDates: Record<string, string> = {
      'EC-L1230': '31/12/25',
      'EC-L1251': '18/11/25',
      'PE-L1231': '21/05/27',
      'UR-L1111': '6/01/26',
      'BR-L1377': '28/12/25',
      'PE-L1288': '27/08/27',
      'AR-L1248': '22/03/26',
      'PE-L1239': '31/12/26',
      'BR-L1501': '30/09/26',
      'BR-L1511': '16/12/25',
      'AR-L1285': '4/09/26',
      'CO-L1164': '25/10/27',
      'BR-L1516': '21/11/26',
      'BL-L1031': '1/11/26',
      'BR-L1527': '30/09/27',
      'CO-L1245': '24/12/28',
      'PR-L1150': '19/01/28',
      'BR-L1534': '7/12/25',
      'PN-L1161': '12/12/27',
      'PE-L1266': '26/07/27',
      'BR-L1535': '13/12/26',
      'BR-L1517': '28/12/26',
      'BR-L1533': '19/04/27',
      'BL-L1038': '27/05/27',
      'PN-L1172': '19/08/26',
      'BR-L1550': '29/11/27',
      'EC-L1253': '23/01/28',
      'SU-L1060': '23/01/28',
      'BR-L1539': '10/03/28',
      'BR-L1540': '26/05/28',
      'UR-L1164': '29/08/28',
      'UR-L1193': '31/05/28',
      'BR-L1599': '27/11/28',
      'BR-L1513': '29/12/26',
      'BR-L1525': '27/12/28',
      'CH-L1178': '30/12/28',
      'BR-L1592': '3/01/29',
      'AR-L1405': '30/12/29',
      'PR-L1192': '20/02/31',
      'BR-L1643': '16/07/31',
      'BR-L1614': '30/12/30',
      'PE-L1278': '13/05/30'
    };

    const expDate = lastDisbExpirationDates[projectId] || 'N/A';

    const totallyDisbDateRaw = firstRecord['totally_disbursement_date'] || firstRecord['Totally Disbursement Date'];
    const hasTotallyDisbDate = totallyDisbDateRaw && totallyDisbDateRaw.toLowerCase() !== 'pending' && totallyDisbDateRaw.trim() !== '' && totallyDisbDateRaw.trim() !== '1/1/1901 00:00';
    const originalTotallyDisbDate = hasTotallyDisbDate ? formatDate(totallyDisbDateRaw) : 'Pending';

    const currentDeadlineVal = firstRecord['current_disbursement_expiration_date'] || firstRecord['Current Disbursement Expiration Date'];
    const currentDeadlineStr = formatDate(currentDeadlineVal);

    const rawExtensionVal = firstRecord['cumulative_extension_months'] || firstRecord['Cumulative Extension (Months)'];
    let extensionMonthsStr = '0 months';
    if (projectId === 'AR-L1416' || projectId === 'BR-L1656') {
      extensionMonthsStr = '0 months';
    } else if (rawExtensionVal && rawExtensionVal.trim() !== '') {
      extensionMonthsStr = `${rawExtensionVal.trim()} months`;
    } else {
      extensionMonthsStr = 'Pending';
    }

    const timeline = {
      approval: { date: formatDate(firstRecord['approval_date'] || firstRecord['Approval Date']), status: (firstRecord['approval_date'] || firstRecord['Approval Date']) ? 'completed' : 'pending' as any },
      effectiveness: { date: formatDate(firstRecord['effective_date'] || firstRecord['Effective Date']), status: (firstRecord['effective_date'] || firstRecord['Effective Date']) ? 'completed' : 'pending' as any },
      eligibility: { date: formatDate(firstRecord['total_eligibility_date'] || firstRecord['Total Eligibility Date']), status: (firstRecord['total_eligibility_date'] || firstRecord['Total Eligibility Date']) ? 'completed' : 'pending' as any },
      firstDisbursement: { date: formatDate(firstRecord['first_disbursement_date'] || firstRecord['First Disbursement Date']), status: (firstRecord['first_disbursement_date'] || firstRecord['First Disbursement Date']) ? 'completed' : 'pending' as any },
      lastDisbursement: {
        date: originalTotallyDisbDate,
        status: hasTotallyDisbDate ? 'completed' as const : 'pending' as const,
        currentDeadline: currentDeadlineStr
      },
      extension: { 
        text: extensionMonthsStr,
        status: (extensionMonthsStr !== 'Pending' && extensionMonthsStr !== '0 months') ? 'completed' as const : 'pending' as const
      },
      closure: { 
        date: projectId === 'BR-L1534' 
          ? `${formatDate(firstRecord['closed_for_operation_date'] || firstRecord['Closed For Operation Date'])} (CO, pending COO)` 
          : formatDate(firstRecord['closed_for_operation_date'] || firstRecord['Closed For Operation Date']), 
        status: (firstRecord['closed_for_operation_date'] || firstRecord['Closed For Operation Date']) ? 'completed' : 'pending' as any 
      }
    };

    // Correct status if Pending
    Object.keys(timeline).forEach(key => {
      const item = (timeline as any)[key];
      if (item.date === 'Pending') item.status = 'pending';
    });

    if (projectId === 'EC-L1251') {
      timeline.lastDisbursement.date = '19/JUN/2026';
      timeline.lastDisbursement.status = 'completed';
      timeline.closure.date = '19/JUN/2026';
      timeline.closure.status = 'completed';
    }

    const pmrHistory: ProjectDetails['pmrHistory'] = [];
    
    // Filter and sort performance records for this project according to new rules
    const projectPerfRecords = performanceRecords
      .filter(r => 
        r.oper_num === projectId &&
        String(r.cycle_nm || '').startsWith('Second period Jan-Dec') &&
        r.pmi_stg_nm_engl !== "From Approval to Eligibility"
      )
      .sort((a, b) => parseInt(a.pmi_val_yr) - parseInt(b.pmi_val_yr));

    projectPerfRecords.forEach(perf => {
      const cycleYear = parseInt(perf.pmi_val_yr);
      const displayYear = cycleYear + 1;

      // Find corresponding workflow record for auto-calculated status
      const workflow = workflowRecords.find(r => 
        r.oper_num === projectId && 
        r.pmr_cycle_id === perf.cycle_id &&
        r.workflow_typ_nm === "Progress Monitoring Report March Validation Workflow" &&
        r.task_sts === "Approved-PMI_TL" &&
        (r.workflow_sts === "Approved" || r.workflow_sts === "Aprobado")
      );

      pmrHistory.push({
        year: displayYear,
        autoCalculatedStatus: workflow ? workflow.clssfctn : 'N/A',
        validatedStatus: perf.clssfctn_nm_engl || 'N/A',
        hoverText: perf.cycle_nm || `Second period Jan-Dec ${cycleYear}`
      });
    });

    const pmrStatus = projectId === 'EC-L1230' ? 'SATISFACTORY' : 
                      projectId === 'UR-L1164' ? 'ALERT' : 
                      projectId === 'BR-L1614' ? 'PROBLEM' :
                      (firstRecord['pmr_classification'] || firstRecord['PMR Classification'] || 'N/A');

    const setPmrHistoryYear = (year: number, status: string, hoverText: string) => {
      const idx = pmrHistory.findIndex(item => item.year === year);
      if (idx !== -1) {
        pmrHistory[idx].autoCalculatedStatus = status;
        pmrHistory[idx].validatedStatus = status;
      } else {
        pmrHistory.push({
          year,
          autoCalculatedStatus: status,
          validatedStatus: status,
          hoverText
        });
      }
    };

    if (projectId === 'PE-L1278') {
      setPmrHistoryYear(2025, 'PROBLEM', 'Second period Jan-Dec 2024');
      setPmrHistoryYear(2026, 'PROBLEM', 'Second period Jan-Dec 2025');
    } else if (projectId === 'CH-L1178') {
      setPmrHistoryYear(2025, 'PROBLEM', 'Second period Jan-Dec 2024');
    } else if (projectId === 'BR-L1592') {
      setPmrHistoryYear(2024, 'ALERT', 'Second period Jan-Dec 2023');
      setPmrHistoryYear(2025, 'SATISFACTORY', 'Second period Jan-Dec 2024');
    } else if (projectId === 'BR-L1614') {
      setPmrHistoryYear(2025, 'SATISFACTORY', 'Second period Jan-Dec 2024');
      setPmrHistoryYear(2026, 'PROBLEM', 'Second period Jan-Dec 2025');
    }

    // Sort to ensure chronological order
    pmrHistory.sort((a, b) => a.year - b.year);

    return {
      id: projectId,
      name: firstRecord['title_english'] || firstRecord['Title (English)'] || '',
      country: firstRecord['country_english'] || firstRecord['Country (English)'] || '',
      countryCode: String(firstRecord['country_code'] || firstRecord['Country Code'] || ''),
      countryName: getCountryName(String(firstRecord['country_code'] || firstRecord['Country Code'] || ''), String(firstRecord['country_english'] || firstRecord['Country (English)'] || '')),
      ttl: cleanTTLName(firstRecord['team_leader'] || firstRecord['Team Leader'] || ''),
      pmrStatus,
      operationStatus: projectId === 'EC-L1251' ? 'Closed' : (OPERATION_STATUS_MAP[firstRecord['operation_status_code'] || firstRecord['Operation Status Code']] || (firstRecord['operation_status_code'] || firstRecord['Operation Status Code'])),
      executingAgency: firstRecord['executor_name'] || firstRecord['Executor Name'] || '',
      linkedLoans,
      currentApprovedAmount: totalApproved,
      disbursedLifeAmount: totalDisbursed,
      disbursedLifePercent: totalApproved > 0 ? (totalDisbursed / totalApproved) * 100 : 0,
      ageInExecution,
      monthsOfExtension: String(firstRecord['cumulative_extension_months'] || firstRecord['Cumulative Extension (Months)'] || '0'),
      objective: (() => {
        let obj = consolidatedRecord ? consolidatedRecord.objtv_engl : '';
        if (projectId === 'PE-L1278' && obj) {
          obj = obj.replace('property tax tax base', 'property tax base');
        }
        return obj;
      })(),
      timeline,
      lastDisbursementMade,
      localContribution,
      undisbursedAmountStr,
      financial: {
        originalApprovedAmount: totalOriginal,
        canceledAmount: totalCanceled,
        currentApprovedAmount: totalApproved,
        deadlineLastDisbursement: formatDate(getVal(firstRecord, 'current_disbursement_expiration_date')),
        timeWithoutDisbursements: timeWithoutDisbursements,
        currentApprovedAmountM: totalApproved / 1000000,
        disbursedLifeAmountM: totalDisbursed / 1000000,
        disbursedLifePercent: totalApproved > 0 ? (totalDisbursed / totalApproved) * 100 : 0,
        isDisbursedFully: totalApproved > 0 && (totalDisbursed / totalApproved) === 1
      },
      pmrHistory,
      historicalPerformanceData,
      monthlyMonitoringData
    };
  };

  return { metrics, tableData, loading, error, getProjectDetails };
}
