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
    lastDisbursement: { date: string; status: 'completed' | 'pending' };
    extension: { text: string; status: 'completed' | 'pending' };
    closure: { date: string; status: 'completed' | 'pending' };
  };
  lastDisbursementMade?: string;
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
  
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
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
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
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
  return row[col] || '';
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
        
        // Inject 2 new projects
        activeData.push(
          {
            "Project Number": "AR-L1416",
            "Status": "ACTIVE",
            "Operation Number": "6139/OC-AR",
            "Reporting Currency": "USD",
            "Product Code": "LON",
            "Fund Code": "ORC",
            "Department Code": "IFD",
            "Division Code": "IFD/FMM",
            "Modality Code": "ESP",
            "Sector": "RM-FIS",
            "Lending Type Code": "SG",
            "TL PCM": "JGOMEZREINO",
            "Team Leader": "GOMEZ REINO, JUAN LUIS",
            "Region": "CSC",
            "Country Code": "AR",
            "Operation Status Sorting": "2",
            "Operation Status Code": "AF",
            "External Operation": "Valid",
            "Effective Date": "",
            "Ratification Date": "",
            "Signature Date": "",
            "Closed For Operation Date": "",
            "First Eligibility Date": "",
            "Final Amortization Date": "",
            "Current Disbursement Expiration Date": "29/04/46 0:00",
            "Original Disbursement Expiration Date": "",
            "Total Eligibility Date": "",
            "First Disbursement Date": "",
            "Totally Disbursement Date": "",
            "Current Year Disb Projection": "20000000",
            "Next Year Disb Projection": "25000000",
            "Available Amount": "100000000",
            "Current Approved Amount": "100000000",
            "Disbursed Life Amount": "0",
            "Cancelled Amount": "0",
            "Undisbursed Amount": "100000000",
            "Committed Amount": "0",
            "Disbursed YTD": "0",
            "Original Approved Amount": "100000000",
            "Projected Available Amount": "100000000",
            "Title (English)": "Federal Tax Administration Reform Program",
            "Lending Instrument ID": "LON-INV",
            "Relation Number": "AR-L1416",
            "Approval Date": "29/04/26 0:00",
            "Approval Year": "2026",
            "Stage": "APPS",
            "Title (Spanish)": "Programa de Reforma de la Administración Tributaria Federal",
            "PMR Classification": "N/A",
            "PMR Classification (Spanish)": "",
            "Executor Name": "MINISTERIO DE ECONOMIA",
            "Executor Name (Spanish)": "MINISTERIO DE ECONOMIA",
            "Cumulative Extension (Months)": "",
            "Product (English)": "LON - Loan Operation",
            "Product (Spanish)": "LON - Operación de Préstamo",
            "Fund (English)": "ORC - Ordinary Capital",
            "Fund (Spanish)": "ORC - Ordinary Capital",
            "Division (English)": "IFD/FMM - Fiscal Management Division",
            "Division (Spanish)": "IFD/FMM - Not defined",
            "Modality (English)": "ESP - ESP (Specific Investment Operation)",
            "Modality (Spanish)": "ESP - ESP (Operación de inversión específica)",
            "Sector (English)": "RM-FIS - REFORM / MODERNIZATION OF THE STATE-FISCAL POLICY FOR SUSTAINABILITY AND GROWTH",
            "Lending Type (English)": "SG - Sovereign Guaranteed",
            "Lending Type (Spanish)": "SG - SG",
            "Country (English)": "AR - Argentina",
            "Country (Spanish)": "AR - Argentina",
            "Operation Status (English)": "AF - APPROVED BY THE BOARD AND FUNDED BY FINANCE",
            "Operation Status (Spanish)": "AF - APROBADO POR DIRECTORIO Y FINANCIADO POR FINANZAS",
            "Sector (Spanish)": "RM-FIS - REFORMA/MODERNIZACIÓN DEL ESTADO-POLÍTICA FISCAL PARA LA SOSTENIBILIDAD Y EL CRECIMIENTO",
            "Lending Instrument Code": "INV",
            "Lending Instrument (English)": "INV - Investment Loan",
            "Lending Instrument (Spanish)": "INV - Préstamo de Inversión",
            "Department": "IFD - Institutions for Development",
            "UDR Code": "CSC/CAR",
            "UDR Full Name": "CSC/CAR - Country Office Argentina",
            "UDR Full Name (Spanish)": "CSC/CAR - Representación Argentina"
          },
          {
            "Project Number": "BR-L1656",
            "Status": "ACTIVE",
            "Operation Number": "6141/OC-BR",
            "Reporting Currency": "USD",
            "Product Code": "LON",
            "Fund Code": "ORC",
            "Department Code": "IFD",
            "Division Code": "IFD/FMM",
            "Modality Code": "ESP",
            "Sector": "RM-SUB",
            "Lending Type Code": "SG",
            "TL PCM": "ANASTASIYAY",
            "Team Leader": "YARYGINA UDOVENKO, ANASTASIYA",
            "Region": "CSC",
            "Country Code": "BR",
            "Operation Status Sorting": "2",
            "Operation Status Code": "AF",
            "External Operation": "Valid",
            "Effective Date": "",
            "Ratification Date": "",
            "Signature Date": "",
            "Closed For Operation Date": "",
            "First Eligibility Date": "",
            "Final Amortization Date": "",
            "Current Disbursement Expiration Date": "22/05/51 0:00",
            "Original Disbursement Expiration Date": "",
            "Total Eligibility Date": "",
            "First Disbursement Date": "",
            "Totally Disbursement Date": "",
            "Current Year Disb Projection": "0",
            "Next Year Disb Projection": "0",
            "Available Amount": "52875000",
            "Current Approved Amount": "52875000",
            "Disbursed Life Amount": "0",
            "Cancelled Amount": "0",
            "Undisbursed Amount": "52875000",
            "Committed Amount": "0",
            "Disbursed YTD": "0",
            "Original Approved Amount": "52875000",
            "Projected Available Amount": "52875000",
            "Title (English)": "Fiscal Management Modernization Project of the State of Maranhão - PROFISCO III MA",
            "Lending Instrument ID": "LON-INV",
            "Relation Number": "BR-L1656",
            "Approval Date": "22/05/26 0:00",
            "Approval Year": "2026",
            "Stage": "APPLA",
            "Title (Spanish)": "Proyecto de Modernización de la Gestión Fiscal del Estado de Maranhão - PROFISCO III MA",
            "PMR Classification": "N/A",
            "PMR Classification (Spanish)": "",
            "Executor Name": "SECRETARIA DE ESTADO DE HACIENDA DE MARANAO",
            "Executor Name (Spanish)": "SECRETARIA DE ESTADO DE HACIENDA DE MARANAO",
            "Cumulative Extension (Months)": "",
            "Product (English)": "LON - Loan Operation",
            "Product (Spanish)": "LON - Operación de Préstamo",
            "Fund (English)": "ORC - Ordinary Capital",
            "Fund (Spanish)": "ORC - Ordinary Capital",
            "Division (English)": "IFD/FMM - Fiscal Management Division",
            "Division (Spanish)": "IFD/FMM - Not defined",
            "Modality (English)": "ESP - ESP (Specific Investment Operation)",
            "Modality (Spanish)": "ESP - ESP (Operación de inversión específica)",
            "Sector (English)": "RM-SUB - REFORM / MODERNIZATION OF THE STATE-SUBNATIONAL AND LOCAL GOVERNMENTS",
            "Lending Type (English)": "SG - Sovereign Guaranteed",
            "Lending Type (Spanish)": "SG - SG",
            "Country (English)": "BR - Brazil",
            "Country (Spanish)": "BR - Brasil",
            "Operation Status (English)": "AF - APPROVED BY THE BOARD AND FUNDED BY FINANCE",
            "Operation Status (Spanish)": "AF - APROBADO POR DIRECTORIO Y FINANCIADO POR FINANZAS",
            "Sector (Spanish)": "RM-SUB - REFORMA/MODERNIZACIÓN DEL ESTADO-GOBIERNOS SUBNACIONALES Y LOCALES",
            "Lending Instrument Code": "INV",
            "Lending Instrument (English)": "INV - Investment Loan",
            "Lending Instrument (Spanish)": "INV - Préstamo de Inversión",
            "Department": "IFD - Institutions for Development",
            "UDR Code": "CSC/CBR",
            "UDR Full Name": "CSC/CBR - Country Office Brazil",
            "UDR Full Name (Spanish)": "CSC/CBR - Representación Brasil"
          }
        );
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
          const status = String(row['Status'] || '').toUpperCase().trim();
          const div = String(row['Division Code'] || '').toUpperCase().trim();
          const lend = String(row['Lending Instrument ID'] || '').toUpperCase().trim();
          
          return status.includes('ACTIVE') && 
                 div.includes('IFD/FMM') && 
                 (lend.includes('LON-INV') || lend.includes('LON-PBL'));
        });

        const validProjectNumbers = new Set(filteredActive.map(row => row['Project Number']));

        // GLOBAL CONTEXT 2
        const filteredDisb = disbRecords.filter(row => {
          const resp = String(row['Responsible Unit'] || '').toUpperCase().trim();
          const lend = String(row['Lending Instrument'] || '').toUpperCase().trim();
          const proj = row['Project Number'];

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
          const projNum = row['Project Number'];
          const approved = parseAmountM(row['Current Approved Amount']);
          const disbursed = parseAmountM(row['Disbursed Life Amount']);
          let lend = String(row['Lending Instrument ID'] || '').toUpperCase().trim();
          const statusCode = String(row['Operation Status Code'] || '').toUpperCase().trim();
          const statusTextRaw = String(row['Operation Status (Spanish)'] || '');
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

          // Temporary override for BR-L1643
          if (projNum === 'BR-L1643') {
            stage = 'Stage I';
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
                number: row['Operation Number'] || '',
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

            let pmr = String(row['PMR Classification'] || '').toUpperCase().trim();
            if (projNum === 'EC-L1230') pmr = 'SATISFACTORY';
            if (projNum === 'UR-L1164') pmr = 'ALERT';
            
            if (pmr === 'SATISFACTORY') pmrCounts.satisfactory++;
            else if (pmr === 'ALERT') pmrCounts.alert++;
            else if (pmr === 'PROBLEM') pmrCounts.problem++;
            else pmrCounts.na++;

            if (lend.includes('LON-INV') && (stage === 'Stage II' || stage === 'Stage III')) {
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
              number: row['Operation Number'] || '',
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
          disbursedLifeAmount,
          disbursedLifePercent,
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

          let statusText = String(row['Operation Status (Spanish)'] || '');
          const statusUpper = statusText.toUpperCase().trim();
          const statusCode = String(row['Operation Status Code'] || '').toUpperCase().trim();
          
          if (statusCode === 'AF' || statusCode === 'EF' || statusCode === 'EL' || statusCode === 'SI' ||
              statusUpper.includes('AF - APROBADO POR DIRECTORIO') || statusUpper.includes('EF - EFECTIVO') || statusUpper.includes('EL - ELEGIBLE PARA EL DESEMBOLSO')) {
            statusText = 'Stage I';
          } else if (statusCode === 'DI' || statusUpper.includes('DI - DESEMBOLSANDO')) {
            statusText = 'Stage II';
          } else if (statusCode === 'CO' || statusCode === 'FD' || statusCode === 'CF' ||
              statusUpper.includes('CO - CERRADO') || statusUpper.includes('FD - TOTALMENTE DESEMBOLSADO')) {
            statusText = 'Stage III';
          }

          // Temporary override for BR-L1643
          if (projNum === 'BR-L1643') {
            statusText = 'Stage I';
          }

          let pmrClass = String(row['PMR Classification'] || '').trim();
          if (projNum === 'EC-L1230') pmrClass = 'Satisfactory';
          if (projNum === 'UR-L1164') pmrClass = 'Alert';
          if (!pmrClass) pmrClass = 'N/A';

          const eligibilityDateStr = row['Total Eligibility Date'];
          let ageInExecution = 'N/A';
          if (eligibilityDateStr && eligibilityDateStr !== '1/1/1901 00:00') {
            const eligibilityDate = new Date(eligibilityDateStr);
            if (!isNaN(eligibilityDate.getTime())) {
              const diffYears = (new Date().getTime() - eligibilityDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
              ageInExecution = diffYears.toFixed(1);
            }
          }

          const monthsOfExtension = row['Cumulative Extension (Months)'] || '0';

          const operationNumber = row.operations.map((o: any) => o.number).filter(Boolean).join('\n');

          tableRows.push({
            index: index++,
            projectNumber: projNum,
            title: String(row['Title (English)'] || ''),
            operationNumber: operationNumber,
            countryCode: String(row['Country Code'] || ''),
            countryName: getCountryName(String(row['Country Code'] || ''), String(row['Country (English)'] || '')),
            ttl: cleanTTLName(String(row['Team Leader'] || '')),
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
      const monthRecords = projectDisbRecords.filter(r => 
        parseInt(getVal(r, 'Transaction Year')) === currentYear && 
        parseInt(getVal(r, 'Transaction Month')) === m &&
        getVal(r, 'IS Parent Child Operation').trim() === 'Parent Operation'
      );
      
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
      
      monthlyMonitoringData.push({
        month: monthNames[m-1],
        cumulativeProjection: cumulativeProjection / 1000000,
        cumulativeDisbursed: m <= currentMonth ? cumulativeActual / 1000000 : null
      });
    }

    const totalApprovedVal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'Current Approved Amount')), 0);
    const totalDisbursedVal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'Disbursed Life Amount')), 0);
    const totalOriginal = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'Original Approved Amount')), 0);
    const totalCanceled = projectRecords.reduce((sum, r) => sum + parseAmount(getVal(r, 'Cancelled Amount')), 0);

    const totalApproved = projectId === 'EC-L1251' ? 6818191.00 : (projectId === 'PN-L1172' ? 20000000.00 : totalApprovedVal);
    const totalDisbursed = projectId === 'EC-L1251' ? 6803190.98 : (projectId === 'PN-L1172' ? 2024294.22 : totalDisbursedVal);

    const eligibilityDateStr = firstRecord['Total Eligibility Date'];
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

    const linkedLoans = projectRecords.map(r => r['Operation Number']).filter(Boolean);

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
      'BR-L1517': { lastDisbDate: '02/DIC/2025', months: '6.1' },
      'PR-L1150': { lastDisbDate: '03/DIC/2025', months: '6.0' }
    };

    const hasSpecialNoDisb = projectId in specialNoDisbData;

    const lastDisbMadeRaw = hasSpecialNoDisb 
      ? specialNoDisbData[projectId].lastDisbDate 
      : formatDate(firstRecord['Totally Disbursement Date']);
    const lastDisbursementMade = (lastDisbMadeRaw === 'Pending' || !lastDisbMadeRaw) ? 'N/A' : lastDisbMadeRaw;

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

    const timeline = {
      approval: { date: formatDate(firstRecord['Approval Date']), status: firstRecord['Approval Date'] ? 'completed' : 'pending' as any },
      effectiveness: { date: formatDate(firstRecord['Effective Date']), status: firstRecord['Effective Date'] ? 'completed' : 'pending' as any },
      eligibility: { date: formatDate(firstRecord['Total Eligibility Date']), status: firstRecord['Total Eligibility Date'] ? 'completed' : 'pending' as any },
      firstDisbursement: { date: formatDate(firstRecord['First Disbursement Date']), status: firstRecord['First Disbursement Date'] ? 'completed' : 'pending' as any },
      lastDisbursement: {
        date: formatExpDate(expDate),
        status: (projectId === 'EC-L1251' || projectId === 'PN-L1172' || projectId === 'PN-L1161') ? 'pending' as const : ((expDate !== 'N/A') ? 'completed' as const : 'pending' as const)
      },
      extension: { 
        text: (projectId === 'AR-L1416' || projectId === 'BR-L1656') ? '0 months' : (firstRecord['Cumulative Extension (Months)'] ? `${firstRecord['Cumulative Extension (Months)']} months` : 'Pending'),
        status: (firstRecord['Cumulative Extension (Months)'] || projectId === 'AR-L1416' || projectId === 'BR-L1656') ? 'completed' : 'pending' as any
      },
      closure: { 
        date: projectId === 'BR-L1534' 
          ? `${formatDate(firstRecord['Closed For Operation Date'])} (CO, pending COO)` 
          : formatDate(firstRecord['Closed For Operation Date']), 
        status: firstRecord['Closed For Operation Date'] ? 'completed' : 'pending' as any 
      }
    };

    // Correct status if Pending
    Object.keys(timeline).forEach(key => {
      const item = (timeline as any)[key];
      if (item.date === 'Pending') item.status = 'pending';
    });

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
                      (firstRecord['PMR Classification'] || 'N/A');

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
    } else if (projectId === 'CH-L1178') {
      setPmrHistoryYear(2025, 'PROBLEM', 'Second period Jan-Dec 2024');
    } else if (projectId === 'BR-L1592') {
      setPmrHistoryYear(2024, 'ALERT', 'Second period Jan-Dec 2023');
      setPmrHistoryYear(2025, 'SATISFACTORY', 'Second period Jan-Dec 2024');
    } else if (projectId === 'BR-L1614') {
      setPmrHistoryYear(2025, 'SATISFACTORY', 'Second period Jan-Dec 2024');
    }

    if (timeline.eligibility.date !== 'Pending') {
      const auto2026 = projectId === 'EC-L1230' ? 'ALERT' : 
                       projectId === 'UR-L1164' ? 'PROBLEM' : 
                       pmrStatus;
      const val2026 = pmrStatus;

      pmrHistory.push({
        year: 2026,
        autoCalculatedStatus: auto2026,
        validatedStatus: val2026,
        hoverText: 'PMR March Cycle 2026'
      });
    }

    // Sort to ensure chronological order
    pmrHistory.sort((a, b) => a.year - b.year);

    return {
      id: projectId,
      name: firstRecord['Title (English)'] || '',
      country: firstRecord['Country (English)'] || '',
      countryCode: String(firstRecord['Country Code'] || ''),
      countryName: getCountryName(String(firstRecord['Country Code'] || ''), String(firstRecord['Country (English)'] || '')),
      ttl: cleanTTLName(firstRecord['Team Leader'] || ''),
      pmrStatus,
      operationStatus: OPERATION_STATUS_MAP[firstRecord['Operation Status Code']] || firstRecord['Operation Status Code'],
      executingAgency: firstRecord['Executor Name'] || '',
      linkedLoans,
      currentApprovedAmount: totalApproved,
      disbursedLifeAmount: totalDisbursed,
      disbursedLifePercent: totalApproved > 0 ? (totalDisbursed / totalApproved) * 100 : 0,
      ageInExecution,
      monthsOfExtension: String(firstRecord['Cumulative Extension (Months)'] || '0'),
      objective: consolidatedRecord ? consolidatedRecord.objtv_engl : '',
      timeline,
      lastDisbursementMade,
      financial: {
        originalApprovedAmount: totalOriginal,
        canceledAmount: totalCanceled,
        currentApprovedAmount: totalApproved,
        deadlineLastDisbursement: formatDate(getVal(firstRecord, 'Current Disbursement Expiration Date')),
        timeWithoutDisbursements: hasSpecialNoDisb ? specialNoDisbData[projectId].months : undefined,
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
